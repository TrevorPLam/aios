import { ModuleType } from "@aios/contracts/models/types";
import { logger } from "@aios/platform/lib/logger";

// Central route-to-module mapping keeps analytics + performance tooling in sync.
export const ROUTE_TO_MODULE: Record<string, ModuleType> = {
  CommandCenter: "command",
  Notebook: "notebook",
  Planner: "planner",
  Calendar: "calendar",
  Email: "email",
  Messages: "messages",
  Lists: "lists",
  Alerts: "alerts",
  Photos: "photos",
  Contacts: "contacts",
  Translator: "translator",
  Budget: "budget",
};

export function resolveModuleFromRoute(
  routeName: string | null,
): ModuleType | null {
  if (!routeName) {
    // We log at debug to keep noisy cases (startup, teardown) visible when needed.
    logger.debug(
      "NavigationPerformance",
      "Missing route name; skipping module lookup",
    );
    return null;
  }

  const moduleId = ROUTE_TO_MODULE[routeName];
  if (!moduleId) {
    // Route may be modal/utility; treat as non-module instead of throwing.
    logger.debug("NavigationPerformance", "Route has no module mapping", {
      routeName,
    });
    return null;
  }

  return moduleId;
}

interface PerformanceHandlers {
  moduleId: ModuleType | null;
  onModuleEnter?: (moduleId: ModuleType) => Promise<void> | void;
  onModuleAccess?: (moduleId: ModuleType) => void;
  onModuleMount?: (moduleId: ModuleType) => void;
}

export async function runPerformanceHooks({
  moduleId,
  onModuleEnter,
  onModuleAccess,
  onModuleMount,
}: PerformanceHandlers): Promise<void> {
  if (!moduleId) {
    // Avoid doing work when the route is not a tracked module.
    return;
  }

  if (!onModuleEnter || !onModuleAccess || !onModuleMount) {
    // Explicit guard so we fail safely if a dependency is missing.
    logger.warn("NavigationPerformance", "Missing performance handlers", {
      moduleId,
      hasEnter: Boolean(onModuleEnter),
      hasAccess: Boolean(onModuleAccess),
      hasMount: Boolean(onModuleMount),
    });
    return;
  }

  try {
    // Mount first so access counts reflect active usage in the same tick.
    onModuleMount(moduleId);
    onModuleAccess(moduleId);
    await onModuleEnter(moduleId);
  } catch (error) {
    logger.error("NavigationPerformance", "Failed to run performance hooks", {
      moduleId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
