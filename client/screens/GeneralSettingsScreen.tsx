import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useThemeContext } from "@/context/ThemeContext";
import { Spacing, BorderRadius, ColorThemes } from "@/constants/theme";
import { Settings, ColorTheme } from "@/models/types";
import { db } from "@/storage/database";

const COLOR_THEMES: {
  id: ColorTheme;
  name: string;
  color: string;
}[] = [
  { id: "cyan", name: "Cyan", color: ColorThemes.cyan.accent },
  { id: "purple", name: "Purple", color: ColorThemes.purple.accent },
  { id: "green", name: "Green", color: ColorThemes.green.accent },
  { id: "orange", name: "Orange", color: ColorThemes.orange.accent },
  { id: "pink", name: "Pink", color: ColorThemes.pink.accent },
  { id: "blue", name: "Blue", color: ColorThemes.blue.accent },
];

export default function GeneralSettingsScreen() {
  const { theme } = useTheme();
  const { setColorTheme } = useThemeContext();
  const insets = useSafeAreaInsets();

  const [settings, setSettings] = useState<Settings | null>(null);

  const loadSettings = useCallback(async () => {
    const data = await db.settings.get();
    if (data) {
      setSettings(data);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const selectColorTheme = useCallback(
    async (themeId: ColorTheme) => {
      if (!settings) return;

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      await setColorTheme(themeId);
      setSettings({ ...settings, colorTheme: themeId });
    },
    [settings, setColorTheme],
  );

  if (!settings) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

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
          COLOR THEME
        </ThemedText>
        <View
          style={[styles.section, { backgroundColor: theme.backgroundDefault }]}
        >
          {COLOR_THEMES.map((colorTheme, index) => (
            <Pressable
              key={colorTheme.id}
              onPress={() => selectColorTheme(colorTheme.id)}
              style={[
                styles.themeRow,
                index < COLOR_THEMES.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
                },
              ]}
            >
              <View style={styles.themeInfo}>
                <View
                  style={[
                    styles.colorCircle,
                    { backgroundColor: colorTheme.color },
                  ]}
                />
                <ThemedText type="body">{colorTheme.name}</ThemedText>
              </View>
              {settings.colorTheme === colorTheme.id && (
                <Feather name="check" size={20} color={theme.accent} />
              )}
            </Pressable>
          ))}
        </View>

        <ThemedText type="caption" muted style={styles.note}>
          Choose your app's accent color theme
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
  themeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
  },
  themeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  note: {
    marginTop: Spacing.md,
    marginLeft: Spacing.sm,
    fontSize: 12,
  },
});
