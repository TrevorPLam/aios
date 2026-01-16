/**
 * TaskDetailScreen - Task creation and editing screen
 *
 * Features:
 * - Create new tasks or edit existing ones
 * - Set title, priority, status, due date, and recurrence
 * - Add user notes
 * - View AI-generated notes
 * - Support for subtasks (parent task context)
 * - Quick date selection (Today, Tomorrow, This Week, Next Week, Custom)
 * - Due date picker with modal interface
 * - Delete task functionality
 * - AI assistance integration
 *
 * @module TaskDetailScreen
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { db } from "@/storage/database";
import { Task, TaskPriority, TaskStatus, RecurrenceRule } from "@/models/types";
import { generateId, formatDate } from "@/utils/helpers";
import AIAssistSheet from "@/components/AIAssistSheet";

type RouteProps = RouteProp<AppStackParamList, "TaskDetail">;

const PRIORITIES: TaskPriority[] = ["low", "medium", "high", "urgent"];
const STATUSES: TaskStatus[] = [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
];
const RECURRENCE: RecurrenceRule[] = ["none", "daily", "weekly", "monthly"];

/**
 * Quick date selection options for common due dates
 */
const QUICK_DATES = [
  { label: "Today", getValue: () => new Date() },
  {
    label: "Tomorrow",
    getValue: () => {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      return date;
    },
  },
  {
    label: "This Week",
    getValue: () => {
      const date = new Date();
      const day = date.getDay();
      const diff = 7 - day; // Days until end of week (Sunday)
      date.setDate(date.getDate() + diff);
      return date;
    },
  },
  {
    label: "Next Week",
    getValue: () => {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date;
    },
  },
];

export default function TaskDetailScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();

  const [title, setTitle] = useState("");
  const [userNotes, setUserNotes] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("pending");
  const [recurrence, setRecurrence] = useState<RecurrenceRule>("none");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [aiNotes, setAiNotes] = useState<string[]>([]);
  const [showAISheet, setShowAISheet] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [taskId, setTaskId] = useState<string>("");
  const [parentTaskId, setParentTaskId] = useState<string | null>(null);
  const [parentTask, setParentTask] = useState<Task | null>(null);

  useEffect(() => {
    async function loadData() {
      if (route.params?.taskId) {
        const task = await db.tasks.get(route.params.taskId);
        if (task) {
          setTitle(task.title);
          setUserNotes(task.userNotes);
          setPriority(task.priority);
          setStatus(task.status);
          setRecurrence(task.recurrenceRule);
          setDueDate(task.dueDate);
          setAiNotes(task.aiNotes);
          setParentTaskId(task.parentTaskId);
          setTaskId(task.id);
          setIsNew(false);

          if (task.parentTaskId) {
            const parent = await db.tasks.get(task.parentTaskId);
            setParentTask(parent);
          }
        }
      } else {
        setTaskId(generateId());
        setIsNew(true);

        if (route.params?.parentTaskId) {
          setParentTaskId(route.params.parentTaskId);
          const parent = await db.tasks.get(route.params.parentTaskId);
          setParentTask(parent);
        }
      }
    }
    loadData();
  }, [route.params?.taskId, route.params?.parentTaskId]);

  /**
   * Save task with all current form values including due date
   */
  const saveTask = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    const existingTask = isNew ? null : await db.tasks.get(taskId);

    const task: Task = {
      id: taskId,
      title: title.trim(),
      userNotes,
      aiNotes: aiNotes || [],
      priority,
      dueDate, // Use the dueDate state value
      status,
      recurrenceRule: recurrence,
      projectId: null,
      parentTaskId: parentTaskId,
      dependencyIds: existingTask?.dependencyIds || [],
      createdAt: isNew
        ? new Date().toISOString()
        : existingTask?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.tasks.save(task);

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    navigation.goBack();
  }, [
    taskId,
    title,
    userNotes,
    aiNotes,
    priority,
    dueDate, // Add dueDate to dependencies
    status,
    recurrence,
    parentTaskId,
    isNew,
    navigation,
  ]);

  const handleDelete = useCallback(async () => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await db.tasks.delete(taskId);
          navigation.goBack();
        },
      },
    ]);
  }, [taskId, navigation]);

  /**
   * Set due date to a quick date option (Today, Tomorrow, etc.)
   */
  const setQuickDate = useCallback((dateGetter: () => Date) => {
    const date = dateGetter();
    setDueDate(date.toISOString());
    setShowDatePicker(false);

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  /**
   * Clear the due date
   */
  const clearDueDate = useCallback(() => {
    setDueDate(null);
    setShowDatePicker(false);

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  /**
   * Format due date for display
   */
  const formatDueDate = (dateStr: string | null): string => {
    if (!dateStr) return "No due date";

    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }

    // Check if it's tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    }

    // Otherwise return formatted date
    return formatDate(dateStr);
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: parentTaskId ? "Subtask" : "Task",
      headerRight: () => (
        <View style={styles.headerActions}>
          {!isNew && (
            <Pressable
              onPress={handleDelete}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Feather name="trash-2" size={20} color={theme.error} />
            </Pressable>
          )}
        </View>
      ),
    });
  }, [navigation, theme, isNew, handleDelete, parentTaskId]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Spacing.md,
            paddingBottom: insets.bottom + Spacing["5xl"],
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {parentTask ? (
          <View
            style={[styles.parentBadge, { backgroundColor: theme.accentDim }]}
          >
            <Feather name="corner-down-right" size={14} color={theme.accent} />
            <ThemedText type="small" style={{ color: theme.accent }}>
              Subtask of: {parentTask.title}
            </ThemedText>
          </View>
        ) : null}

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder={parentTaskId ? "Subtask Title" : "Task Title"}
          placeholderTextColor={theme.textMuted}
          style={[styles.titleInput, { color: theme.text }]}
        />

        <ThemedText type="caption" secondary style={styles.label}>
          Priority
        </ThemedText>
        <View style={styles.optionRow}>
          {PRIORITIES.map((p) => (
            <Pressable
              key={p}
              onPress={() => setPriority(p)}
              style={[
                styles.optionButton,
                {
                  backgroundColor:
                    priority === p ? theme.accentDim : theme.backgroundDefault,
                },
              ]}
            >
              <ThemedText
                type="small"
                style={{
                  color: priority === p ? theme.accent : theme.textSecondary,
                  textTransform: "capitalize",
                }}
              >
                {p}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <ThemedText type="caption" secondary style={styles.label}>
          Status
        </ThemedText>
        <View style={styles.optionRow}>
          {STATUSES.map((s) => (
            <Pressable
              key={s}
              onPress={() => setStatus(s)}
              style={[
                styles.optionButton,
                {
                  backgroundColor:
                    status === s ? theme.accentDim : theme.backgroundDefault,
                },
              ]}
            >
              <ThemedText
                type="small"
                style={{
                  color: status === s ? theme.accent : theme.textSecondary,
                  textTransform: "capitalize",
                }}
              >
                {s.replace("_", " ")}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <ThemedText type="caption" secondary style={styles.label}>
          Recurrence
        </ThemedText>
        <View style={styles.optionRow}>
          {RECURRENCE.map((r) => (
            <Pressable
              key={r}
              onPress={() => setRecurrence(r)}
              style={[
                styles.optionButton,
                {
                  backgroundColor:
                    recurrence === r
                      ? theme.accentDim
                      : theme.backgroundDefault,
                },
              ]}
            >
              <ThemedText
                type="small"
                style={{
                  color: recurrence === r ? theme.accent : theme.textSecondary,
                  textTransform: "capitalize",
                }}
              >
                {r}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <ThemedText type="caption" secondary style={styles.label}>
          Due Date
        </ThemedText>
        <Pressable
          onPress={() => {
            setShowDatePicker(true);
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }}
          style={[
            styles.dueDateButton,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: dueDate ? theme.accent : theme.border,
            },
          ]}
        >
          <Feather
            name="calendar"
            size={16}
            color={dueDate ? theme.accent : theme.textSecondary}
          />
          <ThemedText
            type="body"
            style={{
              color: dueDate ? theme.accent : theme.textSecondary,
              flex: 1,
            }}
          >
            {formatDueDate(dueDate)}
          </ThemedText>
          {dueDate && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                clearDueDate();
              }}
              hitSlop={8}
            >
              <Feather name="x" size={16} color={theme.textMuted} />
            </Pressable>
          )}
        </Pressable>

        <ThemedText type="caption" secondary style={styles.label}>
          Your Notes
        </ThemedText>
        <TextInput
          value={userNotes}
          onChangeText={setUserNotes}
          placeholder="Add your notes..."
          placeholderTextColor={theme.textMuted}
          style={[
            styles.notesInput,
            { color: theme.text, backgroundColor: theme.backgroundDefault },
          ]}
          multiline
          textAlignVertical="top"
        />

        {aiNotes.length > 0 && (
          <>
            <View style={styles.aiNotesHeader}>
              <Feather name="cpu" size={16} color={theme.accent} />
              <ThemedText type="caption" style={{ color: theme.accent }}>
                AI Generated Notes
              </ThemedText>
            </View>
            <View
              style={[
                styles.aiNotesContainer,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              {aiNotes.map((note, index) => (
                <View key={index} style={styles.aiNoteItem}>
                  <View
                    style={[
                      styles.aiNoteBullet,
                      { backgroundColor: theme.accent },
                    ]}
                  />
                  <ThemedText type="body" secondary>
                    {note}
                  </ThemedText>
                </View>
              ))}
            </View>
          </>
        )}

        <Pressable
          onPress={() => setShowAISheet(true)}
          style={[styles.aiButton, { backgroundColor: theme.accentDim }]}
        >
          <Feather name="cpu" size={20} color={theme.accent} />
          <ThemedText type="body" style={{ color: theme.accent }}>
            Get AI Suggestions
          </ThemedText>
        </Pressable>

        <Button onPress={saveTask} style={styles.saveButton}>
          {isNew
            ? parentTaskId
              ? "Create Subtask"
              : "Create Task"
            : "Save Changes"}
        </Button>
      </ScrollView>

      <AIAssistSheet
        visible={showAISheet}
        onClose={() => setShowAISheet(false)}
        module="planner"
        onAction={(actionId) => {
          switch (actionId) {
            case "priority":
              setPriority("high");
              setAiNotes([
                ...aiNotes,
                "Recommended high priority based on upcoming deadline",
              ]);
              break;
            case "breakdown":
              setAiNotes([
                ...aiNotes,
                "Consider breaking this into: Research, Implementation, Testing",
              ]);
              break;
          }
        }}
      />

      {/* Due Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowDatePicker(false)}
        >
          <Pressable
            style={[
              styles.modalContent,
              { backgroundColor: theme.backgroundSecondary },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <ThemedText type="h3">Set Due Date</ThemedText>
              <Pressable onPress={() => setShowDatePicker(false)} hitSlop={8}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <View style={styles.quickDatesContainer}>
              {QUICK_DATES.map((quickDate) => (
                <Pressable
                  key={quickDate.label}
                  onPress={() => setQuickDate(quickDate.getValue)}
                  style={[
                    styles.quickDateButton,
                    { backgroundColor: theme.backgroundDefault },
                  ]}
                >
                  <Feather name="calendar" size={18} color={theme.accent} />
                  <ThemedText type="body">{quickDate.label}</ThemedText>
                </Pressable>
              ))}
            </View>

            {dueDate && (
              <Pressable
                onPress={clearDueDate}
                style={[
                  styles.clearDateButton,
                  { backgroundColor: theme.backgroundDefault },
                ]}
              >
                <Feather name="x-circle" size={18} color={theme.error} />
                <ThemedText type="body" style={{ color: theme.error }}>
                  Clear Due Date
                </ThemedText>
              </Pressable>
            )}

            <Button
              onPress={() => setShowDatePicker(false)}
              style={styles.doneButton}
            >
              Done
            </Button>
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
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  headerActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  headerButton: {
    padding: Spacing.xs,
  },
  parentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: Spacing.xl,
  },
  label: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  optionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  notesInput: {
    fontSize: 16,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    minHeight: 100,
  },
  aiNotesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  aiNotesContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  aiNoteItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  aiNoteBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xl,
  },
  saveButton: {
    marginTop: Spacing.lg,
  },
  dueDateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    maxWidth: 400,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    ...Shadows.card,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  quickDatesContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  quickDateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  clearDateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  doneButton: {
    marginTop: 0,
  },
});
