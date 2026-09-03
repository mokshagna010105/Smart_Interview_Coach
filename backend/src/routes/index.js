import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import profileRoutes from './profileRoutes.js';
import resumeRoutes from './resumeRoutes.js';
import interviewRoutes from './interviewRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import feedbackRoutes from './feedbackRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

// Mount Domain Routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/resumes', resumeRoutes);
router.use('/interviews', interviewRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/admin', adminRoutes);

export default router;
