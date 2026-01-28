import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@aios/ui/components/ThemedText";
import { useTheme } from "@aios/ui/hooks/useTheme";
import { Spacing, BorderRadius } from "@aios/ui/constants/theme";
import { Integration } from "@aios/contracts/models/types";
import { db } from "@aios/platform/storage/database";

/**
 * IntegrationsScreen Component
 *
 * Displays a list of third-party service integrations.
 * Allows users to view, connect, and manage integrations.
 *
 * Features:
 * - Lists all integrations sorted by category
 * - Shows empty state when no integrations exist
 * - Handles error states with retry option
 * - Navigates to IntegrationDetail when an integration is selected
 */
export default function IntegrationsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      setError(null);
      const [integrationsData, stats] = await Promise.all([
        db.integrations.getAllSorted(),
        db.integrations.getStatistics(),
      ]);
      setIntegrations(integrationsData);
      // Stats are loaded but not currently displayed in the UI
      // They could be used for a header summary in the future
    } catch (err) {
      console.error("Error fetching integrations:", err);
      setError(err instanceof Error ? err : new Error("Failed to load integrations"));
    } finally {
      setLoading(false);
    }
  };

  // Reload integrations when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadIntegrations();
    }, []),
  );

  const handleIntegrationPress = (integration: Integration) => {
    navigation.navigate("IntegrationDetail" as never, {
      integrationId: integration.id,
    } as never);
  };

  const renderIntegrationCard = ({ item }: { item: Integration }) => {
    return (
      <Pressable
        testID={`integration-card-${item.id}`}
        onPress={() => handleIntegrationPress(item)}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: theme.backgroundDefault,
            borderColor: theme.border,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <View style={styles.cardContent}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.accentDim },
            ]}
          >
            <Feather
              name={item.iconName as keyof typeof Feather.glyphMap}
              size={24}
              color={theme.accent}
            />
          </View>
          <View style={styles.cardText}>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              {item.name}
            </ThemedText>
            <ThemedText type="caption" secondary>
              {item.description}
            </ThemedText>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      item.status === "connected"
                        ? theme.success + "33"
                        : theme.error + "33",
                  },
                ]}
              >
                <ThemedText
                  type="small"
                  style={{
                    color:
                      item.status === "connected" ? theme.success : theme.error,
                  }}
                >
                  {item.status}
                </ThemedText>
              </View>
            </View>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textMuted} />
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { paddingTop: insets.top, backgroundColor: theme.backgroundRoot },
        ]}
      >
        <ActivityIndicator size="large" color={theme.accent} />
        <ThemedText type="body" secondary style={{ marginTop: Spacing.md }}>
          Loading integrations...
        </ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { paddingTop: insets.top, backgroundColor: theme.backgroundRoot },
        ]}
      >
        <View testID="integrations-error" style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={theme.error} />
          <ThemedText type="h3" style={{ marginTop: Spacing.md }}>
            Failed to load integrations
          </ThemedText>
          <ThemedText type="body" secondary style={{ marginTop: Spacing.sm }}>
            {error.message}
          </ThemedText>
          <Pressable
            onPress={loadIntegrations}
            style={[
              styles.retryButton,
              { backgroundColor: theme.accent },
            ]}
          >
            <ThemedText
              type="body"
              style={{ color: theme.buttonText, fontWeight: "600" }}
            >
              Retry
            </ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  if (integrations.length === 0) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { paddingTop: insets.top, backgroundColor: theme.backgroundRoot },
        ]}
      >
        <Feather name="link" size={48} color={theme.textMuted} />
        <ThemedText type="h3" style={{ marginTop: Spacing.md }}>
          No integrations yet
        </ThemedText>
        <ThemedText type="body" secondary style={{ marginTop: Spacing.sm }}>
          Connect your favorite services to get started
        </ThemedText>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: theme.backgroundRoot },
      ]}
    >
      <FlatList
        data={integrations}
        renderItem={renderIntegrationCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  cardText: {
    flex: 1,
  },
  statusRow: {
    flexDirection: "row",
    marginTop: Spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  errorContainer: {
    alignItems: "center",
    maxWidth: 300,
  },
  retryButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
});
