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

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  Platform,
  ScrollView,
  Alert,
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
  index,
}: {
  list: List;
  onPress: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  index: number;
}) {
  const { theme } = useTheme();
  const [showActions, setShowActions] = useState(false);
  const checkedCount = list.items.filter((item) => item.isChecked).length;
  const totalCount = list.items.length;
  const progressPercent = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;
  
  // Count priority items
  const highPriorityCount = list.items.filter(
    (item) => item.priority === "high" && !item.isChecked
  ).length;

  const handleLongPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setShowActions(!showActions);
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
          },
          pressed && { opacity: 0.8 },
        ]}
      >
        <View style={styles.listHeader}>
          <View style={styles.listTitleRow}>
            {list.category && (
              <View style={[styles.categoryBadge, { backgroundColor: theme.accentDim }]}>
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
              <View style={[styles.templateBadge, { backgroundColor: theme.accentDim }]}>
                <Feather name="copy" size={12} color={theme.accent} />
                <ThemedText type="small" style={styles.categoryText}>
                  Template
                </ThemedText>
              </View>
            )}
            {list.isArchived && (
              <View style={[styles.archivedBadge, { backgroundColor: theme.backgroundSecondary }]}>
                <Feather name="archive" size={12} color={theme.textMuted} />
                <ThemedText type="small" muted>
                  Archived
                </ThemedText>
              </View>
            )}
          </View>
          <ThemedText type="h3" style={styles.listTitle} numberOfLines={1}>
            {list.title}
          </ThemedText>
        </View>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: list.color || theme.accent,
                  width: `${progressPercent}%`,
                }
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

        {showActions && (
          <View style={[styles.actionsRow, { backgroundColor: theme.backgroundSecondary }]}>
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
  const [stats, setStats] = useState<any>(null);

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
    
    // Sort by lastOpenedAt
    data.sort((a, b) => 
      new Date(b.lastOpenedAt).getTime() - new Date(a.lastOpenedAt).getTime()
    );
    
    setLists(data);
    
    // Load stats
    const statsData = await db.lists.getStats();
    setStats(statsData);
  }, [filter]);
  }, []);

  useEffect(() => {
    loadLists();
  }, [filter]);

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

  const handleAddList = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("ListEditor", {});
  };

  const handleDuplicateList = async (listId: string) => {
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
  };

  const handleArchiveList = async (list: List) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (list.isArchived) {
      await db.lists.unarchive(list.id);
    } else {
      await db.lists.archive(list.id);
    }
    await loadLists();
  };

  const handleUseTemplate = async (templateId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const duplicated = await db.lists.duplicate(templateId);
    if (duplicated) {
      await loadLists();
      navigation.navigate("ListEditor", { listId: duplicated.id });
    }
  };

  const renderList = ({ item, index }: { item: List; index: number }) => (
    <ListCard
      list={item}
      index={index}
      onPress={() => {
        if (item.isTemplate) {
          // For templates, show option to use them
          if (Platform.OS === "web") {
            if (confirm(`Create a new list from the "${item.title}" template?`)) {
              handleUseTemplate(item.id);
            }
          } else {
            Alert.alert(
              "Use Template",
              `Create a new list from the "${item.title}" template?`,
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Create",
                  onPress: () => handleUseTemplate(item.id),
                },
              ]
            );
          }
        } else {
          navigation.navigate("ListEditor", { listId: item.id });
        }
      }}
      onDuplicate={() => handleDuplicateList(item.id)}
      onArchive={() => handleArchiveList(item)}
    />
  );

  const renderHeader = () => (
    <View style={styles.headerSection}>
      {/* Stats Card */}
      {stats && filter === "active" && (
        <View style={[styles.statsCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.statsHeader}>
            <Feather name="bar-chart-2" size={20} color={theme.accent} />
            <ThemedText type="h3">Your Lists</ThemedText>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <ThemedText type="h2">{stats.active}</ThemedText>
              <ThemedText type="small" muted>Active</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText type="h2">{stats.totalItems}</ThemedText>
              <ThemedText type="small" muted>Total Items</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText type="h2" style={{ color: theme.success }}>
                {stats.completedItems}
              </ThemedText>
              <ThemedText type="small" muted>Completed</ThemedText>
            </View>
          </View>
        </View>
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
            { backgroundColor: filter === "active" ? theme.accent : theme.backgroundDefault },
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
              color: filter === "active" ? theme.buttonText : theme.textSecondary,
              fontWeight: filter === "active" ? "600" : "400",
            }}
          >
            Active
          </ThemedText>
        </Pressable>

        <Pressable
          style={[
            styles.filterTab,
            { backgroundColor: filter === "templates" ? theme.accent : theme.backgroundDefault },
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
            color={filter === "templates" ? theme.buttonText : theme.textSecondary} 
          />
          <ThemedText 
            type="body"
            style={{ 
              color: filter === "templates" ? theme.buttonText : theme.textSecondary,
              fontWeight: filter === "templates" ? "600" : "400",
            }}
          >
            Templates
          </ThemedText>
        </Pressable>

        <Pressable
          style={[
            styles.filterTab,
            { backgroundColor: filter === "archived" ? theme.accent : theme.backgroundDefault },
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
            color={filter === "archived" ? theme.buttonText : theme.textSecondary} 
          />
          <ThemedText 
            type="body"
            style={{ 
              color: filter === "archived" ? theme.buttonText : theme.textSecondary,
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
      <FlatList
        data={lists}
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
              {filter === "templates" ? "No Templates Available" : 
               filter === "archived" ? "No Archived Lists" : "No Lists Yet"}
            </ThemedText>
            <ThemedText type="body" secondary style={styles.emptyText}>
              {filter === "templates" ? "Templates help you create lists faster" :
               filter === "archived" ? "Archived lists will appear here" :
               "Tap + to create your first list"}
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
