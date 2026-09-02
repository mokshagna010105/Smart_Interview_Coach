import mongoose from 'mongoose';

const interviewReportSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    dimensionScores: {
      relevance: { type: Number, default: 0 },
      correctness: { type: Number, default: 0 },
      completeness: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      clarity: { type: Number, default: 0 }
    },
    categoryScores: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    totalQuestions: {
      type: Number,
      default: 0
    },
    questionsAnswered: {
      type: Number,
      default: 0
    },
    questionsSkipped: {
      type: Number,
      default: 0
    },
    totalFillerWords: {
      type: Number,
      default: 0
    },
    totalDurationSeconds: {
      type: Number,
      default: 0
    },
    strongestAreas: {
      type: [String],
      default: []
    },
    weakestAreas: {
      type: [String],
      default: []
    },
    summaryFeedback: {
      type: String,
      default: ''
    },
    actionableNextSteps: {
      type: [String],
      default: []
    },
    generatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

export const InterviewReport = mongoose.model('InterviewReport', interviewReportSchema);
export default InterviewReport;
