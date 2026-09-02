import mongoose from 'mongoose';
import Interview from '../models/Interview.js';
import InterviewReport from '../models/InterviewReport.js';
import InterviewEvaluation from '../models/InterviewEvaluation.js';

class AnalyticsService {
  /**
   * Compute comprehensive analytics for a user based on real database records
   * @param {string} userId
   */
  async getUserAnalytics(userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1. Fetch total & completed counts
    const [totalInterviews, completedInterviews] = await Promise.all([
      Interview.countDocuments({ userId: userObjectId }),
      Interview.countDocuments({ userId: userObjectId, status: 'COMPLETED' })
    ]);

    // 2. Aggregate Reports for score progression and metrics
    const reports = await InterviewReport.find({ userId: userObjectId })
      .populate('interviewId', 'title type difficulty createdAt')
      .sort({ generatedAt: 1 });

    if (reports.length === 0) {
      return {
        totalInterviews,
        completedInterviews,
        averageOverallScore: 0,
        scoreHistory: [],
        scoresByType: { TECHNICAL: 0, BEHAVIORAL: 0, HR: 0, CASE_STUDY: 0 },
        scoresByDifficulty: { BEGINNER: 0, INTERMEDIATE: 0, ADVANCED: 0, EXPERT: 0 },
        questionsMetrics: { totalAnswered: 0, totalSkipped: 0, totalQuestions: 0, avgFillerWords: 0 },
        topStrengths: [],
        topWeaknesses: []
      };
    }

    // 3. Score History for Recharts Line Chart
    const scoreHistory = reports.map((rep) => ({
      reportId: rep._id,
      interviewId: rep.interviewId?._id || rep.interviewId,
      title: rep.interviewId?.title || 'Mock Interview',
      type: rep.interviewId?.type || 'TECHNICAL',
      difficulty: rep.interviewId?.difficulty || 'INTERMEDIATE',
      score: rep.overallScore,
      date: new Date(rep.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));

    // 4. Overall Average
    const totalScore = reports.reduce((acc, curr) => acc + curr.overallScore, 0);
    const averageOverallScore = Math.round(totalScore / reports.length);

    // 5. Scores by Interview Type
    const typeSums = { TECHNICAL: { sum: 0, count: 0 }, BEHAVIORAL: { sum: 0, count: 0 }, HR: { sum: 0, count: 0 }, CASE_STUDY: { sum: 0, count: 0 } };
    const diffSums = { BEGINNER: { sum: 0, count: 0 }, INTERMEDIATE: { sum: 0, count: 0 }, ADVANCED: { sum: 0, count: 0 }, EXPERT: { sum: 0, count: 0 } };

    let totalAnswered = 0;
    let totalSkipped = 0;
    let totalQuestions = 0;
    let totalFillerWords = 0;

    const allStrengths = [];
    const allWeaknesses = [];

    for (const rep of reports) {
      const itype = rep.interviewId?.type;
      const idiff = rep.interviewId?.difficulty;

      if (itype && typeSums[itype]) {
        typeSums[itype].sum += rep.overallScore;
        typeSums[itype].count += 1;
      }

      if (idiff && diffSums[idiff]) {
        diffSums[idiff].sum += rep.overallScore;
        diffSums[idiff].count += 1;
      }

      totalAnswered += rep.questionsAnswered || 0;
      totalSkipped += rep.questionsSkipped || 0;
      totalQuestions += rep.totalQuestions || 0;
      totalFillerWords += rep.totalFillerWords || 0;

      if (rep.strongestAreas) allStrengths.push(...rep.strongestAreas);
      if (rep.weakestAreas) allWeaknesses.push(...rep.weakestAreas);
    }

    const scoresByType = {};
    for (const [key, val] of Object.entries(typeSums)) {
      scoresByType[key] = val.count > 0 ? Math.round(val.sum / val.count) : 0;
    }

    const scoresByDifficulty = {};
    for (const [key, val] of Object.entries(diffSums)) {
      scoresByDifficulty[key] = val.count > 0 ? Math.round(val.sum / val.count) : 0;
    }

    // Unique top strengths and weaknesses
    const topStrengths = [...new Set(allStrengths)].slice(0, 5);
    const topWeaknesses = [...new Set(allWeaknesses)].slice(0, 5);

    const avgFillerWords = reports.length > 0 ? Number((totalFillerWords / reports.length).toFixed(1)) : 0;

    return {
      totalInterviews,
      completedInterviews,
      averageOverallScore,
      scoreHistory,
      scoresByType,
      scoresByDifficulty,
      questionsMetrics: {
        totalAnswered,
        totalSkipped,
        totalQuestions,
        avgFillerWords
      },
      topStrengths,
      topWeaknesses
    };
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
