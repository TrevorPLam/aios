/**
 * Budget Database Storage Tests
 *
 * Tests the database storage layer for the Budget module.
 * Validates CRUD operations, current month retrieval, and nested data handling.
 *
 * @module budgets.test
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../database";
import {
  Budget,
  BudgetCategory,
  BudgetLineItem,
} from "@contracts/models/types";

describe("Database Budget Storage", () => {
  // Clear storage before and after each test to ensure isolation
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  afterEach(async () => {
    await AsyncStorage.clear();
  });

  /** Sample line item for testing */
  const mockLineItem: BudgetLineItem = {
    id: "item_1",
    name: "Rent",
    budgeted: 1500,
    actual: 1500,
  };

  /** Sample category for testing */
  const mockCategory: BudgetCategory = {
    id: "cat_1",
    name: "Housing",
    lineItems: [mockLineItem],
    isExpanded: true,
  };

  /** Sample budget for testing */
  const mockBudget: Budget = {
    id: "budget_1",
    name: "January 2026 Budget",
    month: "2026-01",
    categories: [mockCategory],
    createdAt: "2026-01-14T00:00:00Z",
    updatedAt: "2026-01-14T00:00:00Z",
  };

  describe("budgets", () => {
    it("should save and retrieve a budget", async () => {
      await db.budgets.save(mockBudget);
      const all = await db.budgets.getAll();

      expect(all).toHaveLength(1);
      expect(all[0]).toEqual(mockBudget);
    });

    it("should get a specific budget by id", async () => {
      await db.budgets.save(mockBudget);
      const budget = await db.budgets.get("budget_1");

      expect(budget).toEqual(mockBudget);
    });

    it("should return null for non-existent budget", async () => {
      const budget = await db.budgets.get("non_existent");
      expect(budget).toBeNull();
    });

    it("should delete a budget", async () => {
      await db.budgets.save(mockBudget);
      await db.budgets.delete("budget_1");

      const all = await db.budgets.getAll();
      expect(all).toHaveLength(0);
    });

    it("should update existing budget on save", async () => {
      await db.budgets.save(mockBudget);
      const updated = { ...mockBudget, name: "Updated Budget" };
      await db.budgets.save(updated);

      const all = await db.budgets.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].name).toBe("Updated Budget");
    });

    it("should get current budget by month", async () => {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      const currentBudget: Budget = {
        ...mockBudget,
        id: "budget_current",
        month: currentMonth,
      };

      await db.budgets.save(currentBudget);
      await db.budgets.save(mockBudget); // Different month

      const current = await db.budgets.getCurrent();

      expect(current).not.toBeNull();
      expect(current!.id).toBe("budget_current");
      expect(current!.month).toBe(currentMonth);
    });

    it("should return null if no current month budget exists", async () => {
      // Use a definitely past month
      const pastBudget: Budget = {
        ...mockBudget,
        month: "2020-01", // Far in the past
      };

      await db.budgets.save(pastBudget);
      const current = await db.budgets.getCurrent();

      expect(current).toBeNull();
    });

    it("should handle budget with multiple categories and line items", async () => {
      const lineItem2: BudgetLineItem = {
        id: "item_2",
        name: "Utilities",
        budgeted: 200,
        actual: 180,
      };

      const category2: BudgetCategory = {
        id: "cat_2",
        name: "Bills",
        lineItems: [lineItem2],
        isExpanded: false,
      };

      const budgetWithMultiple: Budget = {
        ...mockBudget,
        categories: [mockCategory, category2],
      };

      await db.budgets.save(budgetWithMultiple);
      const retrieved = await db.budgets.get("budget_1");

      expect(retrieved).not.toBeNull();
      expect(retrieved!.categories).toHaveLength(2);
      expect(retrieved!.categories[1].lineItems[0].name).toBe("Utilities");
    });

    it("should preserve category expanded state", async () => {
      const expandedCat: BudgetCategory = {
        ...mockCategory,
        isExpanded: true,
      };
      const collapsedCat: BudgetCategory = {
        ...mockCategory,
        id: "cat_2",
        name: "Food",
        isExpanded: false,
      };

      const budgetWithState: Budget = {
        ...mockBudget,
        categories: [expandedCat, collapsedCat],
      };

      await db.budgets.save(budgetWithState);
      const retrieved = await db.budgets.get("budget_1");

      expect(retrieved!.categories[0].isExpanded).toBe(true);
      expect(retrieved!.categories[1].isExpanded).toBe(false);
    });
  });

  describe("budgets - enhanced operations", () => {
    const budget1: Budget = {
      id: "budget_1",
      name: "January 2026 Budget",
      month: "2026-01",
      categories: [
        {
          id: "cat_1",
          name: "Housing",
          lineItems: [
            { id: "item_1", name: "Rent", budgeted: 1500, actual: 1500 },
            { id: "item_2", name: "Utilities", budgeted: 200, actual: 180 },
          ],
          isExpanded: true,
        },
      ],
      createdAt: "2026-01-14T00:00:00Z",
      updatedAt: "2026-01-14T00:00:00Z",
    };

    const budget2: Budget = {
      id: "budget_2",
      name: "February 2026 Budget",
      month: "2026-02",
      categories: [
        {
          id: "cat_2",
          name: "Food",
          lineItems: [
            { id: "item_3", name: "Groceries", budgeted: 500, actual: 450 },
          ],
          isExpanded: true,
        },
      ],
      createdAt: "2026-02-01T00:00:00Z",
      updatedAt: "2026-02-01T00:00:00Z",
    };

    const budget3: Budget = {
      id: "budget_3",
      name: "March 2026 Budget",
      month: "2026-03",
      categories: [
        {
          id: "cat_3",
          name: "Transportation",
          lineItems: [
            { id: "item_4", name: "Gas", budgeted: 300, actual: 320 },
          ],
          isExpanded: true,
        },
      ],
      createdAt: "2026-03-01T00:00:00Z",
      updatedAt: "2026-03-01T00:00:00Z",
    };

    beforeEach(async () => {
      await AsyncStorage.clear();
      await db.budgets.save(budget1);
      await db.budgets.save(budget2);
      await db.budgets.save(budget3);
    });

    it("should search budgets by name", async () => {
      const results = await db.budgets.search("February");
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("February 2026 Budget");
    });

    it("should search budgets by category name", async () => {
      const results = await db.budgets.search("Housing");
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("budget_1");
    });

    it("should search budgets by line item name", async () => {
      const results = await db.budgets.search("Groceries");
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("budget_2");
    });

    it("should return all budgets for empty query", async () => {
      const results = await db.budgets.search("");
      expect(results).toHaveLength(3);
    });

    it("should perform case-insensitive search", async () => {
      const results = await db.budgets.search("housing");
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("budget_1");
    });

    it("should get budgets by date range", async () => {
      const results = await db.budgets.getByDateRange("2026-01", "2026-02");
      expect(results).toHaveLength(2);
      expect(results.map((b) => b.id).sort()).toEqual(["budget_1", "budget_2"]);
    });

    it("should get all budgets sorted by month", async () => {
      const results = await db.budgets.getAllSorted();
      expect(results).toHaveLength(3);
      expect(results[0].month).toBe("2026-03");
      expect(results[1].month).toBe("2026-02");
      expect(results[2].month).toBe("2026-01");
    });

    it("should calculate statistics correctly", async () => {
      const stats = await db.budgets.getStatistics();

      expect(stats.totalBudgets).toBe(3);
      expect(stats.totalBudgeted).toBe(2500); // 1700 + 500 + 300
      expect(stats.totalActual).toBe(2450); // 1680 + 450 + 320
      expect(stats.totalDifference).toBe(50); // 2500 - 2450
      expect(stats.categoryCount).toBe(3);
      expect(stats.lineItemCount).toBe(4);
      expect(stats.mostRecentMonth).toBe("2026-03");
      expect(stats.oldestMonth).toBe("2026-01");
    });

    it("should return zero statistics for empty database", async () => {
      await AsyncStorage.clear();
      const stats = await db.budgets.getStatistics();

      expect(stats.totalBudgets).toBe(0);
      expect(stats.totalBudgeted).toBe(0);
      expect(stats.totalActual).toBe(0);
      expect(stats.categoryCount).toBe(0);
      expect(stats.mostRecentMonth).toBeNull();
    });

    it("should get category totals for a budget", async () => {
      const totals = await db.budgets.getCategoryTotals("budget_1");

      expect(totals).toHaveLength(1);
      expect(totals[0].categoryName).toBe("Housing");
      expect(totals[0].budgeted).toBe(1700); // 1500 + 200
      expect(totals[0].actual).toBe(1680); // 1500 + 180
      expect(totals[0].difference).toBe(20);
    });

    it("should return empty array for non-existent budget category totals", async () => {
      const totals = await db.budgets.getCategoryTotals("non_existent");
      expect(totals).toEqual([]);
    });

    it("should compare two budgets by month", async () => {
      const comparison = await db.budgets.compareMonths("2026-01", "2026-02");

      expect(comparison).not.toBeNull();
      expect(comparison!.month1Budget.id).toBe("budget_1");
      expect(comparison!.month2Budget.id).toBe("budget_2");
      expect(comparison!.budgetedDiff).toBe(-1200); // 500 - 1700
      expect(comparison!.actualDiff).toBe(-1230); // 450 - 1680
    });

    it("should return null when comparing non-existent budgets", async () => {
      const comparison = await db.budgets.compareMonths("2025-01", "2025-02");
      expect(comparison).toBeNull();
    });

    it("should duplicate a budget to new month", async () => {
      const duplicated = await db.budgets.duplicate(
        "budget_1",
        "2026-04",
        "April 2026 Budget",
      );

      expect(duplicated).not.toBeNull();
      expect(duplicated!.name).toBe("April 2026 Budget");
      expect(duplicated!.month).toBe("2026-04");
      expect(duplicated!.id).not.toBe("budget_1");

      // Check that actual amounts are reset to 0
      duplicated!.categories.forEach((cat) => {
        cat.lineItems.forEach((item) => {
          expect(item.actual).toBe(0);
          expect(item.budgeted).toBeGreaterThan(0); // Budgeted amounts preserved
        });
      });

      // Verify it was saved
      const all = await db.budgets.getAll();
      expect(all).toHaveLength(4);
    });

    it("should return null when duplicating non-existent budget", async () => {
      const duplicated = await db.budgets.duplicate(
        "non_existent",
        "2026-04",
        "April Budget",
      );
      expect(duplicated).toBeNull();
    });

    it("should export budget to JSON", async () => {
      const json = await db.budgets.exportToJSON("budget_1");

      expect(json).not.toBeNull();
      const parsed = JSON.parse(json!);
      expect(parsed.id).toBe("budget_1");
      expect(parsed.name).toBe("January 2026 Budget");
    });

    it("should return null when exporting non-existent budget", async () => {
      const json = await db.budgets.exportToJSON("non_existent");
      expect(json).toBeNull();
    });

    it("should export all budgets to JSON", async () => {
      const json = await db.budgets.exportAllToJSON();
      const parsed = JSON.parse(json);

      expect(parsed).toHaveLength(3);
      expect(parsed.map((b: Budget) => b.id).sort()).toEqual([
        "budget_1",
        "budget_2",
        "budget_3",
      ]);
    });

    it("should bulk delete multiple budgets", async () => {
      await db.budgets.bulkDelete(["budget_1", "budget_2"]);

      const remaining = await db.budgets.getAll();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe("budget_3");
    });

    it("should handle bulk delete with empty array", async () => {
      await db.budgets.bulkDelete([]);
      const all = await db.budgets.getAll();
      expect(all).toHaveLength(3);
    });

    it("should handle bulk delete with non-existent IDs", async () => {
      await db.budgets.bulkDelete(["non_existent_1", "non_existent_2"]);
      const all = await db.budgets.getAll();
      expect(all).toHaveLength(3); // Nothing deleted
    });
  });
});
