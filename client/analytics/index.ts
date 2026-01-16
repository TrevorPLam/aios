/**
 * Analytics - Public API
 *
 * Exported singleton analytics client with convenience methods for common events.
 * This is the main entry point for instrumentation throughout the app.
 */

import { ModuleType } from "@/models/types";
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
      // Can be configured via environment variables or config
      enabled: process.env.EXPO_PUBLIC_ANALYTICS_ENABLED !== "false",
      debugMode: __DEV__,
    });
  }
  return analyticsInstance;
}

// ============================================================================
// Core API
// ============================================================================

/**
 * Log a generic event
 *
 * Type-safe event logging with full control over properties
 */
export async function log<T extends EventName>(
  eventName: T,
  props: EventPropsMap[T],
): Promise<void> {
  await getAnalytics().log(eventName, props);
}

/**
 * Initialize analytics
 *
 * Should be called early in app lifecycle
 */
export async function initialize(): Promise<void> {
  await getAnalytics().initialize();
}

/**
 * Flush queued events
 */
export async function flush(): Promise<void> {
  await getAnalytics().flush();
}

/**
 * Enable privacy mode
 */
export async function enablePrivacyMode(): Promise<void> {
  await getAnalytics().enablePrivacyMode();
}

/**
 * Disable privacy mode
 */
export async function disablePrivacyMode(): Promise<void> {
  await getAnalytics().disablePrivacyMode();
}

/**
 * Check if privacy mode is enabled
 */
export function isPrivacyModeEnabled(): boolean {
  return getAnalytics().isPrivacyModeEnabled();
}

/**
 * Shutdown analytics (call before app exit)
 */
export async function shutdown(): Promise<void> {
  await getAnalytics().shutdown();
}

// ============================================================================
// Convenience Methods - Lifecycle
// ============================================================================

/**
 * Track app opened
 */
export async function trackAppOpened(
  installAgeDays: number,
  networkState: NetworkState,
): Promise<void> {
  await log("app_opened", {
    install_age_bucket: getInstallAgeBucket(installAgeDays),
    network_state: networkState,
  });
}

/**
 * Track session start
 */
export async function trackSessionStart(): Promise<void> {
  await getAnalytics().trackSessionStart();
}

/**
 * Track session end
 */
export async function trackSessionEnd(): Promise<void> {
  await getAnalytics().trackSessionEnd();
}

/**
 * Track app backgrounded
 */
export async function trackAppBackgrounded(): Promise<void> {
  await log("app_backgrounded", {});
}

// ============================================================================
// Convenience Methods - Navigation / Modules
// ============================================================================

/**
 * Track module opened
 */
export async function trackModuleOpened(
  moduleId: ModuleType,
  source: NavigationSource,
): Promise<void> {
  await log("module_opened", { module_id: moduleId, source });
}

/**
 * Track module closed
 */
export async function trackModuleClosed(moduleId: ModuleType): Promise<void> {
  await log("module_closed", { module_id: moduleId });
}

/**
 * Track module switch
 */
export async function trackModuleSwitch(
  fromModule: ModuleType,
  toModule: ModuleType,
): Promise<void> {
  await log("module_switch", { from_module: fromModule, to_module: toModule });
}

/**
 * Track module search
 */
export async function trackModuleSearch(
  queryLength: number,
  resultsCount: number,
): Promise<void> {
  await log("module_search", {
    query_length_bucket: getQueryLengthBucket(queryLength),
    results_count_bucket: getResultsCountBucket(resultsCount),
  });
}

/**
 * Track module pinned
 */
export async function trackModulePinned(moduleId: ModuleType): Promise<void> {
  await log("module_pinned", { module_id: moduleId });
}

/**
 * Track module unpinned
 */
export async function trackModuleUnpinned(moduleId: ModuleType): Promise<void> {
  await log("module_unpinned", { module_id: moduleId });
}

/**
 * Track module reordered
 */
export async function trackModuleReordered(orderHash: string): Promise<void> {
  await log("module_reordered", { order_hash: orderHash });
}

/**
 * Track module focus start
 */
export async function trackModuleFocusStart(
  moduleId: ModuleType,
): Promise<void> {
  await log("module_focus_start", { module_id: moduleId });
}

/**
 * Track module focus end
 */
export async function trackModuleFocusEnd(
  moduleId: ModuleType,
  durationSeconds: number,
): Promise<void> {
  await log("module_focus_end", {
    module_id: moduleId,
    duration_bucket: getDurationBucket(durationSeconds),
  });
}

// ============================================================================
// Convenience Methods - CRUD Operations
// ============================================================================

/**
 * Track item created
 */
export async function trackItemCreated(
  moduleId: ModuleType,
  itemType: string,
): Promise<void> {
  await log("item_created", { module_id: moduleId, item_type: itemType });
}

/**
 * Track item viewed
 */
export async function trackItemViewed(
  moduleId: ModuleType,
  itemType: string,
): Promise<void> {
  await log("item_viewed", { module_id: moduleId, item_type: itemType });
}

/**
 * Track item updated
 */
export async function trackItemUpdated(
  moduleId: ModuleType,
  itemType: string,
): Promise<void> {
  await log("item_updated", { module_id: moduleId, item_type: itemType });
}

/**
 * Track item deleted
 */
export async function trackItemDeleted(
  moduleId: ModuleType,
  itemType: string,
): Promise<void> {
  await log("item_deleted", { module_id: moduleId, item_type: itemType });
}

/**
 * Track item completed
 */
export async function trackItemCompleted(
  moduleId: ModuleType,
  itemType: string,
): Promise<void> {
  await log("item_completed", { module_id: moduleId, item_type: itemType });
}

// ============================================================================
// Convenience Methods - AI
// ============================================================================

/**
 * Track AI opened
 */
export async function trackAIOpened(
  contextModule: ModuleType,
  selectionState: SelectionState,
): Promise<void> {
  await log("ai_opened", {
    context_module: contextModule,
    selection_state: selectionState,
  });
}

/**
 * Track AI suggestion generated
 */
export async function trackAISuggestionGenerated(
  suggestionType: string,
  confidence: ConfidenceBucket,
  latencyMs: number,
): Promise<void> {
  await log("ai_suggestion_generated", {
    suggestion_type: suggestionType,
    confidence_bucket: confidence,
    latency_bucket: getLatencyBucket(latencyMs),
  });
}

/**
 * Track AI suggestion applied
 */
export async function trackAISuggestionApplied(
  suggestionType: string,
  confidence: ConfidenceBucket,
): Promise<void> {
  await log("ai_suggestion_applied", {
    suggestion_type: suggestionType,
    confidence_bucket: confidence,
  });
}

/**
 * Track AI suggestion rejected
 */
export async function trackAISuggestionRejected(
  suggestionType: string,
): Promise<void> {
  await log("ai_suggestion_rejected", { suggestion_type: suggestionType });
}

/**
 * Track AI edit before apply
 */
export async function trackAIEditBeforeApply(
  suggestionType: string,
  editDistance: number,
): Promise<void> {
  await log("ai_edit_before_apply", {
    suggestion_type: suggestionType,
    edit_distance_bucket: getAmountBucket(editDistance),
  });
}

/**
 * Track AI auto action
 */
export async function trackAIAutoAction(actionType: string): Promise<void> {
  await log("ai_auto_action", { action_type: actionType });
}

// ============================================================================
// Convenience Methods - Performance
// ============================================================================

/**
 * Track screen render time
 */
export async function trackScreenRenderTime(
  moduleId: ModuleType,
  renderTimeMs: number,
): Promise<void> {
  await log("screen_render_time", {
    module_id: moduleId,
    bucket: getLatencyBucket(renderTimeMs),
  });
}

/**
 * Track API latency
 */
export async function trackAPILatency(
  endpointKey: string,
  latencyMs: number,
): Promise<void> {
  await log("api_latency", {
    endpoint_key: endpointKey,
    bucket: getLatencyBucket(latencyMs),
  });
}

/**
 * Track error boundary hit
 */
export async function trackErrorBoundaryHit(
  errorHash: string,
  moduleId?: ModuleType,
): Promise<void> {
  await log("error_boundary_hit", {
    error_hash: errorHash,
    module_id: moduleId,
  });
}

// ============================================================================
// Convenience Methods - Settings
// ============================================================================

/**
 * Track theme changed
 */
export async function trackThemeChanged(themeId: string): Promise<void> {
  await log("theme_changed", { theme_id: themeId });
}

/**
 * Track accent color changed
 */
export async function trackAccentColorChanged(
  accentColor: string,
): Promise<void> {
  await log("accent_color_changed", { accent_color: accentColor });
}

// ============================================================================
// Debug / Development
// ============================================================================

/**
 * Get queue stats (for debugging)
 */
export async function getQueueStats(): Promise<any> {
  return getAnalytics().getQueueStats();
}

/**
 * Clear queue (for testing)
 */
export async function clearQueue(): Promise<void> {
  await getAnalytics().clearQueue();
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
  trackModuleSwitch,
  trackModuleSearch,
  trackModulePinned,
  trackModuleUnpinned,
  trackModuleReordered,
  trackModuleFocusStart,
  trackModuleFocusEnd,
  trackItemCreated,
  trackItemViewed,
  trackItemUpdated,
  trackItemDeleted,
  trackItemCompleted,
  trackAIOpened,
  trackAISuggestionGenerated,
  trackAISuggestionApplied,
  trackAISuggestionRejected,
  trackAIEditBeforeApply,
  trackAIAutoAction,
  trackScreenRenderTime,
  trackAPILatency,
  trackErrorBoundaryHit,
  trackThemeChanged,
  trackAccentColorChanged,
  getQueueStats,
  clearQueue,
};
