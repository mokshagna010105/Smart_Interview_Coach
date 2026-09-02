import { Router } from 'express';
import { sendSuccess } from '../utils/apiResponse.js';

const router = Router();

/**
 * @route   GET /api/v1/health
 * @desc    Check system health and basic server stats
 * @access  Public
 */
router.get('/', (req, res) => {
  const healthData = {
    status: 'healthy',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    service: 'interview-ai-backend',
    version: '1.0.0'
  };

  return sendSuccess(res, healthData, 'InterviewAI Backend API is fully operational', 200);
});

export default router;
