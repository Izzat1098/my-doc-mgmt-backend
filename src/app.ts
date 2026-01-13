import express, { type Application } from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { requestLogger } from './middlewares/logger.js';
import healthRouter from './routes/health.js';
import documentRouter from './routes/document.js';

const app: Application = express();

// CORS configuration
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(','),  // Supports multiple origins
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Custom middleware
app.use(requestLogger);

// Routes
app.use('/api/health', healthRouter);
app.use('/api/documents', documentRouter);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;
