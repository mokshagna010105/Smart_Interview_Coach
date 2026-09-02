import { detectFillerWords } from '../../utils/fillerWordDetector.js';

export class DeterministicAnswerEvaluator {
  /**
   * Evaluate a candidate answer using transparent rule-based heuristics
   * @param {object} params
   * @param {string} params.interviewType - TECHNICAL | BEHAVIORAL | HR | CASE_STUDY
   * @param {string} params.difficulty - BEGINNER | INTERMEDIATE | ADVANCED | EXPERT
   * @param {string} params.questionText
   * @param {string} params.category
   * @param {string[]} params.expectedTopics
   * @param {string} params.rubricGuide
   * @param {string} params.transcriptText
   * @returns {object}
   */
  static evaluate(params) {
    const {
      interviewType = 'TECHNICAL',
      difficulty = 'INTERMEDIATE',
      questionText = '',
      category = 'General',
      expectedTopics = [],
      rubricGuide = '',
      transcriptText = ''
    } = params;

    const answer = (transcriptText || '').trim();
    const words = answer.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // 1. Detect Filler Words
    const fillerAnalysis = detectFillerWords(answer);

    // 2. Keyword / Expected Topics Match Ratio
    const matchedTopics = [];
    const missingTopics = [];

    if (expectedTopics.length > 0) {
      for (const topic of expectedTopics) {
        // Match topic as whole word or partial phrase
        const regex = new RegExp(`\\b${topic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(answer)) {
          matchedTopics.push(topic);
        } else {
          missingTopics.push(topic);
        }
      }
    }

    const topicMatchRatio = expectedTopics.length > 0 ? (matchedTopics.length / expectedTopics.length) : 0.7;

    // 3. Length & Depth Heuristic
    // Minimal answers (< 15 words) get low completeness
    let depthScore = 50;
    if (wordCount >= 100) depthScore = 92;
    else if (wordCount >= 60) depthScore = 84;
    else if (wordCount >= 30) depthScore = 72;
    else if (wordCount >= 15) depthScore = 60;
    else depthScore = 35;

    // 4. Dimension Calculations by Interview Type
    let relevanceScore = Math.min(100, Math.round(55 + topicMatchRatio * 40));
    let correctnessScore = Math.min(100, Math.round(50 + topicMatchRatio * 45));
    let completenessScore = Math.min(100, Math.round(depthScore * 0.6 + topicMatchRatio * 40));
    let communicationScore = Math.min(100, Math.max(30, Math.round(88 - fillerAnalysis.fillerPercentage * 3)));
    let clarityScore = Math.min(100, Math.round(wordCount > 20 ? 82 : 55));

    // Type Specific Enhancements
    const strengths = [];
    const weaknesses = [];
    const feedback = [];
    const grammarIssues = [];
    const vocabularySuggestions = [];

    if (interviewType === 'TECHNICAL') {
      if (matchedTopics.length > 0) {
        strengths.push(`Directly referenced key technical principles: ${matchedTopics.slice(0, 3).join(', ')}.`);
      }
      if (missingTopics.length > 0) {
        weaknesses.push(`Could elaborate further on core concepts such as ${missingTopics.slice(0, 3).join(', ')}.`);
        feedback.push(`Incorporate explicit explanations of ${missingTopics[0]} to demonstrate comprehensive depth.`);
      }
      if (wordCount >= 50) {
        strengths.push('Provided structured technical context with adequate depth.');
      } else {
        feedback.push('Elaborate on edge cases, runtime complexity (Big-O), and architectural trade-offs.');
      }
    } else if (interviewType === 'BEHAVIORAL') {
      // Check for STAR indicators
      const hasAction = /\b(i did|i led|i created|i resolved|i built|my role|i decided)\b/i.test(answer);
      const hasResult = /\b(result|outcome|improved|reduced|increased|delivered|success|impact|metric)\b/i.test(answer);

      if (hasAction) {
        strengths.push('Demonstrated strong personal ownership by highlighting specific actions taken.');
      } else {
        weaknesses.push('Response could more clearly define your specific individual contribution (Action in STAR).');
        feedback.push('Use "I" rather than "we" when detailing the critical decisions you spearheaded.');
      }

      if (hasResult) {
        strengths.push('Included measurable business impact or project outcomes.');
      } else {
        feedback.push('Conclude behavioral answers by quantifying the final outcome or lessons learned.');
      }
    } else if (interviewType === 'HR') {
      strengths.push('Maintained a conversational, professional tone.');
      feedback.push('Connect your personal motivation directly to the company mission and product milestones.');
    } else if (interviewType === 'CASE_STUDY') {
      strengths.push('Engaged with the core problem statement.');
      if (wordCount < 60) {
        weaknesses.push('Case study response is brief. Structured diagnostic steps are recommended.');
        feedback.push('Structure case studies into 3 phases: clarifying requirements, architectural breakdown, and bottleneck mitigation.');
      }
    }

    // Filler words feedback
    if (fillerAnalysis.totalCount > 3) {
      weaknesses.push(`Detected ${fillerAnalysis.totalCount} filler word(s) (${Object.keys(fillerAnalysis.breakdown).join(', ')}).`);
      feedback.push('Practice deliberate pauses instead of vocalizing filler words while structuring your next point.');
    }

    // Default fallback feedback if empty
    if (strengths.length === 0) strengths.push('Addressed the question promptly.');
    if (weaknesses.length === 0 && wordCount < 40) weaknesses.push('Answer could provide more granular detail.');
    if (feedback.length === 0) feedback.push('Continue practicing concise delivery with structured reasoning.');

    // Overall Score Calculation (Weighted)
    const overallScore = Math.min(
      100,
      Math.max(
        10,
        Math.round(
          relevanceScore * 0.3 +
          correctnessScore * 0.3 +
          completenessScore * 0.2 +
          communicationScore * 0.1 +
          clarityScore * 0.1
        )
      )
    );

    // Generate Ideal Answer
    const idealAnswer = `An ideal response to "${questionText}" covers:\n1. Direct concise summary.\n2. Technical breakdown addressing ${expectedTopics.slice(0, 3).join(', ') || 'underlying core principles'}.\n3. Real-world application, edge-case mitigation, and quantified impact.`;

    return {
      evaluator: 'deterministic_fallback',
      overallScore,
      scores: {
        relevance: relevanceScore,
        correctness: correctnessScore,
        completeness: completenessScore,
        communication: communicationScore,
        clarity: clarityScore
      },
      strengths,
      weaknesses,
      feedback,
      idealAnswer,
      fillerWordAnalysis: fillerAnalysis,
      grammarIssues,
      vocabularySuggestions
    };
  }
}

export default DeterministicAnswerEvaluator;
