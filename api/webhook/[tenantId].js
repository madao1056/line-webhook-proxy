const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

// Supabaseクライアントの初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

// 簡易的なログ出力
const logger = {
  info: (msg, data) => console.log(`[INFO] ${msg}`, data || ''),
  error: (msg, err) => console.error(`[ERROR] ${msg}`, err || ''),
  warn: (msg, data) => console.warn(`[WARN] ${msg}`, data || '')
};

// エンドポイントへの転送処理
async function forwardToEndpoint(url, body, signature, retryCount = 3) {
  for (let attempt = 0; attempt < retryCount; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Line-Signature': signature || '',
        },
        body: body,
        signal: AbortSignal.timeout(5000), // 5秒タイムアウト
      });

      return {
        url,
        status: 'success',
        statusCode: response.status,
        attempt: attempt + 1,
      };
    } catch (error) {
      logger.warn(`Forward attempt ${attempt + 1} failed for ${url}`, error.message);
      
      if (attempt === retryCount - 1) {
        return {
          url,
          status: 'failure',
          error: error.message,
          attempt: retryCount,
        };
      }
      
      // リトライ前に少し待機
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tenantId } = req.query;
  const signature = req.headers['x-line-signature'];
  const bodyString = JSON.stringify(req.body);
  
  logger.info(`Webhook received for tenant: ${tenantId}`, {
    hasSignature: !!signature,
    contentType: req.headers['content-type']
  });

  try {
    // 転送先リスト
    const forwardTargets = [];
    
    // メインシステムは常に転送対象
    const mainSystemBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                            process.env.MAIN_SYSTEM_URL || 
                            'https://line-auto-reply.vercel.app';
    const mainSystemUrl = `${mainSystemBaseUrl}/api/line-webhook/${tenantId}`;
    forwardTargets.push(mainSystemUrl);

    // Supabaseから追加のエンドポイントを取得
    if (supabase) {
      try {
        const { data: endpoints, error } = await supabase
          .from('proxy_endpoints')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('enabled', true)
          .order('priority', { ascending: false });

        if (error) {
          logger.error('Failed to fetch endpoints from Supabase', error);
        } else if (endpoints && endpoints.length > 0) {
          logger.info(`Found ${endpoints.length} additional endpoints for tenant ${tenantId}`);
          endpoints.forEach(ep => {
            forwardTargets.push(ep.url);
            logger.info(`Added endpoint: ${ep.name} - ${ep.url}`);
          });
        } else {
          logger.info(`No additional endpoints found for tenant ${tenantId}`);
        }
      } catch (error) {
        logger.error('Error accessing Supabase', error);
      }
    } else {
      logger.warn('Supabase not configured, only forwarding to main system');
    }

    logger.info(`Forwarding to ${forwardTargets.length} endpoints`);

    // 全エンドポイントに並列転送
    const forwardPromises = forwardTargets.map(url => 
      forwardToEndpoint(url, bodyString, signature)
    );
    
    const results = await Promise.allSettled(forwardPromises);
    
    const successCount = results.filter(r => 
      r.status === 'fulfilled' && r.value.status === 'success'
    ).length;
    
    const failureCount = results.length - successCount;

    logger.info(`Forwarding completed`, {
      total: results.length,
      success: successCount,
      failure: failureCount,
      details: results.map(r => r.status === 'fulfilled' ? r.value : { status: 'error', error: r.reason })
    });

    // ログをSupabaseに保存（エラーがあっても処理は継続）
    if (supabase && endpoints) {
      try {
        const logPromises = results.map(async (result, index) => {
          if (index === 0 || !endpoints[index - 1]) return; // メインシステムのログはスキップ
          
          const endpoint = endpoints[index - 1];
          const resultValue = result.status === 'fulfilled' ? result.value : { status: 'error', error: result.reason };
          
          await supabase.from('proxy_logs').insert({
            tenant_id: tenantId,
            endpoint_id: endpoint.id,
            status: resultValue.status === 'success' ? 'success' : 'failure',
            status_code: resultValue.statusCode || null,
            error_message: resultValue.error || null,
            request_body: req.body,
            response_time_ms: 100, // 簡易的な値
          });
        });
        
        await Promise.allSettled(logPromises);
      } catch (error) {
        logger.error('Failed to save logs', error);
      }
    }

    // LINEプラットフォームには常に200 OKを返す
    res.status(200).json({
      status: 'ok',
      proxied: true,
      results: {
        total: results.length,
        success: successCount,
        failure: failureCount,
      }
    });
  } catch (error) {
    logger.error('Webhook processing error', error);
    
    // エラーが発生してもLINEには200を返す
    res.status(200).json({
      status: 'ok',
      error: 'Internal processing error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};