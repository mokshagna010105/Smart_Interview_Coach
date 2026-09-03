import { Router } from 'express';
import feedbackController from '../controllers/feedbackController.js';
import requireAuth from '../middleware/authMiddleware.js';
import validate from '../middleware/validateMiddleware.js';
import { createFeedbackSchema } from '../validators/feedbackValidators.js';

const router = Router();

router.use(requireAuth);

router.post('/', validate(createFeedbackSchema), feedbackController.submitFeedback);
router.get('/my', feedbackController.getMyFeedback);

export default router;
