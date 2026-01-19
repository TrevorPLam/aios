/**
 * AlertDetailScreen Module
 *
 * Screen for creating and editing alerts (alarms and reminders).
 * Features:
 * - Create new alerts or edit existing ones
 * - Configure alert type (alarm or reminder)
 * - Set time and recurrence rules
 * - Toggle enabled/disabled state
 * - Delete existing alerts
 * - Form validation for required fields
 * - Haptic feedback for user actions
 *
 * @module AlertDetailScreen
 */

import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
  Alert as RNAlert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { db } from "@/storage/database";
import { Alert, AlertType, RecurrenceRule } from "@/models/types";
import AlertStatisticsSheet from "@/components/AlertStatisticsSheet";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type AlertDetailRouteProp = RouteProp<AppStackParamList, "AlertDetail">;

/** Available alert types with display labels */
const ALERT_TYPES: { value: AlertType; label: string }[] = [
  { value: "alarm", label: "Alarm" },
  { value: "reminder", label: "Reminder" },
];

/** Available recurrence options with display labels */
const RECURRENCE_OPTIONS: { value: RecurrenceRule; label: string }[] = [
  { value: "none", label: "Never" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

/** Available sound options */
const SOUND_OPTIONS: {
  value: import("@/models/types").AlertSound;
  label: string;
}[] = [
  { value: "default", label: "Default" },
  { value: "gentle", label: "Gentle" },
  { value: "radar", label: "Radar" },
  { value: "bells", label: "Bells" },
  { value: "chimes", label: "Chimes" },
  { value: "digital", label: "Digital" },
];

/** Available vibration pattern options */
const VIBRATION_OPTIONS: {
  value: import("@/models/types").VibrationPattern;
  label: string;
}[] = [
  { value: "default", label: "Default" },
  { value: "pulse", label: "Pulse" },
  { value: "double", label: "Double" },
  { value: "long", label: "Long" },
  { value: "none", label: "None" },
];

/** Available snooze duration options */
const SNOOZE_OPTIONS: {
  value: import("@/models/types").SnoozeDuration;
  label: string;
}[] = [
  { value: 5, label: "5 min" },
  { value: 10, label: "10 min" },
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 60, label: "1 hour" },
];

/**
 * Generate a unique ID for a new alert
 *
 * @returns {string} Unique alert ID with timestamp and random suffix
 */
function generateId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * AlertDetailScreen Component
 *
 * Form screen for creating or editing an alert.
 * Loads existing alert data if alertId is provided in route params.
 *
 * @returns {JSX.Element} The alert detail screen component
 */
export default function AlertDetailScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AlertDetailRouteProp>();
  const { alertId } = route.params || {};

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState<AlertType>("alarm");
  const [isEnabled, setIsEnabled] = useState(true);
  const [recurrence, setRecurrence] = useState<RecurrenceRule>("none");
  const [sound, setSound] =
    useState<import("@/models/types").AlertSound>("default");
  const [vibration, setVibration] =
    useState<import("@/models/types").VibrationPattern>("default");
  const [gradualVolume, setGradualVolume] = useState(false);
  const [snoozeDuration, setSnoozeDuration] =
    useState<import("@/models/types").SnoozeDuration>(10);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [smartSnoozeSuggestion, setSmartSnoozeSuggestion] = useState<
    number | null
  >(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Load existing alert data or set defaults for new alert
  useEffect(() => {
    const loadAlert = async () => {
      if (!alertId) return;
      const alert = await db.alerts.get(alertId);
      if (alert) {
        setTitle(alert.title);
        setDescription(alert.description);
        setTime(alert.time);
        setType(alert.type);
        setIsEnabled(alert.isEnabled);
        setRecurrence(alert.recurrenceRule);
        setSound(alert.sound || "default");
        setVibration(alert.vibration || "default");
        setGradualVolume(alert.gradualVolume || false);
        setSnoozeDuration(alert.snoozeDuration || 10);
        setTags(alert.tags || []);

        // Load smart snooze suggestion
        const suggestion =
          await db.alertHistory.getSmartSnoozeSuggestion(alertId);
        setSmartSnoozeSuggestion(suggestion);
      }
    };

    if (alertId) {
      loadAlert();
    } else {
      // Set default time to current time for new alerts
      const now = new Date();
      setTime(now.toISOString());
    }
  }, [alertId]);

  /**
   * Save alert to database
   * Validates required fields before saving
   */
  const handleSave = async () => {
    // Validate required fields
    if (!title.trim()) {
      RNAlert.alert("Error", "Please enter a title");
      return;
    }

    if (!time) {
      RNAlert.alert("Error", "Please set a time");
      return;
    }

    setIsLoading(true);

    try {
      const alert: Alert = {
        id: alertId || generateId(),
        title: title.trim(),
        description: description.trim(),
        time,
        type,
        isEnabled,
        recurrenceRule: recurrence,
        sound,
        vibration,
        gradualVolume,
        snoozeDuration,
        tags,
        createdAt: alertId
          ? (await db.alerts.get(alertId))?.createdAt ||
            new Date().toISOString()
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.alerts.save(alert);

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      navigation.goBack();
    } catch (error) {
      console.error("Failed to save alert:", error);
      RNAlert.alert("Error", "Failed to save alert");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Delete alert with confirmation dialog
   */
  const handleDelete = () => {
    RNAlert.alert(
      "Delete Alert",
      "Are you sure you want to delete this alert?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (alertId) {
              await db.alerts.delete(alertId);
              if (Platform.OS !== "web") {
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success,
                );
              }
              navigation.goBack();
            }
          },
        },
      ],
    );
  };

  /**
   * Format ISO time string for display
   *
   * @param {string} isoString - ISO 8601 time string
   * @returns {string} Formatted time (e.g., "08:00 AM")
   */
  const formatTimeForDisplay = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  /**
   * Handle time picker interaction.
   * Opens the native date/time picker for user to select alert time.
   * Handles platform-specific dismissal logic for iOS and Android.
   *
   * @param event - DateTimePicker event containing type and timestamp
   * @param selectedDate - The date/time selected by user (optional)
   *
   * Platform Behavior:
   * - Android: Picker auto-closes after selection
   * - iOS: Manual dismissal on 'set' or 'dismissed' events
   * - Web: Not applicable (picker not shown)
   */
  const handleTimeChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    // On Android, the picker closes automatically after selection
    // On iOS, we need to close it manually after the user confirms
    const shouldClosePicker =
      Platform.OS === "android" ||
      event.type === "set" ||
      event.type === "dismissed";

    if (shouldClosePicker) {
      setShowTimePicker(false);
    }

    // If user cancelled or no date selected, return early
    if (event.type === "dismissed" || !selectedDate) {
      return;
    }

    // Update the time state with the selected date
    setTime(selectedDate.toISOString());

    // Provide haptic feedback
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  /**
   * Show the time picker modal.
   * Displays native date/time picker and provides haptic feedback.
   *
   * @remarks
   * On iOS, displays a spinner-style picker.
   * On Android, displays the default system time picker dialog.
   */
  const openTimePicker = () => {
    setShowTimePicker(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  /**
   * Add a tag to the alert
   */
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  /**
   * Remove a tag from the alert
   */
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  /**
   * Duplicate current alert
   */
  const handleDuplicate = async () => {
    if (!alertId) return;

    try {
      const duplicated = await db.alerts.duplicate(alertId);
      if (duplicated) {
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        // Navigate to the duplicated alert
        navigation.replace("AlertDetail", { alertId: duplicated.id });
      }
    } catch (error) {
      console.error("Failed to duplicate alert:", error);
      RNAlert.alert("Error", "Failed to duplicate alert");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <View style={styles.section}>
          <ThemedText type="body" style={styles.label}>
            Title
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundDefault,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder="Wake up"
            placeholderTextColor={theme.textMuted}
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="body" style={styles.label}>
            Description (Optional)
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: theme.backgroundDefault,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add a note..."
            placeholderTextColor={theme.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="body" style={styles.label}>
            Time
          </ThemedText>
          <Pressable
            onPress={openTimePicker}
            style={[
              styles.picker,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor: theme.border,
              },
            ]}
          >
            <ThemedText type="body">
              {time ? formatTimeForDisplay(time) : "Set time"}
            </ThemedText>
            <Feather name="clock" size={20} color={theme.textMuted} />
          </Pressable>
          {showTimePicker && (
            <DateTimePicker
              value={time ? new Date(time) : new Date()}
              mode="time"
              is24Hour={false}
              onChange={handleTimeChange}
              display={Platform.OS === "ios" ? "spinner" : "default"}
            />
          )}
        </View>

        <View style={styles.section}>
          <ThemedText type="body" style={styles.label}>
            Type
          </ThemedText>
          <View style={styles.optionGroup}>
            {ALERT_TYPES.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => {
                  setType(option.value);
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                style={[
                  styles.option,
                  {
                    backgroundColor:
                      type === option.value
                        ? theme.accentDim
                        : theme.backgroundDefault,
                    borderColor:
                      type === option.value ? theme.accent : theme.border,
                  },
                ]}
              >
                <ThemedText
                  type="body"
                  style={{
                    color: type === option.value ? theme.accent : theme.text,
                  }}
                >
                  {option.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="body" style={styles.label}>
            Repeat
          </ThemedText>
          <View style={styles.optionGroup}>
            {RECURRENCE_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => {
                  setRecurrence(option.value);
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                style={[
                  styles.option,
                  {
                    backgroundColor:
                      recurrence === option.value
                        ? theme.accentDim
                        : theme.backgroundDefault,
                    borderColor:
                      recurrence === option.value ? theme.accent : theme.border,
                  },
                ]}
              >
                <ThemedText
                  type="body"
                  style={{
                    color:
                      recurrence === option.value ? theme.accent : theme.text,
                  }}
                >
                  {option.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Pressable
            onPress={() => {
              setIsEnabled(!isEnabled);
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
            style={[
              styles.toggleRow,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor: theme.border,
              },
            ]}
          >
            <ThemedText type="body">Enabled</ThemedText>
            <View
              style={[
                styles.toggleSwitch,
                {
                  backgroundColor: isEnabled
                    ? theme.accent
                    : theme.backgroundSecondary,
                },
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  { backgroundColor: theme.backgroundDefault },
                  isEnabled && styles.toggleThumbActive,
                ]}
              />
            </View>
          </Pressable>
        </View>

        <View style={styles.section}>
          <ThemedText type="body" style={styles.label}>
            Sound
          </ThemedText>
          <View style={styles.optionGroup}>
            {SOUND_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => {
                  setSound(option.value);
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                style={[
                  styles.option,
                  {
                    backgroundColor:
                      sound === option.value
                        ? theme.accentDim
                        : theme.backgroundDefault,
                    borderColor:
                      sound === option.value ? theme.accent : theme.border,
                  },
                ]}
              >
                <ThemedText
                  type="body"
                  style={{
                    color: sound === option.value ? theme.accent : theme.text,
                  }}
                >
                  {option.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="body" style={styles.label}>
            Vibration Pattern
          </ThemedText>
          <View style={styles.optionGroup}>
            {VIBRATION_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => {
                  setVibration(option.value);
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                style={[
                  styles.option,
                  {
                    backgroundColor:
                      vibration === option.value
                        ? theme.accentDim
                        : theme.backgroundDefault,
                    borderColor:
                      vibration === option.value ? theme.accent : theme.border,
                  },
                ]}
              >
                <ThemedText
                  type="body"
                  style={{
                    color:
                      vibration === option.value ? theme.accent : theme.text,
                  }}
                >
                  {option.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        {type === "alarm" && (
          <View style={styles.section}>
            <Pressable
              onPress={() => {
                setGradualVolume(!gradualVolume);
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              style={[
                styles.toggleRow,
                {
                  backgroundColor: theme.backgroundDefault,
                  borderColor: theme.border,
                },
              ]}
            >
              <View>
                <ThemedText type="body">Gradual Volume</ThemedText>
                <ThemedText type="small" muted>
                  Gently increases volume (gentle wake)
                </ThemedText>
              </View>
              <View
                style={[
                  styles.toggleSwitch,
                  {
                    backgroundColor: gradualVolume
                      ? theme.accent
                      : theme.backgroundSecondary,
                  },
                ]}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    { backgroundColor: theme.backgroundDefault },
                    gradualVolume && styles.toggleThumbActive,
                  ]}
                />
              </View>
            </Pressable>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.labelWithHint}>
            <ThemedText type="body" style={styles.label}>
              Snooze Duration
            </ThemedText>
            {smartSnoozeSuggestion !== null &&
              smartSnoozeSuggestion !== snoozeDuration && (
                <Pressable
                  onPress={() => {
                    setSnoozeDuration(smartSnoozeSuggestion);
                    if (Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                  }}
                  style={({ pressed }) => [
                    styles.smartHint,
                    {
                      backgroundColor: theme.accentDim,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Feather name="zap" size={12} color={theme.accent} />
                  <ThemedText type="small" style={{ color: theme.accent }}>
                    Suggested: {smartSnoozeSuggestion} min
                  </ThemedText>
                </Pressable>
              )}
          </View>
          <View style={styles.optionGroup}>
            {SNOOZE_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => {
                  setSnoozeDuration(option.value);
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                style={[
                  styles.option,
                  {
                    backgroundColor:
                      snoozeDuration === option.value
                        ? theme.accentDim
                        : theme.backgroundDefault,
                    borderColor:
                      snoozeDuration === option.value
                        ? theme.accent
                        : theme.border,
                  },
                ]}
              >
                <ThemedText
                  type="body"
                  style={{
                    color:
                      snoozeDuration === option.value
                        ? theme.accent
                        : theme.text,
                  }}
                >
                  {option.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="body" style={styles.label}>
            Tags
          </ThemedText>
          <View style={styles.tagContainer}>
            {tags.map((tag) => (
              <Pressable
                key={tag}
                onPress={() => handleRemoveTag(tag)}
                style={[
                  styles.tag,
                  {
                    backgroundColor: theme.accentDim,
                    borderColor: theme.accent,
                  },
                ]}
              >
                <ThemedText type="small" style={{ color: theme.accent }}>
                  {tag}
                </ThemedText>
                <Feather name="x" size={14} color={theme.accent} />
              </Pressable>
            ))}
          </View>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={[
                styles.tagInput,
                {
                  backgroundColor: theme.backgroundDefault,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="Add tag (e.g., work, workout)"
              placeholderTextColor={theme.textMuted}
              onSubmitEditing={handleAddTag}
            />
            <Pressable
              onPress={handleAddTag}
              style={[
                styles.addTagButton,
                {
                  backgroundColor: theme.accent,
                },
              ]}
            >
              <Feather name="plus" size={20} color={theme.buttonText} />
            </Pressable>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button onPress={handleSave} disabled={isLoading}>
            {alertId ? "Update Alert" : "Create Alert"}
          </Button>

          {alertId && (
            <>
              <Button
                onPress={() => setShowStatistics(true)}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: theme.accentDim,
                    borderColor: theme.accent,
                    borderWidth: 1,
                  },
                ]}
              >
                <View style={styles.buttonContent}>
                  <Feather name="bar-chart-2" size={18} color={theme.accent} />
                  <ThemedText
                    type="body"
                    style={{ color: theme.accent, marginLeft: Spacing.xs }}
                  >
                    View Statistics
                  </ThemedText>
                </View>
              </Button>

              <Button
                onPress={handleDuplicate}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: theme.accentDim,
                    borderColor: theme.accent,
                    borderWidth: 1,
                  },
                ]}
              >
                <View style={styles.buttonContent}>
                  <Feather name="copy" size={18} color={theme.accent} />
                  <ThemedText
                    type="body"
                    style={{ color: theme.accent, marginLeft: Spacing.xs }}
                  >
                    Duplicate Alert
                  </ThemedText>
                </View>
              </Button>

              <Button
                onPress={handleDelete}
                style={[styles.deleteButton, { backgroundColor: theme.error }]}
              >
                Delete Alert
              </Button>
            </>
          )}
        </View>
      </ScrollView>

      {/* Statistics Sheet */}
      {alertId && (
        <AlertStatisticsSheet
          visible={showStatistics}
          alertId={alertId}
          onClose={() => setShowStatistics(false)}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  label: {
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  picker: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  optionGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  option: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: "center",
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },
  buttonContainer: {
    gap: Spacing.md,
  },
  deleteButton: {
    marginTop: Spacing.sm,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  tagInputContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: 14,
  },
  addTagButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButton: {
    marginTop: Spacing.sm,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  labelWithHint: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  smartHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
});
