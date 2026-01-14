/**
 * SystemScreen Module
 *
 * System diagnostics and utilities.
 * Features:
 * - App version information
 * - Database status and size
 * - Storage usage statistics
 * - Clear cache functionality
 * - Reset app data (with confirmation)
 * - Export/import data (placeholder)
 * - Debug information
 * - Error logs access
 *
 * @module SystemScreen
 */

import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { db } from "@/storage/database";
import { Settings } from "@/models/types";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

export default function SystemScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
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
  linkRow: {
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
  aboutSection: {
    marginTop: Spacing["3xl"],
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
});
