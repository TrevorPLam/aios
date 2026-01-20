/**
 * Budget Mini-Mode Component (iOS-optimized)
 *
 * Purpose (Plain English):
 * A compact expense/income tracker that can be embedded in other screens.
 * Allows users to quickly log transactions without leaving their current
 * context (e.g., from Messages after splitting a bill, or Food after ordering).
 *
 * What it interacts with:
 * - Budget Database: Creates budget entries
 * - Event Bus: Emits BudgetTransactionCreated event after saving
 * - Mini-Mode Registry: Returns result via onComplete callback
 *
 * Safe AI extension points:
 * - Add smart category detection from description
 * - Add receipt photo capture (iOS camera)
 * - Add split transaction support
 * - Enhance with iOS-native number pad
 *
 * Warnings:
 * - Keep form simple - quick entry is the goal
 * - iOS keyboard should show numeric pad for amount
 * - Validate amount is positive number
 * - Always provide haptic feedback on iOS
 */

import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Platform,
  Alert,
  TouchableOpacity,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";

import { MiniModeComponentProps, MiniModeResult } from "../../lib/miniMode";
import { eventBus, EVENT_TYPES } from "../../lib/eventBus";
import { database } from "../../storage/database";
import { ThemedText } from "../ThemedText";
import { Button } from "../Button";
import { Colors, Spacing, Typography } from "../../constants/theme";
import type { BudgetEntry } from "../../models/types";

interface BudgetMiniModeData {
  description?: string;
  amount?: number;
  category?: string;
  type?: "expense" | "income";
}

// Common expense categories (iOS-style quick select)
const EXPENSE_CATEGORIES = [
  { id: "food", label: "Food", icon: "coffee" },
  { id: "transport", label: "Transport", icon: "navigation" },
  { id: "shopping", label: "Shopping", icon: "shopping-bag" },
  { id: "entertainment", label: "Entertainment", icon: "film" },
  { id: "bills", label: "Bills", icon: "file-text" },
  { id: "other", label: "Other", icon: "more-horizontal" },
];

/**
 * Budget Mini-Mode Component
 *
 * Plain English:
 * Quick form to log an expense or income. Shows amount, description, category,
 * and type toggle. Optimized for iOS with native haptics and number pad.
 *
 * Technical:
 * Controlled form with local state, validates on submit, creates budget entry via
 * database, emits event to event bus, returns result via onComplete callback.
 */
export function BudgetMiniMode({
  initialData,
  onComplete,
  onDismiss,
  source,
}: MiniModeComponentProps<BudgetMiniModeData>) {
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [amount, setAmount] = useState(
    initialData?.amount ? initialData.amount.toString() : "",
  );
  const [category, setCategory] = useState(initialData?.category || "other");
  const [type, setType] = useState<"expense" | "income">(
    initialData?.type || "expense",
  );
  const [saving, setSaving] = useState(false);

  /**
   * Handle form submission
   *
   * Plain English: Validate inputs, create budget entry, notify caller
   * Technical: Async database operation with error handling
   */
  const handleSave = async () => {
    // Validation
    if (!description.trim()) {
      if (Platform.OS === "ios") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert("Required Field", "Please enter a description");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      if (Platform.OS === "ios") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert("Invalid Amount", "Please enter a valid positive amount");
      return;
    }

    setSaving(true);

    try {
      // Create budget entry
      const budgetEntry: Partial<BudgetEntry> = {
        description: description.trim(),
        amount: type === "expense" ? -Math.abs(amountNum) : Math.abs(amountNum),
        category,
        date: new Date().toISOString(),
        notes: source ? `Created from ${source}` : undefined,
      };

      const entryId = await database.budgets.create(budgetEntry);

      // Emit event to event bus
      eventBus.emit(EVENT_TYPES.BUDGET_TRANSACTION_CREATED, {
        entryId,
        ...budgetEntry,
      });

      // Success haptic on iOS
      if (Platform.OS === "ios") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Return result
      const result: MiniModeResult<BudgetEntry> = {
        action: "created",
        module: "budget",
        data: { id: entryId, ...budgetEntry } as BudgetEntry,
      };

      onComplete(result);
    } catch (error) {
      console.error("[BudgetMiniMode] Error creating entry:", error);

      if (Platform.OS === "ios") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      Alert.alert("Error", "Failed to create budget entry. Please try again.");

      setSaving(false);
    }
  };

  /**
   * Toggle transaction type (expense/income)
   *
   * Plain English: Switch between logging money spent vs money received
   * Technical: Updates state with haptic feedback on iOS
   */
  const toggleType = () => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setType((current) => (current === "expense" ? "income" : "expense"));
  };

  /**
   * Select category with haptic feedback
   */
  const selectCategory = (categoryId: string) => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCategory(categoryId);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <ThemedText style={styles.title}>Quick Transaction</ThemedText>
          <ThemedText style={styles.subtitle}>
            Log {type === "expense" ? "an expense" : "income"} quickly
          </ThemedText>
        </View>
        <TouchableOpacity
          onPress={onDismiss}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Feather name="x" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.form}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Type Toggle (iOS-style segmented control) */}
        <View style={styles.typeToggleContainer}>
          <TouchableOpacity
            style={[
              styles.typeToggle,
              type === "expense" && styles.typeToggleActive,
            ]}
            onPress={toggleType}
            accessibilityRole="button"
            accessibilityLabel="Set as expense"
          >
            <Feather
              name="arrow-down-left"
              size={18}
              color={
                type === "expense" ? Colors.electric : Colors.textSecondary
              }
            />
            <ThemedText
              style={[
                styles.typeToggleText,
                type === "expense" && styles.typeToggleTextActive,
              ]}
            >
              Expense
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeToggle,
              type === "income" && styles.typeToggleActive,
            ]}
            onPress={toggleType}
            accessibilityRole="button"
            accessibilityLabel="Set as income"
          >
            <Feather
              name="arrow-up-right"
              size={18}
              color={type === "income" ? Colors.success : Colors.textSecondary}
            />
            <ThemedText
              style={[
                styles.typeToggleText,
                type === "income" && styles.typeToggleTextActive,
              ]}
            >
              Income
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Amount Input (iOS numeric keyboard) */}
        <View style={styles.field}>
          <ThemedText style={styles.label}>Amount *</ThemedText>
          <View style={styles.amountInputContainer}>
            <ThemedText style={styles.currencySymbol}>$</ThemedText>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="decimal-pad" // iOS numeric pad
              returnKeyType="done"
              maxLength={10}
              accessibilityLabel="Transaction amount"
              autoFocus
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.field}>
          <ThemedText style={styles.label}>Description *</ThemedText>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="What was this for?"
            placeholderTextColor={Colors.textSecondary}
            returnKeyType="next"
            maxLength={100}
            accessibilityLabel="Transaction description"
          />
        </View>

        {/* Category Selection (iOS-style grid) */}
        <View style={styles.field}>
          <ThemedText style={styles.label}>Category</ThemedText>
          <View style={styles.categoryGrid}>
            {EXPENSE_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryButton,
                  category === cat.id && styles.categoryButtonActive,
                ]}
                onPress={() => selectCategory(cat.id)}
                accessibilityRole="button"
                accessibilityLabel={`Select ${cat.label} category`}
                accessibilityState={{ selected: category === cat.id }}
              >
                <Feather
                  name={cat.icon as any}
                  size={20}
                  color={
                    category === cat.id ? Colors.electric : Colors.textSecondary
                  }
                />
                <ThemedText
                  style={[
                    styles.categoryButtonText,
                    category === cat.id && styles.categoryButtonTextActive,
                  ]}
                >
                  {cat.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Spacer for keyboard */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Action Buttons (iOS-style) */}
      <View style={styles.actions}>
        <Button
          label="Cancel"
          onPress={onDismiss}
          variant="secondary"
          style={styles.button}
          accessibilityHint="Discard this transaction"
        />
        <Button
          label={saving ? "Saving..." : "Save Transaction"}
          onPress={handleSave}
          disabled={saving}
          style={[styles.button, styles.buttonPrimary]}
          accessibilityHint="Save this transaction to your budget"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: Typography.fontSize.h2,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.caption,
    color: Colors.textSecondary,
  },
  closeButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  form: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  field: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSize.small,
    fontWeight: "500",
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  typeToggleContainer: {
    flexDirection: "row",
    backgroundColor: Colors.deepSpace,
    borderRadius: 12,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  typeToggle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    gap: Spacing.xs,
  },
  typeToggleActive: {
    backgroundColor: Colors.slatePanel,
  },
  typeToggleText: {
    fontSize: Typography.fontSize.body,
    color: Colors.textSecondary,
  },
  typeToggleTextActive: {
    color: Colors.text,
    fontWeight: "600",
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.deepSpace,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginRight: Spacing.xs,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "600",
    color: Colors.text,
    paddingVertical: Platform.OS === "ios" ? Spacing.md : Spacing.sm,
  },
  input: {
    backgroundColor: Colors.deepSpace,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === "ios" ? Spacing.md : Spacing.sm,
    fontSize: Typography.fontSize.body,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 20, // iOS-style pill shape
    backgroundColor: Colors.deepSpace,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  categoryButtonActive: {
    backgroundColor: Colors.slatePanel,
    borderColor: Colors.electric,
  },
  categoryButtonText: {
    fontSize: Typography.fontSize.small,
    color: Colors.textSecondary,
  },
  categoryButtonTextActive: {
    color: Colors.electric,
    fontWeight: "600",
  },
  spacer: {
    height: Spacing.xxl * 2, // Extra space for keyboard
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.sm,
    padding: Spacing.md,
    paddingBottom: Platform.OS === "ios" ? Spacing.lg : Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  button: {
    flex: 1,
  },
  buttonPrimary: {
    // Primary button styles already defined in Button component
  },
});
