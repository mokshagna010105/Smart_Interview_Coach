import multer from 'multer';
import { sendError } from '../utils/apiResponse.js';

// Use memory storage so we can parse and inspect the buffer immediately
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain'
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only PDF, DOCX, DOC, and TXT files are permitted.');
    error.code = 'FILE_UPLOAD_ERROR';
    cb(error, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB limit
  },
  fileFilter
});

/**
 * Single resume upload middleware wrapper with error interception
 */
export const uploadResumeFile = (req, res, next) => {
  const uploadSingle = upload.single('resume');

  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return sendError(res, 'FILE_UPLOAD_ERROR', 'File size exceeds maximum limit of 5MB', 400);
      }
      return sendError(res, 'FILE_UPLOAD_ERROR', `Upload error: ${err.message}`, 400);
    } else if (err) {
      return sendError(res, 'FILE_UPLOAD_ERROR', err.message, 400);
    }

    if (!req.file) {
      return sendError(res, 'VALIDATION_ERROR', 'No resume file uploaded. Please provide a file in the "resume" field.', 400);
    }

    next();
  });
};

export default uploadResumeFile;
