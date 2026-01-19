import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    // Log operational errors with context
    logger.warn('Operational error', {
      statusCode: err.statusCode,
      message: err.message,
      path: req.path,
      method: req.method,
    });
    
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  // Log unexpected errors with full context and stack trace
  logger.error('Unexpected error', {
    error: err,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
  
  return res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
