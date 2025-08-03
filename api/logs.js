const { supabase } = require('./_utils/supabase');
const { authenticate } = require('./_utils/auth');
const { logger } = require('./_utils/logger');

module.exports = async (req, res) => {
  // 認証チェック
  if (!authenticate(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { tenantId, limit = 100, offset = 0, status } = req.query;

  if (!tenantId) {
    return res.status(400).json({ error: 'tenantId is required' });
  }

  // Supabaseが設定されていない場合はモックデータを返す
  if (!supabase) {
    const mockLogs = [
      {
        id: '1',
        tenant_id: tenantId,
        endpoint_name: 'メインシステム',
        status: 'success',
        status_code: 200,
        response_time_ms: 234,
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        tenant_id: tenantId,
        endpoint_name: '外部システム',
        status: 'failure',
        error_message: 'Connection timeout',
        response_time_ms: 5023,
        created_at: new Date(Date.now() - 3600000).toISOString(),
      }
    ];

    return res.status(200).json({
      logs: status ? mockLogs.filter(log => log.status === status) : mockLogs,
      total: mockLogs.length,
      message: 'Using mock data (Supabase not configured)'
    });
  }

  try {
    // ログ取得クエリ
    let query = supabase
      .from('proxy_logs')
      .select(`
        *,
        proxy_endpoints!inner(name)
      `, { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    // ステータスフィルター
    if (status) {
      query = query.eq('status', status);
    }

    const { data: logs, error, count } = await query;

    if (error) {
      logger.error('Error fetching logs:', error);
      return res.status(500).json({ error: 'Failed to fetch logs' });
    }

    // ログデータを整形
    const formattedLogs = logs?.map(log => ({
      id: log.id,
      tenant_id: log.tenant_id,
      endpoint_name: log.proxy_endpoints?.name || 'Unknown',
      status: log.status,
      status_code: log.status_code,
      error_message: log.error_message,
      response_time_ms: log.response_time_ms,
      created_at: log.created_at,
    })) || [];

    // 統計情報も返す
    const stats = {
      total: count || 0,
      success: logs?.filter(log => log.status === 'success').length || 0,
      failure: logs?.filter(log => log.status === 'failure').length || 0,
    };

    return res.status(200).json({
      logs: formattedLogs,
      stats,
      pagination: {
        total: count || 0,
        limit: parseInt(limit),
        offset: parseInt(offset),
      }
    });

  } catch (error) {
    logger.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};