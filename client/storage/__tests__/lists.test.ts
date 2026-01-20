import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../database";
import { List, ListItem } from "@/models/types";

describe("Database Lists Storage", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  afterEach(async () => {
    await AsyncStorage.clear();
  });

  const mockListItem: ListItem = {
    id: "item_1",
    text: "Test item",
    isChecked: false,
    priority: "none",
  };

  const mockList: List = {
    id: "list_1",
    title: "Test List",
    category: "general",
    color: "#00D9FF",
    items: [mockListItem],
    createdAt: "2026-01-14T00:00:00Z",
    lastOpenedAt: "2026-01-14T00:00:00Z",
    updatedAt: "2026-01-14T00:00:00Z",
  };

  describe("lists", () => {
    it("should save and retrieve a list", async () => {
      await db.lists.save(mockList);
      const all = await db.lists.getAll();

      expect(all).toHaveLength(1);
      expect(all[0]).toEqual(mockList);
    });

    it("should get a specific list by id", async () => {
      await db.lists.save(mockList);
      const list = await db.lists.get("list_1");

      expect(list).toEqual(mockList);
    });

    it("should return null for non-existent list", async () => {
      const list = await db.lists.get("non_existent");
      expect(list).toBeNull();
    });

    it("should delete a list", async () => {
      await db.lists.save(mockList);
      await db.lists.delete("list_1");

      const all = await db.lists.getAll();
      expect(all).toHaveLength(0);
    });

    it("should update existing list on save", async () => {
      await db.lists.save(mockList);
      const updated = { ...mockList, title: "Updated List" };
      await db.lists.save(updated);

      const all = await db.lists.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].title).toBe("Updated List");
    });

    it("should sort lists by lastOpenedAt descending", async () => {
      const list1 = {
        ...mockList,
        id: "list_1",
        lastOpenedAt: "2026-01-14T10:00:00Z",
      };
      const list2 = {
        ...mockList,
        id: "list_2",
        lastOpenedAt: "2026-01-14T12:00:00Z",
      };
      const list3 = {
        ...mockList,
        id: "list_3",
        lastOpenedAt: "2026-01-14T11:00:00Z",
      };

      await db.lists.save(list1);
      await db.lists.save(list2);
      await db.lists.save(list3);

      const sorted = await db.lists.getAllSorted();

      expect(sorted).toHaveLength(3);
      expect(sorted[0].id).toBe("list_2");
      expect(sorted[1].id).toBe("list_3");
      expect(sorted[2].id).toBe("list_1");
    });

    it("should update lastOpenedAt when list is opened", async () => {
      await db.lists.save(mockList);

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      await db.lists.updateLastOpened("list_1");

      const list = await db.lists.get("list_1");
      expect(list).not.toBeNull();
      expect(new Date(list!.lastOpenedAt).getTime()).toBeGreaterThan(
        new Date(mockList.lastOpenedAt).getTime(),
      );
    });

    it("should handle list with multiple items", async () => {
      const items: ListItem[] = [
        { id: "item_1", text: "Item 1", isChecked: false, priority: "high" },
        { id: "item_2", text: "Item 2", isChecked: true, priority: "medium" },
        { id: "item_3", text: "Item 3", isChecked: false, priority: "low" },
      ];

      const listWithItems: List = {
        ...mockList,
        items,
      };

      await db.lists.save(listWithItems);
      const retrieved = await db.lists.get("list_1");

      expect(retrieved).not.toBeNull();
      expect(retrieved!.items).toHaveLength(3);
      expect(retrieved!.items[1].isChecked).toBe(true);
      expect(retrieved!.items[0].priority).toBe("high");
    });

    // New enhanced feature tests
    describe("Enhanced Features", () => {
      it("should save and retrieve list with category", async () => {
        const listWithCategory: List = {
          ...mockList,
          category: "grocery",
        };
        await db.lists.save(listWithCategory);
        const retrieved = await db.lists.get("list_1");

        expect(retrieved).not.toBeNull();
        expect(retrieved!.category).toBe("grocery");
      });

      it("should save and retrieve list with color", async () => {
        const listWithColor: List = {
          ...mockList,
          color: "#FF3B5C",
        };
        await db.lists.save(listWithColor);
        const retrieved = await db.lists.get("list_1");

        expect(retrieved).not.toBeNull();
        expect(retrieved!.color).toBe("#FF3B5C");
      });

      it("should filter active lists", async () => {
        const activeList = { ...mockList, id: "list_1", isArchived: false };
        const archivedList = { ...mockList, id: "list_2", isArchived: true };

        await db.lists.save(activeList);
        await db.lists.save(archivedList);

        const active = await db.lists.getActive();
        expect(active).toHaveLength(1);
        expect(active[0].id).toBe("list_1");
      });

      it("should filter archived lists", async () => {
        const activeList = { ...mockList, id: "list_1", isArchived: false };
        const archivedList = { ...mockList, id: "list_2", isArchived: true };

        await db.lists.save(activeList);
        await db.lists.save(archivedList);

        const archived = await db.lists.getArchived();
        expect(archived).toHaveLength(1);
        expect(archived[0].id).toBe("list_2");
      });

      it("should filter templates", async () => {
        const regularList = { ...mockList, id: "list_1", isTemplate: false };
        const templateList = { ...mockList, id: "list_2", isTemplate: true };

        await db.lists.save(regularList);
        await db.lists.save(templateList);

        const templates = await db.lists.getTemplates();
        expect(templates).toHaveLength(1);
        expect(templates[0].id).toBe("list_2");
      });

      it("should filter by category", async () => {
        const groceryList = {
          ...mockList,
          id: "list_1",
          category: "grocery" as const,
        };
        const workList = {
          ...mockList,
          id: "list_2",
          category: "work" as const,
        };

        await db.lists.save(groceryList);
        await db.lists.save(workList);

        const grocery = await db.lists.getByCategory("grocery");
        expect(grocery).toHaveLength(1);
        expect(grocery[0].id).toBe("list_1");
      });

      it("should duplicate a list", async () => {
        await db.lists.save(mockList);
        const duplicated = await db.lists.duplicate("list_1");

        expect(duplicated).not.toBeNull();
        expect(duplicated!.id).not.toBe("list_1");
        expect(duplicated!.title).toBe("Test List (Copy)");
        expect(duplicated!.items).toHaveLength(1);
        expect(duplicated!.items[0].id).not.toBe("item_1");
        expect(duplicated!.items[0].isChecked).toBe(false); // Reset completion
      });

      it("should archive a list", async () => {
        await db.lists.save(mockList);
        await db.lists.archive("list_1");

        const list = await db.lists.get("list_1");
        expect(list).not.toBeNull();
        expect(list!.isArchived).toBe(true);
      });

      it("should unarchive a list", async () => {
        const archivedList = { ...mockList, isArchived: true };
        await db.lists.save(archivedList);
        await db.lists.unarchive("list_1");

        const list = await db.lists.get("list_1");
        expect(list).not.toBeNull();
        expect(list!.isArchived).toBe(false);
      });

      it("should get statistics", async () => {
        const list1: List = {
          ...mockList,
          id: "list_1",
          category: "grocery",
          isArchived: false,
          items: [
            { id: "i1", text: "Item 1", isChecked: true, priority: "high" },
            { id: "i2", text: "Item 2", isChecked: false, priority: "low" },
          ],
        };
        const list2: List = {
          ...mockList,
          id: "list_2",
          category: "work",
          isArchived: true,
          items: [
            { id: "i3", text: "Item 3", isChecked: true, priority: "medium" },
          ],
        };
        const list3: List = {
          ...mockList,
          id: "list_3",
          category: "grocery",
          isTemplate: true,
          items: [],
        };

        await db.lists.save(list1);
        await db.lists.save(list2);
        await db.lists.save(list3);

        const stats = await db.lists.getStats();

        expect(stats.total).toBe(3);
        expect(stats.active).toBe(1);
        expect(stats.archived).toBe(1);
        expect(stats.templates).toBe(1);
        // Category counts should only include active lists
        expect(stats.byCategory.grocery).toBe(1);
        expect(stats.byCategory.work).toBeUndefined();
        expect(stats.totalItems).toBe(3);
        expect(stats.completedItems).toBe(2);
      });

      it("should handle item priorities", async () => {
        const itemWithPriority: ListItem = {
          id: "item_1",
          text: "High priority item",
          isChecked: false,
          priority: "high",
        };
        const listWithPriority: List = {
          ...mockList,
          items: [itemWithPriority],
        };

        await db.lists.save(listWithPriority);
        const retrieved = await db.lists.get("list_1");

        expect(retrieved).not.toBeNull();
        expect(retrieved!.items[0].priority).toBe("high");
      });

      it("should handle item notes", async () => {
        const itemWithNotes: ListItem = {
          id: "item_1",
          text: "Item with notes",
          isChecked: false,
          priority: "medium",
          notes: "This is a detailed note",
        };
        const listWithNotes: List = {
          ...mockList,
          items: [itemWithNotes],
        };

        await db.lists.save(listWithNotes);
        const retrieved = await db.lists.get("list_1");

        expect(retrieved).not.toBeNull();
        expect(retrieved!.items[0].notes).toBe("This is a detailed note");
      });

      it("should handle item due dates", async () => {
        const dueDate = "2026-01-20T10:00:00Z";
        const itemWithDueDate: ListItem = {
          id: "item_1",
          text: "Item with due date",
          isChecked: false,
          priority: "high",
          dueDate,
        };
        const listWithDueDate: List = {
          ...mockList,
          items: [itemWithDueDate],
        };

        await db.lists.save(listWithDueDate);
        const retrieved = await db.lists.get("list_1");

        expect(retrieved).not.toBeNull();
        expect(retrieved!.items[0].dueDate).toBe(dueDate);
      });
    });

    // Advanced Enhancement Tests
    describe("Advanced Enhancements", () => {
      it("should search lists by title", async () => {
        const list1 = { ...mockList, id: "list_1", title: "Grocery Shopping" };
        const list2 = { ...mockList, id: "list_2", title: "Work Tasks" };
        const list3 = { ...mockList, id: "list_3", title: "Shopping List" };

        await db.lists.save(list1);
        await db.lists.save(list2);
        await db.lists.save(list3);

        const results = await db.lists.search("shopping");
        expect(results).toHaveLength(2);
        expect(results.map((l) => l.id)).toContain("list_1");
        expect(results.map((l) => l.id)).toContain("list_3");
      });

      it("should search lists by item text", async () => {
        const list1: List = {
          ...mockList,
          id: "list_1",
          title: "List One",
          items: [
            { id: "i1", text: "Buy milk", isChecked: false, priority: "none" },
            { id: "i2", text: "Buy bread", isChecked: false, priority: "none" },
          ],
        };
        const list2: List = {
          ...mockList,
          id: "list_2",
          title: "List Two",
          items: [
            {
              id: "i3",
              text: "Call client",
              isChecked: false,
              priority: "none",
            },
          ],
        };

        await db.lists.save(list1);
        await db.lists.save(list2);

        const results = await db.lists.search("buy");
        expect(results).toHaveLength(1);
        expect(results[0].id).toBe("list_1");
      });

      it("should search lists by item notes", async () => {
        const list1: List = {
          ...mockList,
          id: "list_1",
          items: [
            {
              id: "i1",
              text: "Task",
              isChecked: false,
              priority: "none",
              notes: "This is urgent project work",
            },
          ],
        };
        const list2: List = {
          ...mockList,
          id: "list_2",
          items: [
            { id: "i2", text: "Task 2", isChecked: false, priority: "none" },
          ],
        };

        await db.lists.save(list1);
        await db.lists.save(list2);

        const results = await db.lists.search("urgent");
        expect(results).toHaveLength(1);
        expect(results[0].id).toBe("list_1");
      });

      it("should perform case-insensitive search", async () => {
        const list = { ...mockList, title: "Important Tasks" };
        await db.lists.save(list);

        const results1 = await db.lists.search("IMPORTANT");
        const results2 = await db.lists.search("important");
        const results3 = await db.lists.search("ImPoRtAnT");

        expect(results1).toHaveLength(1);
        expect(results2).toHaveLength(1);
        expect(results3).toHaveLength(1);
      });

      it("should return all lists for empty search", async () => {
        await db.lists.save({ ...mockList, id: "list_1" });
        await db.lists.save({ ...mockList, id: "list_2" });

        const results = await db.lists.search("");
        expect(results).toHaveLength(2);
      });

      it("should sort lists by recent (descending)", async () => {
        const list1 = {
          ...mockList,
          id: "list_1",
          lastOpenedAt: "2026-01-14T10:00:00Z",
        };
        const list2 = {
          ...mockList,
          id: "list_2",
          lastOpenedAt: "2026-01-14T12:00:00Z",
        };
        const list3 = {
          ...mockList,
          id: "list_3",
          lastOpenedAt: "2026-01-14T11:00:00Z",
        };

        await db.lists.save(list1);
        await db.lists.save(list2);
        await db.lists.save(list3);

        const sorted = await db.lists.sort("recent", "desc");
        expect(sorted[0].id).toBe("list_2");
        expect(sorted[1].id).toBe("list_3");
        expect(sorted[2].id).toBe("list_1");
      });

      it("should sort lists alphabetically", async () => {
        const list1 = { ...mockList, id: "list_1", title: "Zebra List" };
        const list2 = { ...mockList, id: "list_2", title: "Apple List" };
        const list3 = { ...mockList, id: "list_3", title: "Mango List" };

        await db.lists.save(list1);
        await db.lists.save(list2);
        await db.lists.save(list3);

        const sorted = await db.lists.sort("alphabetical", "asc");
        expect(sorted[0].title).toBe("Apple List");
        expect(sorted[1].title).toBe("Mango List");
        expect(sorted[2].title).toBe("Zebra List");
      });

      it("should sort lists by priority", async () => {
        const list1: List = {
          ...mockList,
          id: "list_1",
          items: [
            { id: "i1", text: "Item", isChecked: false, priority: "high" },
            { id: "i2", text: "Item", isChecked: false, priority: "high" },
          ],
        };
        const list2: List = {
          ...mockList,
          id: "list_2",
          items: [
            { id: "i3", text: "Item", isChecked: false, priority: "low" },
          ],
        };
        const list3: List = {
          ...mockList,
          id: "list_3",
          items: [
            { id: "i4", text: "Item", isChecked: false, priority: "high" },
          ],
        };

        await db.lists.save(list1);
        await db.lists.save(list2);
        await db.lists.save(list3);

        const sorted = await db.lists.sort("priority", "desc");
        expect(sorted[0].id).toBe("list_1"); // 2 high priority items
        expect(sorted[1].id).toBe("list_3"); // 1 high priority item
      });

      it("should sort lists by completion percentage", async () => {
        const list1: List = {
          ...mockList,
          id: "list_1",
          items: [
            { id: "i1", text: "Item", isChecked: true, priority: "none" },
            { id: "i2", text: "Item", isChecked: true, priority: "none" },
          ],
        };
        const list2: List = {
          ...mockList,
          id: "list_2",
          items: [
            { id: "i3", text: "Item", isChecked: true, priority: "none" },
            { id: "i4", text: "Item", isChecked: false, priority: "none" },
          ],
        };
        const list3: List = {
          ...mockList,
          id: "list_3",
          items: [
            { id: "i5", text: "Item", isChecked: false, priority: "none" },
          ],
        };

        await db.lists.save(list1);
        await db.lists.save(list2);
        await db.lists.save(list3);

        const sorted = await db.lists.sort("completion", "desc");
        expect(sorted[0].id).toBe("list_1"); // 100%
        expect(sorted[1].id).toBe("list_2"); // 50%
        expect(sorted[2].id).toBe("list_3"); // 0%
      });

      it("should sort lists by item count", async () => {
        const list1: List = {
          ...mockList,
          id: "list_1",
          items: [
            { id: "i1", text: "Item", isChecked: false, priority: "none" },
          ],
        };
        const list2: List = {
          ...mockList,
          id: "list_2",
          items: [
            { id: "i2", text: "Item", isChecked: false, priority: "none" },
            { id: "i3", text: "Item", isChecked: false, priority: "none" },
            { id: "i4", text: "Item", isChecked: false, priority: "none" },
          ],
        };
        const list3: List = {
          ...mockList,
          id: "list_3",
          items: [
            { id: "i5", text: "Item", isChecked: false, priority: "none" },
            { id: "i6", text: "Item", isChecked: false, priority: "none" },
          ],
        };

        await db.lists.save(list1);
        await db.lists.save(list2);
        await db.lists.save(list3);

        const sorted = await db.lists.sort("itemCount", "desc");
        expect(sorted[0].id).toBe("list_2"); // 3 items
        expect(sorted[1].id).toBe("list_3"); // 2 items
        expect(sorted[2].id).toBe("list_1"); // 1 item
      });

      it("should filter lists by category", async () => {
        const list1 = {
          ...mockList,
          id: "list_1",
          category: "grocery" as const,
        };
        const list2 = { ...mockList, id: "list_2", category: "work" as const };
        const list3 = {
          ...mockList,
          id: "list_3",
          category: "grocery" as const,
        };

        await db.lists.save(list1);
        await db.lists.save(list2);
        await db.lists.save(list3);

        const filtered = await db.lists.filter({ category: "grocery" });
        expect(filtered).toHaveLength(2);
      });

      it("should filter lists by priority", async () => {
        const list1: List = {
          ...mockList,
          id: "list_1",
          items: [
            { id: "i1", text: "Item", isChecked: false, priority: "high" },
          ],
        };
        const list2: List = {
          ...mockList,
          id: "list_2",
          items: [
            { id: "i2", text: "Item", isChecked: false, priority: "low" },
          ],
        };

        await db.lists.save(list1);
        await db.lists.save(list2);

        const filtered = await db.lists.filter({ priority: "high" });
        expect(filtered).toHaveLength(1);
        expect(filtered[0].id).toBe("list_1");
      });

      it("should filter lists with overdue items", async () => {
        const pastDate = "2026-01-01T10:00:00Z";
        const futureDate = "2027-01-01T10:00:00Z";

        const list1: List = {
          ...mockList,
          id: "list_1",
          items: [
            {
              id: "i1",
              text: "Item",
              isChecked: false,
              priority: "none",
              dueDate: pastDate,
            },
          ],
        };
        const list2: List = {
          ...mockList,
          id: "list_2",
          items: [
            {
              id: "i2",
              text: "Item",
              isChecked: false,
              priority: "none",
              dueDate: futureDate,
            },
          ],
        };

        await db.lists.save(list1);
        await db.lists.save(list2);

        const filtered = await db.lists.filter({ hasOverdue: true });
        expect(filtered).toHaveLength(1);
        expect(filtered[0].id).toBe("list_1");
      });

      it("should filter lists with items containing notes", async () => {
        const list1: List = {
          ...mockList,
          id: "list_1",
          items: [
            {
              id: "i1",
              text: "Item",
              isChecked: false,
              priority: "none",
              notes: "Important note",
            },
          ],
        };
        const list2: List = {
          ...mockList,
          id: "list_2",
          items: [
            { id: "i2", text: "Item", isChecked: false, priority: "none" },
          ],
        };

        await db.lists.save(list1);
        await db.lists.save(list2);

        const filtered = await db.lists.filter({ hasNotes: true });
        expect(filtered).toHaveLength(1);
        expect(filtered[0].id).toBe("list_1");
      });

      it("should filter incomplete lists", async () => {
        const list1: List = {
          ...mockList,
          id: "list_1",
          items: [
            { id: "i1", text: "Item", isChecked: true, priority: "none" },
          ],
        };
        const list2: List = {
          ...mockList,
          id: "list_2",
          items: [
            { id: "i2", text: "Item", isChecked: false, priority: "none" },
          ],
        };

        await db.lists.save(list1);
        await db.lists.save(list2);

        const filtered = await db.lists.filter({ isIncomplete: true });
        expect(filtered).toHaveLength(1);
        expect(filtered[0].id).toBe("list_2");
      });

      it("should filter by min/max items", async () => {
        const list1: List = {
          ...mockList,
          id: "list_1",
          items: [mockListItem],
        };
        const list2: List = {
          ...mockList,
          id: "list_2",
          items: [
            mockListItem,
            mockListItem,
            mockListItem,
            mockListItem,
            mockListItem,
          ],
        };
        const list3: List = {
          ...mockList,
          id: "list_3",
          items: [mockListItem, mockListItem, mockListItem],
        };

        await db.lists.save(list1);
        await db.lists.save(list2);
        await db.lists.save(list3);

        const filtered = await db.lists.filter({ minItems: 2, maxItems: 4 });
        expect(filtered).toHaveLength(1);
        expect(filtered[0].id).toBe("list_3");
      });

      it("should get lists with overdue items", async () => {
        const pastDate = "2026-01-01T10:00:00Z";
        const list1: List = {
          ...mockList,
          id: "list_1",
          items: [
            {
              id: "i1",
              text: "Item",
              isChecked: false,
              priority: "none",
              dueDate: pastDate,
            },
          ],
        };
        const list2: List = {
          ...mockList,
          id: "list_2",
          items: [
            { id: "i2", text: "Item", isChecked: false, priority: "none" },
          ],
        };

        await db.lists.save(list1);
        await db.lists.save(list2);

        const withOverdue = await db.lists.getWithOverdueItems();
        expect(withOverdue).toHaveLength(1);
        expect(withOverdue[0].id).toBe("list_1");
      });

      it("should get lists with high priority items", async () => {
        const list1: List = {
          ...mockList,
          id: "list_1",
          items: [
            { id: "i1", text: "Item", isChecked: false, priority: "high" },
          ],
        };
        const list2: List = {
          ...mockList,
          id: "list_2",
          items: [
            { id: "i2", text: "Item", isChecked: false, priority: "low" },
          ],
        };

        await db.lists.save(list1);
        await db.lists.save(list2);

        const withHighPriority = await db.lists.getWithHighPriorityItems();
        expect(withHighPriority).toHaveLength(1);
        expect(withHighPriority[0].id).toBe("list_1");
      });

      it("should bulk archive multiple lists", async () => {
        await db.lists.save({ ...mockList, id: "list_1" });
        await db.lists.save({ ...mockList, id: "list_2" });
        await db.lists.save({ ...mockList, id: "list_3" });

        await db.lists.bulkArchive(["list_1", "list_3"]);

        const list1 = await db.lists.get("list_1");
        const list2 = await db.lists.get("list_2");
        const list3 = await db.lists.get("list_3");

        expect(list1!.isArchived).toBe(true);
        expect(list2!.isArchived).toBeFalsy();
        expect(list3!.isArchived).toBe(true);
      });

      it("should bulk unarchive multiple lists", async () => {
        await db.lists.save({ ...mockList, id: "list_1", isArchived: true });
        await db.lists.save({ ...mockList, id: "list_2", isArchived: true });
        await db.lists.save({ ...mockList, id: "list_3", isArchived: true });

        await db.lists.bulkUnarchive(["list_1", "list_3"]);

        const list1 = await db.lists.get("list_1");
        const list2 = await db.lists.get("list_2");
        const list3 = await db.lists.get("list_3");

        expect(list1!.isArchived).toBe(false);
        expect(list2!.isArchived).toBe(true);
        expect(list3!.isArchived).toBe(false);
      });

      it("should bulk delete multiple lists", async () => {
        await db.lists.save({ ...mockList, id: "list_1" });
        await db.lists.save({ ...mockList, id: "list_2" });
        await db.lists.save({ ...mockList, id: "list_3" });

        await db.lists.bulkDelete(["list_1", "list_3"]);

        const all = await db.lists.getAll();
        expect(all).toHaveLength(1);
        expect(all[0].id).toBe("list_2");
      });

      it("should get enhanced statistics", async () => {
        const pastDate = "2026-01-01T10:00:00Z";

        const list1: List = {
          ...mockList,
          id: "list_1",
          category: "grocery",
          items: [
            {
              id: "i1",
              text: "Item",
              isChecked: true,
              priority: "none",
              notes: "Note 1",
            },
            {
              id: "i2",
              text: "Item",
              isChecked: false,
              priority: "high",
              dueDate: pastDate,
            },
          ],
        };
        const list2: List = {
          ...mockList,
          id: "list_2",
          category: "work",
          isArchived: true,
          items: [
            { id: "i3", text: "Item", isChecked: false, priority: "high" },
          ],
        };

        await db.lists.save(list1);
        await db.lists.save(list2);

        const stats = await db.lists.getEnhancedStats();

        expect(stats.total).toBe(2);
        expect(stats.active).toBe(1);
        expect(stats.archived).toBe(1);
        expect(stats.totalItems).toBe(3);
        expect(stats.completedItems).toBe(1);
        expect(stats.pendingItems).toBe(2);
        expect(stats.highPriorityItems).toBe(2);
        expect(stats.overdueItems).toBe(1);
        expect(stats.itemsWithNotes).toBe(1);
        expect(stats.completionRate).toBe(33); // 1/3 = 33%
      });

      it("should clear completed items from a list", async () => {
        const list: List = {
          ...mockList,
          items: [
            { id: "i1", text: "Item 1", isChecked: true, priority: "none" },
            { id: "i2", text: "Item 2", isChecked: false, priority: "none" },
            { id: "i3", text: "Item 3", isChecked: true, priority: "none" },
          ],
        };

        await db.lists.save(list);
        await db.lists.clearCompleted("list_1");

        const updated = await db.lists.get("list_1");
        expect(updated!.items).toHaveLength(1);
        expect(updated!.items[0].id).toBe("i2");
      });

      it("should mark all items as completed", async () => {
        const list: List = {
          ...mockList,
          items: [
            { id: "i1", text: "Item 1", isChecked: false, priority: "none" },
            { id: "i2", text: "Item 2", isChecked: false, priority: "none" },
            { id: "i3", text: "Item 3", isChecked: true, priority: "none" },
          ],
        };

        await db.lists.save(list);
        await db.lists.completeAll("list_1");

        const updated = await db.lists.get("list_1");
        expect(updated!.items.every((item) => item.isChecked)).toBe(true);
      });

      it("should mark all items as incomplete", async () => {
        const list: List = {
          ...mockList,
          items: [
            { id: "i1", text: "Item 1", isChecked: true, priority: "none" },
            { id: "i2", text: "Item 2", isChecked: true, priority: "none" },
            { id: "i3", text: "Item 3", isChecked: false, priority: "none" },
          ],
        };

        await db.lists.save(list);
        await db.lists.uncompleteAll("list_1");

        const updated = await db.lists.get("list_1");
        expect(updated!.items.every((item) => !item.isChecked)).toBe(true);
      });
    });
  });
});
