import {
  formatAttentionBadgeLabel,
  getAttentionBadgeCount,
  MAX_ATTENTION_BADGE_COUNT,
} from "../attentionBadge";

describe("attentionBadge helpers", () => {
  it("test_happy_sums_counts_and_formats_label", () => {
    // Happy path: all three priorities contribute to the badge total.
    const count = getAttentionBadgeCount({
      urgent: 1,
      attention: 2,
      fyi: 3,
    });

    expect(count).toBe(6);
    expect(formatAttentionBadgeLabel(count)).toBe("6");
  });

  it("test_empty_returns_zero_and_hides_label", () => {
    // Empty input should safely return no badge for a clean UI.
    const count = getAttentionBadgeCount(undefined);

    expect(count).toBe(0);
    expect(formatAttentionBadgeLabel(count)).toBeNull();
  });

  it("test_error_sanitizes_invalid_counts_and_caps_label", () => {
    // Error/edge inputs should be sanitized to avoid negative or NaN badges.
    const count = getAttentionBadgeCount({
      urgent: -3,
      attention: Number.NaN,
      fyi: 2.7,
    });

    expect(count).toBe(2);
    expect(formatAttentionBadgeLabel(500, MAX_ATTENTION_BADGE_COUNT)).toBe(
      "99+",
    );
  });
});
