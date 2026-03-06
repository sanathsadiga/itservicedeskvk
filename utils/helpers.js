const generateTicketNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `TKT${String(timestamp).slice(-6)}${String(random).padStart(3, '0')}`;
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const getClientIp = (req) => {
  return req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

module.exports = {
  generateTicketNumber,
  validateEmail,
  getClientIp,
  sanitizeInput
};
