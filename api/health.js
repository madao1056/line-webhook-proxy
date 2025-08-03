module.exports = (req, res) => {
  res.status(200).json({
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
  });
};