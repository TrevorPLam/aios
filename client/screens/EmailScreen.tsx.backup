/**
 * EmailScreen Module
 *
 * Email thread viewer with inbox-style interface (UI mockup).
 * Features:
 * - Thread list with sender, subject, and preview
 * - Read/unread status indicators
 * - Star/favorite functionality
 * - Relative date formatting
 * - Empty state for zero emails
 * - AI assistance integration
 * - Note: Currently uses mock data for demonstration
 *
 * @module EmailScreen
 */

import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  Platform,
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
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { EmailThread } from "@/models/types";
import { MOCK_EMAIL_THREADS } from "@/utils/seedData";
import { formatRelativeDate, truncateText } from "@/utils/helpers";
import { BottomNav } from "@/components/BottomNav";
import AIAssistSheet from "@/components/AIAssistSheet";
import { HeaderLeftNav, HeaderRightNav } from "@/components/HeaderNav";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

function ThreadCard({
  thread,
  onPress,
  index,
}: {
  thread: EmailThread;
  onPress: () => void;
  index: number;
}) {
  const { theme } = useTheme();
  const lastMessage = thread.messages[thread.messages.length - 1];
  const sender =
    thread.participants.find((p) => p !== "You") || thread.participants[0];

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.threadCard,
          { backgroundColor: theme.backgroundDefault },
          !thread.isRead && styles.unreadCard,
          pressed && { opacity: 0.8 },
        ]}
      >
        <View style={[styles.avatar, { backgroundColor: theme.accentDim }]}>
          <ThemedText
            type="body"
            style={{ color: theme.accent, fontWeight: "600" }}
          >
            {sender.charAt(0).toUpperCase()}
          </ThemedText>
        </View>
        <View style={styles.threadContent}>
          <View style={styles.threadHeader}>
            <ThemedText
              type="body"
              style={[
                styles.senderName,
                !thread.isRead && { fontWeight: "700" },
              ]}
              numberOfLines={1}
            >
              {sender}
            </ThemedText>
            <ThemedText type="small" muted>
              {formatRelativeDate(thread.lastMessageAt)}
            </ThemedText>
          </View>
          <ThemedText
            type="body"
            style={[styles.subject, !thread.isRead && { fontWeight: "600" }]}
            numberOfLines={1}
          >
            {thread.subject}
          </ThemedText>
          <ThemedText type="caption" secondary numberOfLines={1}>
            {truncateText(lastMessage.body.replace(/\n/g, " "), 60)}
          </ThemedText>
        </View>
        <View style={styles.threadActions}>
          {thread.isStarred && (
            <Feather name="star" size={16} color={theme.warning} />
          )}
          {!thread.isRead && (
            <View
              style={[styles.unreadDot, { backgroundColor: theme.accent }]}
            />
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function EmailScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [threads] = useState<EmailThread[]>(MOCK_EMAIL_THREADS);
  const [showAISheet, setShowAISheet] = useState(false);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderLeftNav />,
      headerRight: () => <HeaderRightNav />,
    });
  }, [navigation, theme]);

  const handleSearch = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Search functionality would go here
  };

  const renderThread = ({
    item,
    index,
  }: {
    item: EmailThread;
    index: number;
  }) => (
    <ThreadCard
      thread={item}
      index={index}
      onPress={() => navigation.navigate("ThreadDetail", { threadId: item.id })}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.banner,
          { marginTop: 0, backgroundColor: theme.warningDim },
        ]}
      >
        <Feather name="info" size={16} color={theme.warning} />
        <ThemedText type="small" style={{ color: theme.warning, flex: 1 }}>
          Email integration not enabled in this build
        </ThemedText>
      </View>

      <FlatList
        data={threads}
        renderItem={renderThread}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + Spacing["5xl"] },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Image
              source={require("../../assets/images/empty-email.png")}
              style={styles.emptyImage}
              resizeMode="contain"
            />
            <ThemedText type="h3" style={styles.emptyTitle}>
              Inbox Empty
            </ThemedText>
            <ThemedText type="body" secondary style={styles.emptyText}>
              No emails to display
            </ThemedText>
          </View>
        }
      />

      <Pressable
        onPress={handleSearch}
        style={[
          styles.fab,
          {
            backgroundColor: theme.accent,
            bottom: insets.bottom + Spacing["5xl"] + Spacing.lg,
            right: Spacing.lg,
          },
        ]}
      >
        <Feather name="search" size={24} color={theme.buttonText} />
      </Pressable>

      <View style={styles.bottomNavContainer}>
        <BottomNav onAiPress={() => setShowAISheet(true)} />
      </View>

      <AIAssistSheet
        visible={showAISheet}
        onClose={() => setShowAISheet(false)}
        module="email"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    padding: Spacing.xs,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  threadCard: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
    ...Shadows.card,
  },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: "#00D9FF",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  threadContent: {
    flex: 1,
    gap: 2,
  },
  threadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  senderName: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  subject: {
    marginBottom: 2,
  },
  threadActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: Spacing["5xl"],
    paddingHorizontal: Spacing["2xl"],
  },
  emptyImage: {
    width: 180,
    height: 180,
    opacity: 0.8,
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    marginBottom: Spacing.sm,
  },
  emptyText: {
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
