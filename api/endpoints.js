const { supabase } = require('./_utils/supabase');
const { authenticate } = require('./_utils/auth');
const { logger } = require('./_utils/logger');

module.exports = async (req, res) => {
  // 認証チェック
  if (!authenticate(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { method } = req;
  const { tenantId } = req.query;

  // Supabaseが設定されていない場合
  if (!supabase) {
    return res.status(200).json({
      endpoints: [],
      message: 'Supabase not configured'
    });
  }

  try {
    switch (method) {
      case 'GET':
        // エンドポイント一覧取得
        if (!tenantId) {
          return res.status(400).json({ error: 'tenantId is required' });
        }

        const { data: endpoints, error: fetchError } = await supabase
          .from('proxy_endpoints')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('priority', { ascending: false })
          .order('created_at', { ascending: true });

        if (fetchError) {
          logger.error('Error fetching endpoints:', fetchError);
          return res.status(500).json({ error: 'Failed to fetch endpoints' });
        }

        return res.status(200).json({ endpoints: endpoints || [] });

      case 'POST':
        // エンドポイント追加
        const { tenant_id, name, url, priority = 50, enabled = true, headers = {} } = req.body;

        if (!tenant_id || !name || !url) {
          return res.status(400).json({ error: 'tenant_id, name, and url are required' });
        }

        const newEndpoint = {
          tenant_id,
          name,
          url,
          priority,
          enabled,
          headers,
          retry_count: 3,
          timeout_ms: 5000,
        };

        const { data: created, error: createError } = await supabase
          .from('proxy_endpoints')
          .insert(newEndpoint)
          .select()
          .single();

        if (createError) {
          logger.error('Error creating endpoint:', createError);
          return res.status(500).json({ error: 'Failed to create endpoint' });
        }

        return res.status(201).json({ endpoint: created });

      case 'PUT':
        // エンドポイント更新
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'Endpoint ID is required' });
        }

        const updates = {};
        const allowedFields = ['name', 'url', 'enabled', 'priority', 'headers', 'retry_count', 'timeout_ms'];
        
        allowedFields.forEach(field => {
          if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
          }
        });

        updates.updated_at = new Date().toISOString();

        const { data: updated, error: updateError } = await supabase
          .from('proxy_endpoints')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (updateError) {
          logger.error('Error updating endpoint:', updateError);
          return res.status(500).json({ error: 'Failed to update endpoint' });
        }

        return res.status(200).json({ endpoint: updated });

      case 'DELETE':
        // エンドポイント削除
        const { id: deleteId } = req.query;
        if (!deleteId) {
          return res.status(400).json({ error: 'Endpoint ID is required' });
        }

        const { error: deleteError } = await supabase
          .from('proxy_endpoints')
          .delete()
          .eq('id', deleteId);

        if (deleteError) {
          logger.error('Error deleting endpoint:', deleteError);
          return res.status(500).json({ error: 'Failed to delete endpoint' });
        }

        return res.status(200).json({ message: 'Endpoint deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    logger.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};