import {
  formatRecommendationRefreshMessage,
  refreshRecommendationsWithFeedback,
} from "@/utils/recommendationActions";

describe("formatRecommendationRefreshMessage", () => {
  it("returns empty-state messaging when no recommendations are added", () => {
    expect(formatRecommendationRefreshMessage(0)).toBe(
      "No new recommendations right now.",
    );
  });

  it("returns singular messaging for one recommendation", () => {
    expect(formatRecommendationRefreshMessage(1)).toBe(
      "Added 1 new recommendation.",
    );
  });

  it("returns plural messaging for large counts", () => {
    expect(formatRecommendationRefreshMessage(125)).toBe(
      "Added 125 new recommendations.",
    );
  });
});

describe("refreshRecommendationsWithFeedback", () => {
  it("short-circuits when recommendations are disabled", async () => {
    const refresh = jest.fn();

    const result = await refreshRecommendationsWithFeedback({
      isEnabled: false,
      refresh,
    });

    expect(refresh).not.toHaveBeenCalled();
    expect(result.status).toBe("disabled");
  });

  it("normalizes unexpected counts to a safe message", async () => {
    const refresh = jest.fn().mockResolvedValue(Number.NaN);

    const result = await refreshRecommendationsWithFeedback({
      isEnabled: true,
      refresh,
    });

    expect(result.count).toBe(0);
    expect(result.message).toBe("No new recommendations right now.");
  });

  it("returns an error message when refresh throws", async () => {
    const refresh = jest.fn().mockRejectedValue(new Error("Network down"));

    const result = await refreshRecommendationsWithFeedback({
      isEnabled: true,
      refresh,
    });

    expect(result.status).toBe("error");
    expect(result.message).toBe(
      "Unable to refresh recommendations. Please try again.",
    );
  });
});
