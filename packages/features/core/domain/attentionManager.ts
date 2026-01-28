/**
 * How to Use:
 * - Use attentionManager.getItems()/getBundles()/getCounts() to drive UI state.
 * - Subscribe with attentionManager.subscribe(...) and clean up on unmount.
 *
 * UI integration example:
 * - AttentionCenterScreen renders items/bundles and listens for updates via attentionManager.
 *
 * Public API:
 * - AttentionPriority, AttentionStatus, AttentionItem, AttentionBundle, FocusMode, attentionManager.
 *
 * Expected usage pattern:
 * - Treat the singleton as the source of truth and avoid duplicating state elsewhere.
 *
 * WHY: One canonical store prevents mismatched counts and keeps notification UX consistent.
 */
/**
 * Attention Management System
 *
 * Purpose (Plain English):
 * Helps users stay focused by intelligently prioritizing notifications and updates
 * across all 38+ modules. Instead of showing 38 notification badges, we classify
 * items into urgent (needs action today), attention (needs action soon), and FYI
 * (nice to know). This reduces cognitive load and notification fatigue.
 *
 * What it interacts with:
 * - Module Registry: Gets list of all modules and their notification sources
 * - Event Bus: Subscribes to module events to detect new attention items
 * - Storage: Persists user attention preferences
 * - Context Engine: Uses context to adjust attention priorities
 *
 * Safe AI extension points:
 * - `classifyAttentionItem`: Add ML-based priority classification
 * - `bundleRelatedItems`: Use NLP to group semantically related notifications
 * - `predictUserInterest`: Learn user preferences for notification timing
 *
 * Warnings - Fragile logic:
 * - Urgency classification rules must balance sensitivity (missing urgent items)
 *   vs specificity (false alarms). Err on side of caution.
 * - Bundle size limits prevent overwhelming users with large groups
 * - Focus mode rules must have clear opt-out to avoid user frustration
 *
 * @module AttentionManager
 * @author AIOS Development Team
 * @version 1.0.0
 */

import { ModuleType } from "@aios/contracts/models/types";
import { eventBus, EVENT_TYPES } from "./eventBus";
import { contextEngine } from "./contextEngine";
import { saveToStorage, loadFromStorage } from "./storage";
import { db } from "@aios/platform/storage/database";
import { logger } from "@aios/platform/lib/logger";

/**
 * Attention priority levels
 * - urgent: Requires immediate action (today)
 * - attention: Needs action soon (this week)
 * - fyi: Nice to know (no action required)
 */
export type AttentionPriority = "urgent" | "attention" | "fyi";

/**
 * Attention item status
 * - active: Visible to user
 * - dismissed: User manually dismissed
 * - resolved: System marked as complete
 * - expired: Item passed its relevance window
 */
export type AttentionStatus = "active" | "dismissed" | "resolved" | "expired";

/**
 * Attention item interface
 * Represents a single notification or update that needs user attention
 */
export interface AttentionItem {
  id: string;
  module: ModuleType;
  priority: AttentionPriority;
  status: AttentionStatus;
  title: string;
  summary: string;
  actionLabel?: string; // Optional CTA button text
  actionTarget?: string; // Navigation target when tapped
  bundleId?: string; // Groups related items
  createdAt: string; // ISO timestamp
  expiresAt?: string; // Optional expiry time
  metadata: Record<string, unknown>; // Module-specific data
}

/**
 * Attention bundle interface
 * Groups multiple related attention items for cleaner presentation
 */
export interface AttentionBundle {
  id: string;
  title: string;
  priority: AttentionPriority;
  items: AttentionItem[];
  createdAt: string;
}

/**
 * Focus mode configuration
 * Silences non-urgent notifications during focus periods
 */
export interface FocusMode {
  enabled: boolean;
  allowUrgent: boolean; // Always allow urgent items
  allowedModules?: ModuleType[]; // Optional whitelist
  startTime?: string; // Optional scheduled start
  endTime?: string; // Optional scheduled end
}

/**
 * Attention management configuration
 */
interface AttentionConfig {
  maxActiveItems: number; // Limit visible items to prevent overwhelm
  maxBundleSize: number; // Max items per bundle
  bundleThresholdMinutes: number; // Time window for bundling
  expiryCheckIntervalMs: number; // How often to check for expired items
}

/**
 * Default configuration
 *
 * Why these values:
 * - 20 max items: Research shows 7±2 items is cognitive limit, but with
 *   bundling and priorities we can show more without overwhelm
 * - 5 items per bundle: Small enough to scan quickly
 * - 10 minute bundling: Groups rapid notifications without excessive delay
 * - 60 second expiry check: Balance between freshness and battery
 */
const DEFAULT_CONFIG: AttentionConfig = {
  maxActiveItems: 20,
  maxBundleSize: 5,
  bundleThresholdMinutes: 10,
  expiryCheckIntervalMs: 60000, // 1 minute
};

/**
 * Attention Manager Class
 *
 * Manages the attention system for the entire app
 */
class AttentionManager {
  private items: Map<string, AttentionItem> = new Map();
  private bundles: Map<string, AttentionBundle> = new Map();
  private focusMode: FocusMode = {
    enabled: false,
    allowUrgent: true,
  };
  private config: AttentionConfig = DEFAULT_CONFIG;
  private expiryCheckInterval?: NodeJS.Timeout;
  private listeners: Set<() => void> = new Set();
  private eventUnsubscribers: (() => void)[] = [];

  /**
   * Initialize the attention manager
   *
   * Technical: Sets up event subscriptions, loads saved preferences,
   * starts expiry checker
   *
   * Plain English: Starts the notification intelligence system
   *
   * @param startExpiryCheck - Whether to start the expiry checker (default: true). Set to false for testing.
   */
  async initialize(startExpiryCheck = true): Promise<void> {
    // Subscribe to module events and store unsubscribe functions
    this.eventUnsubscribers.push(
      eventBus.on(EVENT_TYPES.TASK_CREATED, this.handleTaskCreated),
    );
    this.eventUnsubscribers.push(
      eventBus.on(EVENT_TYPES.CALENDAR_EVENT_CREATED, this.handleUpcomingEvent),
    );
    this.eventUnsubscribers.push(
      eventBus.on(EVENT_TYPES.MESSAGE_RECEIVED, this.handleMessageReceived),
    );

    // Start expiry checker
    if (startExpiryCheck) {
      this.startExpiryCheck();
    }

    // Load saved preferences (placeholder - implement with AsyncStorage)
    await this.loadPreferences();
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.expiryCheckInterval) {
      clearInterval(this.expiryCheckInterval);
    }
    // Unsubscribe from all events
    this.eventUnsubscribers.forEach((unsubscribe) => unsubscribe());
    this.eventUnsubscribers = [];

    // Clear all state
    this.items.clear();
    this.bundles.clear();
    this.listeners.clear();

    // Reset focus mode
    this.focusMode = {
      enabled: false,
      allowUrgent: true,
    };
  }

  /**
   * Add an attention item
   *
   * @param item - Attention item to add
   * @returns Whether item was added (may be rejected if focus mode active)
   */
  addItem(item: AttentionItem): boolean {
    // Apply focus mode filtering
    if (!this.shouldShowItem(item)) {
      return false;
    }

    // Check for bundling opportunity
    const bundleId = this.findBundleForItem(item);
    if (bundleId) {
      item.bundleId = bundleId;
    }

    this.items.set(item.id, item);

    // Update bundles
    if (item.bundleId) {
      this.updateBundle(item);
    }

    // Notify listeners (synchronous)
    this.notifyListeners();

    // Emit event for UI updates
    eventBus.emit(EVENT_TYPES.USER_ACTION, {
      action: "attention:item-added",
      item,
    });

    // Save to storage (async, but don't wait)
    this.savePreferences().catch((error) => {
      logger.error("AttentionManager", "Failed to save attention state", {
        error: error instanceof Error ? error.message : String(error),
      });
    });

    return true;
  }

  /**
   * Dismiss an attention item
   * User manually dismissed the notification
   */
  dismissItem(itemId: string): void {
    const item = this.items.get(itemId);
    if (!item) return;

    item.status = "dismissed";
    this.notifyListeners();
    eventBus.emit(EVENT_TYPES.USER_ACTION, {
      action: "attention:item-dismissed",
      itemId,
    });
  }

  /**
   * Dismiss an entire bundle
   */
  dismissBundle(bundleId: string): void {
    const bundle = this.bundles.get(bundleId);
    if (!bundle) return;

    bundle.items.forEach((item) => {
      item.status = "dismissed";
    });

    this.bundles.delete(bundleId);
    this.notifyListeners();
    eventBus.emit(EVENT_TYPES.USER_ACTION, {
      action: "attention:bundle-dismissed",
      bundleId,
    });
  }

  /**
   * Resolve an attention item (system-initiated)
   * Item completed or no longer relevant
   */
  resolveItem(itemId: string): void {
    const item = this.items.get(itemId);
    if (!item) return;

    item.status = "resolved";
    this.notifyListeners();
    eventBus.emit(EVENT_TYPES.USER_ACTION, {
      action: "attention:item-resolved",
      itemId,
    });
  }

  /**
   * Get active items filtered by priority
   */
  getItems(priority?: AttentionPriority): AttentionItem[] {
    let items = Array.from(this.items.values()).filter(
      (item) => item.status === "active",
    );

    if (priority) {
      items = items.filter((item) => item.priority === priority);
    }

    // Sort by priority (urgent first) then by creation time (newest first)
    return items.sort((a, b) => {
      const priorityOrder = { urgent: 3, attention: 2, fyi: 1 };
      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  /**
   * Get active bundles
   */
  getBundles(): AttentionBundle[] {
    return Array.from(this.bundles.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  /**
   * Get item counts by priority
   * Used for badge display
   */
  getCounts(): Record<AttentionPriority, number> {
    const items = this.getItems();
    return {
      urgent: items.filter((i) => i.priority === "urgent").length,
      attention: items.filter((i) => i.priority === "attention").length,
      fyi: items.filter((i) => i.priority === "fyi").length,
    };
  }

  /**
   * Set focus mode
   *
   * Plain English: Turn on "do not disturb" mode
   * Technical: Filters notifications based on priority and whitelist
   */
  setFocusMode(mode: Partial<FocusMode>): void {
    this.focusMode = { ...this.focusMode, ...mode };

    // Notify listeners (synchronous)
    this.notifyListeners();

    eventBus.emit(EVENT_TYPES.USER_ACTION, {
      action: "attention:focus-mode-changed",
      mode: this.focusMode,
    });

    // If enabling focus mode, re-evaluate all active items
    if (mode.enabled) {
      this.refilterItems();
    }

    // WHY: Keep settings in sync so context rules can restore focus mode on startup.
    void db.settings
      .update({ focusModeEnabled: this.focusMode.enabled })
      .catch((error) => {
        logger.error("AttentionManager", "Failed to sync focus mode setting", {
          error: error instanceof Error ? error.message : String(error),
        });
      });

    // Save to storage (async, but don't wait)
    this.savePreferences().catch((error) => {
      logger.error("AttentionManager", "Failed to save focus mode", {
        error: error instanceof Error ? error.message : String(error),
      });
    });
  }

  /**
   * Get current focus mode
   */
  getFocusMode(): FocusMode {
    return { ...this.focusMode };
  }

  /**
   * Subscribe to attention changes
   *
   * @param listener - Callback function
   * @returns Unsubscribe function
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Classify an item's attention priority
   *
   * Technical: Rule-based classification with context awareness
   *
   * Safe AI extension point: Replace with ML model for learned priorities
   *
   * Fragile logic warning: These rules balance false positives vs false negatives.
   * Always err on the side of showing urgent items even if borderline.
   */
  private classifyPriority(
    module: ModuleType,
    metadata: Record<string, unknown>,
  ): AttentionPriority {
    // Context-aware classification (optional - gracefully degrade if not available)
    let currentContext = null;
    try {
      if (contextEngine && typeof contextEngine.getCurrentZone === "function") {
        currentContext = contextEngine.getCurrentZone();
      }
    } catch (error) {
      // Context engine not available or not initialized - continue without it
    }

    // URGENT rules (requires action today)
    if (module === "planner") {
      const dueDate = metadata.dueDate as string | undefined;
      if (dueDate) {
        const daysUntilDue = this.getDaysUntil(dueDate);
        if (daysUntilDue <= 0) return "urgent"; // Overdue or due today
      }
      const priority = metadata.priority as string | undefined;
      if (priority === "urgent") return "urgent";
    }

    if (module === "calendar") {
      const startAt = metadata.startAt as string | undefined;
      if (startAt) {
        const hoursUntil = this.getHoursUntil(startAt);
        if (hoursUntil <= 1) return "urgent"; // Within 1 hour
      }
    }

    if (module === "budget") {
      const type = metadata.type as string | undefined;
      if (type === "payment_due") return "urgent";
    }

    // ATTENTION rules (needs action this week)
    if (module === "planner") {
      const dueDate = metadata.dueDate as string | undefined;
      if (dueDate) {
        const daysUntilDue = this.getDaysUntil(dueDate);
        if (daysUntilDue <= 3) return "attention"; // Due within 3 days
      }
    }

    if (module === "messages") {
      const isDirectMessage = metadata.isDirectMessage as boolean | undefined;
      if (isDirectMessage) return "attention"; // DMs need response
    }

    if (module === "calendar") {
      const startAt = metadata.startAt as string | undefined;
      if (startAt) {
        const hoursUntil = this.getHoursUntil(startAt);
        if (hoursUntil <= 24) return "attention"; // Within 24 hours
      }
    }

    // Default to FYI
    return "fyi";
  }

  /**
   * Check if item should be shown given focus mode
   */
  private shouldShowItem(item: AttentionItem): boolean {
    if (!this.focusMode.enabled) return true;

    // Always show urgent if allowed
    if (item.priority === "urgent" && this.focusMode.allowUrgent) {
      return true;
    }

    // Check whitelist
    if (
      this.focusMode.allowedModules &&
      this.focusMode.allowedModules.includes(item.module)
    ) {
      return true;
    }

    return false;
  }

  /**
   * Find an existing bundle for an item
   * Items are bundled if they're from the same module and created within
   * the bundling threshold time window
   */
  private findBundleForItem(item: AttentionItem): string | undefined {
    const thresholdMs = this.config.bundleThresholdMinutes * 60 * 1000;
    const itemTime = new Date(item.createdAt).getTime();

    for (const bundle of this.bundles.values()) {
      // Must be same module and priority
      if (
        bundle.items[0].module !== item.module ||
        bundle.priority !== item.priority
      ) {
        continue;
      }

      // Must be within time threshold
      const bundleTime = new Date(bundle.createdAt).getTime();
      if (Math.abs(itemTime - bundleTime) > thresholdMs) {
        continue;
      }

      // Must not exceed max bundle size
      if (bundle.items.length >= this.config.maxBundleSize) {
        continue;
      }

      return bundle.id;
    }

    // No existing bundle found - generate new bundle ID
    return `bundle-${item.module}-${Date.now()}`;
  }

  /**
   * Update or create bundle with item
   */
  private updateBundle(item: AttentionItem): void {
    if (!item.bundleId) return;

    let bundle = this.bundles.get(item.bundleId);

    if (!bundle) {
      // Create new bundle
      bundle = {
        id: item.bundleId,
        title: this.generateBundleTitle(item.module, 1),
        priority: item.priority,
        items: [item],
        createdAt: item.createdAt,
      };
      this.bundles.set(bundle.id, bundle);
    } else {
      // Add to existing bundle
      bundle.items.push(item);
      bundle.title = this.generateBundleTitle(item.module, bundle.items.length);
    }
  }

  /**
   * Generate bundle title based on module and count
   */
  private generateBundleTitle(module: ModuleType, count: number): string {
    const moduleNames: Record<ModuleType, string> = {
      command: "Command Center",
      notebook: "Notebook",
      planner: "Planner",
      calendar: "Calendar",
      email: "Email",
      messages: "Messages",
      lists: "Lists",
      alerts: "Alerts",
      contacts: "Contacts",
      translator: "Translator",
      photos: "Photos",
      history: "History",
      budget: "Budget",
    };

    const name = moduleNames[module] || module;
    return count === 1 ? `${name} update` : `${count} ${name} updates`;
  }

  /**
   * Re-filter all items when focus mode changes
   */
  private refilterItems(): void {
    for (const item of this.items.values()) {
      if (item.status !== "active") continue;

      if (!this.shouldShowItem(item)) {
        // Temporarily hide but don't dismiss
        item.status = "dismissed";
      }
    }
    this.notifyListeners();
  }

  /**
   * Start periodic expiry check
   * Removes expired items to keep the list fresh
   */
  private startExpiryCheck(): void {
    this.expiryCheckInterval = setInterval(() => {
      this.checkExpiredItems();
    }, this.config.expiryCheckIntervalMs);
  }

  /**
   * Check and expire old items
   */
  private checkExpiredItems(): void {
    const now = new Date();
    let hasChanges = false;

    for (const item of this.items.values()) {
      if (item.status !== "active") continue;

      if (item.expiresAt) {
        const expiryDate = new Date(item.expiresAt);
        if (now >= expiryDate) {
          item.status = "expired";
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      this.notifyListeners();
      eventBus.emit(EVENT_TYPES.USER_ACTION, {
        action: "attention:items-expired",
      });
    }
  }

  /**
   * Notify all subscribers of changes
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        logger.error("AttentionManager", "Error in attention listener", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });
  }

  /**
   * Event handlers
   */
  private handleTaskCreated = (payload: {
    data: Record<string, unknown>;
  }): void => {
    const task = payload.data as {
      id: string;
      title: string;
      priority: string;
      dueDate?: string;
    };

    this.addItem({
      id: `task-${task.id}`,
      module: "planner",
      priority: this.classifyPriority("planner", {
        priority: task.priority,
        dueDate: task.dueDate,
      }),
      status: "active",
      title: "New Task",
      summary: task.title,
      actionLabel: "View Task",
      actionTarget: `planner/task/${task.id}`,
      metadata: { taskId: task.id },
      createdAt: new Date().toISOString(),
    });
  };

  private handleUpcomingEvent = (payload: {
    data: Record<string, unknown>;
  }): void => {
    const event = payload.data as {
      id: string;
      title: string;
      startAt: string;
    };

    this.addItem({
      id: `event-${event.id}`,
      module: "calendar",
      priority: this.classifyPriority("calendar", { startAt: event.startAt }),
      status: "active",
      title: "Upcoming Event",
      summary: event.title,
      actionLabel: "View Event",
      actionTarget: `calendar/event/${event.id}`,
      metadata: { eventId: event.id },
      createdAt: new Date().toISOString(),
    });
  };

  private handleMessageReceived = (payload: {
    data: Record<string, unknown>;
  }): void => {
    const message = payload.data as {
      id: string;
      from: string;
      text: string;
      conversationId: string;
      isDirectMessage: boolean;
    };

    this.addItem({
      id: `msg-${message.id}`,
      module: "messages",
      priority: this.classifyPriority("messages", {
        isDirectMessage: message.isDirectMessage,
      }),
      status: "active",
      title: `Message from ${message.from}`,
      summary: message.text,
      actionLabel: "Reply",
      actionTarget: `messages/conversation/${message.conversationId}`,
      metadata: {
        messageId: message.id,
        conversationId: message.conversationId,
      },
      createdAt: new Date().toISOString(),
    });
  };

  /**
   * Helper: Load saved preferences
   */
  private async loadPreferences(): Promise<void> {
    try {
      // Load focus mode settings
      const focusMode = await loadFromStorage<FocusMode>(
        "attention_focus_mode",
      );
      if (focusMode) {
        this.focusMode = focusMode;
        // WHY: Align stored focus mode with settings so other systems can read it.
        await db.settings.update({ focusModeEnabled: focusMode.enabled });
      }

      // Load items and bundles
      const data = await loadFromStorage<{
        items: [string, AttentionItem][];
        bundles: [string, AttentionBundle][];
      }>("attention_items");

      if (data) {
        this.items = new Map(data.items || []);
        this.bundles = new Map(data.bundles || []);
      }
    } catch (error) {
      logger.error("AttentionManager", "Failed to load attention preferences", {
        error: error instanceof Error ? error.message : String(error),
      });
      // Start fresh on error
    }
  }

  /**
   * Helper: Save preferences to storage
   */
  private async savePreferences(): Promise<void> {
    try {
      // Save focus mode settings
      await saveToStorage("attention_focus_mode", this.focusMode);

      // Save items and bundles
      const serialized = {
        items: Array.from(this.items.entries()),
        bundles: Array.from(this.bundles.entries()),
      };
      await saveToStorage("attention_items", serialized);
    } catch (error) {
      logger.error("AttentionManager", "Failed to save attention preferences", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Helper: Get days until a date
   */
  private getDaysUntil(dateString: string): number {
    const target = new Date(dateString);
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Helper: Get hours until a date
   */
  private getHoursUntil(dateString: string): number {
    const target = new Date(dateString);
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60));
  }
}

// Export singleton instance
export const attentionManager = new AttentionManager();
