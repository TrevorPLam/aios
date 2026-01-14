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
import { List } from "@/models/types";
import { formatRelativeDate } from "@/utils/helpers";
import { BottomNav } from "@/components/BottomNav";
import AIAssistSheet from "@/components/AIAssistSheet";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

function ListCard({
  list,
  onPress,
  index,
}: {
  list: List;
  onPress: () => void;
  index: number;
}) {
  const { theme } = useTheme();
  const checkedCount = list.items.filter((item) => item.isChecked).length;
  const totalCount = list.items.length;

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.listCard,
          { backgroundColor: theme.backgroundDefault },
          pressed && { opacity: 0.8 },
        ]}
      >
        <View style={styles.listHeader}>
          <ThemedText type="h3" style={styles.listTitle} numberOfLines={1}>
            {list.title}
          </ThemedText>
          <View style={styles.listStats}>
            <ThemedText type="small" muted>
              {checkedCount}/{totalCount}
            </ThemedText>
          </View>
        </View>
        <View style={styles.listMeta}>
          <ThemedText type="small" muted>
            {formatRelativeDate(list.lastOpenedAt)}
          </ThemedText>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function ListsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NavigationProp>();

  const [lists, setLists] = useState<List[]>([]);
  const [showAISheet, setShowAISheet] = useState(false);

  const loadLists = useCallback(async () => {
    const data = await db.lists.getAllSorted();
    setLists(data);
  }, []);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadLists);
    return unsubscribe;
  }, [navigation, loadLists]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            navigation.navigate("ListEditor", {});
          }}
          style={({ pressed }) => [
            styles.headerButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Feather name="plus" size={24} color={theme.accent} />
        </Pressable>
      ),
    });
  }, [navigation, theme]);

  const renderList = ({ item, index }: { item: List; index: number }) => (
    <ListCard
      list={item}
      index={index}
      onPress={() => navigation.navigate("ListEditor", { listId: item.id })}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={lists}
        renderItem={renderList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.md,
            paddingBottom: insets.bottom + Spacing["5xl"],
          },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Image
              source={require("../../assets/images/empty-notebook.png")}
              style={styles.emptyImage}
              resizeMode="contain"
            />
            <ThemedText type="h3" style={styles.emptyTitle}>
              No Lists Yet
            </ThemedText>
            <ThemedText type="body" secondary style={styles.emptyText}>
              Tap + to create your first list
            </ThemedText>
          </View>
        }
      />

      <View
        style={[
          styles.bottomNavContainer,
          { bottom: insets.bottom + Spacing.lg },
        ]}
      >
        <BottomNav onAiPress={() => setShowAISheet(true)} />
      </View>

      <AIAssistSheet
        visible={showAISheet}
        onClose={() => setShowAISheet(false)}
        module="lists"
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
  listContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  listCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    ...Shadows.card,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  listTitle: {
    flex: 1,
  },
  listStats: {
    marginLeft: Spacing.sm,
  },
  listMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  bottomNavContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
});
