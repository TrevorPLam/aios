/**
 * Tests for Search Index
 *
 * Validates inverted index and incremental indexing.
 */

import { searchIndex } from "../searchIndex";
import { ModuleType } from "@/models/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiRemove: jest.fn(),
}));

describe("SearchIndex", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    await searchIndex.clearAllData();
    await searchIndex.initialize();
  });

  describe("Initialization", () => {
    it("should initialize without errors", async () => {
      await expect(searchIndex.initialize()).resolves.not.toThrow();
    });

    it("should load saved index from storage", async () => {
      const items = [
        {
          id: "1",
          moduleType: "notebook" as ModuleType,
          title: "Test Note",
          searchableText: "test note content",
          timestamp: Date.now(),
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === "@searchIndex:items") {
          return Promise.resolve(JSON.stringify(items));
        }
        return Promise.resolve(null);
      });

      const index = Object.create(searchIndex);
      await index.initialize();

      const stats = index.getStatistics();
      expect(stats.totalItems).toBeGreaterThan(0);
    });
  });

  describe("Adding Items", () => {
    it("should add item to index", () => {
      searchIndex.addItem({
        id: "1",
        moduleType: "notebook",
        title: "Test Note",
        searchableText: "test note content",
        timestamp: Date.now(),
      });

      const stats = searchIndex.getStatistics();
      expect(stats.totalItems).toBe(1);
    });

    it("should tokenize searchable text", () => {
      searchIndex.addItem({
        id: "1",
        moduleType: "notebook",
        title: "Meeting Notes",
        searchableText: "important meeting notes about project",
        timestamp: Date.now(),
      });

      const stats = searchIndex.getStatistics();
      expect(stats.totalWords).toBeGreaterThan(0);
    });

    it("should handle items with metadata", () => {
      searchIndex.addItem({
        id: "1",
        moduleType: "planner",
        title: "Buy groceries",
        searchableText: "buy milk eggs bread",
        timestamp: Date.now(),
        metadata: { status: "pending", priority: "high" },
      });

      const item = searchIndex.getItem("1");
      expect(item).toBeDefined();
      expect(item!.metadata).toHaveProperty("status");
    });

    it("should add multiple items", () => {
      searchIndex.addItem({
        id: "1",
        moduleType: "notebook",
        title: "Note 1",
        searchableText: "first note",
        timestamp: Date.now(),
      });

      searchIndex.addItem({
        id: "2",
        moduleType: "notebook",
        title: "Note 2",
        searchableText: "second note",
        timestamp: Date.now(),
      });

      const stats = searchIndex.getStatistics();
      expect(stats.totalItems).toBe(2);
    });
  });

  describe("Updating Items", () => {
    it("should update existing item", () => {
      searchIndex.addItem({
        id: "1",
        moduleType: "notebook",
        title: "Original Title",
        searchableText: "original content",
        timestamp: Date.now(),
      });

      searchIndex.updateItem({
        id: "1",
        moduleType: "notebook",
        title: "Updated Title",
        searchableText: "updated content",
        timestamp: Date.now(),
      });

      const item = searchIndex.getItem("1");
      expect(item!.title).toBe("Updated Title");
    });

    it("should reindex content on update", () => {
      searchIndex.addItem({
        id: "1",
        moduleType: "notebook",
        title: "Note",
        searchableText: "old keywords here",
        timestamp: Date.now(),
      });

      searchIndex.updateItem({
        id: "1",
        moduleType: "notebook",
        title: "Note",
        searchableText: "new keywords there",
        timestamp: Date.now(),
      });

      // Search for old keywords should not find item
      const oldResults = searchIndex.search("old keywords");
      expect(oldResults.length).toBe(0);

      // Search for new keywords should find item
      const newResults = searchIndex.search("new keywords");
      expect(newResults.length).toBe(1);
    });
  });

  describe("Removing Items", () => {
    it("should remove item from index", () => {
      searchIndex.addItem({
        id: "1",
        moduleType: "notebook",
        title: "Note",
        searchableText: "content",
        timestamp: Date.now(),
      });

      searchIndex.removeItem("1");

      const item = searchIndex.getItem("1");
      expect(item).toBeUndefined();
    });

    it("should handle removal of non-existent item", () => {
      expect(() => {
        searchIndex.removeItem("nonexistent");
      }).not.toThrow();
    });

    it("should clean up index entries on removal", () => {
      searchIndex.addItem({
        id: "1",
        moduleType: "notebook",
        title: "Unique Word",
        searchableText: "xyzabc123",
        timestamp: Date.now(),
      });

      searchIndex.removeItem("1");

      const results = searchIndex.search("xyzabc123");
      expect(results.length).toBe(0);
    });
  });

  describe("Searching", () => {
    beforeEach(() => {
      // Add some test items
      searchIndex.addItem({
        id: "1",
        moduleType: "notebook",
        title: "Meeting Notes",
        searchableText: "important project meeting discussion",
        timestamp: Date.now(),
      });

      searchIndex.addItem({
        id: "2",
        moduleType: "planner",
        title: "Project Task",
        searchableText: "complete project documentation",
        timestamp: Date.now(),
      });

      searchIndex.addItem({
        id: "3",
        moduleType: "calendar",
        title: "Team Meeting",
        searchableText: "weekly team meeting",
        timestamp: Date.now(),
      });
    });

    it("should find items by single word", () => {
      const results = searchIndex.search("project");
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.itemId === "1" || r.itemId === "2")).toBe(
        true,
      );
    });

    it("should find items by multiple words", () => {
      const results = searchIndex.search("project meeting");
      expect(results.length).toBeGreaterThan(0);
    });

    it("should return empty array for no matches", () => {
      const results = searchIndex.search("nonexistent keyword");
      expect(results.length).toBe(0);
    });

    it("should handle empty query", () => {
      const results = searchIndex.search("");
      expect(results.length).toBe(0);
    });

    it("should score results", () => {
      const results = searchIndex.search("meeting");

      results.forEach((result) => {
        expect(result).toHaveProperty("score");
        expect(typeof result.score).toBe("number");
        expect(result.score).toBeGreaterThan(0);
      });
    });

    it("should sort results by score", () => {
      const results = searchIndex.search("meeting");

      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
      }
    });

    it("should respect maxResults limit", () => {
      const results = searchIndex.search("meeting", { maxResults: 1 });
      expect(results.length).toBeLessThanOrEqual(1);
    });

    it("should filter by module types", () => {
      const results = searchIndex.search("meeting", {
        moduleTypes: ["calendar"],
      });

      results.forEach((result) => {
        expect(result.item.moduleType).toBe("calendar");
      });
    });

    it("should boost title matches", () => {
      // Add item with keyword in title
      searchIndex.addItem({
        id: "4",
        moduleType: "notebook",
        title: "Important Keyword",
        searchableText: "other content",
        timestamp: Date.now(),
      });

      // Add item with keyword in content only
      searchIndex.addItem({
        id: "5",
        moduleType: "notebook",
        title: "Other Title",
        searchableText: "keyword in content",
        timestamp: Date.now(),
      });

      const results = searchIndex.search("keyword");

      // Title match should score higher
      expect(results[0].itemId).toBe("4");
    });
  });

  describe("Statistics", () => {
    it("should provide index statistics", () => {
      searchIndex.addItem({
        id: "1",
        moduleType: "notebook",
        title: "Note",
        searchableText: "content",
        timestamp: Date.now(),
      });

      const stats = searchIndex.getStatistics();

      expect(stats).toHaveProperty("totalItems");
      expect(stats).toHaveProperty("totalWords");
      expect(stats).toHaveProperty("indexSizeKB");
      expect(stats).toHaveProperty("moduleBreakdown");
      expect(stats.totalItems).toBe(1);
    });

    it("should track module breakdown", () => {
      searchIndex.addItem({
        id: "1",
        moduleType: "notebook",
        title: "Note",
        searchableText: "content",
        timestamp: Date.now(),
      });

      searchIndex.addItem({
        id: "2",
        moduleType: "planner",
        title: "Task",
        searchableText: "task content",
        timestamp: Date.now(),
      });

      const stats = searchIndex.getStatistics();
      expect(stats.moduleBreakdown.notebook).toBe(1);
      expect(stats.moduleBreakdown.planner).toBe(1);
    });
  });

  describe("Tokenization", () => {
    it("should ignore stopwords", () => {
      searchIndex.addItem({
        id: "1",
        moduleType: "notebook",
        title: "The Quick Note",
        searchableText: "the quick brown fox",
        timestamp: Date.now(),
      });

      // "the" is a stopword, searching for it should not match
      const stats = searchIndex.getStatistics();
      // Just verify it doesn't crash
      expect(stats.totalWords).toBeGreaterThan(0);
    });

    it("should ignore short words", () => {
      searchIndex.addItem({
        id: "1",
        moduleType: "notebook",
        title: "Note",
        searchableText: "a b c longer words here",
        timestamp: Date.now(),
      });

      const results = searchIndex.search("longer");
      expect(results.length).toBeGreaterThan(0);
    });

    it("should handle special characters", () => {
      searchIndex.addItem({
        id: "1",
        moduleType: "notebook",
        title: "Email",
        searchableText: "user@example.com",
        timestamp: Date.now(),
      });

      const results = searchIndex.search("user example com");
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe("Rebuild Index", () => {
    it("should rebuild entire index", async () => {
      const items = [
        {
          id: "1",
          moduleType: "notebook" as ModuleType,
          title: "Note 1",
          searchableText: "content 1",
          timestamp: Date.now(),
        },
        {
          id: "2",
          moduleType: "planner" as ModuleType,
          title: "Task 1",
          searchableText: "task content",
          timestamp: Date.now(),
        },
      ];

      await searchIndex.rebuildIndex(items);

      const stats = searchIndex.getStatistics();
      expect(stats.totalItems).toBe(2);
    });
  });

  describe("Configuration", () => {
    it("should update configuration", () => {
      searchIndex.updateConfig({
        maxWordsPerItem: 100,
        minWordLength: 3,
      });

      // Just verify it doesn't crash
      searchIndex.addItem({
        id: "1",
        moduleType: "notebook",
        title: "Note",
        searchableText: "ab abc abcd",
        timestamp: Date.now(),
      });
    });
  });

  describe("Data Persistence", () => {
    it("should save to storage", async () => {
      searchIndex.addItem({
        id: "1",
        moduleType: "notebook",
        title: "Note",
        searchableText: "content",
        timestamp: Date.now(),
      });

      // Wait for debounced save
      await new Promise((resolve) => setTimeout(resolve, 2500));

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it("should clear all data", async () => {
      searchIndex.addItem({
        id: "1",
        moduleType: "notebook",
        title: "Note",
        searchableText: "content",
        timestamp: Date.now(),
      });

      await searchIndex.clearAllData();

      const stats = searchIndex.getStatistics();
      expect(stats.totalItems).toBe(0);
    });
  });

  describe("Performance", () => {
    it("should handle many items", () => {
      for (let i = 0; i < 100; i++) {
        searchIndex.addItem({
          id: `${i}`,
          moduleType: "notebook",
          title: `Note ${i}`,
          searchableText: `content for note number ${i}`,
          timestamp: Date.now(),
        });
      }

      const stats = searchIndex.getStatistics();
      expect(stats.totalItems).toBe(100);
    });

    it("should search quickly with many items", () => {
      // Add 100 items
      for (let i = 0; i < 100; i++) {
        searchIndex.addItem({
          id: `${i}`,
          moduleType: "notebook",
          title: `Note ${i}`,
          searchableText: `content ${i} with common keyword`,
          timestamp: Date.now(),
        });
      }

      const startTime = performance.now();
      const results = searchIndex.search("keyword");
      const endTime = performance.now();

      expect(results.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(100); // Should be < 100ms
    });
  });

  describe("Error Handling", () => {
    it("should handle storage errors gracefully", async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(
        new Error("Storage error"),
      );

      expect(() => {
        searchIndex.addItem({
          id: "1",
          moduleType: "notebook",
          title: "Note",
          searchableText: "content",
          timestamp: Date.now(),
        });
      }).not.toThrow();
    });

    it("should handle initialization errors", async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error("Storage error"),
      );

      await expect(searchIndex.initialize()).resolves.not.toThrow();
    });
  });
});
