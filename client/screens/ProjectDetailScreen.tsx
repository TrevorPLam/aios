import React, { useState, useEffect, useCallback } from "react";
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
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { db } from "@/storage/database";
import { Project } from "@/models/types";
import { generateId } from "@/utils/helpers";

type RouteProps = RouteProp<AppStackParamList, "ProjectDetail">;

export default function ProjectDetailScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isNew, setIsNew] = useState(true);
  const [projectId, setProjectId] = useState<string>("");

  useEffect(() => {
    async function loadData() {
      if (route.params?.projectId) {
        const project = await db.projects.get(route.params.projectId);
        if (project) {
          setName(project.name);
          setDescription(project.description);
          setProjectId(project.id);
          setIsNew(false);
        }
      } else {
        setProjectId(generateId());
        setIsNew(true);
      }
    }
    loadData();
  }, [route.params?.projectId]);

  const saveProject = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a project name");
      return;
    }

    const project: Project = {
      id: projectId,
      name: name.trim(),
      description,
      taskIds: [],
      createdAt: isNew
        ? new Date().toISOString()
        : (await db.projects.get(projectId))?.createdAt ||
          new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.projects.save(project);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    navigation.goBack();
  }, [projectId, name, description, isNew, navigation]);

  const handleDelete = useCallback(async () => {
    Alert.alert(
      "Delete Project",
      "Are you sure you want to delete this project?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await db.projects.delete(projectId);
            navigation.goBack();
          },
        },
      ],
    );
  }, [projectId, navigation]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerActions}>
          {!isNew && (
            <Pressable
              onPress={handleDelete}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Feather name="trash-2" size={20} color={theme.error} />
            </Pressable>
          )}
        </View>
      ),
    });
  }, [navigation, theme, isNew, handleDelete]);

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
        <View
          style={[styles.iconContainer, { backgroundColor: theme.accentDim }]}
        >
          <Feather name="folder" size={40} color={theme.accent} />
        </View>

        <ThemedText type="caption" secondary style={styles.label}>
          Project Name
        </ThemedText>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter project name"
          placeholderTextColor={theme.textMuted}
          style={[
            styles.input,
            { color: theme.text, backgroundColor: theme.backgroundDefault },
          ]}
        />

        <ThemedText type="caption" secondary style={styles.label}>
          Description
        </ThemedText>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Add a description..."
          placeholderTextColor={theme.textMuted}
          style={[
            styles.textArea,
            { color: theme.text, backgroundColor: theme.backgroundDefault },
          ]}
          multiline
          textAlignVertical="top"
        />

        <Button onPress={saveProject} style={styles.saveButton}>
          {isNew ? "Create Project" : "Save Changes"}
        </Button>
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
  },
  headerActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  headerButton: {
    padding: Spacing.xs,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: Spacing.xl,
  },
  label: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  input: {
    fontSize: 16,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  textArea: {
    fontSize: 16,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    minHeight: 120,
  },
  saveButton: {
    marginTop: Spacing.xl,
  },
});
