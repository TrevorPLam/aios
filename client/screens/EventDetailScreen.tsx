/**
 * EventDetailScreen Module
 *
 * Screen for creating and editing calendar events.
 * Features:
 * - Create new events or edit existing ones
 * - Set event title, description, and location
 * - Toggle all-day events
 * - Configure recurrence rules (none, daily, weekly, monthly)
 * - Date/time selection (placeholder for full date picker)
 * - Delete existing events
 * - Form validation for required fields
 * - Haptic feedback for user actions
 *
 * @module EventDetailScreen
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
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { db } from "@/storage/database";
import { CalendarEvent, RecurrenceRule } from "@/models/types";
import { generateId } from "@/utils/helpers";

type RouteProps = RouteProp<AppStackParamList, "EventDetail">;

/** Available recurrence rule options */
const RECURRENCE: RecurrenceRule[] = ["none", "daily", "weekly", "monthly"];

/**
 * EventDetailScreen Component
 *
 * Form screen for creating or editing a calendar event.
 * Loads existing event data if eventId is provided in route params,
 * or initializes with date if provided.
 *
 * @returns {JSX.Element} The event detail screen component
 */
export default function EventDetailScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [recurrence, setRecurrence] = useState<RecurrenceRule>("none");
  const [isNew, setIsNew] = useState(true);
  const [eventId, setEventId] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>(new Date());

  // Load event data on mount if editing, or initialize with date if creating
  useEffect(() => {
    async function loadData() {
      if (route.params?.eventId) {
        // Editing existing event
        const event = await db.events.get(route.params.eventId);
        if (event) {
          setTitle(event.title);
          setDescription(event.description);
          setLocation(event.location);
          setAllDay(event.allDay);
          setRecurrence(event.recurrenceRule);
          setStartDate(new Date(event.startAt));
          setEventId(event.id);
          setIsNew(false);
        }
      } else {
        // Creating new event
        setEventId(generateId());
        setIsNew(true);
        if (route.params?.date) {
          setStartDate(new Date(route.params.date));
        }
      }
    }
    loadData();
  }, [route.params?.eventId, route.params?.date]);

  /**
   * Save event to database
   * Validates required fields and creates/updates the event
   */
  const saveEvent = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);

    const event: CalendarEvent = {
      id: eventId,
      title: title.trim(),
      description,
      location,
      startAt: startDate.toISOString(),
      endAt: endDate.toISOString(),
      allDay,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      recurrenceRule: recurrence,
      exceptions: [],
      overrides: {},
      createdAt: isNew
        ? new Date().toISOString()
        : (await db.events.get(eventId))?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: "LOCAL",
    };

    await db.events.save(event);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    navigation.goBack();
  }, [
    eventId,
    title,
    description,
    location,
    startDate,
    allDay,
    recurrence,
    isNew,
    navigation,
  ]);

  const handleDelete = useCallback(async () => {
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await db.events.delete(eventId);
          navigation.goBack();
        },
      },
    ]);
  }, [eventId, navigation]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
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
  }, [navigation, theme, isNew, handleDelete]);

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
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Event Title"
          placeholderTextColor={theme.textMuted}
          style={[styles.titleInput, { color: theme.text }]}
        />

        <View
          style={[styles.field, { backgroundColor: theme.backgroundDefault }]}
        >
          <Feather name="map-pin" size={20} color={theme.textMuted} />
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Add location"
            placeholderTextColor={theme.textMuted}
            style={[styles.fieldInput, { color: theme.text }]}
          />
        </View>

        <View
          style={[styles.field, { backgroundColor: theme.backgroundDefault }]}
        >
          <Feather name="align-left" size={20} color={theme.textMuted} />
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Add description"
            placeholderTextColor={theme.textMuted}
            style={[styles.fieldInput, { color: theme.text }]}
            multiline
          />
        </View>

        <View
          style={[
            styles.switchRow,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <View style={styles.switchLabel}>
            <Feather name="sun" size={20} color={theme.textMuted} />
            <ThemedText type="body">All Day</ThemedText>
          </View>
          <Switch
            value={allDay}
            onValueChange={setAllDay}
            trackColor={{
              false: theme.backgroundSecondary,
              true: theme.accentDim,
            }}
            thumbColor={allDay ? theme.accent : theme.textSecondary}
          />
        </View>

        <ThemedText type="caption" secondary style={styles.label}>
          Repeat
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

        <Button onPress={saveEvent} style={styles.saveButton}>
          {isNew ? "Create Event" : "Save Changes"}
        </Button>
      </ScrollView>
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
  titleInput: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: Spacing.xl,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  fieldInput: {
    flex: 1,
    fontSize: 16,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  switchLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  label: {
    marginBottom: Spacing.sm,
  },
  optionRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  optionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  saveButton: {
    marginTop: Spacing.xl,
  },
});
