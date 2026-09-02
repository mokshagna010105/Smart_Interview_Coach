import { sendError } from '../utils/apiResponse.js';

/**
 * Zod validation middleware factory
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} [source='body']
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const formattedErrors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        issue: err.message
      }));

      return sendError(
        res,
        'VALIDATION_ERROR',
        'Request data failed validation checks',
        400,
        formattedErrors
      );
    }

    // Replace req[source] with parsed/sanitized data
    req[source] = result.data;
    next();
  };
};

export default validate;
