/**
 * Planner (Task) Mini-Mode Component
 *
 * Purpose (Plain English):
 * A compact task creator that can be embedded in other screens. Allows users
 * to quickly create tasks without navigating away from their current context.
 *
 * What it interacts with:
 * - Task Database: Creates tasks
 * - Event Bus: Emits TaskCreated event after saving
 * - Mini-Mode Registry: Returns result via onComplete callback
 *
 * Safe AI extension points:
 * - Add smart priority suggestions based on title
 * - Add project selection
 * - Add AI-powered task breakdown for complex tasks
 * - Pre-fill due date based on context (e.g., meeting time from calendar)
 *
 * Warnings:
 * - Keep form simple - advanced features belong in full screen editor
 * - Validate all inputs before saving
 * - Handle database errors gracefully
 */

import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Platform,
  Alert,
  TouchableOpacity,
} from "react-native";
import * as Haptics from "expo-haptics";

import { MiniModeComponentProps, MiniModeResult } from "../../lib/miniMode";
import { eventBus, EVENT_TYPES } from "../../lib/eventBus";
import { database } from "../../storage/database";
import { ThemedText } from "../ThemedText";
import { Button } from "../Button";
import { Spacing, Typography } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";
import type { Task, TaskStatus } from "../../models/types";

interface TaskMiniModeData {
  title?: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  dueDate?: Date;
}

/**
 * Task Mini-Mode Component
 *
 * Plain English:
 * Quick form to create a task. Shows title, priority, and optional due date.
 * Designed for speed - create a task in under 10 seconds.
 *
 * Technical:
 * Controlled form with local state, validates on submit, creates task via database,
 * emits event to event bus, returns result via onComplete callback.
 */
export function TaskMiniMode({
  initialData,
  onComplete,
  onDismiss,
  source,
}: MiniModeComponentProps<TaskMiniModeData>) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [priority, setPriority] = useState<Task["priority"]>(
    initialData?.priority || "medium",
  );
  const [saving, setSaving] = useState(false);

  /**
   * Handle form submission
   *
   * Plain English: Validate inputs, create task, notify caller
   * Technical: Async database operation with error handling
   */
  const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert("Required Field", "Please enter a task title");
      return;
    }

    setSaving(true);

    try {
      // Create task in database
      const newTask: Partial<Task> = {
        title: title.trim(),
        userNotes: description.trim() || "",
        aiNotes: [],
        priority,
        status: "pending" as TaskStatus,
        dueDate: initialData?.dueDate?.toISOString() || null,
        projectId: null,
        parentTaskId: null,
        dependencyIds: [],
        recurrenceRule: "none",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await database.tasks.save(newTask as any);

      // Use our data since save returns void
      const taskData = {
        ...newTask,
        id: newTask.id || Date.now().toString(),
      } as Task;

      eventBus.emit(EVENT_TYPES.TASK_CREATED, {
        task: taskData,
        source: source || "mini_mode",
      });

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      const result: MiniModeResult<Task> = {
        action: "created",
        data: taskData,
        module: "planner",
      };

      onComplete(result);
    } catch (error) {
      console.error("[TaskMiniMode] Error creating task:", error);

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      Alert.alert("Error", "Failed to create task. Please try again.", [
        { text: "OK" },
      ]);

      setSaving(false);
    }
  };

  /**
   * Get priority color
   *
   * Plain English: Each priority level has a distinct color
   * Technical: Maps priority enum to color constant
   */
  const getPriorityColor = (p: Task["priority"]): string => {
    switch (p) {
      case "urgent":
        return theme.error;
      case "high":
        return theme.warning;
      case "medium":
        return theme.electricBlue;
      case "low":
        return theme.success;
      default:
        return theme.textSecondary;
    }
  };

  /**
   * Priority selector component
   *
   * Plain English: Four buttons to choose task priority
   * Technical: TouchableOpacity array with selected state styling
   */
  const priorityOptions: Task["priority"][] = [
    "low",
    "medium",
    "high",
    "urgent",
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.handleBar} />
        <ThemedText style={styles.headerTitle}>Quick Task</ThemedText>
        <ThemedText style={styles.headerSubtitle}>Create a new task</ThemedText>
      </View>

      {/* Form */}
      <ScrollView
        style={styles.form}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.field}>
          <ThemedText style={styles.label}>Task *</ThemedText>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="What needs to be done?"
            placeholderTextColor={theme.textTertiary}
            autoFocus
            maxLength={200}
            accessible={true}
            accessibilityLabel="Task title"
            accessibilityHint="Required field"
          />
        </View>

        {/* Priority */}
        <View style={styles.field}>
          <ThemedText style={styles.label}>Priority</ThemedText>
          <View style={styles.priorityRow}>
            {priorityOptions.map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityButton,
                  priority === p && {
                    borderColor: getPriorityColor(p),
                    backgroundColor: `${getPriorityColor(p)}20`,
                  },
                ]}
                onPress={() => {
                  setPriority(p);
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`${p} priority`}
                accessibilityState={{ selected: priority === p }}
              >
                <ThemedText
                  style={[
                    styles.priorityText,
                    priority === p && {
                      color: getPriorityColor(p),
                      fontWeight: "600",
                    },
                  ]}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.field}>
          <ThemedText style={styles.label}>Notes</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add details (optional)"
            placeholderTextColor={theme.textTertiary}
            multiline
            numberOfLines={3}
            maxLength={500}
            accessible={true}
            accessibilityLabel="Task notes"
          />
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          onPress={onDismiss}
          disabled={saving}
          style={styles.actionButton}
        >
          <ThemedText>Cancel</ThemedText>
        </Button>
        <Button
          onPress={handleSave}
          disabled={saving}
          style={styles.actionButton}
        >
          <ThemedText>{saving ? "Saving..." : "Create Task"}</ThemedText>
        </Button>
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    container: {
      maxHeight: "100%",
    },
    header: {
      alignItems: "center",
      paddingTop: Spacing.sm,
      paddingBottom: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    handleBar: {
      width: 40,
      height: 4,
      backgroundColor: theme.textTertiary,
      borderRadius: 2,
      marginBottom: Spacing.sm,
    },
    headerTitle: {
      fontSize: Typography.sizes.h2,
      fontWeight: "600",
      color: theme.electricBlue,
    },
    headerSubtitle: {
      fontSize: Typography.sizes.caption,
      color: theme.textSecondary,
      marginTop: 4,
    },
    form: {
      paddingVertical: Spacing.md,
      maxHeight: 400,
    },
    field: {
      marginBottom: Spacing.md,
    },
    label: {
      fontSize: Typography.sizes.body,
      fontWeight: "500",
      color: theme.textPrimary,
      marginBottom: Spacing.xs,
    },
    input: {
      backgroundColor: theme.deepSpace,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      fontSize: Typography.sizes.body,
      color: theme.textPrimary,
    },
    textArea: {
      paddingTop: Spacing.sm,
      minHeight: 80,
      textAlignVertical: "top",
    },
    priorityRow: {
      flexDirection: "row",
      gap: Spacing.xs,
    },
    priorityButton: {
      flex: 1,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.xs,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.deepSpace,
      alignItems: "center",
    },
    priorityText: {
      fontSize: Typography.sizes.caption,
      color: theme.textSecondary,
    },
    spacer: {
      height: Spacing.lg,
    },
    actions: {
      flexDirection: "row",
      gap: Spacing.sm,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.xs,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    actionButton: {
      flex: 1,
    },
  });
