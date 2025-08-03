const crypto = require('crypto');

// 簡易的なログ出力
const logger = {
  info: (msg, data) => console.log(`[INFO] ${msg}`, data || ''),
  error: (msg, err) => console.error(`[ERROR] ${msg}`, err || ''),
  warn: (msg, data) => console.warn(`[WARN] ${msg}`, data || '')
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tenantId } = req.query;
  const signature = req.headers['x-line-signature'];
  
  logger.info(`Webhook received for tenant: ${tenantId}`, {
    hasSignature: !!signature,
    contentType: req.headers['content-type']
  });

  try {
    // メインシステムのURL（環境変数で設定可能）
    const mainSystemBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                            process.env.MAIN_SYSTEM_URL || 
                            'https://line-auto-reply.vercel.app';
    const mainSystemUrl = `${mainSystemBaseUrl}/api/line-webhook/${tenantId}`;

    logger.info(`Forwarding to main system: ${mainSystemUrl}`);

    // メインシステムへ転送
    const response = await fetch(mainSystemUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Line-Signature': signature || '',
      },
      body: JSON.stringify(req.body),
    });

    const responseData = await response.text();
    
    logger.info(`Main system response`, {
      status: response.status,
      ok: response.ok
    });

    // LINEプラットフォームには常に200 OKを返す
    res.status(200).json({
      status: 'ok',
      proxied: true,
      mainSystemResponse: {
        status: response.status,
        ok: response.ok
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