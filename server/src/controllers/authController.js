const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/env');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { validateRegister, validateLogin } = require('../utils/validators');

const signToken = (user) => jwt.sign({ id: user._id }, jwtSecret, { expiresIn: jwtExpiresIn });

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { isValid, errors, value } = validateRegister(req.body);
  if (!isValid) throw new AppError('Please fix the highlighted fields.', 400, errors);

  const exists = await User.findOne({ email: value.email });
  if (exists) throw new AppError('An account with this email already exists.', 409, { email: 'Email already registered.' });

  // role is NOT read from the request, so nobody can sign up as admin.
  const user = await User.create({ name: value.name, email: value.email, password: value.password });
  res.status(201).json({ success: true, user, token: signToken(user) });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { isValid, errors, value } = validateLogin(req.body);
  if (!isValid) throw new AppError('Email and password are required.', 400, errors);

  const user = await User.findOne({ email: value.email }).select('+password');
  // Same message for "no such user" and "wrong password" so attackers learn nothing.
  if (!user || !(await user.comparePassword(value.password))) {
    throw new AppError('Invalid email or password.', 401);
  }
  res.json({ success: true, user, token: signToken(user) });
});

// GET /api/auth/me
exports.me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});
