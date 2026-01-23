import { Colors } from "../constants/theme";

export type ThemeColors = typeof Colors.light;

const overlayTokenMap = {
  backdropFallback: "overlay",
  backdropStrong: "overlayStrong",
  backdropMedium: "overlayMedium",
  backdropSubtle: "overlaySubtle",
  breadcrumbCompact: "overlayCompact",
  sheetHandle: "overlayHandle",
} as const;

export type OverlayVariant = keyof typeof overlayTokenMap;

export const getOverlayColor = (
  theme: ThemeColors,
  variant: OverlayVariant,
): string => {
  const tokenKey = overlayTokenMap[variant];

  if (!tokenKey) {
    throw new Error(`Unknown overlay variant: ${variant}`);
  }

  const value = theme[tokenKey];

  if (!value) {
    throw new Error(`Missing overlay color token: ${tokenKey}`);
  }

  return value;
};
