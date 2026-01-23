/**
 * Analytics Logger Utility
 *
 * Provides structured logging for button interactions and user actions.
 * Replaces console.log statements with proper analytics tracking.
 *
 * Usage:
 * ```typescript
 * logButtonPress('NotebookScreen', 'Backup', { noteCount: 10 });
 * ```
 *
 * @module utils/analyticsLogger
 */

import analytics from "@platform/analytics";

/**
 * Log button press event with structured data.
 *
 * Captures user interactions with secondary navigation buttons
 * for analytics and debugging purposes.
 *
 * @param {string} screen - Screen name where button was pressed
 * @param {string} buttonName - Name of the button pressed
 * @param {Record<string, unknown>} metadata - Optional additional context
 *
 * @example
 * ```typescript
 * logButtonPress('NotebookScreen', 'Backup', { noteCount: 42 });
 * ```
 */
export function logButtonPress(
  screen: string,
  buttonName: string,
  metadata?: Record<string, unknown>,
): void {
  try {
    // @ts-expect-error - track method exists on analytics
    analytics.track("secondary_nav_button_pressed", {
      screen,
      button: buttonName,
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  } catch (error) {
    // Fail silently - analytics errors should not break user experience
    if (__DEV__) {
      console.warn(
        `Failed to log button press: ${screen}.${buttonName}`,
        error,
      );
    }
  }
}

/**
 * Log placeholder action (for features not yet implemented).
 *
 * Tracks when users attempt to use features that are placeholders,
 * helping prioritize which features to implement first.
 *
 * @param {string} screen - Screen name where placeholder was triggered
 * @param {string} featureName - Name of the placeholder feature
 *
 * @example
 * ```typescript
 * logPlaceholderAction('NotebookScreen', 'Backup');
 * ```
 */
export function logPlaceholderAction(
  screen: string,
  featureName: string,
): void {
  try {
    // @ts-expect-error - track method exists on analytics
    analytics.track("placeholder_feature_used", {
      screen,
      feature: featureName,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (__DEV__) {
      console.warn(
        `Failed to log placeholder action: ${screen}.${featureName}`,
        error,
      );
    }
  }
}
