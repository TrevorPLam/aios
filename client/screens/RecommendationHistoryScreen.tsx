/**
 * RecommendationHistoryScreen Module
 *
 * Historical view of past AI recommendations with filtering and statistics.
 * Features:
 * - Chronological list of accepted/declined/expired recommendations
 * - Filter by status (all, accepted, declined, expired)
 * - Filter by module (all modules or specific module)
 * - Quick statistics dashboard
 * - Tap to view recommendation details
 * - Acceptance rate indicator
 * - Pull-to-refresh support
 *
 * @module RecommendationHistoryScreen
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { db } from "@/storage/database";
import {
  Recommendation,
  RecommendationStatus,
  ModuleType,
} from "@/models/types";
import { formatDateTime } from "@/utils/helpers";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

/** Maximum historical items to retrieve */
const MAX_HISTORY_ITEMS = 100;

/**
 * Get icon for recommendation status
 */
function getStatusIcon(
  status: RecommendationStatus,
): keyof typeof Feather.glyphMap {
  switch (status) {
    case "accepted":
      return "check-circle";
    case "declined":
      return "x-circle";
    case "expired":
      return "clock";
    default:
      return "circle";
  }
}

/**
 * Get color for recommendation status
 */
function getStatusColor(status: RecommendationStatus, theme: any): string {
  switch (status) {
    case "accepted":
      return theme.success;
    case "declined":
      return theme.error;
    case "expired":
      return theme.textMuted;
    default:
      return theme.text;
  }
}

/**
 * Statistics Card Component
 * Shows quick stats about recommendation history
 */
function StatisticsCard({ stats }: { stats: any }) {
  const { theme } = useTheme();

  return (
    <View
      style={[styles.statsCard, { backgroundColor: theme.backgroundDefault }]}
    >
      <ThemedText type="h3" style={styles.statsTitle}>
        Statistics
      </ThemedText>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <ThemedText type="hero" style={{ color: theme.accent }}>
            {stats.total}
          </ThemedText>
          <ThemedText type="caption" muted>
            Total
          </ThemedText>
        </View>

        <View style={styles.statItem}>
          <ThemedText type="hero" style={{ color: theme.success }}>
            {stats.accepted}
          </ThemedText>
          <ThemedText type="caption" muted>
            Accepted
          </ThemedText>
        </View>

        <View style={styles.statItem}>
          <ThemedText type="hero" style={{ color: theme.error }}>
            {stats.declined}
          </ThemedText>
          <ThemedText type="caption" muted>
            Declined
          </ThemedText>
        </View>

        <View style={styles.statItem}>
          <ThemedText type="hero">{stats.acceptanceRate}%</ThemedText>
          <ThemedText type="caption" muted>
            Rate
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

/**
 * Recommendation History Card Component
 */
function HistoryCard({
  recommendation,
  onPress,
}: {
  recommendation: Recommendation;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const statusIcon = getStatusIcon(recommendation.status);
  const statusColor = getStatusColor(recommendation.status, theme);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.backgroundDefault },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.moduleTag, { backgroundColor: theme.accentDim }]}>
          <ThemedText type="small" style={{ color: theme.accent }}>
            {recommendation.module.toUpperCase()}
          </ThemedText>
        </View>

        <View style={styles.statusBadge}>
          <Feather name={statusIcon} size={14} color={statusColor} />
          <ThemedText
            type="small"
            style={{ color: statusColor, textTransform: "capitalize" }}
          >
            {recommendation.status}
          </ThemedText>
        </View>
      </View>

      <ThemedText type="h4" style={styles.cardTitle}>
        {recommendation.title}
      </ThemedText>

      <ThemedText type="caption" muted style={styles.cardDate}>
        {formatDateTime(recommendation.createdAt)}
      </ThemedText>
    </Pressable>
  );
}

export default function RecommendationHistoryScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "all" | RecommendationStatus
  >("all");

  /**
   * Load recommendation history and statistics
   */
  const loadData = useCallback(async () => {
    const [history, stats] = await Promise.all([
      db.recommendations.getHistory(MAX_HISTORY_ITEMS),
      db.recommendations.getStatistics(),
    ]);

    setRecommendations(history);
    setStatistics(stats);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  /**
   * Navigate to recommendation detail
   */
  const handleCardPress = useCallback(
    (rec: Recommendation) => {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      navigation.navigate("RecommendationDetail", { recommendationId: rec.id });
    },
    [navigation],
  );

  /**
   * Filter recommendations by status
   */
  const filteredRecommendations = recommendations.filter((rec) => {
    if (statusFilter === "all") return true;
    return rec.status === statusFilter;
  });

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + Spacing.sm,
            backgroundColor: theme.backgroundBlack,
          },
        ]}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.pressed,
          ]}
        >
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>

        <Animated.View entering={FadeInDown.delay(100)}>
          <ThemedText type="h2">History</ThemedText>
        </Animated.View>

        <View style={styles.headerButton} />
      </View>

      {statistics && (
        <Animated.View entering={FadeInDown.delay(200)}>
          <StatisticsCard stats={statistics} />
        </Animated.View>
      )}

      <View style={styles.filterRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {(["all", "accepted", "declined", "expired"] as const).map(
            (filter) => (
              <Pressable
                key={filter}
                onPress={() => {
                  setStatusFilter(filter);
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor:
                      statusFilter === filter
                        ? theme.accent
                        : theme.backgroundDefault,
                  },
                ]}
              >
                <ThemedText
                  type="small"
                  style={{
                    color: statusFilter === filter ? "#FFFFFF" : theme.text,
                    textTransform: "capitalize",
                    fontWeight: statusFilter === filter ? "600" : "400",
                  }}
                >
                  {filter}
                </ThemedText>
              </Pressable>
            ),
          )}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.accent}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredRecommendations.length > 0 ? (
          filteredRecommendations.map((rec, index) => (
            <Animated.View
              key={rec.id}
              entering={FadeInDown.delay(300 + index * 50)}
            >
              <HistoryCard
                recommendation={rec}
                onPress={() => handleCardPress(rec)}
              />
            </Animated.View>
          ))
        ) : (
          <Animated.View
            entering={FadeInDown.delay(300)}
            style={styles.emptyState}
          >
            <Feather name="inbox" size={64} color={theme.textMuted} />
            <ThemedText type="h3" style={styles.emptyTitle}>
              No History
            </ThemedText>
            <ThemedText type="body" secondary style={styles.emptyText}>
              Past recommendations will appear here
            </ThemedText>
          </Animated.View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  statsCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  statsTitle: {
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
  },
  filterRow: {
    marginBottom: Spacing.sm,
  },
  filterContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  moduleTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  cardTitle: {
    marginBottom: Spacing.xs,
  },
  cardDate: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: Spacing["5xl"],
  },
  emptyTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    textAlign: "center",
  },
});
