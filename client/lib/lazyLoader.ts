/**
 * How to Use:
 * - Call lazyLoader.getLazyComponent(moduleId) to wire screens into navigation.
 * - Optionally prefetch with lazyLoader.preloadModules(modules, strategy).
 *
 * UI integration example:
 * - AppNavigator lazy-loads Photos via lazyLoader.getLazyComponent("photos").
 *
 * Public API:
 * - LoadingStrategy, lazyLoader.
 *
 * Expected usage pattern:
 * - Use getLazyComponent in navigation setup and prefetch from analytics hooks.
 *
 * WHY: Centralizes module code-splitting to keep startup fast and predictable.
 */
/**
 * Lazy Loading System
 *
 * Purpose (Plain English):
 * Makes the app start faster by not loading all 20+ modules at once. Instead, modules
 * are loaded on-demand when user navigates to them. Like opening doors in a building -
 * you don't open all doors at once, just the one you need.
 *
 * What it interacts with:
 * - Navigation system (to know which module to load)
 * - Module registry (to know which modules exist)
 * - Prefetch engine (to pre-load likely next modules)
 * - Loading UI components (to show skeletons while loading)
 *
 * Technical Implementation:
 * Uses React.lazy() for code-splitting and dynamic imports. Tracks loaded modules
 * in memory to avoid re-loading. Provides Suspense boundaries with iOS-native
 * loading skeletons.
 *
 * Safe AI Extension Points:
 * - Add new module loaders
 * - Customize loading strategies
 * - Add cache invalidation logic
 * - Add error recovery strategies
 *
 * Fragile Logic Warnings:
 * - Module paths must match actual file paths EXACTLY
 * - Dynamic imports can't use fully dynamic strings (webpack limitation)
 * - Loading errors must be caught and handled gracefully
 * - Memory leaks possible if modules aren't properly unmounted
 */

import React, { ComponentType, LazyExoticComponent } from "react";
import { ModuleType } from "@/models/types";
import { logger } from "@/utils/logger";

/**
 * Module Loader Configuration
 *
 * Defines how a module should be loaded.
 */
interface ModuleLoaderConfig {
  moduleId: ModuleType;
  path: string; // Relative path from screens directory
  preload: boolean; // Whether to preload this module
  priority: "high" | "medium" | "low"; // Loading priority
}

/**
 * Loaded Module Metadata
 */
interface LoadedModule {
  component: LazyExoticComponent<ComponentType<any>>;
  loadedAt: Date;
  loadTime: number; // milliseconds
  error?: Error;
}

/**
 * Module Loading Strategy
 *
 * Plain English: "When and how should we load modules?"
 * - immediate: Load right now
 * - idle: Load when browser is idle
 * - viewport: Load when user scrolls near it
 * - prefetch: Load in background for future use
 */
export type LoadingStrategy = "immediate" | "idle" | "viewport" | "prefetch";

/**
 * Lazy Loader Class
 *
 * Manages lazy loading of modules with iOS-optimized strategies.
 */
class LazyLoader {
  private loadedModules: Map<ModuleType, LoadedModule>;
  private loadingPromises: Map<ModuleType, Promise<void>>;
  private loaderConfigs: Map<ModuleType, ModuleLoaderConfig>;

  constructor() {
    this.loadedModules = new Map();
    this.loadingPromises = new Map();
    this.loaderConfigs = new Map();

    this.initializeLoaderConfigs();
  }

  /**
   * Initialize Loader Configurations
   *
   * Plain English: "Set up which modules exist and where to find them"
   *
   * Technical: Maps module IDs to their screen components. All paths are
   * relative to client/screens/ directory. High priority modules (command,
   * notebook, planner) are marked for preloading.
   */
  private initializeLoaderConfigs(): void {
    const configs: ModuleLoaderConfig[] = [
      // Core Modules (14 production-ready) - High priority
      {
        moduleId: "command",
        path: "CommandCenterScreen",
        preload: true,
        priority: "high",
      },
      {
        moduleId: "notebook",
        path: "NotebookScreen",
        preload: true,
        priority: "high",
      },
      {
        moduleId: "planner",
        path: "PlannerScreen",
        preload: true,
        priority: "high",
      },
      {
        moduleId: "calendar",
        path: "CalendarScreen",
        preload: false,
        priority: "medium",
      },
      {
        moduleId: "email",
        path: "EmailScreen",
        preload: false,
        priority: "medium",
      },
      {
        moduleId: "messages",
        path: "MessagesScreen",
        preload: false,
        priority: "medium",
      },
      {
        moduleId: "lists",
        path: "ListsScreen",
        preload: false,
        priority: "medium",
      },
      {
        moduleId: "alerts",
        path: "AlertsScreen",
        preload: false,
        priority: "low",
      },
      {
        moduleId: "contacts",
        path: "ContactsScreen",
        preload: false,
        priority: "low",
      },
      {
        moduleId: "translator",
        path: "TranslatorScreen",
        preload: false,
        priority: "low",
      },
      {
        moduleId: "photos",
        path: "PhotosScreen",
        preload: false,
        priority: "low",
      },
      {
        moduleId: "budget",
        path: "BudgetScreen",
        preload: false,
        priority: "low",
      },
    ];

    configs.forEach((config) => {
      this.loaderConfigs.set(config.moduleId, config);
    });
  }

  /**
   * Get Lazy Component
   *
   * Plain English: "Get a lazily-loaded React component for a module"
   * Returns a component that will be loaded when first rendered.
   *
   * @param moduleId - Module to load
   * @returns Lazy component
   */
  getLazyComponent(
    moduleId: ModuleType,
  ): LazyExoticComponent<ComponentType<any>> {
    // Check if already loaded
    const loaded = this.loadedModules.get(moduleId);
    if (loaded && !loaded.error) {
      return loaded.component;
    }

    // Get loader config
    const config = this.loaderConfigs.get(moduleId);
    if (!config) {
      throw new Error(`No loader config found for module: ${moduleId}`);
    }

    // Create lazy component
    const lazyComponent = React.lazy(() => {
      const startTime = performance.now();

      return this.loadModule(config.path)
        .then((module) => {
          const loadTime = performance.now() - startTime;

          // Store metadata
          this.loadedModules.set(moduleId, {
            component: lazyComponent,
            loadedAt: new Date(),
            loadTime,
          });

          logger.debug("LazyLoader", "Loaded module", {
            moduleId,
            loadTimeMs: loadTime.toFixed(2),
          });

          return module;
        })
        .catch((error) => {
          logger.error("LazyLoader", "Failed to load module", {
            moduleId,
            error: error instanceof Error ? error.message : String(error),
          });

          // Store error
          this.loadedModules.set(moduleId, {
            component: lazyComponent,
            loadedAt: new Date(),
            loadTime: 0,
            error,
          });

          throw error;
        });
    });

    return lazyComponent;
  }

  /**
   * Load Module Dynamically
   *
   * Plain English: "Actually import the module code from disk"
   *
   * Technical: Uses dynamic import() to load module. The switch statement
   * is required because webpack needs to see the literal strings to create
   * code chunks. Can't use fully dynamic paths.
   *
   * @param path - Module path (filename without extension)
   * @returns Promise resolving to module
   */
  private async loadModule(
    path: string,
  ): Promise<{ default: ComponentType<any> }> {
    // Dynamic imports must have literal strings for webpack code splitting
    // This is a webpack limitation - can't use fully dynamic import paths
    switch (path) {
      case "CommandCenterScreen":
        return import("@/screens/CommandCenterScreen");
      case "NotebookScreen":
        return import("@/screens/NotebookScreen");
      case "PlannerScreen":
        return import("@/screens/PlannerScreen");
      case "CalendarScreen":
        return import("@/screens/CalendarScreen");
      case "EmailScreen":
        return import("@/screens/EmailScreen");
      case "MessagesScreen":
        return import("@/screens/MessagesScreen");
      case "ListsScreen":
        return import("@/screens/ListsScreen");
      case "AlertsScreen":
        return import("@/screens/AlertsScreen");
      case "ContactsScreen":
        return import("@/screens/ContactsScreen");
      case "TranslatorScreen":
        return import("@/screens/TranslatorScreen");
      case "PhotosScreen":
        return import("@/screens/PhotosScreen");
      case "BudgetScreen":
        return import("@/screens/BudgetScreen");
      default:
        throw new Error(`Unknown module path: ${path}`);
    }
  }

  /**
   * Preload Modules
   *
   * Plain English: "Load modules in the background before user needs them"
   * Used for modules marked as preload: true or predicted next modules.
   *
   * Technical: Starts loading modules but doesn't wait for completion.
   * Uses requestIdleCallback on web or setTimeout on React Native to avoid
   * blocking main thread.
   *
   * @param moduleIds - Modules to preload
   * @param strategy - Loading strategy
   */
  preloadModules(
    moduleIds: ModuleType[],
    strategy: LoadingStrategy = "idle",
  ): void {
    const loadBatch = () => {
      moduleIds.forEach((moduleId) => {
        // Skip if already loaded or loading
        if (
          this.loadedModules.has(moduleId) ||
          this.loadingPromises.has(moduleId)
        ) {
          return;
        }

        const config = this.loaderConfigs.get(moduleId);
        if (!config) {
          logger.warn("LazyLoader", "No config for module", { moduleId });
          return;
        }

        // Start loading
        const loadPromise = this.loadModule(config.path)
          .then(() => {
            logger.debug("LazyLoader", "Preloaded module", { moduleId });
            this.loadingPromises.delete(moduleId);
          })
          .catch((error) => {
            logger.error("LazyLoader", "Failed to preload module", {
              moduleId,
              error: error instanceof Error ? error.message : String(error),
            });
            this.loadingPromises.delete(moduleId);
          });

        this.loadingPromises.set(moduleId, loadPromise);
      });
    };

    // Execute based on strategy
    switch (strategy) {
      case "immediate":
        loadBatch();
        break;
      case "idle":
        // Use requestIdleCallback if available (web), otherwise setTimeout
        if (typeof requestIdleCallback !== "undefined") {
          requestIdleCallback(loadBatch, { timeout: 5000 });
        } else {
          setTimeout(loadBatch, 100);
        }
        break;
      case "prefetch":
        // Lower priority, delay a bit
        setTimeout(loadBatch, 500);
        break;
      default:
        loadBatch();
    }
  }

  /**
   * Preload High Priority Modules
   *
   * Plain English: "Load the most important modules right away"
   * Called on app startup after initial render.
   */
  preloadHighPriorityModules(): void {
    const highPriorityModules = Array.from(this.loaderConfigs.values())
      .filter((config) => config.preload && config.priority === "high")
      .map((config) => config.moduleId);

    this.preloadModules(highPriorityModules, "idle");
  }

  /**
   * Get Loaded Modules
   *
   * @returns Array of loaded module IDs
   */
  getLoadedModules(): ModuleType[] {
    return Array.from(this.loadedModules.keys()).filter((moduleId) => {
      const loaded = this.loadedModules.get(moduleId);
      return loaded && !loaded.error;
    });
  }

  /**
   * Get Loading Stats
   *
   * Plain English: "Get performance metrics for loaded modules"
   * Used for monitoring and optimization.
   *
   * @returns Loading statistics
   */
  getLoadingStats(): {
    totalLoaded: number;
    totalErrors: number;
    averageLoadTime: number;
    slowestModule: { moduleId: ModuleType; loadTime: number } | null;
  } {
    const modules = Array.from(this.loadedModules.values());
    const successful = modules.filter((m) => !m.error);
    const errors = modules.filter((m) => m.error);

    const totalLoadTime = successful.reduce((sum, m) => sum + m.loadTime, 0);
    const averageLoadTime =
      successful.length > 0 ? totalLoadTime / successful.length : 0;

    let slowestModule = null;
    if (successful.length > 0) {
      const slowest = successful.reduce((prev, curr) =>
        curr.loadTime > prev.loadTime ? curr : prev,
      );
      const slowestId = Array.from(this.loadedModules.entries()).find(
        ([, value]) => value === slowest,
      )?.[0];

      if (slowestId) {
        slowestModule = { moduleId: slowestId, loadTime: slowest.loadTime };
      }
    }

    return {
      totalLoaded: successful.length,
      totalErrors: errors.length,
      averageLoadTime,
      slowestModule,
    };
  }

  /**
   * Clear Module Cache
   *
   * Plain English: "Forget which modules are loaded, force reload next time"
   * Used for development or error recovery.
   *
   * @param moduleId - Optional module to clear, or all if not specified
   */
  clearCache(moduleId?: ModuleType): void {
    if (moduleId) {
      this.loadedModules.delete(moduleId);
      this.loadingPromises.delete(moduleId);
    } else {
      this.loadedModules.clear();
      this.loadingPromises.clear();
    }
  }

  /**
   * Is Module Loaded
   *
   * @param moduleId - Module to check
   * @returns True if module is loaded successfully
   */
  isModuleLoaded(moduleId: ModuleType): boolean {
    const loaded = this.loadedModules.get(moduleId);
    return !!loaded && !loaded.error;
  }

  /**
   * Wait For Module Load
   *
   * Plain English: "Wait until a module finishes loading"
   *
   * @param moduleId - Module to wait for
   * @param timeout - Max wait time in ms (default: 10000)
   * @returns Promise that resolves when loaded
   */
  async waitForModuleLoad(
    moduleId: ModuleType,
    timeout = 10000,
  ): Promise<void> {
    // Check if already loaded
    if (this.isModuleLoaded(moduleId)) {
      return Promise.resolve();
    }

    // Check if currently loading
    const loadingPromise = this.loadingPromises.get(moduleId);
    if (loadingPromise) {
      return Promise.race([
        loadingPromise,
        new Promise<void>((_, reject) =>
          setTimeout(
            () => reject(new Error(`Timeout waiting for ${moduleId}`)),
            timeout,
          ),
        ),
      ]);
    }

    throw new Error(`Module ${moduleId} is not loading`);
  }
}

// Export singleton instance
export const lazyLoader = new LazyLoader();
