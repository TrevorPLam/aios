import React, { useEffect, useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@design-system/hooks/useTheme";
import { AppStackParamList } from "@apps/mobile/navigation/AppNavigator";
import { Spacing, BorderRadius } from "@design-system/constants/theme";
import { ThemedText } from "@design-system/components/ThemedText";
import {
  formatAttentionBadgeLabel,
  getAttentionBadgeCount,
} from "@features/core/domain/attentionBadge";
import { attentionManager } from "@features/core/domain/attentionManager";
import { logger } from "@platform/lib/logger";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

export function HeaderLeftNav() {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.headerLeft}>
      <Pressable
        onPress={() => navigation.navigate("ModuleGrid")}
        style={({ pressed }) => [
          styles.iconButton,
          { opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Feather name="grid" size={24} color={theme.text} />
      </Pressable>
      <Pressable
        onPress={() => navigation.navigate("CommandCenter")}
        style={({ pressed }) => [
          styles.iconButton,
          { opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Feather name="home" size={24} color={theme.text} />
      </Pressable>
    </View>
  );
}

export interface HeaderRightNavProps {
  /**
   * Optional route to navigate to instead of main Settings
   * @example "NotebookSettings" for Notebook module settings
   */
  settingsRoute?: keyof AppStackParamList;
}

const useAttentionBadgeCount = () => {
  const [badgeCount, setBadgeCount] = useState(0);

  useEffect(() => {
    const updateBadgeCount = () => {
      try {
        // Pull counts synchronously so header stays in sync with attention updates.
        const counts = attentionManager.getCounts();
        setBadgeCount(getAttentionBadgeCount(counts));
      } catch (error) {
        // Explicitly handle unexpected errors so header UI never crashes.
        logger.warn("HeaderNav", "Failed to update attention badge", {
          error: error instanceof Error ? error.message : String(error),
        });
        setBadgeCount(0);
      }
    };

    updateBadgeCount();
    const unsubscribe = attentionManager.subscribe(updateBadgeCount);

    return () => unsubscribe();
  }, []);

  return badgeCount;
};

function AttentionHeaderButton() {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const badgeCount = useAttentionBadgeCount();
  const badgeLabel = formatAttentionBadgeLabel(badgeCount);

  return (
    <Pressable
      onPress={() => navigation.navigate("AttentionCenter")}
      style={({ pressed }) => [
        styles.iconButton,
        { opacity: pressed ? 0.7 : 1 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={
        badgeLabel
          ? `Open Attention Center, ${badgeLabel} new items`
          : "Open Attention Center"
      }
    >
      <Feather name="bell" size={24} color={theme.text} />
      {badgeLabel ? (
        <View style={[styles.badge, { backgroundColor: theme.error }]}>
          <ThemedText style={styles.badgeText}>{badgeLabel}</ThemedText>
        </View>
      ) : null}
    </Pressable>
  );
}

function SettingsHeaderButton({ settingsRoute }: HeaderRightNavProps) {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const handlePress = () => {
    if (settingsRoute) {
      // Type-safe navigation - settingsRoute is keyof AppStackParamList
      // @ts-expect-error: TypeScript doesn't narrow the union type correctly for navigate() calls
      navigation.navigate(settingsRoute, undefined);
    } else {
      navigation.navigate("Settings");
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.iconButton,
        { opacity: pressed ? 0.7 : 1 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={
        settingsRoute ? "Open module settings" : "Open settings"
      }
    >
      <Feather name="settings" size={24} color={theme.text} />
    </Pressable>
  );
}

export function HeaderRightNav({ settingsRoute }: HeaderRightNavProps = {}) {
  return (
    <View style={styles.headerRight}>
      <AttentionHeaderButton />
      <SettingsHeaderButton settingsRoute={settingsRoute} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  iconButton: {
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

