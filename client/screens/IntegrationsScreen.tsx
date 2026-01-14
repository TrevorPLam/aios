/**
 * IntegrationsScreen Module
 *
 * Third-party service integration management.
 * Features:
 * - List all connected and available integrations
 * - Group by category (Calendar, Email, Cloud Storage, etc.)
 * - Connection status indicators
 * - Last sync information
 * - Quick enable/disable toggle
 * - Search and filter by category/status
 * - Integration statistics overview
 * - Navigate to detail screen for configuration
 *
 * @module IntegrationsScreen
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { db } from "@/storage/database";
import { Integration, IntegrationCategory } from "@/models/types";
import { formatRelativeDate } from "@/utils/helpers";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const CATEGORY_LABELS: Record<IntegrationCategory, string> = {
  calendar: "Calendar",
  email: "Email",
  cloud_storage: "Cloud Storage",
  task_management: "Task Management",
  communication: "Communication",
  ai_services: "AI Services",
  productivity: "Productivity",
  finance: "Finance",
};

const CATEGORY_ICONS: Record<IntegrationCategory, keyof typeof Feather.glyphMap> = {
  calendar: "calendar",
  email: "mail",
  cloud_storage: "cloud",
  task_management: "check-square",
  communication: "message-square",
  ai_services: "cpu",
  productivity: "briefcase",
  finance: "dollar-sign",
};

interface IntegrationCardProps {
  integration: Integration;
  onPress: () => void;
  index: number;
}

function IntegrationCard({
  integration,
  onPress,
  index,
}: IntegrationCardProps) {
  const { theme } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return theme.success;
      case "syncing":
        return theme.accent;
      case "disconnected":
        return theme.textMuted;
      case "error":
        return theme.error;
      default:
        return theme.textMuted;
    }
  };

  const getStatusIcon = (status: string): keyof typeof Feather.glyphMap => {
    switch (status) {
      case "connected":
        return "check-circle";
      case "syncing":
        return "loader";
      case "disconnected":
        return "x-circle";
      case "error":
        return "alert-circle";
      default:
        return "circle";
    }
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 30).springify()}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.integrationCard,
          { backgroundColor: theme.backgroundDefault },
          !integration.isEnabled && styles.disabledCard,
          pressed && { opacity: 0.8 },
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: integration.isEnabled
                ? theme.accentDim
                : theme.backgroundSecondary,
            },
          ]}
        >
          <Feather
            name={integration.iconName as any}
            size={24}
            color={integration.isEnabled ? theme.accent : theme.textMuted}
          />
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <ThemedText
              type="body"
              style={[
                { fontWeight: "600" },
                !integration.isEnabled && { opacity: 0.5 },
              ]}
            >
              {integration.name}
            </ThemedText>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${getStatusColor(integration.status)}20` },
              ]}
            >
              <Feather
                name={getStatusIcon(integration.status)}
                size={12}
                color={getStatusColor(integration.status)}
              />
            </View>
          </View>

          <ThemedText
            type="small"
            muted
            numberOfLines={1}
            style={!integration.isEnabled && { opacity: 0.5 }}
          >
            {integration.description}
          </ThemedText>

          <View style={styles.cardFooter}>
            {integration.lastSyncAt && integration.isEnabled && (
              <View style={styles.syncInfo}>
                <Feather name="clock" size={12} color={theme.textMuted} />
                <ThemedText type="small" muted>
                  {formatRelativeDate(integration.lastSyncAt)}
                </ThemedText>
              </View>
            )}

            {integration.stats.totalSyncs > 0 && (
              <View style={styles.syncInfo}>
                <Feather name="activity" size={12} color={theme.textMuted} />
                <ThemedText type="small" muted>
                  {integration.stats.totalSyncs} syncs
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        <Feather name="chevron-right" size={20} color={theme.textMuted} />
      </Pressable>
    </Animated.View>
  );
}

export default function IntegrationsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    IntegrationCategory | "all"
  >("all");

  const loadIntegrations = useCallback(async () => {
    const data = await db.integrations.getAllSorted();
    setIntegrations(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadIntegrations();
    }, [loadIntegrations]),
  );

  const handleIntegrationPress = (integrationId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("IntegrationDetail", { integrationId });
  };

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesSearch =
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || integration.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const groupedIntegrations = filteredIntegrations.reduce(
    (acc, integration) => {
      if (!acc[integration.category]) {
        acc[integration.category] = [];
      }
      acc[integration.category].push(integration);
      return acc;
    },
    {} as Record<IntegrationCategory, Integration[]>,
  );

  const categories = Object.keys(
    groupedIntegrations,
  ) as IntegrationCategory[];

  // Calculate statistics
  const connectedCount = integrations.filter(
    (i) => i.status === "connected" && i.isEnabled,
  ).length;
  const totalSyncs = integrations.reduce(
    (sum, i) => sum + i.stats.totalSyncs,
    0,
  );

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
        {/* Statistics Overview */}
        <Animated.View
          entering={FadeInDown.delay(0).springify()}
          style={[
            styles.statsContainer,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <View style={styles.statItem}>
            <ThemedText type="h2" style={{ color: theme.accent }}>
              {connectedCount}
            </ThemedText>
            <ThemedText type="small" muted>
              Connected
            </ThemedText>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <ThemedText type="h2" style={{ color: theme.accent }}>
              {integrations.length}
            </ThemedText>
            <ThemedText type="small" muted>
              Total
            </ThemedText>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <ThemedText type="h2" style={{ color: theme.accent }}>
              {totalSyncs}
            </ThemedText>
            <ThemedText type="small" muted>
              Syncs
            </ThemedText>
          </View>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View entering={FadeInDown.delay(50).springify()}>
          <View
            style={[
              styles.searchContainer,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <Feather name="search" size={20} color={theme.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search integrations..."
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")}>
                <Feather name="x" size={20} color={theme.textMuted} />
              </Pressable>
            )}
          </View>
        </Animated.View>

        {/* Category Filter */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryFilter}
          >
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setSelectedCategory("all");
              }}
              style={({ pressed }) => [
                styles.categoryChip,
                {
                  backgroundColor:
                    selectedCategory === "all"
                      ? theme.accent
                      : theme.backgroundDefault,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Feather
                name="grid"
                size={16}
                color={
                  selectedCategory === "all" ? theme.buttonText : theme.text
                }
              />
              <ThemedText
                type="small"
                style={{
                  color:
                    selectedCategory === "all" ? theme.buttonText : theme.text,
                  fontWeight: "600",
                }}
              >
                All
              </ThemedText>
            </Pressable>

            {(
              Object.keys(CATEGORY_LABELS) as IntegrationCategory[]
            ).map((category) => (
              <Pressable
                key={category}
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setSelectedCategory(category);
                }}
                style={({ pressed }) => [
                  styles.categoryChip,
                  {
                    backgroundColor:
                      selectedCategory === category
                        ? theme.accent
                        : theme.backgroundDefault,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Feather
                  name={CATEGORY_ICONS[category]}
                  size={16}
                  color={
                    selectedCategory === category
                      ? theme.buttonText
                      : theme.text
                  }
                />
                <ThemedText
                  type="small"
                  style={{
                    color:
                      selectedCategory === category
                        ? theme.buttonText
                        : theme.text,
                    fontWeight: "600",
                  }}
                >
                  {CATEGORY_LABELS[category]}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Integrations List */}
        {filteredIntegrations.length === 0 ? (
          <View style={styles.emptyState}>
            <View
              style={[
                styles.emptyIconContainer,
                { backgroundColor: theme.accentDim },
              ]}
            >
              <Feather name="package" size={40} color={theme.accent} />
            </View>
            <ThemedText type="h3" style={styles.emptyTitle}>
              {searchQuery
                ? "No integrations found"
                : "No integrations yet"}
            </ThemedText>
            <ThemedText type="body" secondary style={styles.emptyDescription}>
              {searchQuery
                ? "Try adjusting your search or filters"
                : "Connect external services to get started"}
            </ThemedText>
          </View>
        ) : (
          <>
            {categories.map((category, catIndex) => (
              <Animated.View
                key={category}
                entering={FadeInDown.delay(150 + catIndex * 50).springify()}
              >
                <View style={styles.categorySection}>
                  <View style={styles.categoryHeader}>
                    <Feather
                      name={CATEGORY_ICONS[category]}
                      size={20}
                      color={theme.accent}
                    />
                    <ThemedText type="h3">
                      {CATEGORY_LABELS[category]}
                    </ThemedText>
                  </View>

                  {groupedIntegrations[category].map(
                    (integration, intIndex) => (
                      <IntegrationCard
                        key={integration.id}
                        integration={integration}
                        onPress={() => handleIntegrationPress(integration.id)}
                        index={intIndex}
                      />
                    ),
                  )}
                </View>
              </Animated.View>
            ))}
          </>
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
    gap: Spacing.lg,
  },
  statsContainer: {
    flexDirection: "row",
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
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  categoryFilter: {
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  categorySection: {
    gap: Spacing.md,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  integrationCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  disabledCard: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  syncInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["5xl"],
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    textAlign: "center",
    maxWidth: 300,
  },
});
