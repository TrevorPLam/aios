import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { ThemedText } from "./ThemedText";
import { db } from "@/storage/database";
import { ModuleType } from "@/models/types";

export type ModuleItem = {
  id: ModuleType;
  name: string;
  route: keyof AppStackParamList;
  icon: keyof typeof Feather.glyphMap;
};

const ALL_MODULES: ModuleItem[] = [
  { id: "notebook", name: "Notebook", route: "Notebook", icon: "book-open" },
  { id: "planner", name: "Planner", route: "Planner", icon: "check-square" },
  { id: "calendar", name: "Calendar", route: "Calendar", icon: "calendar" },
  { id: "email", name: "Email", route: "Email", icon: "mail" },
  { id: "messages", name: "Messages", route: "Messages", icon: "message-square" },
  { id: "lists", name: "Lists", route: "Lists", icon: "list" },
  { id: "alerts", name: "Alerts", route: "Alerts", icon: "bell" },
  { id: "photos", name: "Photos", route: "Photos", icon: "image" },
  { id: "contacts", name: "Contacts", route: "Contacts", icon: "users" },
  { id: "budget", name: "Budget", route: "Budget", icon: "pie-chart" },
  { id: "translator", name: "Translator", route: "Translator", icon: "globe" },
];

interface BottomNavProps {
  onAiPress: () => void;
}

export function BottomNav({ onAiPress }: BottomNavProps) {
  const { theme } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const [orderedModules, setOrderedModules] = useState<ModuleItem[]>(ALL_MODULES);

  useEffect(() => {
    loadModuleOrder();
  }, []);

  const loadModuleOrder = async () => {
    const settings = await db.settings.get();
    let modules = [...ALL_MODULES];
    
    // Filter by enabled modules
    modules = modules.filter(m => settings.enabledModules.includes(m.id));
    
    // Sort by usage count (intuitive ordering)
    if (settings.moduleUsageStats) {
      modules.sort((a, b) => {
        const aCount = settings.moduleUsageStats?.[a.id]?.count || 0;
        const bCount = settings.moduleUsageStats?.[b.id]?.count || 0;
        return bCount - aCount; // Most used first
      });
    }
    
    setOrderedModules(modules);
  };

  // Find current module index if we are in one, otherwise default to -1
  const currentIndex = orderedModules.findIndex((m) => m.route === route.name);

  // Circular navigation logic - CommandCenter is in the center
  const getPrevModule = () => {
    if (currentIndex === -1) return orderedModules[orderedModules.length - 1];
    const prevIndex = (currentIndex - 1 + orderedModules.length) % orderedModules.length;
    return orderedModules[prevIndex];
  };

  const getNextModule = () => {
    if (currentIndex === -1) return orderedModules[0];
    const nextIndex = (currentIndex + 1) % orderedModules.length;
    return orderedModules[nextIndex];
  };

  const prev = getPrevModule();
  const next = getNextModule();

  const handleNavigation = async (module: ModuleItem) => {
    await db.settings.trackModuleUsage(module.id);
    navigation.navigate(module.route as any);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundBlack,
          paddingBottom: insets.bottom + Spacing.xs,
        },
      ]}
    >
      <Pressable
        onPress={() => handleNavigation(prev)}
        style={({ pressed }) => [
          styles.navButton,
          {
            backgroundColor: theme.backgroundSecondary,
            borderColor: theme.border,
          },
          pressed && styles.pressed,
        ]}
      >
        <ThemedText type="h2" muted style={styles.arrow}>
          ‹
        </ThemedText>
      </Pressable>

      <Pressable
        onPress={onAiPress}
        style={({ pressed }) => [
          styles.aiButton,
          { backgroundColor: theme.accent, borderColor: theme.accentGlow },
          pressed && { opacity: 0.8 },
        ]}
      >
        <MaterialCommunityIcons
          name="brain"
          size={28}
          color={theme.backgroundRoot}
        />
      </Pressable>

      <Pressable
        onPress={() => handleNavigation(next)}
        style={({ pressed }) => [
          styles.navButton,
          {
            backgroundColor: theme.backgroundSecondary,
            borderColor: theme.border,
          },
          pressed && styles.pressed,
        ]}
      >
        <ThemedText type="h2" muted style={styles.arrow}>
          ›
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    // IMPORTANT: These constraints ensure the bar fills to screen edges
    // Do not change width or minHeight without updating this comment
    width: "100%",
    minHeight: 80,
  },
  navButton: {
    // FIXED SIZE: Do not change without updating constraint comment
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  navContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  arrow: {
    // BOLD ARROWS ONLY: size 32, bold - per requirements
    fontSize: 32,
    fontWeight: "bold",
  },
  label: {
    marginTop: 4,
    fontSize: 10,
  },
  aiButton: {
    // FIXED SIZE: AI button centered between arrows
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    ...Shadows.glow,
  },
  pressed: {
    opacity: 0.7,
  },
});
