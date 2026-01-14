import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { db } from "@/storage/database";
import { Photo, PhotoGridSize } from "@/models/types";
import { HeaderLeftNav, HeaderRightWithAction } from "@/components/HeaderNav";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const SCREEN_WIDTH = Dimensions.get("window").width;

interface PhotoCardProps {
  photo: Photo;
  onPress: () => void;
  index: number;
  gridSize: PhotoGridSize;
}

function PhotoCard({ photo, onPress, index, gridSize }: PhotoCardProps) {
  const { theme } = useTheme();
  const itemsPerRow = gridSize;
  const itemSize =
    (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm * (itemsPerRow - 1)) /
    itemsPerRow;

  return (
    <Animated.View entering={FadeInDown.delay(index * 30).springify()}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.photoCard,
          {
            width: itemSize,
            height: itemSize,
            backgroundColor: theme.backgroundDefault,
          },
          pressed && { opacity: 0.8 },
        ]}
      >
        <Image
          source={{ uri: photo.uri }}
          style={styles.photoImage}
          contentFit="cover"
        />
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
      </Pressable>
    </Animated.View>
  );
}

export default function PhotosScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NavigationProp>();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [gridSize, setGridSize] = useState<PhotoGridSize>(4);

  const loadPhotos = useCallback(async () => {
    const data = await db.photos.getAllSorted();
    setPhotos(data);
  }, []);

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

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderLeftNav />,
      headerRight: () => (
        <HeaderRightWithAction
          actionIcon="plus"
          onActionPress={handleAddPhoto}
        />
      ),
    });
  }, [navigation]);

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
      const documentDir = (FileSystem as any).documentDirectory as string;
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
    navigation.navigate("PhotoDetail", { photoId });
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
          <FlatList
            data={photos}
            renderItem={({ item, index }) => (
              <PhotoCard
                photo={item}
                onPress={() => handlePhotoPress(item.id)}
                index={index}
                gridSize={gridSize}
              />
            )}
            keyExtractor={(item) => item.id}
            numColumns={gridSize}
            key={gridSize}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: insets.bottom + Spacing.xl },
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
                bottom: insets.bottom + Spacing.md,
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
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
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
});
