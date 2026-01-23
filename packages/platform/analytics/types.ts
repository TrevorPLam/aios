/**
 * Analytics Types
 *
 * Comprehensive type definitions for analytics events, properties, and schema.
 * Provides strong TypeScript typing for event instrumentation.
 */

import { ModuleType } from "@contracts/models/types";

// ============================================================================
// Module Registry Types
// ============================================================================

export type ModuleCategory =
  | "productivity"
  | "communication"
  | "media"
  | "utility"
  | "system";

export interface ModuleMetadata {
  id: ModuleType;
  displayName: string;
  route: string;
  category: ModuleCategory;
}

// ============================================================================
// Event Names (Canonical Taxonomy)
// ============================================================================

export type EventName =
  // Lifecycle
  | "app_opened"
  | "session_start"
  | "session_end"
  | "onboarding_started"
  | "onboarding_completed"
  | "app_backgrounded"
  // Navigation / Modules
  | "module_opened"
  | "module_closed"
  | "module_switch"
  | "module_search"
  | "module_pinned"
  | "module_unpinned"
  | "module_reordered"
  // Module usage
  | "module_focus_start"
  | "module_focus_end"
  // Universal CRUD
  | "item_created"
  | "item_viewed"
  | "item_updated"
  | "item_deleted"
  | "item_completed"
  // AI effectiveness
  | "ai_opened"
  | "ai_suggestion_generated"
  | "ai_suggestion_applied"
  | "ai_suggestion_rejected"
  | "ai_edit_before_apply"
  | "ai_auto_action"
  // Performance/reliability
  | "screen_render_time"
  | "api_latency"
  | "crash_reported"
  | "error_boundary_hit"
  // Settings/personalization
  | "theme_changed"
  | "accent_color_changed"
  | "privacy_mode_enabled"
  | "privacy_mode_disabled";

// ============================================================================
// Bucket Types
// ============================================================================

export type TextLengthBucket = "0-20" | "21-80" | "81-200" | "201-500" | "501+";
export type DurationBucket = "<5s" | "5-30s" | "30-120s" | "2-10m" | "10m+";
export type LatencyBucket =
  | "<100ms"
  | "100-300ms"
  | "300ms-1s"
  | "1-3s"
  | "3s+";
export type AmountBucket = "0-20" | "21-100" | "101-500" | "501-2000" | "2000+";
export type QueryLengthBucket = "0" | "1-3" | "4-10" | "11-25" | "26+";
export type ResultsCountBucket = "0" | "1-3" | "4-10" | "11-25" | "26+";
export type InstallAgeBucket = "0d" | "1-7d" | "8-30d" | "31-90d" | "90d+";

// ============================================================================
// Event Property Types
// ============================================================================

export type NavigationSource =
  | "dock"
  | "grid"
  | "ai"
  | "contextual"
  | "deeplink";
export type NetworkState = "online" | "offline" | "unknown";
export type SelectionState = "none" | "has_selection";
export type ConfidenceBucket = "low" | "medium" | "high";
export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

// ============================================================================
// Event Property Schemas (Per-Event Required/Optional Props)
// ============================================================================

export interface BaseEventProps {
  // Common props available to all events (added automatically)
  event_id?: string;
  occurred_at?: string; // ISO timestamp (omitted in privacy mode)
  day_of_week?: DayOfWeek; // Privacy mode only
  hour_of_day?: number; // Privacy mode only (0-23)
  session_id: string;
  app_version?: string;
  platform?: string;
  locale?: string;
  module_id?: ModuleType;
}

// Lifecycle events
export interface AppOpenedProps {
  install_age_bucket: InstallAgeBucket;
  network_state: NetworkState;
}

export interface SessionStartProps {
  session_id: string;
}

export interface SessionEndProps {
  duration_bucket: DurationBucket;
}

export interface OnboardingStartedProps {}

export interface OnboardingCompletedProps {
  method: string;
}

export interface AppBackgroundedProps {}

// Navigation / Modules
export interface ModuleOpenedProps {
  module_id: ModuleType;
  source: NavigationSource;
}

export interface ModuleClosedProps {
  module_id: ModuleType;
}

export interface ModuleSwitchProps {
  from_module: ModuleType;
  to_module: ModuleType;
}

export interface ModuleSearchProps {
  query_length_bucket: QueryLengthBucket;
  results_count_bucket: ResultsCountBucket;
}

export interface ModulePinnedProps {
  module_id: ModuleType;
}

export interface ModuleUnpinnedProps {
  module_id: ModuleType;
}

export interface ModuleReorderedProps {
  order_hash: string;
}

// Module usage
export interface ModuleFocusStartProps {
  module_id: ModuleType;
}

export interface ModuleFocusEndProps {
  module_id: ModuleType;
  duration_bucket: DurationBucket;
}

// Universal CRUD
export interface ItemCreatedProps {
  module_id: ModuleType;
  item_type: string;
}

export interface ItemViewedProps {
  module_id: ModuleType;
  item_type: string;
}

export interface ItemUpdatedProps {
  module_id: ModuleType;
  item_type: string;
}

export interface ItemDeletedProps {
  module_id: ModuleType;
  item_type: string;
}

export interface ItemCompletedProps {
  module_id: ModuleType;
  item_type: string;
}

// AI effectiveness
export interface AiOpenedProps {
  context_module: ModuleType;
  selection_state: SelectionState;
}

export interface AiSuggestionGeneratedProps {
  suggestion_type: string;
  confidence_bucket: ConfidenceBucket;
  latency_bucket: LatencyBucket;
}

export interface AiSuggestionAppliedProps {
  suggestion_type: string;
  confidence_bucket: ConfidenceBucket;
}

export interface AiSuggestionRejectedProps {
  suggestion_type: string;
}

export interface AiEditBeforeApplyProps {
  suggestion_type: string;
  edit_distance_bucket: AmountBucket;
}

export interface AiAutoActionProps {
  action_type: string;
}

// Performance/reliability
export interface ScreenRenderTimeProps {
  module_id: ModuleType;
  bucket: LatencyBucket;
}

export interface ApiLatencyProps {
  endpoint_key: string;
  bucket: LatencyBucket;
}

export interface CrashReportedProps {
  reason_hash: string;
}

export interface ErrorBoundaryHitProps {
  module_id?: ModuleType;
  error_hash: string;
}

// Settings/personalization
export interface ThemeChangedProps {
  theme_id: string;
}

export interface AccentColorChangedProps {
  accent_color: string;
}

export interface PrivacyModeEnabledProps {}

export interface PrivacyModeDisabledProps {}

// ============================================================================
// Event Property Map (Type-safe event name to props mapping)
// ============================================================================

export interface EventPropsMap {
  app_opened: AppOpenedProps;
  session_start: SessionStartProps;
  session_end: SessionEndProps;
  onboarding_started: OnboardingStartedProps;
  onboarding_completed: OnboardingCompletedProps;
  app_backgrounded: AppBackgroundedProps;
  module_opened: ModuleOpenedProps;
  module_closed: ModuleClosedProps;
  module_switch: ModuleSwitchProps;
  module_search: ModuleSearchProps;
  module_pinned: ModulePinnedProps;
  module_unpinned: ModuleUnpinnedProps;
  module_reordered: ModuleReorderedProps;
  module_focus_start: ModuleFocusStartProps;
  module_focus_end: ModuleFocusEndProps;
  item_created: ItemCreatedProps;
  item_viewed: ItemViewedProps;
  item_updated: ItemUpdatedProps;
  item_deleted: ItemDeletedProps;
  item_completed: ItemCompletedProps;
  ai_opened: AiOpenedProps;
  ai_suggestion_generated: AiSuggestionGeneratedProps;
  ai_suggestion_applied: AiSuggestionAppliedProps;
  ai_suggestion_rejected: AiSuggestionRejectedProps;
  ai_edit_before_apply: AiEditBeforeApplyProps;
  ai_auto_action: AiAutoActionProps;
  screen_render_time: ScreenRenderTimeProps;
  api_latency: ApiLatencyProps;
  crash_reported: CrashReportedProps;
  error_boundary_hit: ErrorBoundaryHitProps;
  theme_changed: ThemeChangedProps;
  accent_color_changed: AccentColorChangedProps;
  privacy_mode_enabled: PrivacyModeEnabledProps;
  privacy_mode_disabled: PrivacyModeDisabledProps;
}

// ============================================================================
// Core Event Structure
// ============================================================================

export type AnalyticsMode = "default" | "privacy";

export interface AnalyticsEvent<T extends EventName = EventName> {
  event_name: T;
  event_id: string;
  occurred_at?: string; // Full ISO timestamp (omitted in privacy mode)
  day_of_week?: DayOfWeek; // Privacy mode only
  hour_of_day?: number; // Privacy mode only (0-23)
  session_id: string;
  module_id?: ModuleType;
  props: EventPropsMap[T];
  app_version: string;
  platform: string;
  locale?: string;
}

export interface BatchPayload {
  schema_version: string;
  mode: AnalyticsMode;
  events: AnalyticsEvent[];
}

// ============================================================================
// Identity Types
// ============================================================================

export interface IdentityInfo {
  user_id?: string; // Stable user ID (omitted in privacy mode)
  device_id?: string; // Stable device ID (omitted in privacy mode)
  session_id: string; // Always present
  anon_id?: string; // Rotating pseudonymous ID (privacy mode)
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface AnalyticsConfig {
  mode: AnalyticsMode;
  endpoint: string;
  enabled: boolean;
  maxQueueSize: number;
  flushInterval: number; // milliseconds
  batchSize: number;
  maxRetries: number;
  debugMode: boolean;
}

// ============================================================================
// Queue Types
// ============================================================================

export interface QueuedEvent {
  event: AnalyticsEvent;
  timestamp: number;
  retryCount: number;
}
