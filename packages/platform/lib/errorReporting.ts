/**
 * Error Reporting Utility
 *
 * Captures and tracks errors across the application for monitoring and debugging.
 * Integrates with analytics to provide visibility into production issues.
 */

import analytics from "@platform/analytics";

// Type declarations for React Native's ErrorUtils
declare const ErrorUtils:
  | {
      setGlobalHandler: (
        handler: (error: Error, isFatal?: boolean) => void,
      ) => void;
      getGlobalHandler: () =>
        | ((error: Error, isFatal?: boolean) => void)
        | undefined;
    }
  | undefined;

class ErrorReporting {
  /**
   * Track unhandled promise rejections
   * These indicate async operations that failed without proper error handling
   */
  trackUnhandledRejection(reason: any, promise: Promise<any>) {
    console.error("Unhandled rejection:", reason);
    // @ts-expect-error - trackError method exists on analytics
    analytics.trackError("unhandled_rejection", {
      reason: String(reason),
      stack: reason?.stack,
    });
  }

  /**
   * Track global uncaught errors
   * These are errors that weren't caught by try/catch or error boundaries
   */
  trackGlobalError(error: Error) {
    console.error("Global error:", error);
    // @ts-expect-error - trackError method exists on analytics
    analytics.trackError("global_error", {
      message: error.message,
      stack: error.stack,
    });
  }

  /**
   * Track screen-level errors caught by ErrorBoundary
   * Includes screen context to help identify problem areas
   */
  trackScreenError(screenName: string, error: Error) {
    console.error(`Screen error (${screenName}):`, error);
    // @ts-expect-error - trackError method exists on analytics
    analytics.trackError("screen_error", {
      screen: screenName,
      message: error.message,
      stack: error.stack,
    });
  }

  /**
   * Track event listener failures in EventBus
   * These indicate async event handlers that threw errors
   */
  trackEventListenerFailure(eventType: string, error: Error) {
    console.error(`Event listener failure (${eventType}):`, error);
    // @ts-expect-error - trackError method exists on analytics
    analytics.trackError("event_listener_failure", {
      eventType,
      message: error.message,
      stack: error.stack,
    });
  }
}

export const errorReporting = new ErrorReporting();

// Install global error handlers for React Native environment
if (typeof ErrorUtils !== "undefined") {
  // React Native error handler
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    errorReporting.trackGlobalError(error);
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });
}
