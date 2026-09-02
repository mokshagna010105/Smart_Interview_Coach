import { z } from 'zod';
import AIProvider from './AIProvider.js';
import DeterministicQuestionGenerator from './DeterministicQuestionGenerator.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

const questionOutputSchema = z.array(
  z.object({
    questionText: z.string().min(10, 'Question text must be meaningful'),
    category: z.string().default('General'),
    difficulty: z.string().default('INTERMEDIATE'),
    expectedTopics: z.array(z.string()).default([]),
    rubricGuide: z.string().default('')
  })
);

export class GeminiProvider extends AIProvider {
  constructor() {
    super();
    this.apiKey = env.GEMINI_API_KEY || '';
    this.model = env.GEMINI_MODEL || 'gemini-1.5-flash';
  }

  /**
   * Generate interview questions using Google Gemini API or deterministic fallback
   * @param {object} config
   */
  async generateQuestions(config) {
    if (!this.apiKey) {
      logger.info('ℹ️ GEMINI_API_KEY is not configured in .env. Using high-fidelity deterministic question generator.');
      return DeterministicQuestionGenerator.generate(config);
    }

    try {
      const prompt = `You are a Senior Technical Interviewer conducting a mock interview.
Generate exactly ${config.questionCount} interview questions.

Interview Parameters:
- Type: ${config.type}
- Difficulty Level: ${config.difficulty}
- Candidate Target Role: ${config.targetRole}
- Target Company: ${config.targetCompany || 'Generic'}
- Primary Skills / Focus Areas: ${config.skillsFocus?.join(', ') || 'General software engineering principles'}
${config.resumeContext?.skills ? `- Resume Context Skills: ${config.resumeContext.skills.join(', ')}` : ''}

You MUST return a pure JSON array with no markdown backticks, matching this exact schema:
[
  {
    "questionText": "Detailed question text tailored to the role and difficulty",
    "category": "Topic category (e.g., System Design, Data Structures, STAR Behavioral, Problem Solving)",
    "difficulty": "${config.difficulty}",
    "expectedTopics": ["Key concept 1", "Key concept 2"],
    "rubricGuide": "Key evaluation criteria that an ideal answer must demonstrate"
  }
]`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: prompt }]
              }
            ],
            generationConfig: {
              temperature: 0.3,
              responseMimeType: 'application/json'
            }
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        logger.warn(`Gemini API returned status ${response.status}: ${errorText}. Falling back to deterministic generator.`);
        return DeterministicQuestionGenerator.generate(config);
      }

      const responseJson = await response.json();
      const rawText = responseJson.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error('Empty response from Gemini API');
      }

      // Parse JSON from text
      const cleanedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedJson);

      // Validate schema with Zod
      const validationResult = questionOutputSchema.safeParse(parsed);
      if (!validationResult.success) {
        logger.warn('Gemini response did not match expected schema. Falling back to deterministic generator.');
        return DeterministicQuestionGenerator.generate(config);
      }

      logger.info(`Generated ${validationResult.data.length} questions successfully using ${this.model}`);
      return validationResult.data.slice(0, config.questionCount);
    } catch (error) {
      logger.warn(`Gemini generation encountered an exception (${error.message}). Gracefully using deterministic generator.`);
      return DeterministicQuestionGenerator.generate(config);
    }
  }
}

export const geminiProvider = new GeminiProvider();
export default geminiProvider;
