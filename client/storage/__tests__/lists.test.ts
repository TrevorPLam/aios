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
  };

  const mockList: List = {
    id: "list_1",
    title: "Test List",
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
        { id: "item_1", text: "Item 1", isChecked: false },
        { id: "item_2", text: "Item 2", isChecked: true },
        { id: "item_3", text: "Item 3", isChecked: false },
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
    });
  });
});
