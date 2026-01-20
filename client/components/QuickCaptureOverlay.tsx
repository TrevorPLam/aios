/**
 * Quick Capture Overlay Component
 *
 * Purpose (Plain English):
 * A global overlay accessible via long-press from anywhere in the app. Lets users
 * quickly capture notes, tasks, expenses, or photos without losing their current context.
 * When done, they return to exactly where they were.
 *
 * What it interacts with:
 * - Mini-Mode Registry: Opens appropriate mini-modes for capture actions
 * - Gesture Handler: Detects long-press gestures globally
 * - Haptics: Provides tactile feedback
 *
 * Safe AI extension points:
 * - Add AI-suggested capture types based on context
 * - Add voice-to-text for quick capture
 * - Add recent captures preview
 * - Add keyboard shortcuts for quick access
 *
 * Warnings:
 * - Must not interfere with other gestures (scrolling, swiping)
 * - Always provide escape hatches (tap outside to dismiss)
 * - Keep menu options limited (max 5-6 for mobile)
 * - Ensure accessibility (keyboard nav, screen reader)
 */

import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";

import { miniModeRegistry, useMiniMode } from "../lib/miniMode";
import { ThemedText } from "./ThemedText";
import { Colors, Spacing, Typography } from "../constants/theme";

/**
 * Capture action types
 *
 * Plain English: What can users quickly capture?
 * Technical: Array of action definitions with icons, labels, and handlers
 */
interface CaptureAction {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  label: string;
  color: string;
  miniModeModule?: string; // If defined, opens this mini-mode
  handler?: () => void; // Custom handler (e.g., for photo capture)
}

interface QuickCaptureOverlayProps {
  visible: boolean;
  onDismiss: () => void;
  source?: string; // Where was quick capture invoked from
}

/**
 * Quick Capture Menu Overlay
 *
 * Plain English:
 * Shows a radial menu of quick capture options. User taps an option to
 * start capturing that type of content.
 *
 * Technical:
 * Modal overlay with animated appearance. Each action either opens a mini-mode
 * or triggers a custom handler. Returns user to original context on dismiss.
 */
export function QuickCaptureOverlay({
  visible,
  onDismiss,
  source = "unknown",
}: QuickCaptureOverlayProps) {
  const { openMiniMode } = useMiniMode();

  /**
   * Available capture actions
   *
   * Plain English: What you can quickly create
   * Technical: Defines UI and behavior for each action
   */
  const captureActions: CaptureAction[] = [
    {
      id: "note",
      icon: "edit-3",
      label: "Note",
      color: Colors.electricBlue,
      miniModeModule: "notebook",
    },
    {
      id: "task",
      icon: "check-square",
      label: "Task",
      color: Colors.success,
      miniModeModule: "planner",
    },
    {
      id: "event",
      icon: "calendar",
      label: "Event",
      color: Colors.warning,
      miniModeModule: "calendar",
    },
    {
      id: "expense",
      icon: "dollar-sign",
      label: "Expense",
      color: Colors.error,
      miniModeModule: "budget", // Now implemented!
    },
    {
      id: "photo",
      icon: "camera",
      label: "Photo",
      color: "#9B59B6",
      // Note: Photo capture would use native camera
      handler: () => {
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
        alert("Photo capture coming soon!");
      },
    },
  ];

  /**
   * Handle action selection
   *
   * Plain English: User tapped a capture option - open mini-mode or run handler
   * Technical: Opens mini-mode if defined, otherwise runs custom handler
   */
  const handleActionSelect = (action: CaptureAction) => {
    // Haptic feedback
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Dismiss quick capture menu first
    onDismiss();

    // Small delay to allow dismiss animation to complete
    setTimeout(() => {
      if (action.miniModeModule) {
        // Open mini-mode
        const success = openMiniMode({
          module: action.miniModeModule,
          source: `quick_capture_${source}`,
          onComplete: (result) => {
            console.log("[QuickCapture] Action completed:", result);
          },
          onDismiss: () => {
            console.log("[QuickCapture] Action dismissed");
          },
        });

        if (!success) {
          console.warn(
            `[QuickCapture] Failed to open mini-mode: ${action.miniModeModule}`,
          );
        }
      } else if (action.handler) {
        // Run custom handler
        action.handler();
      }
    }, 200);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
      statusBarTranslucent
      accessible={true}
      accessibilityViewIsModal={true}
      accessibilityLabel="Quick capture menu"
    >
      {/* Backdrop - dismisses on tap */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel="Close quick capture"
        accessibilityHint="Tap to dismiss without capturing"
      >
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.backdropOverlay}
        />
      </TouchableOpacity>

      {/* Capture menu */}
      <View style={styles.menuContainer} pointerEvents="box-none">
        <Animated.View
          entering={ZoomIn.springify().damping(15).stiffness(200)}
          exiting={ZoomOut.duration(150)}
          style={styles.menu}
        >
          {/* Header */}
          <View style={styles.menuHeader}>
            <ThemedText style={styles.menuTitle}>Quick Capture</ThemedText>
            <ThemedText style={styles.menuSubtitle}>
              What do you want to capture?
            </ThemedText>
          </View>

          {/* Actions */}
          <View style={styles.actionsGrid}>
            {captureActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionButton}
                onPress={() => handleActionSelect(action)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Capture ${action.label}`}
                accessibilityHint={`Opens ${action.label} quick capture`}
              >
                <View
                  style={[
                    styles.actionIconContainer,
                    { backgroundColor: `${action.color}20` },
                  ]}
                >
                  <Feather name={action.icon} size={24} color={action.color} />
                </View>
                <ThemedText style={styles.actionLabel}>
                  {action.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onDismiss}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Cancel quick capture"
          >
            <ThemedText style={styles.closeButtonText}>Cancel</ThemedText>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  menuContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  menu: {
    backgroundColor: Colors.slatePanel,
    borderRadius: 24,
    padding: Spacing.lg,
    width: "100%",
    maxWidth: 400,
    // Shadow for elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  menuHeader: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  menuTitle: {
    fontSize: Typography.h1.fontSize,
    fontWeight: "700",
    color: Colors.electricBlue,
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    alignItems: "center",
    width: 80,
    marginBottom: Spacing.sm,
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  actionLabel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textPrimary,
    fontWeight: "500",
    textAlign: "center",
  },
  closeButton: {
    paddingVertical: Spacing.md,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Spacing.sm,
  },
  closeButtonText: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
});
