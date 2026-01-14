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

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { db } from "@/storage/database";
import { Alert, AlertType, RecurrenceRule } from "@/models/types";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type AlertDetailRouteProp = RouteProp<AppStackParamList, "AlertDetail">;

const ALERT_TYPES: { value: AlertType; label: string }[] = [
  { value: "alarm", label: "Alarm" },
  { value: "reminder", label: "Reminder" },
];

const RECURRENCE_OPTIONS: { value: RecurrenceRule; label: string }[] = [
  { value: "none", label: "Never" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

function generateId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (alertId) {
      loadAlert();
    } else {
      // Set default time to current time
      const now = new Date();
      setTime(now.toISOString());
    }
  }, [alertId]);

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
    }
  };

  const handleSave = async () => {
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
        createdAt: alertId
          ? (await db.alerts.get(alertId))?.createdAt || new Date().toISOString()
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

  const formatTimeForDisplay = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleTimeChange = () => {
    // In a real implementation, this would open a time picker
    // For now, we'll just set a sample time
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(0);
    now.setSeconds(0);
    setTime(now.toISOString());
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
                color: theme.textPrimary,
                borderColor: theme.borderColor,
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
                color: theme.textPrimary,
                borderColor: theme.borderColor,
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
            onPress={handleTimeChange}
            style={[
              styles.picker,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor: theme.borderColor,
              },
            ]}
          >
            <ThemedText type="body">
              {time ? formatTimeForDisplay(time) : "Set time"}
            </ThemedText>
            <Feather name="clock" size={20} color={theme.textMuted} />
          </Pressable>
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
                      type === option.value ? theme.accent : theme.borderColor,
                  },
                ]}
              >
                <ThemedText
                  type="body"
                  style={{
                    color:
                      type === option.value ? theme.accent : theme.textPrimary,
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
                      recurrence === option.value
                        ? theme.accent
                        : theme.borderColor,
                  },
                ]}
              >
                <ThemedText
                  type="body"
                  style={{
                    color:
                      recurrence === option.value
                        ? theme.accent
                        : theme.textPrimary,
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
                borderColor: theme.borderColor,
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

        <View style={styles.buttonContainer}>
          <Button onPress={handleSave} disabled={isLoading}>
            {alertId ? "Update Alert" : "Create Alert"}
          </Button>

          {alertId && (
            <Button
              onPress={handleDelete}
              style={[styles.deleteButton, { backgroundColor: theme.error }]}
            >
              Delete Alert
            </Button>
          )}
        </View>
      </ScrollView>
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
});
