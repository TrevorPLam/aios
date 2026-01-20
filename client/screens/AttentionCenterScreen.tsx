/**
 * Attention Center Screen
 *
 * Purpose (Plain English):
 * Central hub for viewing all notifications and attention items across 38+ modules.
 * Groups items by priority (urgent/attention/fyi) to help users focus on what matters.
 * Reduces notification overwhelm through intelligent bundling and filtering.
 *
 * Features:
 * - Three-tier priority display (urgent/attention/fyi)
 * - Smart notification bundling
 * - Focus mode toggle
 * - Individual item dismissal
 * - Bundle dismissal
 * - Empty states for each priority level
 * - Action buttons to navigate to source modules
 * - Haptic feedback for interactions
 *
 * @module AttentionCenterScreen
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Switch,
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
import {
  attentionManager,
  AttentionItem,
  AttentionBundle,
  AttentionPriority,
} from "@/lib/attentionManager";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

/**
 * Priority badge colors
 */
const getPriorityColor = (priority: AttentionPriority, theme: any) => {
  switch (priority) {
    case "urgent":
      return theme.error;
    case "attention":
      return theme.warning;
    case "fyi":
      return theme.info;
  }
};

/**
 * Priority icons
 */
const getPriorityIcon = (priority: AttentionPriority) => {
  switch (priority) {
    case "urgent":
      return "alert-circle";
    case "attention":
      return "bell";
    case "fyi":
      return "info";
  }
};

/**
 * Priority section titles
 */
const getPriorityTitle = (priority: AttentionPriority) => {
  switch (priority) {
    case "urgent":
      return "Urgent";
    case "attention":
      return "Needs Attention";
    case "fyi":
      return "FYI";
  }
};

/**
 * Priority section descriptions
 */
const getPriorityDescription = (priority: AttentionPriority) => {
  switch (priority) {
    case "urgent":
      return "Requires action today";
    case "attention":
      return "Needs action this week";
    case "fyi":
      return "Nice to know";
  }
};

/**
 * Attention Item Card Component
 */
function AttentionItemCard({
  item,
  onDismiss,
  onAction,
}: {
  item: AttentionItem;
  onDismiss: (id: string) => void;
  onAction: (item: AttentionItem) => void;
}) {
  const { theme } = useTheme();

  const handleDismiss = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onDismiss(item.id);
  }, [item.id, onDismiss]);

  const handleAction = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onAction(item);
  }, [item, onAction]);

  return (
    <Animated.View entering={FadeInDown.duration(300)}>
      <View
        style={[
          styles.itemCard,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border,
          },
        ]}
      >
        {/* Priority indicator */}
        <View
          style={[
            styles.priorityIndicator,
            { backgroundColor: getPriorityColor(item.priority, theme) },
          ]}
        />

        {/* Content */}
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
            <Pressable onPress={handleDismiss} style={styles.dismissButton}>
              <Feather name="x" size={18} color={theme.textSecondary} />
            </Pressable>
          </View>

          <ThemedText style={styles.itemSummary} numberOfLines={2}>
            {item.summary}
          </ThemedText>

          {/* Action button */}
          {item.actionLabel && (
            <Pressable
              onPress={handleAction}
              style={[
                styles.actionButton,
                {
                  backgroundColor: `${getPriorityColor(item.priority, theme)}15`,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.actionButtonText,
                  { color: getPriorityColor(item.priority, theme) },
                ]}
              >
                {item.actionLabel}
              </ThemedText>
              <Feather
                name="arrow-right"
                size={14}
                color={getPriorityColor(item.priority, theme)}
              />
            </Pressable>
          )}

          {/* Timestamp */}
          <ThemedText style={styles.timestamp}>
            {getRelativeTime(item.createdAt)}
          </ThemedText>
        </View>
      </View>
    </Animated.View>
  );
}

/**
 * Attention Bundle Card Component
 */
function AttentionBundleCard({
  bundle,
  onDismiss,
  onExpand,
}: {
  bundle: AttentionBundle;
  onDismiss: (id: string) => void;
  onExpand: (bundle: AttentionBundle) => void;
}) {
  const { theme } = useTheme();

  const handleDismiss = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onDismiss(bundle.id);
  }, [bundle.id, onDismiss]);

  const handleExpand = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onExpand(bundle);
  }, [bundle, onExpand]);

  return (
    <Animated.View entering={FadeInDown.duration(300)}>
      <Pressable
        onPress={handleExpand}
        style={[
          styles.itemCard,
          styles.bundleCard,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border,
          },
        ]}
      >
        {/* Priority indicator */}
        <View
          style={[
            styles.priorityIndicator,
            { backgroundColor: getPriorityColor(bundle.priority, theme) },
          ]}
        />

        {/* Content */}
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <View style={styles.bundleTitleRow}>
              <Feather
                name="layers"
                size={16}
                color={getPriorityColor(bundle.priority, theme)}
              />
              <ThemedText style={styles.itemTitle}>{bundle.title}</ThemedText>
            </View>
            <Pressable onPress={handleDismiss} style={styles.dismissButton}>
              <Feather name="x" size={18} color={theme.textSecondary} />
            </Pressable>
          </View>

          <ThemedText style={styles.bundleCount}>
            {bundle.items.length} items
          </ThemedText>

          {/* Preview first item */}
          {bundle.items[0] && (
            <ThemedText style={styles.itemSummary} numberOfLines={1}>
              {bundle.items[0].summary}
            </ThemedText>
          )}

          {/* Expand button */}
          <View
            style={[
              styles.actionButton,
              {
                backgroundColor: `${getPriorityColor(bundle.priority, theme)}15`,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.actionButtonText,
                { color: getPriorityColor(bundle.priority, theme) },
              ]}
            >
              View All
            </ThemedText>
            <Feather
              name="chevron-right"
              size={14}
              color={getPriorityColor(bundle.priority, theme)}
            />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

/**
 * Priority Section Component
 */
function PrioritySection({
  priority,
  items,
  bundles,
  onDismissItem,
  onDismissBundle,
  onItemAction,
  onExpandBundle,
  collapsed,
  onToggleCollapse,
}: {
  priority: AttentionPriority;
  items: AttentionItem[];
  bundles: AttentionBundle[];
  onDismissItem: (id: string) => void;
  onDismissBundle: (id: string) => void;
  onItemAction: (item: AttentionItem) => void;
  onExpandBundle: (bundle: AttentionBundle) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const { theme } = useTheme();

  const filteredItems = items.filter((item) => item.priority === priority);
  const filteredBundles = bundles.filter(
    (bundle) => bundle.priority === priority,
  );
  const totalCount = filteredItems.length + filteredBundles.length;

  if (totalCount === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      {/* Section Header */}
      <Pressable onPress={onToggleCollapse} style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Feather
            name={getPriorityIcon(priority) as any}
            size={20}
            color={getPriorityColor(priority, theme)}
          />
          <View style={styles.sectionTitleContainer}>
            <ThemedText style={styles.sectionTitle}>
              {getPriorityTitle(priority)}
            </ThemedText>
            <ThemedText style={styles.sectionDescription}>
              {getPriorityDescription(priority)}
            </ThemedText>
          </View>
        </View>
        <View style={styles.sectionHeaderRight}>
          <View
            style={[
              styles.countBadge,
              { backgroundColor: getPriorityColor(priority, theme) },
            ]}
          >
            <ThemedText style={styles.countBadgeText}>{totalCount}</ThemedText>
          </View>
          <Feather
            name={collapsed ? "chevron-down" : "chevron-up"}
            size={20}
            color={theme.textSecondary}
          />
        </View>
      </Pressable>

      {/* Items */}
      {!collapsed && (
        <View style={styles.sectionContent}>
          {/* Bundles */}
          {filteredBundles.map((bundle) => (
            <AttentionBundleCard
              key={bundle.id}
              bundle={bundle}
              onDismiss={onDismissBundle}
              onExpand={onExpandBundle}
            />
          ))}

          {/* Individual items */}
          {filteredItems.map((item) => (
            <AttentionItemCard
              key={item.id}
              item={item}
              onDismiss={onDismissItem}
              onAction={onItemAction}
            />
          ))}
        </View>
      )}
    </View>
  );
}

/**
 * Attention Center Screen Component
 */
export default function AttentionCenterScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [items, setItems] = useState<AttentionItem[]>([]);
  const [bundles, setBundles] = useState<AttentionBundle[]>([]);
  const [focusMode, setFocusMode] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    urgent: false,
    attention: false,
    fyi: true, // FYI collapsed by default
  });

  // Load items and subscribe to changes
  useEffect(() => {
    const loadItems = () => {
      setItems(attentionManager.getItems());
      setBundles(attentionManager.getBundles());
    };

    loadItems();

    const unsubscribe = attentionManager.subscribe(loadItems);

    return () => unsubscribe();
  }, []);

  // Load focus mode state
  useEffect(() => {
    const mode = attentionManager.getFocusMode();
    setFocusMode(mode.enabled);
  }, []);

  const handleDismissItem = useCallback((id: string) => {
    attentionManager.dismissItem(id);
  }, []);

  const handleDismissBundle = useCallback((id: string) => {
    attentionManager.dismissBundle(id);
  }, []);

  const handleItemAction = useCallback(
    (item: AttentionItem) => {
      if (item.actionTarget) {
        // Navigate to the target module
        // Format: "module/screen/id" or just "module"
        const parts = item.actionTarget.split("/");
        const module = parts[0];

        // Map module names to screen names
        const screenMap: Partial<Record<string, keyof AppStackParamList>> = {
          planner: "Planner",
          calendar: "Calendar",
          notebook: "Notebook",
          messages: "Messages",
          email: "Email",
          budget: "Budget",
          lists: "Lists",
          alerts: "Alerts",
          contacts: "Contacts",
          photos: "Photos",
          translator: "Translator",
          history: "History",
        };

        const screenName = screenMap[module];
        if (screenName) {
          navigation.navigate(screenName);
        }
      }
    },
    [navigation],
  );

  const handleExpandBundle = useCallback(
    (bundle: AttentionBundle) => {
      // For now, just show the first item's action
      // In a full implementation, would show a modal with all items
      if (bundle.items.length > 0) {
        handleItemAction(bundle.items[0]);
      }
    },
    [handleItemAction],
  );

  const handleToggleFocusMode = useCallback((value: boolean) => {
    setFocusMode(value);
    attentionManager.setFocusMode({ enabled: value });

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, []);

  const handleToggleSection = useCallback((priority: AttentionPriority) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [priority]: !prev[priority],
    }));
  }, []);

  const counts = attentionManager.getCounts();
  const totalCount = counts.urgent + counts.attention + counts.fyi;

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + Spacing.md,
            backgroundColor: theme.background,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <View>
            <ThemedText style={styles.headerTitle}>Attention Center</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              {totalCount} {totalCount === 1 ? "item" : "items"}
            </ThemedText>
          </View>

          {/* Focus Mode Toggle */}
          <View style={styles.focusModeContainer}>
            <ThemedText style={styles.focusModeLabel}>Focus</ThemedText>
            <Switch
              value={focusMode}
              onValueChange={handleToggleFocusMode}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={theme.cardBackground}
            />
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
      >
        {totalCount === 0 ? (
          /* Empty State */
          <View style={styles.emptyState}>
            <Feather name="check-circle" size={64} color={theme.success} />
            <ThemedText style={styles.emptyStateTitle}>All Clear!</ThemedText>
            <ThemedText style={styles.emptyStateMessage}>
              You have no pending attention items.
              {focusMode && " Focus mode is active."}
            </ThemedText>
          </View>
        ) : (
          <>
            {/* Urgent Section */}
            <PrioritySection
              priority="urgent"
              items={items}
              bundles={bundles}
              onDismissItem={handleDismissItem}
              onDismissBundle={handleDismissBundle}
              onItemAction={handleItemAction}
              onExpandBundle={handleExpandBundle}
              collapsed={collapsedSections.urgent}
              onToggleCollapse={() => handleToggleSection("urgent")}
            />

            {/* Attention Section */}
            <PrioritySection
              priority="attention"
              items={items}
              bundles={bundles}
              onDismissItem={handleDismissItem}
              onDismissBundle={handleDismissBundle}
              onItemAction={handleItemAction}
              onExpandBundle={handleExpandBundle}
              collapsed={collapsedSections.attention}
              onToggleCollapse={() => handleToggleSection("attention")}
            />

            {/* FYI Section */}
            <PrioritySection
              priority="fyi"
              items={items}
              bundles={bundles}
              onDismissItem={handleDismissItem}
              onDismissBundle={handleDismissBundle}
              onItemAction={handleItemAction}
              onExpandBundle={handleExpandBundle}
              collapsed={collapsedSections.fyi}
              onToggleCollapse={() => handleToggleSection("fyi")}
            />
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

/**
 * Helper: Format relative time
 */
function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: Spacing.xs,
  },
  focusModeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  focusModeLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  sectionDescription: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  sectionHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  countBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    minWidth: 24,
    alignItems: "center",
  },
  countBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  sectionContent: {
    gap: Spacing.md,
  },
  itemCard: {
    flexDirection: "row",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  bundleCard: {
    borderWidth: 2,
  },
  priorityIndicator: {
    width: 4,
  },
  itemContent: {
    flex: 1,
    padding: Spacing.md,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.xs,
  },
  bundleTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  dismissButton: {
    padding: Spacing.xs,
    marginRight: -Spacing.xs,
  },
  itemSummary: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: Spacing.sm,
  },
  bundleCount: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: Spacing.xs,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: Spacing.sm,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["4xl"],
    paddingHorizontal: Spacing.xl,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyStateMessage: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
  },
});
