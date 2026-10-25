const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination } = require('../utils/validators');

// GET /api/admin/users  (admin only) - shows role-based authorization (403 for normal users)
exports.listUsers = asyncHandler(async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const [data, total] = await Promise.all([
    User.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(),
  ]);
  res.json({
    success: true,
    data,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
});
