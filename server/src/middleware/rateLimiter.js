const rateLimit = require('express-rate-limit');

const message = (text) => ({ success: false, message: text });

// General limit for the whole API.
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: message('Too many requests. Please try again later.'),
});

// Stricter limit for login and registration to slow down password guessing.
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: message('Too many attempts. Please try again in 15 minutes.'),
});
