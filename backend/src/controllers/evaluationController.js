import evaluationService from '../services/evaluationService.js';
import reportService from '../services/reportService.js';
import { sendSuccess } from '../utils/apiResponse.js';

class EvaluationController {
  /**
   * Evaluate a specific answer in an interview
   */
  async evaluateAnswer(req, res, next) {
    try {
      const { interviewId, answerId } = req.params;
      const evaluation = await evaluationService.evaluateAnswer(req.user.userId, interviewId, answerId);
      return sendSuccess(res, evaluation, 'Answer evaluated successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Evaluate all answered questions in an interview
   */
  async evaluateAll(req, res, next) {
    try {
      const { interviewId } = req.params;
      const evaluations = await evaluationService.evaluateCompletedInterview(req.user.userId, interviewId);
      return sendSuccess(res, evaluations, 'All answers evaluated successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get post-interview report
   */
  async getReport(req, res, next) {
    try {
      const { interviewId } = req.params;
      const reportData = await reportService.generateOrGetReport(req.user.userId, interviewId);
      return sendSuccess(res, reportData, 'Interview report retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}

export const evaluationController = new EvaluationController();
export default evaluationController;
