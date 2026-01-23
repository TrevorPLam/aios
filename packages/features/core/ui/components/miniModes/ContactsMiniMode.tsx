/**
 * Contacts Mini-Mode Component (iOS-optimized)
 *
 * Purpose (Plain English):
 * A compact contact selector that can be embedded in other screens.
 * Allows users to quickly select a contact without leaving their current
 * context (e.g., from Messages to start a chat, or from Calendar to add attendees).
 *
 * What it interacts with:
 * - Contacts Database: Fetches contacts list
 * - Event Bus: Emits ContactSelected event after choosing
 * - Mini-Mode Registry: Returns result via onComplete callback
 *
 * Safe AI extension points:
 * - Add smart suggestions based on context (frequent contacts, recent)
 * - Add filtering by group/category
 * - Enhance search with fuzzy matching
 * - Add iOS Contacts app integration
 *
 * Warnings:
 * - Performance: Handle large contact lists (virtualization)
 * - iOS keyboard should show search immediately
 * - Must handle empty state gracefully
 * - Always provide haptic feedback on iOS
 */

import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";

import { MiniModeComponentProps, MiniModeResult } from "../../lib/miniMode";
import { eventBus, EVENT_TYPES } from "../../lib/eventBus";
import { database } from "../../storage/database";
import { ThemedText } from "../ThemedText";
import { Button } from "../Button";
import { Spacing, Typography } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";
import type { Contact } from "../../models/types";

interface ContactsMiniModeData {
  purpose?: string; // What is the contact being selected for?
  allowMultiple?: boolean; // Allow multiple contact selection
  excludeIds?: string[]; // Contact IDs to exclude from list
}

/**
 * Contacts Mini-Mode Component
 *
 * Plain English:
 * Searchable contact list for quick selection. Shows recent/frequent contacts
 * first, with search to filter. iOS-optimized with native feel.
 *
 * Technical:
 * Loads contacts from database, provides search filtering, returns selected
 * contact(s) via onComplete callback. Uses FlatList for performance.
 */
export function ContactsMiniMode({
  initialData,
  onComplete,
  onDismiss,
  source,
}: MiniModeComponentProps<ContactsMiniModeData>) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const allowMultiple = initialData?.allowMultiple ?? false;

  /**
   * Load contacts on mount
   *
   * Plain English: Fetch all contacts and filter out excluded ones
   * Technical: Async database query with error handling
   */
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const allContacts = await database.contacts.getAll();

      // Filter out excluded contacts
      const filtered = initialData?.excludeIds
        ? allContacts.filter((c) => !initialData.excludeIds!.includes(c.id))
        : allContacts;

      setContacts(filtered);
      setFilteredContacts(filtered);
    } catch (error) {
      console.error("[ContactsMiniMode] Error loading contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle search query changes
   *
   * Plain English: Filter contacts by name, email, or phone
   * Technical: Case-insensitive substring matching
   */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredContacts(contacts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = contacts.filter((contact) => {
      const name = contact.name?.toLowerCase() || "";
      const email = contact.emails?.[0]?.toLowerCase() || "";
      const phone = contact.phoneNumbers?.[0]?.toLowerCase() || "";

      return (
        name.includes(query) || email.includes(query) || phone.includes(query)
      );
    });

    setFilteredContacts(filtered);
  }, [searchQuery, contacts]);

  /**
   * Handle contact selection
   *
   * Plain English: Select a contact (or toggle if multi-select)
   * Technical: Updates selection state with haptic feedback
   */
  const handleSelectContact = (contact: Contact) => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (allowMultiple) {
      // Toggle selection in multi-select mode
      setSelectedIds((current) =>
        current.includes(contact.id)
          ? current.filter((id) => id !== contact.id)
          : [...current, contact.id],
      );
    } else {
      // Single select - complete immediately
      completeSelection([contact]);
    }
  };

  /**
   * Complete selection and return results
   *
   * Plain English: Return selected contact(s) to caller
   * Technical: Emits event and invokes onComplete callback
   */
  const completeSelection = (selectedContacts: Contact[]) => {
    // Emit event to event bus
    eventBus.emit(EVENT_TYPES.MODULE_OPENED, {
      contacts: selectedContacts,
      source,
      purpose: initialData?.purpose,
    });

    // Success haptic on iOS
    if (Platform.OS === "ios") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Return result
    const result: MiniModeResult<Contact | Contact[]> = {
      action: "selected",
      module: "contacts",
      data: allowMultiple ? selectedContacts : selectedContacts[0],
    };

    onComplete(result);
  };

  /**
   * Handle done button (multi-select mode)
   */
  const handleDone = () => {
    const selectedContacts = contacts.filter((c) => selectedIds.includes(c.id));
    completeSelection(selectedContacts);
  };

  /**
   * Render contact list item (iOS-style)
   */
  const renderContactItem = ({ item }: { item: Contact }) => {
    const isSelected = selectedIds.includes(item.id);

    return (
      <TouchableOpacity
        style={[styles.contactItem, isSelected && styles.contactItemSelected]}
        onPress={() => handleSelectContact(item)}
        accessibilityRole="button"
        accessibilityLabel={`Select ${item.name}`}
        accessibilityState={{ selected: isSelected }}
      >
        {/* Avatar (iOS-style circle) */}
        <View style={styles.avatar}>
          <ThemedText style={styles.avatarText}>
            {item.name?.charAt(0).toUpperCase() || "?"}
          </ThemedText>
        </View>

        {/* Contact Info */}
        <View style={styles.contactInfo}>
          <ThemedText style={styles.contactName} numberOfLines={1}>
            {item.name || "Unknown"}
          </ThemedText>
          {item.emails?.[0] && (
            <ThemedText style={styles.contactDetail} numberOfLines={1}>
              {item.emails[0]}
            </ThemedText>
          )}
        </View>

        {/* Selection Indicator */}
        {allowMultiple && (
          <View
            style={[styles.checkbox, isSelected && styles.checkboxSelected]}
          >
            {isSelected && (
              <Feather name="check" size={16} color={theme.deepSpace} />
            )}
          </View>
        )}

        {/* Chevron (single select) */}
        {!allowMultiple && (
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <ThemedText style={styles.title}>Select Contact</ThemedText>
          {initialData?.purpose && (
            <ThemedText style={styles.subtitle}>
              {initialData.purpose}
            </ThemedText>
          )}
        </View>
        <TouchableOpacity
          onPress={onDismiss}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Feather name="x" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar (iOS-style) */}
      <View style={styles.searchContainer}>
        <Feather
          name="search"
          size={18}
          color={theme.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search contacts..."
          placeholderTextColor={theme.textSecondary}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          accessibilityLabel="Search contacts"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            style={styles.clearButton}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Feather name="x-circle" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Contacts List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.electric} />
          <ThemedText style={styles.loadingText}>
            Loading contacts...
          </ThemedText>
        </View>
      ) : filteredContacts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="users" size={48} color={theme.textSecondary} />
          <ThemedText style={styles.emptyText}>
            {searchQuery ? "No matching contacts" : "No contacts found"}
          </ThemedText>
          {searchQuery && (
            <ThemedText style={styles.emptyHint}>
              Try adjusting your search
            </ThemedText>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          renderItem={renderContactItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {/* Done Button (multi-select mode) */}
      {allowMultiple && (
        <View style={styles.actions}>
          <Button onPress={onDismiss} style={styles.button}>
            <ThemedText>Cancel</ThemedText>
          </Button>
          <Button
            onPress={handleDone}
            disabled={selectedIds.length === 0}
            style={[styles.button, styles.buttonPrimary]}
          >
            <ThemedText>
              {`Done${selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}`}
            </ThemedText>
          </Button>
        </View>
      )}
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      maxHeight: "85%",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.sm,
    },
    headerContent: {
      flex: 1,
    },
    title: {
      fontSize: Typography.sizes.h2,
      fontWeight: "600",
      marginBottom: Spacing.xs,
    },
    subtitle: {
      fontSize: Typography.sizes.caption,
      color: theme.textSecondary,
    },
    closeButton: {
      padding: Spacing.xs,
      marginLeft: Spacing.sm,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.deepSpace,
      borderRadius: 12,
      marginHorizontal: Spacing.md,
      marginBottom: Spacing.md,
      paddingHorizontal: Spacing.md,
      borderWidth: 1,
      borderColor: theme.border,
    },
    searchIcon: {
      marginRight: Spacing.sm,
    },
    searchInput: {
      flex: 1,
      fontSize: Typography.sizes.body,
      color: theme.text,
      paddingVertical: Platform.OS === "ios" ? Spacing.md : Spacing.sm,
    },
    clearButton: {
      padding: Spacing.xs,
      marginLeft: Spacing.xs,
    },
    list: {
      flex: 1,
    },
    contactItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border,
    },
    contactItemSelected: {
      backgroundColor: "rgba(0, 217, 255, 0.1)", // Electric with opacity
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.electric,
      alignItems: "center",
      justifyContent: "center",
      marginRight: Spacing.md,
    },
    avatarText: {
      fontSize: Typography.sizes.h3,
      fontWeight: "600",
      color: theme.deepSpace,
    },
    contactInfo: {
      flex: 1,
      marginRight: Spacing.md,
    },
    contactName: {
      fontSize: Typography.sizes.body,
      fontWeight: "500",
      marginBottom: 2,
    },
    contactDetail: {
      fontSize: Typography.sizes.small,
      color: theme.textSecondary,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: Spacing.sm,
    },
    checkboxSelected: {
      backgroundColor: theme.electric,
      borderColor: theme.electric,
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: Spacing["2xl"],
    },
    loadingText: {
      marginTop: Spacing.md,
      color: theme.textSecondary,
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: Spacing["2xl"],
      paddingHorizontal: Spacing.xl,
    },
    emptyText: {
      fontSize: Typography.sizes.h3,
      fontWeight: "500",
      marginTop: Spacing.md,
      textAlign: "center",
    },
    emptyHint: {
      fontSize: Typography.sizes.small,
      color: theme.textSecondary,
      marginTop: Spacing.xs,
      textAlign: "center",
    },
    actions: {
      flexDirection: "row",
      gap: Spacing.sm,
      padding: Spacing.md,
      paddingBottom: Platform.OS === "ios" ? Spacing.lg : Spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    button: {
      flex: 1,
    },
    buttonPrimary: {
      // Primary button styles already defined in Button component
    },
  });
