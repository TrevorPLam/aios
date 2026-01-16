/**
 * Onboarding Module Selection Screen
 *
 * Purpose (Plain English):
 * Lets new users pick their first 3 modules. Shows all available modules
 * with descriptions so users can choose what they need most. Enforces the
 * "exactly 3" rule to prevent overwhelm while ensuring users have enough
 * to get started.
 *
 * Features:
 * - Grid of module cards with icons and descriptions
 * - Selection state (must select exactly 3)
 * - Visual feedback (selected state, count indicator)
 * - Module categorization
 * - Search/filter (optional)
 * - Haptic feedback
 * - Progress to main app after selection
 *
 * @module OnboardingModuleSelectionScreen
 */

import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Dimensions,
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
import { Spacing, BorderRadius } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { moduleRegistry } from "@/lib/moduleRegistry";
import { onboardingManager } from "@/lib/onboardingManager";
import { ModuleType } from "@/models/types";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_PADDING = Spacing.lg;
const CARD_GAP = Spacing.md;
const CARDS_PER_ROW = 2;
const CARD_WIDTH =
  (SCREEN_WIDTH - CARD_PADDING * 2 - CARD_GAP * (CARDS_PER_ROW - 1)) /
  CARDS_PER_ROW;

/**
 * Module descriptions for onboarding
 */
const MODULE_DESCRIPTIONS: Record<string, string> = {
  planner: "Manage tasks and projects",
  notebook: "Take notes and capture ideas",
  calendar: "Schedule events and meetings",
  messages: "Chat with contacts",
  email: "Manage your inbox",
  lists: "Create checklists",
  budget: "Track expenses",
  alerts: "Set reminders",
  contacts: "Manage your contacts",
  photos: "Organize your photos",
  translator: "Translate languages",
  history: "View activity history",
};

/**
 * Module Card Component
 */
function ModuleCard({
  module,
  selected,
  onToggle,
  disabled,
}: {
  module: { id: ModuleType; name: string; icon: string };
  selected: boolean;
  onToggle: () => void;
  disabled: boolean;
}) {
  const { theme } = useTheme();

  const handlePress = useCallback(() => {
    if (!disabled || selected) {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onToggle();
    }
  }, [disabled, selected, onToggle]);

  const description = MODULE_DESCRIPTIONS[module.id] || "Explore this module";

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled && !selected}
      style={[
        styles.moduleCard,
        {
          width: CARD_WIDTH,
          backgroundColor: selected
            ? `${theme.primary}15`
            : theme.cardBackground,
          borderColor: selected ? theme.primary : theme.border,
          borderWidth: selected ? 2 : 1,
          opacity: disabled && !selected ? 0.5 : 1,
        },
      ]}
    >
      {/* Selection Indicator */}
      {selected && (
        <View
          style={[
            styles.selectionIndicator,
            { backgroundColor: theme.primary },
          ]}
        >
          <Feather name="check" size={16} color="#FFFFFF" />
        </View>
      )}

      {/* Icon */}
      <View
        style={[
          styles.moduleIcon,
          {
            backgroundColor: selected
              ? `${theme.primary}25`
              : `${theme.primary}10`,
          },
        ]}
      >
        <Feather
          name={module.icon as any}
          size={32}
          color={selected ? theme.primary : theme.textSecondary}
        />
      </View>

      {/* Name */}
      <ThemedText
        style={[
          styles.moduleName,
          { color: selected ? theme.primary : theme.text },
        ]}
      >
        {module.name}
      </ThemedText>

      {/* Description */}
      <ThemedText style={styles.moduleDescription} numberOfLines={2}>
        {description}
      </ThemedText>
    </Pressable>
  );
}

/**
 * Onboarding Module Selection Screen Component
 */
export default function OnboardingModuleSelectionScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [selectedModules, setSelectedModules] = useState<ModuleType[]>([]);

  // Get all modules except command (always unlocked)
  const modules = moduleRegistry
    .getAllModules()
    .filter((m) => m.id !== "command" && m.id !== "settings")
    .map((m) => ({
      id: m.id,
      name: m.name,
      icon: m.icon,
    }));

  const handleToggleModule = useCallback((moduleId: ModuleType) => {
    setSelectedModules((prev) => {
      if (prev.includes(moduleId)) {
        return prev.filter((id) => id !== moduleId);
      } else if (prev.length < 3) {
        return [...prev, moduleId];
      }
      return prev;
    });
  }, []);

  const handleContinue = async () => {
    if (selectedModules.length !== 3) return;

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    try {
      await onboardingManager.startOnboarding(selectedModules);
      navigation.navigate("CommandCenter");
    } catch (error) {
      console.error("Failed to start onboarding:", error);
    }
  };

  const canContinue = selectedModules.length === 3;
  const maxReached = selectedModules.length >= 3;

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + Spacing.md,
            backgroundColor: theme.background,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <View>
            <ThemedText style={styles.headerTitle}>
              Choose Your Starter Modules
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Pick 3 things you do daily
            </ThemedText>
          </View>

          {/* Selection Counter */}
          <View
            style={[
              styles.counter,
              {
                backgroundColor: canContinue
                  ? theme.success
                  : theme.cardBackground,
                borderColor: canContinue ? theme.success : theme.border,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.counterText,
                { color: canContinue ? "#FFFFFF" : theme.text },
              ]}
            >
              {selectedModules.length}/3
            </ThemedText>
          </View>
        </View>

        {/* Info Banner */}
        {maxReached && (
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={[
              styles.infoBanner,
              {
                backgroundColor: `${theme.success}15`,
                borderColor: theme.success,
              },
            ]}
          >
            <Feather name="check-circle" size={16} color={theme.success} />
            <ThemedText style={styles.infoBannerText}>
              Perfect! More modules will unlock as you use the app.
            </ThemedText>
          </Animated.View>
        )}
      </View>

      {/* Module Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
      >
        <View style={styles.grid}>
          {modules.map((module, index) => (
            <ModuleCard
              key={module.id}
              module={module}
              selected={selectedModules.includes(module.id)}
              onToggle={() => handleToggleModule(module.id)}
              disabled={maxReached && !selectedModules.includes(module.id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(500)}
        style={[
          styles.bottomButton,
          {
            paddingBottom: insets.bottom + Spacing.lg,
            backgroundColor: theme.background,
            borderTopColor: theme.border,
          },
        ]}
      >
        <Pressable
          onPress={handleContinue}
          disabled={!canContinue}
          style={[
            styles.continueButton,
            {
              backgroundColor: canContinue
                ? theme.primary
                : theme.cardBackground,
              opacity: canContinue ? 1 : 0.5,
            },
          ]}
        >
          <ThemedText
            style={[
              styles.continueButtonText,
              { color: canContinue ? "#FFFFFF" : theme.textSecondary },
            ]}
          >
            {canContinue ? "Start Using AIOS" : "Select 3 Modules"}
          </ThemedText>
          {canContinue && (
            <Feather name="arrow-right" size={20} color="#FFFFFF" />
          )}
        </Pressable>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: Spacing.xs,
  },
  counter: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    minWidth: 56,
    alignItems: "center",
  },
  counterText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: CARD_GAP,
  },
  moduleCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    position: "relative",
  },
  selectionIndicator: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  moduleIcon: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  moduleName: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  moduleDescription: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 16,
  },
  bottomButton: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
  },
  continueButton: {
    flexDirection: "row",
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
