/**
 * Calendar Mini-Mode Component
 *
 * Purpose (Plain English):
 * A compact calendar event creator that can be embedded in other screens.
 * Allows users to quickly create calendar events without leaving their current
 * context (e.g., from Messages when someone suggests a meeting time).
 *
 * What it interacts with:
 * - Calendar Database: Creates events
 * - Event Bus: Emits CalendarEventCreated event after saving
 * - Mini-Mode Registry: Returns result via onComplete callback
 *
 * Safe AI extension points:
 * - Add smart defaults based on context (e.g., pre-fill from message content)
 * - Add recurrence support
 * - Add location/reminder quick options
 * - Enhance date/time picker UX
 *
 * Warnings:
 * - Keep form simple - this is "quick create", not full event editor
 * - Must handle keyboard properly (doesn't overflow screen)
 * - Validate all inputs before saving
 * - Always provide feedback on success/error
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
import { eventBus } from "../../lib/eventBus";
import { database } from "../../storage/database";
import { ThemedText } from "../ThemedText";
import { Button } from "../Button";
import { Colors, Spacing, Typography } from "../../constants/theme";
import type { CalendarEvent } from "../../models/types";

interface CalendarMiniModeData {
  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  location?: string;
}

/**
 * Calendar Mini-Mode Component
 *
 * Plain English:
 * Quick form to create a calendar event. Shows title, date/time, and optional
 * description. Minimal fields for speed, but enough to create useful events.
 *
 * Technical:
 * Controlled form with local state, validates on submit, creates event via database,
 * emits event to event bus, returns result via onComplete callback.
 */
export function CalendarMiniMode({
  initialData,
  onComplete,
  onDismiss,
  source,
}: MiniModeComponentProps<CalendarMiniModeData>) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [startDate, setStartDate] = useState(
    initialData?.startDate || new Date(),
  );
  const [endDate, setEndDate] = useState(
    initialData?.endDate || new Date(Date.now() + 60 * 60 * 1000), // +1 hour
  );
  const [location, setLocation] = useState(initialData?.location || "");
  const [saving, setSaving] = useState(false);

  /**
   * Handle form submission
   *
   * Plain English: Validate inputs, create event, notify caller
   * Technical: Async database operation with error handling
   */
  const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert("Required Field", "Please enter an event title");
      return;
    }

    if (endDate <= startDate) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert("Invalid Time", "End time must be after start time");
      return;
    }

    setSaving(true);

    try {
      // Create event in database
      const newEvent: Partial<CalendarEvent> = {
        title: title.trim(),
        description: description.trim() || undefined,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        location: location.trim() || undefined,
        isAllDay: false,
        color: Colors.electricBlue,
        // Defaults
        recurrence: undefined,
        reminders: [],
        attendees: [],
        status: "confirmed",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const createdEvent = await database.calendar.createEvent(newEvent);

      // Emit event to event bus for cross-module coordination
      eventBus.emit({
        type: "CalendarEventCreated",
        payload: {
          event: createdEvent,
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
      const result: MiniModeResult<CalendarEvent> = {
        action: "created",
        data: createdEvent,
        module: "calendar",
      };

      onComplete(result);
    } catch (error) {
      console.error("[CalendarMiniMode] Error creating event:", error);

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      Alert.alert("Error", "Failed to create event. Please try again.", [
        { text: "OK" },
      ]);

      setSaving(false);
    }
  };

  /**
   * Format date for display
   *
   * Plain English: Show date in readable format (e.g., "Jan 16, 2026 at 2:30 PM")
   * Technical: Uses toLocaleString for locale-aware formatting
   */
  const formatDateTime = (date: Date): string => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.handleBar} />
        <ThemedText style={styles.headerTitle}>Quick Event</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Create a calendar event
        </ThemedText>
      </View>

      {/* Form */}
      <ScrollView
        style={styles.form}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.field}>
          <ThemedText style={styles.label}>Title *</ThemedText>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Meeting, appointment, etc."
            placeholderTextColor={Colors.textTertiary}
            autoFocus
            maxLength={100}
            accessible={true}
            accessibilityLabel="Event title"
            accessibilityHint="Required field"
          />
        </View>

        {/* Start Date/Time */}
        <View style={styles.field}>
          <ThemedText style={styles.label}>Start</ThemedText>
          <View style={styles.dateTimeRow}>
            <ThemedText style={styles.dateTimeText}>
              {formatDateTime(startDate)}
            </ThemedText>
            {/* 
              Note: In production, this would open a DateTimePicker.
              For now, shows current value. Placeholder for future enhancement.
            */}
          </View>
        </View>

        {/* End Date/Time */}
        <View style={styles.field}>
          <ThemedText style={styles.label}>End</ThemedText>
          <View style={styles.dateTimeRow}>
            <ThemedText style={styles.dateTimeText}>
              {formatDateTime(endDate)}
            </ThemedText>
          </View>
        </View>

        {/* Location */}
        <View style={styles.field}>
          <ThemedText style={styles.label}>Location</ThemedText>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Add location (optional)"
            placeholderTextColor={Colors.textTertiary}
            maxLength={200}
            accessible={true}
            accessibilityLabel="Event location"
          />
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
            accessibilityLabel="Event notes"
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
          accessibilityLabel="Cancel event creation"
        />
        <Button
          label={saving ? "Saving..." : "Save Event"}
          onPress={handleSave}
          variant="primary"
          style={styles.actionButton}
          disabled={saving}
          accessibilityLabel="Save event"
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
  dateTimeRow: {
    backgroundColor: Colors.deepSpace,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  dateTimeText: {
    fontSize: Typography.sizes.body,
    color: Colors.textPrimary,
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
