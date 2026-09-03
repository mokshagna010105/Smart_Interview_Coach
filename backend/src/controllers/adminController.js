import User from '../models/User.js';
import Interview from '../models/Interview.js';
import InterviewEvaluation from '../models/InterviewEvaluation.js';
import InterviewReport from '../models/InterviewReport.js';
import Feedback from '../models/Feedback.js';
import { sendSuccess } from '../utils/apiResponse.js';

class AdminController {
  /**
   * Get aggregate platform statistics
   */
  async getStats(req, res, next) {
    try {
      const [
        totalUsers,
        totalInterviews,
        completedInterviews,
        totalEvaluations,
        totalFeedback,
        reports
      ] = await Promise.all([
        User.countDocuments(),
        Interview.countDocuments(),
        Interview.countDocuments({ status: 'COMPLETED' }),
        InterviewEvaluation.countDocuments(),
        Feedback.countDocuments(),
        InterviewReport.find().select('overallScore')
      ]);

      const avgScore = reports.length > 0
        ? Math.round(reports.reduce((acc, r) => acc + (r.overallScore || 0), 0) / reports.length)
        : 0;

      const recentFeedback = await Feedback.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('userId', 'fullName email');

      return sendSuccess(res, {
        totalUsers,
        totalInterviews,
        completedInterviews,
        totalEvaluations,
        totalFeedback,
        averagePlatformScore: avgScore,
        recentFeedback,
        systemHealth: {
          uptime: process.uptime(),
          nodeEnv: process.env.NODE_ENV || 'development',
          memoryUsage: process.memoryUsage()
        }
      }, 'Admin platform stats retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get paginated users
   */
  async getUsers(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const [users, total] = await Promise.all([
        User.find()
          .select('-passwordHash -refreshTokenHash -passwordResetTokenHash')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit)),
        User.countDocuments()
      ]);

      return sendSuccess(res, users, 'Users retrieved successfully', 200, {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get paginated feedback list
   */
  async getFeedback(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const [feedbacks, total] = await Promise.all([
        Feedback.find()
          .populate('userId', 'fullName email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit)),
        Feedback.countDocuments()
      ]);

      return sendSuccess(res, feedbacks, 'Feedback list retrieved successfully', 200, {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
export default adminController;
