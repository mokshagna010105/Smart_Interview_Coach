import mongoose from 'mongoose';
import { DIFFICULTY_LEVELS } from '../../../shared/constants/difficultyLevels.js';
import { INTERVIEW_TYPES } from '../../../shared/constants/interviewTypes.js';

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    avatarUrl: {
      type: String,
      default: ''
    },
    targetRole: {
      type: String,
      trim: true,
      default: 'Full Stack Software Engineer',
      index: true
    },
    experienceLevel: {
      type: String,
      enum: Object.values(DIFFICULTY_LEVELS),
      default: DIFFICULTY_LEVELS.INTERMEDIATE
    },
    targetCompanies: {
      type: [String],
      default: ['Google', 'Amazon', 'Microsoft']
    },
    primarySkills: {
      type: [String],
      default: ['JavaScript', 'React', 'Node.js'],
      index: true
    },
    preferredInterviewType: {
      type: String,
      enum: Object.values(INTERVIEW_TYPES),
      default: INTERVIEW_TYPES.TECHNICAL
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: ''
    },
    interviewStats: {
      totalMocksCompleted: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      lastInterviewDate: { type: Date, default: null }
    }
  },
  {
    timestamps: true
  }
);

export const Profile = mongoose.model('Profile', profileSchema);
export default Profile;
