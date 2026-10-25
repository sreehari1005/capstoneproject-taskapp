/** An error we expect and can safely show to the client. */
class AppError extends Error {
  constructor(message, statusCode = 500, errors = undefined) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errors = errors; // optional { field: message }
    this.isOperational = true;
  }
}

module.exports = AppError;
