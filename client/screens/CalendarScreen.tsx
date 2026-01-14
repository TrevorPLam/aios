import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
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
import { CalendarEvent } from "@/models/types";
import { formatTime, isSameDay, getWeekDates } from "@/utils/helpers";
import { BottomNav } from "@/components/BottomNav";
import AIAssistSheet from "@/components/AIAssistSheet";
import { HeaderLeftNav, HeaderRightNav } from "@/components/HeaderNav";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function EventCard({
  event,
  onPress,
  index,
}: {
  event: CalendarEvent;
  onPress: () => void;
  index: number;
}) {
  const { theme } = useTheme();
  const startTime = formatTime(event.startAt);
  const endTime = formatTime(event.endAt);

  return (
    <Animated.View entering={FadeInDown.delay(index * 30).springify()}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.eventCard,
          { backgroundColor: theme.backgroundDefault },
          pressed && { opacity: 0.8 },
        ]}
      >
        <View
          style={[styles.eventIndicator, { backgroundColor: theme.accent }]}
        />
        <View style={styles.eventContent}>
          <ThemedText
            type="body"
            style={{ fontWeight: "600" }}
            numberOfLines={1}
          >
            {event.title}
          </ThemedText>
          <View style={styles.eventMeta}>
            <Feather name="clock" size={12} color={theme.textMuted} />
            <ThemedText type="small" muted>
              {event.allDay ? "All day" : `${startTime} - ${endTime}`}
            </ThemedText>
            {event.location ? (
              <>
                <Feather
                  name="map-pin"
                  size={12}
                  color={theme.textMuted}
                  style={{ marginLeft: Spacing.md }}
                />
                <ThemedText type="small" muted numberOfLines={1}>
                  {event.location}
                </ThemedText>
              </>
            ) : null}
          </View>
        </View>
        <Feather name="chevron-right" size={18} color={theme.textMuted} />
      </Pressable>
    </Animated.View>
  );
}

export default function CalendarScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [showAISheet, setShowAISheet] = useState(false);
  const [viewMode, setViewMode] = useState<"day" | "week">("day");

  const weekDates = getWeekDates(selectedDate);

  const loadEvents = useCallback(async () => {
    const data = await db.events.getAll();
    setAllEvents(data);

    const dayEvents = data
      .filter((e) => {
        const eventDate = new Date(e.startAt);
        return isSameDay(eventDate, selectedDate);
      })
      .sort(
        (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
      );

    setEvents(dayEvents);
  }, [selectedDate]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadEvents);
    return unsubscribe;
  }, [navigation, loadEvents]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderLeftNav />,
      headerRight: () => <HeaderRightNav />,
    });
  }, [navigation, theme]);

  const handleAddEvent = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("EventDetail", {
      date: selectedDate.toISOString(),
    });
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction * 7);
    setSelectedDate(newDate);
  };

  const hasEventsOnDate = (date: Date): boolean => {
    return allEvents.some((e) => isSameDay(new Date(e.startAt), date));
  };

  const renderEvent = ({
    item,
    index,
  }: {
    item: CalendarEvent;
    index: number;
  }) => (
    <EventCard
      event={item}
      index={index}
      onPress={() => navigation.navigate("EventDetail", { eventId: item.id })}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.calendarHeader, { marginTop: 0 }]}>
        <View style={styles.monthRow}>
          <Pressable onPress={() => navigateWeek(-1)} style={styles.navButton}>
            <Feather
              name="chevron-left"
              size={24}
              color={theme.textSecondary}
            />
          </Pressable>
          <ThemedText type="h2">
            {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </ThemedText>
          <Pressable onPress={() => navigateWeek(1)} style={styles.navButton}>
            <Feather
              name="chevron-right"
              size={24}
              color={theme.textSecondary}
            />
          </Pressable>
        </View>

        <View style={styles.weekRow}>
          {weekDates.map((date, index) => {
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());
            const hasEvents = hasEventsOnDate(date);

            return (
              <Pressable
                key={index}
                onPress={() => setSelectedDate(date)}
                style={[
                  styles.dayButton,
                  isSelected && { backgroundColor: theme.accent },
                ]}
              >
                <ThemedText
                  type="small"
                  style={{
                    color: isSelected ? theme.backgroundRoot : theme.textMuted,
                  }}
                >
                  {DAYS[date.getDay()]}
                </ThemedText>
                <ThemedText
                  type="h3"
                  style={{
                    color: isSelected
                      ? theme.backgroundRoot
                      : isToday
                        ? theme.accent
                        : theme.text,
                  }}
                >
                  {date.getDate()}
                </ThemedText>
                {hasEvents && !isSelected && (
                  <View
                    style={[styles.eventDot, { backgroundColor: theme.accent }]}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + Spacing["5xl"] },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Image
              source={require("../../assets/images/empty-calendar.png")}
              style={styles.emptyImage}
              resizeMode="contain"
            />
            <ThemedText type="h3" style={styles.emptyTitle}>
              No Events
            </ThemedText>
            <ThemedText type="body" secondary style={styles.emptyText}>
              Nothing scheduled for this day
            </ThemedText>
          </View>
        }
      />

      <Pressable
        onPress={handleAddEvent}
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

      <View style={styles.bottomNavContainer}>
        <BottomNav onAiPress={() => setShowAISheet(true)} />
      </View>

      <AIAssistSheet
        visible={showAISheet}
        onClose={() => setShowAISheet(false)}
        module="calendar"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    padding: Spacing.xs,
  },
  calendarHeader: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  navButton: {
    padding: Spacing.sm,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayButton: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    minWidth: 44,
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
    ...Shadows.card,
  },
  eventIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  eventContent: {
    flex: 1,
  },
  eventMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: Spacing["5xl"],
    paddingHorizontal: Spacing["2xl"],
  },
  emptyImage: {
    width: 180,
    height: 180,
    opacity: 0.8,
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
