import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
  Dimensions,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { db } from "@/storage/database";
import { Photo } from "@/models/types";
import { formatRelativeDate } from "@/utils/helpers";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type PhotoDetailRouteProp = RouteProp<AppStackParamList, "PhotoDetail">;

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function PhotoDetailScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PhotoDetailRouteProp>();

  const [photo, setPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    loadPhoto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params.photoId]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerActions}>
          <Pressable
            onPress={handleToggleFavorite}
            style={({ pressed }) => [
              styles.headerButton,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Feather
              name={photo?.isFavorite ? "star" : "star"}
              size={22}
              color={photo?.isFavorite ? theme.warning : theme.accent}
              fill={photo?.isFavorite ? theme.warning : "none"}
            />
          </Pressable>
          <Pressable
            onPress={handleEdit}
            style={({ pressed }) => [
              styles.headerButton,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Feather name="edit-3" size={22} color={theme.accent} />
          </Pressable>
          <Pressable
            onPress={handleDelete}
            style={({ pressed }) => [
              styles.headerButton,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Feather name="trash-2" size={22} color={theme.error} />
          </Pressable>
        </View>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, photo]);

  const loadPhoto = async () => {
    const data = await db.photos.get(route.params.photoId);
    setPhoto(data);
  };

  const handleToggleFavorite = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (photo) {
      await db.photos.toggleFavorite(photo.id);
      await db.history.add({
        message: photo.isFavorite
          ? `Removed ${photo.fileName} from favorites`
          : `Added ${photo.fileName} to favorites`,
        type: "system",
      });
      loadPhoto();
    }
  };

  const handleEdit = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (photo) {
      navigation.navigate("PhotoEditor", { photoId: photo.id });
    }
  };

  const handleDelete = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Alert.alert(
      "Delete Photo",
      "Are you sure you want to delete this photo? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (photo) {
              // Delete from local storage
              try {
                const fileInfo = await FileSystem.getInfoAsync(photo.localPath);
                if (fileInfo.exists) {
                  await FileSystem.deleteAsync(photo.localPath);
                }
              } catch (error) {
                console.error("Error deleting file:", error);
              }

              // Delete from database
              await db.photos.delete(photo.id);
              await db.history.add({
                message: `Deleted photo: ${photo.fileName}`,
                type: "system",
                metadata: { photoId: photo.id },
              });

              navigation.goBack();
            }
          },
        },
      ],
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!photo) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyState}>
          <ThemedText type="body" secondary>
            Photo not found
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: photo.uri }}
            style={[
              styles.image,
              {
                width: SCREEN_WIDTH - Spacing.lg * 2,
                height:
                  ((SCREEN_WIDTH - Spacing.lg * 2) * photo.height) /
                  photo.width,
              },
            ]}
            contentFit="contain"
          />
        </View>

        <View
          style={[
            styles.infoCard,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <View style={styles.infoRow}>
            <ThemedText type="caption" muted>
              File Name
            </ThemedText>
            <ThemedText type="body">{photo.fileName}</ThemedText>
          </View>

          <View style={styles.infoRow}>
            <ThemedText type="caption" muted>
              Dimensions
            </ThemedText>
            <ThemedText type="body">
              {photo.width} × {photo.height}
            </ThemedText>
          </View>

          <View style={styles.infoRow}>
            <ThemedText type="caption" muted>
              File Size
            </ThemedText>
            <ThemedText type="body">
              {formatFileSize(photo.fileSize)}
            </ThemedText>
          </View>

          <View style={styles.infoRow}>
            <ThemedText type="caption" muted>
              Format
            </ThemedText>
            <ThemedText type="body">{photo.mimeType}</ThemedText>
          </View>

          <View style={styles.infoRow}>
            <ThemedText type="caption" muted>
              Created
            </ThemedText>
            <ThemedText type="body">
              {formatRelativeDate(photo.createdAt)}
            </ThemedText>
          </View>

          <View style={styles.infoRow}>
            <ThemedText type="caption" muted>
              Backup Status
            </ThemedText>
            <View style={styles.backupStatus}>
              <Feather
                name={photo.isBackedUp ? "check-circle" : "cloud-off"}
                size={16}
                color={photo.isBackedUp ? theme.success : theme.textMuted}
              />
              <ThemedText
                type="body"
                style={{
                  color: photo.isBackedUp ? theme.success : theme.textSecondary,
                }}
              >
                {photo.isBackedUp ? "Backed up" : "Not backed up"}
              </ThemedText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <ThemedText type="caption" muted>
              Favorite
            </ThemedText>
            <View style={styles.backupStatus}>
              <Feather
                name="star"
                size={16}
                color={photo.isFavorite ? theme.warning : theme.textMuted}
                fill={photo.isFavorite ? theme.warning : "none"}
              />
              <ThemedText type="body">
                {photo.isFavorite ? "Yes" : "No"}
              </ThemedText>
            </View>
          </View>
        </View>

        {photo.tags.length > 0 && (
          <View
            style={[
              styles.tagsCard,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <ThemedText type="caption" muted style={styles.tagsLabel}>
              Tags
            </ThemedText>
            <View style={styles.tagsContainer}>
              {photo.tags.map((tag) => (
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
          </View>
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
    paddingTop: Spacing.lg,
  },
  headerActions: {
    flexDirection: "row",
    gap: Spacing.md,
    paddingRight: Spacing.sm,
  },
  headerButton: {
    padding: Spacing.xs,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  image: {
    borderRadius: BorderRadius.md,
  },
  infoCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backupStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  tagsCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  tagsLabel: {
    marginBottom: Spacing.sm,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
