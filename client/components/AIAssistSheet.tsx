import React from "react";
import { View, StyleSheet, Pressable, Modal, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { ModuleType } from "@/models/types";

interface AIAction {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
}

const MODULE_ACTIONS: Record<ModuleType | "command", AIAction[]> = {
  command: [
    {
      id: "refresh",
      icon: "refresh-cw",
      title: "Refresh Recommendations",
      description: "Get new AI suggestions",
    },
    {
      id: "prioritize",
      icon: "trending-up",
      title: "Prioritize",
      description: "Reorder by urgency",
    },
    {
      id: "insights",
      icon: "bar-chart-2",
      title: "View Insights",
      description: "Productivity patterns",
    },
  ],
  notebook: [
    {
      id: "grammar",
      icon: "check-circle",
      title: "Check Grammar",
      description: "Fix spelling and grammar",
    },
    {
      id: "clarity",
      icon: "eye",
      title: "Improve Clarity",
      description: "Make writing clearer",
    },
    {
      id: "title",
      icon: "type",
      title: "Suggest Title",
      description: "Generate a title",
    },
    {
      id: "tags",
      icon: "tag",
      title: "Extract Tags",
      description: "Find relevant tags",
    },
    {
      id: "summary",
      icon: "file-text",
      title: "Summarize",
      description: "Create a summary",
    },
    {
      id: "checklist",
      icon: "list",
      title: "To Checklist",
      description: "Convert to checklist",
    },
  ],
  planner: [
    {
      id: "priority",
      icon: "alert-circle",
      title: "Suggest Priority",
      description: "Recommend task priority",
    },
    {
      id: "duedate",
      icon: "calendar",
      title: "Suggest Due Date",
      description: "Recommend deadline",
    },
    {
      id: "breakdown",
      icon: "git-branch",
      title: "Break Down",
      description: "Split into subtasks",
    },
    {
      id: "dependencies",
      icon: "link",
      title: "Find Dependencies",
      description: "Identify related tasks",
    },
  ],
  calendar: [
    {
      id: "focus",
      icon: "clock",
      title: "Block Focus Time",
      description: "Schedule deep work",
    },
    {
      id: "conflicts",
      icon: "alert-triangle",
      title: "Find Conflicts",
      description: "Identify overlaps",
    },
    {
      id: "optimize",
      icon: "shuffle",
      title: "Optimize Schedule",
      description: "Improve time allocation",
    },
  ],
  email: [
    {
      id: "draft",
      icon: "edit-3",
      title: "Draft Reply",
      description: "Generate response",
    },
    {
      id: "summarize",
      icon: "file-text",
      title: "Summarize Thread",
      description: "Get key points",
    },
    {
      id: "followup",
      icon: "send",
      title: "Follow Up",
      description: "Draft follow-up email",
    },
  ],
};

interface AIAssistSheetProps {
  visible: boolean;
  onClose: () => void;
  module: ModuleType | "command";
  onAction?: (actionId: string) => void;
}

export default function AIAssistSheet({
  visible,
  onClose,
  module,
  onAction,
}: AIAssistSheetProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const actions = MODULE_ACTIONS[module] || [];

  const handleAction = (actionId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onAction?.(actionId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          entering={FadeIn}
          style={[styles.backdrop, { backgroundColor: theme.overlay }]}
        />
      </Pressable>

      <Animated.View
        entering={SlideInDown.springify().damping(20)}
        style={[
          styles.sheet,
          {
            backgroundColor: theme.backgroundRoot,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <View style={styles.handle} />

        <View style={styles.header}>
          <View style={[styles.aiIcon, { backgroundColor: theme.accentDim }]}>
            <Feather name="cpu" size={20} color={theme.accent} />
          </View>
          <ThemedText type="h2">AI Assist</ThemedText>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color={theme.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.actions}>
          {actions.map((action) => (
            <Pressable
              key={action.id}
              onPress={() => handleAction(action.id)}
              style={({ pressed }) => [
                styles.actionItem,
                { backgroundColor: theme.backgroundDefault },
                pressed && { opacity: 0.8 },
              ]}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: theme.accentDim },
                ]}
              >
                <Feather name={action.icon} size={20} color={theme.accent} />
              </View>
              <View style={styles.actionText}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {action.title}
                </ThemedText>
                <ThemedText type="caption" secondary>
                  {action.description}
                </ThemedText>
              </View>
              <Feather name="chevron-right" size={20} color={theme.textMuted} />
            </Pressable>
          ))}
        </View>

        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <ThemedText type="small" muted style={styles.footerText}>
            AI actions are suggestions. Review before accepting.
          </ThemedText>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing.sm,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    marginLeft: "auto",
    padding: Spacing.xs,
  },
  actions: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    flex: 1,
    gap: 2,
  },
  footer: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderTopWidth: 1,
  },
  footerText: {
    textAlign: "center",
  },
});
