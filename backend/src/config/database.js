import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

/**
 * Connect to MongoDB database with retry logic
 * @returns {Promise<typeof mongoose>}
 */
export const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      autoIndex: true, // Build indexes automatically in development
      serverSelectionTimeoutMS: 5000,
    });

    logger.info(`📦 MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    logger.error(`❌ MongoDB Connection Error: ${error.message}`);
    // In production, you may want to exit or retry
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
    throw error;
  }
};

/**
 * Gracefully disconnect from MongoDB
 */
export const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    logger.info('📦 MongoDB Disconnected successfully');
  } catch (error) {
    logger.error(`❌ Error disconnecting MongoDB: ${error.message}`);
  }
};

// Listen to connection events
mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️ MongoDB connection lost. Reconnecting...');
});

mongoose.connection.on('error', (err) => {
  logger.error(`❌ MongoDB runtime error: ${err.message}`);
});
