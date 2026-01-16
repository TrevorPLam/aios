/**
 * ListsScreen Module
 *
 * Enhanced checklist management with advanced features.
 * Features:
 * - Multiple checklists with customizable names and colors
 * - Item completion tracking with priorities and due dates
 * - Progress indicators and statistics
 * - Categories and templates for quick list creation
 * - List archiving and duplication
 * - Filtering by category and archive status
 * - AI assistance for list suggestions
 * - Haptic feedback for interactions
 *
 * @module ListsScreen
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  Platform,
  ScrollView,
  Alert,
  TextInput,
  Modal,
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
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { db } from "@/storage/database";
import { List, ListCategory } from "@/models/types";
import { formatRelativeDate } from "@/utils/helpers";
import { BottomNav } from "@/components/BottomNav";
import AIAssistSheet from "@/components/AIAssistSheet";
import { HeaderLeftNav, HeaderRightNav } from "@/components/HeaderNav";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

type FilterType = "all" | "active" | "archived" | "templates";
type SortOption =
  | "recent"
  | "alphabetical"
  | "priority"
  | "completion"
  | "itemCount";

interface AdvancedFilters {
  categories: string[];
  hasHighPriority: boolean;
  hasOverdue: boolean;
  hasIncomplete: boolean;
}

interface EnhancedStats {
  total: number;
  active: number;
  archived: number;
  templates: number;
  byCategory: Record<string, number>;
  totalItems: number;
  completedItems: number;
  pendingItems: number;
  highPriorityItems: number;
  overdueItems: number;
  itemsWithNotes: number;
  completionRate: number;
}

const CATEGORY_LABELS: Record<ListCategory, string> = {
  general: "General",
  grocery: "Grocery",
  shopping: "Shopping",
  travel: "Travel",
  work: "Work",
  home: "Home",
  personal: "Personal",
};

const CATEGORY_ICONS: Record<ListCategory, string> = {
  general: "list",
  grocery: "shopping-cart",
  shopping: "shopping-bag",
  travel: "map",
  work: "briefcase",
  home: "home",
  personal: "user",
};

function ListCard({
  list,
  onPress,
  onDuplicate,
  onArchive,
  onLongPress,
  index,
  isSelected,
  selectionMode,
}: {
  list: List;
  onPress: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onLongPress: () => void;
  index: number;
  isSelected: boolean;
  selectionMode: boolean;
}) {
  const { theme } = useTheme();
  const [showActions, setShowActions] = useState(false);
  const checkedCount = list.items.filter((item) => item.isChecked).length;
  const totalCount = list.items.length;
  const progressPercent =
    totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  // Count priority items
  const highPriorityCount = list.items.filter(
    (item) => item.priority === "high" && !item.isChecked,
  ).length;

  const handleLongPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (!selectionMode) {
      onLongPress();
    } else {
      setShowActions(!showActions);
    }
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <Pressable
        onPress={onPress}
        onLongPress={handleLongPress}
        style={({ pressed }) => [
          styles.listCard,
          {
            backgroundColor: theme.backgroundDefault,
            borderLeftWidth: 4,
            borderLeftColor: list.color || theme.accent,
            borderWidth: selectionMode ? 2 : 0,
            borderColor: isSelected ? theme.accent : "transparent",
          },
          pressed && { opacity: 0.8 },
        ]}
      >
        <View style={styles.listHeader}>
          <View style={styles.listTitleRow}>
            {list.category && (
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: theme.accentDim },
                ]}
              >
                <Feather
                  name={CATEGORY_ICONS[list.category] as any}
                  size={12}
                  color={theme.accent}
                />
                <ThemedText type="small" style={styles.categoryText}>
                  {CATEGORY_LABELS[list.category]}
                </ThemedText>
              </View>
            )}
            {list.isTemplate && (
              <View
                style={[
                  styles.templateBadge,
                  { backgroundColor: theme.accentDim },
                ]}
              >
                <Feather name="copy" size={12} color={theme.accent} />
                <ThemedText type="small" style={styles.categoryText}>
                  Template
                </ThemedText>
              </View>
            )}
            {list.isArchived && (
              <View
                style={[
                  styles.archivedBadge,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              >
                <Feather name="archive" size={12} color={theme.textMuted} />
                <ThemedText type="small" muted>
                  Archived
                </ThemedText>
              </View>
            )}
          </View>
          <View style={styles.listTitleContainer}>
            <ThemedText type="h3" style={styles.listTitle} numberOfLines={1}>
              {list.title}
            </ThemedText>
            {selectionMode && (
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: isSelected
                      ? theme.accent
                      : theme.backgroundSecondary,
                    borderColor: isSelected ? theme.accent : theme.textMuted,
                  },
                ]}
              >
                {isSelected && (
                  <Feather name="check" size={14} color={theme.buttonText} />
                )}
              </View>
            )}
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: list.color || theme.accent,
                  width: `${progressPercent}%`,
                },
              ]}
            />
          </View>
          <View style={styles.statsRow}>
            <ThemedText type="small" muted>
              {checkedCount}/{totalCount} completed
            </ThemedText>
            {highPriorityCount > 0 && (
              <View style={styles.priorityIndicator}>
                <Feather name="alert-circle" size={14} color={theme.error} />
                <ThemedText type="small" style={{ color: theme.error }}>
                  {highPriorityCount} urgent
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        <View style={styles.listMeta}>
          <ThemedText type="small" muted>
            {formatRelativeDate(list.lastOpenedAt)}
          </ThemedText>
        </View>

        {showActions && !selectionMode && (
          <View
            style={[
              styles.actionsRow,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <Pressable
              style={styles.actionButton}
              onPress={() => {
                setShowActions(false);
                onDuplicate();
              }}
            >
              <Feather name="copy" size={18} color={theme.accent} />
              <ThemedText type="small">Duplicate</ThemedText>
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => {
                setShowActions(false);
                onArchive();
              }}
            >
              <Feather
                name={list.isArchived ? "inbox" : "archive"}
                size={18}
                color={theme.textSecondary}
              />
              <ThemedText type="small">
                {list.isArchived ? "Unarchive" : "Archive"}
              </ThemedText>
            </Pressable>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function ListsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [lists, setLists] = useState<List[]>([]);
  const [filter, setFilter] = useState<FilterType>("active");
  const [showAISheet, setShowAISheet] = useState(false);
  const [stats, setStats] = useState<EnhancedStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    categories: [],
    hasHighPriority: false,
    hasOverdue: false,
    hasIncomplete: false,
  });
  const [showStatsExpanded, setShowStatsExpanded] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedLists, setSelectedLists] = useState<Set<string>>(new Set());
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  /**
   * Load lists based on current filter tab
   */
  const loadLists = useCallback(async () => {
    let data: List[];
    switch (filter) {
      case "active":
        data = await db.lists.getActive();
        break;
      case "archived":
        data = await db.lists.getArchived();
        break;
      case "templates":
        data = await db.lists.getTemplates();
        break;
      default:
        data = await db.lists.getAllSorted();
    }

    setLists(data);

    // Load enhanced stats
    const statsData = await db.lists.getEnhancedStats();
    setStats(statsData);
  }, [filter]);

  useEffect(() => {
    loadLists();
  }, [filter, loadLists]);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadLists);
    return unsubscribe;
  }, [navigation, loadLists]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderLeftNav />,
      headerRight: () => <HeaderRightNav />,
    });
  }, [navigation, theme]);

  /**
   * Filter and sort lists based on search, sort, and advanced filters
   */
  const filteredAndSortedLists = useMemo(() => {
    let filtered = [...lists];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((list) => {
        // Search in title
        if (list.title.toLowerCase().includes(query)) {
          return true;
        }
        // Search in items
        return list.items.some(
          (item) =>
            item.text.toLowerCase().includes(query) ||
            (item.notes && item.notes.toLowerCase().includes(query)),
        );
      });
    }

    // Apply advanced filters
    if (advancedFilters.categories.length > 0) {
      filtered = filtered.filter(
        (list) =>
          list.category && advancedFilters.categories.includes(list.category),
      );
    }

    if (advancedFilters.hasHighPriority) {
      filtered = filtered.filter((list) =>
        list.items.some((item) => item.priority === "high" && !item.isChecked),
      );
    }

    if (advancedFilters.hasOverdue) {
      const now = new Date();
      filtered = filtered.filter((list) =>
        list.items.some((item) => {
          if (!item.dueDate || item.isChecked) return false;
          return new Date(item.dueDate) < now;
        }),
      );
    }

    if (advancedFilters.hasIncomplete) {
      filtered = filtered.filter((list) =>
        list.items.some((item) => !item.isChecked),
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "alphabetical":
          return a.title.localeCompare(b.title);

        case "priority": {
          const aHighPriority = a.items.filter(
            (item) => item.priority === "high" && !item.isChecked,
          ).length;
          const bHighPriority = b.items.filter(
            (item) => item.priority === "high" && !item.isChecked,
          ).length;
          return bHighPriority - aHighPriority;
        }

        case "completion": {
          const aTotal = a.items.length;
          const bTotal = b.items.length;
          const aCompleted = a.items.filter((item) => item.isChecked).length;
          const bCompleted = b.items.filter((item) => item.isChecked).length;
          const aPercent = aTotal > 0 ? (aCompleted / aTotal) * 100 : 0;
          const bPercent = bTotal > 0 ? (bCompleted / bTotal) * 100 : 0;
          return bPercent - aPercent;
        }

        case "itemCount":
          return b.items.length - a.items.length;

        case "recent":
        default:
          return (
            new Date(b.lastOpenedAt).getTime() -
            new Date(a.lastOpenedAt).getTime()
          );
      }
    });

    return filtered;
  }, [lists, searchQuery, sortBy, advancedFilters]);

  /**
   * Calculate active filter count for badge
   */
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (advancedFilters.categories.length > 0) count++;
    if (advancedFilters.hasHighPriority) count++;
    if (advancedFilters.hasOverdue) count++;
    if (advancedFilters.hasIncomplete) count++;
    return count;
  }, [advancedFilters]);

  const handleAddList = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("ListEditor", {});
  };

  const toggleListSelection = useCallback((listId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedLists((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(listId)) {
        newSet.delete(listId);
      } else {
        newSet.add(listId);
      }
      return newSet;
    });
  }, []);

  const handleUseTemplate = useCallback(
    async (templateId: string) => {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      const duplicated = await db.lists.duplicate(templateId);
      if (duplicated) {
        await loadLists();
        navigation.navigate("ListEditor", { listId: duplicated.id });
      }
    },
    [loadLists, navigation],
  );

  const handleListPress = useCallback(
    (list: List) => {
      if (selectionMode) {
        toggleListSelection(list.id);
      } else if (list.isTemplate) {
        // For templates, show option to use them
        if (Platform.OS === "web") {
          if (confirm(`Create a new list from the "${list.title}" template?`)) {
            handleUseTemplate(list.id);
          }
        } else {
          Alert.alert(
            "Use Template",
            `Create a new list from the "${list.title}" template?`,
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Create",
                onPress: () => handleUseTemplate(list.id),
              },
            ],
          );
        }
      } else {
        navigation.navigate("ListEditor", { listId: list.id });
      }
    },
    [selectionMode, toggleListSelection, handleUseTemplate, navigation],
  );

  const handleListLongPress = useCallback((list: List) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setSelectionMode(true);
    setSelectedLists(new Set([list.id]));
  }, []);

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedLists(new Set());
  }, []);

  const handleDuplicateList = useCallback(
    async (listId: string) => {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      const duplicated = await db.lists.duplicate(listId);
      if (duplicated) {
        await loadLists();
        if (Platform.OS === "web") {
          alert("List duplicated successfully!");
        } else {
          Alert.alert("Success", "List duplicated successfully!");
        }
      }
    },
    [loadLists],
  );

  const handleArchiveList = useCallback(
    async (list: List) => {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      if (list.isArchived) {
        await db.lists.unarchive(list.id);
      } else {
        await db.lists.archive(list.id);
      }
      await loadLists();
    },
    [loadLists],
  );

  const handleBulkArchive = useCallback(async () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const selectedIds = Array.from(selectedLists);
    const isArchived = filter === "archived";

    if (isArchived) {
      await db.lists.bulkUnarchive(selectedIds);
    } else {
      await db.lists.bulkArchive(selectedIds);
    }

    await loadLists();
    exitSelectionMode();
  }, [selectedLists, filter, loadLists, exitSelectionMode]);

  const handleBulkDelete = useCallback(async () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const confirmDelete =
      Platform.OS === "web"
        ? confirm(
            `Delete ${selectedLists.size} list(s)? This cannot be undone.`,
          )
        : await new Promise((resolve) => {
            Alert.alert(
              "Delete Lists",
              `Delete ${selectedLists.size} list(s)? This cannot be undone.`,
              [
                {
                  text: "Cancel",
                  style: "cancel",
                  onPress: () => resolve(false),
                },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => resolve(true),
                },
              ],
            );
          });

    if (confirmDelete) {
      const selectedIds = Array.from(selectedLists);
      await db.lists.bulkDelete(selectedIds);
      await loadLists();
      exitSelectionMode();
    }
  }, [selectedLists, loadLists, exitSelectionMode]);

  const clearAllFilters = useCallback(() => {
    setAdvancedFilters({
      categories: [],
      hasHighPriority: false,
      hasOverdue: false,
      hasIncomplete: false,
    });
  }, []);

  const renderList = useCallback(
    ({ item, index }: { item: List; index: number }) => (
      <ListCard
        list={item}
        index={index}
        onPress={() => handleListPress(item)}
        onLongPress={() => handleListLongPress(item)}
        onDuplicate={() => handleDuplicateList(item.id)}
        onArchive={() => handleArchiveList(item)}
        isSelected={selectedLists.has(item.id)}
        selectionMode={selectionMode}
      />
    ),
    [
      handleListPress,
      handleListLongPress,
      selectedLists,
      selectionMode,
      handleDuplicateList,
      handleArchiveList,
    ],
  );

  const SortIcon = ({ option }: { option: SortOption }) => {
    if (sortBy === option) {
      return <Feather name="check" size={18} color={theme.accent} />;
    }
    return null;
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.backgroundDefault },
        ]}
      >
        <Feather
          name="search"
          size={18}
          color={theme.textMuted}
          style={styles.searchIcon}
        />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search lists and items..."
          placeholderTextColor={theme.textMuted}
          style={[styles.searchInput, { color: theme.text }]}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Feather name="x" size={18} color={theme.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Toolbar */}
      <View
        style={[styles.toolbar, { backgroundColor: theme.backgroundSecondary }]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.toolbarContent}
        >
          {/* Sort Button */}
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setShowSortModal(true);
            }}
            style={[
              styles.toolbarButton,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <Feather name="sliders" size={16} color={theme.textSecondary} />
            <ThemedText type="small" secondary>
              Sort
            </ThemedText>
          </Pressable>

          {/* Filter Button */}
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setShowFilterModal(true);
            }}
            style={[
              styles.toolbarButton,
              {
                backgroundColor:
                  activeFilterCount > 0
                    ? theme.accentDim
                    : theme.backgroundDefault,
              },
            ]}
          >
            <Feather
              name="filter"
              size={16}
              color={activeFilterCount > 0 ? theme.accent : theme.textSecondary}
            />
            <ThemedText
              type="small"
              style={{
                color:
                  activeFilterCount > 0 ? theme.accent : theme.textSecondary,
              }}
            >
              {activeFilterCount > 0
                ? `${activeFilterCount} filters`
                : "Filter"}
            </ThemedText>
          </Pressable>
        </ScrollView>
      </View>

      {/* Enhanced Stats Card */}
      {stats && filter === "active" && (
        <Pressable
          onPress={() => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            setShowStatsExpanded(!showStatsExpanded);
          }}
          style={[
            styles.statsCard,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <View style={styles.statsHeader}>
            <Feather name="bar-chart-2" size={20} color={theme.accent} />
            <ThemedText type="h3" style={{ flex: 1 }}>
              Your Lists
            </ThemedText>
            <Feather
              name={showStatsExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={theme.textMuted}
            />
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <ThemedText type="h2">{stats.active}</ThemedText>
              <ThemedText type="small" muted>
                Active
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText type="h2">{stats.totalItems}</ThemedText>
              <ThemedText type="small" muted>
                Total Items
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText type="h2" style={{ color: theme.success }}>
                {stats.completedItems}
              </ThemedText>
              <ThemedText type="small" muted>
                Completed
              </ThemedText>
            </View>
          </View>

          {showStatsExpanded && (
            <View style={styles.expandedStats}>
              <View style={styles.statRow}>
                <ThemedText type="body" secondary>
                  Pending Items
                </ThemedText>
                <ThemedText type="body">{stats.pendingItems}</ThemedText>
              </View>
              <View style={styles.statRow}>
                <ThemedText type="body" secondary>
                  High Priority
                </ThemedText>
                <ThemedText type="body" style={{ color: theme.error }}>
                  {stats.highPriorityItems}
                </ThemedText>
              </View>
              <View style={styles.statRow}>
                <ThemedText type="body" secondary>
                  Overdue Items
                </ThemedText>
                <ThemedText type="body" style={{ color: theme.warning }}>
                  {stats.overdueItems}
                </ThemedText>
              </View>
              <View style={styles.statRow}>
                <ThemedText type="body" secondary>
                  Completion Rate
                </ThemedText>
                <ThemedText type="body" style={{ color: theme.success }}>
                  {stats.completionRate}%
                </ThemedText>
              </View>
              <View style={styles.statRow}>
                <ThemedText type="body" secondary>
                  Archived Lists
                </ThemedText>
                <ThemedText type="body">{stats.archived}</ThemedText>
              </View>
            </View>
          )}
        </Pressable>
      )}

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        <Pressable
          style={[
            styles.filterTab,
            {
              backgroundColor:
                filter === "active" ? theme.accent : theme.backgroundDefault,
            },
          ]}
          onPress={() => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            setFilter("active");
          }}
        >
          <Feather
            name="list"
            size={16}
            color={filter === "active" ? theme.buttonText : theme.textSecondary}
          />
          <ThemedText
            type="body"
            style={{
              color:
                filter === "active" ? theme.buttonText : theme.textSecondary,
              fontWeight: filter === "active" ? "600" : "400",
            }}
          >
            Active
          </ThemedText>
        </Pressable>

        <Pressable
          style={[
            styles.filterTab,
            {
              backgroundColor:
                filter === "templates" ? theme.accent : theme.backgroundDefault,
            },
          ]}
          onPress={() => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            setFilter("templates");
          }}
        >
          <Feather
            name="copy"
            size={16}
            color={
              filter === "templates" ? theme.buttonText : theme.textSecondary
            }
          />
          <ThemedText
            type="body"
            style={{
              color:
                filter === "templates" ? theme.buttonText : theme.textSecondary,
              fontWeight: filter === "templates" ? "600" : "400",
            }}
          >
            Templates
          </ThemedText>
        </Pressable>

        <Pressable
          style={[
            styles.filterTab,
            {
              backgroundColor:
                filter === "archived" ? theme.accent : theme.backgroundDefault,
            },
          ]}
          onPress={() => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            setFilter("archived");
          }}
        >
          <Feather
            name="archive"
            size={16}
            color={
              filter === "archived" ? theme.buttonText : theme.textSecondary
            }
          />
          <ThemedText
            type="body"
            style={{
              color:
                filter === "archived" ? theme.buttonText : theme.textSecondary,
              fontWeight: filter === "archived" ? "600" : "400",
            }}
          >
            Archived
          </ThemedText>
        </Pressable>
      </ScrollView>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Selection Mode Toolbar */}
      {selectionMode && (
        <View
          style={[
            styles.selectionToolbar,
            { backgroundColor: theme.accentDim },
          ]}
        >
          <Pressable onPress={exitSelectionMode} style={styles.selectionButton}>
            <Feather name="x" size={20} color={theme.accent} />
          </Pressable>
          <ThemedText type="body" style={{ color: theme.accent, flex: 1 }}>
            {selectedLists.size} selected
          </ThemedText>
          <Pressable onPress={handleBulkArchive} style={styles.selectionButton}>
            <Feather
              name={filter === "archived" ? "inbox" : "archive"}
              size={20}
              color={theme.accent}
            />
          </Pressable>
          <Pressable onPress={handleBulkDelete} style={styles.selectionButton}>
            <Feather name="trash-2" size={20} color={theme.error} />
          </Pressable>
        </View>
      )}

      <FlatList
        data={filteredAndSortedLists}
        renderItem={renderList}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: Spacing.md,
            paddingBottom: insets.bottom + Spacing["5xl"],
          },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Image
              source={require("../../assets/images/empty-notebook.png")}
              style={styles.emptyImage}
              resizeMode="contain"
            />
            <ThemedText type="h3" style={styles.emptyTitle}>
              {filter === "templates"
                ? "No Templates Available"
                : filter === "archived"
                  ? "No Archived Lists"
                  : searchQuery
                    ? "No Matching Lists"
                    : "No Lists Yet"}
            </ThemedText>
            <ThemedText type="body" secondary style={styles.emptyText}>
              {filter === "templates"
                ? "Templates help you create lists faster"
                : filter === "archived"
                  ? "Archived lists will appear here"
                  : searchQuery
                    ? `No lists found matching "${searchQuery}"`
                    : "Tap + to create your first list"}
            </ThemedText>
          </View>
        }
      />

      <Pressable
        onPress={handleAddList}
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

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowSortModal(false)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <ThemedText type="h3" style={styles.modalTitle}>
              Sort By
            </ThemedText>

            <Pressable
              onPress={() => {
                setSortBy("recent");
                setShowSortModal(false);
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              style={styles.modalOption}
            >
              <View style={styles.modalOptionLeft}>
                <Feather name="clock" size={20} color={theme.textSecondary} />
                <ThemedText type="body">Most Recent</ThemedText>
              </View>
              <SortIcon option="recent" />
            </Pressable>

            <Pressable
              onPress={() => {
                setSortBy("alphabetical");
                setShowSortModal(false);
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              style={styles.modalOption}
            >
              <View style={styles.modalOptionLeft}>
                <Feather name="type" size={20} color={theme.textSecondary} />
                <ThemedText type="body">Alphabetical</ThemedText>
              </View>
              <SortIcon option="alphabetical" />
            </Pressable>

            <Pressable
              onPress={() => {
                setSortBy("priority");
                setShowSortModal(false);
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              style={styles.modalOption}
            >
              <View style={styles.modalOptionLeft}>
                <Feather
                  name="alert-circle"
                  size={20}
                  color={theme.textSecondary}
                />
                <ThemedText type="body">By Priority</ThemedText>
              </View>
              <SortIcon option="priority" />
            </Pressable>

            <Pressable
              onPress={() => {
                setSortBy("completion");
                setShowSortModal(false);
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              style={styles.modalOption}
            >
              <View style={styles.modalOptionLeft}>
                <Feather
                  name="check-circle"
                  size={20}
                  color={theme.textSecondary}
                />
                <ThemedText type="body">By Completion</ThemedText>
              </View>
              <SortIcon option="completion" />
            </Pressable>

            <Pressable
              onPress={() => {
                setSortBy("itemCount");
                setShowSortModal(false);
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              style={styles.modalOption}
            >
              <View style={styles.modalOptionLeft}>
                <Feather name="hash" size={20} color={theme.textSecondary} />
                <ThemedText type="body">By Item Count</ThemedText>
              </View>
              <SortIcon option="itemCount" />
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowFilterModal(false)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View style={styles.modalHeader}>
              <ThemedText type="h3" style={styles.modalTitle}>
                Advanced Filters
              </ThemedText>
              {activeFilterCount > 0 && (
                <Pressable
                  onPress={() => {
                    clearAllFilters();
                    if (Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                  }}
                  style={styles.clearButton}
                >
                  <ThemedText type="small" style={{ color: theme.accent }}>
                    Clear All
                  </ThemedText>
                </Pressable>
              )}
            </View>

            <ScrollView style={styles.filterList}>
              {/* Categories */}
              <ThemedText type="body" style={styles.filterSectionTitle}>
                Categories
              </ThemedText>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                const isSelected = advancedFilters.categories.includes(key);
                return (
                  <Pressable
                    key={key}
                    onPress={() => {
                      if (Platform.OS !== "web") {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      setAdvancedFilters((prev) => ({
                        ...prev,
                        categories: isSelected
                          ? prev.categories.filter((c) => c !== key)
                          : [...prev.categories, key],
                      }));
                    }}
                    style={[
                      styles.filterOption,
                      {
                        backgroundColor: isSelected
                          ? theme.accentDim
                          : theme.backgroundSecondary,
                      },
                    ]}
                  >
                    <View style={styles.modalOptionLeft}>
                      <Feather
                        name={
                          CATEGORY_ICONS[
                            key as keyof typeof CATEGORY_ICONS
                          ] as any
                        }
                        size={18}
                        color={isSelected ? theme.accent : theme.textSecondary}
                      />
                      <ThemedText
                        type="body"
                        style={{
                          color: isSelected ? theme.accent : theme.text,
                        }}
                      >
                        {label}
                      </ThemedText>
                    </View>
                    {isSelected && (
                      <Feather name="check" size={18} color={theme.accent} />
                    )}
                  </Pressable>
                );
              })}

              {/* Other Filters */}
              <ThemedText type="body" style={styles.filterSectionTitle}>
                Other Filters
              </ThemedText>

              <Pressable
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setAdvancedFilters((prev) => ({
                    ...prev,
                    hasHighPriority: !prev.hasHighPriority,
                  }));
                }}
                style={[
                  styles.filterOption,
                  {
                    backgroundColor: advancedFilters.hasHighPriority
                      ? theme.accentDim
                      : theme.backgroundSecondary,
                  },
                ]}
              >
                <View style={styles.modalOptionLeft}>
                  <Feather
                    name="alert-circle"
                    size={18}
                    color={
                      advancedFilters.hasHighPriority
                        ? theme.accent
                        : theme.textSecondary
                    }
                  />
                  <ThemedText
                    type="body"
                    style={{
                      color: advancedFilters.hasHighPriority
                        ? theme.accent
                        : theme.text,
                    }}
                  >
                    Has High Priority Items
                  </ThemedText>
                </View>
                {advancedFilters.hasHighPriority && (
                  <Feather name="check" size={18} color={theme.accent} />
                )}
              </Pressable>

              <Pressable
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setAdvancedFilters((prev) => ({
                    ...prev,
                    hasOverdue: !prev.hasOverdue,
                  }));
                }}
                style={[
                  styles.filterOption,
                  {
                    backgroundColor: advancedFilters.hasOverdue
                      ? theme.accentDim
                      : theme.backgroundSecondary,
                  },
                ]}
              >
                <View style={styles.modalOptionLeft}>
                  <Feather
                    name="calendar"
                    size={18}
                    color={
                      advancedFilters.hasOverdue
                        ? theme.accent
                        : theme.textSecondary
                    }
                  />
                  <ThemedText
                    type="body"
                    style={{
                      color: advancedFilters.hasOverdue
                        ? theme.accent
                        : theme.text,
                    }}
                  >
                    Has Overdue Items
                  </ThemedText>
                </View>
                {advancedFilters.hasOverdue && (
                  <Feather name="check" size={18} color={theme.accent} />
                )}
              </Pressable>

              <Pressable
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setAdvancedFilters((prev) => ({
                    ...prev,
                    hasIncomplete: !prev.hasIncomplete,
                  }));
                }}
                style={[
                  styles.filterOption,
                  {
                    backgroundColor: advancedFilters.hasIncomplete
                      ? theme.accentDim
                      : theme.backgroundSecondary,
                  },
                ]}
              >
                <View style={styles.modalOptionLeft}>
                  <Feather
                    name="circle"
                    size={18}
                    color={
                      advancedFilters.hasIncomplete
                        ? theme.accent
                        : theme.textSecondary
                    }
                  />
                  <ThemedText
                    type="body"
                    style={{
                      color: advancedFilters.hasIncomplete
                        ? theme.accent
                        : theme.text,
                    }}
                  >
                    Has Incomplete Items
                  </ThemedText>
                </View>
                {advancedFilters.hasIncomplete && (
                  <Feather name="check" size={18} color={theme.accent} />
                )}
              </Pressable>
            </ScrollView>

            <Pressable
              onPress={() => {
                setShowFilterModal(false);
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              style={[styles.doneButton, { backgroundColor: theme.accent }]}
            >
              <ThemedText
                type="body"
                style={{ color: theme.buttonText, fontWeight: "600" }}
              >
                Done
              </ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <View style={styles.bottomNavContainer}>
        <BottomNav onAiPress={() => setShowAISheet(true)} />
      </View>

      <AIAssistSheet
        visible={showAISheet}
        onClose={() => setShowAISheet(false)}
        module="lists"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.xs,
  },
  toolbar: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  toolbarContent: {
    gap: Spacing.sm,
    alignItems: "center",
  },
  toolbarButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  selectionToolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  selectionButton: {
    padding: Spacing.xs,
  },
  headerSection: {
    marginBottom: Spacing.md,
  },
  statsCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  statsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  expandedStats: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.2)",
    gap: Spacing.sm,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.xs,
  },
  filterScroll: {
    marginBottom: Spacing.sm,
  },
  filterContent: {
    paddingHorizontal: Spacing.sm,
    gap: Spacing.sm,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    ...Shadows.card,
  },
  headerButton: {
    padding: Spacing.xs,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  listCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    ...Shadows.card,
  },
  listHeader: {
    marginBottom: Spacing.sm,
  },
  listTitleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  listTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  templateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  archivedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  categoryText: {
    fontSize: 10,
  },
  listTitle: {
    flex: 1,
  },
  listStats: {
    marginLeft: Spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  progressContainer: {
    marginBottom: Spacing.sm,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priorityIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  listMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: Spacing.md,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    padding: Spacing.sm,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: Spacing["5xl"],
    paddingHorizontal: Spacing["2xl"],
  },
  emptyImage: {
    width: 180,
    height: 180,
    opacity: 0.8,
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    marginBottom: Spacing.sm,
  },
  emptyText: {
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    maxHeight: "80%",
    ...Shadows.card,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  modalTitle: {
    marginBottom: Spacing.md,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  modalOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  filterList: {
    maxHeight: 400,
  },
  filterSectionTitle: {
    fontWeight: "600",
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  clearButton: {
    padding: Spacing.xs,
  },
  doneButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  bottomNavContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
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
});
