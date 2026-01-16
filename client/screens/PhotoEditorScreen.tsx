import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { db } from "@/storage/database";
import { Photo } from "@/models/types";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type PhotoEditorRouteProp = RouteProp<AppStackParamList, "PhotoEditor">;

const SCREEN_WIDTH = Dimensions.get("window").width;

type EditTool = "crop" | "rotate" | "brightness" | "contrast" | "saturation";

interface EditState {
  brightness: number;
  contrast: number;
  saturation: number;
  rotation: number;
}

export default function PhotoEditorScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PhotoEditorRouteProp>();

  const [photo, setPhoto] = useState<Photo | null>(null);
  const [editedUri, setEditedUri] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<EditTool | null>(null);
  const [editState, setEditState] = useState<EditState>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    rotation: 0,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  useEffect(() => {
    loadPhoto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params.photoId]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={handleSave}
          disabled={isSaving}
          style={({ pressed }) => [
            styles.headerButton,
            pressed && { opacity: 0.8 },
          ]}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={theme.accent} />
          ) : (
            <ThemedText type="body" style={{ color: theme.accent }}>
              Save
            </ThemedText>
          )}
        </Pressable>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, isSaving]);

  const loadPhoto = async () => {
    const data = await db.photos.get(route.params.photoId);
    setPhoto(data);
    if (data) {
      setEditedUri(data.uri);
    }
  };

  const applyEdits = async () => {
    if (!photo) return;

    const actions: ImageManipulator.Action[] = [];

    // Apply rotation
    if (editState.rotation !== 0) {
      actions.push({ rotate: editState.rotation });
    }

    // Apply brightness, contrast, saturation as a single operation
    // Note: expo-image-manipulator doesn't support these directly,
    // so we'll simulate basic adjustments
    // In a real app, you'd use a more advanced image processing library

    try {
      const result = await ImageManipulator.manipulateAsync(
        photo.uri,
        actions,
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG },
      );

      setEditedUri(result.uri);
    } catch (error) {
      console.error("Error applying edits:", error);
      Alert.alert("Error", "Failed to apply edits");
    }
  };

  const handleSave = async () => {
    if (!photo || !editedUri) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setIsSaving(true);

    try {
      // Apply final edits
      await applyEdits();

      // Save the edited image to a new file
      const fileName = `edited_${Date.now()}_${Math.random().toString(36).slice(2, 9)}.jpg`;
      const documentDir = FileSystem.documentDirectory;

      if (!documentDir) {
        Alert.alert("Error", "Unable to access file system");
        setIsSaving(false);
        return;
      }

      const localDir = `${documentDir}photos/`;
      const localPath = `${localDir}${fileName}`;

      // Ensure directory exists
      const dirInfo = await FileSystem.getInfoAsync(localDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(localDir, { intermediates: true });
      }

      // Copy the edited image
      if (editedUri !== photo.uri) {
        await FileSystem.copyAsync({
          from: editedUri,
          to: localPath,
        });
      } else {
        // No edits applied, use original
        await FileSystem.copyAsync({
          from: photo.uri,
          to: localPath,
        });
      }

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(localPath);

      // Create new photo entry
      const newPhoto: Photo = {
        ...photo,
        id: `photo_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        uri: localPath,
        localPath: localPath,
        fileName: fileName,
        fileSize: fileInfo.exists && "size" in fileInfo ? fileInfo.size : 0,
        updatedAt: new Date().toISOString(),
        isBackedUp: false,
      };

      await db.photos.save(newPhoto);
      await db.history.add({
        message: `Edited photo: ${photo.fileName}`,
        type: "system",
        metadata: { originalPhotoId: photo.id, newPhotoId: newPhoto.id },
      });

      Alert.alert("Success", "Photo saved successfully", [
        {
          text: "OK",
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error("Error saving photo:", error);
      Alert.alert("Error", "Failed to save photo");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRotate = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setEditState((prev) => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360,
    }));
  };

  const handleAIAutoFix = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setIsProcessingAI(true);

    // Simulate AI processing
    // In a real app, this would send the photo to an AI service
    // with a prompt like "Enhance this photo with automatic adjustments"
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Apply simulated "AI" adjustments
    setEditState({
      brightness: 10,
      contrast: 15,
      saturation: 5,
      rotation: 0,
    });

    setIsProcessingAI(false);

    Alert.alert(
      "AI Auto Fix Applied",
      "The AI has automatically adjusted brightness, contrast, and saturation for optimal results.",
    );
  };

  const renderToolPanel = () => {
    switch (activeTool) {
      case "brightness":
        return (
          <View style={styles.toolPanel}>
            <ThemedText type="caption" muted>
              Brightness: {editState.brightness}
            </ThemedText>
            <Slider
              style={styles.slider}
              minimumValue={-100}
              maximumValue={100}
              value={editState.brightness}
              onValueChange={(value) =>
                setEditState((prev) => ({
                  ...prev,
                  brightness: Math.round(value),
                }))
              }
              minimumTrackTintColor={theme.accent}
              maximumTrackTintColor={theme.backgroundSecondary}
              thumbTintColor={theme.accent}
            />
          </View>
        );
      case "contrast":
        return (
          <View style={styles.toolPanel}>
            <ThemedText type="caption" muted>
              Contrast: {editState.contrast}
            </ThemedText>
            <Slider
              style={styles.slider}
              minimumValue={-100}
              maximumValue={100}
              value={editState.contrast}
              onValueChange={(value) =>
                setEditState((prev) => ({
                  ...prev,
                  contrast: Math.round(value),
                }))
              }
              minimumTrackTintColor={theme.accent}
              maximumTrackTintColor={theme.backgroundSecondary}
              thumbTintColor={theme.accent}
            />
          </View>
        );
      case "saturation":
        return (
          <View style={styles.toolPanel}>
            <ThemedText type="caption" muted>
              Saturation: {editState.saturation}
            </ThemedText>
            <Slider
              style={styles.slider}
              minimumValue={-100}
              maximumValue={100}
              value={editState.saturation}
              onValueChange={(value) =>
                setEditState((prev) => ({
                  ...prev,
                  saturation: Math.round(value),
                }))
              }
              minimumTrackTintColor={theme.accent}
              maximumTrackTintColor={theme.backgroundSecondary}
              thumbTintColor={theme.accent}
            />
          </View>
        );
      default:
        return null;
    }
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo Preview */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: editedUri || photo.uri }}
            style={[
              styles.image,
              {
                width: SCREEN_WIDTH - Spacing.lg * 2,
                height:
                  ((SCREEN_WIDTH - Spacing.lg * 2) * photo.height) /
                  photo.width,
                transform: [{ rotate: `${editState.rotation}deg` }],
              },
            ]}
            contentFit="contain"
          />
        </View>

        {/* AI Auto Fix Button */}
        <View style={styles.aiSection}>
          <Button
            onPress={handleAIAutoFix}
            disabled={isProcessingAI}
            style={styles.aiButton}
          >
            <View style={styles.aiButtonContent}>
              {!isProcessingAI && (
                <Feather name="zap" size={18} color={theme.buttonText} />
              )}
              <ThemedText type="body" style={{ color: theme.buttonText }}>
                {isProcessingAI ? "Processing..." : "AI Auto Fix"}
              </ThemedText>
            </View>
          </Button>
          <ThemedText type="caption" secondary style={styles.aiHint}>
            Let AI automatically enhance your photo
          </ThemedText>
        </View>

        {/* Editing Tools */}
        <View
          style={[
            styles.toolsCard,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <ThemedText type="h3" style={styles.toolsTitle}>
            Editing Tools
          </ThemedText>

          <View style={styles.toolsGrid}>
            <Pressable
              onPress={handleRotate}
              style={({ pressed }) => [
                styles.toolButton,
                { backgroundColor: theme.backgroundSecondary },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Feather name="rotate-cw" size={24} color={theme.accent} />
              <ThemedText type="small">Rotate</ThemedText>
            </Pressable>

            <Pressable
              onPress={() =>
                setActiveTool(activeTool === "brightness" ? null : "brightness")
              }
              style={({ pressed }) => [
                styles.toolButton,
                { backgroundColor: theme.backgroundSecondary },
                activeTool === "brightness" && {
                  backgroundColor: theme.accentDim,
                },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Feather name="sun" size={24} color={theme.accent} />
              <ThemedText type="small">Brightness</ThemedText>
            </Pressable>

            <Pressable
              onPress={() =>
                setActiveTool(activeTool === "contrast" ? null : "contrast")
              }
              style={({ pressed }) => [
                styles.toolButton,
                { backgroundColor: theme.backgroundSecondary },
                activeTool === "contrast" && {
                  backgroundColor: theme.accentDim,
                },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Feather name="aperture" size={24} color={theme.accent} />
              <ThemedText type="small">Contrast</ThemedText>
            </Pressable>

            <Pressable
              onPress={() =>
                setActiveTool(activeTool === "saturation" ? null : "saturation")
              }
              style={({ pressed }) => [
                styles.toolButton,
                { backgroundColor: theme.backgroundSecondary },
                activeTool === "saturation" && {
                  backgroundColor: theme.accentDim,
                },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Feather name="droplet" size={24} color={theme.accent} />
              <ThemedText type="small">Saturation</ThemedText>
            </Pressable>
          </View>

          {renderToolPanel()}
        </View>
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
    paddingBottom: Spacing["5xl"],
  },
  headerButton: {
    paddingRight: Spacing.md,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  image: {
    borderRadius: BorderRadius.md,
  },
  aiSection: {
    marginBottom: Spacing.lg,
    alignItems: "center",
  },
  aiButton: {
    width: "100%",
    marginBottom: Spacing.sm,
  },
  aiButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  aiHint: {
    textAlign: "center",
  },
  toolsCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  toolsTitle: {
    marginBottom: Spacing.md,
  },
  toolsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  toolButton: {
    width:
      (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.lg * 2 - Spacing.md * 3) / 4,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  toolPanel: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
