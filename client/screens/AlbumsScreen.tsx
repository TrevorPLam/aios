/**
 * AlbumsScreen Module
 *
 * Photo album management interface for organizing photos into collections.
 *
 * Features:
 * - Create, edit, and delete albums
 * - View album covers and photo counts
 * - Navigate to album detail view
 * - Search albums by name
 * - Sort albums by name, date, or photo count
 *
 * @module AlbumsScreen
 */

import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { db } from "@/storage/database";
import { PhotoAlbum, Photo } from "@/models/types";
import { HeaderLeftNav, HeaderRightNav } from "@/components/HeaderNav";
import { BottomNav } from "@/components/BottomNav";
import { generateId } from "@/utils/helpers";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

interface AlbumCardProps {
  album: PhotoAlbum;
  coverPhoto: Photo | null;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  index: number;
}

function AlbumCard({
  album,
  coverPhoto,
  onPress,
  onEdit,
  onDelete,
  index,
}: AlbumCardProps) {
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.albumCard,
          { backgroundColor: theme.backgroundDefault },
          pressed && { opacity: 0.8 },
        ]}
      >
        <View style={styles.albumCover}>
          {coverPhoto ? (
            <Image
              source={{ uri: coverPhoto.uri }}
              style={styles.coverImage}
              contentFit="cover"
            />
          ) : (
            <View
              style={[
                styles.placeholderCover,
                { backgroundColor: theme.background },
              ]}
            >
              <Feather name="folder" size={48} color={theme.textMuted} />
            </View>
          )}
          <View
            style={[
              styles.photoCount,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <Feather name="image" size={12} color={theme.text} />
            <ThemedText type="caption">{album.photoCount}</ThemedText>
          </View>
        </View>

        <View style={styles.albumInfo}>
          <ThemedText type="h3" numberOfLines={1}>
            {album.name}
          </ThemedText>
          {album.description && (
            <ThemedText type="caption" muted numberOfLines={2}>
              {album.description}
            </ThemedText>
          )}
        </View>

        <View style={styles.albumActions}>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Feather name="edit-3" size={18} color={theme.accent} />
          </Pressable>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Feather name="trash-2" size={18} color={theme.error} />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function AlbumsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
  const [coverPhotos, setCoverPhotos] = useState<Map<string, Photo>>(new Map());
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<PhotoAlbum | null>(null);

  const loadAlbums = useCallback(async () => {
    const data = await db.photoAlbums.getAll();
    setAlbums(data);

    // Load cover photos
    const covers = new Map<string, Photo>();
    for (const album of data) {
      if (album.coverPhotoId) {
        const photo = await db.photos.get(album.coverPhotoId);
        if (photo) {
          covers.set(album.id, photo);
        }
      }
    }
    setCoverPhotos(covers);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAlbums();
    }, [loadAlbums]),
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderLeftNav />,
      headerRight: () => <HeaderRightNav />,
    });
  }, [navigation]);

  const handleCreateAlbum = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setEditingAlbum(null);
    setShowCreateModal(true);
  };

  const handleEditAlbum = (album: PhotoAlbum) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setEditingAlbum(album);
    setShowCreateModal(true);
  };

  const handleDeleteAlbum = (album: PhotoAlbum) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Alert.alert(
      "Delete Album",
      `Are you sure you want to delete "${album.name}"? Photos will not be deleted.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await db.photoAlbums.delete(album.id);
            await db.history.add({
              message: `Deleted album: ${album.name}`,
              type: "system",
            });
            loadAlbums();
          },
        },
      ],
    );
  };

  const handleAlbumPress = (albumId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Navigate to album detail screen (to be created)
    // navigation.navigate("AlbumDetail", { albumId });
    Alert.alert("Album View", "Album detail view coming soon!");
  };

  const filteredAlbums = albums.filter((album) =>
    album.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Feather name="folder" size={64} color={theme.textMuted} />
      <ThemedText type="h2" style={styles.emptyTitle}>
        No Albums Yet
      </ThemedText>
      <ThemedText type="body" secondary style={styles.emptyDescription}>
        Create an album to organize your photos
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
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
          placeholder="Search albums..."
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

      {filteredAlbums.length === 0 && searchQuery === "" ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredAlbums}
          renderItem={({ item, index }) => (
            <AlbumCard
              album={item}
              coverPhoto={coverPhotos.get(item.id) || null}
              onPress={() => handleAlbumPress(item.id)}
              onEdit={() => handleEditAlbum(item)}
              onDelete={() => handleDeleteAlbum(item)}
              index={index}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingBottom: insets.bottom + Spacing["5xl"] + Spacing.lg,
            },
          ]}
          ListEmptyComponent={
            <View style={styles.emptySearch}>
              <ThemedText type="body" muted>
                No albums found matching "{searchQuery}"
              </ThemedText>
            </View>
          }
        />
      )}

      {/* FAB for creating albums */}
      <Pressable
        onPress={handleCreateAlbum}
        style={[
          styles.fab,
          {
            backgroundColor: theme.accent,
            bottom: insets.bottom + Spacing["5xl"] + Spacing.lg,
          },
        ]}
      >
        <Feather name="plus" size={24} color={theme.buttonText} />
      </Pressable>

      <View style={styles.bottomNavContainer}>
        <BottomNav onAiPress={() => {}} />
      </View>

      {/* Create/Edit Album Modal */}
      <AlbumFormModal
        visible={showCreateModal}
        album={editingAlbum}
        onClose={() => {
          setShowCreateModal(false);
          setEditingAlbum(null);
        }}
        onSave={loadAlbums}
      />
    </ThemedView>
  );
}

// Album Form Modal Component
function AlbumFormModal({
  visible,
  album,
  onClose,
  onSave,
}: {
  visible: boolean;
  album: PhotoAlbum | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  React.useEffect(() => {
    if (visible) {
      setName(album?.name || "");
      setDescription(album?.description || "");
    }
  }, [visible, album]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Album name is required");
      return;
    }

    const now = new Date().toISOString();

    if (album) {
      // Update existing album
      const updated: PhotoAlbum = {
        ...album,
        name: name.trim(),
        description: description.trim(),
        updatedAt: now,
      };
      await db.photoAlbums.save(updated);
      await db.history.add({
        message: `Updated album: ${name}`,
        type: "system",
      });
    } else {
      // Create new album
      const newAlbum: PhotoAlbum = {
        id: generateId(),
        name: name.trim(),
        description: description.trim(),
        photoCount: 0,
        createdAt: now,
        updatedAt: now,
      };
      await db.photoAlbums.save(newAlbum);
      await db.history.add({
        message: `Created album: ${name}`,
        type: "system",
      });
    }

    onSave();
    onClose();
  };

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
            <ThemedText type="h2">
              {album ? "Edit Album" : "Create Album"}
            </ThemedText>
            <Pressable onPress={onClose}>
              <Feather name="x" size={24} color={theme.text} />
            </Pressable>
          </View>

          <View style={styles.formContent}>
            <View style={styles.inputGroup}>
              <ThemedText type="body" style={styles.inputLabel}>
                Album Name *
              </ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    color: theme.text,
                    backgroundColor: theme.backgroundDefault,
                    borderColor: theme.textMuted,
                  },
                ]}
                placeholder="My Album"
                placeholderTextColor={theme.textMuted}
                value={name}
                onChangeText={setName}
                autoFocus
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="body" style={styles.inputLabel}>
                Description
              </ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  styles.textArea,
                  {
                    color: theme.text,
                    backgroundColor: theme.backgroundDefault,
                    borderColor: theme.textMuted,
                  },
                ]}
                placeholder="Optional description"
                placeholderTextColor={theme.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            <Pressable
              onPress={handleSave}
              style={[styles.saveButton, { backgroundColor: theme.accent }]}
            >
              <ThemedText type="body" style={{ color: theme.buttonText }}>
                {album ? "Save Changes" : "Create Album"}
              </ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  listContent: {
    padding: Spacing.lg,
  },
  albumCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  albumCover: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
    marginBottom: Spacing.md,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  placeholderCover: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  photoCount: {
    position: "absolute",
    bottom: Spacing.sm,
    right: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  albumInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  albumActions: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  actionButton: {
    padding: Spacing.sm,
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
  emptySearch: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    right: Spacing.lg,
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
  formContent: {
    padding: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    marginBottom: Spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  saveButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginTop: Spacing.md,
  },
});
