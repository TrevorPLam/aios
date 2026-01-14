import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Linking,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { db } from "@/storage/database";
import { Contact } from "@/models/types";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type ContactDetailRouteProp = RouteProp<AppStackParamList, "ContactDetail">;

export default function ContactDetailScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ContactDetailRouteProp>();

  const [contact, setContact] = useState<Contact | null>(null);

  const loadContact = useCallback(async () => {
    const data = await db.contacts.get(route.params.contactId);
    setContact(data);
  }, [route.params.contactId]);

  useEffect(() => {
    loadContact();
  }, [loadContact]);

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
            paddingTop: headerHeight + Spacing.md,
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
});
