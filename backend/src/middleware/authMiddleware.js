import { verifyAccessToken } from '../utils/tokenUtils.js';
import { sendError } from '../utils/apiResponse.js';

/**
 * Authentication middleware that verifies JWT Access Token in Authorization header
 */
export const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(
        res,
        'UNAUTHORIZED',
        'Authentication required. Please provide a valid Bearer token.',
        401
      );
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return sendError(
        res,
        'UNAUTHORIZED',
        'Authentication token is missing.',
        401
      );
    }

    const decoded = verifyAccessToken(token);

    // Attach user payload to request object
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(
        res,
        'UNAUTHORIZED',
        'Access token expired. Please refresh your session.',
        401
      );
    }

    return sendError(
      res,
      'UNAUTHORIZED',
      'Invalid authentication token.',
      401
    );
  }
};

export default requireAuth;
