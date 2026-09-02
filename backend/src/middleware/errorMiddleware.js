import { sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

/**
 * 404 Not Found Middleware
 */
export const notFoundHandler = (req, res) => {
  return sendError(
    res,
    'NOT_FOUND',
    `Resource not found: ${req.method} ${req.originalUrl}`,
    404
  );
};

/**
 * Centralized Global Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  logger.error(`Error on ${req.method} ${req.url}:`, err.message || err);

  // Handle JSON syntax errors in request bodies
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 'VALIDATION_ERROR', 'Malformed JSON in request payload', 400);
  }

  // Handle custom status code errors
  const statusCode = err.statusCode || (err.status >= 400 && err.status < 600 ? err.status : 500);
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const errorMessage = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'An unexpected internal server error occurred'
    : (err.message || 'Internal Server Error');

  return sendError(
    res,
    errorCode,
    errorMessage,
    statusCode,
    process.env.NODE_ENV === 'development' ? err.stack : null
  );
};
