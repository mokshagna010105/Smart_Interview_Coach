import { Router } from 'express';
import analyticsController from '../controllers/analyticsController.js';
import requireAuth from '../middleware/authMiddleware.js';

const router = Router();

// All analytics routes require authentication
router.use(requireAuth);

router.get('/', analyticsController.getAnalytics);

export default router;
