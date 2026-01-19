/**
 * CommandCenterScreen Module
 *
 * AI-powered recommendation hub with swipeable card interface.
 * Features:
 * - Swipeable recommendation cards (left to decline, right to accept)
 * - Confidence meter showing AI certainty level
 * - Evidence-based recommendations
 * - Expiry countdown for time-sensitive suggestions
 * - AI usage limits tracking
 * - History logging of decisions
 * - Empty state prompts for AI generation
 * - Haptic feedback for interactions
 * - Attention Center access with badge count
 *
 * @module CommandCenterScreen
 */

import React, { useCallback, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
  Platform,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { db } from "@/storage/database";
import { Recommendation, AILimits } from "@/models/types";
import { formatTimeRemaining, getConfidenceColor } from "@/utils/helpers";
import { BottomNav } from "@/components/BottomNav";
import AIAssistSheet from "@/components/AIAssistSheet";
import { RecommendationEngine } from "@/lib/recommendationEngine";
import { attentionManager } from "@/lib/attentionManager";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - Spacing["2xl"] * 2;
/** Minimum horizontal swipe distance to trigger accept/decline */
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
/** Minimum recommendations before auto-refresh triggers */
const MIN_RECOMMENDATIONS_THRESHOLD = 3;

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

/**
 * ConfidenceMeter Component
 *
 * Visual indicator of AI confidence level with 3 segments.
 * Shows 1-3 filled segments based on confidence level.
 *
 * @param {"low" | "medium" | "high"} confidence - AI confidence level
 * @returns {JSX.Element} The confidence meter component
 */
function ConfidenceMeter({
  confidence,
}: {
  confidence: "low" | "medium" | "high";
}) {
  const { theme } = useTheme();
  const levels = confidence === "high" ? 3 : confidence === "medium" ? 2 : 1;

  return (
    <View style={styles.confidenceMeter}>
      {[1, 2, 3].map((level) => (
        <View
          key={level}
          style={[
            styles.confidenceSegment,
            {
              backgroundColor:
                level <= levels
                  ? getConfidenceColor(confidence, theme)
                  : theme.border,
            },
          ]}
        />
      ))}
    </View>
  );
}

/**
 * RecommendationCard Component
 *
 * Swipeable card displaying AI recommendation with details and actions.
 * Supports:
 * - Swipe right to accept (> 30% screen width)
 * - Swipe left to decline (> 30% screen width)
 * - Tap to view details
 * - Visual feedback during swipe (color/opacity changes)
 *
 * @param {Recommendation} recommendation - The recommendation data to display
 * @param {Function} onAccept - Callback when card is swiped right/accepted
 * @param {Function} onDecline - Callback when card is swiped left/declined
 * @param {Function} onPress - Callback when card is tapped
 * @returns {JSX.Element} The recommendation card component
 */
function RecommendationCard({
  recommendation,
  onAccept,
  onDecline,
  onPress,
}: {
  recommendation: Recommendation;
  onAccept: () => void;
  onDecline: () => void;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      // Only allow horizontal swiping (not vertical)
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > SWIPE_THRESHOLD) {
        translateX.value = withTiming(
          e.translationX > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH,
          { duration: 200 },
          () => {
            runOnJS(e.translationX > 0 ? onAccept : onDecline)();
          },
        );
      } else {
        translateX.value = withSpring(0);
      }
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(onPress)();
  });

  const gesture = Gesture.Exclusive(panGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-15, 0, 15],
    );

    return {
      transform: [{ translateX: translateX.value }, { rotate: `${rotate}deg` }],
    };
  });

  const acceptGlowStyle = useAnimatedStyle(() => {
    const glowOpacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 0.6],
    );
    return { opacity: Math.max(0, glowOpacity) };
  });

  const declineGlowStyle = useAnimatedStyle(() => {
    const glowOpacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [0.6, 0],
    );
    return { opacity: Math.max(0, glowOpacity) };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: theme.backgroundDefault },
          animatedStyle,
        ]}
      >
        <Animated.View
          style={[
            styles.cardGlow,
            styles.acceptGlow,
            { backgroundColor: theme.success },
            acceptGlowStyle,
          ]}
        />
        <Animated.View
          style={[
            styles.cardGlow,
            styles.declineGlow,
            { backgroundColor: theme.error },
            declineGlowStyle,
          ]}
        />

        <View style={styles.cardHeader}>
          <View
            style={[styles.moduleTag, { backgroundColor: theme.accentDim }]}
          >
            <ThemedText type="small" style={{ color: theme.accent }}>
              {recommendation.module.toUpperCase()}
            </ThemedText>
          </View>
          <ConfidenceMeter confidence={recommendation.confidence} />
        </View>

        <ThemedText type="h3" style={styles.cardTitle}>
          {recommendation.title}
        </ThemedText>

        <ThemedText type="body" secondary style={styles.cardSummary}>
          {recommendation.summary}
        </ThemedText>

        <View style={styles.cardFooter}>
          <View style={styles.expiryContainer}>
            <Feather name="clock" size={14} color={theme.textMuted} />
            <ThemedText type="small" muted style={styles.expiryText}>
              {formatTimeRemaining(recommendation.expiresAt)}
            </ThemedText>
          </View>
          <ThemedText type="small" style={{ color: theme.accent }}>
            Tap for details
          </ThemedText>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

export default function CommandCenterScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [aiLimits, setAiLimits] = useState<AILimits | null>(null);
  const [showAISheet, setShowAISheet] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [attentionCount, setAttentionCount] = useState(0);

  /**
   * Load recommendations, AI limits, and attention counts from database.
   * Also triggers automatic refresh if recommendations are below threshold.
   * 
   * Data Flow:
   * 1. Load active recommendations from database
   * 2. Load AI usage limits
   * 3. Calculate attention count (urgent + attention priority items)
   * 4. Auto-refresh recommendations if below threshold
   * 
   * Error Handling:
   * - Attention counts default to 0 if manager returns undefined/null
   * - Database errors are caught by outer error boundaries
   */
  const loadData = useCallback(async () => {
    try {
      const recs = await db.recommendations.getActive();
      setRecommendations(recs);
      const limits = await db.aiLimits.get();
      setAiLimits(limits);

      // Load attention counts - sum urgent and attention priority items
      // Handle potential undefined values with fallback to 0
      const counts = attentionManager.getCounts();
      const totalCount = (counts?.urgent || 0) + (counts?.attention || 0);
      setAttentionCount(totalCount);

      // Auto-refresh if we have few or no recommendations
      if (recs.length < MIN_RECOMMENDATIONS_THRESHOLD) {
        await handleRefreshRecommendations();
      }
    } catch (error) {
      console.error("Failed to load CommandCenter data:", error);
      // Error boundaries will handle this - just log for debugging
    }
  }, [handleRefreshRecommendations]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadData);
    return unsubscribe;
  }, [navigation, loadData]);

  /**
   * Manually refresh recommendations using the AI engine
   * Generates new recommendations based on user data across modules
   */
  const handleRefreshRecommendations = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      const count = await RecommendationEngine.refreshRecommendations();
      if (count > 0) {
        await loadData();
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      console.error("Error refreshing recommendations:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, loadData]);

  const handleAccept = useCallback(
    async (rec: Recommendation) => {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      await db.recommendations.updateStatus(rec.id, "accepted");
      if (rec.countsAgainstLimit) {
        await db.aiLimits.incrementUsed();
      }
      await db.decisions.save({
        id: `decision_${Date.now()}`,
        recommendationId: rec.id,
        decision: "accepted",
        decidedAt: new Date().toISOString(),
      });
      await db.history.add({
        message: `AI generated card option: "${rec.title}". User accepted.`,
        type: "recommendation",
        metadata: { recommendationId: rec.id, decision: "accepted" },
      });
      loadData();
    },
    [loadData],
  );

  const handleDecline = useCallback(
    async (rec: Recommendation) => {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      await db.recommendations.updateStatus(rec.id, "declined");
      if (rec.countsAgainstLimit) {
        await db.aiLimits.incrementUsed();
      }
      await db.decisions.save({
        id: `decision_${Date.now()}`,
        recommendationId: rec.id,
        decision: "declined",
        decidedAt: new Date().toISOString(),
      });
      await db.history.add({
        message: `AI generated card option: "${rec.title}". User declined.`,
        type: "recommendation",
        metadata: { recommendationId: rec.id, decision: "declined" },
      });
      loadData();
    },
    [loadData],
  );

  const handleCardPress = useCallback(
    (rec: Recommendation) => {
      navigation.navigate("RecommendationDetail", { recommendationId: rec.id });
    },
    [navigation],
  );

  const remaining = aiLimits ? aiLimits.total - aiLimits.used : 0;
  const total = aiLimits?.total || 12;
  const refreshTime = aiLimits
    ? formatTimeRemaining(aiLimits.nextRefreshAt)
    : "--";

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
          onPress={() => navigation.navigate("ModuleGrid")}
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.pressed,
          ]}
        >
          <Feather name="grid" size={24} color={theme.text} />
        </Pressable>

        <Animated.View entering={FadeIn.delay(200)}>
          <ThemedText type="h2">Command Center</ThemedText>
        </Animated.View>

        <View style={styles.headerActions}>
          <Pressable
            onPress={() => navigation.navigate("AttentionCenter")}
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.pressed,
            ]}
          >
            <View>
              <Feather name="bell" size={24} color={theme.text} />
              {attentionCount > 0 && (
                <View style={[styles.badge, { backgroundColor: theme.error }]}>
                  <ThemedText
                    style={[styles.badgeText, { color: theme.backgroundRoot }]}
                  >
                    {attentionCount > 99 ? "99+" : attentionCount}
                  </ThemedText>
                </View>
              )}
            </View>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate("RecommendationHistory")}
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.pressed,
            ]}
          >
            <Feather name="clock" size={24} color={theme.text} />
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate("Settings")}
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.pressed,
            ]}
          >
            <Feather name="settings" size={24} color={theme.text} />
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        {recommendations.length > 0 ? (
          <FlatList
            data={recommendations}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.cardContainer}>
                <RecommendationCard
                  recommendation={item}
                  onAccept={() => handleAccept(item)}
                  onDecline={() => handleDecline(item)}
                  onPress={() => handleCardPress(item)}
                />
              </View>
            )}
            ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <Animated.View
            entering={FadeInDown.delay(300)}
            style={styles.emptyState}
          >
            <Image
              source={require("../../assets/images/empty-command-center.png")}
              style={styles.emptyImage}
              resizeMode="contain"
            />
            <ThemedText type="h3" style={styles.emptyTitle}>
              No Active Recommendations
            </ThemedText>
            <ThemedText type="body" secondary style={styles.emptyText}>
              Check back in {refreshTime}
            </ThemedText>
          </Animated.View>
        )}
      </View>

      <View
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}
      >
        <View style={styles.limitsContainer}>
          <View
            style={[
              styles.limitBadge,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <Feather name="zap" size={14} color={theme.accent} />
            <ThemedText type="small" style={{ color: theme.accent }}>
              AI Cards: {remaining}/{total}
            </ThemedText>
          </View>
          <View
            style={[
              styles.limitBadge,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <Feather name="refresh-cw" size={14} color={theme.textMuted} />
            <ThemedText type="small" muted>
              Refreshes in {refreshTime}
            </ThemedText>
          </View>
        </View>

        <BottomNav onAiPress={() => setShowAISheet(true)} />
      </View>

      <AIAssistSheet
        visible={showAISheet}
        onClose={() => setShowAISheet(false)}
        module="command"
        onAction={(actionId) => {
          if (actionId === "refresh") {
            handleRefreshRecommendations();
          }
          setShowAISheet(false);
        }}
      />
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
  headerActions: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  pressed: {
    opacity: 0.7,
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing.lg,
  },
  cardSeparator: {
    height: Spacing.xs,
  },
  cardContainer: {
    width: CARD_WIDTH,
    alignSelf: "center",
    minHeight: 300,
  },
  card: {
    width: CARD_WIDTH,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    // Soft white glow around cards
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  cardGlow: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 8,
    borderRadius: BorderRadius.lg,
  },
  acceptGlow: {
    right: 0,
  },
  declineGlow: {
    left: 0,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  moduleTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  confidenceMeter: {
    flexDirection: "row",
    gap: 4,
  },
  confidenceSegment: {
    width: 20,
    height: 6,
    borderRadius: 3,
  },
  cardTitle: {
    marginBottom: Spacing.sm,
  },
  cardSummary: {
    marginBottom: Spacing.lg,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expiryContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  expiryText: {
    marginLeft: 2,
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  emptyImage: {
    width: 200,
    height: 200,
    opacity: 0.8,
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  emptyText: {
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: Spacing.lg,
  },
  limitsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  limitBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    lineHeight: 12,
  },
  bottomNav: {
    display: "none",
  },
  aiButton: {
    display: "none",
  },
  navButton: {
    display: "none",
  },
});
