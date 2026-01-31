/**
 * Logging utilities
 *
 * For now, this re-exports from @aios/platform.
 * In the future, logging utilities can be moved here for better separation.
 */

// Re-export from platform for backward compatibility
// TODO: Migrate logging utilities from @aios/platform to here
export { logger, LogLevel } from "@aios/platform";
