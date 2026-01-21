/**
 * AI Preferences Screen
 *
 * Purpose (Plain English):
 * Configure how your AI assistant behaves and which modules appear based on your context.
 * 
 * Features:
 * - AI assistant name customization
 * - Personality selection (default, enthusiastic, coach, witty, militant)
 * - Context zone selection (work, personal, focus, social, wellness, evening, weekend, auto)
 * - Custom personality traits/prompts
 * - Recommendation display and refresh preferences
 * 
 * Context Zones:
 * Context zones automatically show/hide relevant modules based on your current activity:
 * - AUTO: AI decides based on time and context
 * - WORK: Shows email, calendar, planner, notebook (9am-5pm weekdays)
 * - PERSONAL: Shows messages, photos, lists, budget
 * - FOCUS: Minimal distractions, only essential modules
 * - SOCIAL: Messages, contacts, photos for social time
 * - WELLNESS: Health, breaks, mindfulness reminders
 * - EVENING: Winding down after 6pm (messages, photos, lists)
 * - WEEKEND: Leisure and personal projects
 * 
 * Technical Implementation:
 * - Uses contextEngine from @/lib/contextEngine for zone management
 * - Listens to context changes via contextEngine.onChange()
 * - Updates user override via contextEngine.setUserOverride()
 * - Integrates with PersistentSidebar for module visibility
 * - Persists recommendation preferences for Command Center UI
 * 
 * Recent Updates:
 * - Added context zone selector UI (T-006)
 * - Added real-time context change detection
 * - Added manual override capability
 * - Added recommendation preferences (T-007)
 * - Disabled dependent recommendation toggles when recommendations are paused
 * 
 * @module AIPreferencesScreen
 */
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Switch,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { db } from "@/storage/database";
import { Settings, AIPersonality } from "@/models/types";
import { contextEngine, ContextZone } from "@/lib/contextEngine";
import { RecommendationEngine } from "@/lib/recommendationEngine";
import { AppStackParamList } from "@/navigation/AppNavigator";
import {
  refreshRecommendationsWithFeedback,
} from "@/utils/recommendationActions";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

type RecommendationSettingKey =
  | "recommendationsEnabled"
  | "recommendationAutoRefresh"
  | "recommendationShowEvidence"
  | "recommendationShowReasoning";

const PERSONALITIES: {
  id: AIPersonality;
  name: string;
  description: string;
}[] = [
  { id: "default", name: "Default", description: "Professional & balanced" },
  {
    id: "enthusiastic",
    name: "Enthusiastic",
    description: "Energetic & upbeat",
  },
  { id: "coach", name: "Coach", description: "Motivating & supportive" },
  { id: "witty", name: "Witty", description: "Clever & humorous" },
  { id: "militant", name: "Militant", description: "Direct & decisive" },
];

/**
 * Context Zones for adaptive interface
 * 
 * Plain English: Different "modes" the app can be in, which automatically
 * show/hide relevant modules based on your current activity.
 */
const CONTEXT_ZONES: {
  id: ContextZone;
  name: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
}[] = [
  {
    id: ContextZone.AUTO,
    name: "Auto",
    description: "Let AI decide based on time & context",
    icon: "cpu",
  },
  {
    id: ContextZone.WORK,
    name: "Work",
    description: "Email, calendar, planner, notebook",
    icon: "briefcase",
  },
  {
    id: ContextZone.PERSONAL,
    name: "Personal",
    description: "Messages, photos, lists, budget",
    icon: "home",
  },
  {
    id: ContextZone.FOCUS,
    name: "Focus",
    description: "Deep work, minimal distractions",
    icon: "target",
  },
  {
    id: ContextZone.SOCIAL,
    name: "Social",
    description: "Messages, contacts, photos",
    icon: "users",
  },
  {
    id: ContextZone.WELLNESS,
    name: "Wellness",
    description: "Health, breaks, mindfulness",
    icon: "heart",
  },
  {
    id: ContextZone.EVENING,
    name: "Evening",
    description: "Winding down, entertainment",
    icon: "moon",
  },
  {
    id: ContextZone.WEEKEND,
    name: "Weekend",
    description: "Leisure, personal projects",
    icon: "calendar",
  },
];

export default function AIPreferencesScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [settings, setSettings] = useState<Settings | null>(null);
  const [aiName, setAiName] = useState("AIOS");
  const [isEditingName, setIsEditingName] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [currentContextZone, setCurrentContextZone] = useState<ContextZone>(
    ContextZone.AUTO,
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadSettings = useCallback(async () => {
    const data = await db.settings.get();
    if (data) {
      setSettings(data);
      setAiName(data.aiName || "AIOS");
      setCustomPrompt(data.aiCustomPrompt || "");
    }

    // Get current context zone
    const zone = contextEngine.getCurrentZone();
    setCurrentContextZone(zone);
  }, []); // contextEngine is singleton, stable across renders

  /**
   * Handle context change notifications
   * 
   * Wrapped in useCallback to prevent unnecessary re-subscriptions
   */
  const handleContextChange = useCallback((detection: any) => {
    setCurrentContextZone(detection.zone);
  }, []);

  useEffect(() => {
    loadSettings();

    // Listen for context changes
    const unsubscribe = contextEngine.onChange(handleContextChange);

    return unsubscribe;
  }, [loadSettings, handleContextChange]);

  const handleEditName = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsEditingName(true);
  }, []);

  const handleSaveName = useCallback(async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (settings) {
      await db.settings.update({ aiName });
    }
    setIsEditingName(false);
  }, [settings, aiName]);

  const selectPersonality = useCallback(
    async (personality: AIPersonality) => {
      if (!settings) return;

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const updated = await db.settings.update({ aiPersonality: personality });
      setSettings(updated);
    },
    [settings],
  );

  const handleSavePrompt = useCallback(async () => {
    if (settings) {
      await db.settings.update({ aiCustomPrompt: customPrompt });
    }
  }, [settings, customPrompt]);

  const handleRefreshRecommendations = useCallback(async () => {
    if (isRefreshing || !settings) {
      return;
    }

    setIsRefreshing(true);
    const result = await refreshRecommendationsWithFeedback({
      isEnabled: settings.recommendationsEnabled,
      refresh: RecommendationEngine.refreshRecommendations,
    });
    setIsRefreshing(false);

    if (result.status === "error") {
      Alert.alert("Refresh Failed", result.message);
      return;
    }

    const title =
      result.status === "disabled" ? "Recommendations Paused" : "All Set";
    Alert.alert(title, result.message);
  }, [isRefreshing, settings]);

  const handleOpenRecommendationHistory = useCallback(() => {
    navigation.navigate("RecommendationHistory");
  }, [navigation]);

  /**
   * Toggle a recommendation setting in persistent storage.
   * 
   * Keeps local state in sync so the UI updates immediately.
   */
  const toggleRecommendationSetting = useCallback(
    async (key: RecommendationSettingKey) => {
      if (!settings) return;

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const updated = await db.settings.update({ [key]: !settings[key] });
      setSettings(updated);
    },
    [settings],
  );

  /**
   * Handle context zone selection
   * 
   * Plain English: When user picks a context mode, update the context engine
   * and show relevant modules in the sidebar.
   * 
   * Note: contextEngine is a singleton instance, so it's stable across renders.
   * No need to include in dependency array.
   */
  const selectContextZone = useCallback(
    (zone: ContextZone) => {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Set user override (null means AUTO mode)
      contextEngine.setUserOverride(zone === ContextZone.AUTO ? null : zone);
      setCurrentContextZone(zone);
    },
    [], // contextEngine is singleton, stable across renders
  );

  if (!settings) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  const recommendationsDisabled = !settings.recommendationsEnabled;

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
          AI CONFIGURATION
        </ThemedText>
        <View
          style={[styles.section, { backgroundColor: theme.backgroundDefault }]}
        >
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Feather name="cpu" size={20} color={theme.accent} />
              <ThemedText type="body">AI Name</ThemedText>
            </View>
            <View style={styles.nameActions}>
              {isEditingName ? (
                <>
                  <TextInput
                    value={aiName}
                    onChangeText={setAiName}
                    style={[
                      styles.nameInput,
                      {
                        color: theme.text,
                        backgroundColor: theme.backgroundSecondary,
                        borderColor: theme.accent,
                      },
                    ]}
                    placeholder="AIOS"
                    placeholderTextColor={theme.textMuted}
                    autoFocus
                  />
                  <Pressable
                    onPress={handleSaveName}
                    style={[
                      styles.actionButton,
                      { backgroundColor: theme.accent },
                    ]}
                  >
                    <Feather name="check" size={16} color={theme.buttonText} />
                  </Pressable>
                </>
              ) : (
                <>
                  <ThemedText type="body" style={styles.nameText}>
                    {aiName}
                  </ThemedText>
                  <Pressable
                    onPress={handleEditName}
                    style={[
                      styles.actionButton,
                      { backgroundColor: theme.backgroundSecondary },
                    ]}
                  >
                    <Feather name="edit-2" size={16} color={theme.accent} />
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </View>

        <ThemedText type="caption" secondary style={styles.sectionTitle}>
          PERSONALITY
        </ThemedText>
        <View
          style={[styles.section, { backgroundColor: theme.backgroundDefault }]}
        >
          {PERSONALITIES.map((personality, index) => (
            <Pressable
              key={personality.id}
              onPress={() => selectPersonality(personality.id)}
              style={[
                styles.personalityRow,
                index < PERSONALITIES.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
                },
              ]}
            >
              <View style={styles.personalityInfo}>
                <ThemedText type="body">{personality.name}</ThemedText>
                <ThemedText type="small" muted>
                  {personality.description}
                </ThemedText>
              </View>
              {settings.aiPersonality === personality.id && (
                <Feather name="check" size={20} color={theme.accent} />
              )}
            </Pressable>
          ))}
        </View>

        <ThemedText type="caption" secondary style={styles.sectionTitle}>
          CONTEXT MODE
        </ThemedText>
        <View
          style={[styles.section, { backgroundColor: theme.backgroundDefault }]}
        >
          <View style={styles.contextInfo}>
            <Feather name="info" size={16} color={theme.textSecondary} />
            <ThemedText type="small" muted>
              Control which modules appear based on your current activity
            </ThemedText>
          </View>
          {CONTEXT_ZONES.map((zone, index) => (
            <Pressable
              key={zone.id}
              onPress={() => selectContextZone(zone.id)}
              style={[
                styles.contextRow,
                {
                  borderBottomWidth:
                    index < CONTEXT_ZONES.length - 1 ? 1 : 0,
                  borderBottomColor: theme.border,
                },
              ]}
            >
              <View style={styles.contextLeft}>
                <View
                  style={[
                    styles.contextIcon,
                    {
                      backgroundColor:
                        currentContextZone === zone.id
                          ? theme.accentDim
                          : theme.backgroundSecondary,
                    },
                  ]}
                >
                  <Feather
                    name={zone.icon}
                    size={18}
                    color={
                      currentContextZone === zone.id
                        ? theme.accent
                        : theme.textSecondary
                    }
                  />
                </View>
                <View style={styles.contextText}>
                  <ThemedText type="body">{zone.name}</ThemedText>
                  <ThemedText type="small" muted>
                    {zone.description}
                  </ThemedText>
                </View>
              </View>
              {currentContextZone === zone.id && (
                <Feather name="check" size={20} color={theme.accent} />
              )}
            </Pressable>
          ))}
        </View>

        <ThemedText type="caption" secondary style={styles.sectionTitle}>
          PERSONALITY TRAITS
        </ThemedText>
        <View
          style={[styles.section, { backgroundColor: theme.backgroundDefault }]}
        >
          <View style={styles.promptContainer}>
            <ThemedText type="body" style={styles.promptLabel}>
              Customize Your Assistant
            </ThemedText>
            <TextInput
              value={customPrompt}
              onChangeText={setCustomPrompt}
              onBlur={handleSavePrompt}
              multiline
              numberOfLines={6}
              style={[
                styles.promptInput,
                {
                  color: theme.text,
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.border,
                },
              ]}
              placeholder="Describe how you want your AI assistant to behave..."
              placeholderTextColor={theme.textMuted}
              textAlignVertical="top"
            />
          </View>
        </View>

        <ThemedText type="caption" secondary style={styles.sectionTitle}>
          RECOMMENDATIONS
        </ThemedText>
        <View
          style={[styles.section, { backgroundColor: theme.backgroundDefault }]}
        >
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Feather name="sparkles" size={20} color={theme.accent} />
              <View>
                <ThemedText type="body">Show Recommendations</ThemedText>
                <ThemedText type="small" muted>
                  Display AI cards in Command Center
                </ThemedText>
              </View>
            </View>
            <Switch
              value={settings.recommendationsEnabled}
              onValueChange={() =>
                toggleRecommendationSetting("recommendationsEnabled")
              }
              trackColor={{
                false: theme.backgroundSecondary,
                true: theme.accentDim,
              }}
              thumbColor={
                settings.recommendationsEnabled ? theme.accent : theme.textSecondary
              }
            />
          </View>
          <View
            style={[
              styles.settingRow,
              styles.settingDivider,
              { borderTopColor: theme.border },
            ]}
          >
            <View style={styles.settingInfo}>
              <Feather
                name="refresh-cw"
                size={20}
                color={recommendationsDisabled ? theme.textMuted : theme.accent}
              />
              <View>
                <ThemedText type="body">Auto-refresh Suggestions</ThemedText>
                <ThemedText type="small" muted>
                  Keep at least a few fresh recommendations
                </ThemedText>
              </View>
            </View>
            <Switch
              value={settings.recommendationAutoRefresh}
              disabled={recommendationsDisabled}
              onValueChange={() =>
                toggleRecommendationSetting("recommendationAutoRefresh")
              }
              trackColor={{
                false: theme.backgroundSecondary,
                true: theme.accentDim,
              }}
              thumbColor={
                settings.recommendationAutoRefresh
                  ? theme.accent
                  : theme.textSecondary
              }
            />
          </View>
          <View
            style={[
              styles.settingRow,
              styles.settingDivider,
              { borderTopColor: theme.border },
            ]}
          >
            <View style={styles.settingInfo}>
              <Feather
                name="info"
                size={20}
                color={recommendationsDisabled ? theme.textMuted : theme.accent}
              />
              <View>
                <ThemedText type="body">Show Reasoning</ThemedText>
                <ThemedText type="small" muted>
                  Display a short explanation on each card
                </ThemedText>
              </View>
            </View>
            <Switch
              value={settings.recommendationShowReasoning}
              disabled={recommendationsDisabled}
              onValueChange={() =>
                toggleRecommendationSetting("recommendationShowReasoning")
              }
              trackColor={{
                false: theme.backgroundSecondary,
                true: theme.accentDim,
              }}
              thumbColor={
                settings.recommendationShowReasoning
                  ? theme.accent
                  : theme.textSecondary
              }
            />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Feather
                name="activity"
                size={20}
                color={recommendationsDisabled ? theme.textMuted : theme.accent}
              />
              <View>
                <ThemedText type="body">Show Evidence</ThemedText>
                <ThemedText type="small" muted>
                  Highlight signals that informed the suggestion
                </ThemedText>
              </View>
            </View>
            <Switch
              value={settings.recommendationShowEvidence}
              disabled={recommendationsDisabled}
              onValueChange={() =>
                toggleRecommendationSetting("recommendationShowEvidence")
              }
              trackColor={{
                false: theme.backgroundSecondary,
                true: theme.accentDim,
              }}
              thumbColor={
                settings.recommendationShowEvidence
                  ? theme.accent
                  : theme.textSecondary
              }
            />
          </View>
          <View
            style={[
              styles.settingRow,
              styles.settingDivider,
              { borderTopColor: theme.border },
            ]}
          >
            <View style={styles.settingInfo}>
              <Feather
                name="book-open"
                size={20}
                color={recommendationsDisabled ? theme.textMuted : theme.accent}
              />
              <View>
                <ThemedText type="body">Recommendation Tools</ThemedText>
                <ThemedText type="small" muted>
                  Refresh suggestions or review past decisions
                </ThemedText>
              </View>
            </View>
            <View style={styles.recommendationActions}>
              <Pressable
                onPress={handleRefreshRecommendations}
                disabled={isRefreshing || recommendationsDisabled}
                style={({ pressed }) => [
                  styles.recommendationAction,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    opacity: recommendationsDisabled ? 0.6 : 1,
                  },
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Refresh recommendations"
              >
                <Feather
                  name="refresh-cw"
                  size={16}
                  color={isRefreshing || recommendationsDisabled ? theme.textMuted : theme.accent}
                />
                <ThemedText type="small">
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={handleOpenRecommendationHistory}
                style={({ pressed }) => [
                  styles.recommendationAction,
                  { backgroundColor: theme.backgroundSecondary },
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="View recommendation history"
              >
                <Feather name="clock" size={16} color={theme.accent} />
                <ThemedText type="small">History</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>

        <ThemedText type="caption" muted style={styles.note}>
          Customize your AI assistant's personality and behavior
        </ThemedText>
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
  settingRow: {
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
  recommendationActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  recommendationAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  nameActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  nameText: {
    minWidth: 80,
    textAlign: "right",
  },
  nameInput: {
    fontSize: 16,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    minWidth: 120,
    textAlign: "right",
    borderWidth: 1,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  personalityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
  },
  personalityInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  contextInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  contextRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
  },
  settingDivider: {
    borderTopWidth: 1,
  },
  contextLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  contextIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  contextText: {
    flex: 1,
    gap: Spacing.xs,
  },
  promptContainer: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  promptLabel: {
    marginBottom: Spacing.xs,
  },
  promptInput: {
    fontSize: 14,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    minHeight: 120,
  },
  note: {
    marginTop: Spacing.md,
    marginLeft: Spacing.sm,
    fontSize: 12,
  },
});
