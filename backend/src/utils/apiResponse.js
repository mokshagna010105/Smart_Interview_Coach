/**
 * Standardized API Response Builders
 */

/**
 * Send a standardized success JSON response
 * @param {import('express').Response} res
 * @param {any} data
 * @param {string} [message="Operation successful"]
 * @param {number} [statusCode=200]
 * @param {object} [meta={}]
 */
export const sendSuccess = (res, data = null, message = 'Operation successful', statusCode = 200, meta = null) => {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...(meta || {})
    }
  });
};

/**
 * Send a standardized error JSON response
 * @param {import('express').Response} res
 * @param {string} code - Canonical error code (e.g. VALIDATION_ERROR)
 * @param {string} message - User-friendly error message
 * @param {number} [statusCode=400]
 * @param {any} [details=null] - Optional field-level error details
 */
export const sendError = (res, code = 'INTERNAL_SERVER_ERROR', message = 'An unexpected error occurred', statusCode = 500, details = null) => {
  return res.status(statusCode).json({
    success: false,
    statusCode,
    error: {
      code,
      message,
      ...(details ? { details } : {})
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
};
