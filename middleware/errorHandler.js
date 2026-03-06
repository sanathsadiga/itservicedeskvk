const { getClientIp } = require('../utils/helpers');

const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const clientIp = getClientIp(req);
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${clientIp}`);
  next();
};

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.errors
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      message: 'Unauthorized access'
    });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    status: err.status || 500
  });
};

module.exports = {
  requestLogger,
  errorHandler
};
