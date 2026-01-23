/**
 * Error Handler Middleware
 *
 * Purpose:
 * Centralized error handling for Express routes with structured logging.
 * Distinguishes between operational errors (expected) and unexpected errors.
 *
 * Features:
 * - AppError class for operational errors with status codes
 * - Structured error logging with request context
 * - Stack trace preservation for debugging
 * - User-friendly error messages (no sensitive data leakage)
 *
 * Usage:
 * ```typescript
 * // Throw operational error
 * throw new AppError(400, 'Invalid user input');
 *
 * // Use async handler for routes
 * app.get('/api/users', asyncHandler(async (req, res) => {
 *   const users = await db.users.getAll();
 *   res.json(users);
 * }));
 * ```
 *
 * @module errorHandler
 */

import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

/**
 * Custom error class for operational/expected errors.
 * These are errors that we anticipate and handle gracefully.
 *
 * @example
 * throw new AppError(404, 'User not found');
 * throw new AppError(400, 'Invalid email format');
 */
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

/**
 * Express error handler middleware.
 * Logs errors with context and returns appropriate HTTP responses.
 *
 * Operational errors (AppError):
 * - Logged as warnings with request context
 * - Return status code and message to client
 *
 * Unexpected errors:
 * - Logged as errors with full stack trace
 * - Return generic 500 error to client (no sensitive data)
 *
 * @param err - Error object (AppError or generic Error)
 * @param req - Express request object
 * @param res - Express response object
 * @param _next - Express next function (unused but required by Express signature)
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    // Log operational errors with context
    logger.warn("Operational error", {
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
  logger.error("Unexpected error", {
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

/**
 * Async handler wrapper for Express routes.
 * Automatically catches promise rejections and forwards to error handler.
 *
 * @param fn - Async route handler function
 * @returns Express middleware function
 *
 * @example
 * app.get('/api/users', asyncHandler(async (req, res) => {
 *   const users = await db.users.getAll();
 *   res.json(users);
 * }));
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
