import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { ThemedText } from "./ThemedText";

export type ModuleItem = {
  name: string;
  route: keyof AppStackParamList;
  icon: keyof typeof Feather.glyphMap;
};

export const MODULES: ModuleItem[] = [
  { name: "Notebook", route: "Notebook", icon: "book-open" },
  { name: "Planner", route: "Planner", icon: "check-square" },
  { name: "Calendar", route: "Calendar", icon: "calendar" },
  { name: "Email", route: "Email", icon: "mail" },
  { name: "Budget", route: "Budget", icon: "pie-chart" },
  { name: "Translator", route: "Translator", icon: "globe" },
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

  // Find current module index if we are in one, otherwise default to -1
  const currentIndex = MODULES.findIndex((m) => m.route === route.name);

  // Eternal scrolling logic
  const getPrevModule = () => {
    if (currentIndex === -1) return MODULES[MODULES.length - 1];
    const prevIndex = (currentIndex - 1 + MODULES.length) % MODULES.length;
    return MODULES[prevIndex];
  };

  const getNextModule = () => {
    if (currentIndex === -1) return MODULES[0];
    const nextIndex = (currentIndex + 1) % MODULES.length;
    return MODULES[nextIndex];
  };

  const prev = getPrevModule();
  const next = getNextModule();

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
        onPress={() => navigation.navigate(prev.route as any)}
        style={({ pressed }) => [
          styles.navButton,
          {
            backgroundColor: theme.backgroundSecondary,
            borderColor: theme.border,
          },
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.navContent}>
          <ThemedText type="caption" muted style={styles.arrow}>
            ‹
          </ThemedText>
          <Feather name={prev.icon} size={24} color={theme.textSecondary} />
        </View>
        <ThemedText type="caption" muted style={styles.label}>
          {prev.name}
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
        onPress={() => navigation.navigate(next.route as any)}
        style={({ pressed }) => [
          styles.navButton,
          {
            backgroundColor: theme.backgroundSecondary,
            borderColor: theme.border,
          },
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.navContent}>
          <Feather name={next.icon} size={24} color={theme.textSecondary} />
          <ThemedText type="caption" muted style={styles.arrow}>
            ›
          </ThemedText>
        </View>
        <ThemedText type="caption" muted style={styles.label}>
          {next.name}
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
  },
  navButton: {
    minWidth: 80,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
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
    fontSize: 18,
    fontWeight: "bold",
  },
  label: {
    marginTop: 4,
    fontSize: 10,
  },
  aiButton: {
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
