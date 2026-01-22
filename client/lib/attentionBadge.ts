/**
 * How to Use:
 * - Call getAttentionBadgeCount(attentionManager.getCounts()) to total items.
 * - Pass the count to formatAttentionBadgeLabel for a badge-ready string.
 *
 * UI integration example:
 * - HeaderNav renders the attention badge using getAttentionBadgeCount + formatAttentionBadgeLabel.
 *
 * Public API:
 * - MAX_ATTENTION_BADGE_COUNT, getAttentionBadgeCount, formatAttentionBadgeLabel.
 *
 * Expected usage pattern:
 * - Compute counts once per render and memoize if needed.
 *
 * WHY: Centralizes badge math so every header stays consistent and resilient to bad data.
 */
import { logger } from "@/utils/logger";
import { AttentionPriority } from "./attentionManager";

export const MAX_ATTENTION_BADGE_COUNT = 99;

type AttentionCounts = Partial<Record<AttentionPriority, number>>;

const COMPONENT_NAME = "AttentionBadge";

const sanitizeCount = (value: unknown): number => {
  // We coerce invalid or negative values to 0 so UI doesn't break on bad input.
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return 0;
  }

  return Math.floor(value);
};

export const getAttentionBadgeCount = (counts?: AttentionCounts): number => {
  if (!counts || typeof counts !== "object") {
    // Explicitly handle missing/invalid inputs so callers don't need try/catch.
    logger.warn(COMPONENT_NAME, "Invalid attention counts payload", {
      counts,
    });
    return 0;
  }

  const urgent = sanitizeCount(counts.urgent);
  const attention = sanitizeCount(counts.attention);
  const fyi = sanitizeCount(counts.fyi);

  return urgent + attention + fyi;
};

export const formatAttentionBadgeLabel = (
  count: number,
  max: number = MAX_ATTENTION_BADGE_COUNT,
): string | null => {
  // Hide badge when count is missing/invalid to avoid confusing the user.
  if (!Number.isFinite(count) || count <= 0) {
    return null;
  }

  if (count > max) {
    return `${max}+`;
  }

  return `${Math.floor(count)}`;
};
