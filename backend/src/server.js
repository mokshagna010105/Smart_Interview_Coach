import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 InterviewAI Backend Server running on http://localhost:${PORT}`);
  logger.info(`📡 Environment: ${env.NODE_ENV}`);
  logger.info(`🩺 Health Check: http://localhost:${PORT}/api/v1/health`);
});

// Graceful Shutdown Handling
const handleGracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed successfully.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
