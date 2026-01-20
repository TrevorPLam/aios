/**
 * PlannerScreen Module
 *
 * Task and project management with priorities and dependencies.
 * Features:
 * - Task list with completion tracking
 * - Priority levels (high, medium, low)
 * - Project grouping
 * - Task dependencies
 * - Due date tracking
 * - Today/upcoming/overdue views
 * - Subtask support
 * - AI assistance for task suggestions
 * - Haptic feedback for interactions
 * - Secondary navigation bar for quick access (AI Assist, Time Block, Dependencies)
 *
 * @module PlannerScreen
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  Platform,
  TextInput,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { db } from "@/storage/database";
import { Task, TaskStatus, TaskPriority } from "@/models/types";
import { formatDate, getPriorityColor } from "@/utils/helpers";
import { BottomNav } from "@/components/BottomNav";
import AIAssistSheet from "@/components/AIAssistSheet";
import { HeaderLeftNav, HeaderRightNav } from "@/components/HeaderNav";

// Secondary Navigation Constants
const SECONDARY_NAV_BADGE_THRESHOLD = 9;
const SECONDARY_NAV_HIDE_OFFSET = -72;
const SECONDARY_NAV_ANIMATION_DURATION = 200;
const SCROLL_TOP_THRESHOLD = 10;
const SCROLL_DOWN_THRESHOLD = 5;
const SCROLL_UP_THRESHOLD = -5;

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

interface TaskWithSubtasks extends Task {
  subtasks: Task[];
  isExpanded?: boolean;
  progress?: number; // Completion percentage for tasks with subtasks
}

// Filter types for UI state management
type PriorityFilter = "all" | TaskPriority;
type StatusFilter = "all" | TaskStatus;
type DueDateFilter = "all" | "overdue" | "today" | "week";
type SortOption = "priority" | "dueDate" | "alphabetical" | "updated";

// Filter options constants
const PRIORITY_FILTERS: PriorityFilter[] = [
  "all",
  "urgent",
  "high",
  "medium",
  "low",
];
const STATUS_FILTERS: StatusFilter[] = [
  "all",
  "pending",
  "in_progress",
  "completed",
  "cancelled",
];
const DUE_DATE_FILTERS: DueDateFilter[] = ["all", "overdue", "today", "week"];
const SORT_OPTIONS: SortOption[] = [
  "priority",
  "dueDate",
  "alphabetical",
  "updated",
];

function TaskCard({
  task,
  onPress,
  index,
  isSubtask = false,
  hasSubtasks = false,
  isExpanded = false,
  onToggleExpand,
  onAddSubtask,
  onToggleComplete,
  progress,
}: {
  task: Task;
  onPress: () => void;
  index: number;
  isSubtask?: boolean;
  hasSubtasks?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onAddSubtask?: () => void;
  onToggleComplete?: () => void;
  progress?: number;
}) {
  const { theme } = useTheme();
  const priorityColor = getPriorityColor(task.priority, theme);
  const isCompleted = task.status === "completed";

  return (
    <Animated.View entering={FadeInDown.delay(index * 30).springify()}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.taskCard,
          { backgroundColor: theme.backgroundDefault },
          isSubtask && styles.subtaskCard,
          pressed && { opacity: 0.8 },
        ]}
      >
        {hasSubtasks ? (
          <Pressable
            onPress={onToggleExpand}
            style={[styles.expandButton, { backgroundColor: theme.accentDim }]}
            hitSlop={8}
          >
            <Feather
              name={isExpanded ? "chevron-down" : "chevron-right"}
              size={16}
              color={theme.accent}
            />
          </Pressable>
        ) : (
          <View
            style={[
              styles.priorityIndicator,
              { backgroundColor: priorityColor },
            ]}
          />
        )}
        <View style={styles.taskContent}>
          <View style={styles.titleRow}>
            <ThemedText
              type="body"
              style={[
                styles.taskTitle,
                isCompleted && styles.completedTask,
                hasSubtasks && { fontWeight: "600" },
              ]}
              numberOfLines={1}
            >
              {task.title}
            </ThemedText>
            {hasSubtasks && (
              <View
                style={[
                  styles.projectBadge,
                  { backgroundColor: theme.accentDim },
                ]}
              >
                <Feather name="folder" size={10} color={theme.accent} />
              </View>
            )}
          </View>
          <View style={styles.taskMeta}>
            {task.dueDate ? (
              <View style={styles.metaItem}>
                <Feather name="calendar" size={12} color={theme.textMuted} />
                <ThemedText type="small" muted>
                  {formatDate(task.dueDate)}
                </ThemedText>
              </View>
            ) : null}
            {task.recurrenceRule !== "none" ? (
              <View style={styles.metaItem}>
                <Feather name="repeat" size={12} color={theme.textMuted} />
                <ThemedText type="small" muted>
                  {task.recurrenceRule}
                </ThemedText>
              </View>
            ) : null}
            {/* Show progress for parent tasks with subtasks */}
            {hasSubtasks && progress !== undefined && progress !== null ? (
              <View style={styles.metaItem}>
                <Feather
                  name="check-circle"
                  size={12}
                  color={theme.textMuted}
                />
                <ThemedText type="small" muted>
                  {progress}%
                </ThemedText>
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.cardActions}>
          {!isSubtask ? (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                onAddSubtask?.();
              }}
              style={[styles.addSubtaskButton, { borderColor: theme.border }]}
              hitSlop={8}
            >
              <Feather name="plus" size={14} color={theme.textMuted} />
            </Pressable>
          ) : null}
          {/* Make status badge pressable to toggle completion */}
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              onToggleComplete?.();
            }}
            style={[
              styles.statusBadge,
              {
                backgroundColor: isCompleted
                  ? theme.successDim
                  : theme.backgroundSecondary,
              },
            ]}
            hitSlop={8}
            accessibilityLabel={
              isCompleted ? "Mark task as incomplete" : "Mark task as complete"
            }
            accessibilityRole="button"
            accessibilityHint={`Double tap to ${isCompleted ? "uncomplete" : "complete"} this task`}
          >
            <Feather
              name={isCompleted ? "check" : "circle"}
              size={16}
              color={isCompleted ? theme.success : theme.textMuted}
            />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function PlannerScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const lastScrollY = useSharedValue(0);
  const secondaryNavTranslateY = useSharedValue(0);
  const isAnimating = useSharedValue(false);

  const [tasks, setTasks] = useState<TaskWithSubtasks[]>([]);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [showAISheet, setShowAISheet] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dueDateFilter, setDueDateFilter] = useState<DueDateFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("priority");

  // Statistics state
  const [statistics, setStatistics] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0,
    dueToday: 0,
  });
  const [showStats, setShowStats] = useState(false);

  const loadData = useCallback(async () => {
    const allTasks = await db.tasks.getAll();

    const topLevel = allTasks.filter((t) => !t.parentTaskId);

    const buildSubtasksRecursive = (parentId: string): Task[] => {
      return allTasks.filter((t) => t.parentTaskId === parentId);
    };

    // Build tasks with subtasks and calculate progress for parent tasks
    const tasksWithSubtasks: TaskWithSubtasks[] = await Promise.all(
      topLevel.map(async (task) => {
        const subtasks = buildSubtasksRecursive(task.id);
        let progress = undefined;

        // Calculate progress if task has subtasks
        if (subtasks.length > 0) {
          progress = await db.tasks.getSubtaskProgress(task.id);
        }

        return {
          ...task,
          subtasks,
          progress,
        };
      }),
    );

    tasksWithSubtasks.sort((a, b) => {
      const aHasSubtasks = a.subtasks.length > 0;
      const bHasSubtasks = b.subtasks.length > 0;
      if (aHasSubtasks && !bHasSubtasks) return -1;
      if (!aHasSubtasks && bHasSubtasks) return 1;
      if (a.status === "completed" && b.status !== "completed") return 1;
      if (a.status !== "completed" && b.status === "completed") return -1;
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    setTasks(tasksWithSubtasks);

    // Load statistics for dashboard
    const stats = await db.tasks.getStatistics();
    setStatistics({
      total: stats.total,
      completed: stats.completed,
      inProgress: stats.inProgress,
      overdue: stats.overdue,
      dueToday: stats.dueToday,
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadData);
    return unsubscribe;
  }, [navigation, loadData]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderLeftNav />,
      headerRight: () => <HeaderRightNav settingsRoute="PlannerSettings" />,
    });
  }, [navigation, theme]);

  const handleAddTask = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("TaskDetail", {});
  };

  const toggleExpand = (taskId: string) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleAddSubtask = (parentId: string) => {
    navigation.navigate("TaskDetail", { parentTaskId: parentId });
  };

  // Toggle task completion status between completed and pending
  // Note: Always reverts to "pending" when uncompleting for simplicity and consistency
  const handleToggleComplete = async (task: Task) => {
    let newStatus: TaskStatus;

    if (task.status === "completed") {
      // If completed, revert to pending
      newStatus = "pending";
    } else {
      // If not completed, mark as completed
      newStatus = "completed";
    }

    const updatedTask = {
      ...task,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    await db.tasks.save(updatedTask);
    await loadData(); // Reload to update progress indicators
  };

  // Apply search filter - filters by title and userNotes
  const applySearchFilter = useMemo(() => {
    return (taskList: TaskWithSubtasks[]): TaskWithSubtasks[] => {
      if (!searchQuery.trim()) return taskList;

      const lowerQuery = searchQuery.toLowerCase();
      return taskList.filter(
        (t) =>
          t.title.toLowerCase().includes(lowerQuery) ||
          (t.userNotes || "").toLowerCase().includes(lowerQuery),
      );
    };
  }, [searchQuery]);

  // Apply priority filter
  const applyPriorityFilter = useMemo(() => {
    return (taskList: TaskWithSubtasks[]): TaskWithSubtasks[] => {
      if (priorityFilter === "all") return taskList;
      return taskList.filter((t) => t.priority === priorityFilter);
    };
  }, [priorityFilter]);

  // Apply status filter
  const applyStatusFilter = useMemo(() => {
    return (taskList: TaskWithSubtasks[]): TaskWithSubtasks[] => {
      if (statusFilter === "all") return taskList;
      return taskList.filter((t) => t.status === statusFilter);
    };
  }, [statusFilter]);

  // Apply due date filter
  const applyDueDateFilter = useMemo(() => {
    return (taskList: TaskWithSubtasks[]): TaskWithSubtasks[] => {
      if (dueDateFilter === "all") return taskList;

      const now = new Date().toISOString();
      const today = now.split("T")[0];
      const weekFromNow = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString();

      switch (dueDateFilter) {
        case "overdue":
          return taskList.filter(
            (t) =>
              t.dueDate &&
              t.dueDate < now &&
              t.status !== "completed" &&
              t.status !== "cancelled",
          );
        case "today":
          return taskList.filter(
            (t) => t.dueDate && t.dueDate.startsWith(today),
          );
        case "week":
          return taskList.filter(
            (t) =>
              t.dueDate &&
              t.dueDate >= now &&
              t.dueDate <= weekFromNow &&
              t.status !== "completed" &&
              t.status !== "cancelled",
          );
        default:
          return taskList;
      }
    };
  }, [dueDateFilter]);

  // Apply sorting
  const applySorting = useMemo(() => {
    return (taskList: TaskWithSubtasks[]): TaskWithSubtasks[] => {
      const sorted = [...taskList];

      switch (sortBy) {
        case "priority":
          sorted.sort((a, b) => {
            // Keep parent tasks at top
            const aHasSubtasks = a.subtasks.length > 0;
            const bHasSubtasks = b.subtasks.length > 0;
            if (aHasSubtasks && !bHasSubtasks) return -1;
            if (!aHasSubtasks && bHasSubtasks) return 1;

            // Then by completion status
            if (a.status === "completed" && b.status !== "completed") return 1;
            if (a.status !== "completed" && b.status === "completed") return -1;

            // Finally by priority
            const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          });
          break;

        case "dueDate":
          sorted.sort((a, b) => {
            // Keep parent tasks at top
            const aHasSubtasks = a.subtasks.length > 0;
            const bHasSubtasks = b.subtasks.length > 0;
            if (aHasSubtasks && !bHasSubtasks) return -1;
            if (!aHasSubtasks && bHasSubtasks) return 1;

            // Sort by due date
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return a.dueDate.localeCompare(b.dueDate);
          });
          break;

        case "alphabetical":
          sorted.sort((a, b) => {
            // Keep parent tasks at top
            const aHasSubtasks = a.subtasks.length > 0;
            const bHasSubtasks = b.subtasks.length > 0;
            if (aHasSubtasks && !bHasSubtasks) return -1;
            if (!aHasSubtasks && bHasSubtasks) return 1;

            return a.title.localeCompare(b.title);
          });
          break;

        case "updated":
          sorted.sort((a, b) => {
            // Keep parent tasks at top
            const aHasSubtasks = a.subtasks.length > 0;
            const bHasSubtasks = b.subtasks.length > 0;
            if (aHasSubtasks && !bHasSubtasks) return -1;
            if (!aHasSubtasks && bHasSubtasks) return 1;

            return b.updatedAt.localeCompare(a.updatedAt);
          });
          break;
      }

      return sorted;
    };
  }, [sortBy]);

  // Memoized filtered and sorted tasks
  const filteredAndSortedTasks = useMemo(() => {
    let result = tasks;
    result = applySearchFilter(result);
    result = applyPriorityFilter(result);
    result = applyStatusFilter(result);
    result = applyDueDateFilter(result);
    result = applySorting(result);
    return result;
  }, [
    tasks,
    applySearchFilter,
    applyPriorityFilter,
    applyStatusFilter,
    applyDueDateFilter,
    applySorting,
  ]);

  const buildListData = () => {
    const result: {
      type: "task" | "subtask";
      task: Task;
      parentHasSubtasks: boolean;
      parentProgress?: number;
      index: number;
    }[] = [];
    let index = 0;

    // Use filtered and sorted tasks instead of raw tasks
    filteredAndSortedTasks.forEach((task) => {
      const hasSubtasks = task.subtasks.length > 0;
      result.push({
        type: "task",
        task,
        parentHasSubtasks: hasSubtasks,
        parentProgress: task.progress,
        index: index++,
      });

      if (hasSubtasks && expandedTasks.has(task.id)) {
        task.subtasks.forEach((subtask) => {
          result.push({
            type: "subtask",
            task: subtask,
            parentHasSubtasks: false,
            index: index++,
          });
        });
      }
    });

    return result;
  };

  const listData = buildListData();

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const delta = currentScrollY - lastScrollY.value;

    if (isAnimating.value) {
      lastScrollY.value = currentScrollY;
      return;
    }

    if (currentScrollY < SCROLL_TOP_THRESHOLD && secondaryNavTranslateY.value !== 0) {
      isAnimating.value = true;
      secondaryNavTranslateY.value = withTiming(0, { duration: SECONDARY_NAV_ANIMATION_DURATION }, () => {
        isAnimating.value = false;
      });
    } else if (delta > SCROLL_DOWN_THRESHOLD && secondaryNavTranslateY.value !== SECONDARY_NAV_HIDE_OFFSET) {
      isAnimating.value = true;
      secondaryNavTranslateY.value = withTiming(SECONDARY_NAV_HIDE_OFFSET, { duration: SECONDARY_NAV_ANIMATION_DURATION }, () => {
        isAnimating.value = false;
      });
    } else if (delta < SCROLL_UP_THRESHOLD && secondaryNavTranslateY.value !== 0) {
      isAnimating.value = true;
      secondaryNavTranslateY.value = withTiming(0, { duration: SECONDARY_NAV_ANIMATION_DURATION }, () => {
        isAnimating.value = false;
      });
    }

    lastScrollY.value = currentScrollY;
  }, []);

  const secondaryNavAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: secondaryNavTranslateY.value }],
    };
  });

  const renderItem = ({ item }: { item: (typeof listData)[0] }) => {
    const isSubtask = item.type === "subtask";
    const hasSubtasks = item.parentHasSubtasks;
    const isExpanded = expandedTasks.has(item.task.id);

    return (
      <TaskCard
        task={item.task}
        index={item.index}
        isSubtask={isSubtask}
        hasSubtasks={hasSubtasks}
        isExpanded={isExpanded}
        progress={item.parentProgress}
        onPress={() =>
          navigation.navigate("TaskDetail", { taskId: item.task.id })
        }
        onToggleExpand={() => toggleExpand(item.task.id)}
        onAddSubtask={() => handleAddSubtask(item.task.id)}
        onToggleComplete={() => handleToggleComplete(item.task)}
      />
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Search bar at the top */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.backgroundDefault },
        ]}
      >
        <Feather name="search" size={18} color={theme.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search tasks..."
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
            <Feather name="x" size={18} color={theme.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Secondary Navigation Bar */}
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
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              console.log("AI Assist");
              setShowAISheet(true);
            }}
            style={({ pressed }) => [
              styles.secondaryNavButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="AI Assist"
          >
            <Feather name="cpu" size={20} color={theme.text} />
            <ThemedText type="small">AI Assist</ThemedText>
          </Pressable>

          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              console.log("Time Block");
            }}
            style={({ pressed }) => [
              styles.secondaryNavButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Time Block"
          >
            <Feather name="calendar" size={20} color={theme.text} />
            <ThemedText type="small">Time Block</ThemedText>
          </Pressable>

          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              console.log("Dependencies");
            }}
            style={({ pressed }) => [
              styles.secondaryNavButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Dependencies"
          >
            <Feather name="git-merge" size={20} color={theme.text} />
            <ThemedText type="small">Dependencies</ThemedText>
          </Pressable>
        </Animated.View>
      </View>

      {/* Statistics Dashboard - Collapsible */}
      <Pressable
        onPress={() => {
          setShowStats(!showStats);
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }}
        style={[
          styles.statsHeader,
          { backgroundColor: theme.backgroundSecondary },
        ]}
      >
        <ThemedText type="body" style={{ fontWeight: "600" }}>
          Statistics
        </ThemedText>
        <Feather
          name={showStats ? "chevron-up" : "chevron-down"}
          size={20}
          color={theme.text}
        />
      </Pressable>

      {showStats && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsContainer}
        >
          <View
            style={[
              styles.statChip,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <ThemedText type="small" muted>
              Total
            </ThemedText>
            <ThemedText type="h3" style={{ color: theme.accent }}>
              {statistics.total}
            </ThemedText>
          </View>
          <View
            style={[
              styles.statChip,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <ThemedText type="small" muted>
              Completed
            </ThemedText>
            <ThemedText type="h3" style={{ color: theme.success }}>
              {statistics.completed}
            </ThemedText>
          </View>
          <View
            style={[
              styles.statChip,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <ThemedText type="small" muted>
              In Progress
            </ThemedText>
            <ThemedText type="h3" style={{ color: theme.warning }}>
              {statistics.inProgress}
            </ThemedText>
          </View>
          <View
            style={[
              styles.statChip,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <ThemedText type="small" muted>
              Overdue
            </ThemedText>
            <ThemedText type="h3" style={{ color: theme.error }}>
              {statistics.overdue}
            </ThemedText>
          </View>
          <View
            style={[
              styles.statChip,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <ThemedText type="small" muted>
              Due Today
            </ThemedText>
            <ThemedText type="h3" style={{ color: theme.accent }}>
              {statistics.dueToday}
            </ThemedText>
          </View>
        </ScrollView>
      )}

      {/* Filter chips - Priority */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        <ThemedText type="small" muted style={styles.filterLabel}>
          Priority:
        </ThemedText>
        {PRIORITY_FILTERS.map((filter) => (
          <Pressable
            key={filter}
            onPress={() => {
              setPriorityFilter(filter);
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  priorityFilter === filter
                    ? theme.accent
                    : theme.backgroundSecondary,
              },
            ]}
          >
            <ThemedText
              type="small"
              style={{
                color:
                  priorityFilter === filter ? theme.buttonText : theme.text,
              }}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {/* Filter chips - Status */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        <ThemedText type="small" muted style={styles.filterLabel}>
          Status:
        </ThemedText>
        {STATUS_FILTERS.map((filter) => (
          <Pressable
            key={filter}
            onPress={() => {
              setStatusFilter(filter);
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  statusFilter === filter
                    ? theme.accent
                    : theme.backgroundSecondary,
              },
            ]}
          >
            <ThemedText
              type="small"
              style={{
                color: statusFilter === filter ? theme.buttonText : theme.text,
              }}
            >
              {filter === "in_progress"
                ? "In Progress"
                : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {/* Filter chips - Due Date */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        <ThemedText type="small" muted style={styles.filterLabel}>
          Due:
        </ThemedText>
        {DUE_DATE_FILTERS.map((filter) => (
          <Pressable
            key={filter}
            onPress={() => {
              setDueDateFilter(filter);
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  dueDateFilter === filter
                    ? theme.accent
                    : theme.backgroundSecondary,
              },
            ]}
          >
            <ThemedText
              type="small"
              style={{
                color: dueDateFilter === filter ? theme.buttonText : theme.text,
              }}
            >
              {filter === "week"
                ? "This Week"
                : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {/* Sort options */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        <ThemedText type="small" muted style={styles.filterLabel}>
          Sort:
        </ThemedText>
        {SORT_OPTIONS.map((option) => (
          <Pressable
            key={option}
            onPress={() => {
              setSortBy(option);
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  sortBy === option ? theme.accent : theme.backgroundSecondary,
              },
            ]}
          >
            <ThemedText
              type="small"
              style={{
                color: sortBy === option ? theme.buttonText : theme.text,
              }}
            >
              {option === "dueDate"
                ? "Due Date"
                : option === "alphabetical"
                  ? "A-Z"
                  : option === "updated"
                    ? "Recently Updated"
                    : "Priority"}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item) => item.task.id}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: Spacing.md,
            paddingBottom: insets.bottom + Spacing["5xl"] + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          listData.length > 0 ? (
            <View style={styles.listHeader}>
              <ThemedText type="caption" muted>
                {listData.length} {listData.length === 1 ? "task" : "tasks"}
              </ThemedText>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Image
              source={require("../../assets/images/empty-planner.png")}
              style={styles.emptyImage}
              resizeMode="contain"
            />
            <ThemedText type="h3" style={styles.emptyTitle}>
              {searchQuery ||
              priorityFilter !== "all" ||
              statusFilter !== "all" ||
              dueDateFilter !== "all"
                ? "No Matching Tasks"
                : "No Tasks Yet"}
            </ThemedText>
            <ThemedText type="body" secondary style={styles.emptyText}>
              {searchQuery ||
              priorityFilter !== "all" ||
              statusFilter !== "all" ||
              dueDateFilter !== "all"
                ? "Try adjusting your filters or search query"
                : "Tap + to create your first task. Add subtasks to turn any task into a project."}
            </ThemedText>
          </View>
        }
      />

      <Pressable
        onPress={handleAddTask}
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
        module="planner"
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.xs,
  },
  statsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  statsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  statChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    minWidth: 80,
    ...Shadows.card,
  },
  filterContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
    alignItems: "center",
  },
  filterLabel: {
    marginRight: Spacing.xs,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  listHeader: {
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
    ...Shadows.card,
  },
  subtaskCard: {
    marginLeft: Spacing.xl,
    opacity: 0.9,
  },
  priorityIndicator: {
    width: 4,
    height: 32,
    borderRadius: 2,
  },
  expandButton: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  taskContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  taskTitle: {
    marginBottom: Spacing.xs,
    flex: 1,
  },
  projectBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  completedTask: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  taskMeta: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  addSubtaskButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
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
  secondaryNav: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  secondaryNavContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
  },
  secondaryNavButton: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  pressed: {
    opacity: 0.7,
  },
});
