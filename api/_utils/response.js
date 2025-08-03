const { logger } = require('./logger');

// 統一されたエラーレスポンス
function sendError(res, statusCode, message, error = null) {
  if (error) {
    logger.error(message, error);
  }
  
  return res.status(statusCode).json({
    success: false,
    error: message,
    details: process.env.NODE_ENV === 'development' ? error?.message : undefined
  });
}

// 統一された成功レスポンス
function sendSuccess(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    ...data
  });
}

module.exports = { sendError, sendSuccess };