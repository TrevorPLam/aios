/**
 * How to Use:
 * - Register providers with miniModeRegistry.register(provider).
 * - Open mini-modes via useMiniMode().openMiniMode(config).
 *
 * UI integration example:
 * - QuickCaptureOverlay opens mini-modes with useMiniMode().openMiniMode.
 *
 * Public API:
 * - MiniModeConfig, MiniModeResult, MiniModeProvider, MiniModeComponentProps,
 *   miniModeRegistry, useMiniMode.
 *
 * Expected usage pattern:
 * - Keep mini-mode data JSON-serializable and always handle onDismiss.
 *
 * WHY: Standardizes cross-module quick actions without navigation context.
 */
/**
 * Mini-Mode System
 *
 * Purpose (Plain English):
 * Allows modules to be displayed in a compact "mini" form inline within another module,
 * enabling users to complete cross-module workflows without leaving their current context.
 * For example, creating a calendar event from within the messages screen.
 *
 * What it interacts with:
 * - Module Registry: Determines which modules support mini-mode
 * - Navigation: Does NOT use navigation - renders inline as overlay/modal
 * - Context Engine: Mini-mode respects current context zone
 *
 * Safe AI extension points:
 * - Add new mini-mode implementations for additional modules
 * - Enhance mini-mode data passing (currently supports JSON-serializable data)
 * - Add animation customization options
 * - Extend mini-mode result handling
 *
 * Warnings:
 * - Mini-mode components must be self-contained and not depend on navigation context
 * - State must be preserved when mini-mode closes without action
 * - Mini-mode should never block the underlying UI completely (always dismissible)
 * - Performance: Keep mini-mode components lightweight (<50KB bundle)
 */

import React from "react";

/**
 * Plain English: Data passed to a mini-mode component when opening
 * Technical: Configuration object defining what data to show and how to behave
 */
export interface MiniModeConfig<T = any> {
  /** Which module to open in mini-mode (e.g., 'calendar', 'planner', 'notebook') */
  module: string;
  /** Optional initial data to populate the mini-mode form */
  initialData?: T;
  /** Callback when user completes action (e.g., saves event, creates task) */
  onComplete?: (result: any) => void;
  /** Callback when user dismisses without action */
  onDismiss?: () => void;
  /** Source context for analytics (which screen opened this mini-mode) */
  source?: string;
}

/**
 * Plain English: The result returned when a mini-mode action completes
 * Technical: Typed result object with action type and created/modified data
 */
export interface MiniModeResult<T = any> {
  /** Action performed (e.g., 'created', 'updated', 'selected') */
  action: "created" | "updated" | "selected" | "cancelled";
  /** The data created or selected */
  data?: T;
  /** The module that generated this result */
  module: string;
}

/**
 * Plain English: Defines what capabilities a mini-mode implementation must provide
 * Technical: Interface contract for module-specific mini-mode components
 */
export interface MiniModeProvider {
  /** Unique identifier for this mini-mode (must match module name) */
  id: string;
  /** Human-readable name shown in UI */
  displayName: string;
  /** Description of what this mini-mode does */
  description: string;
  /** React component to render in mini-mode */
  component: React.ComponentType<MiniModeComponentProps>;
}

/**
 * Plain English: Props passed to every mini-mode component
 * Technical: Standard interface that all mini-mode components must accept
 */
export interface MiniModeComponentProps<T = any> {
  /** Initial data for the form/component */
  initialData?: T;
  /** Callback to invoke when action completes successfully */
  onComplete: (result: MiniModeResult) => void;
  /** Callback to invoke when user dismisses */
  onDismiss: () => void;
  /** Source context (for analytics/breadcrumbs) */
  source?: string;
}

/**
 * Mini-Mode Registry
 *
 * Plain English:
 * Central registry of all mini-mode implementations. Modules register their
 * mini-mode components here, and other modules can request to open them.
 *
 * Technical:
 * Singleton registry pattern with type-safe module lookup. Uses Map for O(1) access.
 */
class MiniModeRegistry {
  private providers = new Map<string, MiniModeProvider>();
  private currentMiniMode: {
    config: MiniModeConfig;
    provider: MiniModeProvider;
  } | null = null;
  private eventListeners: ((event: string, data: any) => void)[] = [];

  /**
   * Subscribe to mini-mode events
   *
   * Plain English: Listen for mini-mode state changes (open, close, complete)
   * Technical: Simple observer pattern for UI updates
   */
  private notifyListeners(event: string, data: any) {
    this.eventListeners.forEach((listener) => {
      try {
        listener(event, data);
      } catch (error) {
        console.error("[MiniMode] Error in event listener:", error);
      }
    });
  }

  /**
   * Subscribe to mini-mode events
   *
   * Plain English: Register a function to be called when mini-mode events occur
   * Technical: Returns unsubscribe function
   */
  subscribe(listener: (event: string, data: any) => void): () => void {
    this.eventListeners.push(listener);
    return () => {
      const index = this.eventListeners.indexOf(listener);
      if (index !== -1) {
        this.eventListeners.splice(index, 1);
      }
    };
  }

  /**
   * Register a mini-mode implementation
   *
   * Plain English:
   * Tells the system "this module can be used in mini-mode, here's how"
   *
   * Technical:
   * Adds provider to registry. Does not emit events - registration is
   * a setup operation that happens at app initialization.
   */
  register(provider: MiniModeProvider): void {
    if (this.providers.has(provider.id)) {
      console.warn(
        `[MiniMode] Provider '${provider.id}' already registered, overwriting`,
      );
    }

    this.providers.set(provider.id, provider);
  }

  /**
   * Unregister a mini-mode implementation
   *
   * Plain English: Remove a mini-mode provider (rarely needed)
   * Technical: Removes from Map, safe if not exists
   */
  unregister(moduleId: string): void {
    this.providers.delete(moduleId);
  }

  /**
   * Get a mini-mode provider by module ID
   *
   * Plain English: Look up how to render a module in mini-mode
   * Technical: Map lookup with undefined return if not found
   */
  getProvider(moduleId: string): MiniModeProvider | undefined {
    return this.providers.get(moduleId);
  }

  /**
   * Get all registered mini-mode providers
   *
   * Plain English: List all modules that support mini-mode
   * Technical: Returns array from Map values
   */
  getAllProviders(): MiniModeProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Check if a module supports mini-mode
   *
   * Plain English: Can this module be used inline?
   * Technical: Simple Map.has() check
   */
  supportsModule(moduleId: string): boolean {
    return this.providers.has(moduleId);
  }

  /**
   * Open a module in mini-mode
   *
   * Plain English:
   * Show a compact version of a module as an overlay. Other modules call this
   * to embed functionality without navigation.
   *
   * Technical:
   * Validates provider exists, stores current config, notifies UI listeners.
   * The UI layer (MiniModeContainer) subscribes to mini-mode events.
   *
   * Failure Modes:
   * - Returns false if provider not found (module doesn't support mini-mode)
   * - Returns false if another mini-mode is already open (prevents nesting)
   */
  open<T = any>(config: MiniModeConfig<T>): boolean {
    // Prevent nesting mini-modes
    if (this.currentMiniMode) {
      console.warn(
        "[MiniMode] Another mini-mode is already open, cannot nest mini-modes",
      );
      return false;
    }

    const provider = this.providers.get(config.module);
    if (!provider) {
      console.warn(
        `[MiniMode] No provider registered for module '${config.module}'`,
      );
      return false;
    }

    this.currentMiniMode = { config, provider };

    // Notify UI listeners
    this.notifyListeners("mini_mode_open", {
      module: config.module,
      source: config.source,
      hasInitialData: !!config.initialData,
    });

    return true;
  }

  /**
   * Close the current mini-mode
   *
   * Plain English: Dismiss the mini-mode overlay
   * Technical: Clears current state, notifies listeners, invokes onDismiss if provided
   */
  close(): void {
    if (!this.currentMiniMode) {
      return;
    }

    const { config } = this.currentMiniMode;

    // Invoke dismiss callback
    if (config.onDismiss) {
      try {
        config.onDismiss();
      } catch (error) {
        console.error("[MiniMode] Error in onDismiss callback:", error);
      }
    }

    // Notify listeners
    this.notifyListeners("mini_mode_close", {
      module: config.module,
      reason: "dismissed",
    });

    this.currentMiniMode = null;
  }

  /**
   * Complete a mini-mode action
   *
   * Plain English:
   * User completed the mini-mode action (e.g., saved event, created task).
   * Close the mini-mode and notify the caller with results.
   *
   * Technical:
   * Invokes onComplete callback with result, notifies listeners, clears state.
   * Safe error handling ensures mini-mode always closes even if callback fails.
   */
  complete<T = any>(result: MiniModeResult<T>): void {
    if (!this.currentMiniMode) {
      console.warn("[MiniMode] No mini-mode currently open to complete");
      return;
    }

    const { config } = this.currentMiniMode;

    // Invoke completion callback
    if (config.onComplete) {
      try {
        config.onComplete(result);
      } catch (error) {
        console.error("[MiniMode] Error in onComplete callback:", error);
      }
    }

    // Notify listeners
    this.notifyListeners("mini_mode_complete", {
      module: config.module,
      action: result.action,
      source: config.source,
    });

    this.currentMiniMode = null;
  }

  /**
   * Get current mini-mode state
   *
   * Plain English: What mini-mode is currently open (if any)?
   * Technical: Returns current config and provider, or null
   */
  getCurrent(): { config: MiniModeConfig; provider: MiniModeProvider } | null {
    return this.currentMiniMode;
  }
}

// Export singleton instance
export const miniModeRegistry = new MiniModeRegistry();

/**
 * React hook for mini-mode interaction
 *
 * Plain English: Easy way for React components to open mini-modes
 * Technical: Returns helper functions that wrap registry methods
 */
export function useMiniMode() {
  const openMiniMode = <T = any>(config: MiniModeConfig<T>) => {
    return miniModeRegistry.open(config);
  };

  const closeMiniMode = () => {
    miniModeRegistry.close();
  };

  const completeMiniMode = <T = any>(result: MiniModeResult<T>) => {
    miniModeRegistry.complete(result);
  };

  return {
    openMiniMode,
    closeMiniMode,
    completeMiniMode,
    supportsModule: (moduleId: string) =>
      miniModeRegistry.supportsModule(moduleId),
    currentMiniMode: miniModeRegistry.getCurrent(),
  };
}
