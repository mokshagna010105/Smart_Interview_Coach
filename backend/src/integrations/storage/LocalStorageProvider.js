import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import StorageProvider from './StorageProvider.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export class LocalStorageProvider extends StorageProvider {
  constructor() {
    super();
    this.baseDir = path.resolve(env.STORAGE_LOCAL_DIR || './uploads');
    this.initStorageDir();
  }

  async initStorageDir() {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
      await fs.mkdir(path.join(this.baseDir, 'resumes'), { recursive: true });
    } catch (err) {
      logger.error('Failed to initialize local storage directory:', err.message);
    }
  }

  async saveFile(buffer, originalFilename, mimeType) {
    await this.initStorageDir();

    const fileExt = path.extname(originalFilename) || '.bin';
    const randomPrefix = crypto.randomBytes(16).toString('hex');
    const safeFilename = `${Date.now()}_${randomPrefix}${fileExt}`;
    const relativePath = path.join('resumes', safeFilename);
    const fullPath = path.join(this.baseDir, relativePath);

    await fs.writeFile(fullPath, buffer);

    return {
      storageKey: relativePath.replace(/\\/g, '/'),
      fileUrl: `/uploads/${relativePath.replace(/\\/g, '/')}`,
      fileSize: buffer.length
    };
  }

  async getFile(storageKey) {
    const fullPath = path.join(this.baseDir, storageKey);
    return await fs.readFile(fullPath);
  }

  async deleteFile(storageKey) {
    try {
      const fullPath = path.join(this.baseDir, storageKey);
      await fs.unlink(fullPath);
      return true;
    } catch (err) {
      logger.warn(`Could not delete file at storageKey ${storageKey}:`, err.message);
      return false;
    }
  }
}

export const localStorageProvider = new LocalStorageProvider();
export default localStorageProvider;
