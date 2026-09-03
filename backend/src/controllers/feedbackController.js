import Feedback from '../models/Feedback.js';
import { sendSuccess } from '../utils/apiResponse.js';

class FeedbackController {
  async submitFeedback(req, res, next) {
    try {
      const { category, rating, message, interviewId } = req.body;
      const feedback = await Feedback.create({
        userId: req.user.userId,
        category,
        rating,
        message,
        interviewId: interviewId || undefined
      });
      return sendSuccess(res, feedback, 'Thank you! Your feedback has been submitted.', 201);
    } catch (error) {
      next(error);
    }
  }

  async getMyFeedback(req, res, next) {
    try {
      const feedbacks = await Feedback.find({ userId: req.user.userId }).sort({ createdAt: -1 });
      return sendSuccess(res, feedbacks, 'Feedback history retrieved', 200);
    } catch (error) {
      next(error);
    }
  }
}

export const feedbackController = new FeedbackController();
export default feedbackController;
