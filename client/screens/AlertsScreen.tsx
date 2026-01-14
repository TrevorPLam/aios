import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { db } from "@/storage/database";
import { Alert } from "@/models/types";
import { formatTime } from "@/utils/helpers";
import { BottomNav } from "@/components/BottomNav";
import AIAssistSheet from "@/components/AIAssistSheet";
import { HeaderLeftNav, HeaderRightNav } from "@/components/HeaderNav";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

function DigitalClock() {
  const { theme } = useTheme();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");

  return (
    <View style={styles.clockContainer}>
      <View style={styles.timeDisplay}>
        <ThemedText type="title" style={styles.clockText}>
          {hours}:{minutes}
        </ThemedText>
        <ThemedText
          type="h2"
          style={[styles.secondsText, { color: theme.textMuted }]}
        >
          :{seconds}
        </ThemedText>
      </View>
      <ThemedText type="body" muted>
        {time.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </ThemedText>
    </View>
  );
}

function AlertCard({
  alert,
  onPress,
  index,
}: {
  alert: Alert;
  onPress: () => void;
  index: number;
}) {
  const { theme } = useTheme();
  const alertTime = formatTime(alert.time);

  return (
    <Animated.View entering={FadeInDown.delay(index * 30).springify()}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.alertCard,
          { backgroundColor: theme.backgroundDefault },
          !alert.isEnabled && styles.disabledCard,
          pressed && { opacity: 0.8 },
        ]}
      >
        <View
          style={[
            styles.alertIcon,
            {
              backgroundColor: alert.isEnabled
                ? theme.accentDim
                : theme.backgroundSecondary,
            },
          ]}
        >
          <Feather
            name={alert.type === "alarm" ? "bell" : "message-circle"}
            size={20}
            color={alert.isEnabled ? theme.accent : theme.textMuted}
          />
        </View>
        <View style={styles.alertContent}>
          <ThemedText
            type="body"
            style={[
              { fontWeight: "600" },
              !alert.isEnabled && { opacity: 0.5 },
            ]}
            numberOfLines={1}
          >
            {alert.title}
          </ThemedText>
          {alert.description ? (
            <ThemedText
              type="small"
              muted
              numberOfLines={1}
              style={!alert.isEnabled && { opacity: 0.5 }}
            >
              {alert.description}
            </ThemedText>
          ) : null}
          <View style={styles.alertMeta}>
            <Feather name="clock" size={12} color={theme.textMuted} />
            <ThemedText
              type="small"
              muted
              style={!alert.isEnabled && { opacity: 0.5 }}
            >
              {alertTime}
            </ThemedText>
            {alert.recurrenceRule !== "none" && (
              <>
                <Feather
                  name="repeat"
                  size={12}
                  color={theme.textMuted}
                  style={{ marginLeft: Spacing.md }}
                />
                <ThemedText
                  type="small"
                  muted
                  style={!alert.isEnabled && { opacity: 0.5 }}
                >
                  {alert.recurrenceRule}
                </ThemedText>
              </>
            )}
          </View>
        </View>
        <View style={styles.alertToggle}>
          <View
            style={[
              styles.toggleSwitch,
              {
                backgroundColor: alert.isEnabled
                  ? theme.accent
                  : theme.backgroundSecondary,
              },
            ]}
          >
            <View
              style={[
                styles.toggleThumb,
                { backgroundColor: theme.backgroundDefault },
                alert.isEnabled && styles.toggleThumbActive,
              ]}
            />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function AlertsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NavigationProp>();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAISheet, setShowAISheet] = useState(false);

  const loadAlerts = useCallback(async () => {
    const data = await db.alerts.getAllSorted();
    setAlerts(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAlerts();
    }, [loadAlerts]),
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderLeftNav />,
      headerRight: () => <HeaderRightNav />,
    });
  }, [navigation]);

  const handleCreateAlert = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("AlertDetail", {});
  };

  const handleAlertPress = (alertId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("AlertDetail", { alertId });
  };

  const handleAIAssist = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowAISheet(true);
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <DigitalClock />
            <View style={styles.sectionHeader}>
              <ThemedText type="h3">Alarms & Reminders</ThemedText>
            </View>
          </>
        }
        renderItem={({ item, index }) => (
          <AlertCard
            alert={item}
            onPress={() => handleAlertPress(item.id)}
            index={index}
          />
        )}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.md,
            paddingBottom: insets.bottom + Spacing["5xl"],
          },
        ]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="bell-off" size={48} color={theme.textMuted} />
            <ThemedText type="body" muted style={styles.emptyText}>
              No alarms or reminders yet
            </ThemedText>
            <ThemedText type="small" muted style={styles.emptySubtext}>
              Tap + to create one or use AI Assist for suggestions
            </ThemedText>
          </View>
        }
      />

      <Pressable
        onPress={handleCreateAlert}
        style={[
          styles.fab,
          {
            backgroundColor: theme.accent,
            bottom: insets.bottom + Spacing["5xl"] + Spacing.lg,
            right: Spacing.lg,
          },
        ]}
      >
        <Feather name="plus" size={24} color={theme.buttonText} />
      </Pressable>

      <View
        style={[
          styles.bottomNavContainer,
          { bottom: insets.bottom + Spacing.lg },
        ]}
      >
        <BottomNav onAiPress={handleAIAssist} />
      </View>

      <AIAssistSheet
        visible={showAISheet}
        onClose={() => setShowAISheet(false)}
        module="alerts"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  clockContainer: {
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
    marginBottom: Spacing.xl,
  },
  timeDisplay: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: Spacing.sm,
  },
  clockText: {
    fontSize: 64,
    fontWeight: "200",
    letterSpacing: -2,
  },
  secondsText: {
    fontSize: 32,
    fontWeight: "200",
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  alertCard: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    alignItems: "center",
    ...Shadows.card,
  },
  disabledCard: {
    opacity: 0.6,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  alertContent: {
    flex: 1,
  },
  alertMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  alertToggle: {
    marginLeft: Spacing.md,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: "center",
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  emptyText: {
    marginTop: Spacing.lg,
    textAlign: "center",
  },
  emptySubtext: {
    marginTop: Spacing.xs,
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
    left: 0,
    right: 0,
    alignItems: "center",
  },
});
