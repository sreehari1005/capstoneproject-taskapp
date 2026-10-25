const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

/** Authentication: who are you? Reads "Authorization: Bearer <token>". */
exports.protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) throw new AppError('Please log in to continue.', 401);

  const payload = jwt.verify(token, jwtSecret); // throws -> handled as 401 in errorHandler
  const user = await User.findById(payload.id);
  if (!user) throw new AppError('This account no longer exists.', 401);

  req.user = user;
  next();
});

/** Authorization: what may you do? Usage: authorize('admin') */
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to do this.', 403));
  }
  next();
};
