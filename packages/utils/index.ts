/**
 * Shared utilities package
 *
 * This package contains reusable utility functions organized by category:
 * - logging: Structured logging utilities
 * - error-handling: Error handling and reporting utilities
 * - validation: Data validation utilities
 */

export * from "./logging";

// Backward-compatible re-export from platform.
export { errorReporting } from "@aios/platform/lib/errorReporting";
