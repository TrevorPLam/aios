/**
 * Persistent Sidebar Component
 *
 * Purpose (Plain English):
 * Always-accessible navigation drawer that shows your most-used modules.
 * Swipe from left edge to open, tap outside to close. Shows top 10 modules
 * with "More" button to see all. Adapts to context (work/personal mode).
 *
 * What it interacts with:
 * - Module Registry (to get modules to display)
 * - Context Engine (to filter modules by context)
 * - Navigation (to navigate to modules)
 * - Analytics (to track module opens)
 *
 * Technical Implementation:
 * Uses React Native's PanResponder for edge swipe gesture, Animated API for
 * smooth drawer animation. Collapsible state shows icons only vs full names.
 *
 * Safe AI Extension Points:
 * - Add module badges/notifications
 * - Add module search within sidebar
 * - Add quick actions per module
 *
 * Fragile Logic Warnings:
 * - Edge swipe detection must not conflict with other gestures
 * - Animation must be smooth (use native driver)
 * - Must provide button alternative for accessibility
 * - Overlay tap must dismiss sidebar reliably
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  PanResponder,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "./ThemedText";
import { useTheme } from "@aios/ui/hooks/useTheme";
import { Spacing, BorderRadius } from "@aios/ui/constants/theme";
import {
  Animation,
  Opacity,
  ComponentSize,
  Sidebar,
  ZIndex,
} from "@aios/ui/constants/uiConstants";
import {
  moduleRegistry,
  ModuleDefinition,
} from "@aios/features/core/domain/moduleRegistry";
import {
  contextEngine,
  ContextZone,
} from "@aios/features/core/domain/contextEngine";
import { eventBus, EVENT_TYPES } from "@aios/platform/lib/eventBus";
import { isSidebarSwipeSupported } from "@aios/platform/lib/platformSupport";

const SIDEBAR_WIDTH = Sidebar.width;
const COLLAPSED_WIDTH = Sidebar.collapsedWidth;
const EDGE_SWIPE_WIDTH = Sidebar.edgeSwipeWidth;
const MINIMUM_GESTURE_THRESHOLD = Sidebar.gestureThreshold;

export interface PersistentSidebarProps {
  currentModuleId?: string;
  onModuleSelect: (moduleId: string, routeName: string) => void;
  onAllModulesPress: () => void;
}

/**
 * Persistent Sidebar Component
 */
export function PersistentSidebar({
  currentModuleId,
  onModuleSelect,
  onAllModulesPress,
}: PersistentSidebarProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [modules, setModules] = useState<ModuleDefinition[]>([]);
  const [contextZone, setContextZone] = useState<ContextZone>(ContextZone.AUTO);

  const translateX = useSharedValue(-SIDEBAR_WIDTH);
  const isSwipeEnabled = isSidebarSwipeSupported(Platform.OS);

  /**
   * PanResponder for Edge Swipe Gesture
   *
   * Detects left edge swipe to open sidebar with touch gesture.
   * Implements iOS/Android-style edge swipe navigation pattern.
   *
   * Gesture Recognition:
   * - Touch must start within EDGE_SWIPE_WIDTH (30px) from left edge
   * - Minimum movement threshold prevents accidental taps
   * - Velocity threshold (0.5) or distance threshold (30% of width) triggers open
   *
   * State Machine:
   * 1. onStartShouldSetPanResponder: Check if touch is in activation zone
   * 2. onMoveShouldSetPanResponder: Activate on rightward swipe
   * 3. onPanResponderMove: Track finger position, update animation
   * 4. onPanResponderRelease: Determine final state (open/closed) based on velocity/distance
   * 5. onPanResponderTerminate: Handle interruption, snap back to closed
   *
   * Accessibility:
   * - Button alternative always available for non-gesture users
   * - Gesture won't interfere with other touch interactions
   *
   * @see openSidebar - Called when gesture completes successfully
   */
  const panResponder = useRef(
    PanResponder.create({
      /**
       * Determine if this responder should begin capturing gestures.
       * Only activates for touches near the left edge with minimum movement.
       */
      onStartShouldSetPanResponder: (evt, gestureState) => {
        if (!isSwipeEnabled) return false;
        // Don't capture if sidebar is already open
        if (isOpen) return false;

        // Check if touch started near left edge
        const { pageX } = evt.nativeEvent;
        const { dx, dy } = gestureState;

        // Add minimum movement threshold to avoid capturing small taps
        const hasMinimumMovement =
          Math.abs(dx) > MINIMUM_GESTURE_THRESHOLD ||
          Math.abs(dy) > MINIMUM_GESTURE_THRESHOLD;

        return pageX <= EDGE_SWIPE_WIDTH && hasMinimumMovement;
      },

      /**
       * Alternative capture point for ongoing gestures.
       * Activates when movement clearly indicates rightward swipe intent.
       */
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if (!isSwipeEnabled) return false;
        if (isOpen) return false;

        const { pageX } = evt.nativeEvent;
        const { dx } = gestureState;

        // Only respond if swipe started near edge and moving right
        return pageX <= EDGE_SWIPE_WIDTH && dx > Sidebar.minimumSwipeDistance;
      },

      /**
       * Handle continuous gesture movement.
       * Updates sidebar position to follow finger, clamped to valid range.
       */
      onPanResponderMove: (evt, gestureState) => {
        if (!isSwipeEnabled) return;
        const { dx } = gestureState;

        // Limit translation to 0 (fully open) and -SIDEBAR_WIDTH (fully closed)
        const newTranslateX = Math.max(
          -SIDEBAR_WIDTH,
          Math.min(0, -SIDEBAR_WIDTH + dx),
        );
        translateX.value = newTranslateX;
      },

      /**
       * Handle gesture release (finger lifted).
       * Determines final state based on swipe distance and velocity.
       */
      onPanResponderRelease: (evt, gestureState) => {
        if (!isSwipeEnabled) return;
        const { dx, vx } = gestureState;

        // Determine if swipe velocity or distance is sufficient to open
        // Distance: > 30% of sidebar width OR Velocity: > 0.5 units/ms
        const shouldOpen =
          dx > SIDEBAR_WIDTH * Sidebar.openThreshold ||
          vx > Sidebar.velocityThreshold;

        if (shouldOpen) {
          runOnJS(openSidebar)();
        } else {
          // Snap back closed with spring animation
          translateX.value = withSpring(-SIDEBAR_WIDTH, {
            damping: Animation.springDamping,
            stiffness: Animation.springStiffness,
          });
        }
      },

      /**
       * Handle gesture termination (interrupted by another gesture).
       * Always snaps back to closed state for safety.
       */
      onPanResponderTerminate: () => {
        if (!isSwipeEnabled) return;
        // Snap back closed
        translateX.value = withSpring(-SIDEBAR_WIDTH, {
          damping: Animation.springDamping,
          stiffness: Animation.springStiffness,
        });
      },
    }),
  ).current;

  /**
   * Load Modules
   *
   * Gets modules to display from registry, filtered by context.
   */
  useEffect(() => {
    const loadModules = () => {
      const sidebarModules = moduleRegistry.getModulesForSidebar();
      setModules(sidebarModules);
    };

    loadModules();

    // Listen to context changes
    const unsubscribe = contextEngine.onChange((detection) => {
      setContextZone(detection.zone);
      loadModules();
    });

    return unsubscribe;
  }, []);

  /**
   * Open Sidebar
   */
  const openSidebar = () => {
    setIsOpen(true);
    translateX.value = withSpring(0, {
      damping: Animation.springDamping,
      stiffness: Animation.springStiffness,
    });

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    eventBus.emit(EVENT_TYPES.USER_ACTION, {
      action: "sidebar_opened",
    });
  };

  /**
   * Close Sidebar
   */
  const closeSidebar = () => {
    setIsOpen(false);
    translateX.value = withSpring(-SIDEBAR_WIDTH, {
      damping: Animation.springDamping,
      stiffness: Animation.springStiffness,
    });

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    eventBus.emit(EVENT_TYPES.USER_ACTION, {
      action: "sidebar_closed",
    });
  };

  /**
   * Handle Module Press
   */
  const handleModulePress = (module: ModuleDefinition) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Record usage
    moduleRegistry.recordModuleOpen(module.id);

    // Emit event
    eventBus.emit(EVENT_TYPES.MODULE_OPENED, {
      moduleId: module.id,
      routeName: module.routeName,
    });

    // Navigate
    onModuleSelect(module.id, module.routeName);

    // Close sidebar
    closeSidebar();
  };

  /**
   * Animated Styles
   */
  const sidebarAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    const opacity = withTiming(isOpen ? Opacity.overlay : 0, {
      duration: Animation.overlayDuration,
    });
    return { opacity };
  });

  /**
   * Render Module Item
   */
  const renderModuleItem = (module: ModuleDefinition) => {
    const isActive = currentModuleId === module.id;
    const isVisible = contextEngine.shouldModuleBeVisible(module.id);

    // Hide modules not in current context (except command)
    if (!isVisible) return null;

    return (
      <Pressable
        key={module.id}
        onPress={() => handleModulePress(module)}
        style={({ pressed }) => [
          styles.moduleItem,
          isActive && styles.moduleItemActive,
          pressed && styles.moduleItemPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Open ${module.name}`}
        accessibilityState={{ selected: isActive }}
      >
        <View style={[styles.moduleIcon, isActive && styles.moduleIconActive]}>
          <Feather
            name={module.icon as any}
            size={22}
            color={isActive ? theme.accent : theme.textSecondary}
          />
        </View>

        {!isCollapsed && (
          <ThemedText
            style={[
              styles.moduleText,
              isActive && { color: theme.accent, fontWeight: "600" },
            ]}
          >
            {module.name}
          </ThemedText>
        )}

        {isActive && (
          <View
            style={[styles.activeIndicator, { backgroundColor: theme.accent }]}
          />
        )}
      </Pressable>
    );
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <Animated.View
          style={[
            styles.overlay,
            { backgroundColor: "rgba(0, 0, 0, 0.5)" },
            overlayAnimatedStyle,
          ]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeSidebar}
            accessibilityRole="button"
            accessibilityLabel="Close sidebar"
          />
        </Animated.View>
      )}

      {/* Sidebar */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            backgroundColor: theme.backgroundSecondary,
            width: isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH,
            paddingTop: insets.top + Spacing.md,
            paddingBottom: insets.bottom + Spacing.md,
            borderRightColor: theme.border,
          },
          sidebarAnimatedStyle,
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          {!isCollapsed && (
            <ThemedText style={styles.headerText}>Navigation</ThemedText>
          )}
          <Pressable
            onPress={closeSidebar}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Close sidebar"
          >
            <Feather name="x" size={20} color={theme.textSecondary} />
          </Pressable>
        </View>

        {/* Context Indicator */}
        {!isCollapsed && contextZone !== ContextZone.AUTO && (
          <View
            style={[styles.contextBadge, { backgroundColor: theme.accentDim }]}
          >
            <ThemedText style={[styles.contextText, { color: theme.accent }]}>
              {contextZone === ContextZone.WORK && "💼 Work Mode"}
              {contextZone === ContextZone.PERSONAL && "🏡 Personal Mode"}
              {contextZone === ContextZone.FOCUS && "🎯 Focus Mode"}
              {contextZone === ContextZone.EVENING && "🌙 Evening Mode"}
              {contextZone === ContextZone.WEEKEND && "🎉 Weekend Mode"}
            </ThemedText>
          </View>
        )}

        {/* Module List */}
        <ScrollView
          style={styles.moduleList}
          showsVerticalScrollIndicator={false}
        >
          {modules.map(renderModuleItem)}
        </ScrollView>

        {/* All Modules Button */}
        <Pressable
          onPress={() => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            onAllModulesPress();
            closeSidebar();
          }}
          style={({ pressed }) => [
            styles.allModulesButton,
            { backgroundColor: theme.backgroundTertiary },
            pressed && { opacity: Opacity.pressedLight },
          ]}
          accessibilityRole="button"
          accessibilityLabel="View all modules"
        >
          <Feather name="grid" size={20} color={theme.accent} />
          {!isCollapsed && (
            <ThemedText
              style={[styles.allModulesText, { color: theme.accent }]}
            >
              All Modules
            </ThemedText>
          )}
        </Pressable>
      </Animated.View>

      {/* Edge Swipe Button (Always Visible) */}
      {!isOpen && (
        <Pressable
          onPress={openSidebar}
          style={[
            styles.edgeButton,
            {
              backgroundColor: theme.backgroundSecondary,
              borderColor: theme.border,
              top: insets.top + 60,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Open sidebar"
        >
          <Feather name="menu" size={20} color={theme.accent} />
        </Pressable>
      )}

      {/* Edge Swipe Gesture Zone */}
      {!isOpen && isSwipeEnabled && (
        <View
          {...panResponder.panHandlers}
          style={[
            styles.edgeSwipeZone,
            { top: insets.top, bottom: insets.bottom },
          ]}
          pointerEvents="box-none"
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: ZIndex.overlay,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: ZIndex.sidebar,
    borderRightWidth: 1,
    paddingHorizontal: Spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: Spacing.xs,
  },
  contextBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
  },
  contextText: {
    fontSize: 12,
    fontWeight: "500",
  },
  moduleList: {
    flex: 1,
  },
  moduleItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
    position: "relative",
  },
  moduleItemActive: {
    backgroundColor: "rgba(0, 217, 255, 0.1)",
  },
  moduleItemPressed: {
    opacity: Opacity.pressedLight,
  },
  moduleIcon: {
    width: ComponentSize.iconMedium,
    height: ComponentSize.iconMedium,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  moduleIconActive: {
    backgroundColor: "rgba(0, 217, 255, 0.15)",
  },
  moduleText: {
    marginLeft: Spacing.sm,
    fontSize: 15,
  },
  activeIndicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: ComponentSize.activeIndicator,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  allModulesButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  allModulesText: {
    marginLeft: Spacing.sm,
    fontSize: 15,
    fontWeight: "500",
  },
  edgeButton: {
    position: "absolute",
    left: 0,
    width: ComponentSize.edgeButton,
    height: ComponentSize.edgeButton,
    borderTopRightRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: ZIndex.edgeButton,
  },
  edgeSwipeZone: {
    position: "absolute",
    left: 0,
    width: EDGE_SWIPE_WIDTH,
    zIndex: ZIndex.edgeButton - 1,
  },
});
