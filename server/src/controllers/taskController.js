const Task = require('../models/Task');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const {
  TASK_STATUSES,
  validateTask,
  parsePagination,
  isValidObjectId,
  escapeRegex,
} = require('../utils/validators');

/** Finds a task by id that belongs to the logged-in user, or throws 404. */
async function findOwnTask(req) {
  if (!isValidObjectId(req.params.id)) throw new AppError('Invalid task id.', 400);
  // The user filter IS the ownership check: other people's tasks look like they do not exist.
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
  if (!task) throw new AppError('Task not found.', 404);
  return task;
}

// GET /api/tasks?page=1&limit=10&status=todo&search=report
exports.listTasks = asyncHandler(async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const filter = { user: req.user._id };

  const { status, search } = req.query;
  if (status !== undefined && status !== '') {
    if (!TASK_STATUSES.includes(status)) throw new AppError('Invalid status filter.', 400);
    filter.status = status;
  }
  if (typeof search === 'string' && search.trim()) {
    filter.title = { $regex: escapeRegex(search.trim().slice(0, 100)), $options: 'i' };
  }

  const [data, total] = await Promise.all([
    Task.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Task.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
});

// POST /api/tasks
exports.createTask = asyncHandler(async (req, res) => {
  const { isValid, errors, value } = validateTask(req.body);
  if (!isValid) throw new AppError('Please fix the highlighted fields.', 400, errors);

  const task = await Task.create({ ...value, user: req.user._id });
  res.status(201).json({ success: true, data: task });
});

// GET /api/tasks/:id
exports.getTask = asyncHandler(async (req, res) => {
  const task = await findOwnTask(req);
  res.json({ success: true, data: task });
});

// PUT or PATCH /api/tasks/:id  (partial update)
exports.updateTask = asyncHandler(async (req, res) => {
  const task = await findOwnTask(req);
  const { isValid, errors, value } = validateTask(req.body, { partial: true });
  if (!isValid) throw new AppError('Please fix the highlighted fields.', 400, errors);

  task.set(value); // only whitelisted, validated fields
  await task.save();
  res.json({ success: true, data: task });
});

// DELETE /api/tasks/:id
exports.deleteTask = asyncHandler(async (req, res) => {
  const task = await findOwnTask(req);
  await task.deleteOne();
  res.json({ success: true, message: 'Task deleted.' });
});
