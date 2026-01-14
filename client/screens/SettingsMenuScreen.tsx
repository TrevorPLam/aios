import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
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

const SETTINGS_MENU: SettingsMenuItem[] = [
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
    id: "system",
    name: "System",
    icon: "info",
    route: "System",
    description: "About & history",
  },
];

export default function SettingsMenuScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NavigationProp>();

  const handleMenuPress = (route: keyof AppStackParamList) => {
    navigation.navigate(route as any);
  };

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
        <View
          style={[styles.section, { backgroundColor: theme.backgroundDefault }]}
        >
          {SETTINGS_MENU.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => handleMenuPress(item.route)}
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
