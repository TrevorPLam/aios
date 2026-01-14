/**
 * CalendarSettingsScreen Module
 *
 * Settings screen for the Calendar module.
 * Currently provides toggle for enabling/disabling the calendar module.
 *
 * Features:
 * - Enable/disable calendar module
 * - Settings persist to database
 * - Haptic feedback for toggle interactions
 *
 * @module CalendarSettingsScreen
 */

import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView, Switch, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { db } from "@/storage/database";
import { Settings } from "@/models/types";

/**
 * CalendarSettingsScreen Component
 *
 * Settings screen for managing calendar module preferences.
 *
 * @returns {JSX.Element} The calendar settings screen component
 */
export default function CalendarSettingsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [settings, setSettings] = useState<Settings | null>(null);

  /**
   * Load settings from database
   */
  const loadSettings = useCallback(async () => {
    const data = await db.settings.get();
    if (data) {
      setSettings(data);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  /**
   * Toggle calendar module enabled state
   * Updates settings in database and local state
   */
  const toggleEnabled = useCallback(async () => {
    if (!settings) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const isEnabled = settings.enabledModules.includes("calendar");
    const enabledModules = isEnabled
      ? settings.enabledModules.filter((m) => m !== "calendar")
      : [...settings.enabledModules, "calendar"];

    const updated = await db.settings.update({ enabledModules });
    setSettings(updated);
  }, [settings]);

  if (!settings) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  const isEnabled = settings.enabledModules.includes("calendar");

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Spacing.md,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="caption" secondary style={styles.sectionTitle}>
          MODULE STATUS
        </ThemedText>
        <View
          style={[styles.section, { backgroundColor: theme.backgroundDefault }]}
        >
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Feather name="calendar" size={20} color={theme.accent} />
              <ThemedText type="body">Enable Calendar</ThemedText>
            </View>
            <Switch
              value={isEnabled}
              onValueChange={toggleEnabled}
              trackColor={{
                false: theme.backgroundSecondary,
                true: theme.accentDim,
              }}
              thumbColor={isEnabled ? theme.accent : theme.textSecondary}
            />
          </View>
        </View>

        <ThemedText type="caption" muted style={styles.note}>
          Toggle this module on or off. Additional settings coming soon.
        </ThemedText>
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
  sectionTitle: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  section: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  note: {
    marginTop: Spacing.md,
    marginLeft: Spacing.sm,
    fontSize: 12,
  },
});
