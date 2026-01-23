/**
 * How to Use:
 * - Call getAttentionPriorityColor(priority, theme) to style badges and chips.
 *
 * UI integration example:
 * - AttentionCenterScreen uses getAttentionPriorityColor to tint priority pills.
 *
 * Public API:
 * - getAttentionPriorityColor.
 *
 * Expected usage pattern:
 * - Pass theme tokens when available, rely on fallback colors otherwise.
 *
 * WHY: Ensures priority colors stay consistent across light/dark themes.
 */
import { Colors } from "@design-system/constants/theme";
import type { AttentionPriority } from "@features/core/domain/attentionManager";

type ThemeColors = {
  error?: string;
  warning?: string;
  info?: string;
  accent?: string;
};

const FALLBACK_PRIORITY_COLORS: Record<AttentionPriority, string> = {
  // Fallback colors mirror the default light theme to keep visuals predictable
  // even when theme tokens are missing or unavailable during boot.
  urgent: Colors.light.error,
  attention: Colors.light.warning,
  fyi: Colors.light.info,
};

export function getAttentionPriorityColor(
  priority: AttentionPriority,
  theme?: ThemeColors,
): string {
  // Guard against bad input early so callers can surface clear diagnostics.
  const fallbackColor = FALLBACK_PRIORITY_COLORS[priority];
  if (!fallbackColor) {
    throw new Error(`Unknown attention priority: ${priority}`);
  }

  // Prefer theme tokens when available, but degrade gracefully to avoid crashes.
  if (!theme) {
    return fallbackColor;
  }

  switch (priority) {
    case "urgent":
      return theme.error ?? fallbackColor;
    case "attention":
      return theme.warning ?? fallbackColor;
    case "fyi":
      return theme.info ?? theme.accent ?? fallbackColor;
  }
}
