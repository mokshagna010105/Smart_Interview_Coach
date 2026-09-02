/**
 * Abstract Base Class for AI Providers
 */
export class AIProvider {
  /**
   * Generate structured interview questions based on candidate configuration
   * @param {object} config
   * @param {string} config.type - TECHNICAL | BEHAVIORAL | HR | CASE_STUDY
   * @param {string} config.difficulty - BEGINNER | INTERMEDIATE | ADVANCED | EXPERT
   * @param {string} config.targetRole - e.g. Full Stack Software Engineer
   * @param {string} config.targetCompany - e.g. Google, Amazon, Generic
   * @param {string[]} config.skillsFocus - Array of skill strings
   * @param {number} config.questionCount - Number of questions to generate
   * @param {object} [config.resumeContext] - Optional parsed resume skills/experience
   * @returns {Promise<Array<{ questionText: string, category: string, difficulty: string, expectedTopics: string[], rubricGuide: string }>>}
   */
  async generateQuestions(config) {
    throw new Error('generateQuestions method must be implemented by AIProvider subclass');
  }
}

export default AIProvider;
