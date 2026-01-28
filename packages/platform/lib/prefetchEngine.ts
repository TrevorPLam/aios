/**
 * How to Use:
 * - Call prefetchEngine.onModuleEnter(moduleId) on navigation changes.
 * - Use prefetchEngine.predictNextModules(moduleId) for insights.
 *
 * UI integration example:
 * - useAnalyticsNavigation (wired in App.tsx) forwards module transitions to prefetchEngine.
 *
 * Public API:
 * - prefetchEngine.
 *
 * Expected usage pattern:
 * - Initialize once and feed it navigation events for accurate predictions.
 *
 * WHY: Keeps prefetch decisions centralized so background work stays bounded.
 */
/**
 * Predictive Prefetch Engine
 *
 * Purpose (Plain English):
 * Predicts which modules user will open next and loads them in the background.
 * Like a smart assistant who prepares things before you ask - if you open Calendar,
 * it might pre-load Maps (for directions to events) and Contacts (for inviting people).
 *
 * What it interacts with:
 * - Lazy loader (to actually load modules)
 * - Module registry (to track usage patterns)
 * - Analytics (to learn from user behavior)
 * - Storage (to persist learned patterns)
 *
 * Technical Implementation:
 * Tracks module transitions (Calendar → Maps) and builds a probability model.
 * Uses time of day, day of week, and recent history to predict next modules.
 * Prefetches top 2-3 predicted modules when system is idle.
 *
 * Safe AI Extension Points:
 * - Improve prediction algorithm (ML model, time-based patterns)
 * - Add context awareness (location, time of day)
 * - Personalized learning per user
 * - A/B test different strategies
 *
 * Fragile Logic Warnings:
 * - Must not impact app performance (background only)
 * - Must respect battery/memory constraints
 * - Pattern storage must be bounded (max size)
 * - Prefetch must be cancellable
 */

import { ModuleType } from "@aios/contracts/models/types";
import { lazyLoader } from "./lazyLoader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logger } from "@aios/platform/lib/logger";
import { Platform } from "react-native";
import { memoryManager } from "./memoryManager";

/**
 * Module Transition
 *
 * Records that user went from one module to another.
 */
interface ModuleTransition {
  from: ModuleType;
  to: ModuleType;
  timestamp: string;
  timeSpent: number; // seconds in 'from' module
}

/**
 * Transition Pattern
 *
 * Statistical pattern of module transitions.
 */
interface TransitionPattern {
  from: ModuleType;
  to: ModuleType;
  count: number;
  probability: number; // 0-1
  averageTimeSpent: number; // seconds
}

/**
 * Prediction Result
 */
interface Prediction {
  moduleId: ModuleType;
  probability: number; // 0-1
  reason: string; // Plain English explanation
}

/**
 * Prefetch Strategy
 */
interface PrefetchStrategy {
  maxPrefetch: number; // Max modules to prefetch at once
  minProbability: number; // Minimum probability to prefetch (0-1)
  prefetchDelay: number; // Delay before prefetching (ms)
  respectBattery: boolean; // Skip prefetch on low battery
  respectMemory: boolean; // Skip prefetch on low memory
}

/**
 * Storage Keys
 */
const STORAGE_KEYS = {
  TRANSITIONS: "@prefetch:transitions",
  PATTERNS: "@prefetch:patterns",
  LAST_MODULE: "@prefetch:lastModule",
  MODULE_ENTER_TIME: "@prefetch:enterTime",
};

const LOW_BATTERY_THRESHOLD = 0.2;

/**
 * Predictive Prefetch Engine
 *
 * Learns from user behavior to predict and preload next modules.
 */
class PrefetchEngine {
  private transitions: ModuleTransition[];
  private patterns: Map<string, TransitionPattern>;
  private currentModule: ModuleType | null;
  private moduleEnterTime: Date | null;
  private strategy: PrefetchStrategy;
  private prefetchTimeout: NodeJS.Timeout | null;
  private initialized: boolean;
  private batteryLevel: number | null;

  constructor() {
    this.transitions = [];
    this.patterns = new Map();
    this.currentModule = null;
    this.moduleEnterTime = null;
    this.prefetchTimeout = null;
    this.initialized = false;
    this.batteryLevel = null;

    // Default strategy (iOS-optimized)
    this.strategy = {
      maxPrefetch: 3,
      minProbability: 0.2,
      prefetchDelay: 1000, // 1 second delay
      respectBattery: true,
      respectMemory: true,
    };
  }

  /**
   * Initialize Engine
   *
   * Plain English: "Load saved patterns from storage"
   * Must be called before using the engine.
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Load transitions
      const transitionsJson = await AsyncStorage.getItem(
        STORAGE_KEYS.TRANSITIONS,
      );
      if (transitionsJson) {
        this.transitions = JSON.parse(transitionsJson);
      }

      // Load patterns
      const patternsJson = await AsyncStorage.getItem(STORAGE_KEYS.PATTERNS);
      if (patternsJson) {
        const patternsArray: TransitionPattern[] = JSON.parse(patternsJson);
        patternsArray.forEach((pattern) => {
          const key = this.getPatternKey(pattern.from, pattern.to);
          this.patterns.set(key, pattern);
        });
      }

      // Load last module
      const lastModule = await AsyncStorage.getItem(STORAGE_KEYS.LAST_MODULE);
      if (lastModule) {
        this.currentModule = lastModule as ModuleType;
      }

      this.initialized = true;
      logger.info("PrefetchEngine", "Initialized", {
        patternsCount: this.patterns.size,
      });
    } catch (error) {
      logger.error("PrefetchEngine", "Initialization error", {
        error: error instanceof Error ? error.message : String(error),
      });
      this.initialized = true; // Continue anyway
    }
  }

  /**
   * Record Module Enter
   *
   * Plain English: "User just opened a module"
   * Records timestamp and triggers prefetch predictions.
   *
   * @param moduleId - Module user entered
   */
  async onModuleEnter(moduleId: ModuleType): Promise<void> {
    await this.initialize();

    const now = new Date();
    const previousModule = this.currentModule;

    // If we had a previous module, record the transition
    if (previousModule && this.moduleEnterTime) {
      const timeSpent = (now.getTime() - this.moduleEnterTime.getTime()) / 1000;

      const transition: ModuleTransition = {
        from: previousModule,
        to: moduleId,
        timestamp: now.toISOString(),
        timeSpent,
      };

      this.recordTransition(transition);
    }

    // Update current state
    this.currentModule = moduleId;
    this.moduleEnterTime = now;

    // Save current module
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_MODULE, moduleId);
      await AsyncStorage.setItem(
        STORAGE_KEYS.MODULE_ENTER_TIME,
        now.toISOString(),
      );
    } catch (error) {
      // WHY: Prefetch is best-effort; failing to persist should not crash navigation.
      logger.error("PrefetchEngine", "Failed to persist module entry", {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Trigger prefetch predictions (with delay)
    this.schedulePrefetch(moduleId);
  }

  /**
   * Record Transition
   *
   * Plain English: "Remember that user went from A to B"
   * Updates transition history and patterns.
   *
   * @param transition - Transition to record
   */
  private async recordTransition(transition: ModuleTransition): Promise<void> {
    // Add to history
    this.transitions.push(transition);

    // Keep only last 1000 transitions (memory bound)
    if (this.transitions.length > 1000) {
      this.transitions = this.transitions.slice(-1000);
    }

    // Update patterns
    this.updatePatterns(transition);

    // Save to storage (debounced)
    this.saveTransitions();
  }

  /**
   * Update Patterns
   *
   * Plain English: "Update probability that A leads to B"
   *
   * Technical: Calculates transition probabilities based on historical data.
   * Uses exponential moving average for time spent.
   *
   * @param transition - New transition to learn from
   */
  private updatePatterns(transition: ModuleTransition): void {
    const key = this.getPatternKey(transition.from, transition.to);
    const existing = this.patterns.get(key);

    if (existing) {
      // Update existing pattern
      const newCount = existing.count + 1;
      const newAvgTime =
        (existing.averageTimeSpent * existing.count + transition.timeSpent) /
        newCount;

      this.patterns.set(key, {
        ...existing,
        count: newCount,
        averageTimeSpent: newAvgTime,
      });
    } else {
      // Create new pattern
      this.patterns.set(key, {
        from: transition.from,
        to: transition.to,
        count: 1,
        probability: 0, // Will be calculated on demand
        averageTimeSpent: transition.timeSpent,
      });
    }

    // Recalculate probabilities for all transitions from this module
    this.recalculateProbabilities(transition.from);
  }

  /**
   * Recalculate Probabilities
   *
   * Plain English: "Update % chance of going to each module from current module"
   *
   * @param fromModule - Module to recalculate for
   */
  private recalculateProbabilities(fromModule: ModuleType): void {
    // Get all patterns from this module
    const fromPatterns = Array.from(this.patterns.values()).filter(
      (p) => p.from === fromModule,
    );

    const totalCount = fromPatterns.reduce((sum, p) => sum + p.count, 0);

    // Update probabilities
    fromPatterns.forEach((pattern) => {
      const key = this.getPatternKey(pattern.from, pattern.to);
      const probability = totalCount > 0 ? pattern.count / totalCount : 0;

      this.patterns.set(key, {
        ...pattern,
        probability,
      });
    });
  }

  /**
   * Get Pattern Key
   *
   * @param from - From module
   * @param to - To module
   * @returns Unique key for this transition
   */
  private getPatternKey(from: ModuleType, to: ModuleType): string {
    return `${from}→${to}`;
  }

  /**
   * Schedule Prefetch
   *
   * Plain English: "Plan to load predicted modules in a moment"
   * Uses delay to avoid interfering with current module load.
   *
   * @param currentModule - Module user is currently in
   */
  private schedulePrefetch(currentModule: ModuleType): void {
    // Cancel any pending prefetch
    if (this.prefetchTimeout) {
      clearTimeout(this.prefetchTimeout);
    }

    // Schedule new prefetch
    this.prefetchTimeout = setTimeout(() => {
      this.executePrefetch(currentModule);
    }, this.strategy.prefetchDelay);
  }

  /**
   * Execute Prefetch
   *
   * Plain English: "Actually load the predicted modules now"
   *
   * @param currentModule - Module user is in
   */
  private async executePrefetch(currentModule: ModuleType): Promise<void> {
    // Check constraints
    if (!this.shouldPrefetch()) {
      logger.debug("PrefetchEngine", "Skipping prefetch due to constraints");
      return;
    }

    // Get predictions
    const predictions = this.predictNextModules(currentModule);

    if (predictions.length === 0) {
      logger.debug("PrefetchEngine", "No predictions", { currentModule });
      return;
    }

    // Filter by strategy
    const toPrefetch = predictions
      .filter((p) => p.probability >= this.strategy.minProbability)
      .slice(0, this.strategy.maxPrefetch)
      .map((p) => p.moduleId);

    if (toPrefetch.length === 0) {
      return;
    }

    logger.info("PrefetchEngine", "Prefetching modules", {
      modules: toPrefetch,
    });

    // Trigger prefetch
    lazyLoader.preloadModules(toPrefetch, "prefetch");
  }

  /**
   * Predict Next Modules
   *
   * Plain English: "Guess which modules user will open next"
   *
   * Technical: Uses learned patterns plus time-of-day heuristics.
   * Returns top predictions sorted by probability.
   *
   * @param currentModule - Module user is currently in
   * @returns Predicted next modules with probabilities
   */
  predictNextModules(currentModule: ModuleType): Prediction[] {
    // Get patterns from current module
    const fromPatterns = Array.from(this.patterns.values())
      .filter((p) => p.from === currentModule)
      .sort((a, b) => b.probability - a.probability);

    const predictions: Prediction[] = fromPatterns.map((pattern) => ({
      moduleId: pattern.to,
      probability: pattern.probability,
      reason: `${(pattern.probability * 100).toFixed(0)}% of the time when in ${currentModule}, you go to ${pattern.to}`,
    }));

    // Add time-based predictions
    const timeBasedPredictions = this.getTimeBasedPredictions();
    predictions.push(...timeBasedPredictions);

    // Deduplicate and sort
    const seen = new Set<ModuleType>();
    const uniquePredictions = predictions.filter((p) => {
      if (seen.has(p.moduleId)) {
        return false;
      }
      seen.add(p.moduleId);
      return true;
    });

    uniquePredictions.sort((a, b) => b.probability - a.probability);

    return uniquePredictions.slice(0, 10);
  }

  /**
   * Get Time-Based Predictions
   *
   * Plain English: "Predict modules based on time of day"
   *
   * Example: Morning = Calendar, Planner. Evening = Messages, Budget.
   *
   * @returns Time-based predictions
   */
  private getTimeBasedPredictions(): Prediction[] {
    const now = new Date();
    const hour = now.getHours();
    const predictions: Prediction[] = [];

    // Morning (6-12): Productivity modules
    if (hour >= 6 && hour < 12) {
      predictions.push(
        {
          moduleId: "calendar",
          probability: 0.3,
          reason: "Morning: People often check Calendar in the morning",
        },
        {
          moduleId: "planner",
          probability: 0.25,
          reason: "Morning: People often review tasks in the morning",
        },
        {
          moduleId: "notebook",
          probability: 0.2,
          reason: "Morning: People often review notes in the morning",
        },
      );
    }

    // Afternoon (12-18): Work modules
    if (hour >= 12 && hour < 18) {
      predictions.push(
        {
          moduleId: "messages",
          probability: 0.25,
          reason: "Afternoon: Peak messaging time",
        },
        {
          moduleId: "calendar",
          probability: 0.2,
          reason: "Afternoon: Checking upcoming meetings",
        },
      );
    }

    // Evening (18-24): Personal modules
    if (hour >= 18 || hour < 6) {
      predictions.push(
        {
          moduleId: "budget",
          probability: 0.2,
          reason: "Evening: People often review finances at night",
        },
        {
          moduleId: "messages",
          probability: 0.25,
          reason: "Evening: Personal messaging time",
        },
      );
    }

    return predictions;
  }

  /**
   * Should Prefetch
   *
   * Plain English: "Is it a good time to load modules in background?"
   * Checks battery, memory, and other constraints.
   *
   * @returns True if should prefetch
   */
  private shouldPrefetch(): boolean {
    if (this.strategy.respectBattery && Platform.OS === "ios") {
      // WHY: Avoid background prefetching when battery is low on iOS to protect UX.
      if (
        this.batteryLevel !== null &&
        this.batteryLevel <= LOW_BATTERY_THRESHOLD
      ) {
        return false;
      }
    }

    if (this.strategy.respectMemory) {
      const memoryInfo = memoryManager.getCurrentMemoryUsage();
      // WHY: Skip prefetch if memory pressure is already high to prevent jank.
      if (
        memoryInfo.pressure === "high" ||
        memoryInfo.pressure === "critical"
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Update Battery Level
   *
   * Plain English: "Let the app report the current battery level."
   *
   * @param level - Battery level from 0 to 1, or null when unavailable
   */
  updateBatteryLevel(level: number | null): void {
    if (level === null || Number.isNaN(level)) {
      // WHY: Treat missing battery data as unknown rather than blocking prefetch.
      this.batteryLevel = null;
      return;
    }

    this.batteryLevel = Math.max(0, Math.min(1, level));
  }

  /**
   * Save Transitions to Storage
   *
   * Debounced save to avoid too many writes.
   */
  private saveTimeout: NodeJS.Timeout | null = null;
  private async saveTransitions(): Promise<void> {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(async () => {
      try {
        // Save transitions
        await AsyncStorage.setItem(
          STORAGE_KEYS.TRANSITIONS,
          JSON.stringify(this.transitions),
        );

        // Save patterns
        const patternsArray = Array.from(this.patterns.values());
        await AsyncStorage.setItem(
          STORAGE_KEYS.PATTERNS,
          JSON.stringify(patternsArray),
        );

        logger.debug("PrefetchEngine", "Saved patterns", {
          count: this.patterns.size,
        });
      } catch (error) {
        logger.error("PrefetchEngine", "Save error", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }, 2000); // 2 second debounce
  }

  /**
   * Get Statistics
   *
   * Plain English: "Show me what the engine has learned"
   *
   * @returns Statistics about learned patterns
   */
  getStatistics(): {
    totalTransitions: number;
    totalPatterns: number;
    topPatterns: TransitionPattern[];
    initialized: boolean;
  } {
    const sortedPatterns = Array.from(this.patterns.values()).sort(
      (a, b) => b.probability - a.probability,
    );

    return {
      totalTransitions: this.transitions.length,
      totalPatterns: this.patterns.size,
      topPatterns: sortedPatterns.slice(0, 10),
      initialized: this.initialized,
    };
  }

  /**
   * Clear All Data
   *
   * Plain English: "Forget everything learned, start fresh"
   * Used for testing or user reset.
   */
  async clearAllData(): Promise<void> {
    this.transitions = [];
    this.patterns.clear();
    this.currentModule = null;
    this.moduleEnterTime = null;
    // WHY: Clear pending timers to avoid background work after reset.
    if (this.prefetchTimeout) {
      clearTimeout(this.prefetchTimeout);
      this.prefetchTimeout = null;
    }
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }

    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TRANSITIONS,
      STORAGE_KEYS.PATTERNS,
      STORAGE_KEYS.LAST_MODULE,
      STORAGE_KEYS.MODULE_ENTER_TIME,
    ]);

    logger.info("PrefetchEngine", "Cleared all data");
  }

  /**
   * Update Strategy
   *
   * @param strategy - New strategy settings
   */
  updateStrategy(strategy: Partial<PrefetchStrategy>): void {
    this.strategy = {
      ...this.strategy,
      ...strategy,
    };
  }

  /**
   * Get Current Strategy
   *
   * @returns Current prefetch strategy
   */
  getStrategy(): PrefetchStrategy {
    return { ...this.strategy };
  }
}

// Export singleton instance
export const prefetchEngine = new PrefetchEngine();
