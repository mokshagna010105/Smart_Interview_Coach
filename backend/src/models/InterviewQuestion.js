import mongoose from 'mongoose';

const interviewQuestionSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
      index: true
    },
    orderIndex: {
      type: Number,
      required: true
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required']
    },
    category: {
      type: String,
      default: 'General'
    },
    difficulty: {
      type: String,
      default: 'INTERMEDIATE'
    },
    expectedTopics: {
      type: [String],
      default: []
    },
    rubricGuide: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Unique compound index so orderIndex is unique per interview
interviewQuestionSchema.index({ interviewId: 1, orderIndex: 1 }, { unique: true });

export const InterviewQuestion = mongoose.model('InterviewQuestion', interviewQuestionSchema);
export default InterviewQuestion;
