import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "./ThemedText";
import { useTheme } from "../hooks/useTheme";
import { BorderRadius, Spacing } from "../constants/theme";

interface ScreenStateMessageProps {
  title: string;
  description?: string;
  icon?: keyof typeof Feather.glyphMap;
  actionLabel?: string;
  onActionPress?: () => void;
  isLoading?: boolean;
  testID?: string;
}

export function ScreenStateMessage({
  title,
  description,
  icon,
  actionLabel,
  onActionPress,
  isLoading,
  testID,
}: ScreenStateMessageProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container} testID={testID}>
      {isLoading ? (
        <ActivityIndicator size="large" color={theme.accent} />
      ) : icon ? (
        <View
          style={[styles.iconContainer, { backgroundColor: theme.accentDim }]}
        >
          <Feather name={icon} size={32} color={theme.accent} />
        </View>
      ) : null}
      <ThemedText type="h3" style={styles.title}>
        {title}
      </ThemedText>
      {description ? (
        <ThemedText type="body" secondary style={styles.description}>
          {description}
        </ThemedText>
      ) : null}
      {actionLabel && onActionPress ? (
        <Pressable
          onPress={onActionPress}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.actionButton,
            {
              backgroundColor: theme.accent,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <ThemedText type="small" style={{ color: theme.buttonText }}>
            {actionLabel}
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
  },
  description: {
    textAlign: "center",
  },
  actionButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
});
