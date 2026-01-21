import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
  Alert,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { db } from "@/storage/database";
import { List, ListItem, ListCategory, ListItemPriority } from "@/models/types";
import { generateId } from "@/utils/helpers";
import { validateListDraft } from "@/utils/listValidation";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type ListEditorRouteProp = RouteProp<AppStackParamList, "ListEditor">;

const PRIORITY_OPTIONS: {
  value: ListItemPriority;
  label: string;
  color: string;
}[] = [
  { value: "none", label: "None", color: "#666" },
  { value: "low", label: "Low", color: "#FFB800" },
  { value: "medium", label: "Medium", color: "#00D9FF" },
  { value: "high", label: "High", color: "#FF3B5C" },
];

const CATEGORY_OPTIONS: { value: ListCategory; label: string; icon: string }[] =
  [
    { value: "general", label: "General", icon: "list" },
    { value: "grocery", label: "Grocery", icon: "shopping-cart" },
    { value: "shopping", label: "Shopping", icon: "shopping-bag" },
    { value: "travel", label: "Travel", icon: "map" },
    { value: "work", label: "Work", icon: "briefcase" },
    { value: "home", label: "Home", icon: "home" },
    { value: "personal", label: "Personal", icon: "user" },
  ];

const COLOR_OPTIONS = [
  "#00D9FF", // Electric Blue
  "#00FF94", // Success Green
  "#FFB800", // Warning Yellow
  "#FF3B5C", // Error Red
  "#9D4EDD", // Purple
  "#06FFA5", // Mint
  "#FF006E", // Pink
  "#8338EC", // Violet
];

export default function ListEditorScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ListEditorRouteProp>();

  const [list, setList] = useState<List | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ListCategory>("general");
  const [color, setColor] = useState<string>("#00D9FF");
  const [items, setItems] = useState<ListItem[]>([]);
  const [newItemText, setNewItemText] = useState("");
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingItemNotes, setEditingItemNotes] = useState("");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const listId = route.params?.listId;
  const isNewList = !listId;

  useEffect(() => {
    if (!listId) {
      return;
    }

    const loadList = async () => {
      try {
        const data = await db.lists.get(listId);
        if (!data) {
          Alert.alert("List Not Found", "This list could not be loaded.");
          return;
        }

        setList(data);
        setTitle(data.title);
        setCategory(data.category || "general");
        setColor(data.color || "#00D9FF");
        setItems(data.items);
        await db.lists.updateLastOpened(listId);
      } catch (error) {
        console.error("Failed to load list.", error);
        Alert.alert(
          "List Load Error",
          "We couldn't load this list. Please try again.",
        );
      }
    };

    loadList();
  }, [listId]);

  const buildListPayload = useCallback(
    (timestamp: string): List => ({
      id: list?.id || generateId(),
      title: title.trim(),
      category,
      color,
      items,
      isArchived: list?.isArchived,
      isTemplate: list?.isTemplate,
      createdAt: list?.createdAt || timestamp,
      lastOpenedAt: timestamp,
      updatedAt: timestamp,
    }),
    [
      category,
      color,
      items,
      list?.createdAt,
      list?.id,
      list?.isArchived,
      list?.isTemplate,
      title,
    ],
  );

  const formatValidationMessage = useCallback(
    (messages: string[]): string =>
      messages.map((message, index) => `${index + 1}. ${message}`).join("\n"),
    [],
  );

  const persistList = useCallback(async () => {
    const timestamp = new Date().toISOString();
    const listData = buildListPayload(timestamp);

    try {
      await db.lists.save(listData);
      navigation.goBack();
    } catch (error) {
      console.error("Failed to save list.", error);
      Alert.alert(
        "Save Failed",
        "We couldn't save this list. Please try again.",
      );
    }
  }, [buildListPayload, navigation]);

  const confirmSaveWithWarnings = useCallback(
    (warnings: string[]) => {
      const warningMessage = formatValidationMessage(warnings);

      if (Platform.OS === "web") {
        if (confirm(`Review List Warnings:\n\n${warningMessage}`)) {
          void persistList();
        }
        return;
      }

      Alert.alert("Review List Warnings", warningMessage, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save Anyway",
          style: "default",
          onPress: () => {
            void persistList();
          },
        },
      ]);
    },
    [formatValidationMessage, persistList],
  );

  const handleSave = useCallback(() => {
    const validation = validateListDraft({ title, items });

    if (validation.errors.length > 0) {
      Alert.alert(
        "Fix List Details",
        formatValidationMessage(validation.errors),
      );
      return;
    }

    if (validation.warnings.length > 0) {
      confirmSaveWithWarnings(validation.warnings);
      return;
    }

    void persistList();
  }, [
    confirmSaveWithWarnings,
    formatValidationMessage,
    items,
    persistList,
    title,
  ]);

  const handleDelete = useCallback(() => {
    if (!listId) {
      return;
    }

    const deleteList = async () => {
      try {
        await db.lists.delete(listId);
        navigation.goBack();
      } catch (error) {
        console.error("Failed to delete list.", error);
        Alert.alert(
          "Delete Failed",
          "We couldn't delete this list. Please try again.",
        );
      }
    };

    if (Platform.OS === "web") {
      if (confirm("Are you sure you want to delete this list?")) {
        void deleteList();
      }
      return;
    }

    Alert.alert("Delete List", "Are you sure you want to delete this list?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void deleteList();
        },
      },
    ]);
  }, [listId, navigation]);

  const toggleItem = (itemId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isChecked: !item.isChecked } : item,
      ),
    );
  };

  const addItem = () => {
    if (!newItemText.trim()) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const newItem: ListItem = {
      id: generateId(),
      text: newItemText.trim(),
      isChecked: false,
      priority: "none",
    };

    setItems((prev) => [...prev, newItem]);
    setNewItemText("");
  };

  const setPriority = (itemId: string, priority: ListItemPriority) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, priority } : item)),
    );
  };

  const setItemNotes = (itemId: string, notes: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, notes: notes || undefined } : item,
      ),
    );
  };

  const deleteItem = (itemId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [
              styles.headerButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Feather name="check" size={24} color={theme.accent} />
          </Pressable>
          {!isNewList && (
            <Pressable
              onPress={handleDelete}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Feather name="trash-2" size={24} color={theme.error} />
            </Pressable>
          )}
        </View>
      ),
    });
  }, [handleDelete, handleSave, isNewList, navigation, theme.accent, theme.error]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <ThemedText type="small" style={styles.label}>
            List Title *
          </ThemedText>
          <TextInput
            style={[
              styles.titleInput,
              {
                backgroundColor: theme.backgroundDefault,
                color: theme.text,
              },
            ]}
            placeholder="Enter list title..."
            placeholderTextColor={theme.textMuted}
            value={title}
            onChangeText={setTitle}
            autoFocus={isNewList}
          />
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <ThemedText type="small" style={styles.label}>
            Category
          </ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.optionsScroll}
          >
            {CATEGORY_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setCategory(option.value);
                }}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor:
                      category === option.value
                        ? theme.accent
                        : theme.backgroundDefault,
                  },
                ]}
              >
                <Feather
                  name={option.icon as any}
                  size={16}
                  color={
                    category === option.value
                      ? theme.buttonText
                      : theme.textSecondary
                  }
                />
                <ThemedText
                  type="small"
                  style={{
                    color:
                      category === option.value
                        ? theme.buttonText
                        : theme.textSecondary,
                  }}
                >
                  {option.label}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Color Selection */}
        <View style={styles.section}>
          <ThemedText type="small" style={styles.label}>
            Color Theme
          </ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.optionsScroll}
          >
            {COLOR_OPTIONS.map((colorOption) => (
              <Pressable
                key={colorOption}
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setColor(colorOption);
                }}
                style={[
                  styles.colorButton,
                  {
                    backgroundColor: colorOption,
                    borderWidth: color === colorOption ? 3 : 0,
                    borderColor: theme.text,
                  },
                ]}
              >
                {color === colorOption && (
                  <Feather name="check" size={16} color="#FFF" />
                )}
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <ThemedText type="small" style={styles.label}>
            Items
          </ThemedText>

          {items.map((item) => (
            <View
              key={item.id}
              style={[
                styles.itemRow,
                { backgroundColor: theme.backgroundDefault },
              ]}
            >
              <View style={styles.itemContent}>
                <View style={styles.itemTopRow}>
                  <Pressable
                    onPress={() => toggleItem(item.id)}
                    style={styles.checkboxContainer}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: item.isChecked
                            ? theme.accent
                            : theme.border,
                          backgroundColor: item.isChecked
                            ? theme.accent
                            : "transparent",
                        },
                      ]}
                    >
                      {item.isChecked && (
                        <Feather
                          name="check"
                          size={16}
                          color={theme.backgroundRoot}
                        />
                      )}
                    </View>
                  </Pressable>

                  <View style={styles.itemTextContainer}>
                    <ThemedText
                      type="body"
                      style={[
                        styles.itemText,
                        item.isChecked && styles.itemTextChecked,
                      ]}
                    >
                      {item.text}
                    </ThemedText>
                    {item.notes && (
                      <ThemedText type="small" muted style={styles.itemNotes}>
                        {item.notes}
                      </ThemedText>
                    )}
                  </View>

                  {item.priority && item.priority !== "none" && (
                    <View
                      style={[
                        styles.priorityBadge,
                        {
                          backgroundColor:
                            PRIORITY_OPTIONS.find(
                              (p) => p.value === item.priority,
                            )?.color || theme.textMuted,
                        },
                      ]}
                    >
                      <ThemedText
                        type="small"
                        style={{ color: "#FFF", fontSize: 10 }}
                      >
                        {item.priority.toUpperCase()}
                      </ThemedText>
                    </View>
                  )}

                  <Pressable
                    onPress={() => deleteItem(item.id)}
                    style={styles.deleteButton}
                  >
                    <Feather name="x" size={20} color={theme.textMuted} />
                  </Pressable>
                </View>

                {/* Item Actions */}
                <View style={styles.itemActions}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {PRIORITY_OPTIONS.map((priorityOption) => (
                      <Pressable
                        key={priorityOption.value}
                        onPress={() =>
                          setPriority(item.id, priorityOption.value)
                        }
                        style={[
                          styles.priorityButton,
                          {
                            backgroundColor:
                              item.priority === priorityOption.value
                                ? priorityOption.color
                                : theme.backgroundSecondary,
                          },
                        ]}
                      >
                        <ThemedText
                          type="small"
                          style={{
                            color:
                              item.priority === priorityOption.value
                                ? "#FFF"
                                : theme.textSecondary,
                            fontSize: 10,
                          }}
                        >
                          {priorityOption.label}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </ScrollView>

                  <Pressable
                    onPress={() => {
                      setEditingItem(item.id);
                      setEditingItemNotes(item.notes || "");
                    }}
                    style={styles.notesButton}
                  >
                    <Feather
                      name="file-text"
                      size={14}
                      color={item.notes ? theme.accent : theme.textMuted}
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          ))}

          <View
            style={[
              styles.addItemRow,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View style={styles.checkboxContainer}>
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: theme.border,
                    backgroundColor: "transparent",
                  },
                ]}
              />
            </View>
            <TextInput
              style={[
                styles.addItemInput,
                {
                  color: theme.text,
                },
              ]}
              placeholder="Add new item..."
              placeholderTextColor={theme.textMuted}
              value={newItemText}
              onChangeText={setNewItemText}
              onSubmitEditing={addItem}
              returnKeyType="done"
            />
            {newItemText.trim().length > 0 && (
              <Pressable onPress={addItem} style={styles.addButton}>
                <Feather name="plus-circle" size={24} color={theme.accent} />
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Notes Editor Modal */}
      <Modal
        visible={editingItem !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setEditingItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.backgroundRoot },
            ]}
          >
            <View style={styles.modalHeader}>
              <ThemedText type="h3">Item Notes</ThemedText>
              <Pressable onPress={() => setEditingItem(null)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <TextInput
              style={[
                styles.notesInput,
                {
                  backgroundColor: theme.backgroundDefault,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="Add notes for this item..."
              placeholderTextColor={theme.textMuted}
              value={editingItemNotes}
              onChangeText={setEditingItemNotes}
              multiline
              numberOfLines={4}
              autoFocus
            />

            <Pressable
              onPress={() => {
                if (editingItem) {
                  setItemNotes(editingItem, editingItemNotes);
                  setEditingItem(null);
                  setEditingItemNotes("");
                }
              }}
              style={[
                styles.saveNotesButton,
                { backgroundColor: theme.accent },
              ]}
            >
              <ThemedText type="body" style={{ color: theme.buttonText }}>
                Save Notes
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  headerButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  headerButton: {
    padding: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  label: {
    marginBottom: Spacing.sm,
  },
  titleInput: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    fontSize: 16,
    ...Shadows.card,
  },
  optionsScroll: {
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
    ...Shadows.card,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.card,
  },
  itemRow: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    ...Shadows.card,
  },
  itemContent: {
    flex: 1,
  },
  itemTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  checkboxContainer: {
    marginRight: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  itemTextContainer: {
    flex: 1,
  },
  itemText: {
    flex: 1,
  },
  itemTextChecked: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  itemNotes: {
    marginTop: Spacing.xs,
    fontSize: 12,
  },
  priorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  deleteButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 36,
    gap: Spacing.sm,
  },
  priorityButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.xs,
  },
  notesButton: {
    padding: Spacing.xs,
  },
  addItemRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadows.card,
  },
  addItemInput: {
    flex: 1,
    fontSize: 16,
  },
  addButton: {
    marginLeft: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    padding: Spacing.xl,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: "top",
    marginBottom: Spacing.lg,
  },
  saveNotesButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
});
