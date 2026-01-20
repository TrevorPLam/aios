/**
 * CommandCenterScreen Module
 *
 * Purpose:
 * Central hub for AI-powered recommendations with intuitive swipe gestures.
 * Primary interface for users to review, accept, or decline AI suggestions.
 *
 * Key Features:
 * - Swipeable recommendation cards (swipe right to accept, left to decline)
 * - Visual glow indicator for unread recommendations (accent-colored shadow on iOS)
 * - Confidence meter showing AI certainty level (low/medium/high)
 * - Real-time AI usage limits tracking with countdown
 * - Secondary navigation bar for quick access (Search, Attention, History)
 * - Attention Center integration with badge count
 * - History logging of all user decisions
 * - Auto-refresh when recommendations fall below threshold (3)
 * - Manual refresh button with haptic confirmation
 * - Card-level reasoning and evidence previews
 * - Haptic feedback for all interactions (iOS/Android)
 * - Empty state with visual prompt for AI generation
 *
 * Data Flow:
 * 1. Load active recommendations from database on mount and focus
 * 2. Display cards in FlatList with minimal spacing (stacked appearance)
 * 3. User swipes or taps card → triggers accept/decline/view actions
 * 4. Mark card as opened on tap (fire-and-forget pattern)
 * 5. Update recommendation status and log to history
 * 6. Reload data to reflect changes
 *
 * Architecture Decisions:
 * - Fire-and-forget pattern for markAsOpened: prevents blocking navigation
 * - Separate constants for magic numbers: improves maintainability
 * - Bottom footer extends edge-to-edge: modern mobile app pattern
 * - Secondary nav with smaller badge threshold (9+ vs 99+): space constraints
 *
 * Performance Considerations:
 * - FlatList for efficient rendering of recommendation cards
 * - Memoized callbacks to prevent unnecessary re-renders
 * - Auto-refresh only when count falls below MIN_RECOMMENDATIONS_THRESHOLD
 * - Attention counts calculated once per load
 * - Recommendation preferences loaded from settings (show/evidence/auto-refresh)
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
  NativeSyntheticEvent,
  NativeScrollEvent,
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
import { Recommendation, AILimits, Settings } from "@/models/types";
import { formatDate, formatTimeRemaining, getConfidenceColor } from "@/utils/helpers";
import { BottomNav } from "@/components/BottomNav";
import AIAssistSheet from "@/components/AIAssistSheet";
import { RecommendationEngine } from "@/lib/recommendationEngine";
import { attentionManager } from "@/lib/attentionManager";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - Spacing["2xl"] * 2;

// Gesture Constants
/** Minimum horizontal swipe distance (30% of screen width) to trigger accept/decline action */
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

/** Animation duration in milliseconds for card swipe completion */
const SWIPE_ANIMATION_DURATION = 200;

/** Rotation angle range for card tilt during swipe gesture (±15 degrees) */
const CARD_ROTATION_ANGLE = 15;

// UI Constants
/** Minimum recommendations before auto-refresh triggers to maintain card availability */
const MIN_RECOMMENDATIONS_THRESHOLD = 3;

/** Minimum card spacing in pixels (small spacing between cards for visual separation) */
const CARD_SPACING = Spacing.sm; // Using theme spacing for consistency

/** Opacity for secondary navigation oval (semi-transparent for visual depth) */
const SECONDARY_NAV_OPACITY = 0.8;

/** Badge count threshold for secondary nav (smaller due to reduced badge size) */
const SECONDARY_NAV_BADGE_THRESHOLD = 9;

type RecommendationPreferences = Pick<
  Settings,
  | "recommendationsEnabled"
  | "recommendationAutoRefresh"
  | "recommendationShowEvidence"
  | "recommendationShowReasoning"
>;

const DEFAULT_RECOMMENDATION_PREFERENCES: RecommendationPreferences = {
  recommendationsEnabled: true,
  recommendationAutoRefresh: true,
  recommendationShowEvidence: true,
  recommendationShowReasoning: true,
};

/**
 * Generate a short evidence summary for display on recommendation cards.
 *
 * Plain English: Shows how many signals informed the recommendation and
 * highlights the most recent evidence timestamp for quick context.
 */
const buildEvidenceSummary = (timestamps: string[]): string => {
  if (timestamps.length === 0) {
    return "Evidence pending";
  }

  const latestTimestamp = timestamps.reduce((latest, current) =>
    new Date(current) > new Date(latest) ? current : latest,
  );
  const plural = timestamps.length === 1 ? "signal" : "signals";

  return `${timestamps.length} ${plural} • Latest ${formatDate(latestTimestamp)}`;
};

// Scroll Animation Constants
/** 
 * Secondary nav bar hide offset in pixels when scrolling down.
 * This value must be large enough to hide the entire secondary nav content:
 * - secondaryNavContent paddingVertical (Spacing.sm = 8px) * 2 = 16px
 * - secondaryNavContent height (icon 20px + text ~12px + gap Spacing.xs 4px) = ~36px
 * - Additional buffer for complete hiding = ~20px
 * Total: approximately -72px ensures complete hiding
 */
const SECONDARY_NAV_HIDE_OFFSET = -72;

/** Animation duration in milliseconds for secondary nav show/hide transitions */
const SECONDARY_NAV_ANIMATION_DURATION = 200;

/** Scroll position threshold to show nav when near top of page */
const SCROLL_TOP_THRESHOLD = 10;

/** Scroll delta threshold to hide nav when scrolling down */
const SCROLL_DOWN_THRESHOLD = 5;

/** Scroll delta threshold to show nav when scrolling up (negative value) */
const SCROLL_UP_THRESHOLD = -5;

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

/**
 * ConfidenceMeter Component
 *
 * Visual indicator of AI confidence level using 1-3 filled segments.
 * Color-coded based on confidence level for quick visual scanning.
 *
 * Confidence Mapping:
 * - low: 1 segment (indicates uncertainty, use with caution)
 * - medium: 2 segments (moderate confidence, reasonable to accept)
 * - high: 3 segments (high confidence, AI is very certain)
 *
 * @param props - Component props
 * @param props.confidence - AI confidence level
 * @returns The confidence meter component
 */
interface ConfidenceMeterProps {
  confidence: "low" | "medium" | "high";
}

/**
 * Memoized to prevent unnecessary re-renders.
 * Only re-renders when confidence level changes.
 */
const ConfidenceMeter = React.memo(function ConfidenceMeter({ confidence }: ConfidenceMeterProps) {
  const { theme } = useTheme();
  const filledSegments = confidence === "high" ? 3 : confidence === "medium" ? 2 : 1;

  return (
    <View style={styles.confidenceMeter}>
      {[1, 2, 3].map((segmentNumber) => (
        <View
          key={segmentNumber}
          style={[
            styles.confidenceSegment,
            {
              backgroundColor:
                segmentNumber <= filledSegments
                  ? getConfidenceColor(confidence, theme)
                  : theme.border,
            },
          ]}
        />
      ))}
    </View>
  );
});

/**
 * RecommendationCard Component
 *
 * Interactive swipeable card displaying AI recommendation with rich visual feedback.
 *
 * Interaction Patterns:
 * - Swipe right (>30% screen width): Accept recommendation
 * - Swipe left (>30% screen width): Decline recommendation
 * - Tap: Navigate to detailed view
 * - During swipe: Card rotates ±15° and shows colored glow (green=accept, red=decline)
 *
 * Visual States:
 * - Unopened: Accent-colored shadow glow (iOS: shadowOpacity 0.6, radius 16px) to draw attention
 * - Opened: Subtle shadow (iOS: shadowOpacity 0.15, radius 8px)
 * - Swiping: Animated rotation and edge glow based on swipe direction/distance
 *
 * Performance:
 * - Uses Reanimated for 60fps animations on UI thread
 * - Gesture.Exclusive ensures tap doesn't interfere with swipe
 * - Active offsets prevent accidental swipes during scrolling
 *
 * @param props - Component props
 * @param props.recommendation - The recommendation data to display
 * @param props.onAccept - Callback when card is swiped right/accepted
 * @param props.onDecline - Callback when card is swiped left/declined
 * @param props.onPress - Callback when card is tapped
 * @returns The recommendation card component
 */
interface RecommendationCardProps {
  recommendation: Recommendation;
  onAccept: () => void;
  onDecline: () => void;
  onPress: () => void;
  showReasoning: boolean;
  showEvidence: boolean;
}

/**
 * Memoized to prevent unnecessary re-renders when parent component updates.
 * Only re-renders when recommendation ID or opened status changes.
 */
const RecommendationCard = React.memo(function RecommendationCard({
  recommendation,
  onAccept,
  onDecline,
  onPress,
  showReasoning,
  showEvidence,
}: RecommendationCardProps) {
  const { theme } = useTheme();
  const translateX = useSharedValue(0);
  
  // Determine if card is unopened (shows white glow to indicate newness)
  const isUnopened = !recommendation.openedAt;

  const evidenceSummary = buildEvidenceSummary(recommendation.evidenceTimestamps);

  // Pan gesture for swipe-to-accept/decline interaction
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10]) // Require 10px horizontal movement before activating
    .failOffsetY([-10, 10])   // Cancel if vertical movement exceeds 10px (prevents interference with scroll)
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      const isSwipeThresholdMet = Math.abs(e.translationX) > SWIPE_THRESHOLD;
      
      if (isSwipeThresholdMet) {
        // Animate card off screen and trigger callback
        const targetX = e.translationX > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH;
        const callback = e.translationX > 0 ? onAccept : onDecline;
        
        translateX.value = withTiming(targetX, { duration: SWIPE_ANIMATION_DURATION }, () => {
          runOnJS(callback)();
        });
      } else {
        // Spring back to center if swipe threshold not met
        translateX.value = withSpring(0);
      }
    });

  // Tap gesture for navigation to detail view
  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(onPress)();
  });

  // Exclusive gesture: tap only triggers if not swiping
  const gesture = Gesture.Exclusive(panGesture, tapGesture);

  // Animated card position and rotation based on swipe distance
  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-CARD_ROTATION_ANGLE, 0, CARD_ROTATION_ANGLE],
    );

    return {
      transform: [{ translateX: translateX.value }, { rotate: `${rotate}deg` }],
    };
  });

  // Green glow intensity increases as user swipes right (accept direction)
  const acceptGlowStyle = useAnimatedStyle(() => {
    const glowOpacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 0.6],
    );
    return { opacity: Math.max(0, glowOpacity) };
  });

  // Red glow intensity increases as user swipes left (decline direction)
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
      {/* Shadow wrapper - allows shadow to render (no overflow hidden) */}
      <Animated.View
        style={[
          styles.cardShadowWrapper,
          { 
            shadowColor: "#FFFFFF",
            backgroundColor: theme.backgroundDefault,
          },
          // Stronger shadow for unopened cards
          isUnopened ? {
            shadowOpacity: 0.6,
            shadowRadius: 16,
            elevation: 8,
          } : {
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
          },
          animatedStyle,
        ]}
      >
        {/* Card content - has overflow hidden to clip glow indicators */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.backgroundDefault },
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

          {showReasoning && (
            <View style={styles.reasoningRow}>
              <Feather name="info" size={14} color={theme.textMuted} />
              <ThemedText
                type="small"
                muted
                numberOfLines={2}
                style={styles.reasoningText}
              >
                {recommendation.why}
              </ThemedText>
            </View>
          )}

          {showEvidence && (
            <View style={styles.evidenceRow}>
              <Feather name="activity" size={14} color={theme.textMuted} />
              <ThemedText type="small" muted style={styles.evidenceText}>
                {evidenceSummary}
              </ThemedText>
            </View>
          )}

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
        </View>
      </Animated.View>
    </GestureDetector>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if recommendation ID or opened status changes
  return (
    prevProps.recommendation.id === nextProps.recommendation.id &&
    prevProps.recommendation.openedAt === nextProps.recommendation.openedAt &&
    prevProps.showReasoning === nextProps.showReasoning &&
    prevProps.showEvidence === nextProps.showEvidence
  );
});

export default function CommandCenterScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [aiLimits, setAiLimits] = useState<AILimits | null>(null);
  const [showAISheet, setShowAISheet] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [attentionCount, setAttentionCount] = useState(0);
  const [recommendationPreferences, setRecommendationPreferences] =
    useState<RecommendationPreferences>(DEFAULT_RECOMMENDATION_PREFERENCES);

  // Scroll animation for secondary nav
  const lastScrollY = useSharedValue(0);
  const secondaryNavTranslateY = useSharedValue(0);
  const isAnimating = useSharedValue(false);

  /**
   * Load recommendations, AI limits, and attention counts from database.
   * Core data loading function without auto-refresh logic.
   * 
   * Data Flow:
   * 1. Fetch active (non-expired, status="active") recommendations
   * 2. Load AI usage limits (total, used, nextRefreshAt)
   * 3. Calculate attention count (urgent + attention priority items)
   * 
   * Error Handling:
   * - Attention counts default to 0 if manager returns undefined/null
   * - Database errors are caught by outer error boundaries (ScreenErrorBoundary)
   * - Individual errors are logged for debugging but don't block UI
   * 
   * @returns {Promise<number>} Number of recommendations loaded
   */
  const loadDataCore = useCallback(async (): Promise<number> => {
    try {
      const recs = await db.recommendations.getActive();
      setRecommendations(recs);
      
      const limits = await db.aiLimits.get();
      setAiLimits(limits);

      const settings = await db.settings.get();
      const nextPreferences: RecommendationPreferences = {
        // Normalize to strict booleans; legacy installs may have undefined fields.
        recommendationsEnabled: settings.recommendationsEnabled === true,
        recommendationAutoRefresh: settings.recommendationAutoRefresh === true,
        recommendationShowEvidence: settings.recommendationShowEvidence === true,
        recommendationShowReasoning: settings.recommendationShowReasoning === true,
      };

      // Avoid unnecessary re-renders by only updating when values change.
      setRecommendationPreferences((prev) =>
        prev.recommendationsEnabled === nextPreferences.recommendationsEnabled &&
        prev.recommendationAutoRefresh === nextPreferences.recommendationAutoRefresh &&
        prev.recommendationShowEvidence === nextPreferences.recommendationShowEvidence &&
        prev.recommendationShowReasoning === nextPreferences.recommendationShowReasoning
          ? prev
          : nextPreferences,
      );

      // Sum urgent and attention priority items for badge count
      const counts = attentionManager.getCounts();
      const totalCount = (counts?.urgent || 0) + (counts?.attention || 0);
      setAttentionCount(totalCount);

      return recs.length;
    } catch (error) {
      console.error("Failed to load CommandCenter data:", error);
      return 0;
    }
  }, []);

  /**
   * Load data with auto-refresh logic.
   * Wraps loadDataCore and triggers refresh if recommendations are below threshold.
   * 
   * Performance Note:
   * - Auto-refresh only triggers on initial load, not on subsequent refreshes
   * - Prevents infinite refresh loops via isRefreshing flag
   * 
   * ESLint Suppression Justification:
   * - handleRefreshRecommendations is intentionally NOT in deps to avoid circular dependency
   * - Including it would cause infinite re-renders since loadData is called from handleRefreshRecommendations
   * - The isRefreshing flag ensures safe non-blocking behavior
   */
  const loadData = useCallback(async () => {
    const count = await loadDataCore();
    
    // Maintain minimum recommendations for better UX (only on initial load)
    if (
      recommendationPreferences.recommendationsEnabled &&
      recommendationPreferences.recommendationAutoRefresh &&
      count < MIN_RECOMMENDATIONS_THRESHOLD &&
      !isRefreshing
    ) {
      handleRefreshRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadDataCore, recommendationPreferences, isRefreshing]);

  /**
   * Manually refresh recommendations using the AI recommendation engine.
   * Generates new recommendations based on user data across all modules.
   * 
   * Process:
   * 1. Check if refresh already in progress (prevents duplicate requests)
   * 2. Call RecommendationEngine to analyze user data and generate recommendations
   * 3. Reload data if new recommendations were created (count > 0)
   * 4. Provide haptic feedback on success (iOS/Android only)
   * 
   * Error Handling:
   * - Errors are logged but don't crash the app
   * - isRefreshing flag is reset in finally block to ensure UI recovers
   * 
   * @returns {Promise<void>}
   */
  const handleRefreshRecommendations = useCallback(async () => {
    if (isRefreshing || !recommendationPreferences.recommendationsEnabled) {
      return; // Prevent concurrent refresh requests or refreshes when disabled
    }

    setIsRefreshing(true);
    try {
      const count = await RecommendationEngine.refreshRecommendations();
      
      if (count > 0) {
        await loadDataCore(); // Reload data to show new recommendations
        
        // Haptic feedback for successful refresh (skip on web)
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      console.error("Error refreshing recommendations:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, recommendationPreferences.recommendationsEnabled, loadDataCore]);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reload data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadData);
    return unsubscribe;
  }, [navigation, loadData]);

  /**
   * Helper function to handle recommendation decision (accept or decline).
   * Reduces code duplication between handleAccept and handleDecline.
   * 
   * Process:
   * 1. Provide haptic feedback based on decision type
   * 2. Update recommendation status in database
   * 3. Increment AI usage counter if recommendation counts against limit
   * 4. Save decision to decisions table for AI learning
   * 5. Log to history for user audit trail
   * 6. Reload data to reflect changes in UI
   * 
   * @param {Recommendation} rec - The recommendation being decided on
   * @param {"accepted" | "declined"} decision - The user's decision
   * @returns {Promise<void>}
   */
  const handleRecommendationDecision = useCallback(
    async (rec: Recommendation, decision: "accepted" | "declined") => {
      // Haptic feedback based on decision type
      if (Platform.OS !== "web") {
        const feedbackType = decision === "accepted"
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Warning;
        Haptics.notificationAsync(feedbackType);
      }

      // Update recommendation status
      await db.recommendations.updateStatus(rec.id, decision);

      // Increment AI usage counter if this recommendation counts
      if (rec.countsAgainstLimit) {
        await db.aiLimits.incrementUsed();
      }

      // Save decision for AI learning
      await db.decisions.save({
        id: `decision_${Date.now()}`,
        recommendationId: rec.id,
        decision,
        decidedAt: new Date().toISOString(),
      });

      // Log to history for audit trail
      await db.history.add({
        message: `AI generated card option: "${rec.title}". User ${decision}.`,
        type: "recommendation",
        metadata: { recommendationId: rec.id, decision },
      });

      // Refresh UI to show updated state
      loadData();
    },
    [loadData],
  );

  /**
   * Handle user accepting a recommendation.
   * Wrapper around handleRecommendationDecision for cleaner component API.
   */
  const handleAccept = useCallback(
    async (rec: Recommendation) => {
      await handleRecommendationDecision(rec, "accepted");
    },
    [handleRecommendationDecision],
  );

  /**
   * Handle user declining a recommendation.
   * Wrapper around handleRecommendationDecision for cleaner component API.
   */
  const handleDecline = useCallback(
    async (rec: Recommendation) => {
      await handleRecommendationDecision(rec, "declined");
    },
    [handleRecommendationDecision],
  );

  /**
   * Handle user tapping a recommendation card to view details.
   * Marks the card as "opened" to remove the white glow indicator.
   * 
   * Implementation Notes:
   * - Uses fire-and-forget pattern: navigation happens immediately
   * - markAsOpened failure won't block navigation (better UX)
   * - If marking fails, card will keep glowing until next successful open
   * - Error is logged for debugging but doesn't impact user experience
   * 
   * @param {Recommendation} rec - The recommendation to view
   * @returns {Promise<void>}
   */
  const handleCardPress = useCallback(
    async (rec: Recommendation) => {
      // Mark as opened (fire-and-forget: don't block navigation on DB write)
      db.recommendations.markAsOpened(rec.id).catch((error) => {
        console.error("Failed to mark recommendation as opened:", error);
      });
      
      // Navigate immediately without waiting for DB write
      navigation.navigate("RecommendationDetail", { recommendationId: rec.id });
    },
    [navigation],
  );

  const remaining = aiLimits ? aiLimits.total - aiLimits.used : 0;
  const total = aiLimits?.total || 12;
  const refreshTime = aiLimits
    ? formatTimeRemaining(aiLimits.nextRefreshAt)
    : "--";

  /**
   * Scroll handler to hide/show secondary nav based on scroll direction and position.
   * 
   * Behavior:
   * - Shows nav when at top of page (scrollY < SCROLL_TOP_THRESHOLD)
   * - Hides nav when scrolling down significantly (delta > SCROLL_DOWN_THRESHOLD)
   * - Shows nav when scrolling up significantly (delta < SCROLL_UP_THRESHOLD)
   * - Prevents animation overlap using isAnimating flag
   * 
   * Performance:
   * - Uses shared values for smooth 60fps animations
   * - Throttled via scrollEventThrottle={16} on FlatList
   * - Animation state checks prevent redundant updates
   * - Memoized with useCallback to prevent recreation on every render
   * 
   * @param event - Native scroll event containing contentOffset
   */
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const delta = currentScrollY - lastScrollY.value;

    // Prevent overlapping animations for smooth performance
    if (isAnimating.value) {
      lastScrollY.value = currentScrollY;
      return;
    }

    // Show nav when at top (scrollY < SCROLL_TOP_THRESHOLD)
    if (currentScrollY < SCROLL_TOP_THRESHOLD && secondaryNavTranslateY.value !== 0) {
      isAnimating.value = true;
      secondaryNavTranslateY.value = withTiming(0, { duration: SECONDARY_NAV_ANIMATION_DURATION }, () => {
        isAnimating.value = false;
      });
    }
    // Hide nav when scrolling down (delta > SCROLL_DOWN_THRESHOLD)
    else if (delta > SCROLL_DOWN_THRESHOLD && secondaryNavTranslateY.value !== SECONDARY_NAV_HIDE_OFFSET) {
      isAnimating.value = true;
      secondaryNavTranslateY.value = withTiming(SECONDARY_NAV_HIDE_OFFSET, { duration: SECONDARY_NAV_ANIMATION_DURATION }, () => {
        isAnimating.value = false;
      });
    }
    // Show nav when scrolling up (delta < SCROLL_UP_THRESHOLD)
    else if (delta < SCROLL_UP_THRESHOLD && secondaryNavTranslateY.value !== 0) {
      isAnimating.value = true;
      secondaryNavTranslateY.value = withTiming(0, { duration: SECONDARY_NAV_ANIMATION_DURATION }, () => {
        isAnimating.value = false;
      });
    }

    lastScrollY.value = currentScrollY;
  }, []); // Empty deps array: uses shared values that don't need to be in deps

  /**
   * Animated style for secondary navigation bar.
   * Applies vertical translation (translateY) to hide/show the nav bar on scroll.
   * 
   * Values:
   * - 0: Nav bar visible (default position)
   * - SECONDARY_NAV_HIDE_OFFSET (-100): Nav bar hidden (moved up off screen)
   */
  const secondaryNavAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: secondaryNavTranslateY.value }],
    };
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
          onPress={() => navigation.navigate("ModuleGrid")}
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="View all modules"
        >
          <Feather name="grid" size={24} color={theme.text} />
        </Pressable>

        <Animated.View entering={FadeIn.delay(200)}>
          <ThemedText type="h2">Command Center</ThemedText>
        </Animated.View>

        <Pressable
          onPress={() => navigation.navigate("Settings")}
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
        >
          <Feather name="settings" size={24} color={theme.text} />
        </Pressable>
      </View>

      {/* Secondary Navigation Bar - Transparent oval with buttons, sits above cards */}
      <View 
        style={[
          styles.secondaryNav, 
          { backgroundColor: "transparent" },
        ]}
      >
        <Animated.View
          style={[
            styles.secondaryNavContent,
            {
              backgroundColor: "transparent",
            },
            secondaryNavAnimatedStyle
          ]}
        >
          <Pressable
            onPress={() => navigation.navigate("Omnisearch")}
            style={({ pressed }) => [
              styles.secondaryNavButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Search"
          >
            <Feather name="search" size={20} color={theme.text} />
            <ThemedText type="small">Search</ThemedText>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("AttentionCenter")}
            style={({ pressed }) => [
              styles.secondaryNavButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Attention Center"
          >
            <View>
              <Feather name="bell" size={20} color={theme.text} />
              {attentionCount > 0 && (
                <View
                  style={[
                    styles.secondaryBadge,
                    { backgroundColor: theme.error },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.secondaryBadgeText,
                      { color: theme.backgroundRoot },
                    ]}
                  >
                    {/* Lower threshold due to smaller badge size (14px vs 18px height) */}
                    {attentionCount > SECONDARY_NAV_BADGE_THRESHOLD 
                      ? `${SECONDARY_NAV_BADGE_THRESHOLD}+` 
                      : attentionCount}
                  </ThemedText>
                </View>
              )}
            </View>
            <ThemedText type="small">Attention</ThemedText>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("RecommendationHistory")}
            style={({ pressed }) => [
              styles.secondaryNavButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Command History"
          >
            <Feather name="clock" size={20} color={theme.text} />
            <ThemedText type="small">History</ThemedText>
          </Pressable>
        </Animated.View>
      </View>

      <View style={styles.content}>
        {recommendationPreferences.recommendationsEnabled ? (
          recommendations.length > 0 ? (
            <FlatList
              data={recommendations}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              renderItem={({ item }) => (
                <View style={styles.cardContainer}>
                  <RecommendationCard
                    recommendation={item}
                    onAccept={() => handleAccept(item)}
                    onDecline={() => handleDecline(item)}
                    onPress={() => handleCardPress(item)}
                    showReasoning={recommendationPreferences.recommendationShowReasoning}
                    showEvidence={recommendationPreferences.recommendationShowEvidence}
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
          )
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
              Recommendations Paused
            </ThemedText>
            <ThemedText type="body" secondary style={styles.emptyText}>
              Turn recommendations back on in AI Preferences to see suggestions.
            </ThemedText>
          </Animated.View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <Pressable
            onPress={handleRefreshRecommendations}
            disabled={
              isRefreshing || !recommendationPreferences.recommendationsEnabled
            }
            style={({ pressed }) => [
              styles.refreshButton,
              {
                backgroundColor: recommendationPreferences.recommendationsEnabled
                  ? theme.accentDim
                  : theme.backgroundSecondary,
              },
              pressed && styles.pressed,
              (isRefreshing || !recommendationPreferences.recommendationsEnabled) &&
                styles.refreshButtonDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Refresh Recommendations"
            accessibilityState={{
              disabled:
                isRefreshing || !recommendationPreferences.recommendationsEnabled,
            }}
          >
            <Feather
              name="refresh-cw"
              size={16}
              color={
                recommendationPreferences.recommendationsEnabled
                  ? theme.accent
                  : theme.textMuted
              }
            />
            <ThemedText
              type="small"
              style={{
                color: recommendationPreferences.recommendationsEnabled
                  ? theme.accent
                  : theme.textMuted,
              }}
            >
              {isRefreshing ? "Refreshing..." : "Refresh Recommendations"}
            </ThemedText>
          </Pressable>
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
        </View>
      </View>

      <View style={styles.bottomNavContainer}>
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
    paddingBottom: Spacing.xs, // Reduced from Spacing.md to make header thinner
  },
  headerButton: {
    width: 40, // Reduced from 44 to make header thinner
    height: 40, // Reduced from 44 to make header thinner
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.sm,
  },
  secondaryNav: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs, // Reduced from Spacing.sm to make nav thinner
  },
  secondaryNavContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: Spacing.sm, // Reduced from Spacing.md to make nav thinner
    paddingHorizontal: Spacing.lg, // Reduced from Spacing.xl to make nav thinner
    borderRadius: BorderRadius.full, // Oval/pill shape
  },
  secondaryNavButton: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    minWidth: 60,
  },
  secondaryBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  secondaryBadgeText: {
    fontSize: 9,
    fontWeight: "bold",
    lineHeight: 11,
  },
  pressed: {
    opacity: 0.7,
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing.sm, // Reduced from Spacing.lg for tighter card spacing
  },
  cardSeparator: {
    height: CARD_SPACING, // Very minimal spacing - cards almost stacked
  },
  cardContainer: {
    width: CARD_WIDTH,
    alignSelf: "center",
  },
  cardShadowWrapper: {
    width: CARD_WIDTH,
    borderRadius: BorderRadius.lg,
    // Shadow properties (no overflow hidden so shadow renders)
    // backgroundColor required for iOS shadow rendering (even if transparent)
    shadowOffset: { width: 0, height: 0 },
  },
  card: {
    width: CARD_WIDTH,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    overflow: "hidden", // Clips glow indicators to card bounds
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
    marginBottom: Spacing.md,
  },
  reasoningRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  reasoningText: {
    flex: 1,
  },
  evidenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  evidenceText: {
    flex: 1,
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
    paddingHorizontal: 0, // Remove horizontal padding to extend to edges
  },
  footerContent: {
    paddingHorizontal: Spacing.lg, // Only apply padding to limits container
    gap: Spacing.md,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  refreshButtonDisabled: {
    opacity: 0.6,
  },
  bottomNavContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
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
});
