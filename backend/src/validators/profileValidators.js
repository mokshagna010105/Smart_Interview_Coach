import { z } from 'zod';
import { DIFFICULTY_LEVELS } from '../../../shared/constants/difficultyLevels.js';
import { INTERVIEW_TYPES } from '../../../shared/constants/interviewTypes.js';

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters')
    .optional(),
  targetRole: z.string().trim().max(100).optional(),
  experienceLevel: z.enum(Object.values(DIFFICULTY_LEVELS)).optional(),
  targetCompanies: z.array(z.string().trim().min(1)).optional(),
  primarySkills: z.array(z.string().trim().min(1)).optional(),
  preferredInterviewType: z.enum(Object.values(INTERVIEW_TYPES)).optional(),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  avatarUrl: z.string().url('Avatar URL must be a valid URL').or(z.literal('')).optional()
});
