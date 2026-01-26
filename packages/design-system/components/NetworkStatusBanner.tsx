/**
 * NetworkStatusBanner Component
 *
 * Purpose (Plain English):
 * Shows a banner at the top of the screen when the device is offline.
 * Automatically appears/disappears based on network status. Helps users
 * understand why actions might be failing.
 *
 * What it does:
 * - Monitors network status
 * - Shows banner when offline
 * - Hides when back online
 * - Provides visual feedback with icon and message
 *
 * Architecture Note:
 * This component imports useNetworkStatus from @platform/lib, creating a
 * dependency from design-system → platform. This is intentional for convenience,
 * as the banner is a commonly used UI component that benefits from automatic
 * network detection. Alternative: pass network state as props, but this would
 * require more boilerplate in every usage.
 *
 * Usage:
 * ```tsx
 * <View>
 *   <NetworkStatusBanner />
 *   <YourContent />
 * </View>
 * ```
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";

import { ThemedText } from "@design-system/components/ThemedText";
import { useTheme } from "@design-system/hooks/useTheme";
import { Spacing } from "@design-system/constants/theme";
import { useNetworkStatus } from "@platform/lib/useNetworkStatus";

export interface NetworkStatusBannerProps {
  /**
   * Custom message to show when offline
   * @default "You're offline"
   */
  message?: string;

  /**
   * Custom description to show when offline
   * @default "Check your internet connection"
   */
  description?: string;

  /**
   * TestID for testing
   */
  testID?: string;
}

/**
 * Network Status Banner Component
 *
 * Shows a banner when device is offline. Automatically manages visibility
 * based on network status with smooth animations.
 *
 * @example Basic usage
 * ```tsx
 * function App() {
 *   return (
 *     <View style={{ flex: 1 }}>
 *       <NetworkStatusBanner />
 *       <YourMainContent />
 *     </View>
 *   );
 * }
 * ```
 *
 * @example Custom message
 * ```tsx
 * <NetworkStatusBanner
 *   message="No internet connection"
 *   description="Some features may not work correctly"
 * />
 * ```
 */
export function NetworkStatusBanner({
  message = "You're offline",
  description = "Check your internet connection",
  testID = "network-status-banner",
}: NetworkStatusBannerProps) {
  const { theme } = useTheme();
  const { isOffline, isLoading } = useNetworkStatus();

  // Don't show while loading or when online
  if (isLoading || !isOffline) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      exiting={FadeOutUp.duration(300)}
      style={[styles.container, { backgroundColor: theme.error }]}
      testID={testID}
    >
      <Feather name="wifi-off" size={20} color={theme.buttonText} />
      <View style={styles.textContainer}>
        <ThemedText
          type="small"
          style={[styles.message, { color: theme.buttonText }]}
        >
          {message}
        </ThemedText>
        <ThemedText
          type="tiny"
          style={[styles.description, { color: theme.buttonText }]}
        >
          {description}
        </ThemedText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  message: {
    fontWeight: "600",
  },
  description: {
    opacity: 0.9,
  },
});
