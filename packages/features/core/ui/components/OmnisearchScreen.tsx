/**
 * Omnisearch Screen
 *
 * Purpose (Plain English):
 * Universal search that searches everything in your app. Type once, see results
 * from all modules (Notes, Tasks, Events, Contacts, etc.) grouped by type.
 * No need to remember where you saved something.
 *
 * What it interacts with:
 * - Omnisearch engine (to perform searches)
 * - Module registry (to get module info)
 * - Navigation (to open search results)
 * - Recent searches storage
 *
 * Technical Implementation:
 * Debounced search input triggers omnisearch engine. Results grouped by module
 * and displayed in sections. Tapping result navigates to that item.
 *
 * Safe AI Extension Points:
 * - Add search filters (date range, module type)
 * - Add search suggestions
 * - Add voice search
 *
 * Fragile Logic Warnings:
 * - Search must be fast (<500ms) or show loading state
 * - Empty results must be handled gracefully
 * - Navigation must work for all result types
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@aios/ui/components/ThemedText";
import { ThemedView } from "@aios/ui/components/ThemedView";
import { useTheme } from "@aios/ui/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@aios/ui/constants/theme";
import {
  omnisearch,
  GroupedSearchResults,
  SearchResultGroup,
  SearchResultItem,
} from "@aios/features/core/domain/omnisearch";
import { moduleRegistry } from "@aios/features/core/domain/moduleRegistry";
import { eventBus, EVENT_TYPES } from "@aios/platform/lib/eventBus";

export interface OmnisearchScreenProps {
  onResultPress: (moduleId: string, routeName: string, itemId: string) => void;
  onClose: () => void;
}

/**
 * Omnisearch Screen Component
 */
export function OmnisearchScreen({
  onResultPress,
  onClose,
}: OmnisearchScreenProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GroupedSearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  /**
   * Load Recent Searches
   */
  useEffect(() => {
    const recent = omnisearch.getRecentSearches();
    setRecentSearches(recent.map((s) => s.query));
  }, []);

  /**
   * Perform Search
   */
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(null);
      return;
    }

    setIsSearching(true);

    try {
      const searchResults = await omnisearch.search(searchQuery, {
        maxResultsPerModule: 5,
        minRelevanceScore: 30,
      });

      setResults(searchResults);

      // Track search
      eventBus.emit(EVENT_TYPES.SEARCH_PERFORMED, {
        query: searchQuery,
        resultCount: searchResults.totalResults,
        searchTime: searchResults.searchTime,
      });
    } catch (error) {
      console.error("Search error:", error);
      setResults(null);
    } finally {
      setIsSearching(false);
    }
  }, []);

  /**
   * Debounced Search Effect
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  /**
   * Handle Result Press
   */
  const handleResultPress = (item: SearchResultItem) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const module = moduleRegistry.getModule(item.moduleType);
    if (module) {
      onResultPress(module.id, module.routeName, item.id);
    }
  };

  /**
   * Handle Recent Search Press
   */
  const handleRecentPress = (recentQuery: string) => {
    setQuery(recentQuery);
  };

  /**
   * Render Result Item
   */
  const renderResultItem = ({ item }: { item: SearchResultItem }) => {
    const module = moduleRegistry.getModule(item.moduleType);

    return (
      <Animated.View entering={FadeInDown.delay(50)}>
        <Pressable
          onPress={() => handleResultPress(item)}
          focusable
          style={({ pressed, focused }) => [
            styles.resultItem,
            styles.focusRingBase,
            { backgroundColor: theme.backgroundTertiary },
            pressed && styles.resultItemPressed,
            focused && { borderColor: theme.accent },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Open ${item.title} in ${module?.name}`}
        >
          {/* Module Icon */}
          <View
            style={[styles.resultIcon, { backgroundColor: theme.accentDim }]}
          >
            <Feather
              name={(module?.icon as any) || "file"}
              size={18}
              color={theme.accent}
            />
          </View>

          {/* Content */}
          <View style={styles.resultContent}>
            <ThemedText style={styles.resultTitle} numberOfLines={1}>
              {item.title}
            </ThemedText>

            {item.subtitle && (
              <ThemedText
                style={[styles.resultSubtitle, { color: theme.textSecondary }]}
                numberOfLines={1}
              >
                {item.subtitle}
              </ThemedText>
            )}

            {item.preview && (
              <ThemedText
                style={[styles.resultPreview, { color: theme.textMuted }]}
                numberOfLines={2}
              >
                {item.preview}
              </ThemedText>
            )}
          </View>

          {/* Chevron */}
          <Feather name="chevron-right" size={18} color={theme.textMuted} />
        </Pressable>
      </Animated.View>
    );
  };

  /**
   * Render Group Header
   */
  const renderGroupHeader = (group: SearchResultGroup) => {
    const module = moduleRegistry.getModule(group.moduleType);

    return (
      <View
        style={[
          styles.groupHeader,
          { backgroundColor: theme.backgroundSecondary },
        ]}
      >
        <View style={styles.groupHeaderContent}>
          <Feather
            name={(module?.icon as any) || "folder"}
            size={16}
            color={theme.accent}
          />
          <ThemedText style={[styles.groupTitle, { color: theme.accent }]}>
            {group.moduleName}
          </ThemedText>
        </View>
        <ThemedText style={[styles.groupCount, { color: theme.textMuted }]}>
          {group.totalCount} {group.totalCount === 1 ? "result" : "results"}
        </ThemedText>
      </View>
    );
  };

  /**
   * Render Search Results
   */
  const renderSearchResults = () => {
    if (!results) return null;

    if (results.totalResults === 0) {
      return (
        <Animated.View entering={FadeIn} style={styles.emptyState}>
          <Feather name="search" size={48} color={theme.textMuted} />
          <ThemedText style={[styles.emptyText, { color: theme.textMuted }]}>
            No results found for "{query}"
          </ThemedText>
          <ThemedText style={[styles.emptyHint, { color: theme.textMuted }]}>
            Try a different search term
          </ThemedText>
        </Animated.View>
      );
    }

    return (
      <FlatList
        data={results.groups}
        keyExtractor={(item) => item.moduleType}
        renderItem={({ item: group }) => (
          <View style={styles.group}>
            {renderGroupHeader(group)}
            {group.results.map((result) => (
              <View key={result.id}>{renderResultItem({ item: result })}</View>
            ))}
          </View>
        )}
        contentContainerStyle={styles.resultsContainer}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  /**
   * Render Recent Searches
   */
  const renderRecentSearches = () => {
    if (recentSearches.length === 0) return null;

    return (
      <View style={styles.recentSection}>
        <ThemedText
          style={[styles.recentTitle, { color: theme.textSecondary }]}
        >
          Recent Searches
        </ThemedText>
        {recentSearches.map((recent, index) => (
          <Pressable
            key={index}
            onPress={() => handleRecentPress(recent)}
            focusable
            style={({ pressed, focused }) => [
              styles.recentItem,
              styles.focusRingBase,
              { backgroundColor: theme.backgroundTertiary },
              pressed && styles.resultItemPressed,
              focused && { borderColor: theme.accent },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Search for ${recent}`}
          >
            <Feather name="clock" size={16} color={theme.textMuted} />
            <ThemedText style={styles.recentText}>{recent}</ThemedText>
            <Feather name="arrow-up-left" size={16} color={theme.textMuted} />
          </Pressable>
        ))}
      </View>
    );
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        {/* Search Input */}
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme.backgroundTertiary },
          ]}
        >
          <Feather name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search everything..."
            placeholderTextColor={theme.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
            accessibilityLabel="Search input"
            accessibilityRole="search"
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => setQuery("")}
              focusable
              style={({ focused }) => [
                styles.clearButton,
                styles.focusRingBase,
                focused && { borderColor: theme.accent },
              ]}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Feather name="x" size={20} color={theme.textSecondary} />
            </Pressable>
          )}
        </View>

        {/* Close Button */}
        <Pressable
          onPress={onClose}
          focusable
          style={({ focused }) => [
            styles.closeButton,
            styles.focusRingBase,
            focused && { borderColor: theme.accent },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Close search"
        >
          <ThemedText style={{ color: theme.accent }}>Cancel</ThemedText>
        </Pressable>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {isSearching && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.accent} />
            <ThemedText
              style={[styles.loadingText, { color: theme.textMuted }]}
            >
              Searching...
            </ThemedText>
          </View>
        )}

        {!isSearching && !query && renderRecentSearches()}
        {!isSearching && query && renderSearchResults()}
      </View>

      {/* Search Stats */}
      {results && results.totalResults > 0 && (
        <View
          style={[
            styles.statsBar,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <ThemedText style={[styles.statsText, { color: theme.textMuted }]}>
            Found {results.totalResults} results in {results.searchTime}ms
          </ThemedText>
        </View>
      )}
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
  },
  closeButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  clearButton: {
    borderRadius: BorderRadius.sm,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 14,
  },
  recentSection: {
    padding: Spacing.md,
  },
  recentTitle: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  recentText: {
    flex: 1,
    fontSize: 15,
  },
  resultsContainer: {
    padding: Spacing.md,
  },
  group: {
    marginBottom: Spacing.lg,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  groupHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  groupCount: {
    fontSize: 12,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  focusRingBase: {
    borderWidth: 2,
    borderColor: "transparent",
  },
  resultItemPressed: {
    opacity: 0.7,
  },
  resultIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  resultContent: {
    flex: 1,
    gap: 2,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: "500",
  },
  resultSubtitle: {
    fontSize: 13,
  },
  resultPreview: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  emptyHint: {
    fontSize: 14,
    textAlign: "center",
  },
  statsBar: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: "center",
  },
  statsText: {
    fontSize: 12,
  },
});
