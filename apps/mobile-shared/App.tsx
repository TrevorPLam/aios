import React, { useEffect } from "react";
import { StyleSheet, AppState, Platform } from "react-native";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@aios/platform/lib/query-client";

import RootStackNavigator from "./navigation/RootStackNavigator";
import { useAnalyticsNavigation } from "@aios/platform/lib/useAnalyticsNavigation";
import { ErrorBoundary } from "@aios/features/core/ui/components/ErrorBoundary";
import { ThemeProvider } from "@aios/ui/context/ThemeContext";
import { NavigationProvider } from "@aios/features/core/ui/context/NavigationContext";
import { Colors } from "@aios/ui/constants/theme";
import {
  isOmnisearchShortcut,
  shouldIgnoreShortcutTarget,
} from "@aios/platform/lib/keyboardShortcuts";
import { analytics } from "@aios/platform/analytics";

const AIOSTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.accent,
    background: Colors.dark.backgroundRoot,
    card: Colors.dark.backgroundDefault,
    text: Colors.dark.text,
    border: Colors.dark.border,
    notification: Colors.dark.accent,
  },
};

// Token optimization: Use `glob_file_search` for file finding instead of broad searches
export default function App() {
  const { navigationRef, handleNavigationReady, handleNavigationStateChange } =
    useAnalyticsNavigation();

  // ============================================================================
  // Governance: Application Initialization
  // ============================================================================
  // Constitution (Article 4): Incremental Delivery
  // - App initialization should be testable and reversible
  // - Each initialization step should be independently verifiable
  //
  // Principles:
  // - Make It Shippable (P4): App should work even if analytics fails
  // - Don't Break Surprises (P5): Preserve existing initialization behavior
  // - Assumptions Must Be Declared (P9): Document platform/environment assumptions
  //
  // Best Practices:
  // - Initialize critical services first (error boundaries, navigation)
  // - Handle initialization failures gracefully
  // - Use error boundaries to catch initialization errors
  // ============================================================================

  useEffect(() => {
    // Initialize analytics on app start
    // Governance: Analytics is non-critical - failures shouldn't break app
    // Principle P4: Make It Shippable - app works even if analytics fails
    const initAnalytics = async () => {
      await analytics.initialize();
      await analytics.trackAppOpened(0, "unknown");
      await analytics.trackSessionStart();
    };

    initAnalytics();

    // Track app backgrounded/foregrounded
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        analytics.trackAppBackgrounded();
      }
    });

    // Cleanup on unmount
    return () => {
      subscription.remove();
      analytics.shutdown();
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOmnisearchShortcut(event)) {
        return;
      }

      if (shouldIgnoreShortcutTarget(event.target)) {
        return;
      }

      event.preventDefault();

      if (navigationRef.isReady()) {
        navigationRef.navigate("Omnisearch");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigationRef]);

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <NavigationProvider>
              <GestureHandlerRootView style={styles.root}>
                <KeyboardProvider>
                  <NavigationContainer
                    ref={navigationRef}
                    theme={AIOSTheme}
                    onReady={handleNavigationReady}
                    onStateChange={handleNavigationStateChange}
                  >
                    <RootStackNavigator />
                  </NavigationContainer>
                  <StatusBar style="light" />
                </KeyboardProvider>
              </GestureHandlerRootView>
            </NavigationProvider>
          </SafeAreaProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
});
