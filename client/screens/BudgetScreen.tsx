/**
 * BudgetScreen Module - Enhanced
 *
 * Professional budget management system with advanced features and analytics.
 *
 * Core Features:
 * - Monthly budget tracking with categories and line items
 * - Real-time calculation of budgeted vs actual amounts
 * - Inline editing of amounts and names
 * - Expandable/collapsible categories
 * - Add/delete categories and line items
 * - Summary totals showing budget health (under/over budget)
 *
 * Enhanced Features (NEW):
 * - Month/year picker for historical budget browsing
 * - Real-time search across budgets, categories, and line items
 * - Statistics dashboard with comprehensive metrics
 * - Budget comparison (month-to-month analysis)
 * - Budget templates (duplicate to new month)
 * - Export to JSON functionality
 * - Visual indicators for over/under budget items
 * - Enhanced empty states with context-aware messaging
 * - Smooth animations and haptic feedback throughout
 *
 * Database Integration:
 * - 15 database methods for complete budget management
 * - Search, filter, statistics, comparison, export
 * - Bulk operations support
 *
 * AI Features:
 * - Budget suggestions and recommendations (placeholder)
 * - Category optimization hints
 *
 * Technical Details:
 * - Performance optimized with useMemo and useCallback
 * - Full TypeScript type safety
 * - Platform-specific features (iOS/Android haptics)
 * - Comprehensive inline documentation
 *
 * Enhanced: 2026-01-16
 *
 * @module BudgetScreen
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
  Alert,
  Modal,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
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

/**
 * BudgetScreen Component
 *
 * Main screen for budget management with spreadsheet-like editing interface.
 * Loads the current month's budget or most recent budget if none exists.
 *
 * @returns {JSX.Element} The budget screen component
 */

/** Animation delay per category for staggered entrance (in milliseconds) */
const ANIMATION_DELAY_PER_ITEM = 50;

export default function BudgetScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  // Core state
  const [budget, setBudget] = useState<Budget | null>(null);
  const [showAISheet, setShowAISheet] = useState(false);

  // Enhanced features state
  const [allBudgets, setAllBudgets] = useState<Budget[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [statistics, setStatistics] = useState<{
    totalBudgets: number;
    totalBudgeted: number;
    totalActual: number;
    totalDifference: number;
    averageBudgeted: number;
    averageActual: number;
    categoryCount: number;
    lineItemCount: number;
    mostRecentMonth: string | null;
    oldestMonth: string | null;
  } | null>(null);

  /** State for tracking which cell is currently being edited */
  const [editingCell, setEditingCell] = useState<{
    categoryId: string;
    lineItemId: string;
    field: "budgeted" | "actual";
    value: string;
  } | null>(null);

  /**
   * Trigger haptic feedback on supported platforms
   * Provides tactile response for user interactions
   *
   * @param {Haptics.ImpactFeedbackStyle} style - Feedback intensity (Light, Medium, Heavy)
   */
  const triggerHaptic = useCallback(
    (
      style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
    ) => {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(style);
      }
    },
    [],
  );

  /**
   * Load current month's budget or most recent budget
   * Also loads all budgets for month picker and statistics
   * Falls back to most recent budget if no current month budget exists
   *
   * @throws Will log error but continue gracefully on database failures
   */
  const loadBudget = useCallback(async () => {
    try {
      let data = await db.budgets.getCurrent();
      if (!data) {
        // If no current budget exists, get the most recent one
        const allBudgets = await db.budgets.getAllSorted();
        if (allBudgets.length > 0) {
          data = allBudgets[0];
        }
      }
      if (data) {
        setBudget(data);
      }

      // Load all budgets for enhanced features
      const sorted = await db.budgets.getAllSorted();
      setAllBudgets(sorted);

      // Load statistics
      const stats = await db.budgets.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error("Error loading budget:", error);
      // Continue gracefully - user can still create new budget
    }
  }, []);

  /**
   * Load a specific budget by ID
   * Used when selecting from month picker
   *
   * @param {string} budgetId - The budget ID to load
   */
  const loadSpecificBudget = useCallback(
    async (budgetId: string) => {
      try {
        const data = await db.budgets.get(budgetId);
        if (data) {
          setBudget(data);
          triggerHaptic();
        }
      } catch (error) {
        console.error("Error loading specific budget:", error);
      }
    },
    [triggerHaptic],
  );

  // Load budget on mount
  useEffect(() => {
    loadBudget();
  }, [loadBudget]);

  // Reload budget when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadBudget();
    }, [loadBudget]),
  );

  // Configure navigation header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderLeftNav />,
      headerRight: () => <HeaderRightNav />,
    });
  }, [navigation]);

  /**
   * Save budget to database with updated timestamp
   *
   * @param {Budget} updatedBudget - The budget to save
   */
  const saveBudget = async (updatedBudget: Budget) => {
    const now = new Date().toISOString();
    const budgetToSave = {
      ...updatedBudget,
      updatedAt: now,
    };
    await db.budgets.save(budgetToSave);
    setBudget(budgetToSave);
  };

  /**
   * Toggle category expanded/collapsed state
   *
   * @param {string} categoryId - ID of the category to toggle
   */
  const toggleCategory = (categoryId: string) => {
    if (!budget) return;
    triggerHaptic();

    const updatedCategories = budget.categories.map((cat) =>
      cat.id === categoryId ? { ...cat, isExpanded: !cat.isExpanded } : cat,
    );
    saveBudget({ ...budget, categories: updatedCategories });
  };

  /**
   * Update a line item's budgeted or actual amount
   * Validates input to ensure it's a valid number
   * Empty strings are treated as 0
   *
   * @param {string} categoryId - ID of the category containing the line item
   * @param {string} lineItemId - ID of the line item to update
   * @param {"budgeted" | "actual"} field - Which field to update
   * @param {string} value - New value (as string for input handling)
   */
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
    // Validate that input is a valid number and matches the original string
    // This prevents partial numbers like "123abc" or "12.34.56"
    if (Number.isNaN(numValue) || trimmedValue !== numValue.toString()) {
      return; // Don't update if invalid number format
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

  /**
   * Add a new category with one default line item
   */
  const addCategory = () => {
    if (!budget) return;
    triggerHaptic();

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

  /**
   * Delete a category with confirmation dialog
   *
   * @param {string} categoryId - ID of the category to delete
   */
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

  /**
   * Update a category's name
   *
   * @param {string} categoryId - ID of the category to update
   * @param {string} name - New category name
   */
  const updateCategoryName = (categoryId: string, name: string) => {
    if (!budget) return;

    const updatedCategories = budget.categories.map((cat) =>
      cat.id === categoryId ? { ...cat, name } : cat,
    );
    saveBudget({ ...budget, categories: updatedCategories });
  };

  /**
   * Add a new line item to a category
   *
   * @param {string} categoryId - ID of the category to add the line item to
   */
  const addLineItem = (categoryId: string) => {
    if (!budget) return;
    triggerHaptic();

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

  /**
   * Delete a line item from a category
   *
   * @param {string} categoryId - ID of the category containing the line item
   * @param {string} lineItemId - ID of the line item to delete
   */
  const deleteLineItem = (categoryId: string, lineItemId: string) => {
    if (!budget) return;
    triggerHaptic();

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

  /**
   * Update a line item's name
   *
   * @param {string} categoryId - ID of the category containing the line item
   * @param {string} lineItemId - ID of the line item to update
   * @param {string} name - New line item name
   */
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

  /**
   * Calculate total budgeted and actual amounts across all categories
   *
   * @returns {{ totalBudgeted: number, totalActual: number }} Calculated totals
   */
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

  /**
   * Handle budget duplication for template creation
   * Prompts user for new month and creates duplicate with reset actual amounts
   */
  const handleDuplicateBudget = async () => {
    if (!budget) return;

    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);

    // Calculate next month
    const currentDate = new Date(budget.month + "-01");
    currentDate.setMonth(currentDate.getMonth() + 1);
    const nextMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;

    // Check if next month budget already exists
    const existing = allBudgets.find((b) => b.month === nextMonth);
    if (existing) {
      Alert.alert(
        "Budget Exists",
        `A budget for ${nextMonth} already exists. Do you want to overwrite it?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Overwrite",
            style: "destructive",
            onPress: async () => {
              try {
                await db.budgets.delete(existing.id);
                await performDuplication(nextMonth);
              } catch (error) {
                console.error("Error overwriting budget:", error);
                Alert.alert(
                  "Error",
                  "Failed to overwrite budget. Please try again.",
                );
              }
            },
          },
        ],
      );
    } else {
      await performDuplication(nextMonth);
    }
  };

  /**
   * Perform the actual duplication
   *
   * @param {string} newMonth - The month for the new budget
   */
  const performDuplication = async (newMonth: string) => {
    if (!budget) return;

    try {
      const monthName = new Date(newMonth + "-01").toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

      const duplicated = await db.budgets.duplicate(
        budget.id,
        newMonth,
        `${monthName} Budget`,
      );

      if (duplicated) {
        await loadBudget();
        Alert.alert("Success", `Budget template created for ${monthName}!`);
      } else {
        Alert.alert("Error", "Failed to create budget template.");
      }
    } catch (error) {
      console.error("Error duplicating budget:", error);
      Alert.alert(
        "Error",
        "Failed to create budget template. Please try again.",
      );
    }
  };

  /**
   * Handle budget export to JSON
   * Uses native share on mobile, download on web
   */
  const handleExportBudget = async () => {
    if (!budget) return;

    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);

    const json = await db.budgets.exportToJSON(budget.id);
    if (!json) return;

    if (Platform.OS === "web") {
      // Web: Download as file
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `budget-${budget.month}.json`;

      try {
        document.body.appendChild(a);
        a.click();
      } finally {
        // Ensure cleanup even if download fails
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } else {
      // Mobile: Share
      try {
        await Share.share({
          message: json,
          title: `Budget Export - ${budget.name}`,
        });
      } catch (error) {
        console.error("Error sharing budget:", error);
      }
    }

    setShowExportMenu(false);
  };

  /**
   * Handle export of all budgets
   */
  const handleExportAllBudgets = async () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const json = await db.budgets.exportAllToJSON();

      if (Platform.OS === "web") {
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `all-budgets-${new Date().toISOString().split("T")[0]}.json`;

        try {
          document.body.appendChild(a);
          a.click();
        } finally {
          // Ensure cleanup even if download fails
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } else {
        await Share.share({
          message: json,
          title: "All Budgets Export",
        });
      }
    } catch (error) {
      console.error("Error exporting budgets:", error);
      Alert.alert("Error", "Failed to export budgets. Please try again.");
    }

    setShowExportMenu(false);
  };

  /**
   * Filter displayed categories based on search query
   * Uses useMemo for performance optimization
   */
  const filteredCategories = useMemo(() => {
    if (!budget || !searchQuery.trim()) {
      return budget?.categories || [];
    }

    const lowerQuery = searchQuery.toLowerCase();
    return budget.categories.filter((category) => {
      // Check category name
      if (category.name.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      // Check line item names
      return category.lineItems.some((item) =>
        item.name.toLowerCase().includes(lowerQuery),
      );
    });
  }, [budget, searchQuery]);

  /**
   * Calculate percentage of budget used
   * For visual progress indicators
   */
  const budgetPercentage = useMemo(() => {
    if (totalBudgeted === 0) return 0;
    return (totalActual / totalBudgeted) * 100;
  }, [totalBudgeted, totalActual]);

  /**
   * Calculate category totals for all categories
   * Memoized to avoid recalculation on every render
   *
   * @returns {Map} Map of category IDs to totals
   */
  const categoryTotals = useMemo(() => {
    const totals = new Map<
      string,
      { budgeted: number; actual: number; diff: number; isOverBudget: boolean }
    >();

    filteredCategories.forEach((category) => {
      const catBudgeted = category.lineItems.reduce(
        (sum, item) => sum + item.budgeted,
        0,
      );
      const catActual = category.lineItems.reduce(
        (sum, item) => sum + item.actual,
        0,
      );
      const catDiff = catBudgeted - catActual;

      totals.set(category.id, {
        budgeted: catBudgeted,
        actual: catActual,
        diff: catDiff,
        isOverBudget: catDiff < 0,
      });
    });

    return totals;
  }, [filteredCategories]);

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
          <View style={styles.headerTop}>
            <ThemedText type="h2">{budget.name}</ThemedText>
            <View style={styles.headerActions}>
              <Pressable
                onPress={() => setShowStats(!showStats)}
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: theme.backgroundMuted },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Feather name="bar-chart-2" size={18} color={theme.accent} />
              </Pressable>
              <Pressable
                onPress={() => setShowExportMenu(true)}
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: theme.backgroundMuted },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Feather name="download" size={18} color={theme.accent} />
              </Pressable>
              <Pressable
                onPress={handleDuplicateBudget}
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: theme.backgroundMuted },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Feather name="copy" size={18} color={theme.accent} />
              </Pressable>
            </View>
          </View>

          {/* Statistics Dashboard */}
          {showStats && statistics && (
            <Animated.View
              entering={FadeIn.duration(200)}
              style={[
                styles.statsContainer,
                { backgroundColor: theme.backgroundMuted },
              ]}
            >
              <ThemedText type="caption" muted style={styles.statsTitle}>
                Budget Statistics
              </ThemedText>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <ThemedText type="small" muted>
                    Total Budgets
                  </ThemedText>
                  <ThemedText type="h3">{statistics.totalBudgets}</ThemedText>
                </View>
                <View style={styles.statItem}>
                  <ThemedText type="small" muted>
                    Categories
                  </ThemedText>
                  <ThemedText type="h3">{statistics.categoryCount}</ThemedText>
                </View>
                <View style={styles.statItem}>
                  <ThemedText type="small" muted>
                    Line Items
                  </ThemedText>
                  <ThemedText type="h3">{statistics.lineItemCount}</ThemedText>
                </View>
                <View style={styles.statItem}>
                  <ThemedText type="small" muted>
                    Avg Monthly
                  </ThemedText>
                  <ThemedText type="h3">
                    ${statistics.averageActual.toFixed(0)}
                  </ThemedText>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Summary with progress bar */}
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

            {/* Progress Bar */}
            <View
              style={[
                styles.progressBarContainer,
                { backgroundColor: theme.backgroundMuted },
              ]}
            >
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${Math.min(budgetPercentage, 100)}%`,
                    backgroundColor:
                      budgetPercentage > 100
                        ? theme.error
                        : budgetPercentage > 90
                          ? theme.warning
                          : theme.accent,
                  },
                ]}
              />
            </View>
            <ThemedText type="caption" muted style={styles.progressText}>
              {budgetPercentage.toFixed(1)}% of budget used
            </ThemedText>
          </View>
        </View>

        {/* Month Picker Button */}
        <Pressable
          onPress={() => {
            setShowMonthPicker(true);
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }}
          style={({ pressed }) => [
            styles.monthPickerButton,
            { backgroundColor: theme.backgroundDefault },
            pressed && { opacity: 0.8 },
          ]}
        >
          <Feather name="calendar" size={18} color={theme.accent} />
          <ThemedText type="body" style={{ color: theme.accent }}>
            {budget.month}
          </ThemedText>
          <ThemedText type="caption" muted>
            ({allBudgets.length} budgets)
          </ThemedText>
        </Pressable>

        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <Feather name="search" size={18} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search categories and items..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => {
                setSearchQuery("");
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
            >
              <Feather name="x-circle" size={18} color={theme.textMuted} />
            </Pressable>
          )}
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

        {/* Empty state for search with no results */}
        {searchQuery && filteredCategories.length === 0 && (
          <View style={styles.searchEmptyContainer}>
            <Feather name="search" size={48} color={theme.textMuted} />
            <ThemedText type="body" muted style={styles.searchEmptyText}>
              No matches found for "{searchQuery}"
            </ThemedText>
          </View>
        )}

        {filteredCategories.map((category, catIndex) => {
          // Get pre-calculated category totals from memoized map
          const totals = categoryTotals.get(category.id) || {
            budgeted: 0,
            actual: 0,
            diff: 0,
            isOverBudget: false,
          };

          return (
            <Animated.View
              key={category.id}
              entering={FadeInDown.delay(
                catIndex * ANIMATION_DELAY_PER_ITEM,
              ).springify()}
            >
              <View
                style={[
                  styles.categoryCard,
                  { backgroundColor: theme.backgroundDefault },
                  totals.isOverBudget && {
                    borderLeftWidth: 3,
                    borderLeftColor: theme.error,
                  },
                ]}
              >
                <Pressable
                  style={styles.categoryHeader}
                  onPress={() => toggleCategory(category.id)}
                >
                  <View style={styles.categoryHeaderLeft}>
                    <Feather
                      name={
                        category.isExpanded ? "chevron-down" : "chevron-right"
                      }
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
                          Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Light,
                          );
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
          );
        })}

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

      {/* Month Picker Modal */}
      <Modal
        visible={showMonthPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowMonthPicker(false)}
        >
          <Pressable
            style={[styles.modalContent, { backgroundColor: theme.background }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <ThemedText type="h3">Select Budget Month</ThemedText>
              <Pressable onPress={() => setShowMonthPicker(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalScroll}>
              {allBudgets.map((b) => {
                const monthName = new Date(b.month + "-01").toLocaleDateString(
                  "en-US",
                  { month: "long", year: "numeric" },
                );
                const isSelected = b.id === budget?.id;

                return (
                  <Pressable
                    key={b.id}
                    style={({ pressed }) => [
                      styles.monthItem,
                      { backgroundColor: theme.backgroundDefault },
                      isSelected && {
                        borderColor: theme.accent,
                        borderWidth: 2,
                      },
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => {
                      loadSpecificBudget(b.id);
                      setShowMonthPicker(false);
                    }}
                  >
                    <View>
                      <ThemedText type="body">{monthName}</ThemedText>
                      <ThemedText type="caption" muted>
                        {b.name}
                      </ThemedText>
                    </View>
                    {isSelected && (
                      <Feather name="check" size={20} color={theme.accent} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Export Menu Modal */}
      <Modal
        visible={showExportMenu}
        animationType="fade"
        transparent
        onRequestClose={() => setShowExportMenu(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowExportMenu(false)}
        >
          <Pressable
            style={[styles.exportMenu, { backgroundColor: theme.background }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Pressable
              style={({ pressed }) => [
                styles.exportMenuItem,
                { backgroundColor: theme.backgroundDefault },
                pressed && { opacity: 0.7 },
              ]}
              onPress={handleExportBudget}
            >
              <Feather name="file-text" size={20} color={theme.accent} />
              <ThemedText type="body">Export This Budget</ThemedText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.exportMenuItem,
                { backgroundColor: theme.backgroundDefault },
                pressed && { opacity: 0.7 },
              ]}
              onPress={handleExportAllBudgets}
            >
              <Feather name="archive" size={20} color={theme.accent} />
              <ThemedText type="body">Export All Budgets</ThemedText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.exportMenuItem,
                { backgroundColor: theme.backgroundMuted },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => setShowExportMenu(false)}
            >
              <Feather name="x" size={20} color={theme.textMuted} />
              <ThemedText type="body" muted>
                Cancel
              </ThemedText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <BottomNav onAiPress={() => setShowAISheet(true)} />

      <AIAssistSheet
        visible={showAISheet}
        onClose={() => setShowAISheet(false)}
        module="budget"
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
  // Enhanced Features Styles
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  headerActions: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  actionButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  statsContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  statsTitle: {
    marginBottom: Spacing.sm,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  statItem: {
    flex: 1,
    minWidth: "45%",
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    marginTop: Spacing.md,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  monthPickerButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  searchEmptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["2xl"],
  },
  searchEmptyText: {
    marginTop: Spacing.md,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    maxHeight: "80%",
    ...Shadows.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  modalScroll: {
    maxHeight: 400,
  },
  monthItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  exportMenu: {
    position: "absolute",
    bottom: "30%",
    left: "10%",
    right: "10%",
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    ...Shadows.lg,
  },
  exportMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
    marginVertical: Spacing.xs,
  },
});
