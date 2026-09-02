import Interview from '../models/Interview.js';
import InterviewQuestion from '../models/InterviewQuestion.js';
import InterviewAnswer from '../models/InterviewAnswer.js';
import Resume from '../models/Resume.js';
import geminiProvider from '../integrations/ai/GeminiProvider.js';
import { INTERVIEW_STATUS } from '../../../shared/constants/interviewStatuses.js';
import { logger } from '../utils/logger.js';

class InterviewService {
  /**
   * Helper to verify interview ownership and existence
   */
  async _getVerifiedInterview(userId, interviewId) {
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      const error = new Error('Interview session not found');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    if (interview.userId.toString() !== userId.toString()) {
      const error = new Error('Unauthorized: You do not own this interview session');
      error.code = 'FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }

    return interview;
  }

  /**
   * Create a new interview and generate questions
   */
  async createInterview(userId, config) {
    let resumeContext = null;
    if (config.resumeId) {
      const resume = await Resume.findOne({ _id: config.resumeId, userId });
      if (resume) {
        resumeContext = resume.parsedData;
      }
    }

    // 1. Create the Interview document
    const title = `${config.targetCompany || 'Generic'} ${config.targetRole} (${config.type})`;
    const interview = await Interview.create({
      userId,
      title,
      type: config.type,
      difficulty: config.difficulty,
      targetRole: config.targetRole,
      targetCompany: config.targetCompany || 'Generic',
      skillsFocus: config.skillsFocus || [],
      questionCount: config.questionCount || 5,
      timeLimitMinutes: config.timeLimitMinutes || 30,
      remainingTimeSeconds: (config.timeLimitMinutes || 30) * 60,
      resumeId: config.resumeId || null,
      status: INTERVIEW_STATUS.CREATED,
      currentQuestionIndex: 0
    });

    // 2. Generate structured questions via AI Provider
    const generatedQuestions = await geminiProvider.generateQuestions({
      type: config.type,
      difficulty: config.difficulty,
      targetRole: config.targetRole,
      targetCompany: config.targetCompany,
      skillsFocus: config.skillsFocus,
      questionCount: config.questionCount || 5,
      resumeContext
    });

    // 3. Save Question documents in database
    const questionDocs = generatedQuestions.map((q, index) => ({
      interviewId: interview._id,
      orderIndex: index,
      questionText: q.questionText,
      category: q.category || 'General',
      difficulty: q.difficulty || config.difficulty,
      expectedTopics: q.expectedTopics || [],
      rubricGuide: q.rubricGuide || ''
    }));

    const savedQuestions = await InterviewQuestion.insertMany(questionDocs);

    // 4. Update status to READY
    interview.status = INTERVIEW_STATUS.READY;
    await interview.save();

    logger.info(`Interview created (${interview._id}) with ${savedQuestions.length} questions for user ${userId}`);

    return {
      interview,
      questions: savedQuestions
    };
  }

  /**
   * Get all interviews for the user with pagination
   */
  async getUserInterviews(userId, { page = 1, limit = 10, status } = {}) {
    const query = { userId };
    if (status && Object.values(INTERVIEW_STATUS).includes(status)) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [interviews, total] = await Promise.all([
      Interview.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Interview.countDocuments(query)
    ]);

    return {
      interviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    };
  }

  /**
   * Get interview session with all questions and submitted answers
   */
  async getInterviewById(userId, interviewId) {
    const interview = await this._getVerifiedInterview(userId, interviewId);

    const [questions, answers] = await Promise.all([
      InterviewQuestion.find({ interviewId: interview._id }).sort({ orderIndex: 1 }),
      InterviewAnswer.find({ interviewId: interview._id })
    ]);

    // Recalculate remaining server time if in progress
    if (interview.status === INTERVIEW_STATUS.IN_PROGRESS && interview.startedAt) {
      const now = new Date();
      const elapsedSeconds = Math.floor((now.getTime() - interview.startedAt.getTime()) / 1000) - interview.totalPausedDurationSeconds;
      const totalAllowed = interview.timeLimitMinutes * 60;
      interview.remainingTimeSeconds = Math.max(0, totalAllowed - elapsedSeconds);
    }

    return {
      interview,
      questions,
      answers
    };
  }

  /**
   * Transition state to IN_PROGRESS
   */
  async startInterview(userId, interviewId) {
    const interview = await this._getVerifiedInterview(userId, interviewId);

    if (interview.status !== INTERVIEW_STATUS.READY && interview.status !== INTERVIEW_STATUS.CREATED) {
      if (interview.status === INTERVIEW_STATUS.IN_PROGRESS) {
        return interview; // Idempotent start
      }
      const error = new Error(`Cannot start interview with status: ${interview.status}`);
      error.code = 'INVALID_STATE';
      error.statusCode = 400;
      throw error;
    }

    interview.status = INTERVIEW_STATUS.IN_PROGRESS;
    interview.startedAt = interview.startedAt || new Date();
    interview.remainingTimeSeconds = interview.timeLimitMinutes * 60;
    await interview.save();

    logger.info(`Interview started: ${interview._id}`);
    return interview;
  }

  /**
   * Pause an active interview
   */
  async pauseInterview(userId, interviewId) {
    const interview = await this._getVerifiedInterview(userId, interviewId);

    if (interview.status !== INTERVIEW_STATUS.IN_PROGRESS) {
      const error = new Error(`Cannot pause interview that is not in progress (Current status: ${interview.status})`);
      error.code = 'INVALID_STATE';
      error.statusCode = 400;
      throw error;
    }

    interview.status = INTERVIEW_STATUS.PAUSED;
    interview.pausedAt = new Date();
    await interview.save();

    logger.info(`Interview paused: ${interview._id}`);
    return interview;
  }

  /**
   * Resume a paused interview
   */
  async resumeInterview(userId, interviewId) {
    const interview = await this._getVerifiedInterview(userId, interviewId);

    if (interview.status !== INTERVIEW_STATUS.PAUSED) {
      const error = new Error(`Cannot resume interview that is not paused (Current status: ${interview.status})`);
      error.code = 'INVALID_STATE';
      error.statusCode = 400;
      throw error;
    }

    if (interview.pausedAt) {
      const pauseDuration = Math.floor((new Date().getTime() - interview.pausedAt.getTime()) / 1000);
      interview.totalPausedDurationSeconds += Math.max(0, pauseDuration);
      interview.pausedAt = null;
    }

    interview.status = INTERVIEW_STATUS.IN_PROGRESS;
    await interview.save();

    logger.info(`Interview resumed: ${interview._id}`);
    return interview;
  }

  /**
   * Submit text or speech answer for a question
   */
  async submitAnswer(userId, interviewId, { questionId, transcriptText, durationSeconds = 0, inputMethod = 'TEXT' }) {
    const interview = await this._getVerifiedInterview(userId, interviewId);

    if (interview.status !== INTERVIEW_STATUS.IN_PROGRESS) {
      const error = new Error(`Answers can only be submitted during active interviews (Current status: ${interview.status})`);
      error.code = 'INVALID_STATE';
      error.statusCode = 400;
      throw error;
    }

    const question = await InterviewQuestion.findOne({ _id: questionId, interviewId: interview._id });
    if (!question) {
      const error = new Error('Question not found in this interview');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    // Upsert answer
    const answer = await InterviewAnswer.findOneAndUpdate(
      { interviewId: interview._id, questionId: question._id },
      {
        userId,
        transcriptText: transcriptText || '',
        isSkipped: false,
        durationSeconds,
        inputMethod,
        submittedAt: new Date()
      },
      { upsert: true, returnDocument: 'after' }
    );

    // Auto advance question index
    const totalQuestions = await InterviewQuestion.countDocuments({ interviewId: interview._id });
    if (question.orderIndex >= interview.currentQuestionIndex) {
      const nextIndex = question.orderIndex + 1;
      if (nextIndex >= totalQuestions) {
        interview.currentQuestionIndex = totalQuestions - 1;
        interview.status = INTERVIEW_STATUS.COMPLETED;
        interview.completedAt = new Date();
      } else {
        interview.currentQuestionIndex = nextIndex;
      }
      await interview.save();
    }

    return {
      answer,
      interview
    };
  }

  /**
   * Skip a question
   */
  async skipQuestion(userId, interviewId, { questionId }) {
    const interview = await this._getVerifiedInterview(userId, interviewId);

    if (interview.status !== INTERVIEW_STATUS.IN_PROGRESS) {
      const error = new Error(`Questions can only be skipped during an active interview (Current status: ${interview.status})`);
      error.code = 'INVALID_STATE';
      error.statusCode = 400;
      throw error;
    }

    const question = await InterviewQuestion.findOne({ _id: questionId, interviewId: interview._id });
    if (!question) {
      const error = new Error('Question not found in this interview');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    // Record skipped answer
    const answer = await InterviewAnswer.findOneAndUpdate(
      { interviewId: interview._id, questionId: question._id },
      {
        userId,
        transcriptText: '',
        isSkipped: true,
        durationSeconds: 0,
        inputMethod: 'TEXT',
        submittedAt: new Date()
      },
      { upsert: true, returnDocument: 'after' }
    );

    // Auto advance question index
    const totalQuestions = await InterviewQuestion.countDocuments({ interviewId: interview._id });
    const nextIndex = question.orderIndex + 1;

    if (nextIndex >= totalQuestions) {
      interview.currentQuestionIndex = totalQuestions - 1;
      interview.status = INTERVIEW_STATUS.COMPLETED;
      interview.completedAt = new Date();
    } else {
      interview.currentQuestionIndex = nextIndex;
    }
    await interview.save();

    return {
      answer,
      interview
    };
  }

  /**
   * Move to next question index manually
   */
  async nextQuestion(userId, interviewId) {
    const interview = await this._getVerifiedInterview(userId, interviewId);
    const totalQuestions = await InterviewQuestion.countDocuments({ interviewId: interview._id });

    if (interview.currentQuestionIndex < totalQuestions - 1) {
      interview.currentQuestionIndex += 1;
      await interview.save();
    }

    return interview;
  }

  /**
   * Complete interview session
   */
  async completeInterview(userId, interviewId) {
    const interview = await this._getVerifiedInterview(userId, interviewId);

    if (interview.status === INTERVIEW_STATUS.COMPLETED) {
      return interview;
    }

    if (interview.status === INTERVIEW_STATUS.ABANDONED) {
      const error = new Error('Cannot complete an abandoned interview');
      error.code = 'INVALID_STATE';
      error.statusCode = 400;
      throw error;
    }

    interview.status = INTERVIEW_STATUS.COMPLETED;
    interview.completedAt = new Date();
    await interview.save();

    logger.info(`Interview completed: ${interview._id}`);
    return interview;
  }

  /**
   * Abandon interview session
   */
  async abandonInterview(userId, interviewId) {
    const interview = await this._getVerifiedInterview(userId, interviewId);

    if (interview.status === INTERVIEW_STATUS.COMPLETED) {
      const error = new Error('Cannot abandon a completed interview');
      error.code = 'INVALID_STATE';
      error.statusCode = 400;
      throw error;
    }

    interview.status = INTERVIEW_STATUS.ABANDONED;
    interview.abandonedAt = new Date();
    await interview.save();

    logger.info(`Interview abandoned: ${interview._id}`);
    return interview;
  }
}

export const interviewService = new InterviewService();
export default interviewService;
