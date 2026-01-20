import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { EmailThread, EmailMessage } from "@/models/types";
import { MOCK_EMAIL_THREADS } from "@/utils/seedData";
import { formatDateTime } from "@/utils/helpers";

type RouteProps = RouteProp<AppStackParamList, "ThreadDetail">;

function MessageCard({
  message,
  index,
}: {
  message: EmailMessage;
  index: number;
}) {
  const { theme } = useTheme();
  const isFromMe = message.from === "You";

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
      <View
        style={[
          styles.messageCard,
          { backgroundColor: theme.backgroundDefault },
        ]}
      >
        <View style={styles.messageHeader}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: isFromMe
                  ? theme.accentDim
                  : theme.backgroundSecondary,
              },
            ]}
          >
            <ThemedText
              type="small"
              style={{ color: isFromMe ? theme.accent : theme.textSecondary }}
            >
              {message.from.charAt(0).toUpperCase()}
            </ThemedText>
          </View>
          <View style={styles.senderInfo}>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              {message.from}
            </ThemedText>
            <ThemedText type="small" muted>
              {formatDateTime(message.sentAt)}
            </ThemedText>
          </View>
        </View>
        <ThemedText type="body" style={styles.messageBody}>
          {message.body}
        </ThemedText>
      </View>
    </Animated.View>
  );
}

export default function ThreadDetailScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProps>();

  const [thread, setThread] = useState<EmailThread | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showDraft, setShowDraft] = useState(false);

  useEffect(() => {
    const found = MOCK_EMAIL_THREADS.find(
      (t) => t.id === route.params.threadId,
    );
    setThread(found || null);
  }, [route.params.threadId]);

  const handleSendPress = () => {
    Alert.alert(
      "Integrations Not Enabled",
      "Email sending is not available in this build. Connect your email provider in Settings to enable sending.",
      [{ text: "OK" }],
    );
  };

  const generateDraft = () => {
    if (thread) {
      const lastMessage = thread.messages[thread.messages.length - 1];
      const sender =
        lastMessage.from !== "You" ? lastMessage.from.split(" ")[0] : "there";
      setReplyText(
        `Hi ${sender},\n\nThank you for your message. I'll look into this and get back to you shortly.\n\nBest regards`,
      );
      setShowDraft(true);
    }
  };

  if (!thread) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  const renderMessage = ({
    item,
    index,
  }: {
    item: EmailMessage;
    index: number;
  }) => <MessageCard message={item} index={index} />;

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.subjectHeader,
          { marginTop: 0, backgroundColor: theme.backgroundDefault },
        ]}
      >
        <ThemedText type="h2">{thread.subject}</ThemedText>
        <View style={styles.participantsRow}>
          <Feather name="users" size={14} color={theme.textMuted} />
          <ThemedText type="caption" muted>
            {thread.participants.join(", ")}
          </ThemedText>
        </View>
      </View>

      <FlatList
        data={thread.messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View
        style={[
          styles.replySection,
          { paddingBottom: insets.bottom + Spacing.md },
        ]}
      >
        {showDraft ? (
          <View style={styles.draftContainer}>
            <TextInput
              value={replyText}
              onChangeText={setReplyText}
              placeholder="Write your reply..."
              placeholderTextColor={theme.textMuted}
              style={[
                styles.replyInput,
                { color: theme.text, backgroundColor: theme.backgroundDefault },
              ]}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.draftActions}>
              <Pressable
                onPress={() => setShowDraft(false)}
                style={[
                  styles.draftButton,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              >
                <Feather name="x" size={18} color={theme.textSecondary} />
                <ThemedText type="small" secondary>
                  Cancel
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={handleSendPress}
                style={[
                  styles.draftButton,
                  { backgroundColor: theme.accentDim },
                ]}
              >
                <Feather name="send" size={18} color={theme.accent} />
                <ThemedText type="small" style={{ color: theme.accent }}>
                  Send
                </ThemedText>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            onPress={generateDraft}
            style={[styles.replyButton, { backgroundColor: theme.accent }]}
          >
            <Feather name="edit-2" size={18} color={theme.backgroundRoot} />
            <ThemedText
              type="body"
              style={{ color: theme.backgroundRoot, fontWeight: "600" }}
            >
              Reply
            </ThemedText>
          </Pressable>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subjectHeader: {
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  participantsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  messageCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  senderInfo: {
    flex: 1,
  },
  messageBody: {
    lineHeight: 22,
  },
  replySection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  replyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  draftContainer: {
    gap: Spacing.md,
  },
  replyInput: {
    fontSize: 16,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    minHeight: 120,
  },
  draftActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  draftButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
});
