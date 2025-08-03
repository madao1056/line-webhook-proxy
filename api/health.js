const { sendSuccess } = require('./_utils/response');

module.exports = (req, res) => {
  const healthData = {
    status: 'healthy',
    service: 'line-webhook-proxy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL || !!process.env.SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasApiKey: !!process.env.API_KEY,
      nodeEnv: process.env.NODE_ENV
    }
  };
  
  sendSuccess(res, healthData);
};