/**
 * Analytics - Public API
 *
 * Exported singleton analytics client with convenience methods for common events.
 * This is the main entry point for instrumentation throughout the app.
 */

import { ModuleType } from "@aios/contracts/models/types";
import { AnalyticsClient } from "./client";
import {
  EventName,
  EventPropsMap,
  NavigationSource,
  SelectionState,
  ConfidenceBucket,
  LatencyBucket,
  AmountBucket,
  NetworkState,
  InstallAgeBucket,
} from "./types";
import {
  getDurationBucket,
  getLatencyBucket,
  getAmountBucket,
  getTextLengthBucket,
  getQueryLengthBucket,
  getResultsCountBucket,
  getInstallAgeBucket,
} from "./sanitizer";

// ============================================================================
// Singleton Instance
// ============================================================================

let analyticsInstance: AnalyticsClient | null = null;

/**
 * Get or create analytics singleton instance
 */
function getAnalytics(): AnalyticsClient {
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsClient({
      enabled: process.env.EXPO_PUBLIC_ANALYTICS_ENABLED !== "false",
      debugMode: __DEV__,
    });
  }
  return analyticsInstance;
}

// ============================================================================
// Core API
// ============================================================================

export async function log<T extends EventName>(
  eventName: T,
  props: EventPropsMap[T],
): Promise<void> {
  await getAnalytics().log(eventName, props);
}

export async function initialize(): Promise<void> {
  await getAnalytics().initialize();
}

export async function flush(): Promise<void> {
  await getAnalytics().flush();
}

export async function enablePrivacyMode(): Promise<void> {
  await getAnalytics().enablePrivacyMode();
}

export async function disablePrivacyMode(): Promise<void> {
  await getAnalytics().disablePrivacyMode();
}

export function isPrivacyModeEnabled(): boolean {
  return getAnalytics().isPrivacyModeEnabled();
}

export async function shutdown(): Promise<void> {
  await getAnalytics().shutdown();
}

// ============================================================================
// Convenience Methods - Lifecycle
// ============================================================================

export async function trackAppOpened(
  installAgeDays: number,
  networkState: NetworkState,
): Promise<void> {
  await log("app_opened", {
    install_age_bucket: getInstallAgeBucket(installAgeDays),
    network_state: networkState,
  });
}

export async function trackSessionStart(): Promise<void> {
  await getAnalytics().trackSessionStart();
}

export async function trackSessionEnd(): Promise<void> {
  await getAnalytics().trackSessionEnd();
}

export async function trackAppBackgrounded(): Promise<void> {
  await log("app_backgrounded", {});
}

// ============================================================================
// Convenience Methods - Navigation / Modules
// ============================================================================

export async function trackModuleOpened(
  moduleId: ModuleType,
  source: NavigationSource,
): Promise<void> {
  await log("module_opened", { module_id: moduleId, source });
}

export async function trackModuleClosed(moduleId: ModuleType): Promise<void> {
  await log("module_closed", { module_id: moduleId });
}

// Export types for external use
export * from "./types";
export * from "./sanitizer";
export * from "./registry";

// Export default as namespace
export default {
  log,
  initialize,
  flush,
  enablePrivacyMode,
  disablePrivacyMode,
  isPrivacyModeEnabled,
  shutdown,
  trackAppOpened,
  trackSessionStart,
  trackSessionEnd,
  trackAppBackgrounded,
  trackModuleOpened,
  trackModuleClosed,
};
