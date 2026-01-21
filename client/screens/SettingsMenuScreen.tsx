/**
 * SettingsMenuScreen Module
 *
 * Main settings and configuration hub.
 * Features:
 * - Module enable/disable toggles
 * - AI personality customization
 * - Context zone selection (work/personal/focus modes)
 * - Attention Center access
 * - History log access
 * - Color theme selection
 * - Display preferences (photo grid size, etc.)
 * - Contact sharing defaults
 * - AI usage limits by tier
 * - Navigation to module-specific settings
 * - Dark mode toggle
 * - App information and version
 *
 * Recent Updates:
 * - Added Attention Center to main settings menu (T-005)
 * - Added History to main settings menu for better discoverability (T-015)
 * - Improved settings organization and navigation
 *
 * @module SettingsMenuScreen
 */

import React from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

interface SettingsMenuItem {
  id: string;
  name: string;
  icon: keyof typeof Feather.glyphMap;
  route: keyof AppStackParamList;
  description: string;
}

interface ModuleSettingsItem {
  id: string;
  name: string;
  icon: keyof typeof Feather.glyphMap;
  description: string;
  route?: keyof AppStackParamList;
}

const SETTINGS_MENU: SettingsMenuItem[] = [
  {
    id: "modules",
    name: "All Modules",
    icon: "grid",
    route: "ModuleGrid",
    description: "View and organize all modules",
  },
  {
    id: "general",
    name: "General",
    icon: "sliders",
    route: "GeneralSettings",
    description: "App preferences",
  },
  {
    id: "ai",
    name: "AI Preferences",
    icon: "cpu",
    route: "AIPreferences",
    description: "AI configuration",
  },
  {
    id: "attention",
    name: "Attention Center",
    icon: "bell",
    route: "AttentionCenter",
    description: "Notifications & focus mode",
  },
  {
    id: "personalization",
    name: "Personalization",
    icon: "user",
    route: "Personalization",
    description: "Contact & sharing",
  },
  {
    id: "integrations",
    name: "Integrations",
    icon: "package",
    route: "Integrations",
    description: "Connected services",
  },
  {
    id: "history",
    name: "History",
    icon: "clock",
    route: "History",
    description: "Activity log & timeline",
  },
  {
    id: "system",
    name: "System",
    icon: "info",
    route: "System",
    description: "About & diagnostics",
  },
];

const MODULE_SETTINGS: ModuleSettingsItem[] = [
  {
    id: "command",
    name: "Command Center",
    icon: "cpu",
    description: "Settings coming soon",
  },
  {
    id: "notebook",
    name: "Notebook",
    icon: "book-open",
    description: "Configure notebook settings",
    route: "NotebookSettings",
  },
  {
    id: "planner",
    name: "Planner",
    icon: "check-square",
    description: "Configure planner settings",
    route: "PlannerSettings",
  },
  {
    id: "calendar",
    name: "Calendar",
    icon: "calendar",
    description: "Configure calendar settings",
    route: "CalendarSettings",
  },
  {
    id: "email",
    name: "Email",
    icon: "mail",
    description: "Configure email settings",
    route: "EmailSettings",
  },
  {
    id: "messages",
    name: "Messages",
    icon: "message-square",
    description: "Settings coming soon",
  },
  {
    id: "lists",
    name: "Lists",
    icon: "list",
    description: "Settings coming soon",
  },
  {
    id: "alerts",
    name: "Alerts",
    icon: "bell",
    description: "Settings coming soon",
  },
  {
    id: "photos",
    name: "Photos",
    icon: "image",
    description: "Settings coming soon",
  },
  {
    id: "contacts",
    name: "Contacts",
    icon: "users",
    description: "Configure contacts settings",
    route: "ContactsSettings",
  },
  {
    id: "translator",
    name: "Translator",
    icon: "globe",
    description: "Settings coming soon",
  },
];

export default function SettingsMenuScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const handleMenuPress = (route: keyof AppStackParamList) => {
    // @ts-expect-error - Navigation type from keyof AppStackParamList is complex but safe
    navigation.navigate(route);
  };

  const handleModuleSettingsPress = (item: ModuleSettingsItem) => {
    if (item.route) {
      // @ts-expect-error - Navigation type from module settings route is complex but safe
      navigation.navigate(item.route);
    } else {
      Alert.alert(
        `${item.name} Settings`,
        "Settings for this module are coming soon.",
      );
    }
  };

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
        <View
          style={[styles.section, { backgroundColor: theme.backgroundDefault }]}
        >
          {SETTINGS_MENU.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => handleMenuPress(item.route)}
              testID={`settings-menu-${item.id}`}
              style={[
                styles.menuRow,
                index < SETTINGS_MENU.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
                },
              ]}
            >
              <View style={styles.menuInfo}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: theme.accentDim },
                  ]}
                >
                  <Feather name={item.icon} size={20} color={theme.accent} />
                </View>
                <View style={styles.textContainer}>
                  <ThemedText type="body">{item.name}</ThemedText>
                  <ThemedText type="small" muted>
                    {item.description}
                  </ThemedText>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color={theme.textMuted} />
            </Pressable>
          ))}
        </View>
        <View style={styles.sectionHeader}>
          <ThemedText type="h5" muted>
            Module Settings
          </ThemedText>
        </View>
        <View
          style={[styles.section, { backgroundColor: theme.backgroundDefault }]}
        >
          {MODULE_SETTINGS.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => handleModuleSettingsPress(item)}
              testID={`module-settings-${item.id}`}
              style={[
                styles.menuRow,
                index < MODULE_SETTINGS.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
                },
              ]}
            >
              <View style={styles.menuInfo}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: theme.accentDim },
                  ]}
                >
                  <Feather name={item.icon} size={20} color={theme.accent} />
                </View>
                <View style={styles.textContainer}>
                  <ThemedText type="body">{item.name}</ThemedText>
                  <ThemedText type="small" muted>
                    {item.description}
                  </ThemedText>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color={theme.textMuted} />
            </Pressable>
          ))}
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
  sectionHeader: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  section: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
  },
  menuInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
    gap: Spacing.xs,
  },
});
