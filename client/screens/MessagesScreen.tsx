import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
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
import { HeaderLeftNav, HeaderRightWithAction } from "@/components/HeaderNav";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

interface ConversationCardProps {
  conversation: Conversation;
  onPress: () => void;
  index: number;
}

function ConversationCard({ conversation, onPress, index }: ConversationCardProps) {
  const { theme } = useTheme();
  const hasUnread = conversation.unreadCount > 0;

  const getParticipantNames = () => {
    if (conversation.type === "group") {
      return conversation.name;
    }
    const otherParticipant = conversation.participants.find(
      (p) => p.userId !== "current_user"
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
          <View
            style={[
              styles.avatar,
              { backgroundColor: theme.accentDim },
            ]}
          >
            <Feather
              name={conversation.type === "group" ? "users" : "user"}
              size={24}
              color={theme.accent}
            />
          </View>
          {conversation.participants.some((p) => p.isOnline && p.userId !== "current_user") && (
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
              {formatRelativeDate(conversation.lastMessageAt || conversation.createdAt)}
            </ThemedText>
          </View>

          <View style={styles.messagePreviewRow}>
            <ThemedText
              type="body"
              secondary={!hasUnread}
              style={[
                styles.messagePreview,
                hasUnread && { color: theme.textPrimary, fontWeight: "600" },
              ]}
              numberOfLines={2}
            >
              {conversation.isTyping.length > 0
                ? "Typing..."
                : conversation.lastMessagePreview || "No messages yet"}
            </ThemedText>
            {hasUnread && (
              <View
                style={[
                  styles.unreadBadge,
                  { backgroundColor: theme.accent },
                ]}
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
  const headerHeight = useHeaderHeight();
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
    }, [loadConversations])
  );

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderLeftNav />,
      headerRight: () => (
        <HeaderRightWithAction
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate("ConversationDetail", {});
          }}
        />
      ),
    });
  }, [navigation]);

  const handleConversationPress = async (conversation: Conversation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("ConversationDetail", { conversationId: conversation.id });
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
      <View style={styles.tabBar}>
        <Pressable
          onPress={() => setShowArchived(false)}
          style={[
            styles.tab,
            !showArchived && { borderBottomColor: theme.accent, borderBottomWidth: 2 },
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
            showArchived && { borderBottomColor: theme.accent, borderBottomWidth: 2 },
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
            index={index}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          conversations.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />

      <BottomNav currentModule="messages" onAIAssist={handleAIAssist} />

      <AIAssistSheet
        isVisible={showAISheet}
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
});
