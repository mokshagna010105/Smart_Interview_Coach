import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import rootRouter from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// Security Headers
app.use(helmet());

// CORS Configuration
app.use(cors({
  origin: env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsers & Cookie Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static uploads route for dev storage
app.use('/uploads', express.static(env.STORAGE_LOCAL_DIR || './uploads'));

// HTTP Request Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// API v1 Routes Mount
app.use('/api/v1', rootRouter);

// Fallback for root /
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Smart Interview Coach (InterviewAI) API',
    documentation: '/api/v1/health',
    status: 'online'
  });
});

// Centralized 404 and Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
