import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as Contacts from "expo-contacts";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { db } from "@/storage/database";
import { Contact } from "@/models/types";
import { BottomNav } from "@/components/BottomNav";
import AIAssistSheet from "@/components/AIAssistSheet";
import { HeaderLeftNav, HeaderRightNav } from "@/components/HeaderNav";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

function ContactCard({
  contact,
  onPress,
  onMessagePress,
  index,
}: {
  contact: Contact;
  onPress: () => void;
  onMessagePress: () => void;
  index: number;
}) {
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeInDown.delay(index * 30).springify()}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.contactCard,
          { backgroundColor: theme.backgroundDefault },
          pressed && { opacity: 0.8 },
        ]}
      >
        <View style={styles.contactContent}>
          {contact.imageUri ? (
            <Image source={{ uri: contact.imageUri }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: theme.accentDim },
              ]}
            >
              <ThemedText type="h3" style={{ color: theme.accent }}>
                {contact.name.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
          )}
          <View style={styles.contactInfo}>
            <ThemedText type="body" numberOfLines={1}>
              {contact.name}
            </ThemedText>
            {contact.phoneNumbers.length > 0 && (
              <ThemedText type="small" muted numberOfLines={1}>
                {contact.phoneNumbers[0]}
              </ThemedText>
            )}
          </View>
          <View style={styles.contactActions}>
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
              <ThemedText type="small" style={{ color: theme.accent }}>
                Message
              </ThemedText>
            </Pressable>
            {!contact.isRegistered && (
              <View style={styles.plusIconContainer}>
                <Feather name="plus-circle" size={22} color={theme.accent} />
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function ContactsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showAISheet, setShowAISheet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadContacts = useCallback(async () => {
    const data = await db.contacts.getAllSorted();
    setContacts(data);
  }, []);

  const importContacts = useCallback(async () => {
    try {
      setIsLoading(true);

      const { status } = await Contacts.requestPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow access to contacts to import them.",
          [{ text: "OK" }],
        );
        setIsLoading(false);
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails,
          Contacts.Fields.Birthday,
          Contacts.Fields.Company,
          Contacts.Fields.JobTitle,
          Contacts.Fields.Image,
        ],
      });

      const contactsList: Contact[] = data.map((c) => {
        const name = c.name || "Unknown";
        return {
          id: c.id,
          name,
          firstName: c.firstName,
          lastName: c.lastName,
          phoneNumbers:
            c.phoneNumbers?.map((p) => p.number).filter(Boolean) || [],
          emails: c.emails?.map((e) => e.email).filter(Boolean) || [],
          birthday:
            c.birthday &&
            c.birthday.year !== undefined &&
            c.birthday.month !== undefined &&
            c.birthday.day !== undefined
              ? `${c.birthday.year}-${String(c.birthday.month).padStart(2, "0")}-${String(c.birthday.day).padStart(2, "0")}`
              : undefined,
          company: c.company,
          jobTitle: c.jobTitle,
          imageUri: c.imageAvailable && c.image?.uri ? c.image.uri : undefined,
          isRegistered: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });

      await db.contacts.syncFromNative(contactsList);
      await loadContacts();

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert("Success", `Imported ${contactsList.length} contacts`, [
        { text: "OK" },
      ]);
    } catch (error) {
      console.error("Error importing contacts:", error);
      Alert.alert("Error", "Failed to import contacts. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [loadContacts]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadContacts);
    return unsubscribe;
  }, [navigation, loadContacts]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderLeftNav />,
      headerRight: () => <HeaderRightNav />,
    });
  }, [navigation, theme]);

  const renderContact = ({ item, index }: { item: Contact; index: number }) => (
    <ContactCard
      contact={item}
      index={index}
      onMessagePress={async () => {
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        const conversations = await db.conversations.getAll();
        const existingConversation = conversations.find(
          (conversation) =>
            conversation.type === "direct" &&
            conversation.participants.some((p) => p.userId === item.id),
        );

        if (existingConversation) {
          navigation.navigate("ConversationDetail", {
            conversationId: existingConversation.id,
          });
          return;
        }

        const now = new Date().toISOString();
        const newConversation = {
          id: `conv_${item.id}`,
          type: "direct" as const,
          name: item.name,
          participants: [
            {
              userId: "current_user",
              userName: "You",
              isOnline: true,
              lastSeenAt: now,
              joinedAt: now,
            },
            {
              userId: item.id,
              userName: item.name,
              avatarUrl: item.imageUri,
              isOnline: item.isRegistered,
              lastSeenAt: now,
              joinedAt: now,
            },
          ],
          lastMessageId: null,
          lastMessageAt: null,
          lastMessagePreview: "",
          unreadCount: 0,
          isTyping: [],
          isPinned: false,
          isMuted: false,
          isArchived: false,
          archivedAt: null,
          createdAt: now,
          updatedAt: now,
        };

        await db.conversations.save(newConversation);
        navigation.navigate("ConversationDetail", {
          conversationId: newConversation.id,
        });
      }}
      onPress={() =>
        navigation.navigate("ContactDetail", { contactId: item.id })
      }
    />
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: Spacing.md,
            paddingBottom: insets.bottom + Spacing["5xl"],
          },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: theme.backgroundDefault },
              ]}
            >
              <Feather name="users" size={80} color={theme.textMuted} />
            </View>
            <ThemedText type="h3" style={styles.emptyTitle}>
              No Contacts Yet
            </ThemedText>
            <ThemedText type="body" secondary style={styles.emptyText}>
              {isLoading
                ? "Importing contacts..."
                : "Tap the download icon to import contacts"}
            </ThemedText>
          </View>
        }
      />

      <Pressable
        onPress={() => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          importContacts();
        }}
        style={[
          styles.fab,
          {
            backgroundColor: theme.accent,
            bottom: insets.bottom + Spacing["5xl"] + Spacing.lg,
            right: Spacing.lg,
          },
        ]}
      >
        <Feather name="download" size={24} color={theme.buttonText} />
      </Pressable>

      <View style={styles.bottomNavContainer}>
        <BottomNav onAiPress={() => setShowAISheet(true)} />
      </View>

      <AIAssistSheet
        visible={showAISheet}
        onClose={() => setShowAISheet(false)}
        module="contacts"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  contactCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadows.card,
  },
  contactContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  contactInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  contactActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  messageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  plusIconContainer: {
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingTop: Spacing["5xl"],
    paddingHorizontal: Spacing["2xl"],
  },
  emptyIcon: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: "center",
    justifyContent: "center",
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
