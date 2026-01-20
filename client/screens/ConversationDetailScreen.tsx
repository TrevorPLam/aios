import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { db } from "@/storage/database";
import { Message, Conversation } from "@/models/types";
import { formatTime } from "@/utils/helpers";

type RouteParams = RouteProp<AppStackParamList, "ConversationDetail">;
type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  const { theme } = useTheme();
  const [showTypingDots, setShowTypingDots] = useState(false);

  useEffect(() => {
    if (message.content === "..." && !isCurrentUser) {
      setShowTypingDots(true);
      const timer = setTimeout(() => setShowTypingDots(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [message.content, isCurrentUser]);

  const TypingIndicator = () => (
    <View style={styles.typingContainer}>
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.typingDot, { backgroundColor: theme.textMuted }]}
      />
      <Animated.View
        entering={FadeIn.duration(300).delay(100)}
        style={[styles.typingDot, { backgroundColor: theme.textMuted }]}
      />
      <Animated.View
        entering={FadeIn.duration(300).delay(200)}
        style={[styles.typingDot, { backgroundColor: theme.textMuted }]}
      />
    </View>
  );

  return (
    <Animated.View
      entering={FadeInUp.springify()}
      style={[
        styles.messageBubbleContainer,
        isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer,
      ]}
    >
      {!isCurrentUser && (
        <ThemedText type="small" muted style={styles.senderName}>
          {message.senderName}
        </ThemedText>
      )}
      <View
        style={[
          styles.messageBubble,
          isCurrentUser
            ? { backgroundColor: theme.accent }
            : { backgroundColor: theme.backgroundDefault },
        ]}
      >
        {showTypingDots ? (
          <TypingIndicator />
        ) : (
          <>
            <ThemedText
              style={[
                styles.messageText,
                isCurrentUser && { color: theme.backgroundBlack },
              ]}
            >
              {message.content}
            </ThemedText>
            {message.attachments.length > 0 && (
              <View style={styles.attachmentsContainer}>
                {message.attachments.map((attachment) => (
                  <View
                    key={attachment.id}
                    style={[
                      styles.attachmentBadge,
                      {
                        backgroundColor: isCurrentUser
                          ? "rgba(0, 0, 0, 0.2)"
                          : theme.accentDim,
                      },
                    ]}
                  >
                    <Feather
                      name={
                        attachment.type === "image"
                          ? "image"
                          : attachment.type === "video"
                            ? "video"
                            : attachment.type === "audio"
                              ? "mic"
                              : "file"
                      }
                      size={16}
                      color={
                        isCurrentUser ? theme.backgroundBlack : theme.accent
                      }
                    />
                    <ThemedText
                      type="small"
                      style={[
                        styles.attachmentName,
                        isCurrentUser && { color: theme.backgroundBlack },
                      ]}
                      numberOfLines={1}
                    >
                      {attachment.fileName || "Attachment"}
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </View>
      <ThemedText type="small" muted style={styles.messageTime}>
        {formatTime(message.createdAt)}
        {isCurrentUser && message.isRead && " • Read"}
      </ThemedText>
    </Animated.View>
  );
}

export default function ConversationDetailScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<NavigationProp>();
  const { conversationId } = route.params;

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const currentUserId = "current_user";

  const loadData = useCallback(async () => {
    if (conversationId) {
      const conv = await db.conversations.get(conversationId);
      setConversation(conv);

      const msgs = await db.messages.getByConversation(conversationId);
      setMessages(msgs);

      // Mark messages as read
      await db.messages.markAsRead(conversationId, currentUserId);
      const unreadCount = await db.messages.getUnreadCount(
        conversationId,
        currentUserId,
      );
      await db.conversations.updateUnreadCount(conversationId, unreadCount);
    }
  }, [conversationId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (conversation) {
      navigation.setOptions({
        headerTitle: conversation.name,
      });
    }
  }, [conversation, navigation]);

  const handleSend = async () => {
    if (!inputText.trim() || !conversationId) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      conversationId,
      senderId: currentUserId,
      senderName: "You",
      content: inputText.trim(),
      type: "text",
      attachments: [],
      replyToId: null,
      isEdited: false,
      isRead: false,
      deliveredAt: new Date().toISOString(),
      readAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.messages.save(newMessage);

    // Update conversation
    if (conversation) {
      const updatedConversation = {
        ...conversation,
        lastMessageId: newMessage.id,
        lastMessageAt: newMessage.createdAt,
        lastMessagePreview: newMessage.content,
        updatedAt: newMessage.createdAt,
      };
      await db.conversations.save(updatedConversation);
    }

    setInputText("");
    loadData();

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleTyping = (text: string) => {
    setInputText(text);

    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      if (conversationId) {
        db.conversations.updateTyping(conversationId, currentUserId, true);
      }
    } else if (text.length === 0 && isTyping) {
      setIsTyping(false);
      if (conversationId) {
        db.conversations.updateTyping(conversationId, currentUserId, false);
      }
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.senderId === currentUserId;
    return <MessageBubble message={item} isCurrentUser={isCurrentUser} />;
  };

  if (!conversation) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.accent} />
      </ThemedView>
    );
  }

  const showTypingIndicator =
    conversation.isTyping.length > 0 &&
    !conversation.isTyping.includes(currentUserId);

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }}
          ListFooterComponent={
            showTypingIndicator ? (
              <View style={styles.typingIndicatorContainer}>
                <ThemedText type="small" muted>
                  {conversation.isTyping
                    .map((id) => {
                      const participant = conversation.participants.find(
                        (p) => p.userId === id,
                      );
                      return participant?.userName;
                    })
                    .filter(Boolean)
                    .join(", ")}{" "}
                  {conversation.isTyping.length === 1 ? "is" : "are"} typing...
                </ThemedText>
              </View>
            ) : null
          }
        />

        <View
          style={[
            styles.inputContainer,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              // Handle attachment
            }}
            style={styles.attachButton}
          >
            <Feather name="paperclip" size={24} color={theme.textSecondary} />
          </Pressable>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundBlack,
                color: theme.text,
              },
            ]}
            value={inputText}
            onChangeText={handleTyping}
            placeholder="Type a message..."
            placeholderTextColor={theme.textMuted}
            multiline
            maxLength={1000}
          />

          <Pressable
            onPress={handleSend}
            disabled={!inputText.trim()}
            style={[
              styles.sendButton,
              {
                backgroundColor: inputText.trim()
                  ? theme.accent
                  : theme.backgroundDefault,
              },
            ]}
          >
            <Feather
              name="send"
              size={20}
              color={inputText.trim() ? theme.backgroundBlack : theme.textMuted}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  keyboardView: {
    flex: 1,
  },
  messagesList: {
    padding: Spacing.md,
  },
  messageBubbleContainer: {
    marginBottom: Spacing.md,
    maxWidth: "80%",
  },
  currentUserContainer: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  otherUserContainer: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  senderName: {
    marginBottom: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  messageBubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    minWidth: 60,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTime: {
    marginTop: Spacing.xs,
    marginHorizontal: Spacing.sm,
  },
  attachmentsContainer: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  attachmentBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  attachmentName: {
    flex: 1,
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: Spacing.sm,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typingIndicatorContainer: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: Spacing.md,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  attachButton: {
    padding: Spacing.sm,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
