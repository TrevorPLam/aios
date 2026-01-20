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
import { eventBus } from "../../lib/eventBus";
import { database } from "../../storage/database";
import { ThemedText } from "../ThemedText";
import { Button } from "../Button";
import { Colors, Spacing, Typography } from "../../constants/theme";
import type { Task } from "../../models/types";

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
        description: description.trim() || undefined,
        priority,
        status: "todo",
        dueDate: initialData?.dueDate?.toISOString(),
        projectId: null,
        subtasks: [],
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const createdTask = await database.tasks.createTask(newTask);

      // Emit event to event bus for cross-module coordination
      eventBus.emit({
        type: "TaskCreated",
        payload: {
          task: createdTask,
          source: source || "mini_mode",
        },
        metadata: {
          timestamp: new Date().toISOString(),
        },
      });

      // Haptic feedback on success
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Notify caller with result
      const result: MiniModeResult<Task> = {
        action: "created",
        data: createdTask,
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
        return Colors.error;
      case "high":
        return Colors.warning;
      case "medium":
        return Colors.electricBlue;
      case "low":
        return Colors.success;
      default:
        return Colors.textSecondary;
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
            placeholderTextColor={Colors.textTertiary}
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
            placeholderTextColor={Colors.textTertiary}
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
          label="Cancel"
          onPress={onDismiss}
          variant="secondary"
          style={styles.actionButton}
          disabled={saving}
          accessibilityLabel="Cancel task creation"
        />
        <Button
          label={saving ? "Saving..." : "Create Task"}
          onPress={handleSave}
          variant="primary"
          style={styles.actionButton}
          disabled={saving}
          accessibilityLabel="Create task"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: "100%",
  },
  header: {
    alignItems: "center",
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: Colors.textTertiary,
    borderRadius: 2,
    marginBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.sizes.h2,
    fontWeight: "600",
    color: Colors.electricBlue,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
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
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.deepSpace,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.sizes.body,
    color: Colors.textPrimary,
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
    borderColor: Colors.border,
    backgroundColor: Colors.deepSpace,
    alignItems: "center",
  },
  priorityText: {
    fontSize: Typography.sizes.caption,
    color: Colors.textSecondary,
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
    borderTopColor: Colors.border,
  },
  actionButton: {
    flex: 1,
  },
});
