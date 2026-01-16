/**
 * PhotosScreen Module (Enhanced)
 *
 * Advanced photo gallery with comprehensive organization features.
 *
 * Features:
 * - Albums system with cover photos
 * - Advanced filtering (favorites, backup status)
 * - Search functionality across names, tags, descriptions
 * - Bulk selection and operations
 * - Photo statistics display
 * - Favorites/starring system with toggle
 * - Grid size adjustment (2x2 to 6x6)
 * - Haptic feedback for interactions
 * - Automatic date-based sorting (newest first)
 *
 * Database Operations:
 * - Photo CRUD with automatic history logging
 * - Favorites management
 * - Album assignment and removal
 * - Tag management
 * - Comprehensive search across multiple fields
 * - Statistics computation
 *
 * @module PhotosScreen
 * @see {@link PhotoAlbum} for album management
 * @see {@link PhotoDetailScreen} for individual photo viewing
 * @see {@link PhotoEditorScreen} for photo editing capabilities
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  Dimensions,
  TextInput,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { db } from "@/storage/database";
import { Photo, PhotoGridSize } from "@/models/types";
import { HeaderLeftNav } from "@/components/HeaderNav";
import { BottomNav } from "@/components/BottomNav";
import { formatFileSize } from "@/utils/helpers";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

type FilterType = "all" | "favorites" | "backed_up" | "not_backed_up" | "album";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface PhotoCardProps {
  photo: Photo;
  onPress: () => void;
  onLongPress?: () => void;
  index: number;
  gridSize: PhotoGridSize;
  isSelected?: boolean;
}

function PhotoCard({
  photo,
  onPress,
  onLongPress,
  index,
  gridSize,
  isSelected = false,
}: PhotoCardProps) {
  const { theme } = useTheme();
  const itemsPerRow = gridSize;
  const itemSize =
    (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm * (itemsPerRow - 1)) /
    itemsPerRow;

  return (
    <Animated.View entering={FadeInDown.delay(index * 30).springify()}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [
          styles.photoCard,
          {
            width: itemSize,
            height: itemSize,
            backgroundColor: theme.backgroundDefault,
          },
          isSelected && {
            borderWidth: 3,
            borderColor: theme.accent,
          },
          pressed && { opacity: 0.8 },
        ]}
      >
        <Image
          source={{ uri: photo.uri }}
          style={styles.photoImage}
          contentFit="cover"
        />
        {photo.isFavorite && (
          <View
            style={[
              styles.favoriteBadge,
              { backgroundColor: theme.background },
            ]}
          >
            <Feather name="star" size={12} color={theme.warning} />
          </View>
        )}
        {!photo.isBackedUp && (
          <View
            style={[
              styles.cloudBadge,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <Feather name="cloud-off" size={12} color={theme.textMuted} />
          </View>
        )}
        {isSelected && (
          <View
            style={[styles.selectionBadge, { backgroundColor: theme.accent }]}
          >
            <Feather name="check" size={16} color={theme.buttonText} />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function PhotosScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  // State Management
  // - photos: All photos from database (pre-sorted by date)
  // - filteredPhotos: Photos after applying search/filter
  // - gridSize: Number of columns in grid (2-6)
  // - searchQuery: Current search text
  // - filterType: Active filter (all, favorites, backed_up, not_backed_up)
  // - showStatsSheet: Controls statistics modal visibility
  // - selectionMode: Enables bulk operations mode
  // - selectedPhotos: Set of photo IDs selected for bulk operations
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
  const [gridSize, setGridSize] = useState<PhotoGridSize>(4);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [showStatsSheet, setShowStatsSheet] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());

  /**
   * Loads all photos from database
   * Photos are pre-sorted by creation date (newest first)
   */
  const loadPhotos = useCallback(async () => {
    const data = await db.photos.getAllSorted();
    setPhotos(data);
  }, []);

  /**
   * Loads user preferences from settings
   * Currently loads grid size preference
   */
  const loadSettings = useCallback(async () => {
    const settings = await db.settings.get();
    setGridSize(settings.photoGridSize);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPhotos();
      loadSettings();
    }, [loadPhotos, loadSettings]),
  );

  /**
   * Reactive filtering and search
   * Applies in order: filter -> search
   * No sorting needed as photos are pre-sorted by getAllSorted()
   */
  // Filter and search photos
  useEffect(() => {
    let filtered = [...photos];

    // Apply filter based on type
    // Reasoning: Filter first to reduce search scope
    switch (filterType) {
      case "favorites":
        filtered = filtered.filter((p) => p.isFavorite);
        break;
      case "backed_up":
        filtered = filtered.filter((p) => p.isBackedUp);
        break;
      case "not_backed_up":
        filtered = filtered.filter((p) => !p.isBackedUp);
        break;
      // "all" case: no filtering needed
    }

    // Apply search query across multiple fields
    // Searches: filename, tags, description
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.fileName.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query)) ||
          p.description?.toLowerCase().includes(query),
      );
    }

    // Photos maintain chronological order from getAllSorted()
    setFilteredPhotos(filtered);
  }, [photos, filterType, searchQuery]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderLeftNav />,
      headerRight: () => (
        <View style={{ flexDirection: "row", gap: Spacing.sm }}>
          <Pressable
            onPress={() => navigation.navigate("Albums")}
            style={({ pressed }) => [
              { padding: Spacing.xs },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Feather name="folder" size={22} color={theme.accent} />
          </Pressable>
          <Pressable
            onPress={() => setShowStatsSheet(true)}
            style={({ pressed }) => [
              { padding: Spacing.xs },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Feather name="pie-chart" size={22} color={theme.accent} />
          </Pressable>
          <Pressable
            onPress={() => setShowFilterSheet(true)}
            style={({ pressed }) => [
              { padding: Spacing.xs },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Feather
              name="filter"
              size={22}
              color={filterType !== "all" ? theme.accent : theme.text}
            />
          </Pressable>
          {selectionMode && (
            <Pressable
              onPress={handleCancelSelection}
              style={({ pressed }) => [
                { padding: Spacing.xs },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Feather name="x" size={22} color={theme.text} />
            </Pressable>
          )}
        </View>
      ),
    });
  }, [navigation, theme, filterType, selectionMode]);

  /**
   * Toggles photo selection in bulk operations mode
   * Uses Set for O(1) add/remove operations
   */
  const toggleSelection = (photoId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedPhotos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  };

  /**
   * Activates selection mode on long press
   * First photo long-pressed is auto-selected
   */
  const handleLongPress = (photoId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setSelectionMode(true);
    toggleSelection(photoId);
  };

  /**
   * Exits selection mode and clears all selections
   */
  const handleCancelSelection = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectionMode(false);
    setSelectedPhotos(new Set());
  };

  /**
   * Bulk delete operation with confirmation
   * Logs deletion to history for audit trail
   */
  const handleBulkDelete = async () => {
    if (selectedPhotos.size === 0) return;

    Alert.alert(
      "Delete Photos",
      `Are you sure you want to delete ${selectedPhotos.size} photo(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            // Delete photos from database
            await db.photos.deleteMultiple(Array.from(selectedPhotos));
            // Log action for history tracking
            await db.history.add({
              message: `Deleted ${selectedPhotos.size} photos`,
              type: "system",
            });
            handleCancelSelection();
            loadPhotos();
          },
        },
      ],
    );
  };

  /**
   * Imports photo from device camera roll
   * Flow: Request permission -> Launch picker -> Copy to app storage -> Save to database
   */
  const handleAddPhoto = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Request permissions
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: false,
      quality: 1,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];

      // Save to local storage (avoid duplication by using unique names)
      const fileName = `photo_${Date.now()}_${Math.random().toString(36).slice(2, 9)}.jpg`;
      // Note: documentDirectory exists in FileSystem namespace but ESLint can't detect it
      // This is a known issue with expo-file-system type definitions
      // eslint-disable-next-line import/namespace
      const documentDir = FileSystem.documentDirectory;

      if (!documentDir) {
        alert("Unable to access file system");
        return;
      }

      const localDir = `${documentDir}photos/`;

      // Ensure directory exists
      const dirInfo = await FileSystem.getInfoAsync(localDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(localDir, { intermediates: true });
      }

      const localPath = `${localDir}${fileName}`;

      // Copy image to local storage
      await FileSystem.copyAsync({
        from: asset.uri,
        to: localPath,
      });

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(localPath);

      const newPhoto: Photo = {
        id: `photo_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        uri: localPath,
        localPath: localPath,
        width: asset.width,
        height: asset.height,
        fileName: fileName,
        fileSize: fileInfo.exists && "size" in fileInfo ? fileInfo.size : 0,
        mimeType: asset.mimeType || "image/jpeg",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isBackedUp: false,
        tags: [],
      };

      await db.photos.save(newPhoto);
      await db.history.add({
        message: `Added photo: ${fileName}`,
        type: "system",
        metadata: { photoId: newPhoto.id },
      });

      loadPhotos();
    }
  };

  const handlePhotoPress = (photoId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (selectionMode) {
      toggleSelection(photoId);
    } else {
      navigation.navigate("PhotoDetail", { photoId });
    }
  };

  const handleGridSizeChange = async (delta: number) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const newSize = Math.max(2, Math.min(6, gridSize + delta)) as PhotoGridSize;
    setGridSize(newSize);
    await db.settings.update({ photoGridSize: newSize });
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Feather name="image" size={64} color={theme.textMuted} />
      <ThemedText type="h2" style={styles.emptyTitle}>
        No Photos Yet
      </ThemedText>
      <ThemedText type="body" secondary style={styles.emptyDescription}>
        Tap the + button to upload your first photo
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {photos.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {/* Search Bar */}
          <View
            style={[
              styles.searchContainer,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <Feather name="search" size={20} color={theme.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search photos..."
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

          {/* Filter & Sort Bar */}
          <View style={styles.filterBar}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              {["all", "favorites", "backed_up", "not_backed_up"].map(
                (type) => (
                  <Pressable
                    key={type}
                    onPress={() => {
                      if (Platform.OS !== "web") {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      setFilterType(type as FilterType);
                    }}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor:
                          filterType === type
                            ? theme.accent
                            : theme.backgroundDefault,
                      },
                    ]}
                  >
                    <ThemedText
                      type="small"
                      style={{
                        color:
                          filterType === type ? theme.buttonText : theme.text,
                      }}
                    >
                      {type === "all"
                        ? "All"
                        : type === "favorites"
                          ? "Favorites"
                          : type === "backed_up"
                            ? "Backed Up"
                            : "Not Backed Up"}
                    </ThemedText>
                  </Pressable>
                ),
              )}
            </ScrollView>
          </View>

          {/* Selection Mode Toolbar */}
          {selectionMode && (
            <View
              style={[
                styles.selectionToolbar,
                { backgroundColor: theme.backgroundDefault },
              ]}
            >
              <ThemedText type="body">
                {selectedPhotos.size} selected
              </ThemedText>
              <View style={styles.selectionActions}>
                <Pressable
                  onPress={handleBulkDelete}
                  disabled={selectedPhotos.size === 0}
                  style={[
                    styles.selectionButton,
                    selectedPhotos.size === 0 && { opacity: 0.5 },
                  ]}
                >
                  <Feather name="trash-2" size={20} color={theme.error} />
                </Pressable>
              </View>
            </View>
          )}

          <FlatList
            data={filteredPhotos}
            renderItem={({ item, index }) => (
              <PhotoCard
                photo={item}
                onPress={() => handlePhotoPress(item.id)}
                onLongPress={() => handleLongPress(item.id)}
                index={index}
                gridSize={gridSize}
                isSelected={selectedPhotos.has(item.id)}
              />
            )}
            keyExtractor={(item) => item.id}
            numColumns={gridSize}
            key={gridSize}
            contentContainerStyle={[
              styles.listContent,
              {
                paddingTop: Spacing.md,
                paddingBottom: insets.bottom + Spacing["5xl"],
              },
            ]}
            columnWrapperStyle={styles.columnWrapper}
            showsVerticalScrollIndicator={false}
          />

          {/* Grid size controls */}
          <View
            style={[
              styles.gridControls,
              {
                backgroundColor: theme.backgroundDefault,
                bottom: insets.bottom + Spacing["5xl"] + Spacing.lg,
              },
            ]}
          >
            <Pressable
              onPress={() => handleGridSizeChange(-1)}
              disabled={gridSize === 2}
              style={({ pressed }) => [
                styles.controlButton,
                { backgroundColor: theme.backgroundSecondary },
                gridSize === 2 && { opacity: 0.5 },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Feather name="zoom-in" size={20} color={theme.accent} />
            </Pressable>

            <ThemedText type="body" style={styles.gridSizeText}>
              {gridSize}x{gridSize}
            </ThemedText>

            <Pressable
              onPress={() => handleGridSizeChange(1)}
              disabled={gridSize === 6}
              style={({ pressed }) => [
                styles.controlButton,
                { backgroundColor: theme.backgroundSecondary },
                gridSize === 6 && { opacity: 0.5 },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Feather name="zoom-out" size={20} color={theme.accent} />
            </Pressable>
          </View>

          {/* FAB for adding photos */}
          <Pressable
            onPress={handleAddPhoto}
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
            <BottomNav onAiPress={() => {}} />
          </View>

          {/* Statistics Sheet */}
          <PhotoStatsSheet
            visible={showStatsSheet}
            onClose={() => setShowStatsSheet(false)}
          />
        </>
      )}
    </ThemedView>
  );
}

// Statistics Sheet Component
function PhotoStatsSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<{
    totalPhotos: number;
    totalSize: number;
    backedUpCount: number;
    favoriteCount: number;
    albumCount: number;
    taggedCount: number;
  } | null>(null);

  useEffect(() => {
    if (visible) {
      loadStats();
    }
  }, [visible]);

  const loadStats = async () => {
    const data = await db.photos.getStatistics();
    setStats(data);
  };

  if (!stats) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.background,
              paddingBottom: insets.bottom + Spacing.lg,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <ThemedText type="h2">Photo Statistics</ThemedText>
            <Pressable onPress={onClose}>
              <Feather name="x" size={24} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.statsContent}>
            <View style={styles.statRow}>
              <View style={styles.statInfo}>
                <Feather name="image" size={24} color={theme.accent} />
                <View style={styles.statText}>
                  <ThemedText type="body" muted>
                    Total Photos
                  </ThemedText>
                  <ThemedText type="h2">{stats.totalPhotos}</ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.statRow}>
              <View style={styles.statInfo}>
                <Feather name="hard-drive" size={24} color={theme.accent} />
                <View style={styles.statText}>
                  <ThemedText type="body" muted>
                    Total Size
                  </ThemedText>
                  <ThemedText type="h2">
                    {formatFileSize(stats.totalSize)}
                  </ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.statRow}>
              <View style={styles.statInfo}>
                <Feather name="cloud" size={24} color={theme.success} />
                <View style={styles.statText}>
                  <ThemedText type="body" muted>
                    Backed Up
                  </ThemedText>
                  <ThemedText type="h2">
                    {stats.backedUpCount} / {stats.totalPhotos}
                  </ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.statRow}>
              <View style={styles.statInfo}>
                <Feather name="star" size={24} color={theme.warning} />
                <View style={styles.statText}>
                  <ThemedText type="body" muted>
                    Favorites
                  </ThemedText>
                  <ThemedText type="h2">{stats.favoriteCount}</ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.statRow}>
              <View style={styles.statInfo}>
                <Feather name="folder" size={24} color={theme.accent} />
                <View style={styles.statText}>
                  <ThemedText type="body" muted>
                    Albums
                  </ThemedText>
                  <ThemedText type="h2">{stats.albumCount}</ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.statRow}>
              <View style={styles.statInfo}>
                <Feather name="tag" size={24} color={theme.accent} />
                <View style={styles.statText}>
                  <ThemedText type="body" muted>
                    Tagged Photos
                  </ThemedText>
                  <ThemedText type="h2">{stats.taggedCount}</ThemedText>
                </View>
              </View>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  columnWrapper: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  photoCard: {
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
    position: "relative",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  cloudBadge: {
    position: "absolute",
    top: Spacing.xs,
    right: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  favoriteBadge: {
    position: "absolute",
    top: Spacing.xs,
    left: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  selectionBadge: {
    position: "absolute",
    bottom: Spacing.xs,
    right: Spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  filterBar: {
    paddingVertical: Spacing.sm,
  },
  filterScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  selectionToolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  selectionActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  selectionButton: {
    padding: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  statsContent: {
    padding: Spacing.lg,
  },
  statRow: {
    marginBottom: Spacing.lg,
  },
  statInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  statText: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["3xl"],
  },
  emptyTitle: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    textAlign: "center",
  },
  gridControls: {
    position: "absolute",
    right: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  gridSizeText: {
    minWidth: 40,
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
