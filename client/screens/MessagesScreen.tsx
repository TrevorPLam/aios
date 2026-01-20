/**
 * MessagesScreen Module
 *
 * P2P messaging with conversation list interface.
 * Features:
 * - Direct and group conversations
 * - Unread message counts
 * - Last message preview
 * - Typing indicators
 * - Online status
 * - Pin/mute/archive actions
 * - Auto-archive old conversations (14+ days)
 * - New conversation creation
 * - AI assistance integration
 * - Haptic feedback
 *
 * @module MessagesScreen
 */

import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { db } from "@/storage/database";
import { Conversation } from "@/models/types";
import { formatRelativeDate } from "@/utils/helpers";
import { BottomNav } from "@/components/BottomNav";
import AIAssistSheet from "@/components/AIAssistSheet";
import { HeaderLeftNav, HeaderRightNav } from "@/components/HeaderNav";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

interface ConversationCardProps {
  conversation: Conversation;
  onPress: () => void;
  onMessagePress: () => void;
  index: number;
}

function ConversationCard({
  conversation,
  onPress,
  onMessagePress,
  index,
}: ConversationCardProps) {
  const { theme } = useTheme();
  const hasUnread = conversation.unreadCount > 0;

  const getParticipantNames = () => {
    if (conversation.type === "group") {
      return conversation.name;
    }
    const otherParticipant = conversation.participants.find(
      (p) => p.userId !== "current_user",
    );
    return otherParticipant?.userName || conversation.name;
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.conversationCard,
          { backgroundColor: theme.backgroundDefault },
          hasUnread && { borderLeftColor: theme.accent, borderLeftWidth: 3 },
          pressed && { opacity: 0.8 },
        ]}
      >
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: theme.accentDim }]}>
            <Feather
              name={conversation.type === "group" ? "users" : "user"}
              size={24}
              color={theme.accent}
            />
          </View>
          {conversation.participants.some(
            (p) => p.isOnline && p.userId !== "current_user",
          ) && (
            <View
              style={[
                styles.onlineIndicator,
                { backgroundColor: theme.success },
              ]}
            />
          )}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <ThemedText
              type="h3"
              style={[styles.conversationName, hasUnread && styles.unreadText]}
              numberOfLines={1}
            >
              {getParticipantNames()}
            </ThemedText>
            <ThemedText type="small" muted>
              {formatRelativeDate(
                conversation.lastMessageAt || conversation.createdAt,
              )}
            </ThemedText>
          </View>

          <View style={styles.messagePreviewRow}>
            <ThemedText
              type="body"
              secondary={!hasUnread}
              style={[
                styles.messagePreview,
                hasUnread && { color: theme.text, fontWeight: "600" },
              ]}
              numberOfLines={2}
            >
              {conversation.isTyping.length > 0
                ? "Typing..."
                : conversation.lastMessagePreview || "No messages yet"}
            </ThemedText>
            {hasUnread && (
              <View
                style={[styles.unreadBadge, { backgroundColor: theme.accent }]}
              >
                <ThemedText
                  type="small"
                  style={[styles.unreadCount, { color: theme.background }]}
                >
                  {conversation.unreadCount}
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        <View style={styles.conversationActions}>
          <Pressable
            onPress={(event) => {
              event.stopPropagation?.();
              onMessagePress();
            }}
            style={({ pressed }) => [
              styles.messageButton,
              { backgroundColor: theme.accentDim },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Feather name="message-circle" size={16} color={theme.accent} />
          </Pressable>
          {conversation.isPinned && (
            <Feather name="bookmark" size={16} color={theme.accent} />
          )}
          {conversation.isMuted && (
            <Feather name="bell-off" size={16} color={theme.textMuted} />
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function MessagesScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showAISheet, setShowAISheet] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const loadConversations = useCallback(async () => {
    const data = showArchived
      ? await db.conversations.getAllArchived()
      : await db.conversations.getAllActive();
    setConversations(data);
  }, [showArchived]);

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [loadConversations]),
  );

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderLeftNav />,
      headerRight: () => <HeaderRightNav />,
    });
  }, [navigation]);

  const handleAddConversation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("ConversationDetail", {});
  };

  const handleConversationPress = async (conversation: Conversation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("ConversationDetail", {
      conversationId: conversation.id,
    });
  };

  const handleAIAssist = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowAISheet(true);
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather name="message-square" size={64} color={theme.textMuted} />
      <ThemedText type="h2" style={styles.emptyTitle}>
        No Conversations
      </ThemedText>
      <ThemedText type="body" secondary style={styles.emptySubtitle}>
        {showArchived
          ? "No archived conversations"
          : "Start a new conversation to get started"}
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.tabBar, { marginTop: 0 }]}>
        <Pressable
          onPress={() => setShowArchived(false)}
          style={[
            styles.tab,
            !showArchived && {
              borderBottomColor: theme.accent,
              borderBottomWidth: 2,
            },
          ]}
        >
          <ThemedText
            type="body"
            style={[!showArchived && { color: theme.accent }]}
          >
            Active
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => setShowArchived(true)}
          style={[
            styles.tab,
            showArchived && {
              borderBottomColor: theme.accent,
              borderBottomWidth: 2,
            },
          ]}
        >
          <ThemedText
            type="body"
            style={[showArchived && { color: theme.accent }]}
          >
            Archived
          </ThemedText>
        </Pressable>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <ConversationCard
            conversation={item}
            onPress={() => handleConversationPress(item)}
            onMessagePress={() => handleConversationPress(item)}
            index={index}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom: insets.bottom + Spacing["5xl"],
          },
          conversations.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />

      <Pressable
        onPress={handleAddConversation}
        style={[
          styles.fab,
          {
            backgroundColor: theme.accent,
            bottom: insets.bottom + Spacing["5xl"] + Spacing.lg,
            right: Spacing.lg,
          },
        ]}
      >
        <Feather name="plus" size={24} color={theme.buttonText} />
      </Pressable>

      <View style={styles.bottomNavContainer}>
        <BottomNav onAiPress={handleAIAssist} />
      </View>

      <AIAssistSheet
        visible={showAISheet}
        onClose={() => setShowAISheet(false)}
        module="messages"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  listContent: {
    padding: Spacing.md,
  },
  emptyList: {
    flexGrow: 1,
  },
  conversationCard: {
    flexDirection: "row",
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    ...Shadows.small,
  },
  avatarContainer: {
    position: "relative",
    marginRight: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#1A1F2E",
  },
  conversationContent: {
    flex: 1,
    justifyContent: "center",
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  conversationName: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  unreadText: {
    fontWeight: "700",
  },
  messagePreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  messagePreview: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xs,
  },
  unreadCount: {
    fontSize: 11,
    fontWeight: "700",
  },
  conversationActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  messageButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xs,
    borderRadius: 999,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.fab,
  },
  bottomNavContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
});
