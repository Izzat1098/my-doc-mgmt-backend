import type { Request, Response, NextFunction } from 'express';

interface ErrorResponse {
  error: {
    message: string;
    status: number;
    timestamp: string;
    path?: string;
  };
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message =
    err instanceof AppError ? err.message : 'Internal Server Error';

  const errorResponse: ErrorResponse = {
    error: {
      message,
      status: statusCode,
      timestamp: new Date().toISOString(),
      path: req.path,
    },
  };

  // Log error for debugging in development
  if (process.env['NODE_ENV'] === 'development') {
    console.error('Error:', err);
  }

  res.status(statusCode).json(errorResponse);
};

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(new AppError(404, `Route ${req.originalUrl} not found`));
};
