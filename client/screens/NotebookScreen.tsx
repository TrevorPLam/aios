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
import { Note } from "@/models/types";
import { formatRelativeDate, truncateText } from "@/utils/helpers";
import { BottomNav } from "@/components/BottomNav";
import AIAssistSheet from "@/components/AIAssistSheet";
import { HeaderLeftNav, HeaderRightNav } from "@/components/HeaderNav";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

function NoteCard({
  note,
  onPress,
  index,
}: {
  note: Note;
  onPress: () => void;
  index: number;
}) {
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.noteCard,
          { backgroundColor: theme.backgroundDefault },
          pressed && { opacity: 0.8 },
        ]}
      >
        <ThemedText type="h3" style={styles.noteTitle} numberOfLines={1}>
          {note.title || "Untitled"}
        </ThemedText>
        <ThemedText
          type="body"
          secondary
          style={styles.notePreview}
          numberOfLines={2}
        >
          {truncateText(note.bodyMarkdown.replace(/[#*\[\]]/g, ""), 100)}
        </ThemedText>
        <View style={styles.noteMeta}>
          <ThemedText type="small" muted>
            {formatRelativeDate(note.updatedAt)}
          </ThemedText>
          {note.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {note.tags.slice(0, 3).map((tag) => (
                <View
                  key={tag}
                  style={[styles.tag, { backgroundColor: theme.accentDim }]}
                >
                  <ThemedText type="small" style={{ color: theme.accent }}>
                    #{tag}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function NotebookScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [notes, setNotes] = useState<Note[]>([]);
  const [showAISheet, setShowAISheet] = useState(false);

  const loadNotes = useCallback(async () => {
    const data = await db.notes.getAll();
    setNotes(
      data.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    );
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadNotes);
    return unsubscribe;
  }, [navigation, loadNotes]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderLeftNav />,
      headerRight: () => <HeaderRightNav />,
    });
  }, [navigation, theme]);

  const handleAddNote = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("NoteEditor", {});
  };

  const renderNote = ({ item, index }: { item: Note; index: number }) => (
    <NoteCard
      note={item}
      index={index}
      onPress={() => navigation.navigate("NoteEditor", { noteId: item.id })}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={notes}
        renderItem={renderNote}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: Spacing.md,
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
              No Notes Yet
            </ThemedText>
            <ThemedText type="body" secondary style={styles.emptyText}>
              Tap + to create your first note
            </ThemedText>
          </View>
        }
      />

      <Pressable
        onPress={handleAddNote}
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
        module="notebook"
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
  noteCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    ...Shadows.card,
  },
  noteTitle: {
    marginBottom: Spacing.xs,
  },
  notePreview: {
    marginBottom: Spacing.md,
  },
  noteMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tagsRow: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
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
