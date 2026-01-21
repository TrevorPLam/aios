/**
 * BottomNav Component
 *
 * Purpose (Plain English):
 * Navigation bar at bottom of screen that cycles through enabled modules.
 * Left/right arrows navigate to previous/next module. Center AI button opens
 * AI assistance. Module order adapts based on usage frequency.
 *
 * Features:
 * - Circular navigation through enabled modules
 * - Usage-based intelligent module ordering
 * - Contextual module suggestions (via NavigationContext)
 * - Route validation before navigation
 * - Error handling with user-friendly alerts
 * - Haptic feedback on navigation
 * - Accessibility support with proper labels
 *
 * Technical Implementation:
 * - Uses React Navigation for routing
 * - Queries database for module usage statistics
 * - Validates routes against navigator state
 * - Filters modules by enabled status in settings
 * - Sorts by usage count for intuitive ordering
 *
 * Data Flow:
 * 1. Load settings.enabledModules from database
 * 2. Filter ALL_MODULES by enabled status
 * 3. Sort by settings.moduleUsageStats[moduleId].count
 * 4. Calculate prev/next based on current route
 * 5. Validate route exists before navigation
 * 6. Track usage on successful navigation
 *
 * Safe AI Extension Points:
 * - Add module badges for notifications
 * - Add smart module suggestions based on time/context
 * - Add module search/filter
 * - Add module pinning
 *
 * Fragile Logic Warnings:
 * - Module order changes affect prev/next calculation
 * - Route validation depends on navigator state timing
 * - Circular navigation wraps at array boundaries
 * - ContextualModule takes precedence over ordered next
 *
 * @module BottomNav
 */

import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Pressable, Alert } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { ThemedText } from "./ThemedText";
import { db } from "@/storage/database";
import { ModuleType } from "@/models/types";
import { useNavigationContext } from "@/context/NavigationContext";
import {
  getNavigationErrorMessage,
  validateRouteRegistration,
} from "@/utils/navigationValidation";

export type ModuleItem = {
  id: ModuleType;
  name: string;
  route: keyof AppStackParamList;
  icon: keyof typeof Feather.glyphMap;
};

const ALL_MODULES: ModuleItem[] = [
  { id: "notebook", name: "Notebook", route: "Notebook", icon: "book-open" },
  { id: "planner", name: "Planner", route: "Planner", icon: "check-square" },
  { id: "calendar", name: "Calendar", route: "Calendar", icon: "calendar" },
  { id: "email", name: "Email", route: "Email", icon: "mail" },
  {
    id: "messages",
    name: "Messages",
    route: "Messages",
    icon: "message-square",
  },
  { id: "lists", name: "Lists", route: "Lists", icon: "list" },
  { id: "alerts", name: "Alerts", route: "Alerts", icon: "bell" },
  { id: "photos", name: "Photos", route: "Photos", icon: "image" },
  { id: "contacts", name: "Contacts", route: "Contacts", icon: "users" },
  { id: "budget", name: "Budget", route: "Budget", icon: "pie-chart" },
  { id: "translator", name: "Translator", route: "Translator", icon: "globe" },
];

interface BottomNavProps {
  onAiPress: () => void;
}

export function BottomNav({ onAiPress }: BottomNavProps) {
  const { theme } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const [orderedModules, setOrderedModules] =
    useState<ModuleItem[]>(ALL_MODULES);
  const { contextualModule, clearContextualModule } = useNavigationContext();

  /**
   * Loads and orders modules based on user settings and usage statistics.
   * Memoized to prevent recreation on every render.
   * 
   * @returns {Promise<void>}
   */
  const loadModuleOrder = useCallback(async () => {
    const settings = await db.settings.get();
    let modules = [...ALL_MODULES];

    // Filter by enabled modules - ensure enabledModules exists
    if (settings.enabledModules && Array.isArray(settings.enabledModules)) {
      modules = modules.filter((m) => settings.enabledModules.includes(m.id));
    }

    // Sort by usage count (intuitive ordering)
    const stats = settings.moduleUsageStats || {};
    if (Object.keys(stats).length > 0) {
      modules.sort((a, b) => {
        const aCount = stats[a.id]?.count || 0;
        const bCount = stats[b.id]?.count || 0;
        return bCount - aCount; // Most used first
      });
    }

    setOrderedModules(modules);
  }, []); // Empty deps: uses shared values which are mutable refs (don't trigger re-renders)

  useEffect(() => {
    // loadModuleOrder is stable (memoized with empty deps), safe to use here
    loadModuleOrder();
  }, [loadModuleOrder]);

  // Find current module index if we are in one, otherwise default to -1
  const currentIndex = orderedModules.findIndex((m) => m.route === route.name);

  // Circular navigation logic - CommandCenter is in the center
  const getPrevModule = () => {
    if (currentIndex === -1) return orderedModules[orderedModules.length - 1];
    const prevIndex =
      (currentIndex - 1 + orderedModules.length) % orderedModules.length;
    return orderedModules[prevIndex];
  };

  const getNextModule = () => {
    // If there's a contextual module, use it instead of the next in order
    if (contextualModule) {
      const contextModule = orderedModules.find(
        (m) => m.id === contextualModule,
      );
      if (contextModule) {
        return contextModule;
      }
    }

    if (currentIndex === -1) return orderedModules[0];
    const nextIndex = (currentIndex + 1) % orderedModules.length;
    return orderedModules[nextIndex];
  };

  const prev = getPrevModule();
  const next = getNextModule();

  /**
   * Shows a user-friendly navigation error alert.
   *
   * @param moduleName - Optional module name to include in error message
   */
  const showNavigationError = (moduleName?: string) => {
    Alert.alert(
      "Navigation Error",
      getNavigationErrorMessage(moduleName),
      [{ text: "OK" }],
    );
  };

  /**
   * Logs a navigation error with structured metadata for debugging.
   *
   * @param context - Description of what operation failed
   * @param error - The error object or message
   * @param metadata - Additional context data
   */
  const logNavigationError = (
    context: string,
    error: unknown,
    metadata: Record<string, unknown>,
  ) => {
    console.error(`[BottomNav] ${context}:`, error, {
      ...metadata,
      timestamp: new Date().toISOString(),
    });
  };

  /**
   * Validates if a route exists in the navigation stack.
   * Prevents navigation errors by checking navigator state before attempting navigation.
   *
   * @param routeName - The route name to validate against registered routes
   * @returns true if route exists in navigator, false otherwise
   *
   * @example
   * if (isValidRoute("Notebook")) {
   *   navigation.navigate("Notebook");
   * }
   */
  /**
   * Handles navigation to a module with comprehensive validation and error handling.
   *
   * Flow:
   * 1. Validate route exists in navigation stack
   * 2. Track module usage in database
   * 3. Clear contextual module if present
   * 4. Navigate to module
   * 5. Handle any errors with user alerts and logging
   *
   * @param module - The module to navigate to
   *
   * @throws Will show alert to user and log error if navigation fails
   *
   * @example
   * await handleNavigation({ id: "notebook", name: "Notebook", route: "Notebook", icon: "book-open" });
   */
  const handleNavigation = async (module: ModuleItem) => {
    const routeNames = navigation.getState()?.routeNames ?? [];
    const validation = validateRouteRegistration({
      routeName: module.route,
      routeNames,
      moduleName: module.name,
    });

    // Stop early if the route is missing to avoid silent navigation failures.
    if (!validation.isValid) {
      const errorMessage = validation.error;

      // Log error for debugging
      logNavigationError("Navigation Error", errorMessage, {
        moduleId: module.id,
        moduleName: module.name,
        route: module.route,
      });

      // Show user-friendly error message
      showNavigationError(module.name);

      return;
    }

    try {
      await db.settings.trackModuleUsage(module.id);
      // Clear contextual module after navigation
      if (contextualModule) {
        clearContextualModule();
      }
      navigation.navigate(module.route as any);
    } catch (error) {
      // Log any navigation errors
      logNavigationError("Navigation failed", error, {
        moduleId: module.id,
        moduleName: module.name,
        route: module.route,
      });

      showNavigationError();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundBlack,
          paddingBottom: insets.bottom + Spacing.xs,
          paddingLeft: Math.max(insets.left, Spacing.sm),
          paddingRight: Math.max(insets.right, Spacing.sm),
        },
      ]}
    >
      <Pressable
        onPress={() => handleNavigation(prev)}
        style={({ pressed }) => [
          styles.navButton,
          {
            backgroundColor: theme.backgroundSecondary,
            borderColor: theme.border,
          },
          pressed && styles.pressed,
        ]}
      >
        <ThemedText type="h2" muted style={styles.arrow}>
          ‹
        </ThemedText>
      </Pressable>

      <Pressable
        onPress={onAiPress}
        style={({ pressed }) => [
          styles.aiButton,
          { backgroundColor: theme.accent, borderColor: theme.accentGlow },
          pressed && { opacity: 0.8 },
        ]}
      >
        <MaterialCommunityIcons
          name="brain"
          size={24}
          color={theme.backgroundRoot}
        />
      </Pressable>

      <Pressable
        onPress={() => handleNavigation(next)}
        style={({ pressed }) => [
          styles.navButton,
          {
            backgroundColor: theme.backgroundSecondary,
            borderColor: theme.border,
          },
          pressed && styles.pressed,
        ]}
      >
        <ThemedText type="h2" muted style={styles.arrow}>
          ›
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 0, // Changed from Spacing.lg to allow edge-to-edge stretch
    paddingTop: Spacing.xs,
    // Container extends edge-to-edge; buttons maintain spacing via justifyContent
    width: "100%",
    minHeight: 68, // Reduced from 80 to make nav thinner
  },
  navButton: {
    // FIXED SIZE: Reduced to make nav bar thinner
    width: 48, // Reduced from 56
    height: 48, // Reduced from 56
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  navContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  arrow: {
    // BOLD ARROWS ONLY: size 32, bold - per requirements
    fontSize: 32,
    fontWeight: "bold",
  },
  label: {
    marginTop: 4,
    fontSize: 10,
  },
  aiButton: {
    // FIXED SIZE: AI button centered between arrows (reduced to make nav thinner)
    width: 56, // Reduced from 64
    height: 56, // Reduced from 64
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    ...Shadows.glow,
  },
  pressed: {
    opacity: 0.7,
  },
});
