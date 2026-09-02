import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import profileRoutes from './profileRoutes.js';
import resumeRoutes from './resumeRoutes.js';

const router = Router();

// Mount Domain Routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/resumes', resumeRoutes);

export default router;
