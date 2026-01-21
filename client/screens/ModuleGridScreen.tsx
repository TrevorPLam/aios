import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { db } from "@/storage/database";
import {
  ModuleType,
  Settings,
  ModuleViewMode,
  ModuleArrangement,
} from "@/models/types";
import {
  getNavigationErrorMessage,
  validateRouteRegistration,
} from "@/utils/navigationValidation";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

// Delay to allow modal close animation to complete before navigation
const MODAL_CLOSE_DELAY_MS = 100;

/**
 * ModuleItem interface represents a navigable module in the app.
 *
 * Note: Command Center, Settings, and Integrations are intentionally
 * excluded from this list as they have dedicated access points:
 * - Command Center: Accessible via home button in header
 * - Settings: Accessible via settings button in header
 * - Integrations: Accessible via Settings menu
 */
interface ModuleItem {
  id: ModuleType;
  name: string;
  icon: keyof typeof Feather.glyphMap;
  route: keyof AppStackParamList;
  description: string;
}

const ALL_MODULES: ModuleItem[] = [
  {
    id: "notebook",
    name: "Notebook",
    icon: "book-open",
    route: "Notebook",
    description: "Notes & docs",
  },
  {
    id: "planner",
    name: "Planner",
    icon: "check-square",
    route: "Planner",
    description: "Tasks & projects",
  },
  {
    id: "calendar",
    name: "Calendar",
    icon: "calendar",
    route: "Calendar",
    description: "Events & schedule",
  },
  {
    id: "email",
    name: "Email",
    icon: "mail",
    route: "Email",
    description: "Email threads",
  },
  {
    id: "messages",
    name: "Messages",
    icon: "message-square",
    route: "Messages",
    description: "P2P messaging",
  },
  {
    id: "lists",
    name: "Lists",
    icon: "list",
    route: "Lists",
    description: "Checklists",
  },
  {
    id: "alerts",
    name: "Alerts",
    icon: "bell",
    route: "Alerts",
    description: "Alarms & Reminders",
  },
  {
    id: "photos",
    name: "Photos",
    icon: "image",
    route: "Photos",
    description: "Photo gallery",
  },
  {
    id: "contacts",
    name: "Contacts",
    icon: "users",
    route: "Contacts",
    description: "Manage contacts",
  },
  {
    id: "translator",
    name: "Translator",
    icon: "globe",
    route: "Translator",
    description: "Language translation",
  },
  {
    id: "budget",
    name: "Budget",
    icon: "pie-chart",
    route: "Budget",
    description: "Personal budgeting",
  },
];

export default function ModuleGridScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [viewMode, setViewMode] = useState<ModuleViewMode>("grid");
  const [arrangement, setArrangement] =
    useState<ModuleArrangement>("intuitive");
  const [modules, setModules] = useState<ModuleItem[]>([]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const s = await db.settings.get();
    setSettings(s);
    setViewMode(s.moduleViewMode || "grid");
    setArrangement(s.moduleArrangement || "intuitive");
    updateModuleOrder(s);
  };

  const updateModuleOrder = (s: Settings) => {
    let orderedModules = [...ALL_MODULES];

    // Filter based on enabled modules - ensure enabledModules exists
    if (s.enabledModules && Array.isArray(s.enabledModules)) {
      orderedModules = orderedModules.filter((m) =>
        s.enabledModules.includes(m.id),
      );
    }

    // Apply arrangement
    const stats = s.moduleUsageStats || {};
    switch (s.moduleArrangement || "intuitive") {
      case "alphabetical":
        orderedModules.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "most_recent":
        // Sort by last used timestamp (most recent first)
        if (Object.keys(stats).length > 0) {
          orderedModules.sort((a, b) => {
            const aTime = stats[a.id]?.lastUsed || "0";
            const bTime = stats[b.id]?.lastUsed || "0";
            return bTime.localeCompare(aTime);
          });
        }
        break;
      case "static":
        if (s.moduleOrder && Array.isArray(s.moduleOrder)) {
          orderedModules.sort((a, b) => {
            const indexA = s.moduleOrder!.indexOf(a.id);
            const indexB = s.moduleOrder!.indexOf(b.id);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
          });
        }
        break;
      case "intuitive":
      default:
        // Sort by usage count (most used first)
        if (Object.keys(stats).length > 0) {
          orderedModules.sort((a, b) => {
            const aCount = stats[a.id]?.count || 0;
            const bCount = stats[b.id]?.count || 0;
            return bCount - aCount;
          });
        }
        break;
    }

    setModules(orderedModules);
  };

  const showNavigationError = (moduleName?: string) => {
    Alert.alert("Navigation Error", getNavigationErrorMessage(moduleName), [
      { text: "OK" },
    ]);
  };

  const logNavigationError = (
    context: string,
    error: unknown,
    metadata: Record<string, unknown>,
  ) => {
    console.error(`[ModuleGrid] ${context}:`, error, {
      ...metadata,
      timestamp: new Date().toISOString(),
    });
  };

  const handleModulePress = async (module: ModuleItem) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const routeNames = navigation.getState()?.routeNames ?? [];
    const validation = validateRouteRegistration({
      routeName: module.route,
      routeNames,
      moduleName: module.name,
    });

    // If the route isn't registered, alert the user instead of failing silently.
    if (!validation.isValid) {
      logNavigationError("Navigation Error", validation.error, {
        moduleId: module.id,
        moduleName: module.name,
        route: module.route,
      });
      showNavigationError(module.name);
      return;
    }

    try {
      // Track module usage so ordering stays meaningful for returning users.
      await db.settings.trackModuleUsage(module.id);

      navigation.goBack();
      setTimeout(() => {
        navigation.navigate(module.route as any);
      }, MODAL_CLOSE_DELAY_MS);
    } catch (error) {
      // We still want a visible error if persistence or navigation fails.
      logNavigationError("Navigation failed", error, {
        moduleId: module.id,
        moduleName: module.name,
        route: module.route,
      });
      showNavigationError(module.name);
    }
  };

  const handleViewModeChange = async (mode: ModuleViewMode) => {
    setViewMode(mode);
    if (settings) {
      const updated = { ...settings, moduleViewMode: mode };
      await db.settings.update(updated);
      setSettings(updated);
    }
  };

  const handleArrangementChange = async (arr: ModuleArrangement) => {
    setArrangement(arr);
    if (settings) {
      const updated = { ...settings, moduleArrangement: arr };
      await db.settings.update(updated);
      setSettings(updated);
      updateModuleOrder(updated);
    }
  };

  const handleDragEnd = async ({ data }: { data: ModuleItem[] }) => {
    setModules(data);
    if (settings && arrangement === "static") {
      const moduleOrder = data.map((m) => m.id);
      const updated = { ...settings, moduleOrder };
      await db.settings.update(updated);
      setSettings(updated);
    }
  };

  const handleHomePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const routeNames = navigation.getState()?.routeNames ?? [];
    const validation = validateRouteRegistration({
      routeName: "CommandCenter",
      routeNames,
      moduleName: "Command Center",
    });

    // Keep the home shortcut safe if navigation state is stale.
    if (!validation.isValid) {
      logNavigationError("Navigation Error", validation.error, {
        route: "CommandCenter",
      });
      showNavigationError("Command Center");
      return;
    }

    navigation.goBack();
    setTimeout(() => {
      navigation.navigate("CommandCenter");
    }, MODAL_CLOSE_DELAY_MS);
  };

  const renderModuleCard = (module: ModuleItem, isDragging?: boolean) => (
    <Pressable
      onPress={() => handleModulePress(module)}
      style={({ pressed }) => [
        viewMode === "grid" ? styles.moduleCard : styles.moduleListItem,
        { backgroundColor: theme.backgroundDefault },
        pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
        isDragging && styles.dragging,
      ]}
    >
      <View
        style={[styles.iconContainer, { backgroundColor: theme.accentDim }]}
      >
        <Feather
          name={module.icon}
          size={viewMode === "grid" ? 28 : 24}
          color={theme.accent}
        />
      </View>
      <View style={viewMode === "list" ? styles.listContent : undefined}>
        <ThemedText
          type="h3"
          style={viewMode === "grid" ? styles.moduleName : styles.listTitle}
        >
          {module.name}
        </ThemedText>
        <ThemedText
          type="caption"
          secondary
          style={
            viewMode === "grid"
              ? styles.moduleDescription
              : styles.listDescription
          }
        >
          {module.description}
        </ThemedText>
      </View>
    </Pressable>
  );

  const renderDraggableItem = ({
    item,
    drag,
    isActive,
  }: RenderItemParams<ModuleItem>) => (
    <ScaleDecorator>
      <Pressable
        onLongPress={drag}
        disabled={arrangement !== "static"}
        style={{ width: "100%" }}
      >
        {renderModuleCard(item, isActive)}
      </Pressable>
    </ScaleDecorator>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header with controls */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + Spacing.md,
            backgroundColor: theme.backgroundBlack,
          },
        ]}
      >
        {/* View mode toggle */}
        <Pressable
          onPress={() =>
            handleViewModeChange(viewMode === "grid" ? "list" : "grid")
          }
          style={({ pressed }) => [
            styles.headerButton,
            { backgroundColor: theme.backgroundSecondary },
            pressed && styles.pressed,
          ]}
        >
          <Feather
            name={viewMode === "grid" ? "list" : "grid"}
            size={24}
            color={theme.accent}
          />
        </Pressable>

        {/* Arrangement selector */}
        <View style={styles.headerCenter}>
          <Pressable
            onPress={() => {
              const arrangements: ModuleArrangement[] = [
                "intuitive",
                "alphabetical",
                "most_recent",
                "static",
              ];
              const currentIndex = arrangements.indexOf(arrangement);
              const nextIndex = (currentIndex + 1) % arrangements.length;
              handleArrangementChange(arrangements[nextIndex]);
            }}
            style={({ pressed }) => [
              styles.arrangementButton,
              { backgroundColor: theme.backgroundSecondary },
              pressed && styles.pressed,
            ]}
          >
            <Feather
              name={
                arrangement === "alphabetical"
                  ? "type"
                  : arrangement === "most_recent"
                    ? "clock"
                    : arrangement === "static"
                      ? "move"
                      : "zap"
              }
              size={18}
              color={theme.textSecondary}
            />
            <ThemedText
              type="caption"
              secondary
              style={styles.arrangementLabel}
            >
              {arrangement === "most_recent"
                ? "Recent"
                : arrangement === "intuitive"
                  ? "Smart"
                  : arrangement === "alphabetical"
                    ? "A-Z"
                    : "Custom"}
            </ThemedText>
          </Pressable>
        </View>

        {/* Home button */}
        <Pressable
          onPress={handleHomePress}
          style={({ pressed }) => [
            styles.headerButton,
            { backgroundColor: theme.backgroundSecondary },
            pressed && styles.pressed,
          ]}
        >
          <Feather name="home" size={24} color={theme.accent} />
        </Pressable>
      </View>

      {/* Module display */}
      {viewMode === "grid" ? (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + Spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {modules.map((module, index) => (
              <Animated.View
                key={module.id}
                entering={FadeInDown.delay(index * 50).springify()}
                style={styles.gridItem}
              >
                {renderModuleCard(module)}
              </Animated.View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <DraggableFlatList
          data={modules}
          renderItem={renderDraggableItem}
          keyExtractor={(item) => item.id}
          onDragEnd={handleDragEnd}
          contentContainerStyle={[
            styles.listContainer,
            { paddingBottom: insets.bottom + Spacing.xl },
          ]}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    width: "100%",
  },
  headerButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.md,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  arrangementButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  arrangementLabel: {
    fontSize: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  gridItem: {
    width: "48%",
  },
  moduleCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    minHeight: 160,
    ...Shadows.card,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  moduleName: {
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  moduleDescription: {
    textAlign: "center",
  },
  listContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  moduleListItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  listContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  listTitle: {
    marginBottom: Spacing.xs,
  },
  listDescription: {
    fontSize: 12,
  },
  dragging: {
    opacity: 0.8,
    transform: [{ scale: 1.05 }],
  },
  disabledCard: {
    opacity: 0.6,
  },
  disabledBadge: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
});
