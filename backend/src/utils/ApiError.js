/**
 * Custom API Error class.
 * Extends the native Error class with HTTP status code and operational flag.
 * - isOperational: true  → expected, user-facing errors (e.g. 400, 404)
 * - isOperational: false → unexpected programmer errors (e.g. uncaught bugs)
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (e.g. 400, 401, 404, 500)
   * @param {string} message    - Human-readable error message
   * @param {boolean} isOperational - Whether error is expected/operational
   * @param {string} stack      - Optional custom stack trace
   */
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;
