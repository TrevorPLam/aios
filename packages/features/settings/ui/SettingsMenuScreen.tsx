import React from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@design-system/components/ThemedText";
import { useTheme } from "@design-system/hooks/useTheme";
import { Spacing, BorderRadius } from "@design-system/constants/theme";

/**
 * SettingsMenuScreen Component
 *
 * Main settings menu that provides navigation to various settings screens
 * and module-specific settings.
 */
export default function SettingsMenuScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const handleModuleSettings = (moduleName: string) => {
    // Check if module settings screen exists
    // For now, show coming soon alert for modules without settings screens
    const availableModules = [
      "notebook",
      "planner",
      "calendar",
      "email",
      "contacts",
    ];

    if (availableModules.includes(moduleName.toLowerCase())) {
      const screenMap: Record<string, string> = {
        notebook: "NotebookSettings",
        planner: "PlannerSettings",
        calendar: "CalendarSettings",
        email: "EmailSettings",
        contacts: "ContactsSettings",
      };

      const screenName = screenMap[moduleName.toLowerCase()];
      if (screenName) {
        navigation.navigate(screenName as never);
      }
    } else {
      // Capitalize first letter of module name
      const capitalizedName =
        moduleName.charAt(0).toUpperCase() + moduleName.slice(1).toLowerCase();
      Alert.alert(
        `${capitalizedName} Settings`,
        "Settings for this module are coming soon.",
      );
    }
  };

  const renderMenuItem = (
    testID: string,
    icon: keyof typeof Feather.glyphMap,
    title: string,
    onPress: () => void,
  ) => {
    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        style={({ pressed }) => [
          styles.menuItem,
          {
            backgroundColor: theme.backgroundDefault,
            borderColor: theme.border,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <View style={styles.menuItemContent}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.accentDim },
            ]}
          >
            <Feather name={icon} size={20} color={theme.accent} />
          </View>
          <ThemedText type="body" style={{ flex: 1 }}>
            {title}
          </ThemedText>
          <Feather name="chevron-right" size={20} color={theme.textMuted} />
        </View>
      </Pressable>
    );
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: theme.backgroundRoot },
      ]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.section}>
        <ThemedText type="h3" style={{ marginBottom: Spacing.md }}>
          General
        </ThemedText>
        {renderMenuItem(
          "settings-menu-modules",
          "grid",
          "Modules",
          () => navigation.navigate("ModuleGrid" as never),
        )}
        {renderMenuItem(
          "settings-menu-history",
          "clock",
          "History",
          () => navigation.navigate("History" as never),
        )}
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={{ marginBottom: Spacing.md }}>
          Module Settings
        </ThemedText>
        {renderMenuItem(
          "module-settings-lists",
          "list",
          "Lists",
          () => handleModuleSettings("lists"),
        )}
        {renderMenuItem(
          "module-settings-notebook",
          "file-text",
          "Notebook",
          () => handleModuleSettings("notebook"),
        )}
        {renderMenuItem(
          "module-settings-planner",
          "check-square",
          "Planner",
          () => handleModuleSettings("planner"),
        )}
        {renderMenuItem(
          "module-settings-calendar",
          "calendar",
          "Calendar",
          () => handleModuleSettings("calendar"),
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  menuItem: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: "hidden",
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
});
