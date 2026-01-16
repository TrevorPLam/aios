/**
 * useAnalyticsNavigation Hook
 *
 * Tracks navigation events automatically using React Navigation
 */

import { useEffect, useRef } from "react";
import { useNavigationState } from "@react-navigation/native";
import analytics from "@/analytics";
import { ModuleType } from "@/models/types";
import { MODULE_REGISTRY } from "@/analytics/registry";

// Map of route names to module IDs
const ROUTE_TO_MODULE: Record<string, ModuleType> = {
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

/**
 * Hook to track navigation events
 *
 * Automatically logs module_opened and module_switch events
 */
export function useAnalyticsNavigation() {
  const previousRouteRef = useRef<string | null>(null);
  const focusStartTimeRef = useRef<number | null>(null);

  const routeName = useNavigationState((state) => {
    if (!state || state.routes.length === 0) return null;
    const route = state.routes[state.index];
    return route?.name || null;
  });

  useEffect(() => {
    if (!routeName) return;

    const moduleId = ROUTE_TO_MODULE[routeName];
    if (!moduleId) return;

    // Track module_opened
    // Note: source defaults to "contextual" as we track navigation within the app
    // For deeplinks or external navigation, this would need to be enhanced
    analytics.trackModuleOpened(moduleId, "contextual");

    // Track module_switch if we have a previous route
    if (previousRouteRef.current && previousRouteRef.current !== routeName) {
      const previousModuleId = ROUTE_TO_MODULE[previousRouteRef.current];
      if (previousModuleId) {
        analytics.trackModuleSwitch(previousModuleId, moduleId);
      }
    }

    // Track module_focus_start
    focusStartTimeRef.current = Date.now();
    analytics.trackModuleFocusStart(moduleId);

    previousRouteRef.current = routeName;

    // Cleanup: track module_focus_end when component unmounts or route changes
    return () => {
      if (focusStartTimeRef.current && moduleId) {
        const durationSeconds = (Date.now() - focusStartTimeRef.current) / 1000;
        analytics.trackModuleFocusEnd(moduleId, durationSeconds);
      }
    };
  }, [routeName]);
}
