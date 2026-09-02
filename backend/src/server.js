import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { logger } from './utils/logger.js';

const PORT = env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDatabase();

    // 2. Start HTTP Listener
    const server = app.listen(PORT, () => {
      logger.info(`🚀 InterviewAI Backend Server running on http://localhost:${PORT}`);
      logger.info(`📡 Environment: ${env.NODE_ENV}`);
      logger.info(`🩺 Health Check: http://localhost:${PORT}/api/v1/health`);
    });

    // 3. Graceful Shutdown
    const handleGracefulShutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDatabase();
        logger.info('HTTP server and Database connections closed successfully.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
  } catch (err) {
    logger.error('Failed to start server:', err.message);
    // In dev, keep server running or exit
  }
};

startServer();
