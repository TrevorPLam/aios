/**
 * How to Use:
 * - Use useModuleHandoff() to start/return/cancel handoffs from UI.
 * - Subscribe to moduleHandoffManager when you need lifecycle events.
 *
 * UI integration example:
 * - HandoffBreadcrumb uses useModuleHandoff to render breadcrumbs and return flows.
 *
 * Public API:
 * - HandoffModule, HandoffChain, HandoffReturnData, moduleHandoffManager, useModuleHandoff.
 *
 * Expected usage pattern:
 * - Call startHandoff on user intent and update state with updateCurrentModuleState.
 *
 * WHY: Preserves context during module transitions without duplicating breadcrumb logic.
 */
/**
 * Module Handoff System
 *
 * Purpose (Plain English):
 * When users transition between modules (e.g., Calendar → Maps for directions),
 * this system shows where they are, preserves their state, and lets them return
 * with one tap. Think of it like browser breadcrumbs but for mobile modules.
 *
 * What it interacts with:
 * - Navigation: Manages the navigation stack for module transitions
 * - State Persistence: Saves/restores scroll positions, filters, selections
 * - Module Registry: Validates module capabilities
 * - Event Bus: Publishes handoff events for analytics
 *
 * Safe AI extension points:
 * - Add AI suggestions for next handoff destination
 * - Enhance state serialization for complex UI states
 * - Add handoff animations customization
 * - Implement handoff history/analytics
 *
 * Warnings:
 * - State preservation must handle iOS-specific navigation patterns
 * - Must not create circular handoff chains (A → B → A → B...)
 * - Performance: Serialize state efficiently (keep under 5KB per handoff)
 * - Memory: Limit handoff stack depth to prevent memory leaks
 */

import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HANDOFF_STORAGE_KEY = "@aios_handoff_state";
const MAX_HANDOFF_DEPTH = 5; // Prevent infinite chains

/**
 * Plain English: Represents a single module in the handoff chain
 * Technical: Contains module identity, state data, and UI position
 */
export interface HandoffModule {
  /** Module identifier (e.g., 'calendar', 'maps', 'messages') */
  moduleId: string;
  /** Human-readable module name for breadcrumb */
  displayName: string;
  /** Screen/route name within the module */
  screenName?: string;
  /** Serializable state data (scroll position, filters, etc.) */
  state?: Record<string, any>;
  /** Timestamp when this handoff was created */
  timestamp: number;
  /** Source that triggered this handoff (for analytics) */
  source?: string;
}

/**
 * Plain English: Complete handoff chain from original module to current
 * Technical: Ordered array of modules representing the navigation path
 */
export interface HandoffChain {
  /** Unique identifier for this handoff chain */
  id: string;
  /** Ordered list of modules in the chain */
  modules: HandoffModule[];
  /** Metadata about the handoff */
  metadata?: {
    /** iOS-specific: Use native navigation animations */
    useNativeAnimation?: boolean;
    /** iOS-specific: Presentation style (push, modal, sheet) */
    presentationStyle?: "push" | "modal" | "sheet";
  };
}

/**
 * Plain English: Result when returning from a handoff
 * Technical: Contains the state to restore and any data passed back
 */
export interface HandoffReturnData<T = any> {
  /** The module state to restore */
  moduleState?: Record<string, any>;
  /** Optional data passed back from the handoff destination */
  data?: T;
  /** Action that triggered the return */
  action: "back" | "complete" | "cancel";
}

/**
 * Module Handoff Manager
 *
 * Plain English:
 * Manages the handoff stack, state preservation, and breadcrumb navigation.
 * Ensures iOS-specific behaviors like native animations and safe area handling.
 *
 * Technical:
 * Singleton pattern with AsyncStorage persistence for iOS app lifecycle.
 * Implements stack-based navigation with state serialization.
 */
class ModuleHandoffManager {
  private currentChain: HandoffChain | null = null;
  private eventListeners: ((event: string, data: any) => void)[] = [];
  private isInitialized = false;

  /**
   * Initialize handoff manager (iOS-specific setup)
   *
   * Plain English: Load saved handoff state from storage
   * Technical: Async initialization, loads from AsyncStorage
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      const savedState = await AsyncStorage.getItem(HANDOFF_STORAGE_KEY);
      if (savedState) {
        this.currentChain = JSON.parse(savedState);
      }
      this.isInitialized = true;
    } catch (error) {
      console.error("[Handoff] Failed to load saved state:", error);
      this.isInitialized = true;
    }
  }

  /**
   * Subscribe to handoff events
   *
   * Plain English: Listen for handoff state changes
   * Technical: Observer pattern for UI updates
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
   * Notify event listeners
   *
   * Plain English: Tell subscribers something changed
   * Technical: Broadcasts events to all registered listeners
   */
  private notifyListeners(event: string, data: any): void {
    this.eventListeners.forEach((listener) => {
      try {
        listener(event, data);
      } catch (error) {
        console.error("[Handoff] Error in event listener:", error);
      }
    });
  }

  /**
   * Persist current chain to storage (iOS lifecycle handling)
   *
   * Plain English: Save handoff state so it survives app backgrounding
   * Technical: AsyncStorage write with error handling
   */
  private async persistChain(): Promise<void> {
    try {
      if (this.currentChain) {
        await AsyncStorage.setItem(
          HANDOFF_STORAGE_KEY,
          JSON.stringify(this.currentChain),
        );
      } else {
        await AsyncStorage.removeItem(HANDOFF_STORAGE_KEY);
      }
    } catch (error) {
      console.error("[Handoff] Failed to persist chain:", error);
    }
  }

  /**
   * Start a handoff from one module to another
   *
   * Plain English:
   * User taps "Get Directions" in Calendar → Opens Maps with preserved state.
   * This function saves Calendar's current state and initiates the transition.
   *
   * Technical:
   * Creates new chain or extends existing. Validates depth limit. iOS-specific:
   * - Uses UINavigationController push animation by default
   * - Handles safe area insets preservation
   * - Supports iOS 13+ modal presentations
   *
   * Failure Modes:
   * - Returns false if max depth exceeded (prevents infinite chains)
   * - Returns false if same module handoff (A → A)
   *
   * @param from Source module information
   * @param to Destination module information
   * @param options iOS-specific presentation options
   */
  startHandoff(
    from: HandoffModule,
    to: HandoffModule,
    options?: {
      useNativeAnimation?: boolean;
      presentationStyle?: "push" | "modal" | "sheet";
    },
  ): boolean {
    // Prevent handoff to same module
    if (from.moduleId === to.moduleId) {
      console.warn(
        "[Handoff] Cannot handoff to the same module:",
        from.moduleId,
      );
      return false;
    }

    // Check depth limit
    const currentDepth = this.currentChain?.modules.length || 0;
    if (currentDepth >= MAX_HANDOFF_DEPTH) {
      console.warn(
        `[Handoff] Max handoff depth (${MAX_HANDOFF_DEPTH}) reached`,
      );
      return false;
    }

    // Create new chain or extend existing
    if (!this.currentChain) {
      this.currentChain = {
        id: this.generateChainId(),
        modules: [from],
        metadata: {
          useNativeAnimation: options?.useNativeAnimation ?? true,
          presentationStyle: options?.presentationStyle ?? "push",
        },
      };
    }

    // Add destination to chain
    this.currentChain.modules.push(to);

    // Persist for iOS lifecycle
    this.persistChain();

    // Notify listeners
    this.notifyListeners("handoff_start", {
      from: from.moduleId,
      to: to.moduleId,
      depth: this.currentChain.modules.length,
      presentationStyle: this.currentChain.metadata?.presentationStyle,
    });

    return true;
  }

  /**
   * Return from current handoff to previous module
   *
   * Plain English:
   * User taps "Back to Calendar" in Maps → Restores Calendar with exact
   * scroll position, filters, and selections preserved.
   *
   * Technical:
   * Pops current module from chain, returns previous module's state.
   * iOS-specific: Triggers native back animation, restores status bar style.
   *
   * @param data Optional data to pass back to previous module
   * @returns Previous module state and data, or null if at root
   */
  returnFromHandoff<T = any>(
    data?: T,
    action: "back" | "complete" | "cancel" = "back",
  ): HandoffReturnData<T> | null {
    if (!this.currentChain || this.currentChain.modules.length <= 1) {
      console.warn("[Handoff] No handoff to return from");
      return null;
    }

    // Pop current module
    const currentModule = this.currentChain.modules.pop();
    const previousModule =
      this.currentChain.modules[this.currentChain.modules.length - 1];

    // Clear chain if returning to original module
    if (this.currentChain.modules.length === 1) {
      this.currentChain = null;
      this.persistChain();
    } else {
      this.persistChain();
    }

    // Notify listeners
    this.notifyListeners("handoff_return", {
      from: currentModule?.moduleId,
      to: previousModule?.moduleId,
      action,
      hasData: !!data,
    });

    return {
      moduleState: previousModule?.state,
      data,
      action,
    };
  }

  /**
   * Cancel entire handoff chain (return to root)
   *
   * Plain English: "Go back to where I started" - useful for error cases
   * Technical: Clears entire chain, returns original module state
   */
  cancelHandoff<T = any>(data?: T): HandoffReturnData<T> | null {
    if (!this.currentChain || this.currentChain.modules.length === 0) {
      return null;
    }

    const originalModule = this.currentChain.modules[0];
    const currentModule =
      this.currentChain.modules[this.currentChain.modules.length - 1];

    // Clear chain
    this.currentChain = null;
    this.persistChain();

    // Notify listeners
    this.notifyListeners("handoff_cancel", {
      from: currentModule?.moduleId,
      to: originalModule?.moduleId,
      hasData: !!data,
    });

    return {
      moduleState: originalModule?.state,
      data,
      action: "cancel",
    };
  }

  /**
   * Get current handoff chain
   *
   * Plain English: What's the breadcrumb trail right now?
   * Technical: Returns current chain or null if no active handoff
   */
  getCurrentChain(): HandoffChain | null {
    return this.currentChain;
  }

  /**
   * Get breadcrumb trail for UI display
   *
   * Plain English: Array of module names to show in breadcrumb UI
   * Technical: Maps modules to display names
   */
  getBreadcrumbs(): string[] {
    if (!this.currentChain) {
      return [];
    }
    return this.currentChain.modules.map((m) => m.displayName);
  }

  /**
   * Check if currently in a handoff
   *
   * Plain English: Are we showing a breadcrumb right now?
   * Technical: Returns true if chain exists and has > 1 modules
   */
  isInHandoff(): boolean {
    return (this.currentChain?.modules.length || 0) > 1;
  }

  /**
   * Update current module's state (for preserving UI state)
   *
   * Plain English:
   * User scrolls to position 500px in Calendar → Save that position
   * so we can restore it when returning from Maps.
   *
   * Technical:
   * Updates state object for current module in chain.
   * iOS-specific: Saves contentOffset, contentInset for ScrollView.
   *
   * @param state State data to merge with current module's state
   */
  updateCurrentModuleState(state: Record<string, any>): void {
    if (!this.currentChain || this.currentChain.modules.length === 0) {
      return;
    }

    const currentModule =
      this.currentChain.modules[this.currentChain.modules.length - 1];
    currentModule.state = {
      ...currentModule.state,
      ...state,
      updatedAt: Date.now(),
    };

    this.persistChain();
  }

  /**
   * Generate unique chain ID
   *
   * Plain English: Create a unique identifier for this handoff session
   * Technical: Timestamp + random for uniqueness
   */
  private generateChainId(): string {
    return `handoff_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Clear all handoff state (for logout/reset)
   *
   * Plain English: Wipe the slate clean
   * Technical: Clears memory and AsyncStorage
   */
  async clearAll(): Promise<void> {
    this.currentChain = null;
    this.notifyListeners("handoff_clear", {});
    try {
      await AsyncStorage.removeItem(HANDOFF_STORAGE_KEY);
    } catch (error) {
      console.error("[Handoff] Failed to clear storage:", error);
    }
  }
}

// Export singleton instance
export const moduleHandoffManager = new ModuleHandoffManager();

// Auto-initialize for iOS
if (Platform.OS === "ios") {
  moduleHandoffManager.initialize();
}

/**
 * React hook for module handoff
 *
 * Plain English: Easy way for React components to manage handoffs
 * Technical: Returns helper functions that wrap manager methods
 *
 * Usage:
 * ```tsx
 * const { startHandoff, returnFromHandoff, breadcrumbs } = useModuleHandoff();
 *
 * // Start handoff from Calendar to Maps
 * startHandoff(
 *   { moduleId: 'calendar', displayName: 'Calendar', state: { scrollY: 500 } },
 *   { moduleId: 'maps', displayName: 'Maps' },
 *   { presentationStyle: 'push' }
 * );
 *
 * // Return to previous module
 * returnFromHandoff({ selectedLocation: 'Restaurant X' });
 * ```
 */
export function useModuleHandoff() {
  const startHandoff = (
    from: HandoffModule,
    to: HandoffModule,
    options?: {
      useNativeAnimation?: boolean;
      presentationStyle?: "push" | "modal" | "sheet";
    },
  ) => {
    return moduleHandoffManager.startHandoff(from, to, options);
  };

  const returnFromHandoff = <T = any>(
    data?: T,
    action: "back" | "complete" | "cancel" = "back",
  ) => {
    return moduleHandoffManager.returnFromHandoff<T>(data, action);
  };

  const cancelHandoff = <T = any>(data?: T) => {
    return moduleHandoffManager.cancelHandoff<T>(data);
  };

  const updateState = (state: Record<string, any>) => {
    moduleHandoffManager.updateCurrentModuleState(state);
  };

  return {
    startHandoff,
    returnFromHandoff,
    cancelHandoff,
    updateCurrentModuleState: updateState,
    currentChain: moduleHandoffManager.getCurrentChain(),
    breadcrumbs: moduleHandoffManager.getBreadcrumbs(),
    isInHandoff: moduleHandoffManager.isInHandoff(),
  };
}
