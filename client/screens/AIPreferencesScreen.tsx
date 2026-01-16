import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { db } from "@/storage/database";
import { Settings, AIPersonality } from "@/models/types";

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

export default function AIPreferencesScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [settings, setSettings] = useState<Settings | null>(null);
  const [aiName, setAiName] = useState("AIOS");
  const [isEditingName, setIsEditingName] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  const loadSettings = useCallback(async () => {
    const data = await db.settings.get();
    if (data) {
      setSettings(data);
      setAiName(data.aiName || "AIOS");
      setCustomPrompt(data.aiCustomPrompt || "");
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

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

  if (!settings) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

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
