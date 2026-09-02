export const SUBSCRIPTION_PLANS = Object.freeze({
  FREE: 'FREE',
  PREMIUM: 'PREMIUM'
});

export const PLAN_LIMITS = Object.freeze({
  [SUBSCRIPTION_PLANS.FREE]: {
    monthlyInterviews: 5,
    maxQuestionsPerInterview: 5,
    allowedTypes: ['TECHNICAL', 'BEHAVIORAL'],
    hasVoiceEvaluation: true,
    hasPdfExport: false
  },
  [SUBSCRIPTION_PLANS.PREMIUM]: {
    monthlyInterviews: 100,
    maxQuestionsPerInterview: 15,
    allowedTypes: ['TECHNICAL', 'BEHAVIORAL', 'HR', 'CASE_STUDY'],
    hasVoiceEvaluation: true,
    hasPdfExport: true
  }
});
