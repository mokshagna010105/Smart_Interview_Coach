import mongoose from 'mongoose';
import { INTERVIEW_TYPES } from '../../../shared/constants/interviewTypes.js';
import { DIFFICULTY_LEVELS } from '../../../shared/constants/difficultyLevels.js';
import { INTERVIEW_STATUS } from '../../../shared/constants/interviewStatuses.js';

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      trim: true,
      default: 'Mock Interview Session'
    },
    type: {
      type: String,
      enum: Object.values(INTERVIEW_TYPES),
      required: [true, 'Interview type is required'],
      index: true
    },
    difficulty: {
      type: String,
      enum: Object.values(DIFFICULTY_LEVELS),
      required: [true, 'Difficulty level is required'],
      index: true
    },
    targetRole: {
      type: String,
      required: [true, 'Target role is required'],
      trim: true
    },
    targetCompany: {
      type: String,
      trim: true,
      default: 'Generic'
    },
    skillsFocus: {
      type: [String],
      default: []
    },
    questionCount: {
      type: Number,
      min: 1,
      max: 20,
      default: 5
    },
    timeLimitMinutes: {
      type: Number,
      min: 5,
      max: 120,
      default: 30
    },
    remainingTimeSeconds: {
      type: Number,
      default: null
    },
    status: {
      type: String,
      enum: Object.values(INTERVIEW_STATUS),
      default: INTERVIEW_STATUS.CREATED,
      index: true
    },
    currentQuestionIndex: {
      type: Number,
      default: 0
    },
    startedAt: {
      type: Date,
      default: null
    },
    pausedAt: {
      type: Date,
      default: null
    },
    totalPausedDurationSeconds: {
      type: Number,
      default: 0
    },
    completedAt: {
      type: Date,
      default: null
    },
    abandonedAt: {
      type: Date,
      default: null
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound index for user query filtering
interviewSchema.index({ userId: 1, status: 1, createdAt: -1 });

export const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;
