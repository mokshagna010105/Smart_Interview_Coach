import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/tokenUtils.js';
import interviewService from '../services/interviewService.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Initialize Socket.io Server with authentication and interview handlers
 * @param {import('http').Server} httpServer
 */
export const initSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  // Socket Authentication Middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication token required for WebSocket connection'));
      }

      const decoded = verifyAccessToken(token);
      socket.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };
      next();
    } catch (err) {
      logger.warn(`Socket authentication failed: ${err.message}`);
      next(new Error('Invalid socket authentication credentials'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.userId;
    logger.info(`🔌 Socket connected: user ${userId} (socket ID: ${socket.id})`);

    // Join Interview Room
    socket.on('interview:join', async ({ interviewId }, callback) => {
      try {
        const interviewData = await interviewService.getInterviewById(userId, interviewId);
        const roomName = `interview_${interviewId}`;
        socket.join(roomName);

        logger.info(`User ${userId} joined room ${roomName}`);
        if (typeof callback === 'function') {
          callback({ success: true, data: interviewData });
        }
      } catch (err) {
        logger.error(`Error joining interview socket room: ${err.message}`);
        if (typeof callback === 'function') {
          callback({ success: false, error: err.message });
        }
      }
    });

    // Start Interview Event
    socket.on('interview:start', async ({ interviewId }, callback) => {
      try {
        const updated = await interviewService.startInterview(userId, interviewId);
        io.to(`interview_${interviewId}`).emit('interview:started', { interview: updated });
        if (typeof callback === 'function') callback({ success: true, interview: updated });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // Pause Interview Event
    socket.on('interview:pause', async ({ interviewId }, callback) => {
      try {
        const updated = await interviewService.pauseInterview(userId, interviewId);
        io.to(`interview_${interviewId}`).emit('interview:paused', { interview: updated });
        if (typeof callback === 'function') callback({ success: true, interview: updated });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // Resume Interview Event
    socket.on('interview:resume', async ({ interviewId }, callback) => {
      try {
        const updated = await interviewService.resumeInterview(userId, interviewId);
        io.to(`interview_${interviewId}`).emit('interview:resumed', { interview: updated });
        if (typeof callback === 'function') callback({ success: true, interview: updated });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // Answer Submit Event
    socket.on('interview:answer', async ({ interviewId, payload }, callback) => {
      try {
        const result = await interviewService.submitAnswer(userId, interviewId, payload);
        io.to(`interview_${interviewId}`).emit('interview:answered', result);
        if (typeof callback === 'function') callback({ success: true, result });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // Skip Question Event
    socket.on('interview:skip', async ({ interviewId, payload }, callback) => {
      try {
        const result = await interviewService.skipQuestion(userId, interviewId, payload);
        io.to(`interview_${interviewId}`).emit('interview:skipped', result);
        if (typeof callback === 'function') callback({ success: true, result });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // Complete Event
    socket.on('interview:complete', async ({ interviewId }, callback) => {
      try {
        const updated = await interviewService.completeInterview(userId, interviewId);
        io.to(`interview_${interviewId}`).emit('interview:completed', { interview: updated });
        if (typeof callback === 'function') callback({ success: true, interview: updated });
      } catch (err) {
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`🔌 Socket disconnected: user ${userId}`);
    });
  });

  return io;
};

export default initSocketServer;
