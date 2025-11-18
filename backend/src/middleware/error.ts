/**
 * @summary
 * Global error handling middleware
 * Processes all errors and returns standardized error responses
 *
 * @module middleware/error
 */

import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export const errorMiddleware = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = error.statusCode || 500;
  const errorCode = error.code || 'INTERNAL_SERVER_ERROR';
  const message = error.message || 'An unexpected error occurred';

  console.error('Error:', {
    code: errorCode,
    message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      details: error.details || undefined,
    },
    timestamp: new Date().toISOString(),
  });
};

export const StatusGeneralError: ApiError = {
  name: 'GeneralError',
  message: 'An unexpected error occurred',
  statusCode: 500,
  code: 'INTERNAL_SERVER_ERROR',
};
