import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { db } from "@/storage/database";
import { Settings, ModuleType } from "@/models/types";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const MODULES: {
  id: ModuleType;
  name: string;
  icon: keyof typeof Feather.glyphMap;
}[] = [
  { id: "notebook", name: "Notebook", icon: "book-open" },
  { id: "planner", name: "Planner", icon: "check-square" },
  { id: "calendar", name: "Calendar", icon: "calendar" },
  { id: "email", name: "Email", icon: "mail" },
  { id: "contacts", name: "Contacts", icon: "users" },
];

export default function GeneralSettingsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NavigationProp>();

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

  const toggleModule = useCallback(
    async (moduleId: ModuleType) => {
      if (!settings) return;

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const enabledModules = settings.enabledModules.includes(moduleId)
        ? settings.enabledModules.filter((m) => m !== moduleId)
        : [...settings.enabledModules, moduleId];

      const updated = await db.settings.update({ enabledModules });
      setSettings(updated);
    },
    [settings],
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
            paddingTop: headerHeight + Spacing.md,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="caption" secondary style={styles.sectionTitle}>
          ENABLED MODULES
        </ThemedText>
        <View
          style={[styles.section, { backgroundColor: theme.backgroundDefault }]}
        >
          {MODULES.map((module, index) => (
            <View
              key={module.id}
              style={[
                styles.settingRow,
                index < MODULES.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
                },
              ]}
            >
              <View style={styles.settingInfo}>
                <Feather
                  name={module.icon}
                  size={20}
                  color={theme.textSecondary}
                />
                <ThemedText type="body">{module.name}</ThemedText>
              </View>
              <Switch
                value={settings.enabledModules.includes(module.id)}
                onValueChange={() => toggleModule(module.id)}
                trackColor={{
                  false: theme.backgroundSecondary,
                  true: theme.accentDim,
                }}
                thumbColor={
                  settings.enabledModules.includes(module.id)
                    ? theme.accent
                    : theme.textSecondary
                }
              />
            </View>
          ))}
        </View>

        <ThemedText type="caption" secondary style={styles.sectionTitle}>
          APPEARANCE
        </ThemedText>
        <View
          style={[styles.section, { backgroundColor: theme.backgroundDefault }]}
        >
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Feather name="moon" size={20} color={theme.textSecondary} />
              <ThemedText type="body">Dark Mode</ThemedText>
            </View>
            <Switch
              value={settings.darkMode}
              disabled={true}
              trackColor={{
                false: theme.backgroundSecondary,
                true: theme.accentDim,
              }}
              thumbColor={
                settings.darkMode ? theme.accent : theme.textSecondary
              }
            />
          </View>
        </View>

        <ThemedText type="caption" muted style={styles.note}>
          Theme settings are coming soon
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
