/**
 * NotebookScreen Module
 *
 * Enhanced markdown note editor with comprehensive features.
 * Features:
 * - Markdown-formatted notes
 * - Tag support (#tag syntax)
 * - Internal link support ([[link]] syntax)
 * - Note list with preview
 * - Real-time search and filter
 * - Multiple sort options
 * - Pin/unpin notes
 * - Tag-based filtering
 * - Bulk operations (multi-select, delete, tag)
 * - Note statistics
 * - Archive functionality
 * - Last edited timestamps
 * - AI assistance for note suggestions
 * - Haptic feedback for interactions
 * - Secondary navigation bar for quick access (AI Assist, Backup, Templates)
 *
 * @module NotebookScreen
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  Platform,
  TextInput,
  ScrollView,
  Modal,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
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
import analytics from "@/analytics";

// Secondary Navigation Constants
/** Badge count threshold for secondary nav (smaller due to reduced badge size) */
const SECONDARY_NAV_BADGE_THRESHOLD = 9;

/** 
 * Secondary nav bar hide offset in pixels when scrolling down.
 * This value must be large enough to hide the entire secondary nav content.
 */
const SECONDARY_NAV_HIDE_OFFSET = -72;

/** Animation duration in milliseconds for secondary nav show/hide transitions */
const SECONDARY_NAV_ANIMATION_DURATION = 200;

/** Scroll position threshold to show nav when near top of page */
const SCROLL_TOP_THRESHOLD = 10;

/** Scroll delta threshold to hide nav when scrolling down */
const SCROLL_DOWN_THRESHOLD = 5;

/** Scroll delta threshold to show nav when scrolling up (negative value) */
const SCROLL_UP_THRESHOLD = -5;

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

type SortOption = "recent" | "alphabetical" | "tags";

interface NoteStats {
  totalNotes: number;
  totalWords: number;
  pinnedCount: number;
  archivedCount: number;
}

function NoteCard({
  note,
  onPress,
  onLongPress,
  index,
  isSelected,
  selectionMode,
}: {
  note: Note;
  onPress: () => void;
  onLongPress: () => void;
  index: number;
  isSelected: boolean;
  selectionMode: boolean;
}) {
  const { theme } = useTheme();

  const wordCount = note.bodyMarkdown.split(/\s+/).filter(Boolean).length;

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [
          styles.noteCard,
          {
            backgroundColor: theme.backgroundDefault,
            borderWidth: selectionMode ? 2 : 0,
            borderColor: isSelected ? theme.accent : "transparent",
          },
          pressed && { opacity: 0.8 },
        ]}
      >
        <View style={styles.noteCardHeader}>
          <View style={styles.noteTitleRow}>
            {note.isPinned && (
              <Feather
                name="bookmark"
                size={16}
                color={theme.accent}
                style={styles.pinnedIcon}
              />
            )}
            <ThemedText
              type="h3"
              style={[styles.noteTitle, { flex: 1 }]}
              numberOfLines={1}
            >
              {note.title || "Untitled"}
            </ThemedText>
            {selectionMode && (
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: isSelected
                      ? theme.accent
                      : theme.backgroundElevated,
                    borderColor: isSelected ? theme.accent : theme.textMuted,
                  },
                ]}
              >
                {isSelected && (
                  <Feather name="check" size={14} color={theme.buttonText} />
                )}
              </View>
            )}
          </View>
        </View>
        <ThemedText
          type="body"
          secondary
          style={styles.notePreview}
          numberOfLines={2}
        >
          {truncateText(note.bodyMarkdown.replace(/[#*\[\]]/g, ""), 100)}
        </ThemedText>
        <View style={styles.noteMeta}>
          <View style={styles.noteMetaLeft}>
            <ThemedText type="small" muted>
              {formatRelativeDate(note.updatedAt)}
            </ThemedText>
            <ThemedText type="small" muted>
              {" "}
              • {wordCount} words
            </ThemedText>
          </View>
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

  // Shared values for secondary navigation animation
  const lastScrollY = useSharedValue(0);
  const secondaryNavTranslateY = useSharedValue(0);
  const isAnimating = useSharedValue(false);

  const [notes, setNotes] = useState<Note[]>([]);
  const [showAISheet, setShowAISheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [showSortModal, setShowSortModal] = useState(false);
  const [showTagFilterModal, setShowTagFilterModal] = useState(false);
  const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);

  const loadNotes = useCallback(async () => {
    const data = await db.notes.getAll();
    setNotes(data);
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
      headerRight: () => <HeaderRightNav settingsRoute="NotebookSettings" />,
    });
  }, [navigation, theme]);

  // Get all unique tags from notes
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach((note) => {
      note.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [notes]);

  /**
   * Scroll handler to hide/show secondary nav based on scroll direction and position.
   * 
   * Behavior:
   * - Shows nav when at top of page (scrollY < SCROLL_TOP_THRESHOLD)
   * - Hides nav when scrolling down significantly (delta > SCROLL_DOWN_THRESHOLD)
   * - Shows nav when scrolling up significantly (delta < SCROLL_UP_THRESHOLD)
   * - Prevents animation overlap using isAnimating flag
   */
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const delta = currentScrollY - lastScrollY.value;

    if (isAnimating.value) {
      lastScrollY.value = currentScrollY;
      return;
    }

    if (currentScrollY < SCROLL_TOP_THRESHOLD && secondaryNavTranslateY.value !== 0) {
      isAnimating.value = true;
      secondaryNavTranslateY.value = withTiming(0, { duration: SECONDARY_NAV_ANIMATION_DURATION }, () => {
        isAnimating.value = false;
      });
    } else if (delta > SCROLL_DOWN_THRESHOLD && secondaryNavTranslateY.value !== SECONDARY_NAV_HIDE_OFFSET) {
      isAnimating.value = true;
      secondaryNavTranslateY.value = withTiming(SECONDARY_NAV_HIDE_OFFSET, { duration: SECONDARY_NAV_ANIMATION_DURATION }, () => {
        isAnimating.value = false;
      });
    } else if (delta < SCROLL_UP_THRESHOLD && secondaryNavTranslateY.value !== 0) {
      isAnimating.value = true;
      secondaryNavTranslateY.value = withTiming(0, { duration: SECONDARY_NAV_ANIMATION_DURATION }, () => {
        isAnimating.value = false;
      });
    }

    lastScrollY.value = currentScrollY;
  }, []); // Empty deps: uses shared values

  /**
   * Animated style for secondary navigation bar.
   * Applies vertical translation (translateY) to hide/show the nav bar on scroll.
   */
  const secondaryNavAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: secondaryNavTranslateY.value }],
    };
  });

  // Filter and sort notes
  const filteredAndSortedNotes = useMemo(() => {
    let filtered = notes.filter((note) => {
      // Filter archived
      if (showArchived) {
        if (!note.isArchived) return false;
      } else {
        if (note.isArchived) return false;
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = note.title.toLowerCase().includes(query);
        const matchesBody = note.bodyMarkdown.toLowerCase().includes(query);
        const matchesTags = note.tags.some((tag) =>
          tag.toLowerCase().includes(query),
        );
        if (!matchesTitle && !matchesBody && !matchesTags) return false;
      }

      // Filter by selected tags
      if (selectedTags.length > 0) {
        const hasSelectedTag = selectedTags.some((tag) =>
          note.tags.includes(tag),
        );
        if (!hasSelectedTag) return false;
      }

      return true;
    });

    // Sort notes
    filtered.sort((a, b) => {
      // Pinned notes always come first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // Then apply the selected sort
      switch (sortBy) {
        case "alphabetical":
          return a.title.localeCompare(b.title);
        case "tags":
          return b.tags.length - a.tags.length;
        case "recent":
        default:
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
      }
    });

    return filtered;
  }, [notes, searchQuery, sortBy, selectedTags, showArchived]);

  // Calculate statistics
  const stats = useMemo((): NoteStats => {
    const totalWords = notes.reduce((sum, note) => {
      return sum + note.bodyMarkdown.split(/\s+/).filter(Boolean).length;
    }, 0);

    return {
      totalNotes: notes.filter((n) => !n.isArchived).length,
      totalWords,
      pinnedCount: notes.filter((n) => n.isPinned && !n.isArchived).length,
      archivedCount: notes.filter((n) => n.isArchived).length,
    };
  }, [notes]);

  const handleAddNote = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("NoteEditor", {});
  };

  const handleNotePress = (note: Note) => {
    if (selectionMode) {
      toggleNoteSelection(note.id);
    } else {
      analytics.trackItemViewed("notebook", "note");
      navigation.navigate("NoteEditor", { noteId: note.id });
    }
  };

  const handleNoteLongPress = (note: Note) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setSelectionMode(true);
    setSelectedNotes(new Set([note.id]));
  };

  const toggleNoteSelection = (noteId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedNotes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedNotes(new Set());
  };

  const handleTogglePin = async (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    await db.notes.save({
      ...note,
      isPinned: !note.isPinned,
      updatedAt: new Date().toISOString(),
    });
    loadNotes();
  };

  const handleToggleArchive = async (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    await db.notes.save({
      ...note,
      isArchived: !note.isArchived,
      updatedAt: new Date().toISOString(),
    });
    loadNotes();
  };

  const handleBulkDelete = async () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    for (const noteId of selectedNotes) {
      await db.notes.delete(noteId);
      analytics.trackItemDeleted("notebook", "note");
    }
    loadNotes();
    exitSelectionMode();
    setShowBulkActionsModal(false);
  };

  const handleBulkArchive = async () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    for (const noteId of selectedNotes) {
      const note = notes.find((n) => n.id === noteId);
      if (note) {
        await db.notes.save({
          ...note,
          isArchived: !note.isArchived,
          updatedAt: new Date().toISOString(),
        });
      }
    }
    loadNotes();
    exitSelectionMode();
    setShowBulkActionsModal(false);
  };

  const handleBulkPin = async () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    for (const noteId of selectedNotes) {
      const note = notes.find((n) => n.id === noteId);
      if (note) {
        await db.notes.save({
          ...note,
          isPinned: true,
          updatedAt: new Date().toISOString(),
        });
      }
    }
    loadNotes();
    exitSelectionMode();
    setShowBulkActionsModal(false);
  };

  const renderNote = ({ item, index }: { item: Note; index: number }) => (
    <NoteCard
      note={item}
      index={index}
      onPress={() => handleNotePress(item)}
      onLongPress={() => handleNoteLongPress(item)}
      isSelected={selectedNotes.has(item.id)}
      selectionMode={selectionMode}
    />
  );

  const SortIcon = ({ option }: { option: SortOption }) => {
    if (sortBy === option) {
      return <Feather name="check" size={18} color={theme.accent} />;
    }
    return null;
  };

  return (
    <ThemedView style={styles.container}>
      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.backgroundDefault },
        ]}
      >
        <Feather
          name="search"
          size={18}
          color={theme.textMuted}
          style={styles.searchIcon}
        />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search notes..."
          placeholderTextColor={theme.textMuted}
          style={[styles.searchInput, { color: theme.text }]}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Feather name="x" size={18} color={theme.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Secondary Navigation Bar - Transparent oval with module-specific actions */}
      <View 
        style={[
          styles.secondaryNav, 
          { backgroundColor: "transparent" },
        ]}
      >
        <Animated.View
          style={[
            styles.secondaryNavContent,
            {
              backgroundColor: "transparent",
            },
            secondaryNavAnimatedStyle
          ]}
        >
          <Pressable
            onPress={() => setShowAISheet(true)}
            style={({ pressed }) => [
              styles.secondaryNavButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="AI Assist"
          >
            <Feather name="cpu" size={20} color={theme.text} />
            <ThemedText type="small">AI Assist</ThemedText>
          </Pressable>

          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              // TODO: Implement backup functionality
              console.log("Backup notes");
            }}
            style={({ pressed }) => [
              styles.secondaryNavButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Backup"
          >
            <Feather name="cloud" size={20} color={theme.text} />
            <ThemedText type="small">Backup</ThemedText>
          </Pressable>

          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              // TODO: Implement templates functionality
              console.log("Open templates");
            }}
            style={({ pressed }) => [
              styles.secondaryNavButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Templates"
          >
            <Feather name="file-text" size={20} color={theme.text} />
            <ThemedText type="small">Templates</ThemedText>
          </Pressable>
        </Animated.View>
      </View>

      {/* Toolbar */}
      <View
        style={[styles.toolbar, { backgroundColor: theme.backgroundElevated }]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.toolbarContent}
        >
          {/* Statistics */}
          <View style={styles.statsChip}>
            <ThemedText type="small" style={{ color: theme.accent }}>
              {stats.totalNotes} notes • {stats.totalWords} words
            </ThemedText>
          </View>

          {/* Sort Button */}
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setShowSortModal(true);
            }}
            style={[
              styles.toolbarButton,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <Feather name="sliders" size={16} color={theme.textSecondary} />
            <ThemedText type="small" secondary>
              Sort
            </ThemedText>
          </Pressable>

          {/* Tag Filter Button */}
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setShowTagFilterModal(true);
            }}
            style={[
              styles.toolbarButton,
              {
                backgroundColor:
                  selectedTags.length > 0
                    ? theme.accentDim
                    : theme.backgroundDefault,
              },
            ]}
          >
            <Feather
              name="tag"
              size={16}
              color={
                selectedTags.length > 0 ? theme.accent : theme.textSecondary
              }
            />
            <ThemedText
              type="small"
              style={{
                color:
                  selectedTags.length > 0 ? theme.accent : theme.textSecondary,
              }}
            >
              {selectedTags.length > 0 ? `${selectedTags.length} tags` : "Tags"}
            </ThemedText>
          </Pressable>

          {/* Archive Toggle */}
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setShowArchived(!showArchived);
            }}
            style={[
              styles.toolbarButton,
              {
                backgroundColor: showArchived
                  ? theme.accentDim
                  : theme.backgroundDefault,
              },
            ]}
          >
            <Feather
              name="archive"
              size={16}
              color={showArchived ? theme.accent : theme.textSecondary}
            />
            <ThemedText
              type="small"
              style={{
                color: showArchived ? theme.accent : theme.textSecondary,
              }}
            >
              {showArchived ? "Archived" : "Archive"}
            </ThemedText>
          </Pressable>
        </ScrollView>
      </View>

      {/* Selection Mode Toolbar */}
      {selectionMode && (
        <View
          style={[
            styles.selectionToolbar,
            { backgroundColor: theme.accentDim },
          ]}
        >
          <Pressable onPress={exitSelectionMode} style={styles.selectionButton}>
            <Feather name="x" size={20} color={theme.accent} />
          </Pressable>
          <ThemedText type="body" style={{ color: theme.accent, flex: 1 }}>
            {selectedNotes.size} selected
          </ThemedText>
          <Pressable
            onPress={() => setShowBulkActionsModal(true)}
            style={styles.selectionButton}
          >
            <Feather name="more-vertical" size={20} color={theme.accent} />
          </Pressable>
        </View>
      )}

      {/* Notes List */}
      <FlatList
        data={filteredAndSortedNotes}
        renderItem={renderNote}
        keyExtractor={(item) => item.id}
        onScroll={handleScroll}
        scrollEventThrottle={16}
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
              {showArchived
                ? "No Archived Notes"
                : searchQuery
                  ? "No Matching Notes"
                  : "No Notes Yet"}
            </ThemedText>
            <ThemedText type="body" secondary style={styles.emptyText}>
              {showArchived
                ? "Archive notes to see them here"
                : searchQuery
                  ? "Try a different search term"
                  : "Tap + to create your first note"}
            </ThemedText>
          </View>
        }
      />

      {/* FAB */}
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

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowSortModal(false)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <ThemedText type="h3" style={styles.modalTitle}>
              Sort By
            </ThemedText>

            <Pressable
              onPress={() => {
                setSortBy("recent");
                setShowSortModal(false);
              }}
              style={styles.modalOption}
            >
              <View style={styles.modalOptionLeft}>
                <Feather name="clock" size={20} color={theme.textSecondary} />
                <ThemedText type="body">Most Recent</ThemedText>
              </View>
              <SortIcon option="recent" />
            </Pressable>

            <Pressable
              onPress={() => {
                setSortBy("alphabetical");
                setShowSortModal(false);
              }}
              style={styles.modalOption}
            >
              <View style={styles.modalOptionLeft}>
                <Feather name="type" size={20} color={theme.textSecondary} />
                <ThemedText type="body">Alphabetical</ThemedText>
              </View>
              <SortIcon option="alphabetical" />
            </Pressable>

            <Pressable
              onPress={() => {
                setSortBy("tags");
                setShowSortModal(false);
              }}
              style={styles.modalOption}
            >
              <View style={styles.modalOptionLeft}>
                <Feather name="tag" size={20} color={theme.textSecondary} />
                <ThemedText type="body">By Tags</ThemedText>
              </View>
              <SortIcon option="tags" />
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Tag Filter Modal */}
      <Modal
        visible={showTagFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTagFilterModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowTagFilterModal(false)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View style={styles.modalHeader}>
              <ThemedText type="h3" style={styles.modalTitle}>
                Filter by Tags
              </ThemedText>
              {selectedTags.length > 0 && (
                <Pressable
                  onPress={() => setSelectedTags([])}
                  style={styles.clearButton}
                >
                  <ThemedText type="small" style={{ color: theme.accent }}>
                    Clear
                  </ThemedText>
                </Pressable>
              )}
            </View>

            <ScrollView style={styles.tagList}>
              {allTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <Pressable
                    key={tag}
                    onPress={() => {
                      if (Platform.OS !== "web") {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      setSelectedTags((prev) =>
                        isSelected
                          ? prev.filter((t) => t !== tag)
                          : [...prev, tag],
                      );
                    }}
                    style={[
                      styles.tagFilterOption,
                      {
                        backgroundColor: isSelected
                          ? theme.accentDim
                          : theme.backgroundElevated,
                      },
                    ]}
                  >
                    <ThemedText
                      type="body"
                      style={{ color: isSelected ? theme.accent : theme.text }}
                    >
                      #{tag}
                    </ThemedText>
                    {isSelected && (
                      <Feather name="check" size={18} color={theme.accent} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Bulk Actions Modal */}
      <Modal
        visible={showBulkActionsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBulkActionsModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowBulkActionsModal(false)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <ThemedText type="h3" style={styles.modalTitle}>
              Bulk Actions
            </ThemedText>

            <Pressable onPress={handleBulkPin} style={styles.modalOption}>
              <View style={styles.modalOptionLeft}>
                <Feather
                  name="bookmark"
                  size={20}
                  color={theme.textSecondary}
                />
                <ThemedText type="body">Pin Selected</ThemedText>
              </View>
            </Pressable>

            <Pressable onPress={handleBulkArchive} style={styles.modalOption}>
              <View style={styles.modalOptionLeft}>
                <Feather name="archive" size={20} color={theme.textSecondary} />
                <ThemedText type="body">
                  {showArchived ? "Unarchive" : "Archive"} Selected
                </ThemedText>
              </View>
            </Pressable>

            <Pressable onPress={handleBulkDelete} style={styles.modalOption}>
              <View style={styles.modalOptionLeft}>
                <Feather name="trash-2" size={20} color={theme.error} />
                <ThemedText type="body" style={{ color: theme.error }}>
                  Delete Selected
                </ThemedText>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.xs,
  },
  toolbar: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  toolbarContent: {
    gap: Spacing.sm,
    alignItems: "center",
  },
  statsChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  toolbarButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  selectionToolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  selectionButton: {
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
  noteCardHeader: {
    marginBottom: Spacing.xs,
  },
  noteTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  pinnedIcon: {
    marginRight: Spacing.xs,
  },
  noteTitle: {
    flex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  notePreview: {
    marginBottom: Spacing.md,
  },
  noteMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  noteMetaLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  tagsRow: {
    flexDirection: "row",
    gap: Spacing.xs,
    flexWrap: "wrap",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    maxWidth: 400,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    marginBottom: Spacing.lg,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  modalOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  clearButton: {
    padding: Spacing.xs,
  },
  tagList: {
    maxHeight: 300,
  },
  tagFilterOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  bottomNavContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  // Secondary Navigation Styles
  secondaryNav: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  secondaryNavContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
  },
  secondaryNavButton: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  pressed: {
    opacity: 0.7,
  },
});
