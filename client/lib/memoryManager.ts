/**
 * How to Use:
 * - Register module mounts/access via memoryManager.registerModuleMount/access.
 * - Read memoryManager.getStatistics() for diagnostics.
 *
 * UI integration example:
 * - useAnalyticsNavigation (used in App.tsx) registers module access with memoryManager.
 *
 * Public API:
 * - MemoryUsageInfo, memoryManager.
 *
 * Expected usage pattern:
 * - Call register hooks from navigation/analytics layers, not individual screens.
 *
 * WHY: Keeps memory pressure handling consistent and avoids per-screen duplication.
 */
/**
 * Memory Manager
 *
 * Purpose (Plain English):
 * Keeps the app's memory usage under control when running 20+ modules. Like a
 * librarian who removes old books from the reading room when space runs out.
 * Unloads modules that haven't been used recently to free up memory.
 *
 * What it interacts with:
 * - React Navigation (to know which screens are mounted)
 * - Module registry (to track usage)
 * - Performance monitoring (to detect memory pressure)
 * - Event bus (to notify about memory events)
 *
 * Technical Implementation:
 * Monitors memory usage on iOS using performance APIs. When memory pressure
 * is detected, unmounts least-recently-used modules. Uses a soft limit
 * (trigger cleanup) and hard limit (aggressive cleanup).
 *
 * Safe AI Extension Points:
 * - Tune memory thresholds for different iOS devices
 * - Improve module importance scoring
 * - Add predictive cleanup before memory issues
 * - Customize cleanup strategies per module type
 *
 * Fragile Logic Warnings:
 * - Must not unmount the currently active module
 * - Must preserve critical state before unmounting
 * - Memory API may not be available on all platforms
 * - Aggressive cleanup can impact user experience
 */

import { Platform } from "react-native";
import { ModuleType } from "@/models/types";
import { eventBus } from "./eventBus";
import { EVENT_TYPES } from "./eventBus";
import { logger } from "@/utils/logger";

/**
 * Memory Usage Info
 *
 * Information about current memory state.
 */
export interface MemoryUsageInfo {
  usedMemoryMB: number; // Currently used memory in MB
  totalMemoryMB: number; // Total available memory in MB
  percentUsed: number; // 0-100
  pressure: "none" | "low" | "medium" | "high" | "critical";
  timestamp: string;
}

/**
 * Module Memory Info
 *
 * Tracks memory usage per module.
 */
interface ModuleMemoryInfo {
  moduleId: ModuleType;
  estimatedMemoryMB: number; // Estimated memory usage
  mountedAt: Date;
  lastAccessedAt: Date;
  accessCount: number;
  isPinned: boolean; // Pinned modules never get unmounted
}

/**
 * Memory Strategy
 *
 * Configuration for memory management.
 */
interface MemoryStrategy {
  softLimitMB: number; // Start cleanup at this threshold
  hardLimitMB: number; // Aggressive cleanup at this threshold
  checkIntervalMs: number; // How often to check memory
  minModulesToKeep: number; // Always keep at least this many modules
  cleanupBatchSize: number; // Unmount this many modules at once
}

/**
 * Memory Event
 */
type MemoryEvent = "warning" | "cleanup" | "critical";

/**
 * Memory Manager Class
 *
 * Manages app memory by unmounting unused modules.
 */
class MemoryManager {
  private moduleMemoryInfo: Map<ModuleType, ModuleMemoryInfo>;
  private currentModule: ModuleType | null;
  private strategy: MemoryStrategy;
  private monitoringInterval: NodeJS.Timeout | null;
  private lastMemoryCheck: MemoryUsageInfo | null;

  constructor() {
    this.moduleMemoryInfo = new Map();
    this.currentModule = null;
    this.monitoringInterval = null;
    this.lastMemoryCheck = null;

    // iOS-optimized strategy
    // Typical iOS device has 2-4GB RAM, app should use < 200MB
    this.strategy = {
      softLimitMB: 150, // Start cleanup at 150MB
      hardLimitMB: 180, // Aggressive cleanup at 180MB
      checkIntervalMs: 10000, // Check every 10 seconds
      minModulesToKeep: 3, // Always keep at least 3 modules
      cleanupBatchSize: 2, // Unmount 2 modules per cleanup
    };

    logger.info("MemoryManager", "Initialized with strategy", { strategy: this.strategy });
  }

  /**
   * Start Monitoring
   *
   * Plain English: "Begin watching memory usage"
   * Starts periodic memory checks. Call this on app startup.
   */
  startMonitoring(): void {
    if (this.monitoringInterval) {
      logger.debug("MemoryManager", "Already monitoring");
      return;
    }

    logger.info("MemoryManager", "Starting memory monitoring");

    this.monitoringInterval = setInterval(() => {
      this.checkMemoryAndCleanup();
    }, this.strategy.checkIntervalMs);

    // Do initial check
    this.checkMemoryAndCleanup();
  }

  /**
   * Stop Monitoring
   *
   * Plain English: "Stop watching memory usage"
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      logger.info("MemoryManager", "Stopped monitoring");
    }
  }

  /**
   * Register Module Mount
   *
   * Plain English: "Remember that this module was loaded into memory"
   *
   * @param moduleId - Module that was mounted
   * @param estimatedMemoryMB - Estimated memory usage
   */
  registerModuleMount(
    moduleId: ModuleType,
    estimatedMemoryMB: number = 5,
  ): void {
    const now = new Date();

    const existing = this.moduleMemoryInfo.get(moduleId);
    if (existing) {
      // Update existing
      this.moduleMemoryInfo.set(moduleId, {
        ...existing,
        mountedAt: now,
        lastAccessedAt: now,
        accessCount: existing.accessCount + 1,
      });
    } else {
      // Create new
      this.moduleMemoryInfo.set(moduleId, {
        moduleId,
        estimatedMemoryMB,
        mountedAt: now,
        lastAccessedAt: now,
        accessCount: 1,
        isPinned: false,
      });
    }

    logger.debug("MemoryManager", "Registered module mount", {
      moduleId,
      estimatedMemoryMB,
    });
  }

  /**
   * Register Module Access
   *
   * Plain English: "User is currently using this module"
   * Updates last accessed time for LRU tracking.
   *
   * @param moduleId - Module being accessed
   */
  registerModuleAccess(moduleId: ModuleType): void {
    this.currentModule = moduleId;

    const info = this.moduleMemoryInfo.get(moduleId);
    if (info) {
      this.moduleMemoryInfo.set(moduleId, {
        ...info,
        lastAccessedAt: new Date(),
        accessCount: info.accessCount + 1,
      });
    }
  }

  /**
   * Register Module Unmount
   *
   * Plain English: "This module was removed from memory"
   *
   * @param moduleId - Module that was unmounted
   */
  registerModuleUnmount(moduleId: ModuleType): void {
    this.moduleMemoryInfo.delete(moduleId);
    logger.debug("MemoryManager", "Unregistered module", { moduleId });
  }

  /**
   * Pin Module
   *
   * Plain English: "Never unmount this module, it's critical"
   * Used for Command Center and other essential modules.
   *
   * @param moduleId - Module to pin
   */
  pinModule(moduleId: ModuleType): void {
    const info = this.moduleMemoryInfo.get(moduleId);
    if (info) {
      this.moduleMemoryInfo.set(moduleId, {
        ...info,
        isPinned: true,
      });
      logger.debug("MemoryManager", "Pinned module", { moduleId });
    }
  }

  /**
   * Unpin Module
   *
   * @param moduleId - Module to unpin
   */
  unpinModule(moduleId: ModuleType): void {
    const info = this.moduleMemoryInfo.get(moduleId);
    if (info) {
      this.moduleMemoryInfo.set(moduleId, {
        ...info,
        isPinned: false,
      });
      logger.debug("MemoryManager", "Unpinned module", { moduleId });
    }
  }

  /**
   * Get Current Memory Usage
   *
   * Plain English: "How much memory is the app using right now?"
   *
   * Technical: Uses performance.memory API on web, estimates on React Native.
   * iOS doesn't expose direct memory usage, so we estimate based on mounted modules.
   *
   * @returns Memory usage info
   */
  getCurrentMemoryUsage(): MemoryUsageInfo {
    let usedMemoryMB = 0;
    let totalMemoryMB = 2048; // Assume 2GB iOS device

    // Calculate estimated memory from mounted modules
    const mountedModules = Array.from(this.moduleMemoryInfo.values());
    const estimatedUsageMB = mountedModules.reduce(
      (sum, info) => sum + info.estimatedMemoryMB,
      0,
    );

    // Add base app overhead (50MB)
    usedMemoryMB = estimatedUsageMB + 50;

    // On web, use actual memory API if available
    if (Platform.OS === "web" && typeof performance !== "undefined") {
      const memory = (performance as any).memory;
      if (memory && memory.usedJSHeapSize) {
        usedMemoryMB = memory.usedJSHeapSize / (1024 * 1024);
        totalMemoryMB = memory.jsHeapSizeLimit / (1024 * 1024);
      }
    }

    const percentUsed = (usedMemoryMB / totalMemoryMB) * 100;

    // Determine pressure level
    let pressure: MemoryUsageInfo["pressure"] = "none";
    if (usedMemoryMB >= this.strategy.hardLimitMB) {
      pressure = "critical";
    } else if (usedMemoryMB >= this.strategy.softLimitMB) {
      pressure = "high";
    } else if (usedMemoryMB >= this.strategy.softLimitMB * 0.8) {
      pressure = "medium";
    } else if (usedMemoryMB >= this.strategy.softLimitMB * 0.6) {
      pressure = "low";
    }

    return {
      usedMemoryMB,
      totalMemoryMB,
      percentUsed,
      pressure,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Check Memory and Cleanup
   *
   * Plain English: "Check if we're using too much memory and clean up if needed"
   * Called periodically by monitoring interval.
   */
  private async checkMemoryAndCleanup(): Promise<void> {
    const memoryInfo = this.getCurrentMemoryUsage();
    this.lastMemoryCheck = memoryInfo;

    logger.debug("MemoryManager", "Memory check", {
      usedMB: memoryInfo.usedMemoryMB.toFixed(1),
      totalMB: memoryInfo.totalMemoryMB,
      percentUsed: memoryInfo.percentUsed.toFixed(1),
      pressure: memoryInfo.pressure,
    });

    // Emit memory event based on pressure
    if (memoryInfo.pressure === "critical" || memoryInfo.pressure === "high") {
      eventBus.emit(EVENT_TYPES.MEMORY_PRESSURE, {
        level: memoryInfo.pressure,
        usedMB: memoryInfo.usedMemoryMB,
        timestamp: new Date().toISOString(),
      });
    }

    // Determine if cleanup is needed
    let shouldCleanup = false;
    let isAggressive = false;

    if (memoryInfo.usedMemoryMB >= this.strategy.hardLimitMB) {
      shouldCleanup = true;
      isAggressive = true;
      logger.warn("MemoryManager", "CRITICAL: Aggressive cleanup needed");
    } else if (memoryInfo.usedMemoryMB >= this.strategy.softLimitMB) {
      shouldCleanup = true;
      logger.warn("MemoryManager", "WARNING: Cleanup needed");
    }

    if (shouldCleanup) {
      await this.performCleanup(isAggressive);
    }
  }

  /**
   * Perform Cleanup
   *
   * Plain English: "Unload some modules to free up memory"
   *
   * Technical: Identifies least-recently-used modules that aren't pinned
   * and aren't currently active. Unmounts them to free memory.
   *
   * @param aggressive - If true, unmount more modules
   */
  private async performCleanup(aggressive: boolean): Promise<void> {
    // Get candidate modules for cleanup
    const candidates = this.getCleanupCandidates();

    if (candidates.length === 0) {
      logger.debug("MemoryManager", "No cleanup candidates available");
      return;
    }

    // Determine how many to clean up
    const batchSize = aggressive
      ? this.strategy.cleanupBatchSize * 2
      : this.strategy.cleanupBatchSize;

    const toCleanup = candidates.slice(0, batchSize);

    logger.info("MemoryManager", "Cleaning up modules", {
      modules: toCleanup,
      aggressive,
    });

    // Emit cleanup event
    eventBus.emit(EVENT_TYPES.MEMORY_CLEANUP, {
      modules: toCleanup,
      aggressive,
      timestamp: new Date().toISOString(),
    });

    // Note: Actual unmounting is handled by the navigation system
    // We just emit the event and remove from tracking
    toCleanup.forEach((moduleId) => {
      this.moduleMemoryInfo.delete(moduleId);
    });
  }

  /**
   * Get Cleanup Candidates
   *
   * Plain English: "Which modules can we safely unload?"
   * Returns modules sorted by priority for cleanup (least important first).
   *
   * @returns Array of module IDs to clean up
   */
  private getCleanupCandidates(): ModuleType[] {
    const mountedModules = Array.from(this.moduleMemoryInfo.values());

    // Filter out modules that can't be cleaned up
    const candidates = mountedModules.filter((info) => {
      // Don't cleanup current module
      if (info.moduleId === this.currentModule) {
        return false;
      }

      // Don't cleanup pinned modules
      if (info.isPinned) {
        return false;
      }

      return true;
    });

    // Check if we have enough modules to keep minimum
    const totalMounted = mountedModules.length;
    const maxToCleanup = Math.max(
      0,
      totalMounted - this.strategy.minModulesToKeep,
    );

    if (maxToCleanup === 0) {
      return [];
    }

    // Sort by cleanup priority (LRU)
    candidates.sort((a, b) => {
      // Older last accessed time = higher priority for cleanup
      const timeDiff = a.lastAccessedAt.getTime() - b.lastAccessedAt.getTime();

      if (timeDiff !== 0) {
        return timeDiff;
      }

      // Less accessed = higher priority for cleanup
      return a.accessCount - b.accessCount;
    });

    // Return up to maxToCleanup candidates
    return candidates.slice(0, maxToCleanup).map((info) => info.moduleId);
  }

  /**
   * Get Memory Statistics
   *
   * Plain English: "Show me what's loaded and how much memory it's using"
   *
   * @returns Memory statistics
   */
  getStatistics(): {
    currentUsage: MemoryUsageInfo | null;
    mountedModules: number;
    totalEstimatedMB: number;
    modules: {
      moduleId: ModuleType;
      memoryMB: number;
      isPinned: boolean;
      accessCount: number;
      lastAccessed: string;
    }[];
  } {
    const modules = Array.from(this.moduleMemoryInfo.values());
    const totalEstimatedMB = modules.reduce(
      (sum, info) => sum + info.estimatedMemoryMB,
      0,
    );

    return {
      currentUsage: this.lastMemoryCheck,
      mountedModules: modules.length,
      totalEstimatedMB,
      modules: modules.map((info) => ({
        moduleId: info.moduleId,
        memoryMB: info.estimatedMemoryMB,
        isPinned: info.isPinned,
        accessCount: info.accessCount,
        lastAccessed: info.lastAccessedAt.toISOString(),
      })),
    };
  }

  /**
   * Update Strategy
   *
   * @param strategy - New strategy settings
   */
  updateStrategy(strategy: Partial<MemoryStrategy>): void {
    this.strategy = {
      ...this.strategy,
      ...strategy,
    };
    logger.info("MemoryManager", "Updated strategy", { strategy: this.strategy });
  }

  /**
   * Get Current Strategy
   *
   * @returns Current memory strategy
   */
  getStrategy(): MemoryStrategy {
    return { ...this.strategy };
  }

  /**
   * Force Cleanup Now
   *
   * Plain English: "Clean up memory right now, don't wait"
   * Used for testing or when user manually requests cleanup.
   */
  async forceCleanup(): Promise<void> {
    logger.info("MemoryManager", "Forcing cleanup");
    await this.performCleanup(false);
  }

  /**
   * Reset All Tracking
   *
   * Plain English: "Forget all module memory info"
   * Used when app restarts or for testing.
   */
  reset(): void {
    this.moduleMemoryInfo.clear();
    this.currentModule = null;
    this.lastMemoryCheck = null;
    logger.info("MemoryManager", "Reset all tracking");
  }
}

// Export singleton instance
export const memoryManager = new MemoryManager();
