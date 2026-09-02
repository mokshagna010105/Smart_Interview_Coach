import Interview from '../models/Interview.js';
import InterviewQuestion from '../models/InterviewQuestion.js';
import InterviewAnswer from '../models/InterviewAnswer.js';
import InterviewEvaluation from '../models/InterviewEvaluation.js';
import Profile from '../models/Profile.js';
import geminiProvider from '../integrations/ai/GeminiProvider.js';
import { logger } from '../utils/logger.js';

class EvaluationService {
  /**
   * Helper to verify interview ownership
   */
  async _getVerifiedInterview(userId, interviewId) {
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      const error = new Error('Interview not found');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    if (interview.userId.toString() !== userId.toString()) {
      const error = new Error('Unauthorized: You do not own this interview');
      error.code = 'FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }

    return interview;
  }

  /**
   * Evaluate a single answer
   */
  async evaluateAnswer(userId, interviewId, answerId) {
    const interview = await this._getVerifiedInterview(userId, interviewId);

    const answer = await InterviewAnswer.findOne({ _id: answerId, interviewId: interview._id });
    if (!answer) {
      const error = new Error('Answer not found in this interview');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    if (answer.isSkipped || !answer.transcriptText || !answer.transcriptText.trim()) {
      const error = new Error('Cannot evaluate an empty or skipped answer');
      error.code = 'VALIDATION_ERROR';
      error.statusCode = 400;
      throw error;
    }

    // Check if evaluation already exists to avoid redundant evaluations
    const existingEvaluation = await InterviewEvaluation.findOne({ answerId: answer._id });
    if (existingEvaluation) {
      return existingEvaluation;
    }

    const question = await InterviewQuestion.findById(answer.questionId);
    if (!question) {
      const error = new Error('Question corresponding to answer not found');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    // Call AI / Deterministic Provider
    const evalResult = await geminiProvider.evaluateAnswer({
      interviewType: interview.type,
      difficulty: interview.difficulty,
      targetRole: interview.targetRole,
      targetCompany: interview.targetCompany,
      questionText: question.questionText,
      category: question.category,
      expectedTopics: question.expectedTopics,
      rubricGuide: question.rubricGuide,
      transcriptText: answer.transcriptText
    });

    // Save evaluation document
    const evaluation = await InterviewEvaluation.create({
      interviewId: interview._id,
      questionId: question._id,
      answerId: answer._id,
      userId,
      evaluator: evalResult.evaluator,
      overallScore: evalResult.overallScore,
      scores: evalResult.scores,
      strengths: evalResult.strengths,
      weaknesses: evalResult.weaknesses,
      feedback: evalResult.feedback,
      idealAnswer: evalResult.idealAnswer,
      fillerWordAnalysis: evalResult.fillerWordAnalysis,
      grammarIssues: evalResult.grammarIssues,
      vocabularySuggestions: evalResult.vocabularySuggestions
    });

    logger.info(`Answer ${answer._id} evaluated with score ${evaluation.overallScore}/100 (${evaluation.evaluator})`);
    return evaluation;
  }

  /**
   * Evaluate all non-skipped answers for a completed or active interview
   */
  async evaluateCompletedInterview(userId, interviewId) {
    const interview = await this._getVerifiedInterview(userId, interviewId);

    const answers = await InterviewAnswer.find({
      interviewId: interview._id,
      isSkipped: false,
      transcriptText: { $exists: true, $ne: '' }
    });

    const evaluations = [];
    for (const answer of answers) {
      try {
        const evaluation = await this.evaluateAnswer(userId, interview._id, answer._id);
        evaluations.push(evaluation);
      } catch (err) {
        logger.warn(`Could not evaluate answer ${answer._id}: ${err.message}`);
      }
    }

    // Update Profile interview stats with real aggregate score
    if (evaluations.length > 0) {
      const totalScore = evaluations.reduce((sum, e) => sum + e.overallScore, 0);
      const avgScore = Math.round(totalScore / evaluations.length);

      const profile = await Profile.findOne({ userId });
      if (profile) {
        const completedCount = await Interview.countDocuments({ userId, status: 'COMPLETED' });
        profile.interviewStats = {
          totalMocksCompleted: completedCount,
          averageScore: avgScore,
          lastInterviewDate: new Date()
        };
        await profile.save();
      }
    }

    return evaluations;
  }
}

export const evaluationService = new EvaluationService();
export default evaluationService;
