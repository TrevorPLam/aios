export type RecommendationRefreshStatus = "disabled" | "success" | "error";

export interface RecommendationRefreshOutcome {
  status: RecommendationRefreshStatus;
  message: string;
  count?: number;
}

export function formatRecommendationRefreshMessage(count: number): string {
  if (count <= 0) {
    return "No new recommendations right now.";
  }

  if (count === 1) {
    return "Added 1 new recommendation.";
  }

  return `Added ${count} new recommendations.`;
}

export async function refreshRecommendationsWithFeedback({
  isEnabled,
  refresh,
}: {
  isEnabled: boolean;
  refresh: () => Promise<number>;
}): Promise<RecommendationRefreshOutcome> {
  if (!isEnabled) {
    return {
      status: "disabled",
      message: "Recommendations are turned off in AI Preferences.",
    };
  }

  try {
    const rawCount = await refresh();
    const safeCount = Number.isFinite(rawCount)
      ? Math.max(0, Math.floor(rawCount))
      : 0;

    return {
      status: "success",
      message: formatRecommendationRefreshMessage(safeCount),
      count: safeCount,
    };
  } catch (error) {
    return {
      status: "error",
      message: "Unable to refresh recommendations. Please try again.",
    };
  }
}
