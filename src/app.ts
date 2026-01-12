import express, { type Application } from 'express';
// import helmet from 'helmet';
import cors from 'cors';
// import compression from 'compression';
// import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { requestLogger } from './middlewares/logger.js';
import healthRouter from './routes/health.js';
import documentRouter from './routes/document.js';

const app: Application = express();

// Security middleware
// app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(','),  // Supports multiple origins
    credentials: true,
  })
);

// Rate limiting
// const limiter = rateLimit({
//   windowMs: env.RATE_LIMIT_WINDOW_MS,
//   max: env.RATE_LIMIT_MAX_REQUESTS,
//   message: 'Too many requests from this IP, please try again later.',
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
// app.use(compression());

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
