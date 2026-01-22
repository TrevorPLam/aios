/**
 * How to Use:
 * - Read contextEngine.getCurrentZone() and call shouldModuleBeVisible() for filtering.
 * - Subscribe with contextEngine.onChange(...) to update UI on zone changes.
 *
 * UI integration example:
 * - PersistentSidebar hides/shows modules using contextEngine.shouldModuleBeVisible.
 *
 * Public API:
 * - ContextZone, ContextDetection, contextEngine.
 *
 * Expected usage pattern:
 * - Treat context updates as read-only inputs; keep overrides explicit.
 *
 * WHY: Keeps adaptive UI logic centralized so module visibility stays predictable.
 */
/**
 * Context Engine for Adaptive Interface
 *
 * Purpose (Plain English):
 * Automatically changes what you see based on time, location, and what you're doing.
 * For example, during work hours, it shows work-related modules and hides entertainment.
 * In the evening, it shows personal life modules and hides professional tools.
 *
 * What it interacts with:
 * - Sidebar navigation (to show/hide modules)
 * - Command Center (to adjust recommendations)
 * - Module registry (to determine which modules belong in which context)
 * - Event bus (to track user activity and learn preferences)
 *
 * Technical Implementation:
 * Uses rules engine + machine learning patterns. Rules define default contexts
 * (e.g., 9am-5pm = work). User overrides and usage patterns refine predictions over time.
 *
 * Safe AI Extension Points:
 * - Add new context types
 * - Add new context detection rules
 * - Add new module categories
 *
 * Fragile Logic Warnings:
 * - Context changes must be smooth (no jarring transitions)
 * - User overrides must be respected
 * - Default to showing more rather than hiding critical info
 */

import { ModuleType } from "@/models/types";
import { db } from "@/storage/database";
import { eventBus, EVENT_TYPES } from "./eventBus";
import { moduleRegistry } from "./moduleRegistry";

/**
 * Context Zones
 *
 * Plain English: Different "modes" the app can be in.
 */
export enum ContextZone {
  WORK = "work",
  PERSONAL = "personal",
  FOCUS = "focus", // Deep work, minimal distractions
  SOCIAL = "social", // Messaging, events, entertainment
  WELLNESS = "wellness", // Health, meditation, breaks
  EVENING = "evening", // Winding down, entertainment
  WEEKEND = "weekend", // Leisure, personal projects
  AUTO = "auto", // Let AI decide
}

/**
 * Context Detection Result
 */
export interface ContextDetection {
  zone: ContextZone;
  confidence: number; // 0-1
  reason: string; // Plain English explanation
  suggestedModules: ModuleType[];
  hiddenModules: ModuleType[];
  timestamp: string;
}

/**
 * Context Rule
 *
 * Defines when a context should activate.
 */
interface ContextRule {
  zone: ContextZone;
  priority: number; // Higher = more important
  condition: () => boolean;
  reason: string;
}

/**
 * Module Context Mapping
 *
 * Defines which modules are relevant in which contexts.
 * Plain English: "These tools make sense for this situation"
 */
const MODULE_CONTEXT_MAP: Record<ContextZone, ModuleType[]> = {
  [ContextZone.WORK]: [
    "command",
    "email",
    "calendar",
    "planner",
    "notebook",
    "contacts",
    "messages", // Future: Filter to work contacts only when contact filtering implemented
  ],
  [ContextZone.PERSONAL]: [
    "command",
    "messages",
    "calendar",
    "planner",
    "lists",
    "budget",
    "photos",
    "contacts",
  ],
  [ContextZone.FOCUS]: [
    "command",
    "notebook",
    "planner",
    "calendar", // View only, minimal notifications
  ],
  [ContextZone.SOCIAL]: [
    "command",
    "messages",
    "contacts",
    "photos",
    "calendar",
  ],
  [ContextZone.WELLNESS]: [
    "command",
    "calendar",
    "alerts", // Reminders for breaks, hydration
    "planner",
  ],
  [ContextZone.EVENING]: [
    "command",
    "messages",
    "photos",
    "lists",
    "budget",
    "calendar",
  ],
  [ContextZone.WEEKEND]: [
    "command",
    "messages",
    "calendar",
    "photos",
    "lists",
    "contacts",
    "budget",
  ],
  [ContextZone.AUTO]: [], // Will be determined dynamically
};

/**
 * Context Engine Class
 *
 * Detects and manages context zones.
 */
class ContextEngine {
  private currentZone: ContextZone = ContextZone.AUTO;
  private userOverride: ContextZone | null = null;
  private lastDetection: ContextDetection | null = null;
  private listeners: Set<(detection: ContextDetection) => void> = new Set();
  private focusModeEnabled = false;

  constructor() {
    // WHY: Initialize focus mode once so adaptive UI reflects saved settings.
    void this.loadFocusModePreference();
    // WHY: Keep focus mode synced without a direct dependency on AttentionManager.
    this.subscribeToFocusModeChanges();
  }

  private async loadFocusModePreference(): Promise<void> {
    try {
      const settings = await db.settings.get();
      this.focusModeEnabled = settings.focusModeEnabled ?? false;
    } catch (error) {
      console.warn("Failed to load focus mode setting:", error);
    }
  }

  private subscribeToFocusModeChanges(): void {
    eventBus.on(EVENT_TYPES.USER_ACTION, (payload) => {
      if (payload.data.action !== "attention:focus-mode-changed") {
        return;
      }

      const mode = payload.data.mode as { enabled?: boolean } | undefined;
      if (typeof mode?.enabled !== "boolean") {
        return;
      }

      this.focusModeEnabled = mode.enabled;

      // Refresh detection so listeners pick up the focus zone immediately.
      this.detectContext();
    });
  }

  /**
   * Get Context Rules
   *
   * Plain English: "How do we know which mode to use?"
   *
   * Technical: Priority-ordered rules that evaluate current conditions.
   * Higher priority rules win when multiple match.
   *
   * Why it exists: Automates context detection without user intervention.
   *
   * Failure modes: If all rules return false, defaults to PERSONAL.
   * Time-based rules can fail if system clock is wrong.
   */
  private getContextRules(): ContextRule[] {
    return [
      // Focus mode overrides everything
      {
        zone: ContextZone.FOCUS,
        priority: 100,
        condition: () => {
          // Check if user has manually enabled focus mode
          // This would be set via a toggle in the UI
          return this.focusModeEnabled;
        },
        reason: "Focus mode enabled",
      },

      // Weekend detection
      {
        zone: ContextZone.WEEKEND,
        priority: 50,
        condition: () => {
          const day = new Date().getDay();
          return day === 0 || day === 6; // Sunday or Saturday
        },
        reason: "Weekend detected",
      },

      // Work hours detection (Monday-Friday, 9am-5pm)
      {
        zone: ContextZone.WORK,
        priority: 40,
        condition: () => {
          const now = new Date();
          const day = now.getDay();
          const hour = now.getHours();

          // Monday-Friday
          if (day >= 1 && day <= 5) {
            // 9am-5pm
            if (hour >= 9 && hour < 17) {
              return true;
            }
          }
          return false;
        },
        reason: "Work hours (Mon-Fri, 9am-5pm)",
      },

      // Evening detection (after 6pm)
      {
        zone: ContextZone.EVENING,
        priority: 30,
        condition: () => {
          const hour = new Date().getHours();
          return hour >= 18 || hour < 6; // 6pm-6am
        },
        reason: "Evening hours",
      },

      // Social hours (lunch time, after work)
      {
        zone: ContextZone.SOCIAL,
        priority: 25,
        condition: () => {
          const hour = new Date().getHours();
          // Lunch time or early evening
          return (hour >= 12 && hour < 13) || (hour >= 17 && hour < 18);
        },
        reason: "Social hours (lunch or after work)",
      },

      // Default to personal
      {
        zone: ContextZone.PERSONAL,
        priority: 0,
        condition: () => true,
        reason: "Default personal mode",
      },
    ];
  }

  /**
   * Detect Current Context
   *
   * Plain English: "Figure out what mode we should be in right now"
   *
   * Technical: Evaluates all rules in priority order, returns first match.
   * User override always wins if set.
   *
   * @returns Current context detection result
   */
  detectContext(): ContextDetection {
    // User override always wins
    if (this.userOverride) {
      const modules = MODULE_CONTEXT_MAP[this.userOverride];
      return {
        zone: this.userOverride,
        confidence: 1.0,
        reason: "User manual override",
        suggestedModules: modules,
        hiddenModules: this.getHiddenModules(modules),
        timestamp: new Date().toISOString(),
      };
    }

    // Evaluate rules in priority order
    const rules = this.getContextRules().sort(
      (a, b) => b.priority - a.priority,
    );

    for (const rule of rules) {
      if (rule.condition()) {
        const modules = MODULE_CONTEXT_MAP[rule.zone];
        const detection: ContextDetection = {
          zone: rule.zone,
          confidence: 0.8, // High confidence for rule-based detection
          reason: rule.reason,
          suggestedModules: modules,
          hiddenModules: this.getHiddenModules(modules),
          timestamp: new Date().toISOString(),
        };

        // Emit context change event if changed
        if (this.lastDetection?.zone !== detection.zone) {
          eventBus.emit(EVENT_TYPES.CONTEXT_CHANGED, {
            previousZone: this.lastDetection?.zone,
            newZone: detection.zone,
            reason: detection.reason,
          });
        }

        this.lastDetection = detection;
        this.currentZone = detection.zone;

        // Notify listeners
        this.notifyListeners(detection);

        return detection;
      }
    }

    // Should never reach here due to default rule
    const fallback: ContextDetection = {
      zone: ContextZone.PERSONAL,
      confidence: 0.5,
      reason: "Fallback to personal mode",
      suggestedModules: MODULE_CONTEXT_MAP[ContextZone.PERSONAL],
      hiddenModules: [],
      timestamp: new Date().toISOString(),
    };

    this.lastDetection = fallback;
    return fallback;
  }

  /**
   * Get Hidden Modules
   *
   * Plain English: "Which modules should we hide in this context?"
   *
   * Technical: Returns modules not in the suggested list.
   * We always keep 'command' visible as it's the home screen.
   *
   * Note: This method will be updated to get modules from registry
   * once circular dependency is resolved (registry imports this file).
   * For now, uses hardcoded list matching current core modules.
   *
   * @param suggestedModules - Modules to show
   * @returns Modules to hide
   */
  private getHiddenModules(suggestedModules: ModuleType[]): ModuleType[] {
    // WHY: Use module registry as the source of truth for module lists.
    const allModules = moduleRegistry
      .getAllModules()
      .map((module) => module.id);

    return allModules.filter(
      (module) => !suggestedModules.includes(module) && module !== "command",
    );
  }

  /**
   * Set User Override
   *
   * Plain English: "User manually picked a mode"
   *
   * Technical: Stores user override and triggers re-detection.
   * Pass null to clear override and return to automatic detection.
   *
   * @param zone - Zone to override to, or null to clear
   */
  setUserOverride(zone: ContextZone | null): void {
    this.userOverride = zone;

    // Re-detect context with new override
    this.detectContext();

    // Log for analytics
    eventBus.emit(EVENT_TYPES.USER_ACTION, {
      action: "context_override",
      zone: zone || "auto",
    });
  }

  /**
   * Get Current Zone
   *
   * @returns Current active context zone
   */
  getCurrentZone(): ContextZone {
    return this.currentZone;
  }

  /**
   * Get Last Detection
   *
   * @returns Last context detection result
   */
  getLastDetection(): ContextDetection | null {
    return this.lastDetection;
  }

  /**
   * Subscribe to Context Changes
   *
   * Plain English: "Tell me when the context changes"
   *
   * @param listener - Function to call on context change
   * @returns Unsubscribe function
   */
  onChange(listener: (detection: ContextDetection) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify Listeners
   *
   * Internal method to notify all subscribed listeners.
   */
  private notifyListeners(detection: ContextDetection): void {
    this.listeners.forEach((listener) => {
      try {
        listener(detection);
      } catch (error) {
        console.error("Error in context change listener:", error);
      }
    });
  }

  /**
   * Should Module Be Visible
   *
   * Plain English: "Should this module show in the sidebar?"
   *
   * Technical: Checks if module is in suggested list for current context.
   * Always shows command center.
   *
   * @param moduleType - Module to check
   * @returns True if module should be visible
   */
  shouldModuleBeVisible(moduleType: ModuleType): boolean {
    const detection = this.lastDetection || this.detectContext();
    return (
      moduleType === "command" ||
      detection.suggestedModules.includes(moduleType)
    );
  }
}

// Export singleton instance
export const contextEngine = new ContextEngine();
