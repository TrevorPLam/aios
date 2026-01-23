/**
 * How to Use:
 * - Call omnisearch.search(query, options) to retrieve grouped results.
 * - Use omnisearch.saveRecentSearch(...) to persist recent queries.
 *
 * UI integration example:
 * - OmnisearchScreen submits queries and renders results from omnisearch.search.
 *
 * Public API:
 * - SearchResultItem, GroupedSearchResults, SearchResultGroup, SearchOptions,
 *   RecentSearch, omnisearch.
 *
 * Expected usage pattern:
 * - Debounce user input and guard against empty queries before calling search.
 *
 * WHY: Consolidates cross-module search logic so every entry point stays consistent.
 */
/**
 * Omnisearch Engine
 *
 * Purpose (Plain English):
 * Search everything in the app from one place. Type "doctor" and see results from
 * Calendar (appointments), Contacts (doctors you know), Notes (medical notes),
 * Budget (medical expenses), etc. No need to remember which module has what.
 *
 * What it interacts with:
 * - All module databases (Notes, Tasks, Events, Contacts, etc.)
 * - Search UI component
 * - Recent searches storage
 * - Usage analytics
 *
 * Technical Implementation:
 * Queries all module storage layers in parallel, groups and ranks results.
 * Uses simple text matching with relevance scoring based on field importance
 * and recency. Future: could add fuzzy matching, synonyms, AI relevance.
 *
 * Safe AI Extension Points:
 * - Add new searchable modules
 * - Improve ranking algorithm
 * - Add search filters
 * - Add search suggestions
 *
 * Fragile Logic Warnings:
 * - Must query all modules efficiently (parallel, timeout)
 * - Ranking must feel intuitive (exact matches > partial matches)
 * - Empty results must be handled gracefully
 * - Search must be fast (<500ms) or show progress
 */

import { db } from "@platform/storage/database";
import { ModuleType } from "@contracts/models/types";

/**
 * Search Result Item
 *
 * Represents a single search result from any module.
 */
export interface SearchResultItem {
  id: string;
  moduleType: ModuleType;
  title: string;
  subtitle?: string;
  preview?: string;
  relevanceScore: number; // 0-100
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Grouped Search Results
 *
 * Results grouped by module for easy scanning.
 */
export interface GroupedSearchResults {
  query: string;
  totalResults: number;
  groups: SearchResultGroup[];
  searchTime: number; // milliseconds
}

/**
 * Search Result Group
 *
 * Results from one module.
 */
export interface SearchResultGroup {
  moduleType: ModuleType;
  moduleName: string;
  results: SearchResultItem[];
  totalCount: number; // May be more than results.length if limited
}

/**
 * Search Options
 */
export interface SearchOptions {
  maxResultsPerModule?: number; // Default: 5
  includeModules?: ModuleType[]; // If set, only search these modules
  excludeModules?: ModuleType[]; // If set, exclude these modules
  minRelevanceScore?: number; // Default: 30, range: 0-100
}

/**
 * Recent Search
 */
export interface RecentSearch {
  query: string;
  timestamp: string;
  resultCount: number;
}

/**
 * Module Search Function Type
 *
 * Each module implements its own search logic.
 */
type ModuleSearchFunction = (
  query: string,
  maxResults: number,
) => Promise<SearchResultItem[]>;

/**
 * Omnisearch Engine Class
 */
class OmnisearchEngine {
  private recentSearches: RecentSearch[] = [];
  private readonly MAX_RECENT_SEARCHES = 10;

  /**
   * Calculate Relevance Score
   *
   * Plain English: "How well does this match the search?"
   *
   * Technical: Simple text matching with boosting for:
   * - Exact matches (highest)
   * - Title matches (high)
   * - Starts-with matches (medium)
   * - Contains matches (lower)
   * - Recent items (slight boost)
   *
   * Why it exists: Users expect most relevant results first.
   *
   * Failure modes: Very long text can slow down matching.
   *
   * @param text - Text to search in
   * @param query - Search query
   * @param field - Field type (title, content, etc.) for boosting
   * @param recencyBoost - Optional boost for recent items (0-10)
   * @returns Relevance score (0-100)
   */
  private calculateRelevance(
    text: string,
    query: string,
    field: "title" | "content" | "metadata" = "content",
    recencyBoost: number = 0,
  ): number {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();

    let score = 0;

    // Exact match (very rare, very relevant)
    if (lowerText === lowerQuery) {
      score = 100;
    }
    // Starts with query
    else if (lowerText.startsWith(lowerQuery)) {
      score = 80;
    }
    // Contains whole query
    else if (lowerText.includes(lowerQuery)) {
      score = 60;
    }
    // Contains all query words
    else {
      const queryWords = lowerQuery.split(/\s+/);
      const matchedWords = queryWords.filter((word) =>
        lowerText.includes(word),
      );
      if (matchedWords.length > 0) {
        score = (matchedWords.length / queryWords.length) * 40;
      }
    }

    // Field-based boosting
    if (field === "title") {
      score *= 1.5; // Title matches are 50% more relevant
    } else if (field === "metadata") {
      score *= 0.8; // Metadata matches are 20% less relevant
    }

    // Recency boost (0-10 points)
    score += Math.min(recencyBoost, 10);

    return Math.min(Math.round(score), 100);
  }

  /**
   * Calculate Recency Boost
   *
   * Plain English: "Newer items get a small bump in ranking"
   *
   * @param date - ISO date string
   * @returns Boost value (0-10)
   */
  private calculateRecencyBoost(date?: string): number {
    if (!date) return 0;

    const now = new Date();
    const itemDate = new Date(date);
    const daysOld =
      (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24);

    // Items from today: +10 points
    if (daysOld < 1) return 10;
    // Items from this week: +7 points
    if (daysOld < 7) return 7;
    // Items from this month: +4 points
    if (daysOld < 30) return 4;
    // Older items: +0 points
    return 0;
  }

  /**
   * Search Notes
   */
  private async searchNotes(
    query: string,
    maxResults: number,
  ): Promise<SearchResultItem[]> {
    try {
      const allNotes = await db.notes.getAll();
      const results: SearchResultItem[] = [];

      for (const note of allNotes) {
        // Skip archived notes
        if (note.isArchived) continue;

        const titleScore = this.calculateRelevance(note.title, query, "title");
        const contentScore = this.calculateRelevance(
          note.bodyMarkdown,
          query,
          "content",
        );
        const tagsScore = note.tags
          .map((tag) => this.calculateRelevance(tag, query, "metadata"))
          .reduce((max, score) => Math.max(max, score), 0);

        const maxScore = Math.max(titleScore, contentScore, tagsScore);
        const recencyBoost = this.calculateRecencyBoost(note.updatedAt);
        const relevanceScore = maxScore + recencyBoost;

        if (relevanceScore > 0) {
          results.push({
            id: note.id,
            moduleType: "notebook",
            title: note.title,
            preview: note.bodyMarkdown.substring(0, 100),
            relevanceScore,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
            metadata: { tags: note.tags },
          });
        }
      }

      return results
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, maxResults);
    } catch (error) {
      console.error("Error searching notes:", error);
      return [];
    }
  }

  /**
   * Search Tasks
   */
  private async searchTasks(
    query: string,
    maxResults: number,
  ): Promise<SearchResultItem[]> {
    try {
      const allTasks = await db.tasks.getAll();
      const results: SearchResultItem[] = [];

      for (const task of allTasks) {
        // Skip completed/cancelled tasks
        if (task.status === "completed" || task.status === "cancelled")
          continue;

        const titleScore = this.calculateRelevance(task.title, query, "title");
        const descScore = task.userNotes
          ? this.calculateRelevance(task.userNotes, query, "content")
          : 0;

        const maxScore = Math.max(titleScore, descScore);
        const recencyBoost = this.calculateRecencyBoost(task.updatedAt);
        const relevanceScore = maxScore + recencyBoost;

        if (relevanceScore > 0) {
          results.push({
            id: task.id,
            moduleType: "planner",
            title: task.title,
            subtitle: task.projectId ? "Project Task" : undefined,
            preview: task.userNotes,
            relevanceScore,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            metadata: { status: task.status, priority: task.priority },
          });
        }
      }

      return results
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, maxResults);
    } catch (error) {
      console.error("Error searching tasks:", error);
      return [];
    }
  }

  /**
   * Search Calendar Events
   */
  private async searchEvents(
    query: string,
    maxResults: number,
  ): Promise<SearchResultItem[]> {
    try {
      const allEvents = await db.events.getAll();
      const results: SearchResultItem[] = [];

      for (const event of allEvents) {
        const titleScore = this.calculateRelevance(event.title, query, "title");
        const descScore = event.description
          ? this.calculateRelevance(event.description, query, "content")
          : 0;
        const locationScore = event.location
          ? this.calculateRelevance(event.location, query, "metadata")
          : 0;

        const maxScore = Math.max(titleScore, descScore, locationScore);
        const recencyBoost = this.calculateRecencyBoost(event.startAt);
        const relevanceScore = maxScore + recencyBoost;

        if (relevanceScore > 0) {
          const startDate = new Date(event.startAt);
          results.push({
            id: event.id,
            moduleType: "calendar",
            title: event.title,
            subtitle: `${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString()}`,
            preview: event.description,
            relevanceScore,
            createdAt: event.createdAt,
            metadata: { location: event.location, allDay: event.allDay },
          });
        }
      }

      return results
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, maxResults);
    } catch (error) {
      console.error("Error searching events:", error);
      return [];
    }
  }

  /**
   * Search Contacts
   */
  private async searchContacts(
    query: string,
    maxResults: number,
  ): Promise<SearchResultItem[]> {
    try {
      const allContacts = await db.contacts.getAll();
      const results: SearchResultItem[] = [];

      for (const contact of allContacts) {
        const nameScore = this.calculateRelevance(contact.name, query, "title");
        const emailScore = contact.emails.length > 0
          ? this.calculateRelevance(contact.emails[0], query, "metadata")
          : 0;
        const phoneScore = contact.phoneNumbers.length > 0
          ? this.calculateRelevance(contact.phoneNumbers[0], query, "metadata")
          : 0;

        const maxScore = Math.max(nameScore, emailScore, phoneScore);
        const relevanceScore = maxScore;

        if (relevanceScore > 0) {
          results.push({
            id: contact.id,
            moduleType: "contacts",
            title: contact.name,
            subtitle: contact.emails[0] || contact.phoneNumbers[0],
            relevanceScore,
            metadata: { email: contact.emails[0], phone: contact.phoneNumbers[0] },
          });
        }
      }

      return results
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, maxResults);
    } catch (error) {
      console.error("Error searching contacts:", error);
      return [];
    }
  }

  /**
   * Search Lists
   */
  private async searchLists(
    query: string,
    maxResults: number,
  ): Promise<SearchResultItem[]> {
    try {
      const allLists = await db.lists.getAll();
      const results: SearchResultItem[] = [];

      for (const list of allLists) {
        const titleScore = this.calculateRelevance(list.title, query, "title");

        // Search in list items too
        let itemScore = 0;
        for (const item of list.items) {
          const score = this.calculateRelevance(item.text, query, "content");
          itemScore = Math.max(itemScore, score);
        }

        const maxScore = Math.max(titleScore, itemScore);
        const recencyBoost = this.calculateRecencyBoost(list.updatedAt);
        const relevanceScore = maxScore + recencyBoost;

        if (relevanceScore > 0) {
          results.push({
            id: list.id,
            moduleType: "lists",
            title: list.title,
            subtitle: `${list.items.length} items`,
            relevanceScore,
            createdAt: list.createdAt,
            updatedAt: list.updatedAt,
            metadata: { category: list.category },
          });
        }
      }

      return results
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, maxResults);
    } catch (error) {
      console.error("Error searching lists:", error);
      return [];
    }
  }

  /**
   * Get Module Search Functions
   *
   * Maps module types to their search functions.
   */
  private getModuleSearchFunctions(): Map<ModuleType, ModuleSearchFunction> {
    return new Map([
      ["notebook", this.searchNotes.bind(this)],
      ["planner", this.searchTasks.bind(this)],
      ["calendar", this.searchEvents.bind(this)],
      ["contacts", this.searchContacts.bind(this)],
      ["lists", this.searchLists.bind(this)],
      // Add more modules as needed
    ]);
  }

  /**
   * Search All Modules
   *
   * Plain English: "Search everything and group results by type"
   *
   * Technical: Queries all registered modules in parallel, groups and ranks results.
   * Returns grouped results for UI to display by module.
   *
   * Why it exists: Users shouldn't need to know which module has their data.
   *
   * Failure modes: If one module fails, others still return results.
   * Very long queries or huge datasets could be slow.
   *
   * @param query - Search query
   * @param options - Search options
   * @returns Grouped search results
   */
  async search(
    query: string,
    options: SearchOptions = {},
  ): Promise<GroupedSearchResults> {
    const startTime = Date.now();

    const {
      maxResultsPerModule = 5,
      includeModules,
      excludeModules,
      minRelevanceScore = 30,
    } = options;

    // Get all search functions
    const searchFunctions = this.getModuleSearchFunctions();

    // Filter based on options
    const modulesToSearch = Array.from(searchFunctions.entries()).filter(
      ([moduleType]) => {
        if (includeModules && !includeModules.includes(moduleType)) {
          return false;
        }
        if (excludeModules && excludeModules.includes(moduleType)) {
          return false;
        }
        return true;
      },
    );

    // Search all modules in parallel
    const searchPromises = modulesToSearch.map(
      async ([moduleType, searchFn]) => {
        try {
          const results = await searchFn(query, maxResultsPerModule);
          return { moduleType, results };
        } catch (error) {
          console.error(`Error searching ${moduleType}:`, error);
          return { moduleType, results: [] };
        }
      },
    );

    const moduleResults = await Promise.all(searchPromises);

    // Filter by minimum relevance and group
    const groups: SearchResultGroup[] = moduleResults
      .map(({ moduleType, results }) => {
        const filteredResults = results.filter(
          (r) => r.relevanceScore >= minRelevanceScore,
        );

        return {
          moduleType,
          moduleName: this.getModuleName(moduleType),
          results: filteredResults,
          totalCount: filteredResults.length,
        };
      })
      .filter((group) => group.totalCount > 0)
      .sort((a, b) => {
        // Sort groups by highest relevance score in group
        const maxA = Math.max(...a.results.map((r) => r.relevanceScore));
        const maxB = Math.max(...b.results.map((r) => r.relevanceScore));
        return maxB - maxA;
      });

    const totalResults = groups.reduce((sum, g) => sum + g.totalCount, 0);
    const searchTime = Date.now() - startTime;

    // Save to recent searches
    this.addRecentSearch({
      query,
      resultCount: totalResults,
      timestamp: new Date().toISOString(),
    });

    return {
      query,
      totalResults,
      groups,
      searchTime,
    };
  }

  /**
   * Get Module Name
   *
   * Plain English: "Convert module ID to friendly name"
   */
  private getModuleName(moduleType: ModuleType): string {
    const names: Record<ModuleType, string> = {
      command: "Command Center",
      notebook: "Notebook",
      planner: "Planner",
      calendar: "Calendar",
      email: "Email",
      lists: "Lists",
      alerts: "Alerts",
      photos: "Photos",
      messages: "Messages",
      contacts: "Contacts",
      translator: "Translator",
      budget: "Budget",
      history: "History",
    };
    return names[moduleType] || moduleType;
  }

  /**
   * Add Recent Search
   */
  private addRecentSearch(search: RecentSearch): void {
    // Remove duplicates
    this.recentSearches = this.recentSearches.filter(
      (s) => s.query.toLowerCase() !== search.query.toLowerCase(),
    );

    // Add to front
    this.recentSearches.unshift(search);

    // Limit size
    if (this.recentSearches.length > this.MAX_RECENT_SEARCHES) {
      this.recentSearches = this.recentSearches.slice(
        0,
        this.MAX_RECENT_SEARCHES,
      );
    }
  }

  /**
   * Get Recent Searches
   */
  getRecentSearches(): RecentSearch[] {
    return [...this.recentSearches];
  }

  /**
   * Clear Recent Searches
   */
  clearRecentSearches(): void {
    this.recentSearches = [];
  }
}

// Export singleton instance
export const omnisearch = new OmnisearchEngine();
