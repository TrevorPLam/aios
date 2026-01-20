/**
 * Handoff Breadcrumb Component
 *
 * Purpose (Plain English):
 * Shows the breadcrumb trail when users navigate between modules (Calendar → Maps).
 * Displays a compact navigation bar at the top with a back button and module path.
 * iOS-native styling with blur backdrop and SF Symbols-inspired design.
 *
 * What it interacts with:
 * - Module Handoff Manager: Gets current breadcrumb trail
 * - Navigation: Triggers return navigation
 * - Haptics: iOS-native tactile feedback
 *
 * Safe AI extension points:
 * - Add AI-suggested next actions in breadcrumb
 * - Enhance animation with spring physics
 * - Add swipe-to-go-back gesture
 *
 * Warnings:
 * - Must respect iOS safe area insets (notch, dynamic island)
 * - Should animate in/out smoothly with native feel
 * - Keep height consistent with iOS navigation bar (~44pt)
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutUp,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";

import { moduleHandoffManager, useModuleHandoff } from "../lib/moduleHandoff";
import { useTheme } from "../hooks/useTheme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface HandoffBreadcrumbProps {
  /** Optional custom onBack handler (if not provided, uses handoff manager) */
  onBack?: () => void;
  /** Optional custom style for container */
  style?: any;
}

/**
 * Handoff Breadcrumb Bar
 *
 * Plain English:
 * A navigation bar that appears at the top when you're in a handoff,
 * showing where you came from and letting you go back.
 *
 * Technical:
 * Subscribes to handoff manager events, shows/hides automatically.
 * Uses iOS-native blur backdrop and smooth animations.
 * Handles safe area insets for notch/dynamic island.
 */
export function HandoffBreadcrumb({ onBack, style }: HandoffBreadcrumbProps) {
  const insets = useSafeAreaInsets();
  const { returnFromHandoff, breadcrumbs, isInHandoff } = useModuleHandoff();
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const styles = createStyles(theme);

  useEffect(() => {
    // Subscribe to handoff events
    const unsubscribe = moduleHandoffManager.subscribe((event) => {
      if (event === "handoff_start") {
        setVisible(true);
      } else if (
        event === "handoff_return" ||
        event === "handoff_cancel" ||
        event === "handoff_clear"
      ) {
        setVisible(moduleHandoffManager.isInHandoff());
      }
    });

    // Set initial visibility
    setVisible(moduleHandoffManager.isInHandoff());

    return () => {
      unsubscribe();
    };
  }, []);

  const handleBack = () => {
    // iOS haptic feedback
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (onBack) {
      onBack();
    } else {
      returnFromHandoff(undefined, "back");
    }
  };

  // Don't render if not in handoff
  if (!visible || !isInHandoff || breadcrumbs.length < 2) {
    return null;
  }

  // Get previous and current module names
  const previousModule = breadcrumbs[breadcrumbs.length - 2];
  const currentModule = breadcrumbs[breadcrumbs.length - 1];

  return (
    <Animated.View
      entering={SlideInDown.duration(300).springify()}
      exiting={SlideOutUp.duration(200)}
      style={[styles.container, { paddingTop: insets.top }, style]}
    >
      {/* iOS-style blur backdrop */}
      {Platform.OS === "ios" && (
        <BlurView intensity={95} tint="dark" style={StyleSheet.absoluteFill} />
      )}

      {/* Non-iOS fallback */}
      {Platform.OS !== "ios" && <View style={styles.fallbackBackdrop} />}

      <View style={styles.content}>
        {/* Back button */}
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Back to ${previousModule}`}
          accessibilityHint="Return to previous screen"
        >
          <Feather name="chevron-left" size={24} color={theme.electric} />
          <Text style={styles.backText} numberOfLines={1}>
            {previousModule}
          </Text>
        </TouchableOpacity>

        {/* Breadcrumb trail */}
        <View style={styles.breadcrumbContainer}>
          <Text style={styles.breadcrumbText} numberOfLines={1}>
            {breadcrumbs.join(" › ")}
          </Text>
        </View>
      </View>

      {/* Separator line (iOS style) */}
      <View style={styles.separator} />
    </Animated.View>
  );
}

/**
 * Compact Breadcrumb (alternative style)
 *
 * Plain English: A smaller breadcrumb that shows just the path, no back button
 * Technical: Useful for embedding in headers or when back button is elsewhere
 */
export function CompactBreadcrumb({ style }: { style?: any }) {
  const { breadcrumbs, isInHandoff } = useModuleHandoff();
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const styles = createStyles(theme);

  useEffect(() => {
    const unsubscribe = moduleHandoffManager.subscribe(() => {
      setVisible(moduleHandoffManager.isInHandoff());
    });

    setVisible(moduleHandoffManager.isInHandoff());

    return () => {
      unsubscribe();
    };
  }, []);

  if (!visible || !isInHandoff || breadcrumbs.length < 2) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={[styles.compactContainer, style]}
    >
      <Feather
        name="corner-down-right"
        size={14}
        color={theme.textSecondary}
        style={styles.compactIcon}
      />
      <Text style={styles.compactText} numberOfLines={1}>
        {breadcrumbs.join(" › ")}
      </Text>
    </Animated.View>
  );
}

/**
 * Create styles with theme colors
 * Using a factory function instead of StyleSheet.create at module level
 * because we need runtime theme colors (light/dark mode)
 */
const createStyles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: Platform.OS === "ios" ? "transparent" : theme.deepSpace,
    overflow: "hidden",
  },
  fallbackBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 14, 26, 0.95)",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    height: 44, // iOS standard navigation bar height
    paddingHorizontal: 8,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    maxWidth: SCREEN_WIDTH * 0.5, // Max 50% width
  },
  backText: {
    color: theme.electric,
    fontSize: 17, // iOS standard font size
    fontWeight: "400",
    marginLeft: 4,
  },
  breadcrumbContainer: {
    flex: 1,
    alignItems: "flex-end",
    paddingHorizontal: 12,
  },
  breadcrumbText: {
    color: theme.textSecondary,
    fontSize: 13,
    fontWeight: "500",
    opacity: 0.7,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.border,
    opacity: 0.3,
  },
  // Compact style
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(26, 31, 46, 0.8)",
    borderRadius: 12,
  },
  compactIcon: {
    marginRight: 6,
  },
  compactText: {
    color: theme.textSecondary,
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },
});
