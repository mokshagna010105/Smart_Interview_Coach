import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    category: {
      type: String,
      enum: ['QUESTIONS', 'EVALUATION', 'UI_UX', 'GENERAL'],
      default: 'GENERAL'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 2000
    },
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: false
    }
  },
  {
    timestamps: true
  }
);

export const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
