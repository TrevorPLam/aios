/**
 * UI Constants
 *
 * Centralized constants for UI-related magic numbers including:
 * - Animation timings and delays
 * - Opacity values for interactive states
 * - Component dimensions
 * - Z-index layer hierarchy
 * - Gesture thresholds
 *
 * @module uiConstants
 */

/**
 * Animation timing constants
 * Used for consistent animation behavior across the app
 */
export const Animation = {
  /** Delay per item in staggered list animations (milliseconds) */
  staggerDelay: 30,
  /** Short delay for secondary animations (milliseconds) */
  shortDelay: 50,
  /** Medium delay for tertiary animations (milliseconds) */
  mediumDelay: 100,
  /** Modal/overlay fade duration (milliseconds) */
  overlayDuration: 200,
  /** Spring animation damping coefficient */
  springDamping: 20,
  /** Spring animation stiffness coefficient */
  springStiffness: 90,
} as const;

/**
 * Opacity values for interactive states
 * Provides consistent visual feedback across pressable components
 */
export const Opacity = {
  /** Disabled state opacity */
  disabled: 0.5,
  /** Overlay background opacity */
  overlay: 0.5,
  /** Light press feedback */
  pressedLight: 0.7,
  /** Standard press feedback */
  pressed: 0.8,
  /** Full opacity */
  full: 1.0,
} as const;

/**
 * Sidebar/drawer dimensions
 * Used in navigation and slide-out panels
 */
export const Sidebar = {
  /** Full sidebar width (pixels) */
  width: 280,
  /** Collapsed sidebar width (pixels) */
  collapsedWidth: 60,
  /** Edge swipe detection zone (pixels) */
  edgeSwipeWidth: 30,
  /** Minimum gesture movement to activate (pixels) */
  gestureThreshold: 2,
  /** Distance threshold for opening (% of width) */
  openThreshold: 0.3,
  /** Velocity threshold for swipe detection (units/ms) */
  velocityThreshold: 0.5,
  /** Minimum swipe distance for activation (pixels) */
  minimumSwipeDistance: 5,
} as const;

/**
 * Z-index layer hierarchy
 * Ensures proper stacking order of overlays and modals
 */
export const ZIndex = {
  /** Base content layer */
  base: 0,
  /** Edge button layer */
  edgeButton: 997,
  /** Overlay backdrop layer */
  overlay: 998,
  /** Sidebar/drawer layer */
  sidebar: 999,
  /** Modal content layer */
  modal: 1000,
  /** Toast notification layer */
  toast: 1001,
} as const;

/**
 * Component dimensions
 * Standard sizes for buttons, icons, and interactive elements
 */
export const ComponentSize = {
  /** Small icon/button size (pixels) */
  iconSmall: 32,
  /** Medium icon/button size (pixels) */
  iconMedium: 36,
  /** Large icon/button size (pixels) */
  iconLarge: 48,
  /** FAB (Floating Action Button) size (pixels) */
  fab: 56,
  /** FAB border radius (half of size) */
  fabRadius: 28,
  /** Avatar size (pixels) */
  avatar: 48,
  /** Avatar border radius (half of size) */
  avatarRadius: 24,
  /** Secondary FAB size (pixels) */
  secondaryFab: 48,
  /** Secondary FAB radius (pixels) */
  secondaryFabRadius: 24,
  /** Small badge size (pixels) */
  badgeSmall: 18,
  /** Active indicator width (pixels) */
  activeIndicator: 3,
  /** Favorite badge size (pixels) */
  favoriteBadge: 18,
  /** Favorite badge radius (pixels) */
  favoriteBadgeRadius: 9,
  /** Selection badge size (pixels) */
  selectionBadge: 24,
  /** Selection badge radius (pixels) */
  selectionBadgeRadius: 12,
  /** Edge button size (pixels) */
  edgeButton: 40,
} as const;

/**
 * Grid and layout constants
 * Used for photo grids and other layout calculations
 */
export const Grid = {
  /** Minimum grid size (columns) */
  minSize: 2,
  /** Maximum grid size (columns) */
  maxSize: 6,
  /** Default grid size (columns) */
  defaultSize: 4,
} as const;

/**
 * Gesture and interaction constants
 * Thresholds and values for gesture recognition
 */
export const Gesture = {
  /** Minimum movement to register gesture (pixels) */
  minimumMovement: 2,
  /** Swipe velocity threshold (units/ms) */
  swipeVelocity: 0.5,
  /** Open threshold as percentage */
  openThresholdPercent: 0.3,
} as const;
