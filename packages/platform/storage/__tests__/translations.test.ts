/**
 * Translation Database Tests
 *
 * Comprehensive test suite for translation and saved phrase storage operations.
 * Tests cover CRUD operations, filtering, search, favorites, statistics, and edge cases.
 *
 * @module translations.test
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../database";
import { Translation, SavedPhrase } from "@aios/contracts/models/types";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage");

describe("Translations Database", () => {
  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);
  });

  const mockStorage = (data: Record<string, unknown>): void => {
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      const value = data[key];
      return Promise.resolve(value ? JSON.stringify(value) : null);
    });
  };

  describe("Basic CRUD Operations", () => {
    test("getAll returns empty array when no translations exist", async () => {
      const translations = await db.translations.getAll();
      expect(translations).toEqual([]);
    });

    test("save creates a new translation", async () => {
      const translation: Translation = {
        id: "trans-1",
        sourceText: "Hello, world!",
        targetText: "¡Hola, mundo!",
        sourceLang: "en",
        targetLang: "es",
        createdAt: new Date().toISOString(),
        characterCount: 13,
      };

      const saved = await db.translations.save(translation);
      expect(saved).toEqual(translation);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    test("save updates existing translation", async () => {
      const translation: Translation = {
        id: "trans-1",
        sourceText: "Hello",
        targetText: "Hola",
        sourceLang: "en",
        targetLang: "es",
        createdAt: new Date().toISOString(),
        characterCount: 5,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([translation]),
      );

      const updated = {
        ...translation,
        isFavorite: true,
      };

      await db.translations.save(updated);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    test("get returns translation by ID", async () => {
      const translation: Translation = {
        id: "trans-1",
        sourceText: "Good morning",
        targetText: "Buenos días",
        sourceLang: "en",
        targetLang: "es",
        createdAt: new Date().toISOString(),
        characterCount: 12,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([translation]),
      );

      const found = await db.translations.get("trans-1");
      expect(found).toEqual(translation);
    });

    test("get returns null for non-existent ID", async () => {
      const found = await db.translations.get("non-existent");
      expect(found).toBeNull();
    });

    test("delete removes translation by ID", async () => {
      const translation: Translation = {
        id: "trans-1",
        sourceText: "Thank you",
        targetText: "Gracias",
        sourceLang: "en",
        targetLang: "es",
        createdAt: new Date().toISOString(),
        characterCount: 9,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([translation]),
      );

      await db.translations.delete("trans-1");
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe("Favorites", () => {
    test("toggleFavorite sets favorite to true", async () => {
      const translation: Translation = {
        id: "trans-1",
        sourceText: "I love you",
        targetText: "Te amo",
        sourceLang: "en",
        targetLang: "es",
        createdAt: new Date().toISOString(),
        characterCount: 10,
        isFavorite: false,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([translation]),
      );

      await db.translations.toggleFavorite("trans-1");
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    test("toggleFavorite sets favorite to false", async () => {
      const translation: Translation = {
        id: "trans-1",
        sourceText: "I love you",
        targetText: "Te amo",
        sourceLang: "en",
        targetLang: "es",
        createdAt: new Date().toISOString(),
        characterCount: 10,
        isFavorite: true,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([translation]),
      );

      await db.translations.toggleFavorite("trans-1");
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    test("getFavorites returns only favorited translations", async () => {
      const translations: Translation[] = [
        {
          id: "trans-1",
          sourceText: "Hello",
          targetText: "Hola",
          sourceLang: "en",
          targetLang: "es",
          createdAt: new Date().toISOString(),
          characterCount: 5,
          isFavorite: true,
        },
        {
          id: "trans-2",
          sourceText: "Goodbye",
          targetText: "Adiós",
          sourceLang: "en",
          targetLang: "es",
          createdAt: new Date().toISOString(),
          characterCount: 7,
          isFavorite: false,
        },
        {
          id: "trans-3",
          sourceText: "Thank you",
          targetText: "Gracias",
          sourceLang: "en",
          targetLang: "es",
          createdAt: new Date().toISOString(),
          characterCount: 9,
          isFavorite: true,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(translations),
      );

      const favorites = await db.translations.getFavorites();
      expect(favorites).toHaveLength(2);
      expect(favorites.every((t) => t.isFavorite)).toBe(true);
    });
  });

  describe("Search and Filtering", () => {
    const mockTranslations: Translation[] = [
      {
        id: "trans-1",
        sourceText: "Hello, world!",
        targetText: "¡Hola, mundo!",
        sourceLang: "en",
        targetLang: "es",
        createdAt: "2024-01-01T10:00:00Z",
        characterCount: 13,
        tags: ["greetings", "common"],
      },
      {
        id: "trans-2",
        sourceText: "Good morning",
        targetText: "Bonjour",
        sourceLang: "en",
        targetLang: "fr",
        createdAt: "2024-01-02T10:00:00Z",
        characterCount: 12,
        tags: ["greetings"],
      },
      {
        id: "trans-3",
        sourceText: "Thank you very much",
        targetText: "Muchas gracias",
        sourceLang: "en",
        targetLang: "es",
        createdAt: "2024-01-03T10:00:00Z",
        characterCount: 19,
        tags: ["polite", "common"],
      },
    ];

    test("search finds translations by source text", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockTranslations),
      );

      const results = await db.translations.search("world");
      expect(results).toHaveLength(1);
      expect(results[0].sourceText).toContain("world");
    });

    test("search finds translations by target text", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockTranslations),
      );

      const results = await db.translations.search("gracias");
      expect(results).toHaveLength(1);
      expect(results[0].targetText).toContain("gracias");
    });

    test("search finds translations by tags", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockTranslations),
      );

      const results = await db.translations.search("common");
      expect(results).toHaveLength(2);
      expect(results.every((t) => t.tags?.includes("common"))).toBe(true);
    });

    test("search is case-insensitive", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockTranslations),
      );

      const results = await db.translations.search("HELLO");
      expect(results).toHaveLength(1);
    });

    test("getByLanguagePair filters by language pair", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockTranslations),
      );

      const results = await db.translations.getByLanguagePair("en", "es");
      expect(results).toHaveLength(2);
      expect(
        results.every((t) => t.sourceLang === "en" && t.targetLang === "es"),
      ).toBe(true);
    });

    test("getBySourceLanguage filters by source language", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockTranslations),
      );

      const results = await db.translations.getBySourceLanguage("en");
      expect(results).toHaveLength(3);
      expect(results.every((t) => t.sourceLang === "en")).toBe(true);
    });

    test("getByTargetLanguage filters by target language", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockTranslations),
      );

      const results = await db.translations.getByTargetLanguage("es");
      expect(results).toHaveLength(2);
      expect(results.every((t) => t.targetLang === "es")).toBe(true);
    });

    test("getRecent returns limited number of translations", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockTranslations),
      );

      const results = await db.translations.getRecent(2);
      expect(results).toHaveLength(2);
    });

    test("getByTag filters translations by tag", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockTranslations),
      );

      const results = await db.translations.getByTag("greetings");
      expect(results).toHaveLength(2);
      expect(results.every((t) => t.tags?.includes("greetings"))).toBe(true);
    });

    test("getAllTags returns unique tags sorted", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockTranslations),
      );

      const tags = await db.translations.getAllTags();
      expect(tags).toEqual(["common", "greetings", "polite"]);
    });
  });

  describe("Bulk Operations", () => {
    test("bulkDelete removes multiple translations", async () => {
      const translations: Translation[] = [
        {
          id: "trans-1",
          sourceText: "One",
          targetText: "Uno",
          sourceLang: "en",
          targetLang: "es",
          createdAt: new Date().toISOString(),
          characterCount: 3,
        },
        {
          id: "trans-2",
          sourceText: "Two",
          targetText: "Dos",
          sourceLang: "en",
          targetLang: "es",
          createdAt: new Date().toISOString(),
          characterCount: 3,
        },
        {
          id: "trans-3",
          sourceText: "Three",
          targetText: "Tres",
          sourceLang: "en",
          targetLang: "es",
          createdAt: new Date().toISOString(),
          characterCount: 5,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(translations),
      );

      await db.translations.bulkDelete(["trans-1", "trans-3"]);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    test("clearAll removes all translations", async () => {
      await db.translations.clearAll();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@aios/translations",
        JSON.stringify([]),
      );
    });
  });

  describe("Statistics", () => {
    const mockTranslations: Translation[] = [
      {
        id: "trans-1",
        sourceText: "Hello",
        targetText: "Hola",
        sourceLang: "en",
        targetLang: "es",
        createdAt: new Date().toISOString(),
        characterCount: 5,
        isFavorite: true,
      },
      {
        id: "trans-2",
        sourceText: "Goodbye",
        targetText: "Adiós",
        sourceLang: "en",
        targetLang: "es",
        createdAt: new Date().toISOString(),
        characterCount: 7,
        isFavorite: false,
      },
      {
        id: "trans-3",
        sourceText: "Thank you",
        targetText: "Merci",
        sourceLang: "en",
        targetLang: "fr",
        createdAt: new Date().toISOString(),
        characterCount: 9,
        isFavorite: true,
      },
    ];

    test("getStatistics calculates total translations", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockTranslations),
      );

      const stats = await db.translations.getStatistics();
      expect(stats.totalTranslations).toBe(3);
    });

    test("getStatistics calculates favorite count", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockTranslations),
      );

      const stats = await db.translations.getStatistics();
      expect(stats.favoriteCount).toBe(2);
    });

    test("getStatistics tracks language pairs", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockTranslations),
      );

      const stats = await db.translations.getStatistics();
      expect(stats.languagePairs["en-es"]).toBe(2);
      expect(stats.languagePairs["en-fr"]).toBe(1);
    });

    test("getStatistics finds most used source language", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockTranslations),
      );

      const stats = await db.translations.getStatistics();
      expect(stats.mostUsedSourceLang).toBe("en");
    });

    test("getStatistics finds most used target language", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockTranslations),
      );

      const stats = await db.translations.getStatistics();
      expect(stats.mostUsedTargetLang).toBe("es");
    });
  });

  describe("Retention Policy", () => {
    test("applyRetentionPolicy trims history to max entries", async () => {
      const translations: Translation[] = [
        {
          id: "trans-1",
          sourceText: "One",
          targetText: "Uno",
          sourceLang: "en",
          targetLang: "es",
          createdAt: "2024-01-01T00:00:00.000Z",
          characterCount: 3,
        },
        {
          id: "trans-2",
          sourceText: "Two",
          targetText: "Dos",
          sourceLang: "en",
          targetLang: "es",
          createdAt: "2024-02-01T00:00:00.000Z",
          characterCount: 3,
        },
        {
          id: "trans-3",
          sourceText: "Three",
          targetText: "Tres",
          sourceLang: "en",
          targetLang: "es",
          createdAt: "2024-03-01T00:00:00.000Z",
          characterCount: 5,
        },
      ];

      mockStorage({ "@aios/translations": translations });

      await db.translations.applyRetentionPolicy({
        maxEntries: 1,
        maxAgeDays: null,
        keepFavorites: false,
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@aios/translations",
        JSON.stringify([translations[2]]),
      );
    });

    test("applyRetentionPolicy preserves favorites when configured", async () => {
      const translations: Translation[] = [
        {
          id: "trans-1",
          sourceText: "Hello",
          targetText: "Hola",
          sourceLang: "en",
          targetLang: "es",
          createdAt: "2024-01-01T00:00:00.000Z",
          characterCount: 5,
          isFavorite: true,
        },
        {
          id: "trans-2",
          sourceText: "Goodbye",
          targetText: "Adiós",
          sourceLang: "en",
          targetLang: "es",
          createdAt: "2024-01-02T00:00:00.000Z",
          characterCount: 7,
        },
      ];

      mockStorage({ "@aios/translations": translations });

      await db.translations.applyRetentionPolicy({
        maxEntries: 1,
        maxAgeDays: null,
        keepFavorites: true,
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@aios/translations",
        JSON.stringify([translations[0]]),
      );
    });
  });
});

describe("Saved Phrases Database", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  describe("Basic CRUD Operations", () => {
    test("getAll returns empty array when no phrases exist", async () => {
      const phrases = await db.savedPhrases.getAll();
      expect(phrases).toEqual([]);
    });

    test("save creates a new phrase", async () => {
      const phrase: SavedPhrase = {
        id: "phrase-1",
        phrase: "How are you?",
        sourceLang: "en",
        category: "greetings",
        usageCount: 0,
        createdAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString(),
      };

      const saved = await db.savedPhrases.save(phrase);
      expect(saved).toEqual(phrase);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    test("get returns phrase by ID", async () => {
      const phrase: SavedPhrase = {
        id: "phrase-1",
        phrase: "Where is the bathroom?",
        sourceLang: "en",
        category: "travel",
        tags: [],
        usageCount: 5,
        createdAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([phrase]),
      );

      const found = await db.savedPhrases.get("phrase-1");
      expect(found).toEqual(phrase);
    });

    test("delete removes phrase by ID", async () => {
      const phrase: SavedPhrase = {
        id: "phrase-1",
        phrase: "I don't understand",
        sourceLang: "en",
        usageCount: 0,
        createdAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([phrase]),
      );

      await db.savedPhrases.delete("phrase-1");
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe("Usage Tracking", () => {
    test("incrementUsage increases usage count", async () => {
      const phrase: SavedPhrase = {
        id: "phrase-1",
        phrase: "Good morning",
        sourceLang: "en",
        category: "greetings",
        usageCount: 3,
        createdAt: "2024-01-01T10:00:00Z",
        lastUsedAt: "2024-01-01T10:00:00Z",
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([phrase]),
      );

      await db.savedPhrases.incrementUsage("phrase-1");
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    test("getAll sorts phrases by usage count", async () => {
      const phrases: SavedPhrase[] = [
        {
          id: "phrase-1",
          phrase: "Hello",
          sourceLang: "en",
          usageCount: 5,
          createdAt: new Date().toISOString(),
          lastUsedAt: new Date().toISOString(),
        },
        {
          id: "phrase-2",
          phrase: "Goodbye",
          sourceLang: "en",
          usageCount: 10,
          createdAt: new Date().toISOString(),
          lastUsedAt: new Date().toISOString(),
        },
        {
          id: "phrase-3",
          phrase: "Thank you",
          sourceLang: "en",
          usageCount: 7,
          createdAt: new Date().toISOString(),
          lastUsedAt: new Date().toISOString(),
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(phrases),
      );

      const all = await db.savedPhrases.getAll();
      expect(all[0].usageCount).toBe(10);
      expect(all[1].usageCount).toBe(7);
      expect(all[2].usageCount).toBe(5);
    });
  });

  describe("Filtering and Search", () => {
    const mockPhrases: SavedPhrase[] = [
      {
        id: "phrase-1",
        phrase: "Where is the train station?",
        sourceLang: "en",
        category: "travel",
        tags: ["transport", "help"],
        usageCount: 3,
        createdAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString(),
      },
      {
        id: "phrase-2",
        phrase: "I would like a coffee",
        sourceLang: "en",
        category: "food",
        tags: ["drink"],
        usageCount: 8,
        createdAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString(),
      },
      {
        id: "phrase-3",
        phrase: "How much does it cost?",
        sourceLang: "en",
        category: "shopping",
        tags: ["money"],
        usageCount: 5,
        createdAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString(),
      },
    ];

    test("getByLanguage filters phrases by source language", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockPhrases),
      );

      const results = await db.savedPhrases.getByLanguage("en");
      expect(results).toHaveLength(3);
      expect(results.every((p) => p.sourceLang === "en")).toBe(true);
    });

    test("getByCategory filters phrases by category", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockPhrases),
      );

      const results = await db.savedPhrases.getByCategory("travel");
      expect(results).toHaveLength(1);
      expect(results[0].category).toBe("travel");
    });

    test("getAllCategories returns unique categories", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockPhrases),
      );

      const categories = await db.savedPhrases.getAllCategories();
      expect(categories).toEqual(["food", "shopping", "travel"]);
    });

    test("search finds phrases by text", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockPhrases),
      );

      const results = await db.savedPhrases.search("coffee");
      expect(results).toHaveLength(1);
      expect(results[0].phrase).toContain("coffee");
    });

    test("search finds phrases by category", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockPhrases),
      );

      const results = await db.savedPhrases.search("food");
      expect(results).toHaveLength(1);
      expect(results[0].category).toBe("food");
    });

    test("getByTag filters phrases by tag", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockPhrases),
      );

      const results = await db.savedPhrases.getByTag("transport");
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("phrase-1");
    });

    test("search finds phrases by tag", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockPhrases),
      );

      const results = await db.savedPhrases.search("money");
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("phrase-3");
    });
  });

  describe("Clear Operations", () => {
    test("clearAll removes all saved phrases", async () => {
      await db.savedPhrases.clearAll();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@aios/saved_phrases",
        JSON.stringify([]),
      );
    });
  });
});
