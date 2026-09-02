import Resume from '../models/Resume.js';
import Profile from '../models/Profile.js';
import localStorageProvider from '../integrations/storage/LocalStorageProvider.js';
import resumeParserService from '../services/resumeParserService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

class ResumeController {
  /**
   * Upload, store, and parse resume file
   */
  async uploadResume(req, res, next) {
    try {
      const { file, user } = req;
      if (!file) {
        return sendError(res, 'VALIDATION_ERROR', 'No resume file provided', 400);
      }

      // 1. Save file to storage provider
      const storageResult = await localStorageProvider.saveFile(
        file.buffer,
        file.originalname,
        file.mimetype
      );

      // 2. Extract raw text from file buffer
      const rawText = await resumeParserService.extractRawText(file.buffer, file.mimetype);

      // 3. Parse structured data
      const parsedData = resumeParserService.parseResumeStructure(rawText);

      // Check if this is the user's first resume (if so, make default)
      const resumeCount = await Resume.countDocuments({ userId: user.userId });
      const isDefault = resumeCount === 0;

      // 4. Save Resume document in MongoDB
      const resume = await Resume.create({
        userId: user.userId,
        originalFilename: file.originalname,
        fileSize: storageResult.fileSize,
        mimeType: file.mimetype,
        storageKey: storageResult.storageKey,
        rawText,
        parsedData,
        isDefault
      });

      // 5. Optionally enrich profile with extracted skills if profile has few or no skills
      if (parsedData.skills && parsedData.skills.length > 0) {
        const profile = await Profile.findOne({ userId: user.userId });
        if (profile) {
          const mergedSkills = [...new Set([...profile.primarySkills, ...parsedData.skills])];
          profile.primarySkills = mergedSkills.slice(0, 15);
          await profile.save();
        }
      }

      logger.info(`Resume uploaded and parsed for user ${user.userId}: ${file.originalname}`);

      return sendSuccess(res, resume, 'Resume uploaded and parsed successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all resumes uploaded by the current user
   */
  async listResumes(req, res, next) {
    try {
      const resumes = await Resume.find({ userId: req.user.userId })
        .select('-rawText') // Exclude heavy raw text from list view
        .sort({ createdAt: -1 });

      return sendSuccess(res, resumes, 'Resumes retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single resume with parsed details
   */
  async getResume(req, res, next) {
    try {
      const { resumeId } = req.params;
      const resume = await Resume.findOne({ _id: resumeId, userId: req.user.userId });

      if (!resume) {
        return sendError(res, 'NOT_FOUND', 'Resume not found', 404);
      }

      return sendSuccess(res, resume, 'Resume retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Set a specific resume as default
   */
  async setDefaultResume(req, res, next) {
    try {
      const { resumeId } = req.params;
      const resume = await Resume.findOne({ _id: resumeId, userId: req.user.userId });

      if (!resume) {
        return sendError(res, 'NOT_FOUND', 'Resume not found', 404);
      }

      resume.isDefault = true;
      await resume.save();

      return sendSuccess(res, resume, 'Default resume updated successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a resume and its storage file
   */
  async deleteResume(req, res, next) {
    try {
      const { resumeId } = req.params;
      const resume = await Resume.findOne({ _id: resumeId, userId: req.user.userId });

      if (!resume) {
        return sendError(res, 'NOT_FOUND', 'Resume not found', 404);
      }

      // Delete file from storage
      await localStorageProvider.deleteFile(resume.storageKey);

      // Delete MongoDB document
      await Resume.deleteOne({ _id: resume._id });

      return sendSuccess(res, null, 'Resume deleted successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}

export const resumeController = new ResumeController();
export default resumeController;
