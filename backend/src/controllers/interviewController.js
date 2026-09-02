import interviewService from '../services/interviewService.js';
import { sendSuccess } from '../utils/apiResponse.js';

class InterviewController {
  async createInterview(req, res, next) {
    try {
      const result = await interviewService.createInterview(req.user.userId, req.body);
      return sendSuccess(res, result, 'Interview configured and questions generated successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getUserInterviews(req, res, next) {
    try {
      const { page, limit, status } = req.query;
      const result = await interviewService.getUserInterviews(req.user.userId, { page, limit, status });
      return sendSuccess(res, result.interviews, 'User interviews retrieved successfully', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getInterviewById(req, res, next) {
    try {
      const { interviewId } = req.params;
      const result = await interviewService.getInterviewById(req.user.userId, interviewId);
      return sendSuccess(res, result, 'Interview session retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  async startInterview(req, res, next) {
    try {
      const { interviewId } = req.params;
      const interview = await interviewService.startInterview(req.user.userId, interviewId);
      return sendSuccess(res, interview, 'Interview started successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  async pauseInterview(req, res, next) {
    try {
      const { interviewId } = req.params;
      const interview = await interviewService.pauseInterview(req.user.userId, interviewId);
      return sendSuccess(res, interview, 'Interview paused successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  async resumeInterview(req, res, next) {
    try {
      const { interviewId } = req.params;
      const interview = await interviewService.resumeInterview(req.user.userId, interviewId);
      return sendSuccess(res, interview, 'Interview resumed successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  async submitAnswer(req, res, next) {
    try {
      const { interviewId } = req.params;
      const result = await interviewService.submitAnswer(req.user.userId, interviewId, req.body);
      return sendSuccess(res, result, 'Answer submitted successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  async skipQuestion(req, res, next) {
    try {
      const { interviewId } = req.params;
      const result = await interviewService.skipQuestion(req.user.userId, interviewId, req.body);
      return sendSuccess(res, result, 'Question skipped successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  async nextQuestion(req, res, next) {
    try {
      const { interviewId } = req.params;
      const interview = await interviewService.nextQuestion(req.user.userId, interviewId);
      return sendSuccess(res, interview, 'Advanced to next question', 200);
    } catch (error) {
      next(error);
    }
  }

  async completeInterview(req, res, next) {
    try {
      const { interviewId } = req.params;
      const interview = await interviewService.completeInterview(req.user.userId, interviewId);
      return sendSuccess(res, interview, 'Interview completed successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  async abandonInterview(req, res, next) {
    try {
      const { interviewId } = req.params;
      const interview = await interviewService.abandonInterview(req.user.userId, interviewId);
      return sendSuccess(res, interview, 'Interview abandoned', 200);
    } catch (error) {
      next(error);
    }
  }
}

export const interviewController = new InterviewController();
export default interviewController;
