import mongoose from 'mongoose';

const interviewAnswerSchema = new mongoose.Schema(
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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    transcriptText: {
      type: String,
      default: ''
    },
    isSkipped: {
      type: Boolean,
      default: false
    },
    durationSeconds: {
      type: Number,
      default: 0
    },
    inputMethod: {
      type: String,
      enum: ['TEXT', 'SPEECH'],
      default: 'TEXT'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// One answer per question in a given interview
interviewAnswerSchema.index({ interviewId: 1, questionId: 1 }, { unique: true });

export const InterviewAnswer = mongoose.model('InterviewAnswer', interviewAnswerSchema);
export default InterviewAnswer;
