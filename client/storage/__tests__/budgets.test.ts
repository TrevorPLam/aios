import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../database";
import { Budget, BudgetCategory, BudgetLineItem } from "@/models/types";

describe("Database Budget Storage", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  afterEach(async () => {
    await AsyncStorage.clear();
  });

  const mockLineItem: BudgetLineItem = {
    id: "item_1",
    name: "Rent",
    budgeted: 1500,
    actual: 1500,
  };

  const mockCategory: BudgetCategory = {
    id: "cat_1",
    name: "Housing",
    lineItems: [mockLineItem],
    isExpanded: true,
  };

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
});
