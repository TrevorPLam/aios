/**
 * HistoryScreen Module
 *
 * Activity log tracking user actions and AI interactions.
 * Features:
 * - Chronological activity feed
 * - Type-specific icons (recommendation, archived, error, etc.)
 * - Formatted timestamps
 * - Metadata display for context
 * - Clear history functionality
 * - Empty state prompts
 *
 * @module HistoryScreen
 */

import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { db } from "@/storage/database";
import { HistoryLogEntry } from "@/models/types";
import { formatDateTime } from "@/utils/helpers";

function LogEntryCard({
  entry,
  index,
}: {
  entry: HistoryLogEntry;
  index: number;
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

  return (
    <Animated.View entering={FadeInDown.delay(index * 30).springify()}>
      <View
        style={[styles.entryCard, { backgroundColor: theme.backgroundDefault }]}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${getTypeColor()}20` },
          ]}
        >
          <Feather name={getTypeIcon()} size={18} color={getTypeColor()} />
        </View>
        <View style={styles.entryContent}>
          <ThemedText type="body" style={styles.entryMessage}>
            {entry.message}
          </ThemedText>
          <ThemedText type="small" muted>
            {formatDateTime(entry.timestamp)}
          </ThemedText>
        </View>
      </View>
    </Animated.View>
  );
}

export default function HistoryScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [entries, setEntries] = useState<HistoryLogEntry[]>([]);

  const loadHistory = useCallback(async () => {
    const data = await db.history.getAll();
    setEntries(data);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleClearHistory = useCallback(() => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to clear all history entries?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await db.history.clear();
            setEntries([]);
          },
        },
      ],
    );
  }, []);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={handleClearHistory}
          style={({ pressed }) => [
            styles.headerButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Feather name="trash-2" size={20} color={theme.error} />
        </Pressable>
      ),
    });
  }, [navigation, theme, handleClearHistory]);

  const renderEntry = ({
    item,
    index,
  }: {
    item: HistoryLogEntry;
    index: number;
  }) => <LogEntryCard entry={item} index={index} />;

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={entries}
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
              No History
            </ThemedText>
            <ThemedText type="body" secondary style={styles.emptyText}>
              Your activity will appear here
            </ThemedText>
          </View>
        }
      />
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
  listContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  entryCard: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
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
    gap: 4,
  },
  entryMessage: {
    lineHeight: 20,
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
});
