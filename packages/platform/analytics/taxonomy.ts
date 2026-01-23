/**
 * Event Taxonomy
 *
 * Canonical event definitions with required props and allowlisted optional props.
 * This is the single source of truth for what events exist and what properties they accept.
 */

import { EventName } from "./types";

/**
 * Event Definition
 *
 * Defines the schema for each event including:
 * - name: Unique event identifier
 * - description: What the event represents
 * - requiredProps: Property keys that must be provided
 * - optionalProps: Property keys that may be provided
 * - allowedProps: Combined required + optional (computed at runtime)
 */
export interface EventDefinition {
  name: EventName;
  description: string;
  requiredProps: string[];
  optionalProps: string[];
}

/**
 * Canonical Event Taxonomy
 *
 * Complete list of all events with their property schemas.
 * Used for validation and allowlist enforcement.
 */
export const EVENT_TAXONOMY: Record<EventName, EventDefinition> = {
  // ============================================================================
  // Lifecycle Events
  // ============================================================================
  app_opened: {
    name: "app_opened",
    description: "App was launched or brought to foreground",
    requiredProps: ["install_age_bucket", "network_state"],
    optionalProps: [],
  },
  session_start: {
    name: "session_start",
    description: "New user session started",
    requiredProps: ["session_id"],
    optionalProps: [],
  },
  session_end: {
    name: "session_end",
    description: "User session ended",
    requiredProps: ["duration_bucket"],
    optionalProps: [],
  },
  onboarding_started: {
    name: "onboarding_started",
    description: "User started onboarding flow",
    requiredProps: [],
    optionalProps: [],
  },
  onboarding_completed: {
    name: "onboarding_completed",
    description: "User completed onboarding flow",
    requiredProps: ["method"],
    optionalProps: [],
  },
  app_backgrounded: {
    name: "app_backgrounded",
    description: "App moved to background",
    requiredProps: [],
    optionalProps: [],
  },

  // ============================================================================
  // Navigation / Modules
  // ============================================================================
  module_opened: {
    name: "module_opened",
    description: "User opened a module",
    requiredProps: ["module_id", "source"],
    optionalProps: [],
  },
  module_closed: {
    name: "module_closed",
    description: "User closed a module",
    requiredProps: ["module_id"],
    optionalProps: [],
  },
  module_switch: {
    name: "module_switch",
    description: "User switched from one module to another",
    requiredProps: ["from_module", "to_module"],
    optionalProps: [],
  },
  module_search: {
    name: "module_search",
    description: "User searched within module grid or navigation",
    requiredProps: ["query_length_bucket", "results_count_bucket"],
    optionalProps: [],
  },
  module_pinned: {
    name: "module_pinned",
    description: "User pinned a module to dock/favorites",
    requiredProps: ["module_id"],
    optionalProps: [],
  },
  module_unpinned: {
    name: "module_unpinned",
    description: "User unpinned a module from dock/favorites",
    requiredProps: ["module_id"],
    optionalProps: [],
  },
  module_reordered: {
    name: "module_reordered",
    description: "User reordered modules",
    requiredProps: ["order_hash"],
    optionalProps: [],
  },

  // ============================================================================
  // Module Usage
  // ============================================================================
  module_focus_start: {
    name: "module_focus_start",
    description: "User began focused work in a module",
    requiredProps: ["module_id"],
    optionalProps: [],
  },
  module_focus_end: {
    name: "module_focus_end",
    description: "User ended focused work in a module",
    requiredProps: ["module_id", "duration_bucket"],
    optionalProps: [],
  },

  // ============================================================================
  // Universal CRUD
  // ============================================================================
  item_created: {
    name: "item_created",
    description: "User created an item in a module",
    requiredProps: ["module_id", "item_type"],
    optionalProps: [],
  },
  item_viewed: {
    name: "item_viewed",
    description: "User viewed an item in a module",
    requiredProps: ["module_id", "item_type"],
    optionalProps: [],
  },
  item_updated: {
    name: "item_updated",
    description: "User updated an item in a module",
    requiredProps: ["module_id", "item_type"],
    optionalProps: [],
  },
  item_deleted: {
    name: "item_deleted",
    description: "User deleted an item in a module",
    requiredProps: ["module_id", "item_type"],
    optionalProps: [],
  },
  item_completed: {
    name: "item_completed",
    description: "User marked an item as completed",
    requiredProps: ["module_id", "item_type"],
    optionalProps: [],
  },

  // ============================================================================
  // AI Effectiveness
  // ============================================================================
  ai_opened: {
    name: "ai_opened",
    description: "User opened AI assistant",
    requiredProps: ["source_module", "selection_state"],
    optionalProps: [],
  },
  ai_suggestion_generated: {
    name: "ai_suggestion_generated",
    description: "AI generated a suggestion",
    requiredProps: ["suggestion_type", "confidence_bucket", "latency_bucket"],
    optionalProps: [],
  },
  ai_suggestion_applied: {
    name: "ai_suggestion_applied",
    description: "User applied an AI suggestion",
    requiredProps: ["suggestion_type", "confidence_bucket"],
    optionalProps: [],
  },
  ai_suggestion_rejected: {
    name: "ai_suggestion_rejected",
    description: "User rejected an AI suggestion",
    requiredProps: ["suggestion_type"],
    optionalProps: [],
  },
  ai_edit_before_apply: {
    name: "ai_edit_before_apply",
    description: "User edited AI suggestion before applying",
    requiredProps: ["suggestion_type", "edit_distance_bucket"],
    optionalProps: [],
  },
  ai_auto_action: {
    name: "ai_auto_action",
    description: "AI performed an automatic action",
    requiredProps: ["action_type"],
    optionalProps: [],
  },

  // ============================================================================
  // Performance / Reliability
  // ============================================================================
  screen_render_time: {
    name: "screen_render_time",
    description: "Screen render performance metric",
    requiredProps: ["module_id", "bucket"],
    optionalProps: [],
  },
  api_latency: {
    name: "api_latency",
    description: "API call latency metric",
    requiredProps: ["endpoint_key", "bucket"],
    optionalProps: [],
  },
  crash_reported: {
    name: "crash_reported",
    description: "App crash occurred",
    requiredProps: ["reason_hash"],
    optionalProps: [],
  },
  error_boundary_hit: {
    name: "error_boundary_hit",
    description: "React error boundary caught an error",
    requiredProps: ["error_hash"],
    optionalProps: ["module_id"],
  },

  // ============================================================================
  // Settings / Personalization
  // ============================================================================
  theme_changed: {
    name: "theme_changed",
    description: "User changed app theme",
    requiredProps: ["theme_id"],
    optionalProps: [],
  },
  accent_color_changed: {
    name: "accent_color_changed",
    description: "User changed accent color",
    requiredProps: ["accent_color"],
    optionalProps: [],
  },
  privacy_mode_enabled: {
    name: "privacy_mode_enabled",
    description: "User enabled privacy mode",
    requiredProps: [],
    optionalProps: [],
  },
  privacy_mode_disabled: {
    name: "privacy_mode_disabled",
    description: "User disabled privacy mode",
    requiredProps: [],
    optionalProps: [],
  },
};

/**
 * Get all allowed property keys for an event (required + optional)
 */
export function getAllowedProps(eventName: EventName): string[] {
  const definition = EVENT_TAXONOMY[eventName];
  return [...definition.requiredProps, ...definition.optionalProps];
}

/**
 * Get required property keys for an event
 */
export function getRequiredProps(eventName: EventName): string[] {
  return EVENT_TAXONOMY[eventName].requiredProps;
}

/**
 * Validate if a property key is allowed for an event
 */
export function isAllowedProp(eventName: EventName, propKey: string): boolean {
  const allowedProps = getAllowedProps(eventName);
  return allowedProps.includes(propKey);
}

/**
 * Get event description
 */
export function getEventDescription(eventName: EventName): string {
  return EVENT_TAXONOMY[eventName].description;
}
