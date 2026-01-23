/**
 * Lazy mini-mode loader
 *
 * Purpose (Plain English):
 * Keep the app's initial bundle small by loading mini-mode UI only when needed.
 */

import React, { ComponentType, LazyExoticComponent } from "react";
import { MiniModeComponentProps } from "../../lib/miniMode";

type MiniModeLoader = () => Promise<{
  default: ComponentType<MiniModeComponentProps>;
}>;

const miniModeLoaders: Record<string, MiniModeLoader> = {
  calendar: () => import("./CalendarMiniMode"),
  planner: () => import("./TaskMiniMode"),
  notebook: () => import("./NoteMiniMode"),
  budget: () => import("./BudgetMiniMode"),
  contacts: () => import("./ContactsMiniMode"),
};

export function getMiniModeLoader(moduleId: string): MiniModeLoader {
  if (!moduleId) {
    // Fail fast so callers know the registry input is invalid.
    throw new Error("Mini-mode module id is required.");
  }

  const loader = miniModeLoaders[moduleId];
  if (!loader) {
    // Explicit error helps track missing imports or renamed files.
    throw new Error(`No mini-mode loader registered for module: ${moduleId}`);
  }

  return loader;
}

export function createLazyMiniModeComponent(
  moduleId: string,
): LazyExoticComponent<ComponentType<MiniModeComponentProps>> {
  const loader = getMiniModeLoader(moduleId);

  return React.lazy(async () => {
    try {
      return await loader();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      // Preserve the original error context for debugging + alerting.
      throw new Error(`Failed to load mini-mode '${moduleId}': ${message}`);
    }
  });
}
