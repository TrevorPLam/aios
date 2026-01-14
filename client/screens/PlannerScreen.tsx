import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { db } from "@/storage/database";
import { Task } from "@/models/types";
import { formatDate, getPriorityColor } from "@/utils/helpers";
import { BottomNav } from "@/components/BottomNav";
import AIAssistSheet from "@/components/AIAssistSheet";
import { HeaderLeftNav, HeaderRightWithAction } from "@/components/HeaderNav";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

interface TaskWithSubtasks extends Task {
  subtasks: Task[];
  isExpanded?: boolean;
}

function TaskCard({
  task,
  onPress,
  index,
  isSubtask = false,
  hasSubtasks = false,
  isExpanded = false,
  onToggleExpand,
  onAddSubtask,
}: {
  task: Task;
  onPress: () => void;
  index: number;
  isSubtask?: boolean;
  hasSubtasks?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onAddSubtask?: () => void;
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
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isCompleted
                  ? theme.successDim
                  : theme.backgroundSecondary,
              },
            ]}
          >
            <Feather
              name={isCompleted ? "check" : "circle"}
              size={16}
              color={isCompleted ? theme.success : theme.textMuted}
            />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function PlannerScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NavigationProp>();

  const [tasks, setTasks] = useState<TaskWithSubtasks[]>([]);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [showAISheet, setShowAISheet] = useState(false);

  const loadData = useCallback(async () => {
    const allTasks = await db.tasks.getAll();

    const topLevel = allTasks.filter((t) => !t.parentTaskId);

    const buildSubtasksRecursive = (parentId: string): Task[] => {
      return allTasks.filter((t) => t.parentTaskId === parentId);
    };

    const tasksWithSubtasks: TaskWithSubtasks[] = topLevel.map((task) => ({
      ...task,
      subtasks: buildSubtasksRecursive(task.id),
    }));

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
      headerRight: () => (
        <HeaderRightWithAction
          actionIcon="plus"
          onActionPress={() => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            navigation.navigate("TaskDetail", {});
          }}
        />
      ),
    });
  }, [navigation, theme]);

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

  const buildListData = () => {
    const result: {
      type: "task" | "subtask";
      task: Task;
      parentHasSubtasks: boolean;
      index: number;
    }[] = [];
    let index = 0;

    tasks.forEach((task) => {
      const hasSubtasks = task.subtasks.length > 0;
      result.push({
        type: "task",
        task,
        parentHasSubtasks: hasSubtasks,
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
        onPress={() =>
          navigation.navigate("TaskDetail", { taskId: item.task.id })
        }
        onToggleExpand={() => toggleExpand(item.task.id)}
        onAddSubtask={() => handleAddSubtask(item.task.id)}
      />
    );
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item) => item.task.id}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.md,
            paddingBottom: insets.bottom + Spacing["5xl"] + 80,
          },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          listData.length > 0 ? (
            <View style={styles.listHeader}>
              <ThemedText type="caption" muted>
                Tasks with subtasks become projects
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
              No Tasks Yet
            </ThemedText>
            <ThemedText type="body" secondary style={styles.emptyText}>
              Tap + to create your first task. Add subtasks to turn any task
              into a project.
            </ThemedText>
          </View>
        }
      />

      <View
        style={[
          styles.bottomNavContainer,
          { bottom: insets.bottom + Spacing.lg },
        ]}
      >
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
  bottomNavContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
});
