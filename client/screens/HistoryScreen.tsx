/**
 * HistoryScreen Module
 *
 * Enhanced activity log tracking user actions and AI interactions.
 * Features:
 * - Chronological activity feed with sorting
 * - Type-specific filtering (recommendation, archived, banked, deprecated, system)
 * - Date range filtering (today, this week, this month, all time)
 * - Search functionality across messages
 * - Activity statistics dashboard
 * - Bulk selection and deletion
 * - Export to JSON
 * - Entry detail modal with metadata
 * - Type-specific icons and colors
 * - Formatted timestamps
 * - Clear history functionality
 * - Empty state prompts
 *
 * @module HistoryScreen
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  TextInput,
  ScrollView,
  Modal,
  Platform,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { db } from "@/storage/database";
import { HistoryLogEntry } from "@/models/types";
import { formatDateTime, formatRelativeDate } from "@/utils/helpers";

type DateFilter = "all" | "today" | "week" | "month";
type TypeFilter = HistoryLogEntry["type"] | "all";

interface Statistics {
  totalEntries: number;
  entriesByType: Record<HistoryLogEntry["type"], number>;
  oldestEntry: string | null;
  newestEntry: string | null;
}

function LogEntryCard({
  entry,
  index,
  isSelected,
  onPress,
  onLongPress,
  selectionMode,
}: {
  entry: HistoryLogEntry;
  index: number;
  isSelected: boolean;
  onPress: () => void;
  onLongPress: () => void;
  selectionMode: boolean;
}) {
  const { theme } = useTheme();

  const getTypeIcon = (): keyof typeof Feather.glyphMap => {
    switch (entry.type) {
      case "recommendation":
        return "activity";
      case "archived":
        return "archive";
      case "banked":
        return "bookmark";
      case "deprecated":
        return "trash-2";
      case "system":
      default:
        return "info";
    }
  };

  const getTypeColor = () => {
    switch (entry.type) {
      case "recommendation":
        return theme.accent;
      case "archived":
        return theme.textSecondary;
      case "banked":
        return theme.success;
      case "deprecated":
        return theme.error;
      case "system":
      default:
        return theme.textMuted;
    }
  };

  const getTypeLabel = () => {
    switch (entry.type) {
      case "recommendation":
        return "Recommendation";
      case "archived":
        return "Archived";
      case "banked":
        return "Banked";
      case "deprecated":
        return "Deprecated";
      case "system":
        return "System";
    }
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 20).springify()}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [
          styles.entryCard,
          {
            backgroundColor: theme.backgroundDefault,
            borderColor: isSelected ? theme.accent : "transparent",
            borderWidth: isSelected ? 2 : 0,
          },
          pressed && { opacity: 0.8 },
        ]}
      >
        {selectionMode && (
          <View style={styles.checkboxContainer}>
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: isSelected ? theme.accent : "transparent",
                  borderColor: isSelected ? theme.accent : theme.textMuted,
                },
              ]}
            >
              {isSelected && (
                <Feather name="check" size={16} color={theme.buttonText} />
              )}
            </View>
          </View>
        )}

        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${getTypeColor()}20` },
          ]}
        >
          <Feather name={getTypeIcon()} size={18} color={getTypeColor()} />
        </View>

        <View style={styles.entryContent}>
          <View style={styles.entryHeader}>
            <View
              style={[
                styles.typeBadge,
                { backgroundColor: `${getTypeColor()}30` },
              ]}
            >
              <ThemedText
                type="small"
                style={[styles.typeBadgeText, { color: getTypeColor() }]}
              >
                {getTypeLabel()}
              </ThemedText>
            </View>
            <ThemedText type="small" muted>
              {formatRelativeDate(entry.timestamp)}
            </ThemedText>
          </View>

          <ThemedText type="body" style={styles.entryMessage}>
            {entry.message}
          </ThemedText>

          {entry.metadata && Object.keys(entry.metadata).length > 0 && (
            <View style={styles.metadataIndicator}>
              <Feather name="paperclip" size={12} color={theme.textMuted} />
              <ThemedText type="small" muted>
                Has metadata
              </ThemedText>
            </View>
          )}
        </View>

        <Feather name="chevron-right" size={20} color={theme.textMuted} />
      </Pressable>
    </Animated.View>
  );
}

export default function HistoryScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [allEntries, setAllEntries] = useState<HistoryLogEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<HistoryLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<HistoryLogEntry | null>(
    null,
  );
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadHistory = useCallback(async () => {
    const data = await db.history.getAll();
    setAllEntries(data);
    applyFilters(data, searchQuery, typeFilter, dateFilter);

    // Load statistics
    const stats = await db.history.getStatistics();
    setStatistics(stats);
  }, []);

  const applyFilters = useCallback(
    (
      entries: HistoryLogEntry[],
      search: string,
      type: TypeFilter,
      date: DateFilter,
    ) => {
      let filtered = [...entries];

      // Apply type filter
      if (type !== "all") {
        filtered = filtered.filter((entry) => entry.type === type);
      }

      // Apply date filter
      if (date !== "all") {
        const now = new Date();
        let startDate: Date;

        switch (date) {
          case "today":
            startDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              0,
              0,
              0,
              0,
            );
            break;
          case "week":
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "month":
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        }

        filtered = filtered.filter(
          (entry) => new Date(entry.timestamp) >= startDate!,
        );
      }

      // Apply search filter
      if (search.trim()) {
        filtered = filtered.filter(
          (entry) =>
            entry.message.toLowerCase().includes(search.toLowerCase()) ||
            entry.type.toLowerCase().includes(search.toLowerCase()),
        );
      }

      setFilteredEntries(filtered);
    },
    [],
  );

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    applyFilters(allEntries, searchQuery, typeFilter, dateFilter);
  }, [allEntries, searchQuery, typeFilter, dateFilter]);

  const handleClearHistory = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    Alert.alert(
      "Clear History",
      "Are you sure you want to clear all history entries? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            await db.history.clear();
            setAllEntries([]);
            setFilteredEntries([]);
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
            }
          },
        },
      ],
    );
  }, []);

  const handleExport = useCallback(async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      const json = await db.history.exportToJSON();

      if (Platform.OS === "web") {
        // For web, create a download link
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `history_${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // For mobile, use Share API
        await Share.share({
          message: json,
          title: "History Export",
        });
      }

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Alert.alert("Export Failed", "Could not export history data");
    }
  }, []);

  const handleEntryPress = useCallback(
    (entry: HistoryLogEntry) => {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      if (selectionMode) {
        toggleSelection(entry.id);
      } else {
        setSelectedEntry(entry);
      }
    },
    [selectionMode],
  );

  const handleEntryLongPress = useCallback((entry: HistoryLogEntry) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setSelectionMode(true);
    setSelectedIds(new Set([entry.id]));
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    Alert.alert(
      "Delete Selected",
      `Are you sure you want to delete ${selectedIds.size} ${selectedIds.size === 1 ? "entry" : "entries"}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await db.history.deleteMultiple(Array.from(selectedIds));
            setSelectionMode(false);
            setSelectedIds(new Set());
            await loadHistory();
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
            }
          },
        },
      ],
    );
  }, [selectedIds, loadHistory]);

  const cancelSelection = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const selectAll = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedIds(new Set(filteredEntries.map((e) => e.id)));
  }, [filteredEntries]);

  React.useLayoutEffect(() => {
    if (selectionMode) {
      navigation.setOptions({
        headerLeft: () => (
          <Pressable
            onPress={cancelSelection}
            style={({ pressed }) => [
              styles.headerButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Feather name="x" size={20} color={theme.text} />
          </Pressable>
        ),
        headerRight: () => (
          <View style={styles.headerActions}>
            <Pressable
              onPress={selectAll}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Feather name="check-square" size={20} color={theme.accent} />
            </Pressable>
            <Pressable
              onPress={handleDeleteSelected}
              disabled={selectedIds.size === 0}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && { opacity: 0.7 },
                selectedIds.size === 0 && { opacity: 0.3 },
              ]}
            >
              <Feather name="trash-2" size={20} color={theme.error} />
            </Pressable>
          </View>
        ),
      });
    } else {
      navigation.setOptions({
        headerLeft: undefined,
        headerRight: () => (
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => setShowStats(!showStats)}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Feather name="bar-chart-2" size={20} color={theme.accent} />
            </Pressable>
            <Pressable
              onPress={handleExport}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Feather name="download" size={20} color={theme.accent} />
            </Pressable>
            <Pressable
              onPress={handleClearHistory}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Feather name="trash-2" size={20} color={theme.error} />
            </Pressable>
          </View>
        ),
      });
    }
  }, [
    navigation,
    theme,
    handleClearHistory,
    handleExport,
    selectionMode,
    selectedIds,
    cancelSelection,
    selectAll,
    handleDeleteSelected,
    showStats,
  ]);

  const renderEntry = ({
    item,
    index,
  }: {
    item: HistoryLogEntry;
    index: number;
  }) => (
    <LogEntryCard
      entry={item}
      index={index}
      isSelected={selectedIds.has(item.id)}
      onPress={() => handleEntryPress(item)}
      onLongPress={() => handleEntryLongPress(item)}
      selectionMode={selectionMode}
    />
  );

  const renderTypeFilter = (
    type: TypeFilter,
    label: string,
    icon: keyof typeof Feather.glyphMap,
  ) => (
    <Pressable
      onPress={() => {
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        setTypeFilter(type);
      }}
      style={({ pressed }) => [
        styles.filterChip,
        {
          backgroundColor:
            typeFilter === type ? theme.accent : theme.backgroundDefault,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Feather
        name={icon}
        size={16}
        color={typeFilter === type ? theme.buttonText : theme.text}
      />
      <ThemedText
        type="small"
        style={{
          color: typeFilter === type ? theme.buttonText : theme.text,
          fontWeight: "600",
        }}
      >
        {label}
      </ThemedText>
    </Pressable>
  );

  const renderDateFilter = (date: DateFilter, label: string) => (
    <Pressable
      onPress={() => {
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        setDateFilter(date);
      }}
      style={({ pressed }) => [
        styles.filterChip,
        {
          backgroundColor:
            dateFilter === date ? theme.accent : theme.backgroundDefault,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <ThemedText
        type="small"
        style={{
          color: dateFilter === date ? theme.buttonText : theme.text,
          fontWeight: "600",
        }}
      >
        {label}
      </ThemedText>
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Statistics Panel */}
      {showStats && statistics && (
        <Animated.View
          entering={FadeInDown.springify()}
          style={[
            styles.statsPanel,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText type="h2" style={{ color: theme.accent }}>
                {statistics.totalEntries}
              </ThemedText>
              <ThemedText type="small" muted>
                Total
              </ThemedText>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <ThemedText type="h2" style={{ color: theme.success }}>
                {statistics.entriesByType.recommendation}
              </ThemedText>
              <ThemedText type="small" muted>
                AI Actions
              </ThemedText>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <ThemedText type="h2" style={{ color: theme.textMuted }}>
                {statistics.entriesByType.system}
              </ThemedText>
              <ThemedText type="small" muted>
                System
              </ThemedText>
            </View>
          </View>

          {statistics.oldestEntry && (
            <View style={styles.statsFooter}>
              <ThemedText type="small" muted>
                Tracking since {formatRelativeDate(statistics.oldestEntry)}
              </ThemedText>
            </View>
          )}
        </Animated.View>
      )}

      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.backgroundDefault },
        ]}
      >
        <Feather name="search" size={20} color={theme.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search history..."
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setSearchQuery("");
            }}
          >
            <Feather name="x" size={20} color={theme.textMuted} />
          </Pressable>
        )}
        <Pressable
          onPress={() => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            setShowFilters(!showFilters);
          }}
          style={({ pressed }) => [
            styles.filterButton,
            {
              backgroundColor: showFilters
                ? theme.accentDim
                : theme.backgroundSecondary,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Feather
            name="filter"
            size={18}
            color={showFilters ? theme.accent : theme.text}
          />
        </Pressable>
      </View>

      {/* Filters */}
      {showFilters && (
        <Animated.View
          entering={FadeInDown.springify()}
          style={styles.filtersContainer}
        >
          <View style={styles.filterSection}>
            <ThemedText type="small" muted style={styles.filterLabel}>
              Type
            </ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              {renderTypeFilter("all", "All", "grid")}
              {renderTypeFilter("recommendation", "AI", "activity")}
              {renderTypeFilter("archived", "Archived", "archive")}
              {renderTypeFilter("banked", "Banked", "bookmark")}
              {renderTypeFilter("deprecated", "Deprecated", "trash-2")}
              {renderTypeFilter("system", "System", "info")}
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <ThemedText type="small" muted style={styles.filterLabel}>
              Date
            </ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              {renderDateFilter("all", "All Time")}
              {renderDateFilter("today", "Today")}
              {renderDateFilter("week", "This Week")}
              {renderDateFilter("month", "This Month")}
            </ScrollView>
          </View>
        </Animated.View>
      )}

      {/* Selection Mode Header */}
      {selectionMode && (
        <View
          style={[
            styles.selectionHeader,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <ThemedText type="body" style={{ color: theme.accent }}>
            {selectedIds.size} selected
          </ThemedText>
        </View>
      )}

      {/* Entries List */}
      <FlatList
        data={filteredEntries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: Spacing.md,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="clock" size={48} color={theme.textMuted} />
            <ThemedText type="h3" style={styles.emptyTitle}>
              {searchQuery || typeFilter !== "all" || dateFilter !== "all"
                ? "No matching entries"
                : "No History"}
            </ThemedText>
            <ThemedText type="body" secondary style={styles.emptyText}>
              {searchQuery || typeFilter !== "all" || dateFilter !== "all"
                ? "Try adjusting your filters"
                : "Your activity will appear here"}
            </ThemedText>
          </View>
        }
      />

      {/* Entry Detail Modal */}
      <Modal
        visible={selectedEntry !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedEntry(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelectedEntry(null)}
        >
          <Pressable
            style={[styles.modalContent, { backgroundColor: theme.background }]}
            onPress={(e) => e.stopPropagation()}
          >
            {selectedEntry && (
              <>
                <View style={styles.modalHeader}>
                  <ThemedText type="h2">Entry Details</ThemedText>
                  <Pressable
                    onPress={() => setSelectedEntry(null)}
                    style={({ pressed }) => [
                      styles.modalClose,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Feather name="x" size={24} color={theme.text} />
                  </Pressable>
                </View>

                <ScrollView
                  style={styles.modalBody}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.detailSection}>
                    <ThemedText type="small" muted>
                      Type
                    </ThemedText>
                    <ThemedText type="body" style={styles.detailValue}>
                      {selectedEntry.type.charAt(0).toUpperCase() +
                        selectedEntry.type.slice(1)}
                    </ThemedText>
                  </View>

                  <View style={styles.detailSection}>
                    <ThemedText type="small" muted>
                      Message
                    </ThemedText>
                    <ThemedText type="body" style={styles.detailValue}>
                      {selectedEntry.message}
                    </ThemedText>
                  </View>

                  <View style={styles.detailSection}>
                    <ThemedText type="small" muted>
                      Timestamp
                    </ThemedText>
                    <ThemedText type="body" style={styles.detailValue}>
                      {formatDateTime(selectedEntry.timestamp)}
                    </ThemedText>
                  </View>

                  {selectedEntry.metadata &&
                    Object.keys(selectedEntry.metadata).length > 0 && (
                      <View style={styles.detailSection}>
                        <ThemedText type="small" muted>
                          Metadata
                        </ThemedText>
                        <View
                          style={[
                            styles.metadataBox,
                            { backgroundColor: theme.backgroundDefault },
                          ]}
                        >
                          <ThemedText
                            type="small"
                            style={[
                              styles.metadataText,
                              { fontFamily: "monospace" },
                            ]}
                          >
                            {JSON.stringify(selectedEntry.metadata, null, 2)}
                          </ThemedText>
                        </View>
                      </View>
                    )}

                  <Pressable
                    onPress={async () => {
                      if (Platform.OS !== "web") {
                        Haptics.notificationAsync(
                          Haptics.NotificationFeedbackType.Warning,
                        );
                      }

                      Alert.alert(
                        "Delete Entry",
                        "Are you sure you want to delete this entry?",
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Delete",
                            style: "destructive",
                            onPress: async () => {
                              await db.history.deleteById(selectedEntry.id);
                              setSelectedEntry(null);
                              await loadHistory();
                              if (Platform.OS !== "web") {
                                Haptics.notificationAsync(
                                  Haptics.NotificationFeedbackType.Success,
                                );
                              }
                            },
                          },
                        ],
                      );
                    }}
                    style={({ pressed }) => [
                      styles.deleteButton,
                      { backgroundColor: theme.error },
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Feather
                      name="trash-2"
                      size={18}
                      color={theme.buttonText}
                    />
                    <ThemedText
                      type="body"
                      style={[
                        styles.deleteButtonText,
                        { color: theme.buttonText },
                      ]}
                    >
                      Delete Entry
                    </ThemedText>
                  </Pressable>
                </ScrollView>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    padding: Spacing.xs,
  },
  headerActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  statsPanel: {
    margin: Spacing.lg,
    marginBottom: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.card,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  statsFooter: {
    marginTop: Spacing.md,
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadows.card,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  filtersContainer: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  filterSection: {
    gap: Spacing.xs,
  },
  filterLabel: {
    marginLeft: Spacing.xs,
    fontWeight: "600",
  },
  filterScroll: {
    gap: Spacing.sm,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    ...Shadows.card,
  },
  selectionHeader: {
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  entryCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
    ...Shadows.card,
  },
  checkboxContainer: {
    marginRight: Spacing.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.xs,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  entryContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  entryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  typeBadgeText: {
    fontWeight: "600",
  },
  entryMessage: {
    lineHeight: 20,
  },
  metadataIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: Spacing["5xl"],
    paddingHorizontal: Spacing["2xl"],
  },
  emptyTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: "80%",
    ...Shadows.glow,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  modalClose: {
    padding: Spacing.xs,
  },
  modalBody: {
    padding: Spacing.lg,
  },
  detailSection: {
    marginBottom: Spacing.lg,
  },
  detailValue: {
    marginTop: Spacing.xs,
  },
  metadataBox: {
    marginTop: Spacing.xs,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  metadataText: {
    lineHeight: 18,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  deleteButtonText: {
    fontWeight: "600",
  },
});
