import { sendError } from '../utils/apiResponse.js';

/**
 * Role-Based Access Control (RBAC) middleware factory
 * @param {string[]} allowedRoles - List of permitted roles (e.g. ['ADMIN'])
 */
export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(
        res,
        'UNAUTHORIZED',
        'Authentication required prior to role verification.',
        401
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        'FORBIDDEN',
        'You do not possess the required permissions to perform this action.',
        403
      );
    }

    next();
  };
};

export default requireRole;
