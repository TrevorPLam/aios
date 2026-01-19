/**
 * Quick Capture Hook
 *
 * Purpose (Plain English):
 * Provides a global way to show/hide the quick capture overlay from anywhere
 * in the app. Also manages the gesture detection for long-press to trigger.
 *
 * What it interacts with:
 * - QuickCaptureOverlay: Controls visibility
 * - React Context: Provides global state
 * - Haptics: Feedback on activation
 *
 * Safe AI extension points:
 * - Add keyboard shortcuts (e.g., Cmd+Shift+C)
 * - Add AI-suggested default action based on context
 * - Add recent captures tracking
 *
 * Warnings:
 * - Must be wrapped in QuickCaptureProvider at app root
 * - Long-press gesture must not conflict with other gestures
 */

import React, { createContext, useContext, useState } from "react";
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

interface QuickCaptureContextValue {
  /** Is quick capture overlay currently visible */
  isVisible: boolean;
  /** Source/context where quick capture was triggered from */
  source: string;
  /** Show quick capture overlay */
  show: (source?: string) => void;
  /** Hide quick capture overlay */
  hide: () => void;
  /** Toggle quick capture overlay */
  toggle: (source?: string) => void;
}

const QuickCaptureContext = createContext<QuickCaptureContextValue | undefined>(
  undefined,
);

/**
 * Quick Capture Provider
 *
 * Plain English:
 * Wrap your app with this to enable quick capture from anywhere.
 *
 * Technical:
 * Provides global state for quick capture overlay visibility.
 * Children can use useQuickCapture() hook to show/hide overlay.
 *
 * Usage:
 * ```tsx
 * <QuickCaptureProvider>
 *   <App />
 * </QuickCaptureProvider>
 * ```
 */
export function QuickCaptureProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [source, setSource] = useState("unknown");

  const show = (src = "manual") => {
    setSource(src);
    setIsVisible(true);

    // Haptic feedback on show
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  const hide = () => {
    setIsVisible(false);

    // Light haptic on hide
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const toggle = (src = "manual") => {
    if (isVisible) {
      hide();
    } else {
      show(src);
    }
  };

  const value: QuickCaptureContextValue = {
    isVisible,
    source,
    show,
    hide,
    toggle,
  };

  return (
    <QuickCaptureContext.Provider value={value}>
      {children}
    </QuickCaptureContext.Provider>
  );
}

/**
 * Use Quick Capture Hook
 *
 * Plain English:
 * Get access to quick capture functions from any component.
 *
 * Technical:
 * Returns context value with show/hide/toggle functions and current state.
 *
 * Usage:
 * ```tsx
 * const { show, hide, isVisible } = useQuickCapture();
 *
 * // Show quick capture
 * show('messages_screen');
 *
 * // Hide quick capture
 * hide();
 *
 * // Toggle quick capture
 * toggle('button_press');
 * ```
 *
 * @throws Error if used outside QuickCaptureProvider
 */
export function useQuickCapture(): QuickCaptureContextValue {
  const context = useContext(QuickCaptureContext);

  if (!context) {
    throw new Error("useQuickCapture must be used within QuickCaptureProvider");
  }

  return context;
}
