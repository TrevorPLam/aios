/**
 * Secondary Navigation Utilities
 *
 * Shared utilities for secondary navigation bars across all module screens.
 * Provides consistent scroll handling logic and animation behavior.
 *
 * Usage:
 * ```typescript
 * const { handleScroll, animatedStyle } = useSecondaryNavScroll();
 * ```
 *
 * @module utils/secondaryNavigation
 */

import { useCallback } from "react";
import { NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

// Animation Constants
/** Badge count threshold for secondary nav (smaller due to reduced badge size) */
export const SECONDARY_NAV_BADGE_THRESHOLD = 9;

/**
 * Secondary nav bar hide offset in pixels when scrolling down.
 * Value calculated to hide entire nav content:
 * - paddingVertical (Spacing.sm = 8px) * 2 = 16px
 * - content height (icon 20px + text ~12px + gap 4px) = ~36px
 * - buffer for complete hiding = ~20px
 * Total: approximately -72px
 */
export const SECONDARY_NAV_HIDE_OFFSET = -72;

/** Animation duration in milliseconds for smooth transitions */
export const SECONDARY_NAV_ANIMATION_DURATION = 200;

/** Scroll position threshold to show nav when near top of page */
export const SCROLL_TOP_THRESHOLD = 10;

/** Scroll delta threshold to hide nav when scrolling down */
export const SCROLL_DOWN_THRESHOLD = 5;

/** Scroll delta threshold to show nav when scrolling up (negative value) */
export const SCROLL_UP_THRESHOLD = -5;

/**
 * Custom hook for secondary navigation scroll handling.
 *
 * Provides scroll-based show/hide animation logic with the following behavior:
 * - Shows nav when near top of page (scrollY < 10px)
 * - Hides nav when scrolling down more than 5px
 * - Shows nav when scrolling up more than 5px
 * - Prevents animation overlap for smooth performance
 *
 * Performance optimizations:
 * - Uses shared values for 60fps animations
 * - Prevents overlapping animations with isAnimating flag
 * - Memoized callback to prevent unnecessary recreations
 *
 * @returns {Object} Object containing scroll handler and animated style
 * @returns {Function} returns.handleScroll - Scroll event handler
 * @returns {Object} returns.animatedStyle - Animated style with translateY
 *
 * @example
 * ```typescript
 * const { handleScroll, animatedStyle } = useSecondaryNavScroll();
 *
 * <FlatList onScroll={handleScroll} scrollEventThrottle={16} />
 * <Animated.View style={[styles.nav, animatedStyle]} />
 * ```
 */
export function useSecondaryNavScroll() {
  // Shared values for animation state
  const lastScrollY = useSharedValue(0);
  const secondaryNavTranslateY = useSharedValue(0);
  const isAnimating = useSharedValue(false);

  /**
   * Scroll event handler that controls nav visibility based on scroll direction.
   *
   * Logic flow:
   * 1. Calculate scroll delta from last position
   * 2. If animating, update position and return early (prevents jank)
   * 3. Check scroll position against thresholds
   * 4. Trigger appropriate animation (show/hide)
   * 5. Update lastScrollY for next calculation
   *
   * @param {NativeSyntheticEvent<NativeScrollEvent>} event - Native scroll event
   */
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentScrollY = event.nativeEvent.contentOffset.y;
      const delta = currentScrollY - lastScrollY.value;

      // Prevent overlapping animations for smooth performance
      if (isAnimating.value) {
        lastScrollY.value = currentScrollY;
        return;
      }

      // Show nav when at top (scrollY < SCROLL_TOP_THRESHOLD)
      if (
        currentScrollY < SCROLL_TOP_THRESHOLD &&
        secondaryNavTranslateY.value !== 0
      ) {
        isAnimating.value = true;
        secondaryNavTranslateY.value = withTiming(
          0,
          { duration: SECONDARY_NAV_ANIMATION_DURATION },
          () => {
            isAnimating.value = false;
          },
        );
      }
      // Hide nav when scrolling down (delta > SCROLL_DOWN_THRESHOLD)
      else if (
        delta > SCROLL_DOWN_THRESHOLD &&
        secondaryNavTranslateY.value !== SECONDARY_NAV_HIDE_OFFSET
      ) {
        isAnimating.value = true;
        secondaryNavTranslateY.value = withTiming(
          SECONDARY_NAV_HIDE_OFFSET,
          { duration: SECONDARY_NAV_ANIMATION_DURATION },
          () => {
            isAnimating.value = false;
          },
        );
      }
      // Show nav when scrolling up (delta < SCROLL_UP_THRESHOLD)
      else if (
        delta < SCROLL_UP_THRESHOLD &&
        secondaryNavTranslateY.value !== 0
      ) {
        isAnimating.value = true;
        secondaryNavTranslateY.value = withTiming(
          0,
          { duration: SECONDARY_NAV_ANIMATION_DURATION },
          () => {
            isAnimating.value = false;
          },
        );
      }

      lastScrollY.value = currentScrollY;
    },
    [],
  ); // Empty deps: uses shared values that don't need to be in deps

  /**
   * Animated style applying vertical translation to hide/show nav bar.
   *
   * Transform values:
   * - 0: Nav bar visible (default position)
   * - SECONDARY_NAV_HIDE_OFFSET (-72): Nav bar hidden (moved up off screen)
   */
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: secondaryNavTranslateY.value }],
    };
  });

  return { handleScroll, animatedStyle };
}

/**
 * Type definition for secondary navigation button configuration.
 */
export interface SecondaryNavButton {
  /** Unique identifier for the button */
  id: string;
  /** Feather icon name */
  icon: string;
  /** Button label text */
  label: string;
  /** Button press handler */
  onPress: () => void;
  /** Accessibility label (defaults to label if not provided) */
  accessibilityLabel?: string;
}
