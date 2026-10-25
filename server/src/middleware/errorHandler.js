const { nodeEnv } = require('../config/env');
const AppError = require('../utils/AppError');

/** 404 for any unknown route. */
exports.notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

/**
 * Central error handler. Every error leaves the API in the same JSON shape:
 * { success: false, message: "...", errors?: { field: "..." } }
 * Technical details are logged on the server, never sent to the client.
 */
// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  let status = 500;
  let message = 'Something went wrong on our side. Please try again later.';
  let errors;

  if (err instanceof AppError) {
    status = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err.name === 'ValidationError') {
    status = 400;
    message = 'Some fields are invalid.';
    errors = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid value supplied.';
  } else if (err.code === 11000) {
    status = 409;
    message = 'That value is already in use.';
  } else if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Your session has expired. Please log in again.';
  } else if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid login token. Please log in again.';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Request body is not valid JSON.';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'Request body is too large.';
  } else if (err.message === 'Origin not allowed by CORS') {
    status = 403;
    message = 'This origin is not allowed to use the API.';
  }

  if (status >= 500) {
    console.error(err); // full details only in the server log
  } else if (nodeEnv === 'development') {
    console.warn(`${status} ${req.method} ${req.originalUrl} - ${message}`);
  }

  res.status(status).json({ success: false, message, ...(errors && { errors }) });
};
