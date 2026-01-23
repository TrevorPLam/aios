/**
 * Mini-Mode Container Component
 *
 * Purpose (Plain English):
 * Renders mini-mode overlays on top of the current screen. Listens for mini-mode
 * open events and displays the appropriate mini-mode component as a modal.
 *
 * What it interacts with:
 * - Event Bus: Listens for mini_mode_open events
 * - Mini-Mode Registry: Gets current mini-mode provider and config
 * - Haptics: Provides tactile feedback on open/close
 *
 * Safe AI extension points:
 * - Customize animation styles and timing
 * - Add gesture support (swipe to dismiss)
 * - Enhance backdrop blur effects
 * - Add different presentation styles (full screen, bottom sheet, etc.)
 *
 * Warnings:
 * - Must be rendered at app root level (above all screens)
 * - Only one mini-mode can be active at a time (enforced by registry)
 * - Ensure accessibility: focus trapping, screen reader announcements
 * - Performance: Lazy load mini-mode components when possible
 */

import React, { Suspense, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutDown,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import {
  miniModeRegistry,
  MiniModeConfig,
  MiniModeProvider,
  MiniModeResult,
} from "../lib/miniMode";
import { useTheme } from "../hooks/useTheme";
import { ThemedText } from "./ThemedText";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

/**
 * Main mini-mode container component
 *
 * Plain English:
 * This component sits at the root of your app and shows mini-mode overlays
 * when requested. It handles the modal presentation, backdrop, and callbacks.
 *
 * Technical:
 * Subscribes to event bus for mini_mode_open events, maintains local state
 * for current mini-mode, handles keyboard avoidance, and provides callbacks
 * for complete/dismiss actions.
 */
export function MiniModeContainer() {
  const themeHook = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<MiniModeConfig | null>(
    null,
  );
  const [currentProvider, setCurrentProvider] =
    useState<MiniModeProvider | null>(null);

  useEffect(() => {
    /**
     * Subscribe to mini-mode events
     *
     * Plain English: When something requests to open a mini-mode, show it
     * Technical: Subscribes to mini-mode registry events
     */
    const unsubscribe = miniModeRegistry.subscribe((event, data) => {
      if (event === "mini_mode_open") {
        const current = miniModeRegistry.getCurrent();
        if (current) {
          setCurrentConfig(current.config);
          setCurrentProvider(current.provider);
          setIsVisible(true);

          // Haptic feedback on open
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
        }
      } else if (event === "mini_mode_close") {
        handleDismiss();
      } else if (event === "mini_mode_complete") {
        // Close modal on completion
        setIsVisible(false);
        setCurrentConfig(null);
        setCurrentProvider(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  /**
   * Handle mini-mode dismissal (user cancelled)
   *
   * Plain English: User tapped outside or pressed cancel - close without saving
   * Technical: Notifies registry to invoke onDismiss, clears local state
   */
  const handleDismiss = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    miniModeRegistry.close();
    setIsVisible(false);
    setCurrentConfig(null);
    setCurrentProvider(null);
  };

  /**
   * Handle mini-mode completion (user saved/selected)
   *
   * Plain English: User completed the action - close and notify caller
   * Technical: Invokes registry.complete() which handles callbacks, then clears state
   */
  const handleComplete = (result: MiniModeResult) => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    miniModeRegistry.complete(result);
    setIsVisible(false);
    setCurrentConfig(null);
    setCurrentProvider(null);
  };

  // Don't render anything if no mini-mode is active
  if (!isVisible || !currentConfig || !currentProvider) {
    return null;
  }

  // Get the mini-mode component to render
  const MiniModeComponent = currentProvider.component;
  const styles = createStyles(themeHook);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
      statusBarTranslucent
      accessible={true}
      accessibilityViewIsModal={true}
      accessibilityLabel={`${currentProvider.displayName} mini mode`}
    >
      {/* Backdrop - dismisses on tap */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleDismiss}
        accessibilityRole="button"
        accessibilityLabel="Close mini mode"
        accessibilityHint="Tap to dismiss without saving"
      >
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.backdropOverlay}
        />
      </TouchableOpacity>

      {/* Mini-mode content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <View style={styles.contentContainer}>
          <Animated.View
            entering={SlideInUp.springify().damping(20).stiffness(150)}
            exiting={SlideOutDown.duration(200)}
            style={styles.miniModeCard}
          >
            <Suspense
              fallback={
                <View style={styles.loadingState}>
                  <ThemedText type="h4" style={styles.loadingTitle}>
                    Loading mini mode
                  </ThemedText>
                  <ThemedText type="body" style={styles.loadingMessage}>
                    Preparing quick action…
                  </ThemedText>
                </View>
              }
            >
              <MiniModeComponent
                initialData={currentConfig.initialData}
                onComplete={handleComplete}
                onDismiss={handleDismiss}
                source={currentConfig.source}
              />
            </Suspense>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "flex-end",
    },
    backdropOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    keyboardAvoid: {
      flex: 1,
      justifyContent: "flex-end",
    },
    contentContainer: {
      justifyContent: "flex-end",
      maxHeight: SCREEN_HEIGHT * 0.85, // Max 85% of screen height
    },
    miniModeCard: {
      backgroundColor: theme.theme.cardBackground,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 8,
      paddingHorizontal: 16,
      paddingBottom: Platform.OS === "ios" ? 34 : 16, // Account for home indicator
      minHeight: 200,
      maxHeight: SCREEN_HEIGHT * 0.85,
      // Shadow for elevation
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    loadingState: {
      minHeight: 200,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 24,
      gap: 8,
    },
    loadingTitle: {
      textAlign: "center",
    },
    loadingMessage: {
      textAlign: "center",
      opacity: 0.7,
    },
  });
