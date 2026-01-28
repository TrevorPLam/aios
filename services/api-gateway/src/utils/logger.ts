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
 * Security Considerations:
 * - Never log sensitive data (passwords, tokens, API keys)
 * - Sanitize user inputs before logging
 * - Truncate large payloads to prevent log flooding
 *
 * @module logger
 * @author AIOS Development Team
 * @version 1.0.0
 */

/**
 * Governance & Best Practices
 *
 * Constitution (Article 2): Verifiable over Persuasive
 * - All changes must include verification evidence
 * - Proof beats persuasion - show test results, not assumptions
 *
 * Constitution (Article 6): Safety Before Speed
 * - Security, data integrity, and user safety take priority
 * - For risky changes: STOP → ASK (HITL) → VERIFY → THEN PROCEED
 *
 * Principles:
 * - Evidence Over Vibes (P6): Cite filepaths, show output, reference docs
 * - Assumptions Must Be Declared (P9): Document all assumptions explicitly
 * - Rollback Thinking (P12): Consider how to undo changes
 * - Respect Boundaries by Default (P13): Follow architectural boundaries
 *
 * Best Practices:
 * - Use existing patterns from similar files
 * - TypeScript strict mode (no `any` without justification)
 * - Validate inputs with Zod schemas (server) or TypeScript (client)
 * - Test user flows, not implementation details
 *
 * See: .repo/policy/constitution.json for full governance rules
 */

import * as winston from "winston";

/**
 * Determine log level from environment variable, defaulting to 'info'
 */
const logLevel = process.env.LOG_LEVEL || "info";

/**
 * Determine if we're in production environment
 */
const isProduction = process.env.NODE_ENV === "production";

/**
 * Custom format for console output in development
 * Provides human-readable logs with colors
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;

    // Append metadata if present (excluding service metadata)
    const { service, ...logMeta } = meta;
    if (Object.keys(logMeta).length > 0) {
      log += ` ${JSON.stringify(logMeta, null, 2)}`;
    }

    return log;
  }),
);

/**
 * JSON format for production logging
 * Enables structured log parsing and analysis
 */
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

/**
 * Winston logger instance
 * Configured based on environment (development vs production)
 *
 * Log Levels (in order of severity):
 * - error: Error conditions that need immediate attention
 * - warn: Warning conditions that should be investigated
 * - info: Informational messages for tracking application flow
 * - debug: Detailed debugging information (verbose)
 *
 * @example
 * logger.error('Database connection failed', { dbHost: 'localhost', error });
 * logger.info('Server started', { port: 5000, host: '0.0.0.0' });
 */
export const logger = winston.createLogger({
  level: logLevel,
  format: isProduction ? jsonFormat : consoleFormat,
  defaultMeta: {
    service: "aios-server",
  },
  transports: [new winston.transports.Console()],
});
