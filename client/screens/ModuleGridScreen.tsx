import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { db } from "@/storage/database";
import { ModuleType, Settings } from "@/models/types";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

// Delay to allow modal close animation to complete before navigation
const MODAL_CLOSE_DELAY_MS = 100;

interface ModuleItem {
  id: ModuleType | "settings";
  name: string;
  icon: keyof typeof Feather.glyphMap;
  route: keyof AppStackParamList;
  description: string;
}

const MODULES: ModuleItem[] = [
  {
    id: "command",
    name: "Command Center",
    icon: "cpu",
    route: "CommandCenter",
    description: "AI recommendations",
  },
  {
    id: "notebook",
    name: "Notebook",
    icon: "book-open",
    route: "Notebook",
    description: "Notes & docs",
  },
  {
    id: "planner",
    name: "Planner",
    icon: "check-square",
    route: "Planner",
    description: "Tasks & projects",
  },
  {
    id: "calendar",
    name: "Calendar",
    icon: "calendar",
    route: "Calendar",
    description: "Events & schedule",
  },
  {
    id: "email",
    name: "Email",
    icon: "mail",
    route: "Email",
    description: "Messages",
  },
  {
    id: "lists",
    name: "Lists",
    icon: "list",
    route: "Lists",
    description: "Checklists",
  },
  {
    id: "settings",
    name: "Settings",
    icon: "settings",
    route: "Settings",
    description: "Preferences",
  },
];

export default function ModuleGridScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    db.settings.get().then(setSettings);
  }, []);

  const handleModulePress = (module: ModuleItem) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Close the modal first, then navigate to the module
    navigation.goBack();
    // Use setTimeout to ensure modal closes before navigation
    setTimeout(() => {
      navigation.navigate(module.route as any);
    }, MODAL_CLOSE_DELAY_MS);
  };

  const isModuleEnabled = (id: ModuleType | "settings"): boolean => {
    if (id === "settings" || id === "command") return true;
    if (!settings) return true;
    return settings.enabledModules.includes(id as ModuleType);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {MODULES.map((module, index) => {
            const enabled = isModuleEnabled(module.id);

            return (
              <Animated.View
                key={module.id}
                entering={FadeInDown.delay(index * 50).springify()}
                style={styles.gridItem}
              >
                <Pressable
                  onPress={() => enabled && handleModulePress(module)}
                  style={({ pressed }) => [
                    styles.moduleCard,
                    { backgroundColor: theme.backgroundDefault },
                    !enabled && styles.disabledCard,
                    pressed &&
                      enabled && { opacity: 0.8, transform: [{ scale: 0.98 }] },
                  ]}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor: enabled
                          ? theme.accentDim
                          : theme.backgroundSecondary,
                      },
                    ]}
                  >
                    <Feather
                      name={module.icon}
                      size={28}
                      color={enabled ? theme.accent : theme.textMuted}
                    />
                  </View>
                  <ThemedText
                    type="h3"
                    style={[styles.moduleName, !enabled && { opacity: 0.5 }]}
                  >
                    {module.name}
                  </ThemedText>
                  <ThemedText
                    type="caption"
                    secondary
                    style={[
                      styles.moduleDescription,
                      !enabled && { opacity: 0.5 },
                    ]}
                  >
                    {module.description}
                  </ThemedText>
                  {!enabled && (
                    <View
                      style={[
                        styles.disabledBadge,
                        { backgroundColor: theme.backgroundSecondary },
                      ]}
                    >
                      <ThemedText type="small" muted>
                        Disabled
                      </ThemedText>
                    </View>
                  )}
                </Pressable>
              </Animated.View>
            );
          })}
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
    paddingTop: Spacing["3xl"],
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  gridItem: {
    width: "48%",
  },
  moduleCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    minHeight: 160,
    ...Shadows.card,
  },
  disabledCard: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  moduleName: {
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  moduleDescription: {
    textAlign: "center",
  },
  disabledBadge: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
});
