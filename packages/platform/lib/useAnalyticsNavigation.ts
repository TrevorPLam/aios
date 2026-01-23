/**
 * useAnalyticsNavigation Hook
 *
 * Tracks navigation events automatically using React Navigation
 */

import { useCallback, useEffect, useRef } from "react";
import { useNavigationContainerRef } from "@react-navigation/native";
import analytics from "@platform/analytics";
import { ModuleType } from "@contracts/models/types";
import { memoryManager } from "@platform/lib/memoryManager";
import { prefetchEngine } from "@platform/lib/prefetchEngine";
import {
  resolveModuleFromRoute,
  runPerformanceHooks,
} from "@platform/lib/navigationPerformance";

/**
 * Hook to track navigation events
 *
 * Automatically logs module_opened and module_switch events
 */
export function useAnalyticsNavigation() {
  const navigationRef = useNavigationContainerRef();
  const previousRouteRef = useRef<string | null>(null);
  const focusStartTimeRef = useRef<number | null>(null);
  const currentModuleRef = useRef<ModuleType | null>(null);

  const trackRouteChange = useCallback((routeName: string | null) => {
    if (!routeName || previousRouteRef.current === routeName) return;

    const moduleId = resolveModuleFromRoute(routeName);
    if (!moduleId) return;

    if (currentModuleRef.current && focusStartTimeRef.current) {
      const durationSeconds = (Date.now() - focusStartTimeRef.current) / 1000;
      analytics.trackModuleFocusEnd(currentModuleRef.current, durationSeconds);
    }

    if (previousRouteRef.current && previousRouteRef.current !== routeName) {
      const previousModuleId = resolveModuleFromRoute(previousRouteRef.current);
      if (previousModuleId) {
        analytics.trackModuleSwitch(previousModuleId, moduleId);
      }
    }

    analytics.trackModuleOpened(moduleId, "contextual");
    focusStartTimeRef.current = Date.now();
    analytics.trackModuleFocusStart(moduleId);

    // Prefetch + memory hooks should never block navigation; run and move on.
    void runPerformanceHooks({
      moduleId,
      onModuleEnter: (nextModule) => prefetchEngine.onModuleEnter(nextModule),
      onModuleAccess: (nextModule) => memoryManager.registerModuleAccess(nextModule),
      onModuleMount: (nextModule) => memoryManager.registerModuleMount(nextModule),
    });

    previousRouteRef.current = routeName;
    currentModuleRef.current = moduleId;
  }, []);

  const handleNavigationReady = useCallback(() => {
    trackRouteChange(navigationRef.getCurrentRoute()?.name ?? null);
  }, [navigationRef, trackRouteChange]);

  const handleNavigationStateChange = useCallback(() => {
    trackRouteChange(navigationRef.getCurrentRoute()?.name ?? null);
  }, [navigationRef, trackRouteChange]);

  useEffect(() => {
    return () => {
      if (currentModuleRef.current && focusStartTimeRef.current) {
        const durationSeconds = (Date.now() - focusStartTimeRef.current) / 1000;
        analytics.trackModuleFocusEnd(
          currentModuleRef.current,
          durationSeconds,
        );
      }
    };
  }, []);

  return {
    navigationRef,
    handleNavigationReady,
    handleNavigationStateChange,
  };
}
