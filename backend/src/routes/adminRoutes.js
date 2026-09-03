import { Router } from 'express';
import adminController from '../controllers/adminController.js';
import requireAuth from '../middleware/authMiddleware.js';
import requireRole from '../middleware/roleMiddleware.js';
import { USER_ROLES } from '../../../shared/constants/userRoles.js';

const router = Router();

// Protect all admin routes with authentication and strict ADMIN role authorization
router.use(requireAuth);
router.use(requireRole(USER_ROLES.ADMIN));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.get('/feedback', adminController.getFeedback);

export default router;
