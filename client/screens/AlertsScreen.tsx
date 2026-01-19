/**
 * AlertsScreen Module
 *
 * Displays a list of alarms and reminders with a real-time digital clock.
 * Features:
 * - Real-time digital clock display with date
 * - Sortable list of alarms and reminders
 * - Visual toggle state for enabled/disabled alerts
 * - Quick access to create new alerts via FAB button
 * - AI assistance integration for smart alert suggestions
 * - Haptic feedback for user interactions
 *
 * @module AlertsScreen
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  Alert as ReactNativeAlert,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { db } from "@/storage/database";
import { Alert } from "@/models/types";
import { formatTime } from "@/utils/helpers";
import { BottomNav } from "@/components/BottomNav";
import AIAssistSheet from "@/components/AIAssistSheet";
import { HeaderLeftNav, HeaderRightNav } from "@/components/HeaderNav";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

/**
 * DigitalClock Component
 *
 * Displays a real-time digital clock with seconds and full date.
 * Updates every second to show current time.
 *
 * @returns {JSX.Element} The digital clock component
 */
function DigitalClock() {
  const { theme } = useTheme();
  const [time, setTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");

  return (
    <View style={styles.clockContainer}>
      <View style={styles.timeDisplay}>
        <ThemedText type="hero" style={styles.clockText}>
          {hours}:{minutes}
        </ThemedText>
        <ThemedText
          type="h2"
          style={[styles.secondsText, { color: theme.textMuted }]}
        >
          :{seconds}
        </ThemedText>
      </View>
      <ThemedText type="body" muted>
        {time.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </ThemedText>
    </View>
  );
}

/**
 * AlertCard Component
 *
 * Displays an individual alert/reminder card with visual indicators.
 * Features:
 * - Icon indicating alert type (bell for alarm, message for reminder)
 * - Title and optional description
 * - Time display with recurrence indicator
 * - Toggle switch showing enabled/disabled state
 * - Staggered animation on list entry
 * - Dimmed appearance when disabled
 * - Selection indicator in bulk mode
 * - Tags display
 *
 * @param {Alert} alert - The alert data to display
 * @param {Function} onPress - Callback when card is pressed
 * @param {Function} onLongPress - Callback when card is long pressed
 * @param {number} index - Index in list (for animation delay)
 * @param {boolean} isSelected - Whether the alert is selected in bulk mode
 * @param {boolean} bulkSelectMode - Whether bulk selection mode is active
 * @returns {JSX.Element} The alert card component
 */
function AlertCard({
  alert,
  onPress,
  onLongPress,
  index,
  isSelected,
  bulkSelectMode,
}: {
  alert: Alert;
  onPress: () => void;
  onLongPress: () => void;
  index: number;
  isSelected: boolean;
  bulkSelectMode: boolean;
}) {
  const { theme } = useTheme();
  const alertTime = formatTime(alert.time);

  return (
    <Animated.View entering={FadeInDown.delay(index * 30).springify()}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [
          styles.alertCard,
          { backgroundColor: theme.backgroundDefault },
          !alert.isEnabled && styles.disabledCard,
          isSelected && { borderColor: theme.accent, borderWidth: 2 },
          pressed && { opacity: 0.8 },
        ]}
      >
        {bulkSelectMode && (
          <View
            style={[
              styles.selectionIndicator,
              {
                backgroundColor: isSelected
                  ? theme.accent
                  : theme.backgroundSecondary,
                borderColor: theme.accent,
              },
            ]}
          >
            {isSelected && (
              <Feather name="check" size={16} color={theme.buttonText} />
            )}
          </View>
        )}
        <View
          style={[
            styles.alertIcon,
            {
              backgroundColor: alert.isEnabled
                ? theme.accentDim
                : theme.backgroundSecondary,
            },
          ]}
        >
          <Feather
            name={alert.type === "alarm" ? "bell" : "message-circle"}
            size={20}
            color={alert.isEnabled ? theme.accent : theme.textMuted}
          />
        </View>
        <View style={styles.alertContent}>
          <ThemedText
            type="body"
            style={[
              { fontWeight: "600" },
              !alert.isEnabled && { opacity: 0.5 },
            ]}
            numberOfLines={1}
          >
            {alert.title}
          </ThemedText>
          {alert.description ? (
            <ThemedText
              type="small"
              muted
              numberOfLines={1}
              style={!alert.isEnabled && { opacity: 0.5 }}
            >
              {alert.description}
            </ThemedText>
          ) : null}
          <View style={styles.alertMeta}>
            <Feather name="clock" size={12} color={theme.textMuted} />
            <ThemedText
              type="small"
              muted
              style={!alert.isEnabled && { opacity: 0.5 }}
            >
              {alertTime}
            </ThemedText>
            {alert.recurrenceRule !== "none" && (
              <>
                <Feather
                  name="repeat"
                  size={12}
                  color={theme.textMuted}
                  style={{ marginLeft: Spacing.md }}
                />
                <ThemedText
                  type="small"
                  muted
                  style={!alert.isEnabled && { opacity: 0.5 }}
                >
                  {alert.recurrenceRule}
                </ThemedText>
              </>
            )}
          </View>
          {alert.tags && alert.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {alert.tags.slice(0, 3).map((tag) => (
                <View
                  key={tag}
                  style={[
                    styles.tagBadge,
                    {
                      backgroundColor: theme.accentDim,
                      borderColor: theme.accent,
                    },
                  ]}
                >
                  <ThemedText
                    type="small"
                    style={{ color: theme.accent, fontSize: 10 }}
                  >
                    {tag}
                  </ThemedText>
                </View>
              ))}
              {alert.tags.length > 3 && (
                <ThemedText type="small" muted>
                  +{alert.tags.length - 3}
                </ThemedText>
              )}
            </View>
          )}
        </View>
        <View style={styles.alertToggle}>
          <View
            style={[
              styles.toggleSwitch,
              {
                backgroundColor: alert.isEnabled
                  ? theme.accent
                  : theme.backgroundSecondary,
              },
            ]}
          >
            <View
              style={[
                styles.toggleThumb,
                { backgroundColor: theme.backgroundDefault },
                alert.isEnabled && styles.toggleThumbActive,
              ]}
            />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

/**
 * AlertsScreen Component
 *
 * Main screen for the Alerts module displaying alarms and reminders.
 * Provides functionality to view, create, and manage alerts with AI assistance.
 *
 * @returns {JSX.Element} The alerts screen component
 */
export default function AlertsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAISheet, setShowAISheet] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());

  /**
   * Load alerts from database sorted by time
   */
  const loadAlerts = useCallback(async () => {
    let data: Alert[];
    if (selectedTag) {
      // getByTag already returns sorted results
      data = await db.alerts.getByTag(selectedTag);
    } else {
      data = await db.alerts.getAllSorted();
    }
    setAlerts(data);
  }, [selectedTag]);

  /**
   * Load all unique tags from alerts
   */
  const loadTags = useCallback(async () => {
    const tags = await db.alerts.getAllTags();
    setAllTags(tags);
  }, []);

  // Reload alerts when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadAlerts();
      loadTags();
    }, [loadAlerts, loadTags]),
  );

  // Configure navigation header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderLeftNav />,
      headerRight: () => (
        <View style={{ flexDirection: "row", gap: Spacing.sm }}>
          {bulkSelectMode && (
            <Pressable
              onPress={() => {
                setBulkSelectMode(false);
                setSelectedAlerts(new Set());
              }}
              style={({ pressed }) => [
                { padding: Spacing.xs, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Feather name="x" size={24} color={theme.text} />
            </Pressable>
          )}
          <HeaderRightNav />
        </View>
      ),
    });
  }, [navigation, theme, bulkSelectMode]);

  /**
   * Navigate to alert creation screen
   */
  const handleCreateAlert = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("AlertDetail", {});
  };

  /**
   * Navigate to alert detail screen for editing or toggle selection in bulk mode
   *
   * @param {string} alertId - ID of the alert to edit or select
   */
  const handleAlertPress = (alertId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (bulkSelectMode) {
      // Toggle selection in bulk mode
      const newSelection = new Set(selectedAlerts);
      if (newSelection.has(alertId)) {
        newSelection.delete(alertId);
      } else {
        newSelection.add(alertId);
      }
      setSelectedAlerts(newSelection);
    } else {
      // Navigate to detail screen normally
      navigation.navigate("AlertDetail", { alertId });
    }
  };

  /**
   * Long press handler to enter bulk select mode
   */
  const handleAlertLongPress = (alertId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setBulkSelectMode(true);
    setSelectedAlerts(new Set([alertId]));
  };

  /**
   * Enable all selected alerts
   */
  const handleEnableSelected = async () => {
    if (selectedAlerts.size === 0) return;
    await db.alerts.toggleMultiple(Array.from(selectedAlerts), true);
    await loadAlerts();
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  /**
   * Disable all selected alerts
   */
  const handleDisableSelected = async () => {
    if (selectedAlerts.size === 0) return;
    await db.alerts.toggleMultiple(Array.from(selectedAlerts), false);
    await loadAlerts();
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  /**
   * Delete all selected alerts
   */
  const handleDeleteSelected = () => {
    if (selectedAlerts.size === 0) return;

    ReactNativeAlert.alert(
      "Delete Alerts",
      `Are you sure you want to delete ${selectedAlerts.size} alert(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await db.alerts.deleteMultiple(Array.from(selectedAlerts));
            setBulkSelectMode(false);
            setSelectedAlerts(new Set());
            await loadAlerts();
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
            }
          },
        },
      ],
    );
  };

  /**
   * Filter alerts by tag
   */
  const handleFilterByTag = (tag: string | null) => {
    setSelectedTag(tag);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  /**
   * Open AI assistance sheet for smart alert suggestions
   */
  const handleAIAssist = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowAISheet(true);
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <DigitalClock />

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <View style={styles.filterSection}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.tagFilterContainer}
                >
                  <Pressable
                    onPress={() => handleFilterByTag(null)}
                    style={[
                      styles.tagFilter,
                      {
                        backgroundColor: !selectedTag
                          ? theme.accent
                          : theme.backgroundSecondary,
                        borderColor: !selectedTag ? theme.accent : theme.border,
                      },
                    ]}
                  >
                    <ThemedText
                      type="small"
                      style={{
                        color: !selectedTag
                          ? theme.buttonText
                          : theme.textMuted,
                      }}
                    >
                      All
                    </ThemedText>
                  </Pressable>
                  {allTags.map((tag) => (
                    <Pressable
                      key={tag}
                      onPress={() => handleFilterByTag(tag)}
                      style={[
                        styles.tagFilter,
                        {
                          backgroundColor:
                            selectedTag === tag
                              ? theme.accent
                              : theme.backgroundSecondary,
                          borderColor:
                            selectedTag === tag ? theme.accent : theme.border,
                        },
                      ]}
                    >
                      <ThemedText
                        type="small"
                        style={{
                          color:
                            selectedTag === tag
                              ? theme.buttonText
                              : theme.textMuted,
                        }}
                      >
                        {tag}
                      </ThemedText>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Section Header with Bulk Selection Toggle */}
            <View style={styles.sectionHeader}>
              <ThemedText type="h3">
                Alarms & Reminders
                {selectedTag && ` • ${selectedTag}`}
              </ThemedText>
              {!bulkSelectMode && alerts.length > 0 && (
                <Pressable
                  onPress={() => setBulkSelectMode(true)}
                  style={({ pressed }) => [
                    { padding: Spacing.xs, opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Feather name="check-square" size={20} color={theme.accent} />
                </Pressable>
              )}
            </View>
          </>
        }
        renderItem={({ item, index }) => (
          <AlertCard
            alert={item}
            onPress={() => handleAlertPress(item.id)}
            onLongPress={() => handleAlertLongPress(item.id)}
            index={index}
            isSelected={selectedAlerts.has(item.id)}
            bulkSelectMode={bulkSelectMode}
          />
        )}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Spacing.md,
            paddingBottom: insets.bottom + Spacing["5xl"],
          },
        ]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="bell-off" size={48} color={theme.textMuted} />
            <ThemedText type="body" muted style={styles.emptyText}>
              {selectedTag
                ? `No alerts with tag "${selectedTag}"`
                : "No alarms or reminders yet"}
            </ThemedText>
            <ThemedText type="small" muted style={styles.emptySubtext}>
              {selectedTag
                ? "Try selecting a different tag"
                : "Tap + to create one or use AI Assist for suggestions"}
            </ThemedText>
          </View>
        }
      />

      {/* Bulk Operations Bar */}
      {bulkSelectMode && selectedAlerts.size > 0 && (
        <View
          style={[
            styles.bulkOperationsBar,
            {
              backgroundColor: theme.backgroundDefault,
              bottom: insets.bottom + Spacing["5xl"],
            },
          ]}
        >
          <ThemedText type="body" style={{ color: theme.accent }}>
            {selectedAlerts.size} selected
          </ThemedText>
          <View style={styles.bulkActions}>
            <Pressable
              onPress={handleEnableSelected}
              style={({ pressed }) => [
                styles.bulkActionButton,
                { backgroundColor: theme.success, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Feather name="check-circle" size={20} color={theme.buttonText} />
              <ThemedText type="small" style={{ color: theme.buttonText }}>
                Enable
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={handleDisableSelected}
              style={({ pressed }) => [
                styles.bulkActionButton,
                { backgroundColor: theme.warning, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Feather name="x-circle" size={20} color={theme.buttonText} />
              <ThemedText type="small" style={{ color: theme.buttonText }}>
                Disable
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={handleDeleteSelected}
              style={({ pressed }) => [
                styles.bulkActionButton,
                { backgroundColor: theme.error, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Feather name="trash-2" size={20} color={theme.buttonText} />
              <ThemedText type="small" style={{ color: theme.buttonText }}>
                Delete
              </ThemedText>
            </Pressable>
          </View>
        </View>
      )}

      <Pressable
        onPress={handleCreateAlert}
        style={[
          styles.fab,
          {
            backgroundColor: theme.accent,
            bottom: insets.bottom + Spacing["5xl"] + Spacing.lg,
            right: Spacing.lg,
          },
        ]}
      >
        <Feather name="plus" size={24} color={theme.buttonText} />
      </Pressable>

      <View style={styles.bottomNavContainer}>
        <BottomNav onAiPress={handleAIAssist} />
      </View>

      <AIAssistSheet
        visible={showAISheet}
        onClose={() => setShowAISheet(false)}
        module="alerts"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  clockContainer: {
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
    marginBottom: Spacing.xl,
  },
  timeDisplay: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: Spacing.sm,
  },
  clockText: {
    fontSize: 64,
    fontWeight: "200",
    letterSpacing: -2,
  },
  secondsText: {
    fontSize: 32,
    fontWeight: "200",
  },
  sectionHeader: {
    marginBottom: Spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterSection: {
    marginBottom: Spacing.md,
  },
  tagFilterContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  tagFilter: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  alertCard: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    alignItems: "center",
    ...Shadows.card,
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  tagsRow: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
    alignItems: "center",
  },
  tagBadge: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
  bulkOperationsBar: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...Shadows.fab,
  },
  bulkActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  bulkActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  disabledCard: {
    opacity: 0.6,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  alertContent: {
    flex: 1,
  },
  alertMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  alertToggle: {
    marginLeft: Spacing.md,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: "center",
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  emptyText: {
    marginTop: Spacing.lg,
    textAlign: "center",
  },
  emptySubtext: {
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.fab,
  },
  bottomNavContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
});
