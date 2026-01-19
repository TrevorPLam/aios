/**
 * Server Logger Utility
 *
 * Purpose (Plain English):
 * Provides structured logging for the server using Winston.
 * Logs are formatted as JSON in production for better parsing and analysis.
 * Console-friendly format in development for better readability.
 *
 * Features:
 * - Structured JSON logging in production
 * - Console-friendly format in development
 * - Multiple log levels (error, warn, info, debug)
 * - Automatic timestamp inclusion
 * - Error object serialization
 * - Context metadata support
 *
 * Usage Examples:
 * ```typescript
 * import { logger } from './utils/logger';
 *
 * // Basic logging
 * logger.info('Server started');
 * logger.error('Database connection failed');
 *
 * // With context metadata
 * logger.info('User login', { userId: '123', ip: '192.168.1.1' });
 * logger.error('API error', { endpoint: '/api/users', statusCode: 500 });
 *
 * // Error object logging
 * try {
 *   throw new Error('Something went wrong');
 * } catch (error) {
 *   logger.error('Operation failed', { error });
 * }
 * ```
 *
 * Configuration:
 * - LOG_LEVEL environment variable controls minimum log level
 * - NODE_ENV determines output format (json for production, console for dev)
 *
 * @module logger
 * @author AIOS Development Team
 * @version 1.0.0
 */

import * as winston from 'winston';

/**
 * Determine log level from environment variable, defaulting to 'info'
 */
const logLevel = process.env.LOG_LEVEL || 'info';

/**
 * Determine if we're in production environment
 */
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Custom format for console output in development
 * Provides human-readable logs with colors
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    // Append metadata if present
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

/**
 * JSON format for production logging
 * Enables structured log parsing and analysis
 */
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Winston logger instance
 * Configured based on environment (development vs production)
 */
export const logger = winston.createLogger({
  level: logLevel,
  format: isProduction ? jsonFormat : consoleFormat,
  defaultMeta: {
    service: 'aios-server',
  },
  transports: [
    new winston.transports.Console(),
  ],
});

/**
 * Log an informational message
 * Use for general application events and milestones
 *
 * @param message - The log message
 * @param meta - Optional metadata object
 *
 * @example
 * logger.info('Server started', { port: 3000 });
 */
export const logInfo = (message: string, meta?: Record<string, unknown>) => {
  logger.info(message, meta);
};

/**
 * Log a warning message
 * Use for potentially problematic situations that don't prevent operation
 *
 * @param message - The log message
 * @param meta - Optional metadata object
 *
 * @example
 * logger.warn('Rate limit approaching', { userId: '123', requestCount: 95 });
 */
export const logWarn = (message: string, meta?: Record<string, unknown>) => {
  logger.warn(message, meta);
};

/**
 * Log an error message
 * Use for error conditions that need attention
 *
 * @param message - The log message
 * @param meta - Optional metadata object (can include error object)
 *
 * @example
 * logger.error('Database connection failed', { error, retryAttempt: 3 });
 */
export const logError = (message: string, meta?: Record<string, unknown>) => {
  logger.error(message, meta);
};

/**
 * Log a debug message
 * Use for detailed diagnostic information
 *
 * @param message - The log message
 * @param meta - Optional metadata object
 *
 * @example
 * logger.debug('Cache miss', { key: 'user:123', ttl: 3600 });
 */
export const logDebug = (message: string, meta?: Record<string, unknown>) => {
  logger.debug(message, meta);
};
