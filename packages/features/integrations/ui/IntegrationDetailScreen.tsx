import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@design-system/components/ThemedText";
import { useTheme } from "@design-system/hooks/useTheme";
import { Spacing, BorderRadius } from "@design-system/constants/theme";
import { Integration } from "@contracts/models/types";
import { db } from "@platform/storage/database";

type IntegrationDetailRouteParams = {
  IntegrationDetail: {
    integrationId: string;
  };
};

type IntegrationDetailRouteProp = RouteProp<
  IntegrationDetailRouteParams,
  "IntegrationDetail"
>;

/**
 * IntegrationDetailScreen Component
 *
 * Displays detailed information about a specific integration.
 * Shows configuration options, sync status, and statistics.
 */
export default function IntegrationDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<IntegrationDetailRouteProp>();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { integrationId } = route.params;
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadIntegration = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await db.integrations.getById(integrationId);
        if (!data) {
          setError(new Error("Integration not found"));
        } else {
          setIntegration(data);
        }
      } catch (err) {
        console.error("Error fetching integration:", err);
        setError(err instanceof Error ? err : new Error("Failed to load integration"));
      } finally {
        setLoading(false);
      }
    };

    loadIntegration();
  }, [integrationId]);

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { paddingTop: insets.top, backgroundColor: theme.backgroundRoot },
        ]}
      >
        <ThemedText type="body" secondary>
          Loading integration details...
        </ThemedText>
      </View>
    );
  }

  if (error || !integration) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { paddingTop: insets.top, backgroundColor: theme.backgroundRoot },
        ]}
      >
        <Feather name="alert-circle" size={48} color={theme.error} />
        <ThemedText type="h3" style={{ marginTop: Spacing.md }}>
          {error?.message || "Integration not found"}
        </ThemedText>
        <Pressable
          onPress={() => navigation.goBack()}
          style={[
            styles.backButton,
            { backgroundColor: theme.accent },
            { marginTop: Spacing.lg },
          ]}
        >
          <ThemedText
            type="body"
            style={{ color: theme.buttonText, fontWeight: "600" }}
          >
            Go Back
          </ThemedText>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: theme.backgroundRoot },
      ]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h2">{integration.name}</ThemedText>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        ]}
      >
        <View style={styles.cardSection}>
          <ThemedText type="body" secondary>
            Service
          </ThemedText>
          <ThemedText type="body">{integration.serviceName}</ThemedText>
        </View>

        <View style={styles.cardSection}>
          <ThemedText type="body" secondary>
            Status
          </ThemedText>
          <ThemedText type="body">{integration.status}</ThemedText>
        </View>

        <View style={styles.cardSection}>
          <ThemedText type="body" secondary>
            Description
          </ThemedText>
          <ThemedText type="body">{integration.description}</ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  content: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  backButton: {
    marginRight: Spacing.md,
    padding: Spacing.xs,
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  cardSection: {
    marginBottom: Spacing.md,
  },
});
