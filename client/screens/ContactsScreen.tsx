/**
 * ContactsScreen Module
 *
 * Enhanced native contacts integration with advanced management features.
 * Features:
 * - Import from device contacts
 * - Alphabetical contact list with avatars
 * - Favorites system with quick filter
 * - Contact groups for organization
 * - Advanced search (name, email, phone, tags, notes)
 * - Filter by favorites, groups, or upcoming birthdays
 * - Quick actions for message, call, and favorite toggle
 * - Statistics display (total, favorites, upcoming birthdays)
 * - Birthday tracking and reminders
 * - Duplicate detection indicator
 * - Export/import functionality
 * - AI assistance for contact management
 * - Haptic feedback for interactions
 *
 * @module ContactsScreen
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  Platform,
  Alert,
  TextInput,
  ScrollView,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as Contacts from "expo-contacts";
import * as FileSystem from "expo-file-system";

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
import { isBirthdayInRange, matchesSearchQuery } from "@/utils/contactHelpers";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

type FilterType = "all" | "favorites" | "birthdays" | "recent";
type SortType = "name" | "recent" | "frequency";

/**
 * ContactCard Component
 *
 * Displays a single contact with avatar, name, quick actions, and status indicators.
 *
 * @param {Contact} contact - The contact data to display
 * @param {Function} onPress - Callback when card is pressed
 * @param {Function} onMessagePress - Callback for quick message action
 * @param {Function} onFavoriteToggle - Callback for favorite toggle
 * @param {number} index - Index in list (for animation delay)
 * @returns {JSX.Element} The contact card component
 */
function ContactCard({
  contact,
  onPress,
  onMessagePress,
  onFavoriteToggle,
  index,
}: {
  contact: Contact;
  onPress: () => void;
  onMessagePress: () => void;
  onFavoriteToggle: () => void;
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
          <View style={styles.avatarContainer}>
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
            {contact.isFavorite && (
              <View
                style={[
                  styles.favoriteBadge,
                  { backgroundColor: theme.warning },
                ]}
              >
                <Feather name="star" size={10} color={theme.buttonText} />
              </View>
            )}
          </View>

          <View style={styles.contactInfo}>
            <View style={styles.contactNameRow}>
              <ThemedText type="body" numberOfLines={1}>
                {contact.name}
              </ThemedText>
              {contact.tags && contact.tags.length > 0 && (
                <View style={styles.tagContainer}>
                  {contact.tags.slice(0, 2).map((tag, idx) => (
                    <View
                      key={idx}
                      style={[styles.tag, { backgroundColor: theme.accentDim }]}
                    >
                      <ThemedText
                        type="small"
                        style={{ color: theme.accent, fontSize: 10 }}
                      >
                        {tag}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              )}
            </View>
            <View style={styles.contactDetailsRow}>
              {contact.phoneNumbers.length > 0 && (
                <ThemedText type="small" muted numberOfLines={1}>
                  {contact.phoneNumbers[0]}
                </ThemedText>
              )}
              {contact.groups && contact.groups.length > 0 && (
                <View style={styles.groupBadge}>
                  <Feather name="users" size={10} color={theme.textMuted} />
                  <ThemedText type="small" muted style={{ fontSize: 10 }}>
                    {contact.groups[0]}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>

          <View style={styles.contactActions}>
            <Pressable
              onPress={(event) => {
                event.stopPropagation?.();
                onFavoriteToggle();
              }}
              style={({ pressed }) => [
                styles.actionButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Feather
                name={contact.isFavorite ? "star" : "star"}
                size={18}
                color={contact.isFavorite ? theme.warning : theme.textMuted}
                fill={contact.isFavorite ? theme.warning : "transparent"}
              />
            </Pressable>

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
              <Feather name="message-circle" size={14} color={theme.accent} />
            </Pressable>
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
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [showAISheet, setShowAISheet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortType, setSortType] = useState<SortType>("name");
  const [upcomingBirthdays, setUpcomingBirthdays] = useState(0);
  const [duplicatesCount, setDuplicatesCount] = useState(0);

  const loadContacts = useCallback(async () => {
    const data = await db.contacts.getAllSorted();
    setContacts(data);

    // Load upcoming birthdays count
    const birthdays = await db.contacts.getUpcomingBirthdays(30);
    setUpcomingBirthdays(birthdays.length);

    // Load duplicates count
    const duplicates = await db.contacts.findDuplicates();
    setDuplicatesCount(duplicates.length);
  }, []);

  // Filter and search contacts
  useEffect(() => {
    let result = contacts;

    // Apply filter
    if (filterType === "favorites") {
      result = result.filter((c) => c.isFavorite);
    } else if (filterType === "birthdays") {
      const today = new Date();
      const thirtyDaysLater = new Date(
        today.getTime() + 30 * 24 * 60 * 60 * 1000,
      );
      result = result.filter((c) => {
        if (!c.birthday) return false;
        return isBirthdayInRange(c.birthday, today, thirtyDaysLater);
      });
    } else if (filterType === "recent") {
      result = result
        .filter((c) => c.lastContactedAt)
        .sort(
          (a, b) =>
            new Date(b.lastContactedAt!).getTime() -
            new Date(a.lastContactedAt!).getTime(),
        );
    }

    // Apply search using helper function
    if (searchQuery.trim()) {
      result = result.filter((c) => matchesSearchQuery(c, searchQuery));
    }

    // Apply sort
    if (sortType === "name") {
      result = result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortType === "recent") {
      result = result.sort((a, b) => {
        const aTime = a.lastContactedAt
          ? new Date(a.lastContactedAt).getTime()
          : 0;
        const bTime = b.lastContactedAt
          ? new Date(b.lastContactedAt).getTime()
          : 0;
        return bTime - aTime;
      });
    } else if (sortType === "frequency") {
      result = result.sort(
        (a, b) => (b.contactFrequency || 0) - (a.contactFrequency || 0),
      );
    }

    setFilteredContacts(result);
  }, [contacts, filterType, searchQuery, sortType]);

  const handleFavoriteToggle = async (contactId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await db.contacts.toggleFavorite(contactId);
    await loadContacts();
  };

  const handleExport = async () => {
    try {
      const jsonData = await db.contacts.exportToJSON();
      const fileName = `contacts-export-${new Date().toISOString().split("T")[0]}.json`;

      if (Platform.OS === "web") {
        // For web, use download
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        // For native, save to file and share
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(fileUri, jsonData);

        await Share.share({
          title: "Contacts Export",
          message: "Exported contacts JSON.",
          url: fileUri,
        });
      }

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert("Error", "Failed to export contacts");
    }
  };

  const handleShare = async () => {
    try {
      const message = `I have ${contacts.length} contacts in my contact list.`;
      if (Platform.OS === "web") {
        await navigator.share({ text: message });
      } else {
        await Share.share({ message });
      }
    } catch (error) {
      // Share cancelled or failed
    }
  };

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
      headerRight: () => <HeaderRightNav settingsRoute="ContactsSettings" />,
    });
  }, [navigation, theme]);

  const renderContact = ({ item, index }: { item: Contact; index: number }) => (
    <ContactCard
      contact={item}
      index={index}
      onFavoriteToggle={() => handleFavoriteToggle(item.id)}
      onMessagePress={async () => {
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        // Record interaction
        await db.contacts.recordInteraction(item.id);

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
      {/* Statistics Banner */}
      {contacts.length > 0 && (
        <Animated.View
          entering={FadeInDown.delay(0).springify()}
          style={[
            styles.statsContainer,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <View style={styles.statItem}>
            <ThemedText type="h3" style={{ color: theme.accent }}>
              {contacts.length}
            </ThemedText>
            <ThemedText type="small" muted>
              Total
            </ThemedText>
          </View>

          <View
            style={[styles.statDivider, { backgroundColor: theme.textMuted }]}
          />

          <Pressable
            style={styles.statItem}
            onPress={() => setFilterType("favorites")}
          >
            <ThemedText type="h3" style={{ color: theme.warning }}>
              {contacts.filter((c) => c.isFavorite).length}
            </ThemedText>
            <ThemedText type="small" muted>
              Favorites
            </ThemedText>
          </Pressable>

          <View
            style={[styles.statDivider, { backgroundColor: theme.textMuted }]}
          />

          <Pressable
            style={styles.statItem}
            onPress={() => setFilterType("birthdays")}
          >
            <ThemedText type="h3" style={{ color: theme.success }}>
              {upcomingBirthdays}
            </ThemedText>
            <ThemedText type="small" muted>
              Birthdays
            </ThemedText>
          </Pressable>

          {duplicatesCount > 0 && (
            <>
              <View
                style={[
                  styles.statDivider,
                  { backgroundColor: theme.textMuted },
                ]}
              />
              <View style={styles.statItem}>
                <ThemedText type="h3" style={{ color: theme.error }}>
                  {duplicatesCount}
                </ThemedText>
                <ThemedText type="small" muted>
                  Duplicates
                </ThemedText>
              </View>
            </>
          )}
        </Animated.View>
      )}

      {/* Search Bar */}
      {contacts.length > 0 && (
        <Animated.View
          entering={FadeInDown.delay(50).springify()}
          style={[
            styles.searchContainer,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <Feather name="search" size={20} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search by name, email, phone, tags..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Feather name="x" size={20} color={theme.textMuted} />
            </Pressable>
          )}
        </Animated.View>
      )}

      {/* Filter Chips */}
      {contacts.length > 0 && (
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChips}
          >
            <Pressable
              onPress={() => setFilterType("all")}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    filterType === "all"
                      ? theme.accent
                      : theme.backgroundDefault,
                },
              ]}
            >
              <ThemedText
                type="small"
                style={{
                  color: filterType === "all" ? theme.buttonText : theme.text,
                  fontWeight: "600",
                }}
              >
                All
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={() => setFilterType("favorites")}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    filterType === "favorites"
                      ? theme.accent
                      : theme.backgroundDefault,
                },
              ]}
            >
              <Feather
                name="star"
                size={14}
                color={
                  filterType === "favorites" ? theme.buttonText : theme.text
                }
              />
              <ThemedText
                type="small"
                style={{
                  color:
                    filterType === "favorites" ? theme.buttonText : theme.text,
                  fontWeight: "600",
                }}
              >
                Favorites
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={() => setFilterType("birthdays")}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    filterType === "birthdays"
                      ? theme.accent
                      : theme.backgroundDefault,
                },
              ]}
            >
              <Feather
                name="gift"
                size={14}
                color={
                  filterType === "birthdays" ? theme.buttonText : theme.text
                }
              />
              <ThemedText
                type="small"
                style={{
                  color:
                    filterType === "birthdays" ? theme.buttonText : theme.text,
                  fontWeight: "600",
                }}
              >
                Birthdays
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={() => setFilterType("recent")}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    filterType === "recent"
                      ? theme.accent
                      : theme.backgroundDefault,
                },
              ]}
            >
              <Feather
                name="clock"
                size={14}
                color={filterType === "recent" ? theme.buttonText : theme.text}
              />
              <ThemedText
                type="small"
                style={{
                  color:
                    filterType === "recent" ? theme.buttonText : theme.text,
                  fontWeight: "600",
                }}
              >
                Recent
              </ThemedText>
            </Pressable>
          </ScrollView>
        </Animated.View>
      )}

      <FlatList
        data={filteredContacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: contacts.length > 0 ? Spacing.sm : Spacing.md,
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
              {searchQuery || filterType !== "all"
                ? "No Contacts Found"
                : "No Contacts Yet"}
            </ThemedText>
            <ThemedText type="body" secondary style={styles.emptyText}>
              {isLoading
                ? "Importing contacts..."
                : searchQuery || filterType !== "all"
                  ? "Try adjusting your search or filters"
                  : "Tap the download icon to import contacts"}
            </ThemedText>
          </View>
        }
      />

      {/* Action FABs */}
      <View
        style={[
          styles.fabContainer,
          { bottom: insets.bottom + Spacing["5xl"] + Spacing.lg },
        ]}
      >
        {contacts.length > 0 && (
          <>
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                handleExport();
              }}
              style={[
                styles.fab,
                styles.secondaryFab,
                { backgroundColor: theme.backgroundDefault },
              ]}
            >
              <Feather name="upload" size={20} color={theme.accent} />
            </Pressable>

            <Pressable
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                handleShare();
              }}
              style={[
                styles.fab,
                styles.secondaryFab,
                { backgroundColor: theme.backgroundDefault },
              ]}
            >
              <Feather name="share-2" size={20} color={theme.accent} />
            </Pressable>
          </>
        )}

        <Pressable
          onPress={() => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            importContacts();
          }}
          style={[
            styles.fab,
            styles.primaryFab,
            { backgroundColor: theme.accent },
          ]}
        >
          <Feather name="download" size={24} color={theme.buttonText} />
        </Pressable>
      </View>

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
  statsContainer: {
    flexDirection: "row",
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.card,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    marginHorizontal: Spacing.xs,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  filterChips: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
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
  avatarContainer: {
    position: "relative",
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
  favoriteBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  contactInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  contactNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  tagContainer: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  tag: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  contactDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  groupBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  contactActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  actionButton: {
    padding: Spacing.xs,
  },
  messageButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
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
  fabContainer: {
    position: "absolute",
    right: Spacing.lg,
    flexDirection: "row",
    gap: Spacing.sm,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.fab,
  },
  primaryFab: {
    width: 56,
    height: 56,
  },
  secondaryFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  bottomNavContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
});
