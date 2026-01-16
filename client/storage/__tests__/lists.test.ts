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
  });
});
