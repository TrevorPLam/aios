/**
 * Client Logger Utility
 *
 * Purpose (Plain English):
 * Provides structured logging for the React Native client.
 * In development, logs to console with formatting.
 * In production, can be configured to send logs to remote service.
 *
 * Features:
 * - Multiple log levels (error, warn, info, debug)
 * - Automatic timestamp inclusion
 * - Context metadata support
 * - Environment-aware logging (verbose in dev, minimal in prod)
 * - Type-safe logging
 *
 * Usage Examples:
 * ```typescript
 * import { logger } from '@aios/platform/lib/logger';
 *
 * // Basic logging
 * logger.info('MemoryManager', 'Initialized with strategy', { strategy: 'balanced' });
 * logger.error('PrefetchEngine', 'Failed to prefetch', { moduleId: 'calendar', error });
 *
 * // With context
 * logger.debug('LazyLoader', 'Preloaded module', { moduleId: 'photos', size: '2.5MB' });
 * ```
 *
 * Security Considerations:
 * - Never log sensitive data (passwords, tokens, API keys, PII)
 * - Sanitize user inputs before logging
 * - In production, logs should be minimal to avoid performance impact
 *
 * @module logger
 * @author AIOS Development Team
 * @version 1.0.0
 */

/**
 * Log level enum
 */
export enum LogLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
}

/**
 * Log entry structure
 */
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  metadata?: Record<string, unknown>;
}

/**
 * Logger configuration
 */
interface LoggerConfig {
  minLevel: LogLevel;
  isDevelopment: boolean;
  enableRemoteLogging: boolean;
}

/**
 * Logger class
 */
class Logger {
  private config: LoggerConfig;

  constructor() {
    this.config = {
      minLevel: __DEV__ ? LogLevel.DEBUG : LogLevel.WARN,
      isDevelopment: __DEV__,
      enableRemoteLogging: false, // TODO: Enable when analytics backend is ready
    };
  }

  /**
   * Check if a log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [
      LogLevel.ERROR,
      LogLevel.WARN,
      LogLevel.INFO,
      LogLevel.DEBUG,
    ];
    const minIndex = levels.indexOf(this.config.minLevel);
    const levelIndex = levels.indexOf(level);
    return levelIndex <= minIndex;
  }

  /**
   * Format log entry for console output
   */
  private formatForConsole(entry: LogEntry): string {
    const emoji = {
      [LogLevel.ERROR]: "❌",
      [LogLevel.WARN]: "⚠️",
      [LogLevel.INFO]: "ℹ️",
      [LogLevel.DEBUG]: "🔍",
    }[entry.level];

    let output = `${emoji} [${entry.component}] ${entry.message}`;

    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      output += `\n  ${JSON.stringify(entry.metadata, null, 2)}`;
    }

    return output;
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    component: string,
    message: string,
    metadata?: Record<string, unknown>,
  ): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      metadata,
    };

    // Console output in development
    if (this.config.isDevelopment) {
      const formatted = this.formatForConsole(entry);
      switch (level) {
        case LogLevel.ERROR:
          console.error(formatted);
          break;
        case LogLevel.WARN:
          console.warn(formatted);
          break;
        case LogLevel.INFO:
          console.info(formatted);
          break;
        case LogLevel.DEBUG:
          console.log(formatted);
          break;
      }
    }

    // Remote logging in production (if enabled)
    if (this.config.enableRemoteLogging && !this.config.isDevelopment) {
      // TODO: Send to analytics backend
      // analytics.logEvent('app_log', { ...entry });
    }
  }

  /**
   * Log error message
   */
  error(
    component: string,
    message: string,
    metadata?: Record<string, unknown>,
  ): void {
    this.log(LogLevel.ERROR, component, message, metadata);
  }

  /**
   * Log warning message
   */
  warn(
    component: string,
    message: string,
    metadata?: Record<string, unknown>,
  ): void {
    this.log(LogLevel.WARN, component, message, metadata);
  }

  /**
   * Log info message
   */
  info(
    component: string,
    message: string,
    metadata?: Record<string, unknown>,
  ): void {
    this.log(LogLevel.INFO, component, message, metadata);
  }

  /**
   * Log debug message
   */
  debug(
    component: string,
    message: string,
    metadata?: Record<string, unknown>,
  ): void {
    this.log(LogLevel.DEBUG, component, message, metadata);
  }

  /**
   * Update logger configuration
   */
  setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Singleton logger instance
 */
export const logger = new Logger();
