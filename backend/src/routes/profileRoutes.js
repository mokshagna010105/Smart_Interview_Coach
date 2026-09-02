import { Router } from 'express';
import profileController from '../controllers/profileController.js';
import requireAuth from '../middleware/authMiddleware.js';
import validate from '../middleware/validateMiddleware.js';
import { updateProfileSchema } from '../validators/profileValidators.js';

const router = Router();

// All profile routes require authentication
router.use(requireAuth);

router.get('/', profileController.getProfile);
router.put('/', validate(updateProfileSchema), profileController.updateProfile);

export default router;
