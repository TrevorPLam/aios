import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Switch,
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

export default function SettingsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NavigationProp>();

  const [settings, setSettings] = useState<Settings | null>(null);
  const [aiName, setAiName] = useState("AIOS");

  const loadSettings = useCallback(async () => {
    const data = await db.settings.get();
    if (data) {
      setSettings(data);
      setAiName(data.aiName || "AIOS");
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateAIName = useCallback(
    async (name: string) => {
      setAiName(name);
      if (settings) {
        await db.settings.update({ aiName: name });
      }
    },
    [settings],
  );

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

  const toggleSharingPreference = useCallback(
    async (field: "shareEmail" | "shareBirthday" | "shareBusinessInfo") => {
      if (!settings) return;

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const contactSharingPreferences = {
        ...settings.contactSharingPreferences,
        [field]: !settings.contactSharingPreferences[field],
      };

      const updated = await db.settings.update({ contactSharingPreferences });
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
          AI SETTINGS
        </ThemedText>
        <View
          style={[styles.section, { backgroundColor: theme.backgroundDefault }]}
        >
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Feather name="cpu" size={20} color={theme.accent} />
              <ThemedText type="body">AI Name</ThemedText>
            </View>
            <TextInput
              value={aiName}
              onChangeText={updateAIName}
              style={[
                styles.nameInput,
                {
                  color: theme.text,
                  backgroundColor: theme.backgroundSecondary,
                },
              ]}
              placeholder="AIOS"
              placeholderTextColor={theme.textMuted}
            />
          </View>
        </View>

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
          CONTACT SHARING
        </ThemedText>
        <View
          style={[styles.section, { backgroundColor: theme.backgroundDefault }]}
        >
          <View
            style={[
              styles.settingRow,
              { borderBottomWidth: 1, borderBottomColor: theme.border },
            ]}
          >
            <View style={styles.settingInfo}>
              <Feather name="mail" size={20} color={theme.textSecondary} />
              <ThemedText type="body">Share Email</ThemedText>
            </View>
            <Switch
              value={settings.contactSharingPreferences.shareEmail}
              onValueChange={() => toggleSharingPreference("shareEmail")}
              trackColor={{
                false: theme.backgroundSecondary,
                true: theme.accentDim,
              }}
              thumbColor={
                settings.contactSharingPreferences.shareEmail
                  ? theme.accent
                  : theme.textSecondary
              }
            />
          </View>
          <View
            style={[
              styles.settingRow,
              { borderBottomWidth: 1, borderBottomColor: theme.border },
            ]}
          >
            <View style={styles.settingInfo}>
              <Feather name="gift" size={20} color={theme.textSecondary} />
              <ThemedText type="body">Share Birthday</ThemedText>
            </View>
            <Switch
              value={settings.contactSharingPreferences.shareBirthday}
              onValueChange={() => toggleSharingPreference("shareBirthday")}
              trackColor={{
                false: theme.backgroundSecondary,
                true: theme.accentDim,
              }}
              thumbColor={
                settings.contactSharingPreferences.shareBirthday
                  ? theme.accent
                  : theme.textSecondary
              }
            />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Feather name="briefcase" size={20} color={theme.textSecondary} />
              <ThemedText type="body">Share Business Info</ThemedText>
            </View>
            <Switch
              value={settings.contactSharingPreferences.shareBusinessInfo}
              onValueChange={() => toggleSharingPreference("shareBusinessInfo")}
              trackColor={{
                false: theme.backgroundSecondary,
                true: theme.accentDim,
              }}
              thumbColor={
                settings.contactSharingPreferences.shareBusinessInfo
                  ? theme.accent
                  : theme.textSecondary
              }
            />
          </View>
        </View>

        <ThemedText type="caption" secondary style={styles.sectionTitle}>
          DATA
        </ThemedText>
        <View
          style={[styles.section, { backgroundColor: theme.backgroundDefault }]}
        >
          <Pressable
            onPress={() => navigation.navigate("History")}
            style={styles.linkRow}
          >
            <View style={styles.settingInfo}>
              <Feather name="clock" size={20} color={theme.textSecondary} />
              <ThemedText type="body">History Log</ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textMuted} />
          </Pressable>
        </View>

        <View style={styles.aboutSection}>
          <ThemedText
            type="h3"
            style={{ color: theme.accent, textAlign: "center" }}
          >
            {settings.aiName}
          </ThemedText>
          <ThemedText
            type="caption"
            muted
            style={{ textAlign: "center", marginTop: Spacing.xs }}
          >
            AI Command Center v1.0.0
          </ThemedText>
        </View>
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
  nameInput: {
    fontSize: 16,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    minWidth: 120,
    textAlign: "right",
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
  },
  aboutSection: {
    marginTop: Spacing["3xl"],
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
});
