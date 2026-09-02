import { createRequire } from 'module';
import mammoth from 'mammoth';
import { logger } from '../utils/logger.js';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

// Comprehensive technical and soft skills dictionary
const SKILL_DICTIONARY = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin',
  'React', 'Next.js', 'Vue', 'Angular', 'Svelte', 'HTML', 'CSS', 'Tailwind CSS', 'Redux',
  'Node.js', 'Express.js', 'NestJS', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'GraphQL', 'REST APIs',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'SQLite', 'Prisma', 'Mongoose', 'DynamoDB',
  'Docker', 'Kubernetes', 'AWS', 'Google Cloud', 'GCP', 'Azure', 'CI/CD', 'GitHub Actions', 'Terraform',
  'Git', 'Linux', 'Microservices', 'System Design', 'Agile', 'Scrum', 'Kafka', 'RabbitMQ',
  'Unit Testing', 'Jest', 'Mocha', 'Cypress', 'Playwright', 'Vitest',
  'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'NLP', 'LLMs', 'Prompt Engineering',
  'Problem Solving', 'Leadership', 'Communication', 'Teamwork', 'Critical Thinking'
];

class ResumeParserService {
  /**
   * Extract raw text from uploaded file buffer based on MIME type
   * @param {Buffer} buffer
   * @param {string} mimeType
   * @returns {Promise<string>}
   */
  async extractRawText(buffer, mimeType) {
    try {
      if (mimeType === 'application/pdf') {
        const data = await pdfParse(buffer);
        return data.text || '';
      } else if (
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'application/msword'
      ) {
        const result = await mammoth.extractRawText({ buffer });
        return result.value || '';
      } else if (mimeType === 'text/plain') {
        return buffer.toString('utf-8');
      }

      return buffer.toString('utf-8');
    } catch (error) {
      logger.error('Error extracting raw text from resume:', error.message);
      throw new Error(`Failed to extract text from resume: ${error.message}`);
    }
  }

  /**
   * Parse structured entities (skills, experience, education, projects) from resume text
   * @param {string} rawText
   * @returns {object}
   */
  parseResumeStructure(rawText) {
    const cleanText = (rawText || '').replace(/\r\n/g, '\n').replace(/\t/g, ' ');

    // 1. Extract Skills via Dictionary Matching (Case-insensitive with word boundary)
    const detectedSkills = new Set();
    for (const skill of SKILL_DICTIONARY) {
      // Escape special regex chars like C++, Next.js, Node.js
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?:^|[\\s,;|/•])${escaped}(?:[\\s,;|/•]|$)`, 'i');
      if (regex.test(cleanText)) {
        detectedSkills.add(skill);
      }
    }

    // 2. Extract Experience Years (Estimate from date ranges or explicit statements)
    let experienceYears = 0;
    const yearMatches = cleanText.match(/\b(20[0-2][0-9]|19[8-9][0-9])\b/g);
    if (yearMatches && yearMatches.length >= 2) {
      const uniqueYears = [...new Set(yearMatches.map(Number))].sort((a, b) => a - b);
      const minYear = uniqueYears[0];
      const maxYear = Math.min(new Date().getFullYear(), uniqueYears[uniqueYears.length - 1]);
      if (maxYear >= minYear && maxYear - minYear <= 35) {
        experienceYears = maxYear - minYear;
      }
    }

    // Explicit mention e.g. "3+ years of experience"
    const expRegex = /(\d+)\+?\s*years?\s*(?:of)?\s*experience/i;
    const expMatch = cleanText.match(expRegex);
    if (expMatch && expMatch[1]) {
      const explicitExp = parseInt(expMatch[1], 10);
      if (explicitExp > 0 && explicitExp < 40) {
        experienceYears = Math.max(experienceYears, explicitExp);
      }
    }

    // 3. Extract Education Details
    const education = [];
    const eduRegex = /(?:Bachelor|Master|B\.?Tech|B\.?S\.?|M\.?S\.?|B\.?E\.?|Ph\.?D\.?|Degree|University|College|Institute)[\s\S]{1,120}?(?=(?:\n\n|\r\n\r\n|\n[A-Z]|$))/gi;
    const eduMatches = cleanText.match(eduRegex) || [];

    for (const match of eduMatches.slice(0, 3)) {
      const trimmed = match.trim().replace(/\s+/g, ' ');
      if (trimmed.length > 5) {
        const yearMatch = trimmed.match(/\b(20[0-2][0-9]|19[8-9][0-9])\b/);
        education.push({
          degree: trimmed.split(',')[0] || 'Degree',
          institution: trimmed.split(',')[1]?.trim() || 'Institution',
          graduationYear: yearMatch ? parseInt(yearMatch[0], 10) : undefined
        });
      }
    }

    // 4. Extract Projects
    const projects = [];
    const projectRegex = /(?:Projects?|Key Projects)[\s\S]{1,600}?(?=(?:\n[A-Z\s]{4,}|\n\n\n|$))/i;
    const projectSection = cleanText.match(projectRegex);
    if (projectSection) {
      const lines = projectSection[0].split('\n').map(l => l.trim()).filter(Boolean);
      for (const line of lines.slice(1, 4)) {
        if (line.length > 10 && !line.toLowerCase().includes('project')) {
          projects.push({
            title: line.slice(0, 60),
            technologies: Array.from(detectedSkills).slice(0, 4),
            description: line
          });
        }
      }
    }

    // 5. Extract Work History Highlights
    const workHistory = [];
    const workRegex = /(?:Experience|Work History|Employment)[\s\S]{1,800}?(?=(?:\n[A-Z\s]{4,}|\n\n\n|$))/i;
    const workSection = cleanText.match(workRegex);
    if (workSection) {
      const lines = workSection[0].split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length > 2) {
        workHistory.push({
          company: lines[1] || 'Software Company',
          role: 'Software Engineer',
          duration: `${experienceYears > 0 ? experienceYears + ' Years' : 'Recent'}`,
          highlights: lines.slice(2, 5)
        });
      }
    }

    return {
      skills: Array.from(detectedSkills),
      experienceYears,
      education,
      workHistory,
      projects
    };
  }
}

export const resumeParserService = new ResumeParserService();
export default resumeParserService;
