import { Router } from 'express';
import interviewController from '../controllers/interviewController.js';
import evaluationController from '../controllers/evaluationController.js';
import requireAuth from '../middleware/authMiddleware.js';
import validate from '../middleware/validateMiddleware.js';
import {
  createInterviewSchema,
  submitAnswerSchema,
  skipQuestionSchema
} from '../validators/interviewValidators.js';

const router = Router();

// 1. Public Read-Only Endpoint for Shared Reports (No auth required)
router.get('/shared/:shareToken', evaluationController.getPublicSharedReport);

// 2. All subsequent interview endpoints require authentication
router.use(requireAuth);

// Core Lifecycle
router.post('/', validate(createInterviewSchema), interviewController.createInterview);
router.get('/', interviewController.getUserInterviews);
router.get('/:interviewId', interviewController.getInterviewById);

// State Transition Endpoints
router.post('/:interviewId/start', interviewController.startInterview);
router.post('/:interviewId/pause', interviewController.pauseInterview);
router.post('/:interviewId/resume', interviewController.resumeInterview);
router.post('/:interviewId/answer', validate(submitAnswerSchema), interviewController.submitAnswer);
router.post('/:interviewId/skip', validate(skipQuestionSchema), interviewController.skipQuestion);
router.post('/:interviewId/next', interviewController.nextQuestion);
router.post('/:interviewId/complete', interviewController.completeInterview);
router.post('/:interviewId/abandon', interviewController.abandonInterview);

// Evaluation & Report Endpoints
router.post('/:interviewId/answers/:answerId/evaluate', evaluationController.evaluateAnswer);
router.post('/:interviewId/evaluate-all', evaluationController.evaluateAll);
router.get('/:interviewId/report', evaluationController.getReport);

// Shareable Reports Endpoints
router.post('/:interviewId/report/share', evaluationController.generateShareToken);
router.delete('/:interviewId/report/share', evaluationController.revokeShareToken);

export default router;
