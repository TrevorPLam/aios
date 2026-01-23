import { Platform } from "react-native";

// Color theme definitions
export const ColorThemes = {
  cyan: {
    accent: "#00D9FF",
    accentDim: "rgba(0, 217, 255, 0.15)",
    accentGlow: "rgba(0, 217, 255, 0.3)",
  },
  purple: {
    accent: "#A855F7",
    accentDim: "rgba(168, 85, 247, 0.15)",
    accentGlow: "rgba(168, 85, 247, 0.3)",
  },
  green: {
    accent: "#10B981",
    accentDim: "rgba(16, 185, 129, 0.15)",
    accentGlow: "rgba(16, 185, 129, 0.3)",
  },
  orange: {
    accent: "#F97316",
    accentDim: "rgba(249, 115, 22, 0.15)",
    accentGlow: "rgba(249, 115, 22, 0.3)",
  },
  pink: {
    accent: "#EC4899",
    accentDim: "rgba(236, 72, 153, 0.15)",
    accentGlow: "rgba(236, 72, 153, 0.3)",
  },
  blue: {
    accent: "#3B82F6",
    accentDim: "rgba(59, 130, 246, 0.15)",
    accentGlow: "rgba(59, 130, 246, 0.3)",
  },
};

export const Colors = {
  light: {
    text: "#1A1F2E",
    textSecondary: "#4A5568",
    textMuted: "#8B93A7",
    textPrimary: "#1A1F2E", // Alias for 'text' - for backwards compatibility
    textTertiary: "#A0AEC0", // Lighter gray for placeholders
    buttonText: "#FFFFFF",
    tabIconDefault: "#8B93A7",
    tabIconSelected: "#00D9FF",
    link: "#00D9FF",
    background: "#FFFFFF", // Alias for backgroundRoot
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#F7F9FC",
    backgroundSecondary: "#E5E9F0",
    backgroundTertiary: "#D8DEE9",
    backgroundBlack: "#FFFFFF",
    backgroundMuted: "#EDF2F7", // Muted background
    backgroundElevated: "#FFFFFF", // Elevated surfaces
    cardBackground: "#FFFFFF", // Card background
    primary: "#00D9FF", // Alias for accent
    accent: "#00D9FF",
    accentDim: "rgba(0, 217, 255, 0.15)",
    accentGlow: "rgba(0, 217, 255, 0.3)",
    success: "#00C853",
    successDim: "rgba(0, 200, 83, 0.15)",
    warning: "#FFB800",
    warningDim: "rgba(255, 184, 0, 0.15)",
    error: "#FF3B5C",
    errorDim: "rgba(255, 59, 92, 0.15)",
    lowConfidence: "#6366F1",
    border: "rgba(0, 0, 0, 0.08)",
    overlay: "rgba(255, 255, 255, 0.95)",
    overlayStrong: "rgba(0, 0, 0, 0.7)",
    overlayMedium: "rgba(0, 0, 0, 0.5)",
    overlaySubtle: "rgba(0, 0, 0, 0.2)",
    overlayCompact: "rgba(255, 255, 255, 0.85)",
    overlayHandle: "rgba(0, 0, 0, 0.1)",
    accentPurple: "#9B59B6",
    info: "#3B82F6", // Info blue color
    // Additional colors for consistency with existing component code
    electric: "#00D9FF", // Alias for 'accent'
    electricBlue: "#00D9FF", // Alias for 'accent'
    deepSpace: "#FFFFFF", // Alias for 'backgroundRoot' in light mode
    slatePanel: "#E5E9F0", // Alias for 'backgroundSecondary'
  },
  dark: {
    text: "#FFFFFF",
    textSecondary: "#8B93A7",
    textMuted: "#4A5568",
    textPrimary: "#FFFFFF", // Alias for 'text' - for backwards compatibility
    textTertiary: "#4A5568", // Darker gray for placeholders
    buttonText: "#0A0E1A",
    tabIconDefault: "#4A5568",
    tabIconSelected: "#00D9FF",
    link: "#00D9FF",
    background: "#0A0E1A", // Alias for backgroundRoot
    backgroundRoot: "#0A0E1A",
    backgroundDefault: "#1A1F2E",
    backgroundSecondary: "#252A3A",
    backgroundTertiary: "#303646",
    backgroundBlack: "#000000",
    backgroundMuted: "#141824", // Muted background
    backgroundElevated: "#252A3A", // Elevated surfaces
    cardBackground: "#1A1F2E", // Card background
    primary: "#00D9FF", // Alias for accent
    accent: "#00D9FF",
    accentDim: "rgba(0, 217, 255, 0.15)",
    accentGlow: "rgba(0, 217, 255, 0.3)",
    success: "#00FF94",
    successDim: "rgba(0, 255, 148, 0.15)",
    warning: "#FFB800",
    warningDim: "rgba(255, 184, 0, 0.15)",
    error: "#FF3B5C",
    errorDim: "rgba(255, 59, 92, 0.15)",
    lowConfidence: "#6366F1",
    border: "rgba(255, 255, 255, 0.08)",
    overlay: "rgba(10, 14, 26, 0.9)",
    overlayStrong: "rgba(0, 0, 0, 0.7)",
    overlayMedium: "rgba(0, 0, 0, 0.5)",
    overlaySubtle: "rgba(0, 0, 0, 0.2)",
    overlayCompact: "rgba(26, 31, 46, 0.8)",
    overlayHandle: "rgba(255, 255, 255, 0.2)",
    accentPurple: "#9B59B6",
    info: "#3B82F6", // Info blue color
    // Additional colors for consistency with existing component code
    electric: "#00D9FF", // Alias for 'accent'
    electricBlue: "#00D9FF", // Alias for 'accent'
    deepSpace: "#0A0E1A", // Alias for 'backgroundRoot' in dark mode
    slatePanel: "#252A3A", // Alias for 'backgroundSecondary'
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  full: 9999,
};

/**
 * Typography system with semantic sizing and weight variants.
 *
 * Provides a consistent type scale from hero (32px) to small (12px).
 * Heading variants (h4-h6) intentionally match body text sizes but use
 * semibold weight (600) for visual distinction without size proliferation.
 *
 * Size Hierarchy:
 * - hero (32px/700): Splash screens, major landing pages
 * - h1 (24px/600): Main screen titles
 * - h2 (20px/600): Major sections within a screen
 * - h3 (18px/600): Card titles, important subsections
 * - h4 (16px/600): Subsections, emphasized content (matches body size)
 * - h5 (14px/600): Small headers in compact layouts (matches caption size)
 * - h6 (12px/600): Micro headers in dense displays (matches small size)
 * - body (16px/400): Standard content text
 * - caption (14px/400): Metadata, supplementary information
 * - small (12px/500): Labels, compact UI elements
 *
 * @example
 * // Use with ThemedText component:
 * <ThemedText type="h4">Subsection Title</ThemedText>
 *
 * // Or directly in styles:
 * const styles = StyleSheet.create({
 *   heading: Typography.h5,
 * });
 *
 * @see docs/technical/design_guidelines.md for complete usage guidelines
 */
export const Typography = {
  sizes: {
    hero: 32,
    h1: 24,
    h2: 20,
    h3: 18,
    h4: 16, // Same size as body, but semibold weight for emphasis
    h5: 14, // Same size as caption, but semibold weight for headers
    h6: 12, // Same size as small, but semibold weight for micro headers
    body: 16,
    caption: 14,
    small: 12,
  },
  hero: {
    fontSize: 32,
    fontWeight: "700" as const,
  },
  h1: {
    fontSize: 24,
    fontWeight: "600" as const,
  },
  h2: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  h3: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  h5: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  h6: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  link: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
};

export const Shadows = {
  card: {
    shadowColor: "#00D9FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  glow: {
    shadowColor: "#00D9FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fab: {
    shadowColor: "#00D9FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  sm: {
    shadowColor: "#00D9FF",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  small: {
    shadowColor: "#00D9FF",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: "#00D9FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modal: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
});
