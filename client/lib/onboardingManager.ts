/**
 * Progressive Onboarding System
 *
 * Purpose (Plain English):
 * Makes the app less overwhelming by starting users with only 3 modules,
 * then gradually unlocking more as they use the app. This prevents the
 * "38 modules at once" problem and lets users discover features naturally.
 *
 * What it interacts with:
 * - Module Registry: Gets list of available modules and tracks which are unlocked
 * - Event Bus: Listens for module usage events to trigger unlocks
 * - Storage: Persists onboarding state and unlocked modules
 * - Context Engine: Uses context to suggest relevant module unlocks
 *
 * Safe AI extension points:
 * - `suggestNextModule`: Use ML to predict which module user needs next
 * - `calculateUnlockReadiness`: Learn optimal timing for module unlocks
 * - `generateContextualTip`: Use NLP to create personalized tips
 *
 * Warnings - Fragile logic:
 * - Unlock criteria must balance progression speed (too slow = frustration)
 *   vs cognitive load (too fast = overwhelm). Current thresholds are research-based.
 * - Always allow manual override - forced progression creates bad UX
 * - Preserve onboarding state across app restarts to avoid confusion
 *
 * @module OnboardingManager
 * @author AIOS Development Team
 * @version 1.0.0
 */

import { ModuleType } from "@/models/types";
import { eventBus, EVENT_TYPES } from "./eventBus";
import { moduleRegistry } from "./moduleRegistry";

/**
 * Onboarding stage
 * - not_started: User hasn't begun onboarding
 * - initial_selection: User is selecting their first 3 modules
 * - active: User is in guided discovery mode
 * - completed: User has completed onboarding or opted out
 */
export type OnboardingStage =
  | "not_started"
  | "initial_selection"
  | "active"
  | "completed";

/**
 * Module unlock reason
 * Helps users understand why a module became available
 */
export type UnlockReason =
  | "initial_selection" // User chose this in initial setup
  | "usage_milestone" // Unlocked after using app X times
  | "related_module" // Unlocked because user uses related module frequently
  | "context_suggestion" // AI suggested based on context
  | "manual_unlock" // User manually unlocked from module grid
  | "time_based"; // Unlocked after X days of usage

/**
 * Unlocked module metadata
 */
export interface UnlockedModule {
  module: ModuleType;
  unlockedAt: string; // ISO timestamp
  reason: UnlockReason;
  shownWelcomeTip: boolean; // Have we shown the welcome tip for this module?
}

/**
 * Contextual tip for guiding users
 */
export interface ContextualTip {
  id: string;
  module: ModuleType;
  title: string;
  message: string;
  actionLabel?: string;
  actionTarget?: string;
  createdAt: string;
  expiresAt?: string;
  dismissed: boolean;
}

/**
 * Onboarding state
 */
export interface OnboardingState {
  stage: OnboardingStage;
  unlockedModules: Map<ModuleType, UnlockedModule>;
  tips: Map<string, ContextualTip>;
  usageCount: number; // Total module opens
  startedAt?: string; // When onboarding began
  completedAt?: string; // When user completed/skipped onboarding
}

/**
 * Unlock criteria configuration
 * 
 * Why these values:
 * - Research shows users need 5-7 sessions to form habits
 * - Unlocking every 3 uses prevents overwhelm while maintaining momentum
 * - 7 days is enough time to establish core workflow without feeling blocked
 */
interface UnlockConfig {
  usageCountPerUnlock: number; // Unlock a new module every N uses
  maxAutoUnlocksPerDay: number; // Don't unlock more than N modules per day
  minDaysBetweenUnlocks: number; // Wait at least N days before next unlock
  initialModuleCount: number; // Start with N modules
  completionModuleCount: number; // Suggest completion after N modules unlocked
}

const DEFAULT_CONFIG: UnlockConfig = {
  usageCountPerUnlock: 3, // Unlock every 3 module uses
  maxAutoUnlocksPerDay: 2, // Max 2 auto-unlocks per day
  minDaysBetweenUnlocks: 0, // Can unlock immediately if usage threshold met
  initialModuleCount: 3, // Start with 3 modules
  completionModuleCount: 10, // Suggest onboarding complete after 10 modules
};

/**
 * Module unlock priority
 * Determines which modules should be suggested first
 * Higher priority = more likely to be useful early
 */
const MODULE_PRIORITY: Record<ModuleType, number> = {
  command: 100, // Always available (entry point)
  planner: 90, // Task management is core
  notebook: 85, // Note-taking is essential
  calendar: 80, // Scheduling is common need
  messages: 75, // Communication is key
  lists: 70, // Simple and useful
  email: 65, // Professional users need this
  alerts: 60, // Reminders are helpful
  contacts: 55, // Directory management
  budget: 50, // Finance tracking
  photos: 45, // Media management
  translator: 40, // Specialized tool
  history: 35, // Analytics/tracking
  integrations: 30, // Advanced feature
  settings: 25, // Configuration (always accessible)
};

/**
 * Onboarding Manager Class
 */
class OnboardingManager {
  private state: OnboardingState = {
    stage: "not_started",
    unlockedModules: new Map(),
    tips: new Map(),
    usageCount: 0,
  };
  private config: UnlockConfig = DEFAULT_CONFIG;
  private listeners: Set<() => void> = new Set();
  private eventUnsubscribers: Array<() => void> = [];
  private lastUnlockDate?: Date;
  private lastUnlockThreshold = 0; // Track when we last unlocked to avoid modulo issues

  /**
   * Initialize the onboarding manager
   */
  async initialize(): Promise<void> {
    // Load saved state
    await this.loadState();

    // Subscribe to events
    this.eventUnsubscribers.push(
      eventBus.on(EVENT_TYPES.MODULE_OPENED, this.handleModuleOpened)
    );

    // Ensure command center is always unlocked
    if (!this.state.unlockedModules.has("command")) {
      this.unlockModule("command", "initial_selection");
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.eventUnsubscribers.forEach((unsub) => unsub());
    this.eventUnsubscribers = [];
    this.listeners.clear();
    
    // Reset state to initial values
    this.state = {
      stage: "not_started",
      unlockedModules: new Map(),
      tips: new Map(),
      usageCount: 0,
    };
    this.lastUnlockDate = undefined;
    this.lastUnlockThreshold = 0;
  }

  /**
   * Get current onboarding stage
   */
  getStage(): OnboardingStage {
    return this.state.stage;
  }

  /**
   * Check if a module is unlocked
   */
  isModuleUnlocked(module: ModuleType): boolean {
    return this.state.unlockedModules.has(module);
  }

  /**
   * Get all unlocked modules
   */
  getUnlockedModules(): UnlockedModule[] {
    return Array.from(this.state.unlockedModules.values()).sort(
      (a, b) =>
        new Date(a.unlockedAt).getTime() - new Date(b.unlockedAt).getTime()
    );
  }

  /**
   * Get modules that are still locked
   */
  getLockedModules(): ModuleType[] {
    const allModules = moduleRegistry.getAllModules().map((m) => m.id);
    return allModules.filter((m) => !this.isModuleUnlocked(m));
  }

  /**
   * Start onboarding with initial module selection
   *
   * @param selectedModules - The 3 modules user chose to start with
   */
  async startOnboarding(selectedModules: ModuleType[]): Promise<void> {
    if (selectedModules.length !== this.config.initialModuleCount) {
      throw new Error(
        `Must select exactly ${this.config.initialModuleCount} modules`
      );
    }

    this.state.stage = "active";
    this.state.startedAt = new Date().toISOString();
    this.state.usageCount = 0;

    // Unlock command center + selected modules
    this.unlockModule("command", "initial_selection");
    selectedModules.forEach((module) => {
      this.unlockModule(module, "initial_selection");
    });

    await this.saveState();
    this.notifyListeners();

    eventBus.emit(EVENT_TYPES.USER_ACTION, {
      action: "onboarding:started",
      modules: selectedModules,
    });
  }

  /**
   * Complete onboarding (user opts out of guided discovery)
   *
   * @param unlockAll - Whether to unlock all modules immediately
   */
  async completeOnboarding(unlockAll = false): Promise<void> {
    this.state.stage = "completed";
    this.state.completedAt = new Date().toISOString();

    if (unlockAll) {
      const allModules = moduleRegistry.getAllModules();
      allModules.forEach((module) => {
        if (!this.isModuleUnlocked(module.id)) {
          this.unlockModule(module.id, "manual_unlock");
        }
      });
    }

    await this.saveState();
    this.notifyListeners();

    eventBus.emit(EVENT_TYPES.USER_ACTION, {
      action: "onboarding:completed",
      unlockedAll: unlockAll,
    });
  }

  /**
   * Skip onboarding entirely
   * Unlocks all modules and marks onboarding as complete
   */
  async skipOnboarding(): Promise<void> {
    await this.completeOnboarding(true);
  }

  /**
   * Manually unlock a module
   * User explicitly requested to unlock this module
   */
  async manualUnlock(module: ModuleType): Promise<void> {
    if (this.isModuleUnlocked(module)) {
      return;
    }

    this.unlockModule(module, "manual_unlock");
    await this.saveState();
    this.notifyListeners();

    eventBus.emit(EVENT_TYPES.USER_ACTION, {
      action: "onboarding:manual-unlock",
      module,
    });
  }

  /**
   * Get active contextual tips
   */
  getActiveTips(): ContextualTip[] {
    return Array.from(this.state.tips.values())
      .filter((tip) => !tip.dismissed)
      .filter((tip) => {
        if (!tip.expiresAt) return true;
        return new Date(tip.expiresAt) > new Date();
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  /**
   * Dismiss a contextual tip
   */
  async dismissTip(tipId: string): Promise<void> {
    const tip = this.state.tips.get(tipId);
    if (!tip) return;

    tip.dismissed = true;
    await this.saveState();
    this.notifyListeners();

    eventBus.emit(EVENT_TYPES.USER_ACTION, {
      action: "onboarding:tip-dismissed",
      tipId,
    });
  }

  /**
   * Get onboarding progress percentage
   * Based on number of modules unlocked
   */
  getProgress(): number {
    const totalModules = moduleRegistry.getAllModules().length;
    const unlockedCount = this.state.unlockedModules.size;
    return Math.round((unlockedCount / totalModules) * 100);
  }

  /**
   * Get usage statistics
   */
  getStats(): {
    unlockedCount: number;
    lockedCount: number;
    usageCount: number;
    daysSinceStart: number;
  } {
    const totalModules = moduleRegistry.getAllModules().length;
    const unlockedCount = this.state.unlockedModules.size;
    const daysSinceStart = this.state.startedAt
      ? this.getDaysSince(this.state.startedAt)
      : 0;

    return {
      unlockedCount,
      lockedCount: totalModules - unlockedCount,
      usageCount: this.state.usageCount,
      daysSinceStart,
    };
  }

  /**
   * Subscribe to onboarding state changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Unlock a module
   *
   * @param module - Module to unlock
   * @param reason - Why this module is being unlocked
   * @returns Whether module was newly unlocked (false if already unlocked)
   */
  private unlockModule(module: ModuleType, reason: UnlockReason): boolean {
    if (this.isModuleUnlocked(module)) {
      return false;
    }

    const unlock: UnlockedModule = {
      module,
      unlockedAt: new Date().toISOString(),
      reason,
      shownWelcomeTip: false,
    };

    this.state.unlockedModules.set(module, unlock);

    // Create welcome tip for this module
    this.createWelcomeTip(module);

    return true;
  }

  /**
   * Create a welcome tip for a newly unlocked module
   */
  private createWelcomeTip(module: ModuleType): void {
    const moduleInfo = moduleRegistry.getModule(module);
    if (!moduleInfo) return;

    const tip: ContextualTip = {
      id: `welcome-${module}-${Date.now()}`,
      module,
      title: `${moduleInfo.name} unlocked!`,
      message: `You can now use ${moduleInfo.name} to ${this.getModuleDescription(module)}.`,
      actionLabel: `Open ${moduleInfo.name}`,
      actionTarget: module,
      createdAt: new Date().toISOString(),
      expiresAt: this.hoursFromNow(24), // Tips expire after 24 hours
      dismissed: false,
    };

    this.state.tips.set(tip.id, tip);
  }

  /**
   * Get user-friendly description of what a module does
   */
  private getModuleDescription(module: ModuleType): string {
    const descriptions: Record<ModuleType, string> = {
      command: "get AI-powered recommendations",
      planner: "manage tasks and projects",
      notebook: "take notes and capture ideas",
      calendar: "schedule events and meetings",
      messages: "chat with contacts",
      lists: "create checklists",
      email: "manage your inbox",
      alerts: "set reminders",
      contacts: "manage your contacts",
      budget: "track expenses",
      photos: "organize your photos",
      translator: "translate languages",
      history: "view your activity history",
      integrations: "connect external services",
      settings: "customize your experience",
    };
    return descriptions[module] || "explore new features";
  }

  /**
   * Check if we should auto-unlock a new module
   * Called after each module usage
   */
  private checkAutoUnlock(): void {
    if (this.state.stage !== "active") {
      return; // Only auto-unlock during active onboarding
    }

    // Check usage threshold
    const shouldUnlock =
      this.state.usageCount %this.config.usageCountPerUnlock === 0 &&
      this.state.usageCount > 0;

    if (!shouldUnlock) {
      return;
    }

    // Check daily limit
    if (this.lastUnlockDate && this.isToday(this.lastUnlockDate)) {
      const unlocksToday = Array.from(
        this.state.unlockedModules.values()
      ).filter((u) => this.isToday(new Date(u.unlockedAt))).length;

      if (unlocksToday >= this.config.maxAutoUnlocksPerDay) {
        return; // Hit daily limit
      }
    }

    // Find next module to unlock
    const nextModule = this.suggestNextModule();
    if (nextModule) {
      this.unlockModule(nextModule, "usage_milestone");
      this.lastUnlockDate = new Date();
      this.saveState();
      this.notifyListeners();

      eventBus.emit(EVENT_TYPES.USER_ACTION, {
        action: "onboarding:auto-unlock",
        module: nextModule,
        usageCount: this.state.usageCount,
      });
    }

    // Check if we should suggest completing onboarding
    if (
      this.state.unlockedModules.size >= this.config.completionModuleCount
    ) {
      this.createCompletionTip();
    }
  }

  /**
   * Suggest the next module to unlock
   * Uses priority scoring and usage patterns
   *
   * Safe AI extension point: Replace with ML-based suggestion
   */
  private suggestNextModule(): ModuleType | null {
    const locked = this.getLockedModules();
    if (locked.length === 0) {
      return null;
    }

    // Sort by priority (highest first)
    const sorted = locked.sort((a, b) => {
      const priorityA = MODULE_PRIORITY[a] || 0;
      const priorityB = MODULE_PRIORITY[b] || 0;
      return priorityB - priorityA;
    });

    return sorted[0];
  }

  /**
   * Create a tip suggesting user complete onboarding
   */
  private createCompletionTip(): void {
    // Only create if tip doesn't already exist
    const existingTip = Array.from(this.state.tips.values()).find(
      (t) => t.id.startsWith("completion-")
    );

    if (existingTip && !existingTip.dismissed) {
      return;
    }

    const tip: ContextualTip = {
      id: `completion-${Date.now()}`,
      module: "command",
      title: "You're doing great!",
      message: `You've unlocked ${this.state.unlockedModules.size} modules. Ready to explore everything AIOS has to offer?`,
      actionLabel: "Unlock All Modules",
      createdAt: new Date().toISOString(),
      dismissed: false,
    };

    this.state.tips.set(tip.id, tip);
  }

  /**
   * Event handlers
   */
  private handleModuleOpened = (payload: {
    data: Record<string, unknown>;
  }): void => {
    const { module } = payload.data as { module: ModuleType };

    // Only count if module is unlocked
    if (!this.isModuleUnlocked(module)) {
      return;
    }

    this.state.usageCount++;
    this.checkAutoUnlock();

    // Save state periodically (every 5 uses)
    if (this.state.usageCount % 5 === 0) {
      this.saveState();
    }

    this.notifyListeners();
  };

  /**
   * Notify all subscribers of changes
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        console.error("Error in onboarding listener:", error);
      }
    });
  }

  /**
   * Helper: Load saved state from storage
   */
  private async loadState(): Promise<void> {
    // Placeholder - implement with AsyncStorage
    // For now, start fresh each time
  }

  /**
   * Helper: Save state to storage
   */
  private async saveState(): Promise<void> {
    // Placeholder - implement with AsyncStorage
  }

  /**
   * Helper: Get days since a date
   */
  private getDaysSince(dateString: string): number {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Helper: Check if a date is today
   */
  private isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Helper: Get ISO timestamp for hours from now
   */
  private hoursFromNow(hours: number): string {
    const date = new Date();
    date.setHours(date.getHours() + hours);
    return date.toISOString();
  }
}

// Export singleton instance
export const onboardingManager = new OnboardingManager();
