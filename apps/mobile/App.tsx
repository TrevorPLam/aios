import React, { useEffect } from "react";
import { StyleSheet, AppState, Platform } from "react-native";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@platform/lib/query-client";

import RootStackNavigator from "@apps/mobile/navigation/RootStackNavigator";
import { useAnalyticsNavigation } from "@platform/lib/useAnalyticsNavigation";
import { ErrorBoundary } from "@features/core/ui/components/ErrorBoundary";
import { ThemeProvider } from "@design-system/context/ThemeContext";
import { NavigationProvider } from "@features/core/ui/context/NavigationContext";
import { Colors } from "@design-system/constants/theme";
import {
  isOmnisearchShortcut,
  shouldIgnoreShortcutTarget,
} from "@platform/lib/keyboardShortcuts";
import { analytics } from "@platform/analytics";

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

export default function App() {
  const { navigationRef, handleNavigationReady, handleNavigationStateChange } =
    useAnalyticsNavigation();

  useEffect(() => {
    // Initialize analytics on app start
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

