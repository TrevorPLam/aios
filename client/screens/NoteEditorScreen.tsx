import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { db } from "@/storage/database";
import { Note } from "@/models/types";
import { generateId, parseTags, parseLinks } from "@/utils/helpers";
import AIAssistSheet from "@/components/AIAssistSheet";
import analytics from "@/analytics";

type RouteProps = RouteProp<AppStackParamList, "NoteEditor">;

const FORMATTING_TOOLS = [
  { id: "heading", icon: "hash" as const, insert: "# " },
  { id: "bold", icon: "bold" as const, insert: "**", wrap: true },
  { id: "list", icon: "list" as const, insert: "- " },
  { id: "checkbox", icon: "check-square" as const, insert: "- [ ] " },
  { id: "link", icon: "link-2" as const, insert: "[[" },
];

export default function NoteEditorScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [showAISheet, setShowAISheet] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [noteId, setNoteId] = useState<string>("");
  const [isPinned, setIsPinned] = useState(false);
  const [isArchived, setIsArchived] = useState(false);

  const bodyRef = useRef<TextInput>(null);
  const autosaveTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadNote() {
      if (route.params?.noteId) {
        const note = await db.notes.get(route.params.noteId);
        if (note) {
          setTitle(note.title);
          setBody(note.bodyMarkdown);
          setNoteId(note.id);
          setIsNew(false);
          setIsPinned(note.isPinned || false);
          setIsArchived(note.isArchived || false);
        }
      } else {
        const id = generateId();
        setNoteId(id);
        setIsNew(true);
      }
    }
    loadNote();
  }, [route.params?.noteId]);

  const saveNote = useCallback(async () => {
    if (!title.trim() && !body.trim()) return;

    const note: Note = {
      id: noteId,
      title: title.trim() || "Untitled",
      bodyMarkdown: body,
      createdAt: isNew
        ? new Date().toISOString()
        : (await db.notes.get(noteId))?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: parseTags(body),
      links: parseLinks(body),
      isPinned,
      isArchived,
    };

    await db.notes.save(note);

    // Track analytics
    if (isNew) {
      analytics.trackItemCreated("notebook", "note");
    } else {
      analytics.trackItemUpdated("notebook", "note");
    }

    setIsNew(false);
  }, [noteId, title, body, isNew, isPinned, isArchived]);

  useEffect(() => {
    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current);
    }
    autosaveTimer.current = setTimeout(() => {
      saveNote();
    }, 2000);

    return () => {
      if (autosaveTimer.current) {
        clearTimeout(autosaveTimer.current);
      }
    };
  }, [title, body, saveNote]);

  const handleDelete = useCallback(async () => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await db.notes.delete(noteId);
          navigation.goBack();
        },
      },
    ]);
  }, [noteId, navigation]);

  const handleTogglePin = useCallback(async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsPinned((prev) => !prev);
  }, []);

  const handleToggleArchive = useCallback(async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsArchived((prev) => !prev);
  }, []);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerActions}>
          {!isNew && (
            <>
              <Pressable
                onPress={handleTogglePin}
                style={({ pressed }) => [
                  styles.headerButton,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Feather
                  name="bookmark"
                  size={20}
                  color={isPinned ? theme.accent : theme.textSecondary}
                />
              </Pressable>
              <Pressable
                onPress={handleToggleArchive}
                style={({ pressed }) => [
                  styles.headerButton,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Feather
                  name="archive"
                  size={20}
                  color={isArchived ? theme.accent : theme.textSecondary}
                />
              </Pressable>
              <Pressable
                onPress={handleDelete}
                style={({ pressed }) => [
                  styles.headerButton,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Feather name="trash-2" size={20} color={theme.error} />
              </Pressable>
            </>
          )}
        </View>
      ),
    });
  }, [
    navigation,
    theme,
    isNew,
    handleDelete,
    handleTogglePin,
    handleToggleArchive,
    isPinned,
    isArchived,
  ]);

  const insertFormatting = (tool: (typeof FORMATTING_TOOLS)[0]) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (tool.wrap) {
      setBody((prev) => prev + tool.insert + "text" + tool.insert);
    } else {
      setBody((prev) => prev + "\n" + tool.insert);
    }
    bodyRef.current?.focus();
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Spacing.md,
            paddingBottom: insets.bottom + Spacing["5xl"],
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Note Title"
          placeholderTextColor={theme.textMuted}
          style={[styles.titleInput, { color: theme.text }]}
        />

        <View
          style={[styles.toolbar, { backgroundColor: theme.backgroundDefault }]}
        >
          {FORMATTING_TOOLS.map((tool) => (
            <Pressable
              key={tool.id}
              onPress={() => insertFormatting(tool)}
              style={({ pressed }) => [
                styles.toolButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Feather name={tool.icon} size={18} color={theme.textSecondary} />
            </Pressable>
          ))}
          <View style={styles.toolbarDivider} />
          <Pressable
            onPress={() => setShowAISheet(true)}
            style={({ pressed }) => [
              styles.toolButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Feather name="cpu" size={18} color={theme.accent} />
          </Pressable>
        </View>

        <TextInput
          ref={bodyRef}
          value={body}
          onChangeText={setBody}
          placeholder="Start writing..."
          placeholderTextColor={theme.textMuted}
          style={[styles.bodyInput, { color: theme.text }]}
          multiline
          textAlignVertical="top"
        />
      </ScrollView>

      <AIAssistSheet
        visible={showAISheet}
        onClose={() => setShowAISheet(false)}
        module="notebook"
        onAction={(actionId) => {
          if (Platform.OS !== "web") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          switch (actionId) {
            case "title":
              if (!title.trim() && body.trim()) {
                const words = body.split(" ").slice(0, 5).join(" ");
                setTitle(words);
              }
              break;
            case "tags":
              const newTags = ["#todo", "#important"];
              setBody((prev) => prev + "\n\n" + newTags.join(" "));
              break;
            case "summary":
              setBody(
                (prev) =>
                  prev +
                  "\n\n## Summary\nThis note contains key information about the topic discussed above.",
              );
              break;
            case "checklist":
              setBody(
                (prev) =>
                  prev +
                  "\n\n- [ ] First item\n- [ ] Second item\n- [ ] Third item",
              );
              break;
          }
        }}
      />
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
  headerActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  headerButton: {
    padding: Spacing.xs,
  },
  titleInput: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: Spacing.lg,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  toolButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.xs,
  },
  toolbarDivider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: Spacing.xs,
  },
  bodyInput: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 300,
  },
});
