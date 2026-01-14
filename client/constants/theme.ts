import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#FFFFFF",
    textSecondary: "#8B93A7",
    textMuted: "#4A5568",
    buttonText: "#0A0E1A",
    tabIconDefault: "#4A5568",
    tabIconSelected: "#00D9FF",
    link: "#00D9FF",
    backgroundRoot: "#0A0E1A",
    backgroundDefault: "#1A1F2E",
    backgroundSecondary: "#252A3A",
    backgroundTertiary: "#303646",
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
  },
  dark: {
    text: "#FFFFFF",
    textSecondary: "#8B93A7",
    textMuted: "#4A5568",
    buttonText: "#0A0E1A",
    tabIconDefault: "#4A5568",
    tabIconSelected: "#00D9FF",
    link: "#00D9FF",
    backgroundRoot: "#0A0E1A",
    backgroundDefault: "#1A1F2E",
    backgroundSecondary: "#252A3A",
    backgroundTertiary: "#303646",
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

export const Typography = {
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
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
