import { getAttentionPriorityColor } from "../attentionPriorityColor";

describe("attentionPriorityColor helpers", () => {
  it("test_happy_returns_theme_colors_when_present", () => {
    // Happy path: theme tokens should drive UI colors when defined.
    const theme = {
      error: "#FF0000",
      warning: "#FFA500",
      info: "#0000FF",
    };

    expect(getAttentionPriorityColor("urgent", theme)).toBe("#FF0000");
    expect(getAttentionPriorityColor("attention", theme)).toBe("#FFA500");
    expect(getAttentionPriorityColor("fyi", theme)).toBe("#0000FF");
  });

  it("test_empty_falls_back_when_theme_missing", () => {
    // Empty theme input should fall back to stable defaults instead of throwing.
    expect(getAttentionPriorityColor("urgent")).toBe("#FF3B5C");
    expect(getAttentionPriorityColor("attention")).toBe("#FFB800");
    expect(getAttentionPriorityColor("fyi")).toBe("#3B82F6");
  });

  it("test_error_throws_on_unknown_priority", () => {
    // Error handling: unknown priorities should be rejected to surface bad data.
    expect(() =>
      getAttentionPriorityColor("unknown" as "urgent"),
    ).toThrow("Unknown attention priority: unknown");
  });
});
