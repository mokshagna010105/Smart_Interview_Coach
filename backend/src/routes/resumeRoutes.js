import { Router } from 'express';
import resumeController from '../controllers/resumeController.js';
import requireAuth from '../middleware/authMiddleware.js';
import uploadResumeFile from '../middleware/uploadMiddleware.js';

const router = Router();

// All resume routes require authentication
router.use(requireAuth);

router.post('/upload', uploadResumeFile, resumeController.uploadResume);
router.get('/', resumeController.listResumes);
router.get('/:resumeId', resumeController.getResume);
router.patch('/:resumeId/default', resumeController.setDefaultResume);
router.delete('/:resumeId', resumeController.deleteResume);

export default router;
