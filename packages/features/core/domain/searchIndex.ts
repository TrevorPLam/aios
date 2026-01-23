/**
 * How to Use:
 * - Initialize once with searchIndex.initialize() and then call searchIndex.search(query).
 * - Update the index via addItem/updateItem/removeItem when data changes.
 *
 * UI integration example:
 * - OmnisearchScreen can call searchIndex.search before falling back to DB queries.
 *
 * Public API:
 * - searchIndex.
 *
 * Expected usage pattern:
 * - Keep index updates in data layers (event listeners), not directly in UI.
 *
 * WHY: Provides fast lookups without forcing every search to hit storage.
 */
/**
 * Search Index System
 *
 * Purpose (Plain English):
 * Makes search super fast by building an "inverted index" - like the index at the
 * back of a book. Instead of searching through every note/task/event, we look up
 * words in the index to instantly find matching items.
 *
 * What it interacts with:
 * - Omnisearch engine (provides indexed results)
 * - All module databases (to build index)
 * - Storage (to persist index)
 * - Event bus (to update index when items change)
 *
 * Technical Implementation:
 * Builds an inverted index: word → [item IDs]. Supports incremental updates
 * (add/remove single items without rebuilding entire index). Uses stemming and
 * stopword removal for better matching. Debounces writes to storage.
 *
 * Safe AI Extension Points:
 * - Add fuzzy matching (typo tolerance)
 * - Add synonym expansion
 * - Add phrase matching
 * - Add relevance learning from clicks
 *
 * Fragile Logic Warnings:
 * - Index can grow large with 20+ modules (need size limits)
 * - Must stay in sync with actual data (listen to change events)
 * - Rebuilding full index is expensive (do sparingly)
 * - Memory usage grows with number of indexed items
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { ModuleType } from "@contracts/models/types";
import {
  eventBus,
  EVENT_TYPES,
  NoteEventPayload,
  TaskEventPayload,
  CalendarEventPayload,
} from "./eventBus";

/**
 * Indexed Item
 *
 * Minimal info stored in index for fast lookup.
 */
interface IndexedItem {
  id: string;
  moduleType: ModuleType;
  title: string;
  searchableText: string; // All searchable content combined
  timestamp: number; // Unix timestamp for recency sorting
  metadata?: Record<string, any>;
}

/**
 * Inverted Index Entry
 *
 * Maps a word to items that contain it.
 */
interface InvertedIndexEntry {
  word: string;
  itemIds: string[]; // List of item IDs containing this word
  frequency: number; // How many items have this word
}

/**
 * Index Statistics
 */
interface IndexStatistics {
  totalItems: number;
  totalWords: number;
  indexSizeKB: number;
  lastBuiltAt: string;
  moduleBreakdown: Record<ModuleType, number>;
}

/**
 * Search Index Configuration
 */
interface SearchIndexConfig {
  maxIndexSizeMB: number; // Max size of index in storage
  maxWordsPerItem: number; // Max words to index per item
  minWordLength: number; // Ignore words shorter than this
  debounceDelayMs: number; // Delay before saving index
  enableStemming: boolean; // Use word stemming
  removeStopwords: boolean; // Remove common words (a, the, etc.)
}

/**
 * English Stopwords
 *
 * Common words to ignore during indexing.
 */
const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "he",
  "in",
  "is",
  "it",
  "its",
  "of",
  "on",
  "that",
  "the",
  "to",
  "was",
  "will",
  "with",
  "you",
  "your",
  "this",
  "have",
  "had",
  "but",
  "not",
  "or",
  "if",
  "can",
  "all",
  "what",
  "who",
  "when",
]);

/**
 * Storage Keys
 */
const STORAGE_KEYS = {
  INDEX: "@searchIndex:index",
  ITEMS: "@searchIndex:items",
  STATS: "@searchIndex:stats",
};

/**
 * Search Index Class
 *
 * Manages inverted index for fast searching.
 */
class SearchIndex {
  private invertedIndex: Map<string, InvertedIndexEntry>;
  private items: Map<string, IndexedItem>;
  private config: SearchIndexConfig;
  private saveTimeout: NodeJS.Timeout | null;
  private initialized: boolean;

  constructor() {
    this.invertedIndex = new Map();
    this.items = new Map();
    this.saveTimeout = null;
    this.initialized = false;

    // iOS-optimized configuration
    this.config = {
      maxIndexSizeMB: 10, // 10MB max index size
      maxWordsPerItem: 200, // Index up to 200 words per item
      minWordLength: 2, // Ignore single letters
      debounceDelayMs: 2000, // Save after 2 seconds of no changes
      enableStemming: false, // Simple version, can enable later
      removeStopwords: true, // Skip common words
    };

    this.setupEventListeners();
  }

  /**
   * Setup Event Listeners
   *
   * Plain English: "Listen for changes to items so we can update the index"
   */
  private setupEventListeners(): void {
    // Listen for item created events
    eventBus.on(EVENT_TYPES.NOTE_CREATED, (data) => {
      const payload = data as any;
      this.addItem({
        id: payload.note.id,
        moduleType: "notebook",
        title: payload.note.title,
        searchableText: `${payload.note.title} ${payload.note.bodyMarkdown} ${payload.note.tags.join(" ")}`,
        timestamp: new Date(payload.note.createdAt).getTime(),
      });
    });

    eventBus.on(EVENT_TYPES.TASK_CREATED, (data) => {
      const payload = data as any;
      this.addItem({
        id: payload.task.id,
        moduleType: "planner",
        title: payload.task.title,
        searchableText: `${payload.task.title} ${payload.task.userNotes || ""}`,
        timestamp: new Date(payload.task.createdAt).getTime(),
        metadata: {
          status: payload.task.status,
          priority: payload.task.priority,
        },
      });
    });

    eventBus.on(EVENT_TYPES.EVENT_CREATED, (data) => {
      const payload = data as any;
      this.addItem({
        id: payload.event.id,
        moduleType: "calendar",
        title: payload.event.title,
        searchableText: `${payload.event.title} ${payload.event.description || ""} ${payload.event.location || ""}`,
        timestamp: new Date(payload.event.startAt).getTime(),
      });
    });

    // Listen for item updated events
    eventBus.on(EVENT_TYPES.NOTE_UPDATED, (data) => {
      const payload = data as any;
      this.updateItem({
        id: payload.note.id,
        moduleType: "notebook",
        title: payload.note.title,
        searchableText: `${payload.note.title} ${payload.note.bodyMarkdown} ${payload.note.tags.join(" ")}`,
        timestamp: new Date(payload.note.updatedAt).getTime(),
      });
    });

    eventBus.on(EVENT_TYPES.TASK_UPDATED, (data) => {
      const payload = data as any;
      this.updateItem({
        id: payload.task.id,
        moduleType: "planner",
        title: payload.task.title,
        searchableText: `${payload.task.title} ${payload.task.userNotes || ""}`,
        timestamp: new Date(payload.task.updatedAt).getTime(),
        metadata: {
          status: payload.task.status,
          priority: payload.task.priority,
        },
      });
    });

    // Listen for item deleted events
    eventBus.on(EVENT_TYPES.NOTE_DELETED, (data) => {
      const payload = data as any;
      this.removeItem(payload.noteId);
    });

    eventBus.on(EVENT_TYPES.TASK_DELETED, (data) => {
      const payload = data as any;
      this.removeItem(payload.taskId);
    });

    eventBus.on(EVENT_TYPES.EVENT_DELETED, (data) => {
      const payload = data as any;
      this.removeItem(payload.eventId);
    });
  }

  /**
   * Initialize Index
   *
   * Plain English: "Load the saved index from storage"
   * Must be called before using the index.
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      console.log("[SearchIndex] Initializing...");

      // Load items
      const itemsJson = await AsyncStorage.getItem(STORAGE_KEYS.ITEMS);
      if (itemsJson) {
        const itemsArray: IndexedItem[] = JSON.parse(itemsJson);
        itemsArray.forEach((item) => {
          this.items.set(item.id, item);
        });
        console.log(`[SearchIndex] Loaded ${itemsArray.length} items`);
      }

      // Load index
      const indexJson = await AsyncStorage.getItem(STORAGE_KEYS.INDEX);
      if (indexJson) {
        const entriesArray: InvertedIndexEntry[] = JSON.parse(indexJson);
        entriesArray.forEach((entry) => {
          this.invertedIndex.set(entry.word, entry);
        });
        console.log(
          `[SearchIndex] Loaded ${entriesArray.length} index entries`,
        );
      }

      this.initialized = true;
    } catch (error) {
      console.error("[SearchIndex] Initialization error:", error);
      this.initialized = true; // Continue anyway
    }
  }

  /**
   * Tokenize Text
   *
   * Plain English: "Break text into searchable words"
   *
   * Technical: Converts to lowercase, splits on whitespace/punctuation,
   * removes stopwords, filters by length.
   *
   * @param text - Text to tokenize
   * @returns Array of tokens
   */
  private tokenize(text: string): string[] {
    // Convert to lowercase and split on non-word characters
    const words = text
      .toLowerCase()
      .split(/[\s\W]+/)
      .filter((word) => word.length >= this.config.minWordLength);

    // Remove stopwords if enabled
    if (this.config.removeStopwords) {
      return words.filter((word) => !STOPWORDS.has(word));
    }

    return words;
  }

  /**
   * Add Item to Index
   *
   * Plain English: "Index a new item so it shows up in searches"
   *
   * @param item - Item to add
   */
  addItem(item: IndexedItem): void {
    // Store item
    this.items.set(item.id, item);

    // Tokenize searchable text
    const words = this.tokenize(item.searchableText);

    // Limit words per item
    const wordsToIndex = words.slice(0, this.config.maxWordsPerItem);

    // Add to inverted index
    wordsToIndex.forEach((word) => {
      const entry = this.invertedIndex.get(word);

      if (entry) {
        // Add item ID if not already present
        if (!entry.itemIds.includes(item.id)) {
          entry.itemIds.push(item.id);
          entry.frequency = entry.itemIds.length;
        }
      } else {
        // Create new entry
        this.invertedIndex.set(word, {
          word,
          itemIds: [item.id],
          frequency: 1,
        });
      }
    });

    console.log(
      `[SearchIndex] Added item ${item.id} (${wordsToIndex.length} words)`,
    );

    // Schedule save
    this.scheduleSave();
  }

  /**
   * Update Item in Index
   *
   * Plain English: "Item changed, update its index entry"
   *
   * @param item - Updated item
   */
  updateItem(item: IndexedItem): void {
    // Remove old entry
    this.removeItem(item.id);

    // Add new entry
    this.addItem(item);
  }

  /**
   * Remove Item from Index
   *
   * Plain English: "Item deleted, remove from index"
   *
   * @param itemId - Item ID to remove
   */
  removeItem(itemId: string): void {
    const item = this.items.get(itemId);
    if (!item) {
      return;
    }

    // Remove from items
    this.items.delete(itemId);

    // Remove from inverted index
    const words = this.tokenize(item.searchableText);
    words.forEach((word) => {
      const entry = this.invertedIndex.get(word);
      if (entry) {
        entry.itemIds = entry.itemIds.filter((id) => id !== itemId);
        entry.frequency = entry.itemIds.length;

        // Remove entry if no more items
        if (entry.itemIds.length === 0) {
          this.invertedIndex.delete(word);
        }
      }
    });

    console.log(`[SearchIndex] Removed item ${itemId}`);

    // Schedule save
    this.scheduleSave();
  }

  /**
   * Search Index
   *
   * Plain English: "Find items matching search query"
   *
   * Technical: Tokenizes query, looks up each word in inverted index,
   * intersects result sets, scores by relevance.
   *
   * @param query - Search query
   * @param options - Search options
   * @returns Matching item IDs with scores
   */
  search(
    query: string,
    options: {
      maxResults?: number;
      moduleTypes?: ModuleType[];
    } = {},
  ): { itemId: string; item: IndexedItem; score: number }[] {
    const { maxResults = 100, moduleTypes } = options;

    // Tokenize query
    const queryWords = this.tokenize(query);

    if (queryWords.length === 0) {
      return [];
    }

    // Get item IDs for each query word
    const wordResults: string[][] = queryWords.map((word) => {
      const entry = this.invertedIndex.get(word);
      return entry ? entry.itemIds : [];
    });

    // Intersect results (items must contain all query words)
    let matchingItemIds: string[];
    if (wordResults.length === 1) {
      matchingItemIds = wordResults[0];
    } else {
      // Items that appear in all word results
      matchingItemIds = wordResults[0].filter((itemId) =>
        wordResults.every((results) => results.includes(itemId)),
      );
    }

    // Filter by module type if specified
    if (moduleTypes && moduleTypes.length > 0) {
      matchingItemIds = matchingItemIds.filter((itemId) => {
        const item = this.items.get(itemId);
        return item && moduleTypes.includes(item.moduleType);
      });
    }

    // Score and sort results
    const scoredResults = matchingItemIds
      .map((itemId) => {
        const item = this.items.get(itemId);
        if (!item) return null;

        // Calculate relevance score
        let score = 0;

        // Title match bonus
        const titleWords = this.tokenize(item.title);
        const titleMatchCount = queryWords.filter((word) =>
          titleWords.includes(word),
        ).length;
        score += titleMatchCount * 30;

        // Full content match
        score += queryWords.length * 20;

        // Recency bonus (items from last 7 days get boost)
        const now = Date.now();
        const daysOld = (now - item.timestamp) / (1000 * 60 * 60 * 24);
        if (daysOld < 7) {
          score += Math.max(0, 10 - daysOld);
        }

        return { itemId, item, score };
      })
      .filter(
        (
          result,
        ): result is { itemId: string; item: IndexedItem; score: number } =>
          result !== null,
      );

    // Sort by score descending
    scoredResults.sort((a, b) => b.score - a.score);

    // Return top results
    return scoredResults.slice(0, maxResults);
  }

  /**
   * Schedule Save
   *
   * Debounced save to avoid too many writes.
   */
  private scheduleSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      this.save();
    }, this.config.debounceDelayMs);
  }

  /**
   * Save Index to Storage
   */
  private async save(): Promise<void> {
    try {
      // Convert items to array
      const itemsArray = Array.from(this.items.values());
      await AsyncStorage.setItem(
        STORAGE_KEYS.ITEMS,
        JSON.stringify(itemsArray),
      );

      // Convert index to array
      const entriesArray = Array.from(this.invertedIndex.values());
      await AsyncStorage.setItem(
        STORAGE_KEYS.INDEX,
        JSON.stringify(entriesArray),
      );

      // Save stats
      const stats = this.getStatistics();
      await AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));

      console.log(
        `[SearchIndex] Saved (${stats.totalItems} items, ${stats.totalWords} words)`,
      );
    } catch (error) {
      console.error("[SearchIndex] Save error:", error);
    }
  }

  /**
   * Get Statistics
   *
   * @returns Index statistics
   */
  getStatistics(): IndexStatistics {
    const moduleBreakdown: Record<string, number> = {};
    Array.from(this.items.values()).forEach((item) => {
      moduleBreakdown[item.moduleType] =
        (moduleBreakdown[item.moduleType] || 0) + 1;
    });

    // Estimate index size (React Native compatible)
    const indexJson = JSON.stringify(Array.from(this.invertedIndex.values()));
    // Use string length as approximation (UTF-8 characters ~ 1-4 bytes each)
    const indexSizeKB = (indexJson.length * 1.5) / 1024; // Conservative estimate

    return {
      totalItems: this.items.size,
      totalWords: this.invertedIndex.size,
      indexSizeKB,
      lastBuiltAt: new Date().toISOString(),
      moduleBreakdown: moduleBreakdown as Record<ModuleType, number>,
    };
  }

  /**
   * Rebuild Entire Index
   *
   * Plain English: "Throw away old index and rebuild from scratch"
   * Expensive operation, use sparingly.
   *
   * @param items - All items to index
   */
  async rebuildIndex(items: IndexedItem[]): Promise<void> {
    console.log(`[SearchIndex] Rebuilding index with ${items.length} items...`);

    // Clear existing index
    this.invertedIndex.clear();
    this.items.clear();

    // Add all items
    items.forEach((item) => {
      this.addItem(item);
    });

    // Save immediately
    await this.save();

    console.log("[SearchIndex] Rebuild complete");
  }

  /**
   * Clear All Data
   *
   * @returns Promise
   */
  async clearAllData(): Promise<void> {
    this.invertedIndex.clear();
    this.items.clear();

    await AsyncStorage.multiRemove([
      STORAGE_KEYS.INDEX,
      STORAGE_KEYS.ITEMS,
      STORAGE_KEYS.STATS,
    ]);

    console.log("[SearchIndex] Cleared all data");
  }

  /**
   * Get Item by ID
   *
   * @param itemId - Item ID
   * @returns Item or undefined
   */
  getItem(itemId: string): IndexedItem | undefined {
    return this.items.get(itemId);
  }

  /**
   * Update Configuration
   *
   * @param config - New configuration
   */
  updateConfig(config: Partial<SearchIndexConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
    console.log("[SearchIndex] Updated config:", this.config);
  }
}

// Export singleton instance
export const searchIndex = new SearchIndex();
