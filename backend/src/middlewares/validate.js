const Joi = require('joi');
const ApiError = require('../utils/ApiError');

/**
 * Factory that returns an Express middleware which validates req.body
 * against the provided Joi schema.
 *
 * Usage:
 *   router.post('/experts', validate(expertCreateSchema), expertController.create);
 *
 * On failure → passes a 422 ApiError to next(), which is caught by errorHandler.
 * On success → calls next() so the request proceeds to the controller.
 *
 * @param {Joi.Schema} schema - A Joi schema to validate req.body against
 * @param {'body'|'query'|'params'} [source='body'] - Which part of req to validate
 * @returns {import('express').RequestHandler}
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source];

    const { error, value } = schema.validate(data, {
      abortEarly: false,       // Collect ALL validation errors, not just the first
      allowUnknown: false,     // Reject unknown fields (strict mode)
      stripUnknown: true,      // Remove fields not in the schema (sanitise input)
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.context?.key || detail.path.join('.'),
        message: detail.message.replace(/['"]/g, ''), // Remove Joi's surrounding quotes
      }));

      // Attach structured errors to the ApiError for the global handler to forward
      const apiErr = new ApiError(422, 'Validation failed');
      apiErr.errors = errors;
      return next(apiErr);
    }

    // Replace req[source] with the sanitised + coerced value from Joi
    req[source] = value;
    return next();
  };
};

// ── Reusable common Joi types ─────────────────────────────────────────────────

/** Standard ObjectId string validation */
const joiObjectId = () =>
  Joi.string()
    .pattern(/^[a-f\d]{24}$/i)
    .messages({ 'string.pattern.base': '{{#label}} must be a valid MongoDB ObjectId' });

/** Date string in YYYY-MM-DD format */
const joiDate = () =>
  Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .messages({ 'string.pattern.base': '{{#label}} must be in YYYY-MM-DD format' });

/** Time string in HH:MM format */
const joiTime = () =>
  Joi.string()
    .pattern(/^\d{2}:\d{2}$/)
    .messages({ 'string.pattern.base': '{{#label}} must be in HH:MM format' });

module.exports = { validate, joiObjectId, joiDate, joiTime };
