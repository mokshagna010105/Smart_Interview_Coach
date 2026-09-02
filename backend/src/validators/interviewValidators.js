import { z } from 'zod';
import { INTERVIEW_TYPES } from '../../../shared/constants/interviewTypes.js';
import { DIFFICULTY_LEVELS } from '../../../shared/constants/difficultyLevels.js';

export const createInterviewSchema = z.object({
  type: z.enum(Object.values(INTERVIEW_TYPES), {
    required_error: 'Interview type is required'
  }),
  difficulty: z.enum(Object.values(DIFFICULTY_LEVELS), {
    required_error: 'Difficulty level is required'
  }),
  targetRole: z
    .string({ required_error: 'Target job role is required' })
    .trim()
    .min(2, 'Target role must be at least 2 characters')
    .max(100, 'Target role cannot exceed 100 characters'),
  targetCompany: z.string().trim().max(100).optional().default('Generic'),
  skillsFocus: z.array(z.string().trim()).optional().default([]),
  questionCount: z.coerce.number().min(1, 'At least 1 question is required').max(20, 'Maximum 20 questions permitted').default(5),
  timeLimitMinutes: z.coerce.number().min(5, 'Minimum duration is 5 minutes').max(120, 'Maximum duration is 120 minutes').default(30),
  resumeId: z.string().optional()
});

export const submitAnswerSchema = z.object({
  questionId: z.string({ required_error: 'Question ID is required' }).min(1),
  transcriptText: z.string().default(''),
  durationSeconds: z.coerce.number().min(0).default(0),
  inputMethod: z.enum(['TEXT', 'SPEECH']).default('TEXT')
});

export const skipQuestionSchema = z.object({
  questionId: z.string({ required_error: 'Question ID is required' }).min(1)
});
