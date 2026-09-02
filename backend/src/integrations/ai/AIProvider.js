/**
 * Abstract Base Class for AI Providers
 */
export class AIProvider {
  /**
   * Generate structured interview questions based on candidate configuration
   * @param {object} config
   * @returns {Promise<Array<{ questionText: string, category: string, difficulty: string, expectedTopics: string[], rubricGuide: string }>>}
   */
  async generateQuestions(config) {
    throw new Error('generateQuestions method must be implemented by AIProvider subclass');
  }

  /**
   * Evaluate a candidate answer and generate scorecards, rubrics, and ideal answer
   * @param {object} params
   * @returns {Promise<object>}
   */
  async evaluateAnswer(params) {
    throw new Error('evaluateAnswer method must be implemented by AIProvider subclass');
  }
}

export default AIProvider;
