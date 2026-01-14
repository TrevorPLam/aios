import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Switch,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { db } from "@/storage/database";
import { Settings } from "@/models/types";

export default function PersonalizationScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

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

        <ThemedText type="caption" muted style={styles.note}>
          Control what information you share with other contacts
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
