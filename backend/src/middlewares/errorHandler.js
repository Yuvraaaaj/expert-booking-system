const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');

/**
 * Global Express error handler middleware.
 * Must be registered LAST in the middleware chain (after all routes).
 *
 * Handles:
 *  - ApiError instances (operational, known errors)
 *  - Mongoose ValidationError (invalid field values)
 *  - Mongoose duplicate key error (code 11000)
 *  - Mongoose CastError (invalid ObjectId format)
 *  - Generic / unexpected errors
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next  // Must have 4 params for Express to treat as error handler
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // ── Mongoose ValidationError ────────────────────────────────────────────────
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 422;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // ── Mongoose Duplicate Key (unique index violation) ─────────────────────────
  else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {}).join(', ');
    const value = Object.values(err.keyValue || {}).join(', ');
    message = `Duplicate value: '${value}' already exists for field(s): [${field}].`;
    errors = [{ field, message }];
  }

  // ── Mongoose CastError (e.g. invalid ObjectId) ──────────────────────────────
  else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid value '${err.value}' for field '${err.path}'. Expected type: ${err.kind}.`;
  }

  // ── ApiError (operational errors raised by our code) ────────────────────────
  else if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // ── Log non-operational / unexpected errors ─────────────────────────────────
  const isOperational = err.isOperational !== false; // ApiErrors are operational; others may not be
  if (!isOperational || process.env.NODE_ENV === 'development') {
    console.error('🔥 Error:', {
      message: err.message,
      statusCode,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
    });
  }

  // ── Send standardised JSON response ────────────────────────────────────────
  const responseBody = {
    success: false,
    message,
    ...(errors && { errors }),
    // Expose stack only in development for easier debugging
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(responseBody);
};

module.exports = errorHandler;
