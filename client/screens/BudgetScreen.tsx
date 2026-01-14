import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
  Alert,
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
import { Budget, BudgetCategory, BudgetLineItem } from "@/models/types";
import { generateId } from "@/utils/helpers";
import { BottomNav } from "@/components/BottomNav";
import AIAssistSheet from "@/components/AIAssistSheet";
import { HeaderLeftNav, HeaderRightNav } from "@/components/HeaderNav";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

export default function BudgetScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [budget, setBudget] = useState<Budget | null>(null);
  const [showAISheet, setShowAISheet] = useState(false);
  const [editingCell, setEditingCell] = useState<{
    categoryId: string;
    lineItemId: string;
    field: "budgeted" | "actual";
    value: string;
  } | null>(null);

  const loadBudget = useCallback(async () => {
    let data = await db.budgets.getCurrent();
    if (!data) {
      // If no current budget exists, get the most recent one
      const allBudgets = await db.budgets.getAll();
      if (allBudgets.length > 0) {
        data = allBudgets[allBudgets.length - 1];
      }
    }
    if (data) {
      setBudget(data);
    }
  }, []);

  useEffect(() => {
    loadBudget();
  }, [loadBudget]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadBudget);
    return unsubscribe;
  }, [navigation, loadBudget]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderLeftNav />,
      headerRight: () => <HeaderRightNav />,
    });
  }, [navigation]);

  const saveBudget = async (updatedBudget: Budget) => {
    const now = new Date().toISOString();
    const budgetToSave = {
      ...updatedBudget,
      updatedAt: now,
    };
    await db.budgets.save(budgetToSave);
    setBudget(budgetToSave);
  };

  const toggleCategory = (categoryId: string) => {
    if (!budget) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const updatedCategories = budget.categories.map((cat) =>
      cat.id === categoryId ? { ...cat, isExpanded: !cat.isExpanded } : cat,
    );
    saveBudget({ ...budget, categories: updatedCategories });
  };

  const updateLineItem = (
    categoryId: string,
    lineItemId: string,
    field: "budgeted" | "actual",
    value: string,
  ) => {
    if (!budget) return;

    // Validate that the entire string is a valid number
    const trimmedValue = value.trim();
    if (trimmedValue === "") {
      // Allow empty string to be treated as 0
      const updatedCategories = budget.categories.map((cat) => {
        if (cat.id === categoryId) {
          const updatedLineItems = cat.lineItems.map((item) =>
            item.id === lineItemId ? { ...item, [field]: 0 } : item,
          );
          return { ...cat, lineItems: updatedLineItems };
        }
        return cat;
      });
      saveBudget({ ...budget, categories: updatedCategories });
      return;
    }

    const numValue = parseFloat(trimmedValue);
    // Check if the entire input is a valid number by comparing string representations
    if (Number.isNaN(numValue) || numValue.toString() !== parseFloat(trimmedValue).toString()) {
      return; // Don't update if invalid number or partial number like "123abc"
    }

    const updatedCategories = budget.categories.map((cat) => {
      if (cat.id === categoryId) {
        const updatedLineItems = cat.lineItems.map((item) =>
          item.id === lineItemId ? { ...item, [field]: numValue } : item,
        );
        return { ...cat, lineItems: updatedLineItems };
      }
      return cat;
    });
    saveBudget({ ...budget, categories: updatedCategories });
  };

  const addCategory = () => {
    if (!budget) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const newCategory: BudgetCategory = {
      id: generateId(),
      name: "New Category",
      lineItems: [
        {
          id: generateId(),
          name: "New Line Item",
          budgeted: 0,
          actual: 0,
        },
      ],
      isExpanded: true,
    };

    saveBudget({
      ...budget,
      categories: [...budget.categories, newCategory],
    });
  };

  const deleteCategory = (categoryId: string) => {
    if (!budget) return;

    const confirmDelete = () => {
      const updatedCategories = budget.categories.filter(
        (cat) => cat.id !== categoryId,
      );
      saveBudget({ ...budget, categories: updatedCategories });
    };

    if (Platform.OS === "web") {
      if (confirm("Are you sure you want to delete this category?")) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        "Delete Category",
        "Are you sure you want to delete this category?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: confirmDelete,
          },
        ],
      );
    }
  };

  const updateCategoryName = (categoryId: string, name: string) => {
    if (!budget) return;

    const updatedCategories = budget.categories.map((cat) =>
      cat.id === categoryId ? { ...cat, name } : cat,
    );
    saveBudget({ ...budget, categories: updatedCategories });
  };

  const addLineItem = (categoryId: string) => {
    if (!budget) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const newLineItem: BudgetLineItem = {
      id: generateId(),
      name: "New Line Item",
      budgeted: 0,
      actual: 0,
    };

    const updatedCategories = budget.categories.map((cat) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          lineItems: [...cat.lineItems, newLineItem],
        };
      }
      return cat;
    });

    saveBudget({ ...budget, categories: updatedCategories });
  };

  const deleteLineItem = (categoryId: string, lineItemId: string) => {
    if (!budget) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const updatedCategories = budget.categories.map((cat) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          lineItems: cat.lineItems.filter((item) => item.id !== lineItemId),
        };
      }
      return cat;
    });

    saveBudget({ ...budget, categories: updatedCategories });
  };

  const updateLineItemName = (
    categoryId: string,
    lineItemId: string,
    name: string,
  ) => {
    if (!budget) return;

    const updatedCategories = budget.categories.map((cat) => {
      if (cat.id === categoryId) {
        const updatedLineItems = cat.lineItems.map((item) =>
          item.id === lineItemId ? { ...item, name } : item,
        );
        return { ...cat, lineItems: updatedLineItems };
      }
      return cat;
    });

    saveBudget({ ...budget, categories: updatedCategories });
  };

  const calculateTotals = () => {
    if (!budget) return { totalBudgeted: 0, totalActual: 0 };

    let totalBudgeted = 0;
    let totalActual = 0;

    budget.categories.forEach((cat) => {
      cat.lineItems.forEach((item) => {
        totalBudgeted += item.budgeted;
        totalActual += item.actual;
      });
    });

    return { totalBudgeted, totalActual };
  };

  const { totalBudgeted, totalActual } = calculateTotals();
  const difference = totalBudgeted - totalActual;

  if (!budget) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Feather
            name="pie-chart"
            size={64}
            color={theme.textMuted}
            style={styles.emptyIcon}
          />
          <ThemedText type="h3" muted style={styles.emptyText}>
            No budget found
          </ThemedText>
          <ThemedText type="body" muted style={styles.emptySubtext}>
            Create a budget to get started
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
      >
        <View style={styles.header}>
          <ThemedText type="h2">{budget.name}</ThemedText>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <ThemedText type="body" muted>
                Budgeted:
              </ThemedText>
              <ThemedText type="h3" style={{ color: theme.accent }}>
                ${totalBudgeted.toFixed(2)}
              </ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText type="body" muted>
                Actual:
              </ThemedText>
              <ThemedText type="h3">${totalActual.toFixed(2)}</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText type="body" muted>
                Difference:
              </ThemedText>
              <ThemedText
                type="h3"
                style={{
                  color: difference >= 0 ? theme.accent : theme.error,
                }}
              >
                ${Math.abs(difference).toFixed(2)}{" "}
                {difference >= 0 ? "under" : "over"}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <ThemedText type="small" style={styles.headerName}>
            Category / Line Item
          </ThemedText>
          <ThemedText type="small" style={styles.headerAmount}>
            Budgeted
          </ThemedText>
          <ThemedText type="small" style={styles.headerAmount}>
            Actual
          </ThemedText>
        </View>

        {budget.categories.map((category, catIndex) => (
          <Animated.View
            key={category.id}
            entering={FadeInDown.delay(catIndex * 50).springify()}
          >
            <View
              style={[
                styles.categoryCard,
                { backgroundColor: theme.backgroundDefault },
              ]}
            >
              <Pressable
                style={styles.categoryHeader}
                onPress={() => toggleCategory(category.id)}
              >
                <View style={styles.categoryHeaderLeft}>
                  <Feather
                    name={category.isExpanded ? "chevron-down" : "chevron-right"}
                    size={20}
                    color={theme.text}
                  />
                  <TextInput
                    style={[styles.categoryNameInput, { color: theme.text }]}
                    value={category.name}
                    onChangeText={(text) =>
                      updateCategoryName(category.id, text)
                    }
                    onFocus={() => {
                      if (Platform.OS !== "web") {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                    }}
                  />
                </View>
                <View style={styles.categoryActions}>
                  <Pressable
                    onPress={() => addLineItem(category.id)}
                    style={({ pressed }) => [
                      styles.iconButton,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Feather name="plus" size={18} color={theme.accent} />
                  </Pressable>
                  <Pressable
                    onPress={() => deleteCategory(category.id)}
                    style={({ pressed }) => [
                      styles.iconButton,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Feather name="trash-2" size={18} color={theme.error} />
                  </Pressable>
                </View>
              </Pressable>

              {category.isExpanded &&
                category.lineItems.map((lineItem) => (
                  <View key={lineItem.id} style={styles.lineItemRow}>
                    <TextInput
                      style={[styles.lineItemName, { color: theme.text }]}
                      value={lineItem.name}
                      onChangeText={(text) =>
                        updateLineItemName(category.id, lineItem.id, text)
                      }
                      onFocus={() => {
                        if (Platform.OS !== "web") {
                          Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Light,
                          );
                        }
                      }}
                    />
                    <TextInput
                      style={[
                        styles.amountInput,
                        {
                          color: theme.text,
                          backgroundColor: theme.background,
                        },
                      ]}
                      value={
                        editingCell?.categoryId === category.id &&
                        editingCell?.lineItemId === lineItem.id &&
                        editingCell?.field === "budgeted"
                          ? editingCell.value
                          : lineItem.budgeted.toString()
                      }
                      onChangeText={(text) => {
                        setEditingCell({
                          categoryId: category.id,
                          lineItemId: lineItem.id,
                          field: "budgeted",
                          value: text,
                        });
                      }}
                      keyboardType="numeric"
                      onFocus={() => {
                        setEditingCell({
                          categoryId: category.id,
                          lineItemId: lineItem.id,
                          field: "budgeted",
                          value: lineItem.budgeted.toString(),
                        });
                        if (Platform.OS !== "web") {
                          Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Light,
                          );
                        }
                      }}
                      onBlur={() => {
                        if (editingCell) {
                          updateLineItem(
                            editingCell.categoryId,
                            editingCell.lineItemId,
                            editingCell.field,
                            editingCell.value,
                          );
                        }
                        setEditingCell(null);
                      }}
                    />
                    <TextInput
                      style={[
                        styles.amountInput,
                        {
                          color: theme.text,
                          backgroundColor: theme.background,
                        },
                      ]}
                      value={
                        editingCell?.categoryId === category.id &&
                        editingCell?.lineItemId === lineItem.id &&
                        editingCell?.field === "actual"
                          ? editingCell.value
                          : lineItem.actual.toString()
                      }
                      onChangeText={(text) => {
                        setEditingCell({
                          categoryId: category.id,
                          lineItemId: lineItem.id,
                          field: "actual",
                          value: text,
                        });
                      }}
                      keyboardType="numeric"
                      onFocus={() => {
                        setEditingCell({
                          categoryId: category.id,
                          lineItemId: lineItem.id,
                          field: "actual",
                          value: lineItem.actual.toString(),
                        });
                        if (Platform.OS !== "web") {
                          Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Light,
                          );
                        }
                      }}
                      onBlur={() => {
                        if (editingCell) {
                          updateLineItem(
                            editingCell.categoryId,
                            editingCell.lineItemId,
                            editingCell.field,
                            editingCell.value,
                          );
                        }
                        setEditingCell(null);
                      }}
                    />
                    <Pressable
                      onPress={() => deleteLineItem(category.id, lineItem.id)}
                      style={({ pressed }) => [
                        styles.deleteLineItem,
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <Feather name="x" size={16} color={theme.textMuted} />
                    </Pressable>
                  </View>
                ))}
            </View>
          </Animated.View>
        ))}

        <Pressable
          style={({ pressed }) => [
            styles.addCategoryButton,
            { backgroundColor: theme.backgroundDefault },
            pressed && { opacity: 0.8 },
          ]}
          onPress={addCategory}
        >
          <Feather name="plus" size={20} color={theme.accent} />
          <ThemedText type="body" style={{ color: theme.accent }}>
            Add Category
          </ThemedText>
        </Pressable>
      </ScrollView>

      <BottomNav onAiPress={() => setShowAISheet(true)} />

      <AIAssistSheet
        visible={showAISheet}
        onClose={() => setShowAISheet(false)}
        context="budget"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing["2xl"],
  },
  emptyIcon: {
    marginBottom: Spacing.lg,
  },
  emptyText: {
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    textAlign: "center",
  },
  header: {
    marginBottom: Spacing.xl,
  },
  summaryContainer: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  headerName: {
    flex: 1,
    fontWeight: "600",
  },
  headerAmount: {
    width: 80,
    textAlign: "right",
    fontWeight: "600",
  },
  categoryCard: {
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    overflow: "hidden",
    ...Shadows.sm,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
  },
  categoryHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: Spacing.sm,
  },
  categoryNameInput: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    padding: 0,
  },
  categoryActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  iconButton: {
    padding: Spacing.xs,
  },
  lineItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  lineItemName: {
    flex: 1,
    fontSize: 14,
    paddingLeft: 28,
    padding: 0,
  },
  amountInput: {
    width: 80,
    textAlign: "right",
    fontSize: 14,
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  deleteLineItem: {
    padding: Spacing.xs,
  },
  addCategoryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
});
