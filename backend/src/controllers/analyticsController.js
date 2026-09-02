import analyticsService from '../services/analyticsService.js';
import { sendSuccess } from '../utils/apiResponse.js';

class AnalyticsController {
  async getAnalytics(req, res, next) {
    try {
      const analytics = await analyticsService.getUserAnalytics(req.user.userId);
      return sendSuccess(res, analytics, 'User analytics retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
export default analyticsController;
