/**
 * RecommendationDetailScreen Module
 *
 * Detailed view of a single AI recommendation with full information.
 * Features:
 * - Complete recommendation details (title, summary, evidence)
 * - Confidence level visualization
 * - Priority and module information
 * - Expiry countdown
 * - Accept/decline actions with history logging
 * - Evidence timestamps for AI reasoning transparency
 * - Haptic feedback for actions
 *
 * @module RecommendationDetailScreen
 */

import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { db } from "@/storage/database";
import { Recommendation } from "@/models/types";
import {
  formatTimeRemaining,
  formatDateTime,
  getConfidenceColor,
} from "@/utils/helpers";

type RouteProps = RouteProp<AppStackParamList, "RecommendationDetail">;

/**
 * RecommendationDetailScreen Component
 *
 * Shows full details of an AI recommendation with action buttons.
 * Logs user decisions to history for AI learning.
 *
 * @returns {JSX.Element} The recommendation detail screen component
 */
export default function RecommendationDetailScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();

  const [recommendation, setRecommendation] = useState<Recommendation | null>(
    null,
  );

  // Load recommendation data on mount
  useEffect(() => {
    async function load() {
      const all = await db.recommendations.getAll();
      const rec = all.find((r) => r.id === route.params.recommendationId);
      setRecommendation(rec || null);
    }
    load();
  }, [route.params.recommendationId]);

  /**
   * Accept recommendation
   * Updates status, saves decision, and logs to history
   */
  const handleAccept = useCallback(async () => {
    if (!recommendation) return;
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await db.recommendations.updateStatus(recommendation.id, "accepted");
    await db.decisions.save({
      id: `decision_${Date.now()}`,
      recommendationId: recommendation.id,
      decision: "accepted",
      decidedAt: new Date().toISOString(),
    });
    await db.history.add({
      message: `AI generated card option: "${recommendation.title}". User accepted.`,
      type: "recommendation",
      metadata: { recommendationId: recommendation.id, decision: "accepted" },
    });
    navigation.goBack();
  }, [recommendation, navigation]);

  /**
   * Decline recommendation
   * Updates status, saves decision, and logs to history
   */
  const handleDecline = useCallback(async () => {
    if (!recommendation) return;
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    await db.recommendations.updateStatus(recommendation.id, "declined");
    await db.decisions.save({
      id: `decision_${Date.now()}`,
      recommendationId: recommendation.id,
      decision: "declined",
      decidedAt: new Date().toISOString(),
    });
    await db.history.add({
      message: `AI generated card option: "${recommendation.title}". User declined.`,
      type: "recommendation",
      metadata: { recommendationId: recommendation.id, decision: "declined" },
    });
    navigation.goBack();
  }, [recommendation, navigation]);

  if (!recommendation) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  const confidenceColor = getConfidenceColor(recommendation.confidence, theme);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing["5xl"] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100)}>
          <View
            style={[styles.moduleTag, { backgroundColor: theme.accentDim }]}
          >
            <ThemedText type="small" style={{ color: theme.accent }}>
              {recommendation.module.toUpperCase()}
            </ThemedText>
          </View>

          <ThemedText type="hero" style={styles.title}>
            {recommendation.title}
          </ThemedText>

          <ThemedText type="body" secondary style={styles.summary}>
            {recommendation.summary}
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)}>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Feather name="activity" size={16} color={confidenceColor} />
              <ThemedText type="caption" style={{ color: confidenceColor }}>
                {recommendation.confidence.charAt(0).toUpperCase() +
                  recommendation.confidence.slice(1)}{" "}
                Confidence
              </ThemedText>
            </View>
            <View style={styles.metaItem}>
              <Feather name="clock" size={16} color={theme.textMuted} />
              <ThemedText type="caption" muted>
                Expires in {formatTimeRemaining(recommendation.expiresAt)}
              </ThemedText>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)}>
          <View
            style={[
              styles.whySection,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View style={styles.whyHeader}>
              <Feather name="info" size={18} color={theme.accent} />
              <ThemedText type="h3" style={styles.whyTitle}>
                Why This Recommendation
              </ThemedText>
            </View>
            <ThemedText type="body" secondary>
              {recommendation.why}
            </ThemedText>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)}>
          <View
            style={[
              styles.infoSection,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View style={styles.infoRow}>
              <ThemedText type="caption" muted>
                Created
              </ThemedText>
              <ThemedText type="caption">
                {formatDateTime(recommendation.createdAt)}
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText type="caption" muted>
                Priority
              </ThemedText>
              <ThemedText
                type="caption"
                style={{ textTransform: "capitalize" }}
              >
                {recommendation.priority}
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText type="caption" muted>
                Type
              </ThemedText>
              <ThemedText type="caption">
                {recommendation.type.replace(/_/g, " ")}
              </ThemedText>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {recommendation.status === "active" && (
        <View
          style={[
            styles.actionBar,
            { paddingBottom: insets.bottom + Spacing.lg },
          ]}
        >
          <Button
            onPress={handleDecline}
            style={[styles.actionButton, { backgroundColor: theme.errorDim }]}
          >
            <View style={styles.buttonContent}>
              <Feather name="x" size={20} color={theme.error} />
              <ThemedText
                type="body"
                style={{ color: theme.error, fontWeight: "600" }}
              >
                Decline
              </ThemedText>
            </View>
          </Button>
          <Button onPress={handleAccept} style={styles.actionButton}>
            <View style={styles.buttonContent}>
              <Feather name="check" size={20} color={theme.buttonText} />
              <ThemedText
                type="body"
                style={{ color: theme.buttonText, fontWeight: "600" }}
              >
                Accept
              </ThemedText>
            </View>
          </Button>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  moduleTag: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.md,
  },
  title: {
    marginBottom: Spacing.md,
  },
  summary: {
    marginBottom: Spacing.xl,
  },
  metaRow: {
    flexDirection: "row",
    gap: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  whySection: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  whyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  whyTitle: {
    flex: 1,
  },
  infoSection: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionBar: {
    flexDirection: "row",
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
});
