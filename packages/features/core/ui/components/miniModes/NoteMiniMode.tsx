/**
 * Notebook Mini-Mode Component
 *
 * Purpose (Plain English):
 * Quick note capture that can be embedded in other screens. Perfect for jotting
 * down ideas, meeting notes, or quick thoughts without leaving your current context.
 *
 * What it interacts with:
 * - Notes Database: Creates notes
 * - Event Bus: Emits NoteCreated event after saving
 * - Mini-Mode Registry: Returns result via onComplete callback
 *
 * Safe AI extension points:
 * - Add smart tag suggestions based on content
 * - Add template selection for common note types
 * - Auto-link to related notes
 *
 * Warnings:
 * - Keep it fast - this is for quick capture, not full editing
 * - Don't auto-save - user must explicitly save
 */

import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import * as Haptics from "expo-haptics";

import { MiniModeComponentProps, MiniModeResult } from "../../lib/miniMode";
import { eventBus, EVENT_TYPES } from "../../lib/eventBus";
import { database } from "../../storage/database";
import { ThemedText } from "../ThemedText";
import { Button } from "../Button";
import { Spacing, Typography } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";
import type { Note } from "../../models/types";

interface NoteMiniModeData {
  title?: string;
  body?: string;
  tags?: string[];
}

export function NoteMiniMode({
  initialData,
  onComplete,
  onDismiss,
  source,
}: MiniModeComponentProps<NoteMiniModeData>) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [title, setTitle] = useState(initialData?.title || "");
  const [body, setBody] = useState(initialData?.body || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() && !body.trim()) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert("Empty Note", "Please enter a title or note content");
      return;
    }

    setSaving(true);

    try {
      const newNote: Partial<Note> = {
        title: title.trim() || "Quick Note",
        bodyMarkdown: body.trim(),
        tags: initialData?.tags || [],
        links: [],
        isPinned: false,
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await database.notes.save(newNote as any);

      // Use our data since save returns void
      const noteData = { ...newNote, id: newNote.id || Date.now().toString() } as Note;
      
      eventBus.emit(
        EVENT_TYPES.NOTE_CREATED,
        { note: noteData, source: source || "mini_mode" },
      );

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      const result: MiniModeResult<Note> = {
        action: "created",
        data: noteData,
        module: "notebook",
      };

      onComplete(result);
    } catch (error) {
      console.error("[NoteMiniMode] Error creating note:", error);

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      Alert.alert("Error", "Failed to create note. Please try again.");
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.handleBar} />
        <ThemedText style={styles.headerTitle}>Quick Note</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Capture your thoughts
        </ThemedText>
      </View>

      <ScrollView
        style={styles.form}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.field}>
          <ThemedText style={styles.label}>Title (optional)</ThemedText>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Give your note a title"
            placeholderTextColor={theme.textTertiary}
            maxLength={100}
            accessible={true}
            accessibilityLabel="Note title"
          />
        </View>

        <View style={styles.field}>
          <ThemedText style={styles.label}>Note</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={body}
            onChangeText={setBody}
            placeholder="What's on your mind?"
            placeholderTextColor={theme.textTertiary}
            multiline
            numberOfLines={6}
            autoFocus
            accessible={true}
            accessibilityLabel="Note content"
          />
        </View>

        <View style={styles.spacer} />
      </ScrollView>

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
          <ThemedText>{saving ? "Saving..." : "Save Note"}</ThemedText>
        </Button>
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>['theme']) => StyleSheet.create({
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
    minHeight: 150,
    textAlignVertical: "top",
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
