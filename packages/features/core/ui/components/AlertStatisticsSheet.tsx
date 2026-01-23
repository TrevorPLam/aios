/**
 * AlertStatisticsSheet Component
 *
 * Modal sheet displaying alert effectiveness statistics and history.
 * Shows patterns in alert dismissal behavior and snooze habits.
 *
 * Features:
 * - Overall statistics (trigger count, snooze patterns, on-time rate)
 * - Alert effectiveness insights
 * - Visual progress indicators
 * - Smart recommendations based on history
 *
 * @module AlertStatisticsSheet
 */

import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@design-system/components/ThemedText";
import { ThemedView } from "@design-system/components/ThemedView";
import { useTheme } from "@design-system/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@design-system/constants/theme";
import { db } from "@platform/storage/database";
import { AlertStatistics, AlertHistoryEntry } from "@contracts/models/types";

/** Number of recent history entries to analyze for pattern detection */
const RECENT_HISTORY_COUNT = 3;

/** Minimum average snooze count to trigger snooze warning */
const MIN_SNOOZE_WARNING_THRESHOLD = 2;

/** Multiplier for detecting worsening snooze patterns */
const SNOOZE_PATTERN_WORSENING_FACTOR = 3;

/** Insight type for alert statistics analysis */
type InsightType = "success" | "warning" | "info";

/** Interface for alert insight objects */
interface AlertInsight {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  type: InsightType;
}

interface AlertStatisticsSheetProps {
  visible: boolean;
  alertId: string;
  onClose: () => void;
}

/**
 * StatisticCard Component
 *
 * Displays a single statistic with an icon, label, and value
 */
function StatisticCard({
  icon,
  label,
  value,
  color,
  subtitle,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  color: string;
  subtitle?: string;
}) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.statisticCard,
        {
          backgroundColor: theme.backgroundDefault,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={[styles.statisticIcon, { backgroundColor: color + "20" }]}>
        <Feather name={icon} size={24} color={color} />
      </View>
      <View style={styles.statisticContent}>
        <ThemedText type="h2" style={{ color }}>
          {value}
        </ThemedText>
        <ThemedText type="body" muted>
          {label}
        </ThemedText>
        {subtitle && (
          <ThemedText type="small" muted style={{ marginTop: Spacing.xs }}>
            {subtitle}
          </ThemedText>
        )}
      </View>
    </View>
  );
}

/**
 * ProgressBar Component
 *
 * Displays a horizontal progress bar with percentage
 */
function ProgressBar({
  label,
  percentage,
  color,
}: {
  label: string;
  percentage: number;
  color: string;
}) {
  const { theme } = useTheme();

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <ThemedText type="body">{label}</ThemedText>
        <ThemedText type="body" style={{ color }}>
          {percentage.toFixed(0)}%
        </ThemedText>
      </View>
      <View
        style={[
          styles.progressBarTrack,
          { backgroundColor: theme.backgroundSecondary },
        ]}
      >
        <View
          style={[
            styles.progressBarFill,
            {
              backgroundColor: color,
              width: `${Math.min(percentage, 100)}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

/**
 * InsightCard Component
 *
 * Displays an insight or recommendation based on statistics with color-coded indicators
 *
 * @param icon - Feather icon name to display
 * @param title - Main insight title
 * @param description - Detailed insight description
 * @param type - Insight type determining color scheme (success/warning/info)
 */
function InsightCard({
  icon,
  title,
  description,
  type = "info",
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  type?: InsightType;
}) {
  const { theme } = useTheme();

  const colors: Record<InsightType, string> = {
    success: theme.success,
    warning: theme.warning,
    info: theme.accent,
  };

  const backgroundColor: Record<InsightType, string> = {
    success: theme.success + "20",
    warning: theme.warning + "20",
    info: theme.accentDim,
  };

  return (
    <View
      style={[
        styles.insightCard,
        {
          backgroundColor: backgroundColor[type],
          borderColor: colors[type],
        },
      ]}
    >
      <Feather name={icon} size={20} color={colors[type]} />
      <View style={styles.insightContent}>
        <ThemedText
          type="body"
          style={{ fontWeight: "600", color: colors[type] }}
        >
          {title}
        </ThemedText>
        <ThemedText type="small" muted>
          {description}
        </ThemedText>
      </View>
    </View>
  );
}

/**
 * Generate insights based on alert statistics
 *
 * Insight Types Generated:
 * 1. Response Time (>=80% = success, <50% = warning)
 * 2. Snooze Pattern (>2 avg = warning, 0 with 5+ triggers = success)
 * 3. Recent Trends (improving or declining pattern)
 * 4. New Alert (<3 triggers = info message)
 *
 * Pattern Detection:
 * - Uses last 3 entries for recent analysis
 * - Compares recent vs. historical average
 * - 3x worsening factor triggers warning
 *
 * @param stats - Aggregated alert statistics
 * @param recentHistory - Sorted history entries (newest first)
 * @returns Array of actionable insights
 */
function generateInsights(
  stats: AlertStatistics,
  recentHistory: AlertHistoryEntry[],
): AlertInsight[] {
  const insights: AlertInsight[] = [];

  // On-time dismissal insights
  if (stats.onTimeDismissalRate >= 80) {
    insights.push({
      icon: "check-circle",
      title: "Excellent Response Time",
      description: `You dismiss this alert on time ${stats.onTimeDismissalRate.toFixed(0)}% of the time. Great discipline!`,
      type: "success",
    });
  } else if (stats.onTimeDismissalRate < 50) {
    insights.push({
      icon: "alert-triangle",
      title: "Frequent Delays",
      description: `You're dismissing this alert late ${(100 - stats.onTimeDismissalRate).toFixed(0)}% of the time. Consider adjusting the time.`,
      type: "warning",
    });
  }

  // Snooze pattern insights
  if (stats.averageSnoozeCount > MIN_SNOOZE_WARNING_THRESHOLD) {
    insights.push({
      icon: "moon",
      title: "High Snooze Pattern",
      description: `You snooze this alert ${stats.averageSnoozeCount.toFixed(1)} times on average. Consider setting it later.`,
      type: "warning",
    });
  } else if (stats.averageSnoozeCount === 0 && stats.totalTriggers > 5) {
    insights.push({
      icon: "sunrise",
      title: "No Snoozing",
      description:
        "You never snooze this alert. The timing works well for you!",
      type: "success",
    });
  }

  // Recent pattern analysis
  if (recentHistory.length >= RECENT_HISTORY_COUNT) {
    const recentSnoozes = recentHistory
      .slice(0, RECENT_HISTORY_COUNT) // Get first N items (most recent, as array is sorted newest-first)
      .reduce((sum, entry) => sum + entry.snoozeCount, 0);

    if (recentSnoozes === 0 && stats.averageSnoozeCount > 1) {
      insights.push({
        icon: "trending-up",
        title: "Improving Pattern",
        description:
          "Your recent responses have been better than average. Keep it up!",
        type: "success",
      });
    } else if (
      stats.averageSnoozeCount > 0 &&
      recentSnoozes > stats.averageSnoozeCount * SNOOZE_PATTERN_WORSENING_FACTOR
    ) {
      insights.push({
        icon: "trending-down",
        title: "Recent Struggles",
        description:
          "You've been snoozing more lately. Consider adjusting your sleep schedule.",
        type: "warning",
      });
    }
  }

  // Usage insights
  if (stats.totalTriggers < 3) {
    insights.push({
      icon: "info",
      title: "New Alert",
      description:
        "Not enough data yet. Statistics will become more accurate over time.",
      type: "info",
    });
  }

  return insights;
}

/**
 * AlertStatisticsSheet Component
 */
export default function AlertStatisticsSheet({
  visible,
  alertId,
  onClose,
}: AlertStatisticsSheetProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<AlertStatistics | null>(null);
  const [recentHistory, setRecentHistory] = useState<AlertHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadStatistics = async () => {
      if (!visible || !alertId) return;

      setLoading(true);
      try {
        const statistics = await db.alertHistory.getStatistics(alertId);
        const history = await db.alertHistory.getByAlert(alertId);

        if (isMounted) {
          // Sort by most recent first
          const sortedHistory = history.sort(
            (a, b) =>
              new Date(b.triggeredAt).getTime() -
              new Date(a.triggeredAt).getTime(),
          );

          setStats(statistics);
          setRecentHistory(sortedHistory);
        }
      } catch (error) {
        console.error("Failed to load alert statistics:", error);
        if (isMounted) {
          // Clear states on error to show empty state
          setStats(null);
          setRecentHistory([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadStatistics();

    return () => {
      isMounted = false;
    };
  }, [visible, alertId]);

  const handleClose = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
  };

  if (!visible) return null;

  const insights = stats ? generateInsights(stats, recentHistory) : [];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Animated.View
        entering={FadeIn}
        style={[styles.overlay, { backgroundColor: "rgba(0, 0, 0, 0.5)" }]}
      >
        <Pressable style={styles.overlayPress} onPress={handleClose} />
        <Animated.View
          entering={SlideInDown.springify()}
          style={[
            styles.sheet,
            {
              backgroundColor: theme.background,
              paddingBottom: insets.bottom + Spacing.lg,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="h2">Alert Statistics</ThemedText>
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [
                styles.closeButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Feather name="x" size={24} color={theme.text} />
            </Pressable>
          </View>

          {/* Handle Bar */}
          <View
            style={[
              styles.handleBar,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          />

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ThemedText type="body" muted>
                  Loading statistics...
                </ThemedText>
              </View>
            ) : stats ? (
              <>
                {/* Overview Statistics */}
                <View style={styles.section}>
                  <ThemedText type="h3" style={styles.sectionTitle}>
                    Overview
                  </ThemedText>
                  <View style={styles.statisticsGrid}>
                    <StatisticCard
                      icon="bell"
                      label="Total Triggers"
                      value={stats.totalTriggers.toString()}
                      color={theme.accent}
                      subtitle={
                        stats.lastTriggeredAt
                          ? `Last: ${new Date(
                              stats.lastTriggeredAt,
                            ).toLocaleDateString()}`
                          : undefined
                      }
                    />
                    <StatisticCard
                      icon="repeat"
                      label="Average Snoozes"
                      value={stats.averageSnoozeCount.toFixed(1)}
                      color={
                        stats.averageSnoozeCount > 2
                          ? theme.warning
                          : theme.success
                      }
                      subtitle={`Total: ${stats.totalSnoozes}`}
                    />
                  </View>
                </View>

                {/* Progress Bars */}
                <View style={styles.section}>
                  <ThemedText type="h3" style={styles.sectionTitle}>
                    Effectiveness
                  </ThemedText>
                  <ProgressBar
                    label="On-Time Dismissal Rate"
                    percentage={stats.onTimeDismissalRate}
                    color={
                      stats.onTimeDismissalRate >= 80
                        ? theme.success
                        : stats.onTimeDismissalRate >= 50
                          ? theme.warning
                          : theme.error
                    }
                  />
                </View>

                {/* Insights */}
                {insights.length > 0 && (
                  <View style={styles.section}>
                    <ThemedText type="h3" style={styles.sectionTitle}>
                      Insights & Recommendations
                    </ThemedText>
                    <View style={styles.insightsContainer}>
                      {insights.map((insight, index) => (
                        <InsightCard key={index} {...insight} />
                      ))}
                    </View>
                  </View>
                )}

                {/* Recent History */}
                {recentHistory.length > 0 && (
                  <View style={styles.section}>
                    <ThemedText type="h3" style={styles.sectionTitle}>
                      Recent History
                    </ThemedText>
                    {recentHistory.slice(0, 5).map((entry) => (
                      <View
                        key={entry.id}
                        style={[
                          styles.historyEntry,
                          {
                            backgroundColor: theme.backgroundDefault,
                            borderColor: theme.border,
                          },
                        ]}
                      >
                        <View style={styles.historyIcon}>
                          <Feather
                            name={entry.wasOnTime ? "check" : "clock"}
                            size={16}
                            color={
                              entry.wasOnTime ? theme.success : theme.warning
                            }
                          />
                        </View>
                        <View style={styles.historyContent}>
                          <ThemedText type="body">
                            {new Date(entry.triggeredAt).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </ThemedText>
                          <ThemedText type="small" muted>
                            {entry.snoozeCount > 0
                              ? `Snoozed ${entry.snoozeCount}x`
                              : "No snooze"}
                            {entry.dismissedAt &&
                              ` • ${new Date(
                                entry.dismissedAt,
                              ).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}`}
                          </ThemedText>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <Feather name="bar-chart-2" size={48} color={theme.textMuted} />
                <ThemedText type="body" muted style={styles.emptyText}>
                  No statistics available yet
                </ThemedText>
                <ThemedText type="small" muted>
                  Statistics will appear after this alert triggers
                </ThemedText>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlayPress: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: "90%",
    ...Shadows.fab,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: Spacing.md,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  statisticsGrid: {
    gap: Spacing.md,
  },
  statisticCard: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
    ...Shadows.card,
  },
  statisticIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  statisticContent: {
    flex: 1,
  },
  progressContainer: {
    marginBottom: Spacing.md,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  insightsContainer: {
    gap: Spacing.md,
  },
  insightCard: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  insightContent: {
    flex: 1,
  },
  historyEntry: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    alignItems: "center",
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  historyContent: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  emptyText: {
    marginTop: Spacing.lg,
    textAlign: "center",
  },
});

