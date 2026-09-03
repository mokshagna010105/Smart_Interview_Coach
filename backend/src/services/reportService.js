import crypto from 'crypto';
import Interview from '../models/Interview.js';
import InterviewQuestion from '../models/InterviewQuestion.js';
import InterviewAnswer from '../models/InterviewAnswer.js';
import InterviewEvaluation from '../models/InterviewEvaluation.js';
import InterviewReport from '../models/InterviewReport.js';
import evaluationService from './evaluationService.js';
import { logger } from '../utils/logger.js';

class ReportService {
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
   * Generate or retrieve a comprehensive post-interview report
   */
  async generateOrGetReport(userId, interviewId) {
    const interview = await this._getVerifiedInterview(userId, interviewId);

    // 1. Ensure all eligible answers have evaluations
    await evaluationService.evaluateCompletedInterview(userId, interview._id);

    // 2. Fetch all questions, answers, and evaluations
    const [questions, answers, evaluations] = await Promise.all([
      InterviewQuestion.find({ interviewId: interview._id }).sort({ orderIndex: 1 }),
      InterviewAnswer.find({ interviewId: interview._id }),
      InterviewEvaluation.find({ interviewId: interview._id })
    ]);

    const questionsAnswered = answers.filter(a => !a.isSkipped && a.transcriptText?.trim()).length;
    const questionsSkipped = answers.filter(a => a.isSkipped).length;
    const totalQuestions = questions.length;

    // 3. Aggregate Dimension Scores & Overall Score
    let overallScore = 0;
    const dimensionScores = {
      relevance: 0,
      correctness: 0,
      completeness: 0,
      communication: 0,
      clarity: 0
    };
    const categoryTotals = {};
    let totalFillerWords = 0;
    let totalDurationSeconds = 0;

    for (const a of answers) {
      totalDurationSeconds += a.durationSeconds || 0;
    }

    for (const ev of evaluations) {
      overallScore += ev.overallScore;
      dimensionScores.relevance += ev.scores?.relevance || 0;
      dimensionScores.correctness += ev.scores?.correctness || 0;
      dimensionScores.completeness += ev.scores?.completeness || 0;
      dimensionScores.communication += ev.scores?.communication || 0;
      dimensionScores.clarity += ev.scores?.clarity || 0;
      totalFillerWords += ev.fillerWordAnalysis?.totalCount || 0;

      // Find question category
      const q = questions.find(item => item._id.toString() === ev.questionId.toString());
      const cat = q?.category || 'General';
      if (!categoryTotals[cat]) {
        categoryTotals[cat] = { sum: 0, count: 0 };
      }
      categoryTotals[cat].sum += ev.overallScore;
      categoryTotals[cat].count += 1;
    }

    const evalCount = evaluations.length;
    if (evalCount > 0) {
      overallScore = Math.round(overallScore / evalCount);
      dimensionScores.relevance = Math.round(dimensionScores.relevance / evalCount);
      dimensionScores.correctness = Math.round(dimensionScores.correctness / evalCount);
      dimensionScores.completeness = Math.round(dimensionScores.completeness / evalCount);
      dimensionScores.communication = Math.round(dimensionScores.communication / evalCount);
      dimensionScores.clarity = Math.round(dimensionScores.clarity / evalCount);
    } else {
      overallScore = 0;
    }

    // Category scores object
    const categoryScores = {};
    const strongestAreas = [];
    const weakestAreas = [];

    for (const [cat, data] of Object.entries(categoryTotals)) {
      const avg = Math.round(data.sum / data.count);
      categoryScores[cat] = avg;
      if (avg >= 75) {
        strongestAreas.push(cat);
      } else {
        weakestAreas.push(cat);
      }
    }

    // Summary Feedback
    let summaryFeedback = '';
    if (overallScore >= 80) {
      summaryFeedback = `Excellent performance on ${interview.title}. You demonstrated comprehensive technical depth, clear communication, and solid grasp of ${strongestAreas.slice(0, 2).join(', ') || 'core principles'}.`;
    } else if (overallScore >= 65) {
      summaryFeedback = `Good solid effort on ${interview.title}. Your answers showed working familiarity with the concepts, with room to provide deeper explanations and address edge cases.`;
    } else {
      summaryFeedback = `Practice session completed for ${interview.title}. Focus on structuring answers concisely and reviewing core expected concepts.`;
    }

    const actionableNextSteps = [
      weakestAreas.length > 0
        ? `Review deep-dive fundamentals in: ${weakestAreas.join(', ')}.`
        : 'Continue practicing advanced architectural trade-offs.',
      totalFillerWords > 5
        ? 'Work on minimizing conversational filler words through deliberate pacing and pauses.'
        : 'Maintain your clear and concise verbal cadence.'
    ];

    // 4. Save or update InterviewReport document
    const report = await InterviewReport.findOneAndUpdate(
      { interviewId: interview._id },
      {
        userId,
        overallScore,
        dimensionScores,
        categoryScores,
        totalQuestions,
        questionsAnswered,
        questionsSkipped,
        totalFillerWords,
        totalDurationSeconds,
        strongestAreas,
        weakestAreas,
        summaryFeedback,
        actionableNextSteps,
        generatedAt: new Date()
      },
      { upsert: true, returnDocument: 'after' }
    );

    // 5. Build question-by-question breakdown response
    const questionBreakdown = questions.map((q) => {
      const ans = answers.find(a => a.questionId.toString() === q._id.toString());
      const ev = evaluations.find(e => e.questionId.toString() === q._id.toString());

      return {
        questionId: q._id,
        orderIndex: q.orderIndex,
        questionText: q.questionText,
        category: q.category,
        difficulty: q.difficulty,
        expectedTopics: q.expectedTopics,
        rubricGuide: q.rubricGuide,
        answer: ans
          ? {
              answerId: ans._id,
              transcriptText: ans.transcriptText,
              durationSeconds: ans.durationSeconds,
              isSkipped: ans.isSkipped,
              inputMethod: ans.inputMethod,
              submittedAt: ans.submittedAt
            }
          : null,
        evaluation: ev
          ? {
              evaluationId: ev._id,
              evaluator: ev.evaluator,
              overallScore: ev.overallScore,
              scores: ev.scores,
              strengths: ev.strengths,
              weaknesses: ev.weaknesses,
              feedback: ev.feedback,
              idealAnswer: ev.idealAnswer,
              fillerWordAnalysis: ev.fillerWordAnalysis,
              grammarIssues: ev.grammarIssues,
              vocabularySuggestions: ev.vocabularySuggestions
            }
          : null
      };
    });

    return {
      report,
      interview,
      questionBreakdown
    };
  }

  /**
   * Generate or retrieve a secure public share token for the report
   */
  async generateShareToken(userId, interviewId) {
    const interview = await this._getVerifiedInterview(userId, interviewId);
    let report = await InterviewReport.findOne({ interviewId: interview._id });

    if (!report) {
      const generated = await this.generateOrGetReport(userId, interviewId);
      report = generated.report;
    }

    if (!report.shareToken) {
      report.shareToken = crypto.randomBytes(16).toString('hex');
    }
    report.isShared = true;
    await report.save();

    logger.info(`Share token generated for interview report ${report._id}`);
    return {
      shareToken: report.shareToken,
      isShared: report.isShared
    };
  }

  /**
   * Revoke public share access for a report
   */
  async revokeShareToken(userId, interviewId) {
    const interview = await this._getVerifiedInterview(userId, interviewId);
    const report = await InterviewReport.findOne({ interviewId: interview._id });

    if (!report) {
      const error = new Error('Report not found');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    report.isShared = false;
    await report.save();

    logger.info(`Share token revoked for interview report ${report._id}`);
    return { isShared: false };
  }

  /**
   * Retrieve public read-only shared report by token (no auth required)
   */
  async getPublicSharedReport(shareToken) {
    if (!shareToken || typeof shareToken !== 'string') {
      const error = new Error('Invalid share token');
      error.code = 'VALIDATION_ERROR';
      error.statusCode = 400;
      throw error;
    }

    const report = await InterviewReport.findOne({ shareToken, isShared: true });
    if (!report) {
      const error = new Error('Shared report not found or access has been revoked');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    const interview = await Interview.findById(report.interviewId).select('title type difficulty targetRole targetCompany createdAt');
    if (!interview) {
      const error = new Error('Associated interview session not found');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    const [questions, answers, evaluations] = await Promise.all([
      InterviewQuestion.find({ interviewId: interview._id }).sort({ orderIndex: 1 }).select('orderIndex questionText category difficulty expectedTopics rubricGuide'),
      InterviewAnswer.find({ interviewId: interview._id }).select('questionId transcriptText durationSeconds isSkipped inputMethod'),
      InterviewEvaluation.find({ interviewId: interview._id }).select('questionId evaluator overallScore scores strengths weaknesses feedback idealAnswer fillerWordAnalysis')
    ]);

    const questionBreakdown = questions.map((q) => {
      const ans = answers.find(a => a.questionId.toString() === q._id.toString());
      const ev = evaluations.find(e => e.questionId.toString() === q._id.toString());

      return {
        orderIndex: q.orderIndex,
        questionText: q.questionText,
        category: q.category,
        difficulty: q.difficulty,
        expectedTopics: q.expectedTopics,
        answer: ans ? {
          transcriptText: ans.transcriptText,
          durationSeconds: ans.durationSeconds,
          isSkipped: ans.isSkipped
        } : null,
        evaluation: ev ? {
          evaluator: ev.evaluator,
          overallScore: ev.overallScore,
          scores: ev.scores,
          strengths: ev.strengths,
          weaknesses: ev.weaknesses,
          feedback: ev.feedback,
          idealAnswer: ev.idealAnswer,
          fillerWordAnalysis: ev.fillerWordAnalysis
        } : null
      };
    });

    return {
      report: {
        overallScore: report.overallScore,
        dimensionScores: report.dimensionScores,
        categoryScores: report.categoryScores,
        totalQuestions: report.totalQuestions,
        questionsAnswered: report.questionsAnswered,
        questionsSkipped: report.questionsSkipped,
        totalFillerWords: report.totalFillerWords,
        totalDurationSeconds: report.totalDurationSeconds,
        strongestAreas: report.strongestAreas,
        weakestAreas: report.weakestAreas,
        summaryFeedback: report.summaryFeedback,
        actionableNextSteps: report.actionableNextSteps,
        generatedAt: report.generatedAt
      },
      interview,
      questionBreakdown
    };
  }
}

export const reportService = new ReportService();
export default reportService;
