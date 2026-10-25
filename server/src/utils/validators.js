/**
 * Pure validation helpers (no database, no Express) so they are easy to unit test.
 * Every validator returns { isValid, errors, value } where `value` is the cleaned input.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OBJECT_ID_RE = /^[a-f\d]{24}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}/;

const TASK_STATUSES = ['todo', 'in-progress', 'done'];
const TASK_PRIORITIES = ['low', 'medium', 'high'];

const isString = (v) => typeof v === 'string';
const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
const result = (errors, value) => ({ isValid: Object.keys(errors).length === 0, errors, value });

function validateRegister(body) {
  const b = body && typeof body === 'object' ? body : {};
  const errors = {};
  const name = isString(b.name) ? b.name.trim() : '';
  const email = isString(b.email) ? b.email.trim().toLowerCase() : '';
  const password = isString(b.password) ? b.password : '';

  if (name.length < 2 || name.length > 50) errors.name = 'Name must be 2 to 50 characters.';
  if (!EMAIL_RE.test(email) || email.length > 254) errors.email = 'Enter a valid email address.';
  // bcrypt only uses the first 72 bytes, so cap the length.
  if (password.length < 8 || password.length > 72) {
    errors.password = 'Password must be 8 to 72 characters.';
  } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    errors.password = 'Password must contain at least one letter and one number.';
  }
  return result(errors, { name, email, password });
}

function validateLogin(body) {
  const b = body && typeof body === 'object' ? body : {};
  const errors = {};
  const email = isString(b.email) ? b.email.trim().toLowerCase() : '';
  const password = isString(b.password) ? b.password : '';
  if (!email) errors.email = 'Email is required.';
  if (!password) errors.password = 'Password is required.';
  return result(errors, { email, password });
}

/**
 * Validates task input. With { partial: true } only the supplied fields are checked
 * (used for updates).
 */
function validateTask(body, { partial = false } = {}) {
  const b = body && typeof body === 'object' ? body : {};
  const errors = {};
  const value = {};

  if (!partial || has(b, 'title')) {
    const title = isString(b.title) ? b.title.trim() : '';
    if (title.length < 1 || title.length > 100) errors.title = 'Title is required (max 100 characters).';
    else value.title = title;
  }

  if (has(b, 'description')) {
    if (b.description === null || b.description === undefined) {
      value.description = '';
    } else if (!isString(b.description) || b.description.trim().length > 500) {
      errors.description = 'Description must be text of at most 500 characters.';
    } else {
      value.description = b.description.trim();
    }
  }

  if (has(b, 'status')) {
    if (!TASK_STATUSES.includes(b.status)) errors.status = `Status must be one of: ${TASK_STATUSES.join(', ')}.`;
    else value.status = b.status;
  }

  if (has(b, 'priority')) {
    if (!TASK_PRIORITIES.includes(b.priority)) {
      errors.priority = `Priority must be one of: ${TASK_PRIORITIES.join(', ')}.`;
    } else value.priority = b.priority;
  }

  if (has(b, 'dueDate')) {
    if (b.dueDate === null || b.dueDate === '') {
      value.dueDate = null; // clears the date
    } else if (!isString(b.dueDate) || !DATE_RE.test(b.dueDate) || Number.isNaN(Date.parse(b.dueDate))) {
      errors.dueDate = 'Due date must be a valid date (YYYY-MM-DD).';
    } else {
      value.dueDate = new Date(b.dueDate);
    }
  }

  if (partial && Object.keys(errors).length === 0 && Object.keys(value).length === 0) {
    errors.body = 'Provide at least one field to update.';
  }
  return result(errors, value);
}

/** Reads ?page and ?limit safely and clamps them to sensible values. */
function parsePagination(query, { defaultLimit = 10, maxLimit = 50 } = {}) {
  const q = query && typeof query === 'object' ? query : {};
  const toInt = (v) => (isString(v) && /^\d+$/.test(v) ? parseInt(v, 10) : NaN);
  let page = toInt(q.page);
  let limit = toInt(q.limit);
  if (!Number.isInteger(page) || page < 1) page = 1;
  if (!Number.isInteger(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;
  return { page, limit };
}

const isValidObjectId = (id) => isString(id) && OBJECT_ID_RE.test(id);
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = {
  TASK_STATUSES,
  TASK_PRIORITIES,
  validateRegister,
  validateLogin,
  validateTask,
  parsePagination,
  isValidObjectId,
  escapeRegex,
};
