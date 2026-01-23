/**
 * Mini-Mode Registry and Exports
 *
 * Purpose (Plain English):
 * Central place to register all mini-mode implementations. Import this file
 * and call registerAll() at app startup to enable all mini-modes.
 *
 * What it interacts with:
 * - Mini-Mode Registry: Registers all providers
 * - Individual mini-mode components: Imports and registers each one
 *
 * Safe AI extension points:
 * - Add new mini-mode implementations here
 * - Enable/disable mini-modes based on user preferences
 * - Add conditional registration based on feature flags
 *
 * Warnings:
 * - Must be called at app startup before any mini-modes are opened
 * - Only register each provider once (registry will warn on duplicates)
 */

import { miniModeRegistry, MiniModeProvider } from "../../lib/miniMode";
import { createLazyMiniModeComponent } from "./lazyMiniMode";

/**
 * All available mini-mode providers
 *
 * Plain English: List of all modules that can be used in mini-mode
 * Technical: Array of provider definitions with components
 */
const miniModeProviders: MiniModeProvider[] = [
  {
    id: "calendar",
    displayName: "Calendar Event",
    description: "Quickly create a calendar event",
    // Lazy load to keep initial bundle size small (mini-modes are optional).
    component: createLazyMiniModeComponent("calendar"),
  },
  {
    id: "planner",
    displayName: "Task",
    description: "Quickly create a task",
    // Lazy load because tasks are not always opened at app launch.
    component: createLazyMiniModeComponent("planner"),
  },
  {
    id: "notebook",
    displayName: "Note",
    description: "Quickly capture a note",
    // Lazy load to avoid eager bundling of note editor dependencies.
    component: createLazyMiniModeComponent("notebook"),
  },
  {
    id: "budget",
    displayName: "Transaction",
    description: "Quickly log an expense or income",
    // Lazy load because budget mini-mode is used infrequently.
    component: createLazyMiniModeComponent("budget"),
  },
  {
    id: "contacts",
    displayName: "Contact",
    description: "Quickly select a contact",
    // Lazy load to skip importing expo-contacts until needed.
    component: createLazyMiniModeComponent("contacts"),
  },
];

/**
 * Register all mini-mode providers
 *
 * Plain English:
 * Call this function once at app startup to enable all mini-mode functionality.
 * After calling this, any module can open these mini-modes using the registry.
 *
 * Technical:
 * Iterates through provider array and registers each with the singleton registry.
 * Safe to call multiple times (registry will warn but not error on duplicates).
 *
 * Usage:
 * ```typescript
 * import { registerAllMiniModes } from './components/miniModes';
 *
 * // In App.tsx or app entry point:
 * useEffect(() => {
 *   registerAllMiniModes();
 * }, []);
 * ```
 */
export function registerAllMiniModes(): void {
  miniModeProviders.forEach((provider) => {
    miniModeRegistry.register(provider);
  });

  console.log(
    `[MiniMode] Registered ${miniModeProviders.length} mini-mode providers:`,
    miniModeProviders.map((p) => p.id).join(", "),
  );
}

/**
 * Unregister all mini-mode providers
 *
 * Plain English: Remove all mini-mode providers (rarely needed, mainly for testing)
 * Technical: Iterates and unregisters each provider ID
 */
export function unregisterAllMiniModes(): void {
  miniModeProviders.forEach((provider) => {
    miniModeRegistry.unregister(provider.id);
  });
}

// Re-export individual mini-modes for direct use if needed
export { createLazyMiniModeComponent, getMiniModeLoader } from "./lazyMiniMode";
