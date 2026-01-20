import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Linking,
  Platform,
  TextInput,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { db } from "@/storage/database";
import { Contact } from "@/models/types";

type ContactDetailRouteProp = RouteProp<AppStackParamList, "ContactDetail">;

export default function ContactDetailScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const route = useRoute<ContactDetailRouteProp>();
  const navigation = useNavigation();

  const [contact, setContact] = useState<Contact | null>(null);
  const [newTag, setNewTag] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [newNote, setNewNote] = useState("");

  const loadContact = useCallback(async () => {
    const data = await db.contacts.get(route.params.contactId);
    setContact(data);
  }, [route.params.contactId]);

  useEffect(() => {
    loadContact();
  }, [loadContact]);

  const handleToggleFavorite = useCallback(async () => {
    if (!contact) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await db.contacts.toggleFavorite(contact.id);
    await loadContact();
  }, [contact, loadContact]);

  const handleAddTag = useCallback(async () => {
    if (!contact || !newTag.trim()) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await db.contacts.addTag(contact.id, newTag.trim());
    setNewTag("");
    await loadContact();
  }, [contact, newTag, loadContact]);

  const handleRemoveTag = useCallback(
    async (tag: string) => {
      if (!contact) return;
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      await db.contacts.removeTag(contact.id, tag);
      await loadContact();
    },
    [contact, loadContact],
  );

  const handleAddGroup = useCallback(async () => {
    if (!contact || !newGroup.trim()) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await db.contacts.addToGroup(contact.id, newGroup.trim());
    setNewGroup("");
    await loadContact();
  }, [contact, newGroup, loadContact]);

  const handleRemoveGroup = useCallback(
    async (group: string) => {
      if (!contact) return;
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      await db.contacts.removeFromGroup(contact.id, group);
      await loadContact();
    },
    [contact, loadContact],
  );

  const handleAddNote = useCallback(async () => {
    if (!contact || !newNote.trim()) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await db.contacts.addNote(contact.id, newNote.trim());
    setNewNote("");
    await loadContact();
  }, [contact, newNote, loadContact]);

  const handleDeleteNote = useCallback(
    async (noteId: string) => {
      if (!contact) return;
      Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            await db.contacts.deleteNote(contact.id, noteId);
            await loadContact();
          },
        },
      ]);
    },
    [contact, loadContact],
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        contact ? (
          <Pressable
            onPress={handleToggleFavorite}
            style={({ pressed }) => [
              styles.headerButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Feather
              name="star"
              size={22}
              color={contact.isFavorite ? theme.accent : theme.textSecondary}
              style={
                contact.isFavorite && {
                  shadowColor: theme.accent,
                  shadowOpacity: 0.5,
                  shadowRadius: 2,
                }
              }
            />
          </Pressable>
        ) : null,
    });
  }, [navigation, contact, handleToggleFavorite, theme]);

  if (!contact) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  const handleCall = (phoneNumber: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (email: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Linking.openURL(`mailto:${email}`);
  };

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
        <View style={styles.header}>
          {contact.imageUri ? (
            <Image source={{ uri: contact.imageUri }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: theme.accentDim },
              ]}
            >
              <ThemedText type="hero" style={{ color: theme.accent }}>
                {contact.name.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
          )}
          <ThemedText type="h1" style={styles.name}>
            {contact.name}
          </ThemedText>
          {!contact.isRegistered && (
            <View style={styles.badge}>
              <Feather
                name="plus-circle"
                size={16}
                color={theme.accent}
                style={{ marginRight: Spacing.xs }}
              />
              <ThemedText type="small" style={{ color: theme.accent }}>
                Not on AIOS
              </ThemedText>
            </View>
          )}
        </View>

        {contact.phoneNumbers.length > 0 && (
          <View
            style={[
              styles.section,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Feather name="phone" size={20} color={theme.textSecondary} />
              <ThemedText type="body" secondary style={styles.sectionTitle}>
                Phone
              </ThemedText>
            </View>
            {contact.phoneNumbers.map((phone, index) => (
              <Pressable
                key={index}
                onPress={() => handleCall(phone)}
                style={({ pressed }) => [
                  styles.detailRow,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <ThemedText type="body">{phone}</ThemedText>
                <Feather name="phone-call" size={18} color={theme.accent} />
              </Pressable>
            ))}
          </View>
        )}

        {contact.emails.length > 0 && (
          <View
            style={[
              styles.section,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Feather name="mail" size={20} color={theme.textSecondary} />
              <ThemedText type="body" secondary style={styles.sectionTitle}>
                Email
              </ThemedText>
            </View>
            {contact.emails.map((email, index) => (
              <Pressable
                key={index}
                onPress={() => handleEmail(email)}
                style={({ pressed }) => [
                  styles.detailRow,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <ThemedText type="body" numberOfLines={1}>
                  {email}
                </ThemedText>
                <Feather name="send" size={18} color={theme.accent} />
              </Pressable>
            ))}
          </View>
        )}

        {contact.birthday && (
          <View
            style={[
              styles.section,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Feather name="gift" size={20} color={theme.textSecondary} />
              <ThemedText type="body" secondary style={styles.sectionTitle}>
                Birthday
              </ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText type="body">
                {new Date(contact.birthday).toLocaleDateString()}
              </ThemedText>
            </View>
          </View>
        )}

        {(contact.company || contact.jobTitle) && (
          <View
            style={[
              styles.section,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Feather name="briefcase" size={20} color={theme.textSecondary} />
              <ThemedText type="body" secondary style={styles.sectionTitle}>
                Business
              </ThemedText>
            </View>
            {contact.jobTitle && (
              <View style={styles.detailRow}>
                <ThemedText type="caption" secondary>
                  Title
                </ThemedText>
                <ThemedText type="body">{contact.jobTitle}</ThemedText>
              </View>
            )}
            {contact.company && (
              <View style={styles.detailRow}>
                <ThemedText type="caption" secondary>
                  Company
                </ThemedText>
                <ThemedText type="body">{contact.company}</ThemedText>
              </View>
            )}
          </View>
        )}

        {/* Tags Section */}
        <View
          style={[styles.section, { backgroundColor: theme.backgroundDefault }]}
        >
          <View style={styles.sectionHeader}>
            <Feather name="tag" size={20} color={theme.textSecondary} />
            <ThemedText type="body" secondary style={styles.sectionTitle}>
              Tags
            </ThemedText>
          </View>
          {contact.tags && contact.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {contact.tags.map((tag, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleRemoveTag(tag)}
                  style={[styles.tag, { backgroundColor: theme.accentDim }]}
                >
                  <ThemedText
                    type="small"
                    style={{ color: theme.accent, marginRight: Spacing.xs }}
                  >
                    {tag}
                  </ThemedText>
                  <Feather name="x" size={12} color={theme.accent} />
                </Pressable>
              ))}
            </View>
          )}
          <View style={styles.inputRow}>
            <TextInput
              value={newTag}
              onChangeText={setNewTag}
              placeholder="Add tag..."
              placeholderTextColor={theme.textMuted}
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.border,
                },
              ]}
              returnKeyType="done"
              onSubmitEditing={handleAddTag}
            />
            <Pressable
              onPress={handleAddTag}
              disabled={!newTag.trim()}
              style={({ pressed }) => [
                styles.addButton,
                { backgroundColor: theme.accent },
                pressed && { opacity: 0.7 },
                !newTag.trim() && { opacity: 0.5 },
              ]}
            >
              <Feather name="plus" size={18} color={theme.buttonText} />
            </Pressable>
          </View>
        </View>

        {/* Groups Section */}
        <View
          style={[styles.section, { backgroundColor: theme.backgroundDefault }]}
        >
          <View style={styles.sectionHeader}>
            <Feather name="users" size={20} color={theme.textSecondary} />
            <ThemedText type="body" secondary style={styles.sectionTitle}>
              Groups
            </ThemedText>
          </View>
          {contact.groups && contact.groups.length > 0 && (
            <View style={styles.tagsContainer}>
              {contact.groups.map((group, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleRemoveGroup(group)}
                  style={[styles.tag, { backgroundColor: theme.accentDim }]}
                >
                  <ThemedText
                    type="small"
                    style={{ color: theme.accent, marginRight: Spacing.xs }}
                  >
                    {group}
                  </ThemedText>
                  <Feather name="x" size={12} color={theme.accent} />
                </Pressable>
              ))}
            </View>
          )}
          <View style={styles.inputRow}>
            <TextInput
              value={newGroup}
              onChangeText={setNewGroup}
              placeholder="Add group..."
              placeholderTextColor={theme.textMuted}
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.border,
                },
              ]}
              returnKeyType="done"
              onSubmitEditing={handleAddGroup}
            />
            <Pressable
              onPress={handleAddGroup}
              disabled={!newGroup.trim()}
              style={({ pressed }) => [
                styles.addButton,
                { backgroundColor: theme.accent },
                pressed && { opacity: 0.7 },
                !newGroup.trim() && { opacity: 0.5 },
              ]}
            >
              <Feather name="plus" size={18} color={theme.buttonText} />
            </Pressable>
          </View>
        </View>

        {/* Notes Section */}
        <View
          style={[styles.section, { backgroundColor: theme.backgroundDefault }]}
        >
          <View style={styles.sectionHeader}>
            <Feather name="file-text" size={20} color={theme.textSecondary} />
            <ThemedText type="body" secondary style={styles.sectionTitle}>
              Notes
            </ThemedText>
          </View>
          {contact.notes && contact.notes.length > 0 && (
            <View style={styles.notesContainer}>
              {contact.notes.map((note) => (
                <View
                  key={note.id}
                  style={[
                    styles.noteCard,
                    { backgroundColor: theme.backgroundSecondary },
                  ]}
                >
                  <View style={styles.noteHeader}>
                    <ThemedText type="caption" secondary>
                      {new Date(note.createdAt).toLocaleDateString()} at{" "}
                      {new Date(note.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </ThemedText>
                    <Pressable onPress={() => handleDeleteNote(note.id)}>
                      <Feather name="trash-2" size={14} color={theme.error} />
                    </Pressable>
                  </View>
                  <ThemedText type="body" style={{ marginTop: Spacing.xs }}>
                    {note.text}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}
          <View style={styles.inputColumn}>
            <TextInput
              value={newNote}
              onChangeText={setNewNote}
              placeholder="Add note..."
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={3}
              style={[
                styles.textArea,
                {
                  color: theme.text,
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.border,
                },
              ]}
            />
            <Pressable
              onPress={handleAddNote}
              disabled={!newNote.trim()}
              style={({ pressed }) => [
                styles.addButtonFull,
                { backgroundColor: theme.accent },
                pressed && { opacity: 0.7 },
                !newNote.trim() && { opacity: 0.5 },
              ]}
            >
              <Feather
                name="plus"
                size={18}
                color={theme.buttonText}
                style={{ marginRight: Spacing.xs }}
              />
              <ThemedText
                type="body"
                style={{ color: theme.buttonText, fontWeight: "600" }}
              >
                Add Note
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Statistics Section */}
        {(contact.lastContactedAt || contact.contactFrequency) && (
          <View
            style={[
              styles.section,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Feather name="activity" size={20} color={theme.textSecondary} />
              <ThemedText type="body" secondary style={styles.sectionTitle}>
                Statistics
              </ThemedText>
            </View>
            {contact.lastContactedAt && (
              <View style={styles.detailRow}>
                <ThemedText type="caption" secondary>
                  Last Contacted
                </ThemedText>
                <ThemedText type="body">
                  {new Date(contact.lastContactedAt).toLocaleDateString()}
                </ThemedText>
              </View>
            )}
            {contact.contactFrequency !== undefined && (
              <View style={styles.detailRow}>
                <ThemedText type="caption" secondary>
                  Contact Frequency
                </ThemedText>
                <ThemedText type="body">
                  {contact.contactFrequency} interaction
                  {contact.contactFrequency !== 1 ? "s" : ""}
                </ThemedText>
              </View>
            )}
          </View>
        )}
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
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: Spacing.md,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  name: {
    marginBottom: Spacing.sm,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  section: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    marginLeft: Spacing.sm,
    textTransform: "uppercase",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
  },
  headerButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    fontSize: 16,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  inputColumn: {
    gap: Spacing.sm,
  },
  textArea: {
    minHeight: 80,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    fontSize: 16,
    textAlignVertical: "top",
  },
  addButtonFull: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  notesContainer: {
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  noteCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
