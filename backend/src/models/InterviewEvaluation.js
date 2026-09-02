import mongoose from 'mongoose';

const interviewEvaluationSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
      index: true
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewQuestion',
      required: true,
      index: true
    },
    answerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewAnswer',
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
    evaluator: {
      type: String,
      enum: ['gemini', 'deterministic_fallback'],
      default: 'deterministic_fallback'
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    scores: {
      relevance: { type: Number, min: 0, max: 100, default: 0 },
      correctness: { type: Number, min: 0, max: 100, default: 0 },
      completeness: { type: Number, min: 0, max: 100, default: 0 },
      communication: { type: Number, min: 0, max: 100, default: 0 },
      clarity: { type: Number, min: 0, max: 100, default: 0 }
    },
    strengths: {
      type: [String],
      default: []
    },
    weaknesses: {
      type: [String],
      default: []
    },
    feedback: {
      type: [String],
      default: []
    },
    idealAnswer: {
      type: String,
      default: ''
    },
    fillerWordAnalysis: {
      totalCount: { type: Number, default: 0 },
      breakdown: { type: mongoose.Schema.Types.Mixed, default: {} },
      fillerPercentage: { type: Number, default: 0 }
    },
    grammarIssues: {
      type: [String],
      default: []
    },
    vocabularySuggestions: {
      type: [String],
      default: []
    },
    evaluatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

export const InterviewEvaluation = mongoose.model('InterviewEvaluation', interviewEvaluationSchema);
export default InterviewEvaluation;
