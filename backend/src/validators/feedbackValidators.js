import { z } from 'zod';

export const createFeedbackSchema = z.object({
  category: z.enum(['QUESTIONS', 'EVALUATION', 'UI_UX', 'GENERAL']).default('GENERAL'),
  rating: z.coerce.number().min(1).max(5).default(5),
  message: z.string().trim().min(3, 'Feedback message must be at least 3 characters').max(2000, 'Message cannot exceed 2000 characters'),
  interviewId: z.string().optional()
});
