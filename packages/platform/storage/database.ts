import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Recommendation,
  RecommendationDecision,
  Note,
  Task,
  TaskStatus,
  Project,
  CalendarEvent,
  CalendarReminderTrigger,
  Settings,
  HistoryLogEntry,
  AILimits,
  DEFAULT_SETTINGS,
  TIER_LIMITS,
  List,
  ListItemPriority,
  Alert,
  Photo,
  PhotoAlbum,
  Message,
  Conversation,
  Contact,
  Budget,
  Integration,
  AlertHistoryEntry,
  AlertStatistics,
  AlertTrigger,
  ContactGroup,
  EmailThread,
  EmailMessage,
  Translation,
  SavedPhrase,
  TranslationStatistics,
  TranslationRetentionPolicy,
  ModuleType,
  TaskPriority,
  HistoryExportSchedule,
  HistoryExportFrequency,
} from "@aios/contracts/models/types";
import { generateId } from "@aios/platform/lib/helpers";
import {
  isBirthdayInRange,
  sortByUpcomingBirthday,
  validateTag,
  validateGroup,
  validateNote,
  arePotentialDuplicates,
  matchesSearchQuery,
} from "@aios/features/contacts/domain/contactHelpers";

const KEYS = {
  RECOMMENDATIONS: "@aios/recommendations",
  DECISIONS: "@aios/decisions",
  NOTES: "@aios/notes",
  TASKS: "@aios/tasks",
  PROJECTS: "@aios/projects",
  EVENTS: "@aios/events",
  SETTINGS: "@aios/settings",
  HISTORY: "@aios/history",
  AI_LIMITS: "@aios/ai_limits",
  INITIALIZED: "@aios/initialized",
  LISTS: "@aios/lists",
  ALERTS: "@aios/alerts",
  ALERT_HISTORY: "@aios/alert_history",
  PHOTOS: "@aios/photos",
  PHOTO_ALBUMS: "@aios/photo_albums",
  MESSAGES: "@aios/messages",
  CONVERSATIONS: "@aios/conversations",
  CONTACTS: "@aios/contacts",
  CONTACT_GROUPS: "@aios/contact_groups",
  BUDGETS: "@aios/budgets",
  INTEGRATIONS: "@aios/integrations",
  EMAIL_THREADS: "@aios/email_threads",
  TRANSLATIONS: "@aios/translations",
  SAVED_PHRASES: "@aios/saved_phrases",
  HISTORY_EXPORT_SCHEDULE: "@aios/history_export_schedule",
  TRANSLATION_RETENTION: "@aios/translation_retention",
};

async function getData<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

async function setData<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save ${key}:`, error);
  }
}

/**
 * Messaging helpers
 *
 * Centralizes small, reusable transforms to keep message operations consistent.
 * These utilities support AI-assisted iteration by documenting intent and flow.
 */
const MESSAGE_PREVIEW_LIMIT = 80;
const DEFAULT_HISTORY_EXPORT_SCHEDULE: HistoryExportSchedule = {
  enabled: false,
  frequency: "weekly",
  lastExportAt: null,
  nextExportAt: null,
  format: "json",
};
const DEFAULT_TRANSLATION_RETENTION_POLICY: TranslationRetentionPolicy = {
  maxEntries: 250,
  maxAgeDays: 90,
  keepFavorites: true,
};

function normalizeTranslationRetentionPolicy(
  policy: TranslationRetentionPolicy | null,
): TranslationRetentionPolicy {
  if (!policy || typeof policy !== "object" || Array.isArray(policy)) {
    return DEFAULT_TRANSLATION_RETENTION_POLICY;
  }

  return {
    maxEntries:
      Number.isFinite(policy.maxEntries) && policy.maxEntries > 0
        ? policy.maxEntries
        : DEFAULT_TRANSLATION_RETENTION_POLICY.maxEntries,
    maxAgeDays:
      policy.maxAgeDays === null || Number.isFinite(policy.maxAgeDays)
        ? policy.maxAgeDays
        : DEFAULT_TRANSLATION_RETENTION_POLICY.maxAgeDays,
    keepFavorites:
      typeof policy.keepFavorites === "boolean"
        ? policy.keepFavorites
        : DEFAULT_TRANSLATION_RETENTION_POLICY.keepFavorites,
  };
}

function buildMessagePreview(content: string): string {
  const trimmed = content.trim();
  if (trimmed.length <= MESSAGE_PREVIEW_LIMIT) return trimmed;
  return `${trimmed.slice(0, MESSAGE_PREVIEW_LIMIT - 1)}…`;
}

function buildMessageSearchIndex(message: Message): string {
  const attachmentTokens = message.attachments
    .map((attachment) => attachment.fileName || attachment.url)
    .filter(Boolean);

  return [message.content, message.senderName, ...attachmentTokens]
    .join(" ")
    .toLowerCase();
}

/**
 * Calendar recurrence helpers
 *
 * Centralizes recurring expansion logic for planner-friendly scheduling hooks.
 * These utilities stay UI-neutral while enabling downstream reminders.
 */
const OCCURRENCE_ID_DELIMITER = "::";

function toDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function toOccurrenceId(eventId: string, dateKey: string): string {
  return `${eventId}${OCCURRENCE_ID_DELIMITER}${dateKey}`;
}

function applyEventOverride(
  event: CalendarEvent,
  dateKey: string,
): CalendarEvent {
  const override = event.overrides[dateKey];
  if (!override) return event;
  return {
    ...event,
    ...override,
  };
}

function buildRecurringOccurrences(
  event: CalendarEvent,
  startDate: Date,
  endDate: Date,
): CalendarEvent[] {
  if (event.recurrenceRule === "none" || event.recurrenceRule === "custom") {
    return [];
  }

  const occurrences: CalendarEvent[] = [];
  const exceptions = event.exceptions || [];
  const overrides = event.overrides || {};
  const cursor = new Date(event.startAt);
  const rangeStart = new Date(startDate);
  const rangeEnd = new Date(endDate);

  if (cursor > rangeEnd) return [];

  const advanceCursor = (): void => {
    switch (event.recurrenceRule) {
      case "daily":
        cursor.setDate(cursor.getDate() + 1);
        break;
      case "weekly":
        cursor.setDate(cursor.getDate() + 7);
        break;
      case "monthly":
        cursor.setMonth(cursor.getMonth() + 1);
        break;
      default:
        cursor.setDate(cursor.getDate() + 1);
        break;
    }
  };

  while (cursor <= rangeEnd) {
    if (cursor >= rangeStart) {
      const dateKey = toDateKey(cursor);
      if (!exceptions.includes(dateKey)) {
        const overridden = applyEventOverride({ ...event, overrides }, dateKey);
        const instanceStart = new Date(overridden.startAt);
        const instanceEnd = new Date(overridden.endAt);
        const timeDelta =
          new Date(overridden.endAt).getTime() -
          new Date(overridden.startAt).getTime();

        instanceStart.setUTCFullYear(
          cursor.getUTCFullYear(),
          cursor.getUTCMonth(),
          cursor.getUTCDate(),
        );
        instanceEnd.setTime(instanceStart.getTime() + timeDelta);

        occurrences.push({
          ...overridden,
          id: toOccurrenceId(event.id, dateKey),
          recurrenceInstanceOf: event.id,
          startAt: instanceStart.toISOString(),
          endAt: instanceEnd.toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
    advanceCursor();
  }

  return occurrences;
}

/**
 * Alert scheduling helpers
 *
 * Provides non-UI scheduling hooks for notifications.
 */
function getNextAlertTrigger(
  alert: Alert,
  after: Date = new Date(),
): string | null {
  const baseTime = new Date(alert.time);
  if (alert.recurrenceRule === "none") {
    return baseTime > after ? baseTime.toISOString() : null;
  }

  const candidate = new Date(baseTime);

  while (candidate <= after) {
    switch (alert.recurrenceRule) {
      case "daily":
        candidate.setDate(candidate.getDate() + 1);
        break;
      case "weekly":
        candidate.setDate(candidate.getDate() + 7);
        break;
      case "monthly":
        candidate.setMonth(candidate.getMonth() + 1);
        break;
      default:
        candidate.setDate(candidate.getDate() + 1);
        break;
    }
  }

  return candidate.toISOString();
}

function buildHistoryExportNextAt(
  frequency: HistoryExportFrequency,
  from: Date,
): Date {
  const next = new Date(from);
  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
  }
  return next;
}

export const db = {
  /**
   * Recommendations Module
   *
   * Manages AI recommendation storage and filtering.
   * Recommendations are time-sensitive suggestions with confidence levels.
   */
  recommendations: {
    /**
     * Get all recommendations from storage
     *
     * @returns {Promise<Recommendation[]>} Array of all recommendations
     */
    async getAll(): Promise<Recommendation[]> {
      return getData(KEYS.RECOMMENDATIONS, []);
    },

    /**
     * Get only active, non-expired recommendations
     * Filters by status "active" and expiresAt > current time
     *
     * @returns {Promise<Recommendation[]>} Array of active recommendations
     */
    async getActive(): Promise<Recommendation[]> {
      const all = await this.getAll();
      const now = new Date().toISOString();
      return all.filter((r) => r.status === "active" && r.expiresAt > now);
    },

    /**
     * Save a recommendation (create new or update existing)
     *
     * @param {Recommendation} rec - The recommendation to save
     * @returns {Promise<void>}
     */
    async save(rec: Recommendation): Promise<void> {
      const all = await this.getAll();
      const index = all.findIndex((r) => r.id === rec.id);
      if (index >= 0) {
        all[index] = rec;
      } else {
        all.push(rec);
      }
      await setData(KEYS.RECOMMENDATIONS, all);
    },

    /**
     * Replace all recommendations at once
     * Useful for batch updates from AI service
     *
     * @param {Recommendation[]} recs - Array of recommendations to save
     * @returns {Promise<void>}
     */
    async saveAll(recs: Recommendation[]): Promise<void> {
      await setData(KEYS.RECOMMENDATIONS, recs);
    },

    /**
     * Update recommendation status (active, accepted, declined, expired)
     *
     * @param {string} id - The recommendation ID
     * @param {Recommendation["status"]} status - New status value
     * @returns {Promise<void>}
     */
    async updateStatus(
      id: string,
      status: Recommendation["status"],
    ): Promise<void> {
      const all = await this.getAll();
      const rec = all.find((r) => r.id === id);
      if (rec) {
        rec.status = status;
        await setData(KEYS.RECOMMENDATIONS, all);
      }
    },

    /**
     * Mark a recommendation as opened/viewed by the user.
     * Sets the openedAt timestamp to track when recommendation was first viewed.
     * Used to remove the "new" glow indicator from recommendation cards.
     *
     * Behavior:
     * - Only sets openedAt if not already set (idempotent)
     * - Does not update if recommendation already has openedAt value
     * - Returns silently if recommendation ID not found
     *
     * Use Case:
     * Called when user taps a recommendation card to view details.
     * Fire-and-forget pattern used in UI to avoid blocking navigation.
     *
     * @param {string} id - The recommendation ID to mark as opened
     * @returns {Promise<void>}
     *
     * @example
     * // Mark recommendation as opened when user views it
     * await db.recommendations.markAsOpened(recommendationId);
     */
    async markAsOpened(id: string): Promise<void> {
      const all = await this.getAll();
      const rec = all.find((r) => r.id === id);

      // Only update if recommendation exists and hasn't been opened yet
      if (rec && !rec.openedAt) {
        rec.openedAt = new Date().toISOString();
        await setData(KEYS.RECOMMENDATIONS, all);
      }
    },

    /**
     * Get recommendation history (accepted, declined, expired)
     * Sorted by most recent first
     *
     * @param {number} limit - Maximum number of items to return
     * @returns {Promise<Recommendation[]>} Array of historical recommendations
     */
    async getHistory(limit: number = 50): Promise<Recommendation[]> {
      const all = await this.getAll();
      return all
        .filter((r) => r.status !== "active")
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, limit);
    },

    /**
     * Get recommendations by module
     *
     * @param {ModuleType} module - Module to filter by
     * @returns {Promise<Recommendation[]>} Recommendations for the module
     */
    async getByModule(module: ModuleType): Promise<Recommendation[]> {
      const all = await this.getAll();
      return all.filter((r) => r.module === module);
    },

    /**
     * Get recommendations by status
     *
     * @param {Recommendation["status"]} status - Status to filter by
     * @returns {Promise<Recommendation[]>} Recommendations with the status
     */
    async getByStatus(
      status: Recommendation["status"],
    ): Promise<Recommendation[]> {
      const all = await this.getAll();
      return all.filter((r) => r.status === status);
    },

    /**
     * Get recommendation statistics
     * Provides insights into recommendation usage and effectiveness
     *
     * @returns {Promise<Object>} Statistics object with counts and rates
     */
    async getStatistics(): Promise<{
      total: number;
      active: number;
      accepted: number;
      declined: number;
      expired: number;
      acceptanceRate: number;
      byModule: Record<ModuleType, number>;
      byPriority: Record<TaskPriority, number>;
    }> {
      const all = await this.getAll();
      const activeRecs = all.filter((r) => r.status === "active");
      const acceptedRecs = all.filter((r) => r.status === "accepted");
      const declinedRecs = all.filter((r) => r.status === "declined");
      const expiredRecs = all.filter((r) => r.status === "expired");

      const totalDecided = acceptedRecs.length + declinedRecs.length;
      const PERCENTAGE_MULTIPLIER = 100;
      const acceptanceRate =
        totalDecided > 0
          ? (acceptedRecs.length / totalDecided) * PERCENTAGE_MULTIPLIER
          : 0;

      const byModule = all.reduce(
        (acc, rec) => {
          acc[rec.module] = (acc[rec.module] || 0) + 1;
          return acc;
        },
        {} as Record<ModuleType, number>,
      );

      const byPriority = all.reduce(
        (acc, rec) => {
          acc[rec.priority] = (acc[rec.priority] || 0) + 1;
          return acc;
        },
        {} as Record<TaskPriority, number>,
      );

      return {
        total: all.length,
        active: activeRecs.length,
        accepted: acceptedRecs.length,
        declined: declinedRecs.length,
        expired: expiredRecs.length,
        acceptanceRate: Math.round(acceptanceRate),
        byModule,
        byPriority,
      };
    },

    /**
     * Delete old recommendations (older than specified days)
     * Helps maintain database performance
     *
     * @param {number} days - Delete recommendations older than this many days
     * @returns {Promise<number>} Number of deleted recommendations
     */
    async deleteOld(days: number = 30): Promise<number> {
      const all = await this.getAll();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const toKeep = all.filter((r) => {
        const createdDate = new Date(r.createdAt);
        return createdDate > cutoffDate || r.status === "active";
      });

      const deletedCount = all.length - toKeep.length;
      if (deletedCount > 0) {
        await setData(KEYS.RECOMMENDATIONS, toKeep);
      }

      return deletedCount;
    },
  },

  decisions: {
    async getAll(): Promise<RecommendationDecision[]> {
      return getData(KEYS.DECISIONS, []);
    },
    async save(decision: RecommendationDecision): Promise<void> {
      const all = await this.getAll();
      all.push(decision);
      await setData(KEYS.DECISIONS, all);
    },
  },

  /**
   * Notes Module
   *
   * Manages markdown note storage with support for tags, links,
   * pinning, archiving, searching, and comprehensive filtering.
   * Provides statistics and bulk operations for efficient note management.
   */
  notes: {
    /**
     * Get all notes from storage
     *
     * @returns {Promise<Note[]>} Array of all notes
     */
    async getAll(): Promise<Note[]> {
      return getData(KEYS.NOTES, []);
    },

    /**
     * Get a specific note by ID
     *
     * @param {string} id - The note ID
     * @returns {Promise<Note | null>} The note if found, null otherwise
     */
    async get(id: string): Promise<Note | null> {
      const all = await this.getAll();
      return all.find((n) => n.id === id) || null;
    },

    /**
     * Get active (non-archived) notes
     *
     * @returns {Promise<Note[]>} Array of active notes
     */
    async getActive(): Promise<Note[]> {
      const all = await this.getAll();
      return all.filter((n) => !n.isArchived);
    },

    /**
     * Get archived notes
     *
     * @returns {Promise<Note[]>} Array of archived notes
     */
    async getArchived(): Promise<Note[]> {
      const all = await this.getAll();
      return all.filter((n) => n.isArchived === true);
    },

    /**
     * Get pinned notes (excluding archived)
     *
     * @returns {Promise<Note[]>} Array of pinned notes
     */
    async getPinned(): Promise<Note[]> {
      const all = await this.getAll();
      return all.filter((n) => n.isPinned === true && !n.isArchived);
    },

    /**
     * Get notes by specific tag
     *
     * @param {string} tag - The tag to filter by
     * @returns {Promise<Note[]>} Array of notes with the specified tag
     */
    async getByTag(tag: string): Promise<Note[]> {
      const all = await this.getAll();
      return all.filter((n) => n.tags.includes(tag) && !n.isArchived);
    },

    /**
     * Get notes that contain any of the specified tags
     *
     * @param {string[]} tags - Array of tags to filter by
     * @returns {Promise<Note[]>} Array of notes matching any tag
     */
    async getByAnyTag(tags: string[]): Promise<Note[]> {
      const all = await this.getAll();
      return all.filter(
        (n) => n.tags.some((tag) => tags.includes(tag)) && !n.isArchived,
      );
    },

    /**
     * Get all unique tags across all notes
     *
     * @returns {Promise<string[]>} Array of unique tag names, sorted alphabetically
     */
    async getAllTags(): Promise<string[]> {
      const all = await this.getAll();
      const tags = new Set<string>();
      all.forEach((note) => {
        note.tags.forEach((tag) => tags.add(tag));
      });
      return Array.from(tags).sort();
    },

    /**
     * Search notes by query string
     * Searches across title, body content, and tags
     *
     * @param {string} query - Search query string
     * @returns {Promise<Note[]>} Array of matching notes
     */
    async search(query: string): Promise<Note[]> {
      if (!query.trim()) {
        return this.getActive();
      }

      const all = await this.getActive();
      const lowerQuery = query.toLowerCase();

      return all.filter((note) => {
        // Search in title
        if (note.title.toLowerCase().includes(lowerQuery)) {
          return true;
        }

        // Search in body markdown
        if (note.bodyMarkdown.toLowerCase().includes(lowerQuery)) {
          return true;
        }

        // Search in tags
        if (note.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))) {
          return true;
        }

        return false;
      });
    },

    /**
     * Get notes sorted by specified criteria
     *
     * @param {string} sortBy - Sort criteria: 'recent', 'alphabetical', 'tags', 'wordCount'
     * @param {string} order - Sort order: 'asc' or 'desc' (default: 'desc')
     * @returns {Promise<Note[]>} Array of sorted notes (pinned notes always first)
     */
    async getSorted(
      sortBy: "recent" | "alphabetical" | "tags" | "wordCount" = "recent",
      order: "asc" | "desc" = "desc",
    ): Promise<Note[]> {
      const notes = await this.getActive();

      const sorted = notes.sort((a, b) => {
        // Pinned notes always come first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        let comparison = 0;

        switch (sortBy) {
          case "alphabetical":
            comparison = a.title.localeCompare(b.title);
            break;
          case "tags":
            comparison = a.tags.length - b.tags.length;
            break;
          case "wordCount": {
            const aWords = a.bodyMarkdown.split(/\s+/).filter(Boolean).length;
            const bWords = b.bodyMarkdown.split(/\s+/).filter(Boolean).length;
            comparison = aWords - bWords;
            break;
          }
          case "recent":
          default:
            comparison =
              new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
            break;
        }

        return order === "desc" ? -comparison : comparison;
      });

      return sorted;
    },

    /**
     * Get note statistics
     *
     * @returns {Promise<object>} Object containing various note statistics
     */
    async getStatistics(): Promise<{
      totalNotes: number;
      activeNotes: number;
      archivedNotes: number;
      pinnedNotes: number;
      totalWords: number;
      averageWordsPerNote: number;
      totalTags: number;
      uniqueTags: number;
      notesWithTags: number;
      notesWithLinks: number;
    }> {
      const all = await this.getAll();
      const active = all.filter((n) => !n.isArchived);
      const archived = all.filter((n) => n.isArchived);
      const pinned = all.filter((n) => n.isPinned && !n.isArchived);

      let totalWords = 0;
      let totalTags = 0;
      let notesWithTags = 0;
      let notesWithLinks = 0;
      const uniqueTagsSet = new Set<string>();

      all.forEach((note) => {
        const words = note.bodyMarkdown.split(/\s+/).filter(Boolean).length;
        totalWords += words;
        totalTags += note.tags.length;

        if (note.tags.length > 0) {
          notesWithTags++;
          note.tags.forEach((tag) => uniqueTagsSet.add(tag));
        }

        if (note.links.length > 0) {
          notesWithLinks++;
        }
      });

      return {
        totalNotes: all.length,
        activeNotes: active.length,
        archivedNotes: archived.length,
        pinnedNotes: pinned.length,
        totalWords,
        averageWordsPerNote:
          all.length > 0 ? Math.round(totalWords / all.length) : 0,
        totalTags,
        uniqueTags: uniqueTagsSet.size,
        notesWithTags,
        notesWithLinks,
      };
    },

    /**
     * Calculate word count for a note
     *
     * @param {string} noteId - The note ID
     * @returns {Promise<number>} Word count of the note
     */
    async getWordCount(noteId: string): Promise<number> {
      const note = await this.get(noteId);
      if (!note) return 0;
      return note.bodyMarkdown.split(/\s+/).filter(Boolean).length;
    },

    /**
     * Add a tag to a note
     *
     * @param {string} noteId - The note ID
     * @param {string} tag - The tag to add
     * @returns {Promise<void>}
     */
    async addTag(noteId: string, tag: string): Promise<void> {
      const note = await this.get(noteId);
      if (!note) return;

      if (!note.tags.includes(tag)) {
        note.tags.push(tag);
        note.updatedAt = new Date().toISOString();
        await this.save(note);
      }
    },

    /**
     * Remove a tag from a note
     *
     * @param {string} noteId - The note ID
     * @param {string} tag - The tag to remove
     * @returns {Promise<void>}
     */
    async removeTag(noteId: string, tag: string): Promise<void> {
      const note = await this.get(noteId);
      if (!note) return;

      note.tags = note.tags.filter((t) => t !== tag);
      note.updatedAt = new Date().toISOString();
      await this.save(note);
    },

    /**
     * Bulk add tags to multiple notes
     *
     * @param {string[]} noteIds - Array of note IDs
     * @param {string[]} tags - Array of tags to add
     * @returns {Promise<void>}
     */
    async bulkAddTags(noteIds: string[], tags: string[]): Promise<void> {
      const all = await this.getAll();
      const updatedAt = new Date().toISOString();

      const updated = all.map((note) => {
        if (noteIds.includes(note.id)) {
          const newTags = [...note.tags];
          tags.forEach((tag) => {
            if (!newTags.includes(tag)) {
              newTags.push(tag);
            }
          });
          return { ...note, tags: newTags, updatedAt };
        }
        return note;
      });

      await setData(KEYS.NOTES, updated);
    },

    /**
     * Bulk archive/unarchive multiple notes
     *
     * @param {string[]} noteIds - Array of note IDs
     * @param {boolean} archive - True to archive, false to unarchive
     * @returns {Promise<void>}
     */
    async bulkArchive(noteIds: string[], archive: boolean): Promise<void> {
      const all = await this.getAll();
      const updatedAt = new Date().toISOString();

      const updated = all.map((note) => {
        if (noteIds.includes(note.id)) {
          return { ...note, isArchived: archive, updatedAt };
        }
        return note;
      });

      await setData(KEYS.NOTES, updated);
    },

    /**
     * Bulk pin/unpin multiple notes
     *
     * @param {string[]} noteIds - Array of note IDs
     * @param {boolean} pin - True to pin, false to unpin
     * @returns {Promise<void>}
     */
    async bulkPin(noteIds: string[], pin: boolean): Promise<void> {
      const all = await this.getAll();
      const updatedAt = new Date().toISOString();

      const updated = all.map((note) => {
        if (noteIds.includes(note.id)) {
          return { ...note, isPinned: pin, updatedAt };
        }
        return note;
      });

      await setData(KEYS.NOTES, updated);
    },

    /**
     * Bulk delete multiple notes
     *
     * @param {string[]} noteIds - Array of note IDs to delete
     * @returns {Promise<void>}
     */
    async bulkDelete(noteIds: string[]): Promise<void> {
      const all = await this.getAll();
      const filtered = all.filter((n) => !noteIds.includes(n.id));
      await setData(KEYS.NOTES, filtered);
    },

    /**
     * Find notes with similar content (potential duplicates)
     *
     * @param {string} noteId - The note ID to compare against
     * @param {number} threshold - Similarity threshold (0-1, default: 0.7)
     * @returns {Promise<Note[]>} Array of potentially similar notes
     */
    async findSimilar(
      noteId: string,
      threshold: number = 0.7,
    ): Promise<Note[]> {
      const targetNote = await this.get(noteId);
      if (!targetNote) return [];

      const all = await this.getActive();
      const similar: Note[] = [];

      const targetWords = new Set(
        targetNote.bodyMarkdown.toLowerCase().split(/\s+/).filter(Boolean),
      );

      all.forEach((note) => {
        if (note.id === noteId) return;

        const noteWords = new Set(
          note.bodyMarkdown.toLowerCase().split(/\s+/).filter(Boolean),
        );

        // Calculate Jaccard similarity
        const intersection = new Set(
          [...targetWords].filter((word) => noteWords.has(word)),
        );
        const union = new Set([...targetWords, ...noteWords]);
        const similarity = intersection.size / union.size;

        if (similarity >= threshold) {
          similar.push(note);
        }
      });

      return similar;
    },

    /**
     * Save a note (create or update)
     *
     * @param {Note} note - The note to save
     * @returns {Promise<void>}
     */
    async save(note: Note): Promise<void> {
      const all = await this.getAll();
      const index = all.findIndex((n) => n.id === note.id);
      if (index >= 0) {
        all[index] = note;
      } else {
        all.push(note);
      }
      await setData(KEYS.NOTES, all);
    },

    /**
     * Delete a note by ID
     *
     * @param {string} id - The note ID to delete
     * @returns {Promise<void>}
     */
    async delete(id: string): Promise<void> {
      const all = await this.getAll();
      const filtered = all.filter((n) => n.id !== id);
      await setData(KEYS.NOTES, filtered);
    },
  },

  /**
   * Tasks Module
   *
   * Manages task storage operations with support for hierarchical tasks,
   * filtering, searching, and statistics tracking.
   */
  tasks: {
    /**
     * Get all tasks from storage
     *
     * @returns {Promise<Task[]>} Array of all tasks
     */
    async getAll(): Promise<Task[]> {
      return getData(KEYS.TASKS, []);
    },

    /**
     * Get a specific task by ID
     *
     * @param {string} id - The task ID
     * @returns {Promise<Task | null>} The task if found, null otherwise
     */
    async get(id: string): Promise<Task | null> {
      const all = await this.getAll();
      return all.find((t) => t.id === id) || null;
    },

    /**
     * Get all top-level tasks (tasks without parent)
     *
     * @returns {Promise<Task[]>} Array of top-level tasks
     */
    async getTopLevel(): Promise<Task[]> {
      const all = await this.getAll();
      return all.filter((t) => !t.parentTaskId);
    },

    /**
     * Get all subtasks for a given parent task
     *
     * @param {string} parentId - The parent task ID
     * @returns {Promise<Task[]>} Array of subtasks
     */
    async getSubtasks(parentId: string): Promise<Task[]> {
      const all = await this.getAll();
      return all.filter((t) => t.parentTaskId === parentId);
    },

    /**
     * Check if a task has any subtasks
     *
     * @param {string} taskId - The task ID to check
     * @returns {Promise<boolean>} True if task has subtasks, false otherwise
     */
    async hasSubtasks(taskId: string): Promise<boolean> {
      const all = await this.getAll();
      return all.some((t) => t.parentTaskId === taskId);
    },

    /**
     * Search tasks by title or user notes (case-insensitive)
     *
     * @param {string} query - Search query string
     * @returns {Promise<Task[]>} Array of matching tasks
     */
    async search(query: string): Promise<Task[]> {
      const all = await this.getAll();
      const lowerQuery = query.toLowerCase();
      return all.filter(
        (t) =>
          t.title.toLowerCase().includes(lowerQuery) ||
          (t.userNotes || "").toLowerCase().includes(lowerQuery),
      );
    },

    /**
     * Filter tasks by status
     *
     * @param {TaskStatus} status - The status to filter by
     * @returns {Promise<Task[]>} Array of tasks with matching status
     */
    async getByStatus(status: TaskStatus): Promise<Task[]> {
      const all = await this.getAll();
      return all.filter((t) => t.status === status);
    },

    /**
     * Filter tasks by priority
     *
     * @param {TaskPriority} priority - The priority to filter by
     * @returns {Promise<Task[]>} Array of tasks with matching priority
     */
    async getByPriority(priority: TaskPriority): Promise<Task[]> {
      const all = await this.getAll();
      return all.filter((t) => t.priority === priority);
    },

    /**
     * Filter tasks by project
     *
     * @param {string} projectId - The project ID to filter by
     * @returns {Promise<Task[]>} Array of tasks in the specified project
     */
    async getByProject(projectId: string): Promise<Task[]> {
      const all = await this.getAll();
      return all.filter((t) => t.projectId === projectId);
    },

    /**
     * Get overdue tasks (due date in the past and not completed)
     *
     * @returns {Promise<Task[]>} Array of overdue tasks
     */
    async getOverdue(): Promise<Task[]> {
      const all = await this.getAll();
      const now = new Date().toISOString();
      return all.filter(
        (t) =>
          t.dueDate &&
          t.dueDate < now &&
          t.status !== "completed" &&
          t.status !== "cancelled",
      );
    },

    /**
     * Get tasks due today
     *
     * @returns {Promise<Task[]>} Array of tasks due today
     */
    async getDueToday(): Promise<Task[]> {
      const all = await this.getAll();
      const today = new Date().toISOString().split("T")[0];
      return all.filter((t) => t.dueDate && t.dueDate.startsWith(today));
    },

    /**
     * Get tasks due within the next N days
     *
     * @param {number} days - Number of days to look ahead
     * @returns {Promise<Task[]>} Array of tasks due in the specified period
     */
    async getDueInDays(days: number): Promise<Task[]> {
      const all = await this.getAll();
      const now = new Date();
      const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      const futureISO = future.toISOString();
      const nowISO = now.toISOString();

      return all.filter(
        (t) =>
          t.dueDate &&
          t.dueDate >= nowISO &&
          t.dueDate <= futureISO &&
          t.status !== "completed" &&
          t.status !== "cancelled",
      );
    },

    /**
     * Get task statistics for dashboard display
     *
     * @returns {Promise<object>} Object containing task statistics
     */
    async getStatistics(): Promise<{
      total: number;
      completed: number;
      inProgress: number;
      pending: number;
      overdue: number;
      dueToday: number;
      dueThisWeek: number;
      highPriority: number;
      urgent: number;
    }> {
      const all = await this.getAll();
      const now = new Date().toISOString();
      const today = now.split("T")[0];
      const weekFromNow = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString();

      return {
        total: all.length,
        completed: all.filter((t) => t.status === "completed").length,
        inProgress: all.filter((t) => t.status === "in_progress").length,
        pending: all.filter((t) => t.status === "pending").length,
        overdue: all.filter(
          (t) =>
            t.dueDate &&
            t.dueDate < now &&
            t.status !== "completed" &&
            t.status !== "cancelled",
        ).length,
        dueToday: all.filter((t) => t.dueDate && t.dueDate.startsWith(today))
          .length,
        dueThisWeek: all.filter(
          (t) =>
            t.dueDate &&
            t.dueDate >= now &&
            t.dueDate <= weekFromNow &&
            t.status !== "completed" &&
            t.status !== "cancelled",
        ).length,
        highPriority: all.filter((t) => t.priority === "high").length,
        urgent: all.filter((t) => t.priority === "urgent").length,
      };
    },

    /**
     * Get completion percentage for a parent task based on subtask completion
     *
     * @param {string} parentId - The parent task ID
     * @returns {Promise<number>} Completion percentage (0-100)
     */
    async getSubtaskProgress(parentId: string): Promise<number> {
      const subtasks = await this.getSubtasks(parentId);
      if (subtasks.length === 0) return 0;

      const completedCount = subtasks.filter(
        (t) => t.status === "completed",
      ).length;
      return Math.round((completedCount / subtasks.length) * 100);
    },

    /**
     * Bulk update task status
     *
     * @param {string[]} taskIds - Array of task IDs to update
     * @param {TaskStatus} status - The new status
     * @returns {Promise<void>}
     */
    async bulkUpdateStatus(
      taskIds: string[],
      status: TaskStatus,
    ): Promise<void> {
      const all = await this.getAll();
      const updated = all.map((t) =>
        taskIds.includes(t.id)
          ? { ...t, status, updatedAt: new Date().toISOString() }
          : t,
      );
      await setData(KEYS.TASKS, updated);
    },

    /**
     * Bulk delete tasks
     *
     * @param {string[]} taskIds - Array of task IDs to delete
     * @returns {Promise<void>}
     */
    async bulkDelete(taskIds: string[]): Promise<void> {
      const all = await this.getAll();
      const filtered = all.filter(
        (t) =>
          !taskIds.includes(t.id) && !taskIds.includes(t.parentTaskId || ""),
      );
      await setData(KEYS.TASKS, filtered);
    },

    /**
     * Save or update a task
     *
     * @param {Task} task - The task to save
     * @returns {Promise<void>}
     */
    async save(task: Task): Promise<void> {
      const all = await this.getAll();
      const index = all.findIndex((t) => t.id === task.id);
      if (index >= 0) {
        all[index] = task;
      } else {
        all.push(task);
      }
      await setData(KEYS.TASKS, all);
    },

    /**
     * Delete a task and all its subtasks (cascade delete)
     *
     * @param {string} id - The task ID to delete
     * @returns {Promise<void>}
     */
    async delete(id: string): Promise<void> {
      const all = await this.getAll();
      const filtered = all.filter((t) => t.id !== id && t.parentTaskId !== id);
      await setData(KEYS.TASKS, filtered);
    },
  },

  projects: {
    async getAll(): Promise<Project[]> {
      return getData(KEYS.PROJECTS, []);
    },
    async get(id: string): Promise<Project | null> {
      const all = await this.getAll();
      return all.find((p) => p.id === id) || null;
    },
    async save(project: Project): Promise<void> {
      const all = await this.getAll();
      const index = all.findIndex((p) => p.id === project.id);
      if (index >= 0) {
        all[index] = project;
      } else {
        all.push(project);
      }
      await setData(KEYS.PROJECTS, all);
    },
    async delete(id: string): Promise<void> {
      const all = await this.getAll();
      const filtered = all.filter((p) => p.id !== id);
      await setData(KEYS.PROJECTS, filtered);
    },
  },

  /**
   * Events Module
   *
   * Manages calendar event storage operations.
   * Supports event creation, editing, deletion, and date-based filtering.
   */
  /**
   * Calendar Events Module
   *
   * Manages calendar events with comprehensive date-based queries.
   * Supports recurring events, time zones, and flexible filtering.
   */
  events: {
    /**
     * Get all events from storage
     *
     * @returns {Promise<CalendarEvent[]>} Array of all calendar events
     */
    async getAll(): Promise<CalendarEvent[]> {
      return getData(KEYS.EVENTS, []);
    },

    /**
     * Get a specific event by ID
     *
     * @param {string} id - The event ID
     * @returns {Promise<CalendarEvent | null>} The event if found, null otherwise
     */
    async get(id: string): Promise<CalendarEvent | null> {
      const all = await this.getAll();
      return all.find((e) => e.id === id) || null;
    },

    /**
     * Get all events for a specific date
     * Compares only the date portion (YYYY-MM-DD) of event startAt timestamps
     *
     * @param {string} date - ISO 8601 date string to filter by
     * @returns {Promise<CalendarEvent[]>} Array of events on the specified date, sorted by start time
     */
    async getForDate(date: string): Promise<CalendarEvent[]> {
      const all = await this.getAll();
      const targetDate = date.split("T")[0];
      const filtered = all.filter((e) => {
        const eventDate = e.startAt.split("T")[0];
        return eventDate === targetDate;
      });
      // Sort by start time
      return filtered.sort(
        (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
      );
    },

    /**
     * Get all events for a week starting from a specific date
     *
     * @param {string} startDate - ISO 8601 date string for the start of the week
     * @returns {Promise<CalendarEvent[]>} Array of events within the 7-day period, sorted by start time
     */
    async getForWeek(startDate: string): Promise<CalendarEvent[]> {
      const all = await this.getAll();
      const start = new Date(startDate.split("T")[0]);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);

      const filtered = all.filter((e) => {
        const eventDate = new Date(e.startAt.split("T")[0]);
        return eventDate >= start && eventDate < end;
      });

      return filtered.sort(
        (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
      );
    },

    /**
     * Get all events for a specific month
     *
     * @param {number} year - Year (e.g., 2024)
     * @param {number} month - Month (1-12)
     * @returns {Promise<CalendarEvent[]>} Array of events in the specified month, sorted by start time
     */
    async getForMonth(year: number, month: number): Promise<CalendarEvent[]> {
      const all = await this.getAll();
      const filtered = all.filter((e) => {
        const eventDate = new Date(e.startAt);
        return (
          eventDate.getFullYear() === year && eventDate.getMonth() + 1 === month
        );
      });

      return filtered.sort(
        (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
      );
    },

    /**
     * Get all events in a date range (inclusive)
     *
     * @param {string} startDate - ISO 8601 date string for range start
     * @param {string} endDate - ISO 8601 date string for range end
     * @returns {Promise<CalendarEvent[]>} Array of events in the date range, sorted by start time
     */
    async getForDateRange(
      startDate: string,
      endDate: string,
    ): Promise<CalendarEvent[]> {
      const all = await this.getAll();
      const start = new Date(startDate.split("T")[0]);
      const end = new Date(endDate.split("T")[0]);
      end.setDate(end.getDate() + 1); // Make end date inclusive

      const filtered = all.filter((e) => {
        const eventDate = new Date(e.startAt.split("T")[0]);
        return eventDate >= start && eventDate < end;
      });

      return filtered.sort(
        (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
      );
    },

    /**
     * Expand recurring events into concrete instances within a date range.
     * Designed as a scheduling hook for reminder pipelines.
     *
     * @param {string} startDate - ISO 8601 date string for range start
     * @param {string} endDate - ISO 8601 date string for range end
     * @returns {Promise<CalendarEvent[]>} Base events + recurring instances
     */
    async getExpandedForDateRange(
      startDate: string,
      endDate: string,
    ): Promise<CalendarEvent[]> {
      const baseEvents = await this.getForDateRange(startDate, endDate);
      const nonRecurring = baseEvents.filter(
        (event) => event.recurrenceRule === "none",
      );
      const recurringEvents = await this.getRecurring();
      const rangeStart = new Date(startDate);
      const rangeEnd = new Date(endDate);

      const expanded = recurringEvents.flatMap((event) =>
        buildRecurringOccurrences(event, rangeStart, rangeEnd),
      );

      return [...nonRecurring, ...expanded].sort(
        (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
      );
    },

    /**
     * Build reminder triggers for a given event.
     * Defaults to event.reminderMinutes or an empty array.
     *
     * @param {CalendarEvent} event - Event to schedule reminders for
     * @returns {CalendarReminderTrigger[]} Reminder trigger definitions
     */
    getReminderSchedule(event: CalendarEvent): CalendarReminderTrigger[] {
      const offsets = event.reminderMinutes ?? [];

      return offsets
        .filter((minutes) => minutes > 0)
        .map((minutes) => {
          const reminderAt = new Date(event.startAt);
          reminderAt.setMinutes(reminderAt.getMinutes() - minutes);
          return {
            eventId: event.recurrenceInstanceOf || event.id,
            reminderAt: reminderAt.toISOString(),
          };
        });
    },

    /**
     * Collect reminder triggers for all events in a date range.
     *
     * @param {string} startDate - ISO 8601 date string for range start
     * @param {string} endDate - ISO 8601 date string for range end
     * @returns {Promise<CalendarReminderTrigger[]>} Reminder triggers
     */
    async getRemindersForDateRange(
      startDate: string,
      endDate: string,
    ): Promise<CalendarReminderTrigger[]> {
      const events = await this.getExpandedForDateRange(startDate, endDate);
      return events.flatMap((event) => this.getReminderSchedule(event));
    },

    /**
     * Get upcoming events within the next N days
     *
     * @param {number} days - Number of days to look ahead (default: 7)
     * @returns {Promise<CalendarEvent[]>} Array of upcoming events, sorted by start time
     */
    async getUpcoming(days: number = 7): Promise<CalendarEvent[]> {
      const all = await this.getAll();
      const now = new Date();
      const future = new Date();
      future.setDate(future.getDate() + days);

      const filtered = all.filter((e) => {
        const eventDate = new Date(e.startAt);
        return eventDate >= now && eventDate <= future;
      });

      return filtered.sort(
        (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
      );
    },

    /**
     * Get events due today
     *
     * @returns {Promise<CalendarEvent[]>} Array of today's events, sorted by start time
     */
    async getDueToday(): Promise<CalendarEvent[]> {
      const today = new Date().toISOString().split("T")[0];
      return this.getForDate(today);
    },

    /**
     * Get all-day events for a specific date
     *
     * @param {string} date - ISO 8601 date string to filter by
     * @returns {Promise<CalendarEvent[]>} Array of all-day events on the specified date
     */
    async getAllDayEvents(date: string): Promise<CalendarEvent[]> {
      const events = await this.getForDate(date);
      return events.filter((e) => e.allDay);
    },

    /**
     * Get recurring events
     *
     * @returns {Promise<CalendarEvent[]>} Array of events with recurrence rules
     */
    async getRecurring(): Promise<CalendarEvent[]> {
      const all = await this.getAll();
      return all.filter((e) => e.recurrenceRule && e.recurrenceRule !== "none");
    },

    /**
     * Search events by title, description, or location
     *
     * @param {string} query - Search query string
     * @returns {Promise<CalendarEvent[]>} Array of matching events
     */
    async search(query: string): Promise<CalendarEvent[]> {
      const all = await this.getAll();
      const lowerQuery = query.toLowerCase();

      return all
        .filter(
          (e) =>
            e.title.toLowerCase().includes(lowerQuery) ||
            e.description.toLowerCase().includes(lowerQuery) ||
            e.location.toLowerCase().includes(lowerQuery),
        )
        .sort(
          (a, b) =>
            new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
        );
    },

    /**
     * Get events by location
     *
     * @param {string} location - Location to filter by
     * @returns {Promise<CalendarEvent[]>} Array of events at the specified location
     */
    async getByLocation(location: string): Promise<CalendarEvent[]> {
      const all = await this.getAll();
      const lowerLocation = location.toLowerCase();

      return all
        .filter((e) => e.location.toLowerCase().includes(lowerLocation))
        .sort(
          (a, b) =>
            new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
        );
    },

    /**
     * Check for conflicting events in a time range
     * An event conflicts if it overlaps with the specified time range
     *
     * @param {string} startAt - ISO 8601 start time
     * @param {string} endAt - ISO 8601 end time
     * @param {string} excludeId - Optional event ID to exclude (for update scenarios)
     * @returns {Promise<CalendarEvent[]>} Array of conflicting events
     */
    async getConflicts(
      startAt: string,
      endAt: string,
      excludeId?: string,
    ): Promise<CalendarEvent[]> {
      const all = await this.getAll();
      const newStart = new Date(startAt).getTime();
      const newEnd = new Date(endAt).getTime();

      return all
        .filter((e) => {
          if (excludeId && e.id === excludeId) return false;

          const eventStart = new Date(e.startAt).getTime();
          const eventEnd = new Date(e.endAt).getTime();

          // Check for overlap: events overlap if one starts before the other ends
          return (
            (eventStart < newEnd && eventEnd > newStart) ||
            (newStart < eventEnd && newEnd > eventStart)
          );
        })
        .sort(
          (a, b) =>
            new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
        );
    },

    /**
     * Get statistics about calendar events
     *
     * @returns {Promise<object>} Statistics object with various metrics
     */
    async getStats(): Promise<{
      totalEvents: number;
      upcomingEvents: number;
      todayEvents: number;
      recurringEvents: number;
      allDayEvents: number;
      eventsThisWeek: number;
      eventsThisMonth: number;
    }> {
      const all = await this.getAll();
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];

      // Week range
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      // Month range
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      return {
        totalEvents: all.length,
        upcomingEvents: all.filter((e) => new Date(e.startAt) >= today).length,
        todayEvents: all.filter((e) => e.startAt.split("T")[0] === todayStr)
          .length,
        recurringEvents: all.filter(
          (e) => e.recurrenceRule && e.recurrenceRule !== "none",
        ).length,
        allDayEvents: all.filter((e) => e.allDay).length,
        eventsThisWeek: all.filter((e) => {
          const eventDate = new Date(e.startAt);
          return eventDate >= weekStart && eventDate < weekEnd;
        }).length,
        eventsThisMonth: all.filter((e) => {
          const eventDate = new Date(e.startAt);
          return eventDate >= monthStart && eventDate <= monthEnd;
        }).length,
      };
    },

    /**
     * Save an event (create new or update existing)
     *
     * @param {CalendarEvent} event - The event to save
     * @returns {Promise<void>}
     */
    async save(event: CalendarEvent): Promise<void> {
      const all = await this.getAll();
      const index = all.findIndex((e) => e.id === event.id);
      if (index >= 0) {
        all[index] = event;
      } else {
        all.push(event);
      }
      await setData(KEYS.EVENTS, all);
    },

    /**
     * Delete an event by ID
     *
     * @param {string} id - The event ID to delete
     * @returns {Promise<void>}
     */
    async delete(id: string): Promise<void> {
      const all = await this.getAll();
      const filtered = all.filter((e) => e.id !== id);
      await setData(KEYS.EVENTS, filtered);
    },

    /**
     * Delete multiple events by IDs (bulk delete)
     *
     * @param {string[]} ids - Array of event IDs to delete
     * @returns {Promise<void>}
     */
    async bulkDelete(ids: string[]): Promise<void> {
      const all = await this.getAll();
      const filtered = all.filter((e) => !ids.includes(e.id));
      await setData(KEYS.EVENTS, filtered);
    },

    /**
     * Duplicate an event
     *
     * @param {string} id - The event ID to duplicate
     * @returns {Promise<CalendarEvent | null>} The duplicated event, or null if not found
     */
    async duplicate(id: string): Promise<CalendarEvent | null> {
      const event = await this.get(id);
      if (!event) return null;

      const now = new Date().toISOString();
      const duplicated: CalendarEvent = {
        ...event,
        id: generateId(),
        title: `${event.title} (Copy)`,
        createdAt: now,
        updatedAt: now,
      };

      await this.save(duplicated);
      return duplicated;
    },
  },

  lists: {
    async getAll(): Promise<List[]> {
      return getData(KEYS.LISTS, []);
    },
    async getAllSorted(): Promise<List[]> {
      const all = await this.getAll();
      return all.sort(
        (a, b) =>
          new Date(b.lastOpenedAt).getTime() -
          new Date(a.lastOpenedAt).getTime(),
      );
    },
    async getActive(): Promise<List[]> {
      const all = await this.getAll();
      return all.filter((l) => !l.isArchived && !l.isTemplate);
    },
    async getArchived(): Promise<List[]> {
      const all = await this.getAll();
      return all.filter((l) => l.isArchived === true);
    },
    async getTemplates(): Promise<List[]> {
      const all = await this.getAll();
      return all.filter((l) => l.isTemplate === true);
    },
    async getByCategory(category: string): Promise<List[]> {
      const all = await this.getAll();
      return all.filter((l) => l.category === category && !l.isArchived);
    },
    async get(id: string): Promise<List | null> {
      const all = await this.getAll();
      return all.find((l) => l.id === id) || null;
    },
    async save(list: List): Promise<void> {
      const all = await this.getAll();
      const index = all.findIndex((l) => l.id === list.id);
      if (index >= 0) {
        all[index] = list;
      } else {
        all.push(list);
      }
      await setData(KEYS.LISTS, all);
    },
    async delete(id: string): Promise<void> {
      const all = await this.getAll();
      const filtered = all.filter((l) => l.id !== id);
      await setData(KEYS.LISTS, filtered);
    },
    async duplicate(id: string): Promise<List | null> {
      const list = await this.get(id);
      if (!list) return null;

      const now = new Date().toISOString();
      const duplicated: List = {
        ...list,
        id: generateId(),
        title: `${list.title} (Copy)`,
        items: list.items.map((item) => ({
          ...item,
          id: generateId(),
          isChecked: false, // Reset completion status for copy
        })),
        isTemplate: false, // Copies are not templates
        createdAt: now,
        lastOpenedAt: now,
        updatedAt: now,
      };

      await this.save(duplicated);
      return duplicated;
    },
    async archive(id: string): Promise<void> {
      const all = await this.getAll();
      const list = all.find((l) => l.id === id);
      if (list) {
        list.isArchived = true;
        list.updatedAt = new Date().toISOString();
        await setData(KEYS.LISTS, all);
      }
    },
    async unarchive(id: string): Promise<void> {
      const all = await this.getAll();
      const list = all.find((l) => l.id === id);
      if (list) {
        list.isArchived = false;
        list.updatedAt = new Date().toISOString();
        await setData(KEYS.LISTS, all);
      }
    },
    async updateLastOpened(id: string): Promise<void> {
      const all = await this.getAll();
      const list = all.find((l) => l.id === id);
      if (list) {
        list.lastOpenedAt = new Date().toISOString();
        await setData(KEYS.LISTS, all);
      }
    },
    async getStats(): Promise<{
      total: number;
      active: number;
      archived: number;
      templates: number;
      byCategory: Record<string, number>;
      totalItems: number;
      completedItems: number;
    }> {
      const all = await this.getAll();
      const active = all.filter((l) => !l.isArchived && !l.isTemplate);
      const archived = all.filter((l) => l.isArchived === true);
      const templates = all.filter((l) => l.isTemplate === true);

      // Count categories only for active lists
      const byCategory: Record<string, number> = {};
      active.forEach((list) => {
        if (list.category) {
          byCategory[list.category] = (byCategory[list.category] || 0) + 1;
        }
      });

      let totalItems = 0;
      let completedItems = 0;
      all.forEach((list) => {
        totalItems += list.items.length;
        completedItems += list.items.filter((item) => item.isChecked).length;
      });

      return {
        total: all.length,
        active: active.length,
        archived: archived.length,
        templates: templates.length,
        byCategory,
        totalItems,
        completedItems,
      };
    },

    /**
     * Search lists by title and item text
     * Performs case-insensitive search across list titles and item text
     * @param query - Search query string
     * @returns Promise<List[]> - Lists matching the search query
     */
    async search(query: string): Promise<List[]> {
      const all = await this.getAll();
      const lowerQuery = query.toLowerCase().trim();

      if (!lowerQuery) {
        return all;
      }

      return all.filter((list) => {
        // Search in title
        if (list.title.toLowerCase().includes(lowerQuery)) {
          return true;
        }

        // Search in items
        return list.items.some(
          (item) =>
            item.text.toLowerCase().includes(lowerQuery) ||
            (item.notes && item.notes.toLowerCase().includes(lowerQuery)),
        );
      });
    },

    /**
     * Sort lists by specified criteria
     * @param sortBy - Sort criteria ('recent', 'alphabetical', 'priority', 'completion', 'itemCount')
     * @param direction - Sort direction ('asc' or 'desc')
     * @returns Promise<List[]> - Sorted lists
     */
    async sort(
      sortBy:
        | "recent"
        | "alphabetical"
        | "priority"
        | "completion"
        | "itemCount",
      direction: "asc" | "desc" = "desc",
    ): Promise<List[]> {
      const all = await this.getAll();

      return all.sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
          case "recent":
            comparison =
              new Date(b.lastOpenedAt).getTime() -
              new Date(a.lastOpenedAt).getTime();
            break;

          case "alphabetical":
            comparison = a.title.localeCompare(b.title);
            break;

          case "priority": {
            // Count high priority items
            const aHighPriority = a.items.filter(
              (item) => item.priority === "high" && !item.isChecked,
            ).length;
            const bHighPriority = b.items.filter(
              (item) => item.priority === "high" && !item.isChecked,
            ).length;
            comparison = bHighPriority - aHighPriority;
            break;
          }

          case "completion": {
            // Calculate completion percentage
            const aTotal = a.items.length;
            const bTotal = b.items.length;
            const aCompleted = a.items.filter((item) => item.isChecked).length;
            const bCompleted = b.items.filter((item) => item.isChecked).length;
            const aPercent = aTotal > 0 ? (aCompleted / aTotal) * 100 : 0;
            const bPercent = bTotal > 0 ? (bCompleted / bTotal) * 100 : 0;
            comparison = bPercent - aPercent;
            break;
          }

          case "itemCount":
            comparison = b.items.length - a.items.length;
            break;

          default:
            comparison = 0;
        }

        // For alphabetical, default is ascending, so reverse for desc
        // For others, default is descending, so reverse for asc
        if (sortBy === "alphabetical") {
          return direction === "desc" ? -comparison : comparison;
        } else {
          return direction === "asc" ? -comparison : comparison;
        }
      });
    },

    /**
     * Filter lists by multiple criteria
     * @param filters - Filter criteria object
     * @returns Promise<List[]> - Filtered lists
     */
    async filter(filters: {
      category?: string;
      priority?: ListItemPriority;
      hasOverdue?: boolean;
      hasNotes?: boolean;
      isIncomplete?: boolean;
      minItems?: number;
      maxItems?: number;
    }): Promise<List[]> {
      const all = await this.getAll();
      const now = new Date();

      return all.filter((list) => {
        // Filter by category
        if (filters.category && list.category !== filters.category) {
          return false;
        }

        // Filter by priority (at least one item with this priority)
        if (filters.priority) {
          const hasPriority = list.items.some(
            (item) => item.priority === filters.priority && !item.isChecked,
          );
          if (!hasPriority) return false;
        }

        // Filter by overdue items
        if (filters.hasOverdue) {
          const hasOverdueItem = list.items.some((item) => {
            if (!item.dueDate || item.isChecked) return false;
            return new Date(item.dueDate) < now;
          });
          if (!hasOverdueItem) return false;
        }

        // Filter by items with notes
        if (filters.hasNotes) {
          const hasNotesItem = list.items.some(
            (item) => item.notes && item.notes.trim().length > 0,
          );
          if (!hasNotesItem) return false;
        }

        // Filter by incomplete lists (has unchecked items)
        if (filters.isIncomplete) {
          const hasUnchecked = list.items.some((item) => !item.isChecked);
          if (!hasUnchecked) return false;
        }

        // Filter by minimum items
        if (
          filters.minItems !== undefined &&
          list.items.length < filters.minItems
        ) {
          return false;
        }

        // Filter by maximum items
        if (
          filters.maxItems !== undefined &&
          list.items.length > filters.maxItems
        ) {
          return false;
        }

        return true;
      });
    },

    /**
     * Get lists with overdue items
     * @returns Promise<List[]> - Lists containing overdue items
     */
    async getWithOverdueItems(): Promise<List[]> {
      const all = await this.getAll();
      const now = new Date();

      return all.filter((list) => {
        return list.items.some((item) => {
          if (!item.dueDate || item.isChecked) return false;
          return new Date(item.dueDate) < now;
        });
      });
    },

    /**
     * Get lists with high priority items
     * @returns Promise<List[]> - Lists containing unchecked high priority items
     */
    async getWithHighPriorityItems(): Promise<List[]> {
      const all = await this.getAll();

      return all.filter((list) => {
        return list.items.some(
          (item) => item.priority === "high" && !item.isChecked,
        );
      });
    },

    /**
     * Bulk archive multiple lists
     * @param ids - Array of list IDs to archive
     */
    async bulkArchive(ids: string[]): Promise<void> {
      const all = await this.getAll();
      const now = new Date().toISOString();

      all.forEach((list) => {
        if (ids.includes(list.id)) {
          list.isArchived = true;
          list.updatedAt = now;
        }
      });

      await setData(KEYS.LISTS, all);
    },

    /**
     * Bulk unarchive multiple lists
     * @param ids - Array of list IDs to unarchive
     */
    async bulkUnarchive(ids: string[]): Promise<void> {
      const all = await this.getAll();
      const now = new Date().toISOString();

      all.forEach((list) => {
        if (ids.includes(list.id)) {
          list.isArchived = false;
          list.updatedAt = now;
        }
      });

      await setData(KEYS.LISTS, all);
    },

    /**
     * Bulk delete multiple lists
     * @param ids - Array of list IDs to delete
     */
    async bulkDelete(ids: string[]): Promise<void> {
      const all = await this.getAll();
      const filtered = all.filter((list) => !ids.includes(list.id));
      await setData(KEYS.LISTS, filtered);
    },

    /**
     * Get enhanced statistics with detailed breakdowns
     * @returns Promise<object> - Comprehensive statistics
     */
    async getEnhancedStats(): Promise<{
      total: number;
      active: number;
      archived: number;
      templates: number;
      byCategory: Record<string, number>;
      totalItems: number;
      completedItems: number;
      pendingItems: number;
      highPriorityItems: number;
      overdueItems: number;
      itemsWithNotes: number;
      completionRate: number;
    }> {
      const all = await this.getAll();
      const active = all.filter((l) => !l.isArchived && !l.isTemplate);
      const archived = all.filter((l) => l.isArchived === true);
      const templates = all.filter((l) => l.isTemplate === true);
      const now = new Date();

      // Count categories only for active lists
      const byCategory: Record<string, number> = {};
      active.forEach((list) => {
        if (list.category) {
          byCategory[list.category] = (byCategory[list.category] || 0) + 1;
        }
      });

      let totalItems = 0;
      let completedItems = 0;
      let pendingItems = 0;
      let highPriorityItems = 0;
      let overdueItems = 0;
      let itemsWithNotes = 0;

      all.forEach((list) => {
        list.items.forEach((item) => {
          totalItems++;

          if (item.isChecked) {
            completedItems++;
          } else {
            pendingItems++;

            // Count high priority unchecked items
            if (item.priority === "high") {
              highPriorityItems++;
            }

            // Count overdue unchecked items
            if (item.dueDate && new Date(item.dueDate) < now) {
              overdueItems++;
            }
          }

          // Count items with notes
          if (item.notes && item.notes.trim().length > 0) {
            itemsWithNotes++;
          }
        });
      });

      const completionRate =
        totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      return {
        total: all.length,
        active: active.length,
        archived: archived.length,
        templates: templates.length,
        byCategory,
        totalItems,
        completedItems,
        pendingItems,
        highPriorityItems,
        overdueItems,
        itemsWithNotes,
        completionRate,
      };
    },

    /**
     * Clear all completed items from a list
     * @param id - List ID
     */
    async clearCompleted(id: string): Promise<void> {
      const all = await this.getAll();
      const list = all.find((l) => l.id === id);

      if (list) {
        list.items = list.items.filter((item) => !item.isChecked);
        list.updatedAt = new Date().toISOString();
        await setData(KEYS.LISTS, all);
      }
    },

    /**
     * Mark all items in a list as completed
     * @param id - List ID
     */
    async completeAll(id: string): Promise<void> {
      const all = await this.getAll();
      const list = all.find((l) => l.id === id);

      if (list) {
        list.items.forEach((item) => {
          item.isChecked = true;
        });
        list.updatedAt = new Date().toISOString();
        await setData(KEYS.LISTS, all);
      }
    },

    /**
     * Mark all items in a list as incomplete
     * @param id - List ID
     */
    async uncompleteAll(id: string): Promise<void> {
      const all = await this.getAll();
      const list = all.find((l) => l.id === id);

      if (list) {
        list.items.forEach((item) => {
          item.isChecked = false;
        });
        list.updatedAt = new Date().toISOString();
        await setData(KEYS.LISTS, all);
      }
    },
  },

  /**
   * Alerts Module
   *
   * Manages alarm and reminder storage operations.
   * Provides CRUD operations and sorting functionality.
   */
  alerts: {
    /**
     * Get all alerts from storage
     * Automatically migrates old alerts to include new fields with defaults
     * Migration is performed in-place and persisted to storage
     *
     * @returns {Promise<Alert[]>} Array of all alerts
     */
    async getAll(): Promise<Alert[]> {
      const alerts = await getData<Alert[]>(KEYS.ALERTS, []);

      // Check if any alert needs migration
      const needsMigration = alerts.some(
        (alert) => !alert.sound || !alert.vibration || alert.tags === undefined,
      );

      if (needsMigration) {
        // Migrate alerts with default values
        const migratedAlerts = alerts.map((alert) => ({
          ...alert,
          sound: alert.sound || "default",
          vibration: alert.vibration || "default",
          gradualVolume: alert.gradualVolume ?? false,
          snoozeDuration: alert.snoozeDuration || 10,
          tags: alert.tags || [],
        }));

        // Persist migrated data
        await setData(KEYS.ALERTS, migratedAlerts);
        return migratedAlerts;
      }

      return alerts;
    },

    /**
     * Get all alerts sorted by time in ascending order
     *
     * @returns {Promise<Alert[]>} Array of alerts sorted by time (earliest first)
     */
    async getAllSorted(): Promise<Alert[]> {
      const all = await this.getAll();
      return all.sort(
        (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
      );
    },

    /**
     * Get a specific alert by ID
     *
     * @param {string} id - The alert ID
     * @returns {Promise<Alert | null>} The alert if found, null otherwise
     */
    async get(id: string): Promise<Alert | null> {
      const all = await this.getAll();
      return all.find((a) => a.id === id) || null;
    },

    /**
     * Save an alert (create new or update existing)
     *
     * @param {Alert} alert - The alert to save
     * @returns {Promise<void>}
     */
    async save(alert: Alert): Promise<void> {
      const all = await this.getAll();
      const index = all.findIndex((a) => a.id === alert.id);
      if (index >= 0) {
        all[index] = alert;
      } else {
        all.push(alert);
      }
      await setData(KEYS.ALERTS, all);
    },

    /**
     * Delete an alert by ID
     *
     * @param {string} id - The alert ID to delete
     * @returns {Promise<void>}
     */
    async delete(id: string): Promise<void> {
      const all = await this.getAll();
      const filtered = all.filter((a) => a.id !== id);
      await setData(KEYS.ALERTS, filtered);
    },

    /**
     * Duplicate an alert with a new ID
     *
     * @param {string} id - The alert ID to duplicate
     * @returns {Promise<Alert | null>} The new alert if successful, null if original not found
     */
    async duplicate(id: string): Promise<Alert | null> {
      const alert = await this.get(id);
      if (!alert) return null;

      const now = new Date().toISOString();
      const newAlert: Alert = {
        ...alert,
        id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        title: `${alert.title} (Copy)`,
        createdAt: now,
        updatedAt: now,
      };

      await this.save(newAlert);
      return newAlert;
    },

    /**
     * Get alerts by tag
     *
     * @param {string} tag - The tag to filter by
     * @returns {Promise<Alert[]>} Array of alerts with the specified tag, sorted by time
     */
    async getByTag(tag: string): Promise<Alert[]> {
      const all = await this.getAll();
      const filtered = all.filter((a) => a.tags.includes(tag));
      // Sort by time ascending
      return filtered.sort(
        (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
      );
    },

    /**
     * Get all unique tags across all alerts
     *
     * @returns {Promise<string[]>} Array of unique tag names
     */
    async getAllTags(): Promise<string[]> {
      const all = await this.getAll();
      const tagsSet = new Set<string>();
      all.forEach((alert) => {
        alert.tags.forEach((tag) => tagsSet.add(tag));
      });
      return Array.from(tagsSet).sort();
    },

    /**
     * Get available alert sound presets
     *
     * @returns {Alert["sound"][]} Available sound identifiers
     */
    getSoundPresets(): Alert["sound"][] {
      return ["default", "gentle", "radar", "bells", "chimes", "digital"];
    },

    /**
     * Get available alert vibration presets
     *
     * @returns {Alert["vibration"][]} Available vibration identifiers
     */
    getVibrationPresets(): Alert["vibration"][] {
      return ["default", "pulse", "double", "long", "none"];
    },

    /**
     * Calculate the next trigger time for an alert after a given timestamp.
     *
     * @param {Alert} alert - Alert to evaluate
     * @param {Date} after - Point in time to schedule after
     * @returns {string | null} ISO timestamp for next trigger or null
     */
    getNextTriggerAt(alert: Alert, after: Date = new Date()): string | null {
      return getNextAlertTrigger(alert, after);
    },

    /**
     * Build a schedule of alert triggers within a time window.
     *
     * @param {string} startAt - ISO 8601 start time
     * @param {string} endAt - ISO 8601 end time
     * @returns {Promise<AlertTrigger[]>} Scheduled alert triggers
     */
    async getUpcomingTriggers(
      startAt: string,
      endAt: string,
    ): Promise<AlertTrigger[]> {
      const all = await this.getAll();
      const windowStart = new Date(startAt);
      const windowEnd = new Date(endAt);

      const triggers: AlertTrigger[] = [];
      all.forEach((alert) => {
        if (!alert.isEnabled) return;
        const nextTrigger = getNextAlertTrigger(alert, windowStart);
        if (nextTrigger && new Date(nextTrigger) <= windowEnd) {
          triggers.push({ alertId: alert.id, triggerAt: nextTrigger });
        }
      });

      return triggers.sort(
        (a, b) =>
          new Date(a.triggerAt).getTime() - new Date(b.triggerAt).getTime(),
      );
    },

    /**
     * Toggle enabled state for multiple alerts
     *
     * @param {string[]} ids - Array of alert IDs to toggle
     * @param {boolean} enabled - New enabled state
     * @returns {Promise<void>}
     */
    async toggleMultiple(ids: string[], enabled: boolean): Promise<void> {
      const all = await this.getAll();
      const now = new Date().toISOString();

      const updated = all.map((alert) => {
        if (ids.includes(alert.id)) {
          return { ...alert, isEnabled: enabled, updatedAt: now };
        }
        return alert;
      });

      await setData(KEYS.ALERTS, updated);
    },

    /**
     * Delete multiple alerts
     *
     * @param {string[]} ids - Array of alert IDs to delete
     * @returns {Promise<void>}
     */
    async deleteMultiple(ids: string[]): Promise<void> {
      const all = await this.getAll();
      const filtered = all.filter((a) => !ids.includes(a.id));
      await setData(KEYS.ALERTS, filtered);
    },
  },

  alertHistory: {
    /**
     * Get all alert history entries
     *
     * @returns {Promise<AlertHistoryEntry[]>} Array of all history entries
     */
    async getAll(): Promise<AlertHistoryEntry[]> {
      return getData(KEYS.ALERT_HISTORY, []);
    },

    /**
     * Get history entries for a specific alert
     *
     * @param {string} alertId - The alert ID
     * @returns {Promise<AlertHistoryEntry[]>} Array of history entries for the alert
     */
    async getByAlert(alertId: string): Promise<AlertHistoryEntry[]> {
      const all = await this.getAll();
      return all.filter((entry) => entry.alertId === alertId);
    },

    /**
     * Add a new history entry
     *
     * @param {Omit<AlertHistoryEntry, "id">} entry - The history entry to add (without id)
     * @returns {Promise<AlertHistoryEntry>} The saved entry with generated id
     */
    async add(
      entry: Omit<AlertHistoryEntry, "id">,
    ): Promise<AlertHistoryEntry> {
      const all = await this.getAll();
      const newEntry: AlertHistoryEntry = {
        ...entry,
        id: `alert_history_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      };
      all.push(newEntry);
      await setData(KEYS.ALERT_HISTORY, all);
      return newEntry;
    },

    /**
     * Update a history entry
     *
     * @param {AlertHistoryEntry} entry - The entry to update
     * @returns {Promise<void>}
     */
    async update(entry: AlertHistoryEntry): Promise<void> {
      const all = await this.getAll();
      const index = all.findIndex((e) => e.id === entry.id);
      if (index >= 0) {
        all[index] = entry;
        await setData(KEYS.ALERT_HISTORY, all);
      }
    },

    /**
     * Calculate statistics for an alert
     *
     * @param {string} alertId - The alert ID
     * @returns {Promise<AlertStatistics>} Calculated statistics
     */
    async getStatistics(alertId: string): Promise<AlertStatistics> {
      const entries = await this.getByAlert(alertId);
      const totalTriggers = entries.length;
      const totalSnoozes = entries.reduce(
        (sum, entry) => sum + entry.snoozeCount,
        0,
      );
      const onTimeCount = entries.filter((entry) => entry.wasOnTime).length;
      const lastEntry = entries.sort(
        (a, b) =>
          new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime(),
      )[0];

      return {
        alertId,
        totalTriggers,
        totalSnoozes,
        averageSnoozeCount:
          totalTriggers > 0 ? totalSnoozes / totalTriggers : 0,
        onTimeDismissalRate:
          totalTriggers > 0 ? (onTimeCount / totalTriggers) * 100 : 0,
        lastTriggeredAt: lastEntry ? lastEntry.triggeredAt : null,
      };
    },

    /**
     * Delete history entries for a specific alert
     *
     * @param {string} alertId - The alert ID
     * @returns {Promise<void>}
     */
    async deleteByAlert(alertId: string): Promise<void> {
      const all = await this.getAll();
      const filtered = all.filter((entry) => entry.alertId !== alertId);
      await setData(KEYS.ALERT_HISTORY, filtered);
    },

    /**
     * Get smart snooze duration recommendation based on history
     * Analyzes past snooze patterns to suggest optimal snooze duration
     *
     * Algorithm:
     * 1. If no history: return 10 min (default)
     * 2. If user never snoozes: return 5 min (disciplined user)
     * 3. Otherwise: calculate average snooze duration per instance
     *    - avgTotalDuration = total snooze time / number of snoozed alerts
     *    - avgCount = total snoozes / number of snoozed alerts
     *    - estimatedOptimal = avgTotalDuration / avgCount
     * 4. Round to nearest valid option (5, 10, 15, 30, 60)
     *
     * @param {string} alertId - The alert ID
     * @returns {Promise<number>} Recommended snooze duration in minutes
     *
     * @example
     * // User consistently snoozes 2x at 15min each = 30min total
     * // Returns: 15 (optimal per-snooze duration)
     */
    async getSmartSnoozeSuggestion(alertId: string): Promise<number> {
      const entries = await this.getByAlert(alertId);

      // Default to 10 minutes if no history
      if (entries.length === 0) {
        return 10;
      }

      // Filter entries where snoozing occurred
      const snoozedEntries = entries.filter((entry) => entry.snoozeCount > 0);

      if (snoozedEntries.length === 0) {
        // If user never snoozes, suggest shorter duration
        return 5;
      }

      // Calculate average total snooze duration per entry
      const avgTotalSnoozeDuration =
        snoozedEntries.reduce(
          (sum, entry) => sum + entry.totalSnoozeDuration,
          0,
        ) / snoozedEntries.length;

      // Calculate average snooze count
      const avgSnoozeCount =
        snoozedEntries.reduce((sum, entry) => sum + entry.snoozeCount, 0) /
        snoozedEntries.length;

      // Estimate optimal single snooze duration with defensive check
      const estimatedOptimal =
        avgSnoozeCount > 0 ? avgTotalSnoozeDuration / avgSnoozeCount : 10; // Default fallback if somehow avgSnoozeCount is 0

      // Round to nearest valid snooze option: 5, 10, 15, 30, or 60 minutes
      const validOptions = [5, 10, 15, 30, 60];
      const closest = validOptions.reduce((prev, curr) =>
        Math.abs(curr - estimatedOptimal) < Math.abs(prev - estimatedOptimal)
          ? curr
          : prev,
      );

      return closest;
    },
  },

  messages: {
    /**
     * Get all messages from storage
     *
     * @returns {Promise<Message[]>} Array of all messages
     */
    async getAll(): Promise<Message[]> {
      return getData(KEYS.MESSAGES, []);
    },
    /**
     * Get a single message by ID
     *
     * @param {string} id - Message ID
     * @returns {Promise<Message | null>} Message or null if missing
     */
    async get(id: string): Promise<Message | null> {
      const all = await this.getAll();
      return all.find((m) => m.id === id) || null;
    },
    /**
     * Get messages for a specific conversation (chronological order)
     *
     * @param {string} conversationId - Conversation ID
     * @returns {Promise<Message[]>} Messages sorted oldest → newest
     */
    async getByConversation(conversationId: string): Promise<Message[]> {
      const all = await this.getAll();
      return all
        .filter((m) => m.conversationId === conversationId)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
    },
    /**
     * Search messages by content, sender name, and attachment metadata.
     *
     * Notes for AI iteration:
     * - If query is empty, returns scoped messages ordered by recency.
     * - Keep results stable by sorting on createdAt descending.
     *
     * @param {string} query - Search query string
     * @param {{ conversationId?: string; limit?: number }} options - Scope & limit
     * @returns {Promise<Message[]>} Matching messages
     */
    async search(
      query: string,
      options: { conversationId?: string; limit?: number } = {},
    ): Promise<Message[]> {
      const normalized = query.trim().toLowerCase();
      const all = await this.getAll();
      const scoped = options.conversationId
        ? all.filter((m) => m.conversationId === options.conversationId)
        : all;

      const matches = normalized
        ? scoped.filter((message) =>
            buildMessageSearchIndex(message).includes(normalized),
          )
        : scoped;

      const sorted = matches.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      return typeof options.limit === "number"
        ? sorted.slice(0, options.limit)
        : sorted;
    },
    /**
     * Save a message (create new or update existing)
     *
     * @param {Message} message - Message to persist
     * @returns {Promise<void>}
     */
    async save(message: Message): Promise<void> {
      const all = await this.getAll();
      const index = all.findIndex((m) => m.id === message.id);
      if (index >= 0) {
        all[index] = message;
      } else {
        all.push(message);
      }
      await setData(KEYS.MESSAGES, all);
    },
    /**
     * Edit an existing message and mark it as edited.
     * Also refreshes the conversation preview if this is the latest message.
     *
     * @param {string} id - Message ID to edit
     * @param {string} content - Updated message content
     * @returns {Promise<Message | null>} Updated message or null if missing
     */
    async editContent(id: string, content: string): Promise<Message | null> {
      const all = await this.getAll();
      const index = all.findIndex((m) => m.id === id);
      if (index < 0) return null;

      const now = new Date().toISOString();
      const updated: Message = {
        ...all[index],
        content,
        isEdited: true,
        updatedAt: now,
      };

      all[index] = updated;
      await setData(KEYS.MESSAGES, all);

      const conversations = await db.conversations.getAll();
      const conversation = conversations.find(
        (c) => c.id === updated.conversationId,
      );

      if (conversation?.lastMessageId === updated.id) {
        conversation.lastMessagePreview = buildMessagePreview(updated.content);
        conversation.updatedAt = now;
        await setData(KEYS.CONVERSATIONS, conversations);
      }

      return updated;
    },
    async delete(id: string): Promise<void> {
      const all = await this.getAll();
      const target = all.find((m) => m.id === id);
      const filtered = all.filter((m) => m.id !== id);
      await setData(KEYS.MESSAGES, filtered);

      if (!target) return;

      const conversations = await db.conversations.getAll();
      const conversation = conversations.find(
        (c) => c.id === target.conversationId,
      );

      if (!conversation || conversation.lastMessageId !== target.id) {
        return;
      }

      const remaining = filtered
        .filter((m) => m.conversationId === target.conversationId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

      if (remaining.length > 0) {
        const latest = remaining[0];
        conversation.lastMessageId = latest.id;
        conversation.lastMessageAt = latest.createdAt;
        conversation.lastMessagePreview = buildMessagePreview(latest.content);
      } else {
        conversation.lastMessageId = null;
        conversation.lastMessageAt = null;
        conversation.lastMessagePreview = "";
      }

      conversation.updatedAt = new Date().toISOString();
      await setData(KEYS.CONVERSATIONS, conversations);
    },
    async markAsRead(conversationId: string, userId: string): Promise<void> {
      const all = await this.getAll();
      const now = new Date().toISOString();
      all.forEach((m) => {
        if (m.conversationId === conversationId && m.senderId !== userId) {
          m.isRead = true;
          m.readAt = now;
        }
      });
      await setData(KEYS.MESSAGES, all);
    },
    async getUnreadCount(
      conversationId: string,
      userId: string,
    ): Promise<number> {
      const all = await this.getAll();
      return all.filter(
        (m) =>
          m.conversationId === conversationId &&
          m.senderId !== userId &&
          !m.isRead,
      ).length;
    },
  },

  conversations: {
    async getAll(): Promise<Conversation[]> {
      return getData(KEYS.CONVERSATIONS, []);
    },
    async getAllActive(): Promise<Conversation[]> {
      const all = await this.getAll();
      return all
        .filter((c) => !c.isArchived)
        .sort(
          (a, b) =>
            new Date(b.lastMessageAt || b.createdAt).getTime() -
            new Date(a.lastMessageAt || a.createdAt).getTime(),
        );
    },
    async getAllArchived(): Promise<Conversation[]> {
      const all = await this.getAll();
      return all
        .filter((c) => c.isArchived)
        .sort(
          (a, b) =>
            new Date(b.archivedAt || b.updatedAt).getTime() -
            new Date(a.archivedAt || a.updatedAt).getTime(),
        );
    },
    async get(id: string): Promise<Conversation | null> {
      const all = await this.getAll();
      return all.find((c) => c.id === id) || null;
    },
    async save(conversation: Conversation): Promise<void> {
      const all = await this.getAll();
      const index = all.findIndex((c) => c.id === conversation.id);
      if (index >= 0) {
        all[index] = conversation;
      } else {
        all.push(conversation);
      }
      await setData(KEYS.CONVERSATIONS, all);
    },
    async delete(id: string): Promise<void> {
      const all = await this.getAll();
      const filtered = all.filter((c) => c.id !== id);
      await setData(KEYS.CONVERSATIONS, filtered);

      // Also delete all messages in this conversation
      const messages = await db.messages.getAll();
      const filteredMessages = messages.filter((m) => m.conversationId !== id);
      await setData(KEYS.MESSAGES, filteredMessages);
    },
    async updateTyping(
      id: string,
      userId: string,
      isTyping: boolean,
    ): Promise<void> {
      const all = await this.getAll();
      const conversation = all.find((c) => c.id === id);
      if (conversation) {
        if (isTyping) {
          if (!conversation.isTyping.includes(userId)) {
            conversation.isTyping.push(userId);
          }
        } else {
          conversation.isTyping = conversation.isTyping.filter(
            (uid) => uid !== userId,
          );
        }
        await setData(KEYS.CONVERSATIONS, all);
      }
    },
    async archive(id: string): Promise<void> {
      const all = await this.getAll();
      const conversation = all.find((c) => c.id === id);
      if (conversation) {
        conversation.isArchived = true;
        conversation.archivedAt = new Date().toISOString();
        await setData(KEYS.CONVERSATIONS, all);
      }
    },
    async unarchive(id: string): Promise<void> {
      const all = await this.getAll();
      const conversation = all.find((c) => c.id === id);
      if (conversation) {
        conversation.isArchived = false;
        conversation.archivedAt = null;
        await setData(KEYS.CONVERSATIONS, all);
      }
    },
    async updateUnreadCount(id: string, count: number): Promise<void> {
      const all = await this.getAll();
      const conversation = all.find((c) => c.id === id);
      if (conversation) {
        conversation.unreadCount = count;
        await setData(KEYS.CONVERSATIONS, all);
      }
    },
    async getArchivableConversations(): Promise<Conversation[]> {
      const all = await this.getAll();
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      return all.filter((c) => {
        const lastActivity = c.lastMessageAt || c.createdAt;
        return !c.isArchived && new Date(lastActivity) < fourteenDaysAgo;
      });
    },
  },
  /**
   * Contacts Module
   *
   * Manages contact storage with sharing preferences.
   * Contacts can be imported from device and have configurable sharing settings.
   */
  contacts: {
    /** Get all contacts from storage */
    async getAll(): Promise<Contact[]> {
      return getData(KEYS.CONTACTS, []);
    },

    /** Get all contacts sorted alphabetically by name */
    async getAllSorted(): Promise<Contact[]> {
      const all = await this.getAll();
      return all.sort((a, b) => a.name.localeCompare(b.name));
    },

    /** Get favorite contacts only */
    async getFavorites(): Promise<Contact[]> {
      const all = await this.getAll();
      return all.filter((c) => c.isFavorite);
    },

    /** Get contacts by group */
    async getByGroup(groupName: string): Promise<Contact[]> {
      const all = await this.getAll();
      return all.filter((c) => c.groups?.includes(groupName));
    },

    /** Get contacts by tag */
    async getByTag(tag: string): Promise<Contact[]> {
      const all = await this.getAll();
      return all.filter((c) => c.tags?.includes(tag));
    },

    /** Get upcoming birthdays within specified days */
    async getUpcomingBirthdays(daysAhead: number = 30): Promise<Contact[]> {
      const all = await this.getAll();
      const now = new Date();
      const futureDate = new Date(
        now.getTime() + daysAhead * 24 * 60 * 60 * 1000,
      );

      const contactsWithUpcomingBirthdays = all.filter((c) => {
        if (!c.birthday) return false;
        return isBirthdayInRange(c.birthday, now, futureDate);
      });

      return sortByUpcomingBirthday(contactsWithUpcomingBirthdays);
    },

    /** Search contacts by name, email, phone, company, tags, or notes */
    async search(query: string): Promise<Contact[]> {
      const all = await this.getAll();
      return all.filter((c) => matchesSearchQuery(c, query));
    },

    /** Get a specific contact by ID */
    async get(id: string): Promise<Contact | null> {
      const all = await this.getAll();
      return all.find((c) => c.id === id) || null;
    },

    /** Save a contact (create new or update existing) */
    async save(contact: Contact): Promise<void> {
      const all = await this.getAll();
      const index = all.findIndex((c) => c.id === contact.id);
      if (index >= 0) {
        all[index] = contact;
      } else {
        all.push(contact);
      }
      await setData(KEYS.CONTACTS, all);
    },

    /** Toggle favorite status */
    async toggleFavorite(id: string): Promise<void> {
      const contact = await this.get(id);
      if (contact) {
        contact.isFavorite = !contact.isFavorite;
        contact.updatedAt = new Date().toISOString();
        await this.save(contact);
      }
    },

    /** Add a note to a contact */
    async addNote(id: string, noteText: string): Promise<void> {
      const validatedText = validateNote(noteText);
      if (!validatedText) return; // Invalid note text

      const contact = await this.get(id);
      if (contact) {
        const note = {
          id: generateId(),
          text: validatedText,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        contact.notes = [...(contact.notes || []), note];
        contact.updatedAt = new Date().toISOString();
        await this.save(contact);
      }
    },

    /** Update a note */
    async updateNote(
      contactId: string,
      noteId: string,
      newText: string,
    ): Promise<void> {
      const validatedText = validateNote(newText);
      if (!validatedText) return; // Invalid note text

      const contact = await this.get(contactId);
      if (contact && contact.notes) {
        const noteIndex = contact.notes.findIndex((n) => n.id === noteId);
        if (noteIndex >= 0) {
          contact.notes[noteIndex].text = validatedText;
          contact.notes[noteIndex].updatedAt = new Date().toISOString();
          contact.updatedAt = new Date().toISOString();
          await this.save(contact);
        }
      }
    },

    /** Delete a note */
    async deleteNote(contactId: string, noteId: string): Promise<void> {
      const contact = await this.get(contactId);
      if (contact && contact.notes) {
        contact.notes = contact.notes.filter((n) => n.id !== noteId);
        contact.updatedAt = new Date().toISOString();
        await this.save(contact);
      }
    },

    /** Add a tag to a contact */
    async addTag(id: string, tag: string): Promise<void> {
      const validatedTag = validateTag(tag);
      if (!validatedTag) return; // Invalid tag

      const contact = await this.get(id);
      if (contact) {
        contact.tags = [...new Set([...(contact.tags || []), validatedTag])];
        contact.updatedAt = new Date().toISOString();
        await this.save(contact);
      }
    },

    /** Remove a tag from a contact */
    async removeTag(id: string, tag: string): Promise<void> {
      const contact = await this.get(id);
      if (contact && contact.tags) {
        contact.tags = contact.tags.filter((t) => t !== tag);
        contact.updatedAt = new Date().toISOString();
        await this.save(contact);
      }
    },

    /** Add a contact to a group */
    async addToGroup(id: string, groupName: string): Promise<void> {
      const validatedGroup = validateGroup(groupName);
      if (!validatedGroup) return; // Invalid group name

      const contact = await this.get(id);
      if (contact) {
        contact.groups = [
          ...new Set([...(contact.groups || []), validatedGroup]),
        ];
        contact.updatedAt = new Date().toISOString();
        await this.save(contact);
      }
    },

    /** Remove a contact from a group */
    async removeFromGroup(id: string, groupName: string): Promise<void> {
      const contact = await this.get(id);
      if (contact && contact.groups) {
        contact.groups = contact.groups.filter((g) => g !== groupName);
        contact.updatedAt = new Date().toISOString();
        await this.save(contact);
      }
    },

    /** Record interaction with contact */
    async recordInteraction(id: string): Promise<void> {
      const contact = await this.get(id);
      if (contact) {
        contact.lastContactedAt = new Date().toISOString();
        contact.contactFrequency = (contact.contactFrequency || 0) + 1;
        contact.updatedAt = new Date().toISOString();
        await this.save(contact);
      }
    },

    /** Save multiple contacts at once (for bulk import) */
    async saveAll(contacts: Contact[]): Promise<void> {
      await setData(KEYS.CONTACTS, contacts);
    },

    /** Delete a contact by ID */
    async delete(id: string): Promise<void> {
      const all = await this.getAll();
      const filtered = all.filter((c) => c.id !== id);
      await setData(KEYS.CONTACTS, filtered);
    },

    /** Merge duplicate contacts */
    async merge(primaryId: string, duplicateIds: string[]): Promise<void> {
      const primary = await this.get(primaryId);
      if (!primary) return;

      for (const dupId of duplicateIds) {
        const duplicate = await this.get(dupId);
        if (duplicate) {
          // Merge phone numbers
          primary.phoneNumbers = [
            ...new Set([...primary.phoneNumbers, ...duplicate.phoneNumbers]),
          ];
          // Merge emails
          primary.emails = [
            ...new Set([...primary.emails, ...duplicate.emails]),
          ];
          // Merge tags
          primary.tags = [
            ...new Set([...(primary.tags || []), ...(duplicate.tags || [])]),
          ];
          // Merge groups
          primary.groups = [
            ...new Set([
              ...(primary.groups || []),
              ...(duplicate.groups || []),
            ]),
          ];
          // Merge notes
          primary.notes = [
            ...(primary.notes || []),
            ...(duplicate.notes || []),
          ];
          // Merge call history
          primary.callHistory = [
            ...(primary.callHistory || []),
            ...(duplicate.callHistory || []),
          ];
          // Update contact frequency
          primary.contactFrequency =
            (primary.contactFrequency || 0) + (duplicate.contactFrequency || 0);
        }
      }

      primary.updatedAt = new Date().toISOString();
      await this.save(primary);

      // Delete duplicates in batch (more efficient)
      const all = await this.getAll();
      const filtered = all.filter((c) => !duplicateIds.includes(c.id));
      await setData(KEYS.CONTACTS, filtered);
    },

    /** Find potential duplicate contacts */
    async findDuplicates(): Promise<Contact[][]> {
      const all = await this.getAll();
      const duplicates: Contact[][] = [];
      const processed = new Set<string>();

      for (let i = 0; i < all.length; i++) {
        if (processed.has(all[i].id)) continue;

        const group: Contact[] = [all[i]];
        for (let j = i + 1; j < all.length; j++) {
          if (processed.has(all[j].id)) continue;

          if (arePotentialDuplicates(all[i], all[j])) {
            group.push(all[j]);
            processed.add(all[j].id);
          }
        }

        if (group.length > 1) {
          duplicates.push(group);
          group.forEach((c) => processed.add(c.id));
        }
      }

      return duplicates;
    },

    /** Export contacts to JSON */
    async exportToJSON(): Promise<string> {
      const all = await this.getAll();
      return JSON.stringify(all, null, 2);
    },

    /** Import contacts from JSON */
    async importFromJSON(jsonString: string): Promise<number> {
      try {
        const imported = JSON.parse(jsonString) as Contact[];
        const existing = await this.getAll();
        const existingIds = new Set(existing.map((c) => c.id));

        // Only import contacts that don't already exist
        const newContacts = imported.filter((c) => !existingIds.has(c.id));
        if (newContacts.length > 0) {
          await setData(KEYS.CONTACTS, [...existing, ...newContacts]);
        }
        return newContacts.length;
      } catch {
        return 0;
      }
    },

    async syncFromNative(nativeContacts: Contact[]): Promise<void> {
      const existing = await this.getAll();
      const existingMap = new Map(existing.map((c) => [c.id, c]));

      const updated = nativeContacts.map((nc) => {
        const existingContact = existingMap.get(nc.id);
        // Merge native contact data with existing custom fields
        return {
          ...nc,
          // Preserve app-specific fields from existing contact
          isRegistered: existingContact?.isRegistered || nc.isRegistered,
          isFavorite: existingContact?.isFavorite || false,
          groups: existingContact?.groups || [],
          tags: existingContact?.tags || [],
          notes: existingContact?.notes || [],
          callHistory: existingContact?.callHistory || [],
          lastContactedAt: existingContact?.lastContactedAt,
          contactFrequency: existingContact?.contactFrequency || 0,
          // Keep original creation date if exists
          createdAt: existingContact?.createdAt || nc.createdAt,
          // Update the modified timestamp
          updatedAt: new Date().toISOString(),
        };
      });

      await this.saveAll(updated);
    },
  },

  contactGroups: {
    /** Get all contact groups */
    async getAll(): Promise<ContactGroup[]> {
      return getData(KEYS.CONTACT_GROUPS, []);
    },

    /** Get a specific contact group by ID */
    async get(id: string): Promise<ContactGroup | null> {
      const all = await this.getAll();
      return all.find((g) => g.id === id) || null;
    },

    /** Create or update a contact group */
    async save(group: ContactGroup): Promise<void> {
      const all = await this.getAll();
      const index = all.findIndex((g) => g.id === group.id);
      if (index >= 0) {
        all[index] = group;
      } else {
        all.push(group);
      }
      await setData(KEYS.CONTACT_GROUPS, all);
    },

    /** Delete a contact group */
    async delete(id: string): Promise<void> {
      const all = await this.getAll();
      const filtered = all.filter((g) => g.id !== id);
      await setData(KEYS.CONTACT_GROUPS, filtered);
    },

    /** Add contacts to a group */
    async addContacts(groupId: string, contactIds: string[]): Promise<void> {
      const group = await this.get(groupId);
      if (group) {
        group.contactIds = [...new Set([...group.contactIds, ...contactIds])];
        group.updatedAt = new Date().toISOString();
        await this.save(group);
      }
    },

    /** Remove contacts from a group */
    async removeContacts(groupId: string, contactIds: string[]): Promise<void> {
      const group = await this.get(groupId);
      if (group) {
        group.contactIds = group.contactIds.filter(
          (id) => !contactIds.includes(id),
        );
        group.updatedAt = new Date().toISOString();
        await this.save(group);
      }
    },
  },

  settings: {
    async get(): Promise<Settings> {
      return getData(KEYS.SETTINGS, DEFAULT_SETTINGS);
    },
    async save(settings: Settings): Promise<void> {
      await setData(KEYS.SETTINGS, settings);
    },
    async update(partial: Partial<Settings>): Promise<Settings> {
      const current = await this.get();
      const updated = { ...current, ...partial };
      await this.save(updated);
      return updated;
    },
    async trackModuleUsage(moduleId: string): Promise<void> {
      const current = await this.get();
      const stats = current.moduleUsageStats || {};
      const now = new Date().toISOString();

      stats[moduleId] = {
        count: (stats[moduleId]?.count || 0) + 1,
        lastUsed: now,
      };

      await this.update({ moduleUsageStats: stats });
    },
  },

  history: {
    async getAll(): Promise<HistoryLogEntry[]> {
      const entries = await getData<HistoryLogEntry[]>(KEYS.HISTORY, []);
      return entries.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
    },
    async add(entry: Omit<HistoryLogEntry, "id" | "timestamp">): Promise<void> {
      const all = await getData<HistoryLogEntry[]>(KEYS.HISTORY, []);
      const newEntry: HistoryLogEntry = {
        ...entry,
        id: `history_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        timestamp: new Date().toISOString(),
      };
      all.push(newEntry);
      await setData(KEYS.HISTORY, all);
    },
    async getById(id: string): Promise<HistoryLogEntry | null> {
      const entries = await getData<HistoryLogEntry[]>(KEYS.HISTORY, []);
      return entries.find((entry) => entry.id === id) || null;
    },
    async getByType(type: HistoryLogEntry["type"]): Promise<HistoryLogEntry[]> {
      const entries = await this.getAll();
      return entries.filter((entry) => entry.type === type);
    },
    async getByDateRange(
      startDate: Date,
      endDate: Date,
    ): Promise<HistoryLogEntry[]> {
      const entries = await this.getAll();
      return entries.filter((entry) => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= startDate && entryDate <= endDate;
      });
    },
    async search(query: string): Promise<HistoryLogEntry[]> {
      const entries = await this.getAll();
      const lowerQuery = query.toLowerCase();
      return entries.filter(
        (entry) =>
          entry.message.toLowerCase().includes(lowerQuery) ||
          entry.type.toLowerCase().includes(lowerQuery),
      );
    },
    async deleteById(id: string): Promise<void> {
      const entries = await getData<HistoryLogEntry[]>(KEYS.HISTORY, []);
      const filtered = entries.filter((entry) => entry.id !== id);
      await setData(KEYS.HISTORY, filtered);
    },
    async deleteMultiple(ids: string[]): Promise<void> {
      const entries = await getData<HistoryLogEntry[]>(KEYS.HISTORY, []);
      const filtered = entries.filter((entry) => !ids.includes(entry.id));
      await setData(KEYS.HISTORY, filtered);
    },
    async getStatistics(): Promise<{
      totalEntries: number;
      entriesByType: Record<HistoryLogEntry["type"], number>;
      oldestEntry: string | null;
      newestEntry: string | null;
    }> {
      const entries = await this.getAll();
      const entriesByType: Record<HistoryLogEntry["type"], number> = {
        recommendation: 0,
        archived: 0,
        banked: 0,
        deprecated: 0,
        system: 0,
      };

      entries.forEach((entry) => {
        entriesByType[entry.type] = (entriesByType[entry.type] || 0) + 1;
      });

      return {
        totalEntries: entries.length,
        entriesByType,
        oldestEntry:
          entries.length > 0 ? entries[entries.length - 1].timestamp : null,
        newestEntry: entries.length > 0 ? entries[0].timestamp : null,
      };
    },
    async exportToJSON(): Promise<string> {
      const entries = await this.getAll();
      return JSON.stringify(entries, null, 2);
    },

    /**
     * Get the current export schedule for history data.
     *
     * @returns {Promise<HistoryExportSchedule>} Export schedule config
     */
    async getExportSchedule(): Promise<HistoryExportSchedule> {
      return getData(
        KEYS.HISTORY_EXPORT_SCHEDULE,
        DEFAULT_HISTORY_EXPORT_SCHEDULE,
      );
    },

    /**
     * Update the history export schedule.
     * Automatically computes nextExportAt when enabling schedules.
     *
     * @param {Partial<HistoryExportSchedule>} partial - Schedule overrides
     * @returns {Promise<HistoryExportSchedule>} Updated schedule
     */
    async setExportSchedule(
      partial: Partial<HistoryExportSchedule>,
    ): Promise<HistoryExportSchedule> {
      const current = await this.getExportSchedule();
      const merged: HistoryExportSchedule = { ...current, ...partial };

      if (merged.enabled && !merged.nextExportAt) {
        merged.nextExportAt = buildHistoryExportNextAt(
          merged.frequency,
          new Date(),
        ).toISOString();
      }

      await setData(KEYS.HISTORY_EXPORT_SCHEDULE, merged);
      return merged;
    },

    /**
     * Run the scheduled export if the nextExportAt time has elapsed.
     * Acts as a background-job hook for systems that poll periodically.
     *
     * @param {Date} now - Current time (injectable for tests)
     * @returns {Promise<string | null>} JSON export payload if executed
     */
    async runScheduledExport(now: Date = new Date()): Promise<string | null> {
      const schedule = await this.getExportSchedule();
      if (!schedule.enabled || !schedule.nextExportAt) return null;

      const nextExportAt = new Date(schedule.nextExportAt);
      if (nextExportAt > now) return null;

      const payload = await this.exportToJSON();
      const updatedSchedule: HistoryExportSchedule = {
        ...schedule,
        lastExportAt: now.toISOString(),
        nextExportAt: buildHistoryExportNextAt(
          schedule.frequency,
          now,
        ).toISOString(),
      };

      await setData(KEYS.HISTORY_EXPORT_SCHEDULE, updatedSchedule);
      return payload;
    },

    /**
     * Pattern recognition hook for analytics pipelines.
     * Surfaces time-based clustering without changing UI behavior.
     *
     * @returns {Promise<object>} Pattern insight payload
     */
    async getPatternInsights(): Promise<{
      entriesByDay: Record<string, number>;
      entriesByHour: Record<string, number>;
      topTypes: { type: HistoryLogEntry["type"]; count: number }[];
    }> {
      const entries = await this.getAll();
      const entriesByDay: Record<string, number> = {};
      const entriesByHour: Record<string, number> = {};
      const typeCounts: Record<HistoryLogEntry["type"], number> = {
        recommendation: 0,
        archived: 0,
        banked: 0,
        deprecated: 0,
        system: 0,
      };

      entries.forEach((entry) => {
        const timestamp = new Date(entry.timestamp);
        const dayKey = timestamp.toLocaleDateString("en-US", {
          weekday: "short",
          timeZone: "UTC",
        });
        const hourKey = `${timestamp.getUTCHours()}:00`;

        entriesByDay[dayKey] = (entriesByDay[dayKey] || 0) + 1;
        entriesByHour[hourKey] = (entriesByHour[hourKey] || 0) + 1;
        typeCounts[entry.type] = (typeCounts[entry.type] || 0) + 1;
      });

      const topTypes = Object.entries(typeCounts)
        .map(([type, count]) => ({
          type: type as HistoryLogEntry["type"],
          count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      return {
        entriesByDay,
        entriesByHour,
        topTypes,
      };
    },
    async clear(): Promise<void> {
      await setData(KEYS.HISTORY, []);
    },
  },

  aiLimits: {
    async get(): Promise<AILimits> {
      const settings = await db.settings.get();
      const tier = settings.aiLimitTier;
      const total = TIER_LIMITS[tier];

      const stored = await getData<AILimits | null>(KEYS.AI_LIMITS, null);

      if (!stored || new Date(stored.nextRefreshAt) <= new Date()) {
        const refreshTime = new Date();
        refreshTime.setHours(refreshTime.getHours() + 6);
        const fresh: AILimits = {
          used: 0,
          total,
          nextRefreshAt: refreshTime.toISOString(),
        };
        await setData(KEYS.AI_LIMITS, fresh);
        return fresh;
      }

      return { ...stored, total };
    },
    async incrementUsed(): Promise<AILimits> {
      const current = await this.get();
      current.used = Math.min(current.used + 1, current.total);
      await setData(KEYS.AI_LIMITS, current);
      return current;
    },
    async reset(): Promise<AILimits> {
      const settings = await db.settings.get();
      const refreshTime = new Date();
      refreshTime.setHours(refreshTime.getHours() + 6);
      const fresh: AILimits = {
        used: 0,
        total: TIER_LIMITS[settings.aiLimitTier],
        nextRefreshAt: refreshTime.toISOString(),
      };
      await setData(KEYS.AI_LIMITS, fresh);
      return fresh;
    },
  },

  photos: {
    async getAll(): Promise<Photo[]> {
      return getData(KEYS.PHOTOS, []);
    },
    async getAllSorted(): Promise<Photo[]> {
      const all = await this.getAll();
      return all.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    },
    async get(id: string): Promise<Photo | null> {
      const all = await this.getAll();
      return all.find((p) => p.id === id) || null;
    },
    async save(photo: Photo): Promise<void> {
      const all = await this.getAll();
      const index = all.findIndex((p) => p.id === photo.id);
      if (index >= 0) {
        all[index] = photo;
      } else {
        all.push(photo);
      }
      await setData(KEYS.PHOTOS, all);
    },
    async delete(id: string): Promise<void> {
      const all = await this.getAll();
      const filtered = all.filter((p) => p.id !== id);
      await setData(KEYS.PHOTOS, filtered);
    },
    async deleteMultiple(ids: string[]): Promise<void> {
      const all = await this.getAll();
      const filtered = all.filter((p) => !ids.includes(p.id));
      await setData(KEYS.PHOTOS, filtered);
    },
    async updateBackupStatus(id: string, isBackedUp: boolean): Promise<void> {
      const all = await this.getAll();
      const photo = all.find((p) => p.id === id);
      if (photo) {
        photo.isBackedUp = isBackedUp;
        photo.updatedAt = new Date().toISOString();
        await setData(KEYS.PHOTOS, all);
      }
    },
    async getByTag(tag: string): Promise<Photo[]> {
      const all = await this.getAll();
      return all.filter((p) => p.tags.includes(tag));
    },
    async toggleFavorite(id: string): Promise<void> {
      const all = await this.getAll();
      const photo = all.find((p) => p.id === id);
      if (photo) {
        photo.isFavorite = !photo.isFavorite;
        photo.updatedAt = new Date().toISOString();
        await setData(KEYS.PHOTOS, all);
      }
    },
    async getFavorites(): Promise<Photo[]> {
      const all = await this.getAll();
      return all.filter((p) => p.isFavorite === true);
    },
    async getByAlbum(albumId: string): Promise<Photo[]> {
      const all = await this.getAll();
      return all.filter((p) => p.albumId === albumId);
    },
    async getWithoutAlbum(): Promise<Photo[]> {
      const all = await this.getAll();
      return all.filter((p) => !p.albumId);
    },
    async moveToAlbum(photoIds: string[], albumId: string): Promise<void> {
      const all = await this.getAll();
      const now = new Date().toISOString();
      photoIds.forEach((id) => {
        const photo = all.find((p) => p.id === id);
        if (photo) {
          photo.albumId = albumId;
          photo.updatedAt = now;
        }
      });
      await setData(KEYS.PHOTOS, all);
    },
    async removeFromAlbum(photoIds: string[]): Promise<void> {
      const all = await this.getAll();
      const now = new Date().toISOString();
      photoIds.forEach((id) => {
        const photo = all.find((p) => p.id === id);
        if (photo) {
          photo.albumId = undefined;
          photo.updatedAt = now;
        }
      });
      await setData(KEYS.PHOTOS, all);
    },
    async addTags(id: string, tags: string[]): Promise<void> {
      const all = await this.getAll();
      const photo = all.find((p) => p.id === id);
      if (photo) {
        const uniqueTags = [...new Set([...photo.tags, ...tags])];
        photo.tags = uniqueTags;
        photo.updatedAt = new Date().toISOString();
        await setData(KEYS.PHOTOS, all);
      }
    },
    async removeTags(id: string, tags: string[]): Promise<void> {
      const all = await this.getAll();
      const photo = all.find((p) => p.id === id);
      if (photo) {
        photo.tags = photo.tags.filter((t) => !tags.includes(t));
        photo.updatedAt = new Date().toISOString();
        await setData(KEYS.PHOTOS, all);
      }
    },
    async search(query: string): Promise<Photo[]> {
      const all = await this.getAll();
      const lowerQuery = query.toLowerCase();
      return all.filter(
        (p) =>
          p.fileName.toLowerCase().includes(lowerQuery) ||
          p.tags.some((t) => t.toLowerCase().includes(lowerQuery)) ||
          p.description?.toLowerCase().includes(lowerQuery),
      );
    },
    async getStatistics(): Promise<{
      totalPhotos: number;
      totalSize: number;
      backedUpCount: number;
      favoriteCount: number;
      albumCount: number;
      taggedCount: number;
    }> {
      const all = await this.getAll();
      const albums = await db.photoAlbums.getAll();
      return {
        totalPhotos: all.length,
        totalSize: all.reduce((sum, p) => sum + p.fileSize, 0),
        backedUpCount: all.filter((p) => p.isBackedUp).length,
        favoriteCount: all.filter((p) => p.isFavorite).length,
        albumCount: albums.length,
        taggedCount: all.filter((p) => p.tags.length > 0).length,
      };
    },
  },

  /**
   * Photo Albums Module
   *
   * Manages photo album storage operations.
   * Albums are collections of photos with custom names and cover photos.
   */
  photoAlbums: {
    async getAll(): Promise<PhotoAlbum[]> {
      return getData(KEYS.PHOTO_ALBUMS, []);
    },
    async get(id: string): Promise<PhotoAlbum | null> {
      const all = await this.getAll();
      return all.find((a) => a.id === id) || null;
    },
    async save(album: PhotoAlbum): Promise<void> {
      const all = await this.getAll();
      const index = all.findIndex((a) => a.id === album.id);
      if (index >= 0) {
        all[index] = album;
      } else {
        all.push(album);
      }
      await setData(KEYS.PHOTO_ALBUMS, all);
    },
    async delete(id: string): Promise<void> {
      const all = await this.getAll();
      const filtered = all.filter((a) => a.id !== id);
      await setData(KEYS.PHOTO_ALBUMS, filtered);

      // Remove album reference from photos
      const photos = await db.photos.getByAlbum(id);
      if (photos.length > 0) {
        await db.photos.removeFromAlbum(photos.map((p) => p.id));
      }
    },
    async updatePhotoCount(albumId: string): Promise<void> {
      const photos = await db.photos.getByAlbum(albumId);
      const all = await this.getAll();
      const album = all.find((a) => a.id === albumId);
      if (album) {
        album.photoCount = photos.length;
        album.updatedAt = new Date().toISOString();
        await setData(KEYS.PHOTO_ALBUMS, all);
      }
    },
  },

  /**
   * Budgets Module
   *
   * Manages monthly budget storage operations.
   * Budgets contain categories with line items tracking budgeted vs actual amounts.
   */
  budgets: {
    /**
     * Get all budgets from storage
     *
     * @returns {Promise<Budget[]>} Array of all budgets
     */
    async getAll(): Promise<Budget[]> {
      return getData(KEYS.BUDGETS, []);
    },

    /**
     * Get a specific budget by ID
     *
     * @param {string} id - The budget ID
     * @returns {Promise<Budget | null>} The budget if found, null otherwise
     */
    async get(id: string): Promise<Budget | null> {
      const all = await this.getAll();
      return all.find((b) => b.id === id) || null;
    },

    /**
     * Get the budget for the current month (YYYY-MM format)
     *
     * @returns {Promise<Budget | null>} The current month's budget if found, null otherwise
     */
    async getCurrent(): Promise<Budget | null> {
      const all = await this.getAll();
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      return all.find((b) => b.month === currentMonth) || null;
    },

    /**
     * Save a budget (create new or update existing)
     *
     * @param {Budget} budget - The budget to save
     * @returns {Promise<void>}
     */
    async save(budget: Budget): Promise<void> {
      const all = await this.getAll();
      const index = all.findIndex((b) => b.id === budget.id);
      if (index >= 0) {
        all[index] = budget;
      } else {
        all.push(budget);
      }
      await setData(KEYS.BUDGETS, all);
    },

    /**
     * Delete a budget by ID
     *
     * @param {string} id - The budget ID to delete
     * @returns {Promise<void>}
     */
    async delete(id: string): Promise<void> {
      const all = await this.getAll();
      const filtered = all.filter((b) => b.id !== id);
      await setData(KEYS.BUDGETS, filtered);
    },

    /**
     * Search budgets by query string
     * Searches across budget name, category names, and line item names
     *
     * @param {string} query - The search query
     * @returns {Promise<Budget[]>} Array of matching budgets
     */
    async search(query: string): Promise<Budget[]> {
      const all = await this.getAll();
      const lowerQuery = query.toLowerCase().trim();

      if (!lowerQuery) {
        return all;
      }

      return all.filter((budget) => {
        // Search in budget name
        if (budget.name.toLowerCase().includes(lowerQuery)) {
          return true;
        }

        // Search in categories and line items
        return budget.categories.some((category) => {
          if (category.name.toLowerCase().includes(lowerQuery)) {
            return true;
          }
          return category.lineItems.some((item) =>
            item.name.toLowerCase().includes(lowerQuery),
          );
        });
      });
    },

    /**
     * Get budgets within a date range (by month)
     *
     * @param {string} startMonth - Start month in YYYY-MM format
     * @param {string} endMonth - End month in YYYY-MM format
     * @returns {Promise<Budget[]>} Array of budgets within the range
     */
    async getByDateRange(
      startMonth: string,
      endMonth: string,
    ): Promise<Budget[]> {
      const all = await this.getAll();
      return all.filter(
        (budget) => budget.month >= startMonth && budget.month <= endMonth,
      );
    },

    /**
     * Get all budgets sorted by month (most recent first)
     *
     * @returns {Promise<Budget[]>} Array of budgets sorted by month descending
     */
    async getAllSorted(): Promise<Budget[]> {
      const all = await this.getAll();
      return all.sort((a, b) => b.month.localeCompare(a.month));
    },

    /**
     * Calculate statistics across all budgets
     *
     * @returns {Promise<object>} Budget statistics
     */
    async getStatistics(): Promise<{
      totalBudgets: number;
      totalBudgeted: number;
      totalActual: number;
      totalDifference: number;
      averageBudgeted: number;
      averageActual: number;
      categoryCount: number;
      lineItemCount: number;
      mostRecentMonth: string | null;
      oldestMonth: string | null;
    }> {
      const all = await this.getAll();

      if (all.length === 0) {
        return {
          totalBudgets: 0,
          totalBudgeted: 0,
          totalActual: 0,
          totalDifference: 0,
          averageBudgeted: 0,
          averageActual: 0,
          categoryCount: 0,
          lineItemCount: 0,
          mostRecentMonth: null,
          oldestMonth: null,
        };
      }

      let totalBudgeted = 0;
      let totalActual = 0;
      let categoryCount = 0;
      let lineItemCount = 0;

      all.forEach((budget) => {
        categoryCount += budget.categories.length;
        budget.categories.forEach((category) => {
          lineItemCount += category.lineItems.length;
          category.lineItems.forEach((item) => {
            totalBudgeted += item.budgeted;
            totalActual += item.actual;
          });
        });
      });

      const sorted = [...all].sort((a, b) => b.month.localeCompare(a.month));

      return {
        totalBudgets: all.length,
        totalBudgeted,
        totalActual,
        totalDifference: totalBudgeted - totalActual,
        averageBudgeted: totalBudgeted / all.length,
        averageActual: totalActual / all.length,
        categoryCount,
        lineItemCount,
        mostRecentMonth: sorted[0]?.month || null,
        oldestMonth: sorted[sorted.length - 1]?.month || null,
      };
    },

    /**
     * Get category totals for a specific budget
     *
     * @param {string} budgetId - The budget ID
     * @returns {Promise<Array>} Array of category totals
     */
    async getCategoryTotals(budgetId: string): Promise<
      {
        categoryId: string;
        categoryName: string;
        budgeted: number;
        actual: number;
        difference: number;
      }[]
    > {
      const budget = await this.get(budgetId);
      if (!budget) {
        return [];
      }

      return budget.categories.map((category) => {
        let budgeted = 0;
        let actual = 0;

        category.lineItems.forEach((item) => {
          budgeted += item.budgeted;
          actual += item.actual;
        });

        return {
          categoryId: category.id,
          categoryName: category.name,
          budgeted,
          actual,
          difference: budgeted - actual,
        };
      });
    },

    /**
     * Compare two budgets by month
     *
     * @param {string} month1 - First month in YYYY-MM format
     * @param {string} month2 - Second month in YYYY-MM format
     * @returns {Promise<object | null>} Comparison data or null if budgets not found
     */
    async compareMonths(
      month1: string,
      month2: string,
    ): Promise<{
      month1Budget: Budget;
      month2Budget: Budget;
      budgetedDiff: number;
      actualDiff: number;
      percentageChange: number;
    } | null> {
      const all = await this.getAll();
      const budget1 = all.find((b) => b.month === month1);
      const budget2 = all.find((b) => b.month === month2);

      if (!budget1 || !budget2) {
        return null;
      }

      const calcTotal = (budget: Budget) => {
        let budgeted = 0;
        let actual = 0;
        budget.categories.forEach((cat) => {
          cat.lineItems.forEach((item) => {
            budgeted += item.budgeted;
            actual += item.actual;
          });
        });
        return { budgeted, actual };
      };

      const total1 = calcTotal(budget1);
      const total2 = calcTotal(budget2);

      const budgetedDiff = total2.budgeted - total1.budgeted;
      const actualDiff = total2.actual - total1.actual;

      // Calculate percentage change
      // If total1.actual is 0, percentage change is 100% if total2 > 0, 0% if total2 = 0
      const percentageChange =
        total1.actual > 0
          ? ((total2.actual - total1.actual) / total1.actual) * 100
          : total2.actual > 0
            ? 100
            : 0;

      return {
        month1Budget: budget1,
        month2Budget: budget2,
        budgetedDiff,
        actualDiff,
        percentageChange,
      };
    },

    /**
     * Duplicate a budget to a new month
     *
     * @param {string} budgetId - The budget ID to duplicate
     * @param {string} newMonth - New month in YYYY-MM format
     * @param {string} newName - Name for the new budget
     * @returns {Promise<Budget>} The newly created budget
     */
    async duplicate(
      budgetId: string,
      newMonth: string,
      newName: string,
    ): Promise<Budget | null> {
      const budget = await this.get(budgetId);
      if (!budget) {
        return null;
      }

      const now = new Date().toISOString();
      const newBudget: Budget = {
        ...budget,
        id: generateId(),
        name: newName,
        month: newMonth,
        createdAt: now,
        updatedAt: now,
        // Reset all actual amounts to 0 for the new month
        categories: budget.categories.map((cat) => ({
          ...cat,
          id: generateId(),
          lineItems: cat.lineItems.map((item) => ({
            ...item,
            id: generateId(),
            actual: 0,
          })),
        })),
      };

      await this.save(newBudget);
      return newBudget;
    },

    /**
     * Export budget data as JSON string
     *
     * @param {string} budgetId - The budget ID to export
     * @returns {Promise<string | null>} JSON string or null if budget not found
     */
    async exportToJSON(budgetId: string): Promise<string | null> {
      const budget = await this.get(budgetId);
      if (!budget) {
        return null;
      }
      return JSON.stringify(budget, null, 2);
    },

    /**
     * Export all budgets as JSON string
     *
     * @returns {Promise<string>} JSON string of all budgets
     */
    async exportAllToJSON(): Promise<string> {
      const all = await this.getAll();
      return JSON.stringify(all, null, 2);
    },

    /**
     * Delete multiple budgets by IDs
     *
     * @param {string[]} ids - Array of budget IDs to delete
     * @returns {Promise<void>}
     */
    async bulkDelete(ids: string[]): Promise<void> {
      const all = await this.getAll();
      const filtered = all.filter((b) => !ids.includes(b.id));
      await setData(KEYS.BUDGETS, filtered);
    },
  },

  /**
   * Integrations Storage
   *
   * CRUD operations for third-party service integrations.
   */
  integrations: {
    /**
     * Get all integrations
     *
     * @returns {Promise<Integration[]>} Array of all integrations
     */
    async getAll(): Promise<Integration[]> {
      return getData<Integration[]>(KEYS.INTEGRATIONS, []);
    },

    /**
     * Get all integrations sorted by category and name
     *
     * @returns {Promise<Integration[]>} Sorted array of integrations
     */
    async getAllSorted(): Promise<Integration[]> {
      const all = await this.getAll();
      return all.sort((a, b) => {
        // Sort by category first, then by name
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        return a.name.localeCompare(b.name);
      });
    },

    /**
     * Get integrations by category
     *
     * @param {string} category - Integration category to filter by
     * @returns {Promise<Integration[]>} Array of integrations in the category
     */
    async getByCategory(category: string): Promise<Integration[]> {
      const all = await this.getAll();
      return all.filter((integration) => integration.category === category);
    },

    /**
     * Get integrations by status
     *
     * @param {string} status - Connection status to filter by
     * @returns {Promise<Integration[]>} Array of integrations with the status
     */
    async getByStatus(status: string): Promise<Integration[]> {
      const all = await this.getAll();
      return all.filter((integration) => integration.status === status);
    },

    /**
     * Get an integration by ID
     *
     * @param {string} id - Integration ID
     * @returns {Promise<Integration | null>} Integration or null if not found
     */
    async getById(id: string): Promise<Integration | null> {
      const all = await this.getAll();
      return all.find((integration) => integration.id === id) ?? null;
    },

    /**
     * Save or update an integration
     *
     * @param {Integration} integration - Integration to save
     */
    async save(integration: Integration): Promise<void> {
      const all = await this.getAll();
      const index = all.findIndex((i) => i.id === integration.id);

      if (index >= 0) {
        all[index] = integration;
      } else {
        all.push(integration);
      }

      await setData(KEYS.INTEGRATIONS, all);
    },

    /**
     * Delete an integration by ID
     *
     * @param {string} id - Integration ID
     */
    async delete(id: string): Promise<void> {
      const all = await this.getAll();
      const filtered = all.filter((integration) => integration.id !== id);
      await setData(KEYS.INTEGRATIONS, filtered);
    },

    /**
     * Update integration status
     *
     * @param {string} id - Integration ID
     * @param {string} status - New status
     */
    async updateStatus(id: string, status: string): Promise<void> {
      const integration = await this.getById(id);
      if (integration) {
        integration.status = status as any;
        integration.updatedAt = new Date().toISOString();
        await this.save(integration);
      }
    },

    /**
     * Update integration last sync time
     *
     * @param {string} id - Integration ID
     */
    async updateLastSync(id: string): Promise<void> {
      const integration = await this.getById(id);
      if (integration) {
        integration.lastSyncAt = new Date().toISOString();
        integration.stats.totalSyncs += 1;
        integration.updatedAt = new Date().toISOString();
        await this.save(integration);
      }
    },

    /**
     * Toggle integration enabled state
     *
     * @param {string} id - Integration ID
     */
    async toggleEnabled(id: string): Promise<void> {
      const integration = await this.getById(id);
      if (integration) {
        integration.isEnabled = !integration.isEnabled;
        integration.updatedAt = new Date().toISOString();
        await this.save(integration);
      }
    },

    /**
     * Search integrations by query (name, service name, or description)
     * Performs case-insensitive search across multiple fields
     * Returns all integrations when query is empty or whitespace only
     *
     * @param {string} query - Search query string
     * @returns {Promise<Integration[]>} Array of matching integrations
     */
    async search(query: string): Promise<Integration[]> {
      const all = await this.getAll();
      if (!query.trim()) return all;

      const lowerQuery = query.toLowerCase();
      return all.filter(
        (integration) =>
          integration.name.toLowerCase().includes(lowerQuery) ||
          integration.serviceName.toLowerCase().includes(lowerQuery) ||
          integration.description.toLowerCase().includes(lowerQuery),
      );
    },

    /**
     * Get integrations with advanced filtering options
     * Supports filtering by category, status, and enabled state
     *
     * @param {Object} filters - Filter options
     * @param {string} [filters.category] - Filter by category
     * @param {string} [filters.status] - Filter by status
     * @param {boolean} [filters.isEnabled] - Filter by enabled state
     * @returns {Promise<Integration[]>} Filtered array of integrations
     */
    async filter(filters: {
      category?: string;
      status?: string;
      isEnabled?: boolean;
    }): Promise<Integration[]> {
      const all = await this.getAll();
      return all.filter((integration) => {
        if (filters.category && integration.category !== filters.category) {
          return false;
        }
        if (filters.status && integration.status !== filters.status) {
          return false;
        }
        if (
          filters.isEnabled !== undefined &&
          integration.isEnabled !== filters.isEnabled
        ) {
          return false;
        }
        return true;
      });
    },

    /**
     * Get integration statistics
     * Calculates metrics for connected integrations, sync stats, and health
     *
     * @returns {Promise<Object>} Statistics object with various metrics
     */
    async getStatistics(): Promise<{
      totalIntegrations: number;
      connectedCount: number;
      disconnectedCount: number;
      errorCount: number;
      syncingCount: number;
      enabledCount: number;
      totalSyncs: number;
      totalDataItemsSynced: number;
      averageSyncDuration: number;
      totalErrors: number;
      categoryCounts: Record<string, number>;
      recentSyncs: { id: string; name: string; lastSyncAt: string }[];
    }> {
      const all = await this.getAll();

      const connectedIntegrations = all.filter((i) => i.status === "connected");
      const disconnectedIntegrations = all.filter(
        (i) => i.status === "disconnected",
      );
      const errorIntegrations = all.filter((i) => i.status === "error");
      const syncingIntegrations = all.filter((i) => i.status === "syncing");
      const enabledIntegrations = all.filter((i) => i.isEnabled);

      const totalSyncs = all.reduce((sum, i) => sum + i.stats.totalSyncs, 0);
      const totalDataItemsSynced = all.reduce(
        (sum, i) => sum + i.stats.dataItemsSynced,
        0,
      );

      // Calculate average sync duration across all integrations
      const integrationsWithSyncs = all.filter((i) => i.stats.totalSyncs > 0);
      const averageSyncDuration =
        integrationsWithSyncs.length > 0
          ? integrationsWithSyncs.reduce(
              (sum, i) => sum + i.stats.lastSyncDurationMs,
              0,
            ) / integrationsWithSyncs.length
          : 0;

      const totalErrors = all.reduce((sum, i) => sum + i.stats.errorCount, 0);

      // Count integrations by category
      const categoryCounts: Record<string, number> = {};
      all.forEach((integration) => {
        categoryCounts[integration.category] =
          (categoryCounts[integration.category] || 0) + 1;
      });

      // Get recent syncs (last 5 integrations that synced)
      const recentSyncs = all
        .filter((i) => i.lastSyncAt)
        .sort(
          (a, b) =>
            new Date(b.lastSyncAt!).getTime() -
            new Date(a.lastSyncAt!).getTime(),
        )
        .slice(0, 5)
        .map((i) => ({
          id: i.id,
          name: i.name,
          lastSyncAt: i.lastSyncAt!,
        }));

      return {
        totalIntegrations: all.length,
        connectedCount: connectedIntegrations.length,
        disconnectedCount: disconnectedIntegrations.length,
        errorCount: errorIntegrations.length,
        syncingCount: syncingIntegrations.length,
        enabledCount: enabledIntegrations.length,
        totalSyncs,
        totalDataItemsSynced,
        averageSyncDuration,
        totalErrors,
        categoryCounts,
        recentSyncs,
      };
    },

    /**
     * Trigger sync for an integration
     * Updates sync timestamp and increments sync count
     *
     * @param {string} id - Integration ID
     * @param {number} durationMs - Sync duration in milliseconds
     * @param {number} itemsSynced - Number of items synced
     */
    async triggerSync(
      id: string,
      durationMs: number,
      itemsSynced: number,
    ): Promise<void> {
      const integration = await this.getById(id);
      if (integration) {
        integration.lastSyncAt = new Date().toISOString();
        integration.stats.totalSyncs += 1;
        integration.stats.lastSyncDurationMs = durationMs;
        integration.stats.dataItemsSynced += itemsSynced;
        integration.status = "connected";
        integration.updatedAt = new Date().toISOString();
        await this.save(integration);
      }
    },

    /**
     * Record sync error for an integration
     * Updates error count and sets status to error
     *
     * @param {string} id - Integration ID
     */
    async recordSyncError(id: string): Promise<void> {
      const integration = await this.getById(id);
      if (integration) {
        integration.stats.errorCount += 1;
        integration.status = "error";
        integration.updatedAt = new Date().toISOString();
        await this.save(integration);
      }
    },

    /**
     * Bulk enable/disable integrations
     * Enables or disables multiple integrations at once
     *
     * @param {string[]} ids - Array of integration IDs
     * @param {boolean} enabled - Whether to enable or disable
     */
    async bulkSetEnabled(ids: string[], enabled: boolean): Promise<void> {
      const all = await this.getAll();
      const updated = all.map((integration) => {
        if (ids.includes(integration.id)) {
          return {
            ...integration,
            isEnabled: enabled,
            updatedAt: new Date().toISOString(),
          };
        }
        return integration;
      });
      await setData(KEYS.INTEGRATIONS, updated);
    },

    /**
     * Bulk update integration status
     * Updates status for multiple integrations
     *
     * @param {string[]} ids - Array of integration IDs
     * @param {string} status - New status
     */
    async bulkUpdateStatus(ids: string[], status: string): Promise<void> {
      const all = await this.getAll();
      const updated = all.map((integration) => {
        if (ids.includes(integration.id)) {
          return {
            ...integration,
            status: status as any,
            updatedAt: new Date().toISOString(),
          };
        }
        return integration;
      });
      await setData(KEYS.INTEGRATIONS, updated);
    },

    /**
     * Export integration configuration to JSON
     * Creates a JSON export of a specific integration
     *
     * @param {string} id - Integration ID
     * @returns {Promise<string>} JSON string of the integration
     * @throws {Error} When integration with specified ID is not found
     */
    async exportToJSON(id: string): Promise<string> {
      const integration = await this.getById(id);
      if (!integration) {
        throw new Error(`Integration with ID "${id}" not found`);
      }
      return JSON.stringify(integration, null, 2);
    },

    /**
     * Export all integrations to JSON
     * Creates a JSON export of all integrations
     *
     * @returns {Promise<string>} JSON string of all integrations
     */
    async exportAllToJSON(): Promise<string> {
      const all = await this.getAll();
      return JSON.stringify(all, null, 2);
    },

    /**
     * Get integrations requiring sync
     * Returns integrations that are enabled and connected but haven't synced recently
     *
     * @param {number} hoursThreshold - Hours since last sync (default: 24)
     * @returns {Promise<Integration[]>} Array of integrations needing sync
     */
    async getRequiringSync(
      hoursThreshold: number = 24,
    ): Promise<Integration[]> {
      const all = await this.getAll();
      const threshold = Date.now() - hoursThreshold * 60 * 60 * 1000;

      return all.filter((integration) => {
        if (!integration.isEnabled || integration.status !== "connected") {
          return false;
        }

        if (!integration.lastSyncAt) {
          return true; // Never synced
        }

        const lastSync = new Date(integration.lastSyncAt).getTime();
        return lastSync < threshold;
      });
    },

    /**
     * Get integrations health report
     * Provides a summary of integration health and issues
     *
     * @returns {Promise<Object>} Health report with warnings and recommendations
     */
    async getHealthReport(): Promise<{
      healthy: boolean;
      warnings: string[];
      recommendations: string[];
      errorIntegrations: { id: string; name: string }[];
      staleIntegrations: { id: string; name: string; lastSyncAt: string }[];
    }> {
      const all = await this.getAll();
      const warnings: string[] = [];
      const recommendations: string[] = [];

      // Check for integrations with errors
      const errorIntegrations = all
        .filter((i) => i.status === "error")
        .map((i) => ({ id: i.id, name: i.name }));

      if (errorIntegrations.length > 0) {
        warnings.push(`${errorIntegrations.length} integration(s) have errors`);
        recommendations.push("Review and reconnect integrations with errors");
      }

      // Check for stale integrations (no sync in 7+ days)
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const staleIntegrations = all
        .filter((i) => {
          if (!i.isEnabled || i.status !== "connected" || !i.lastSyncAt) {
            return false;
          }
          return new Date(i.lastSyncAt).getTime() < sevenDaysAgo;
        })
        .map((i) => ({ id: i.id, name: i.name, lastSyncAt: i.lastSyncAt! }));

      if (staleIntegrations.length > 0) {
        warnings.push(
          `${staleIntegrations.length} integration(s) haven't synced in 7+ days`,
        );
        recommendations.push("Trigger manual sync for stale integrations");
      }

      // Check for disabled integrations that might be useful
      const disabledCount = all.filter((i) => !i.isEnabled).length;
      if (disabledCount > all.length / 2) {
        recommendations.push(
          "Consider enabling more integrations for better productivity",
        );
      }

      // Check for high error rates
      const highErrorIntegrations = all.filter(
        (i) => i.stats.errorCount > 5 && i.stats.totalSyncs > 0,
      );
      if (highErrorIntegrations.length > 0) {
        warnings.push(
          `${highErrorIntegrations.length} integration(s) have high error rates`,
        );
        recommendations.push(
          "Check integration configurations and credentials",
        );
      }

      const healthy = warnings.length === 0 && errorIntegrations.length === 0;

      return {
        healthy,
        warnings,
        recommendations,
        errorIntegrations,
        staleIntegrations,
      };
    },
  },

  /**
   * Email Threads Module
   *
   * Manages email thread storage with advanced filtering, search, and organization features.
   * Provides persistent storage via AsyncStorage with 28 database methods for comprehensive operations.
   * Supports starring, archiving, labeling, importance marking, and bulk operations.
   */
  emailThreads: {
    /**
     * Get all email threads from storage
     *
     * @returns {Promise<EmailThread[]>} Array of all email threads
     */
    async getAll(): Promise<EmailThread[]> {
      return getData(KEYS.EMAIL_THREADS, []);
    },

    /**
     * Get active (non-archived) email threads
     * Excludes archived and draft threads by default
     *
     * @returns {Promise<EmailThread[]>} Array of active threads
     */
    async getActive(): Promise<EmailThread[]> {
      const all = await this.getAll();
      return all.filter((t) => !t.isArchived && !t.isDraft);
    },

    /**
     * Get archived email threads
     *
     * @returns {Promise<EmailThread[]>} Array of archived threads
     */
    async getArchived(): Promise<EmailThread[]> {
      const all = await this.getAll();
      return all.filter((t) => t.isArchived === true);
    },

    /**
     * Get draft email threads
     *
     * @returns {Promise<EmailThread[]>} Array of draft threads
     */
    async getDrafts(): Promise<EmailThread[]> {
      const all = await this.getAll();
      return all.filter((t) => t.isDraft === true);
    },

    /**
     * Get starred email threads
     *
     * @returns {Promise<EmailThread[]>} Array of starred threads
     */
    async getStarred(): Promise<EmailThread[]> {
      const all = await this.getAll();
      return all.filter((t) => t.isStarred === true);
    },

    /**
     * Get unread email threads
     *
     * @returns {Promise<EmailThread[]>} Array of unread threads
     */
    async getUnread(): Promise<EmailThread[]> {
      const all = await this.getAll();
      return all.filter((t) => !t.isRead);
    },

    /**
     * Get important/priority email threads
     *
     * @returns {Promise<EmailThread[]>} Array of important threads
     */
    async getImportant(): Promise<EmailThread[]> {
      const all = await this.getAll();
      return all.filter((t) => t.isImportant === true);
    },

    /**
     * Get threads by label/tag
     *
     * @param {string} label - The label to filter by
     * @returns {Promise<EmailThread[]>} Array of threads with the specified label
     */
    async getByLabel(label: string): Promise<EmailThread[]> {
      const all = await this.getAll();
      return all.filter((t) => t.labels?.includes(label));
    },

    /**
     * Get all unique labels across all threads
     *
     * @returns {Promise<string[]>} Array of unique label names
     */
    async getAllLabels(): Promise<string[]> {
      const all = await this.getAll();
      const labels = new Set<string>();
      all.forEach((thread) => {
        thread.labels?.forEach((label) => labels.add(label));
      });
      return Array.from(labels).sort();
    },

    /**
     * Search threads by query string
     * Searches across subject, participants, and message bodies
     *
     * @param {string} query - Search query string
     * @returns {Promise<EmailThread[]>} Array of matching threads
     */
    async search(query: string): Promise<EmailThread[]> {
      if (!query.trim()) {
        return this.getActive();
      }

      const all = await this.getActive();
      const lowerQuery = query.toLowerCase();

      return all.filter((thread) => {
        // Search in subject
        if (thread.subject.toLowerCase().includes(lowerQuery)) {
          return true;
        }

        // Search in participants
        if (
          thread.participants.some((p) => p.toLowerCase().includes(lowerQuery))
        ) {
          return true;
        }

        // Search in message bodies
        if (
          thread.messages.some((m) => m.body.toLowerCase().includes(lowerQuery))
        ) {
          return true;
        }

        // Search in labels
        if (thread.labels?.some((l) => l.toLowerCase().includes(lowerQuery))) {
          return true;
        }

        return false;
      });
    },

    /**
     * Get thread by ID
     *
     * @param {string} id - Thread ID
     * @returns {Promise<EmailThread | undefined>} The thread or undefined
     */
    async getById(id: string): Promise<EmailThread | undefined> {
      const all = await this.getAll();
      return all.find((t) => t.id === id);
    },

    /**
     * Save an email thread (create or update)
     *
     * @param {EmailThread} thread - The thread to save
     * @returns {Promise<void>}
     */
    async save(thread: EmailThread): Promise<void> {
      const all = await this.getAll();
      const index = all.findIndex((t) => t.id === thread.id);
      if (index >= 0) {
        all[index] = thread;
      } else {
        all.push(thread);
      }
      await setData(KEYS.EMAIL_THREADS, all);
    },

    /**
     * Delete a thread by ID
     *
     * @param {string} id - Thread ID to delete
     * @returns {Promise<void>}
     */
    async delete(id: string): Promise<void> {
      const all = await this.getAll();
      const filtered = all.filter((t) => t.id !== id);
      await setData(KEYS.EMAIL_THREADS, filtered);
    },

    /**
     * Toggle starred status for a thread
     *
     * @param {string} id - Thread ID
     * @returns {Promise<void>}
     */
    async toggleStar(id: string): Promise<void> {
      const thread = await this.getById(id);
      if (thread) {
        thread.isStarred = !thread.isStarred;
        await this.save(thread);
      }
    },

    /**
     * Mark thread as read
     *
     * @param {string} id - Thread ID
     * @returns {Promise<void>}
     */
    async markAsRead(id: string): Promise<void> {
      const thread = await this.getById(id);
      if (thread) {
        thread.isRead = true;
        // Also mark all messages as read
        thread.messages.forEach((m) => (m.isRead = true));
        await this.save(thread);
      }
    },

    /**
     * Mark thread as unread
     *
     * @param {string} id - Thread ID
     * @returns {Promise<void>}
     */
    async markAsUnread(id: string): Promise<void> {
      const thread = await this.getById(id);
      if (thread) {
        thread.isRead = false;
        await this.save(thread);
      }
    },

    /**
     * Toggle important/priority status for a thread
     *
     * @param {string} id - Thread ID
     * @returns {Promise<void>}
     */
    async toggleImportant(id: string): Promise<void> {
      const thread = await this.getById(id);
      if (thread) {
        thread.isImportant = !thread.isImportant;
        await this.save(thread);
      }
    },

    /**
     * Archive a thread
     *
     * @param {string} id - Thread ID
     * @returns {Promise<void>}
     */
    async archive(id: string): Promise<void> {
      const thread = await this.getById(id);
      if (thread) {
        thread.isArchived = true;
        await this.save(thread);
      }
    },

    /**
     * Unarchive a thread
     *
     * @param {string} id - Thread ID
     * @returns {Promise<void>}
     */
    async unarchive(id: string): Promise<void> {
      const thread = await this.getById(id);
      if (thread) {
        thread.isArchived = false;
        await this.save(thread);
      }
    },

    /**
     * Add a label to a thread
     *
     * @param {string} id - Thread ID
     * @param {string} label - Label to add
     * @returns {Promise<void>}
     */
    async addLabel(id: string, label: string): Promise<void> {
      const thread = await this.getById(id);
      if (thread) {
        if (!thread.labels) {
          thread.labels = [];
        }
        if (!thread.labels.includes(label)) {
          thread.labels.push(label);
          await this.save(thread);
        }
      }
    },

    /**
     * Remove a label from a thread
     *
     * @param {string} id - Thread ID
     * @param {string} label - Label to remove
     * @returns {Promise<void>}
     */
    async removeLabel(id: string, label: string): Promise<void> {
      const thread = await this.getById(id);
      if (thread) {
        if (thread.labels) {
          thread.labels = thread.labels.filter((l) => l !== label);
          await this.save(thread);
        }
      }
    },

    /**
     * Bulk mark threads as read
     *
     * @param {string[]} ids - Array of thread IDs
     * @returns {Promise<void>}
     */
    async bulkMarkAsRead(ids: string[]): Promise<void> {
      const all = await this.getAll();
      let modified = false;

      all.forEach((thread) => {
        if (ids.includes(thread.id) && !thread.isRead) {
          thread.isRead = true;
          thread.messages.forEach((m) => (m.isRead = true));
          modified = true;
        }
      });

      if (modified) {
        await setData(KEYS.EMAIL_THREADS, all);
      }
    },

    /**
     * Bulk mark threads as unread
     *
     * @param {string[]} ids - Array of thread IDs
     * @returns {Promise<void>}
     */
    async bulkMarkAsUnread(ids: string[]): Promise<void> {
      const all = await this.getAll();
      let modified = false;

      all.forEach((thread) => {
        if (ids.includes(thread.id) && thread.isRead) {
          thread.isRead = false;
          modified = true;
        }
      });

      if (modified) {
        await setData(KEYS.EMAIL_THREADS, all);
      }
    },

    /**
     * Bulk star threads
     *
     * @param {string[]} ids - Array of thread IDs
     * @returns {Promise<void>}
     */
    async bulkStar(ids: string[]): Promise<void> {
      const all = await this.getAll();
      let modified = false;

      all.forEach((thread) => {
        if (ids.includes(thread.id) && !thread.isStarred) {
          thread.isStarred = true;
          modified = true;
        }
      });

      if (modified) {
        await setData(KEYS.EMAIL_THREADS, all);
      }
    },

    /**
     * Bulk unstar threads
     *
     * @param {string[]} ids - Array of thread IDs
     * @returns {Promise<void>}
     */
    async bulkUnstar(ids: string[]): Promise<void> {
      const all = await this.getAll();
      let modified = false;

      all.forEach((thread) => {
        if (ids.includes(thread.id) && thread.isStarred) {
          thread.isStarred = false;
          modified = true;
        }
      });

      if (modified) {
        await setData(KEYS.EMAIL_THREADS, all);
      }
    },

    /**
     * Bulk archive threads
     *
     * @param {string[]} ids - Array of thread IDs
     * @returns {Promise<void>}
     */
    async bulkArchive(ids: string[]): Promise<void> {
      const all = await this.getAll();
      let modified = false;

      all.forEach((thread) => {
        if (ids.includes(thread.id) && !thread.isArchived) {
          thread.isArchived = true;
          modified = true;
        }
      });

      if (modified) {
        await setData(KEYS.EMAIL_THREADS, all);
      }
    },

    /**
     * Bulk delete threads
     *
     * @param {string[]} ids - Array of thread IDs to delete
     * @returns {Promise<void>}
     */
    async bulkDelete(ids: string[]): Promise<void> {
      const all = await this.getAll();
      const filtered = all.filter((t) => !ids.includes(t.id));
      await setData(KEYS.EMAIL_THREADS, filtered);
    },

    /**
     * Get email statistics
     * Calculates counts and storage metrics
     *
     * @returns {Promise<{total: number, unread: number, starred: number, archived: number, important: number, drafts: number, totalSize: number}>}
     */
    async getStatistics(): Promise<{
      total: number;
      unread: number;
      starred: number;
      archived: number;
      important: number;
      drafts: number;
      totalSize: number;
    }> {
      const all = await this.getAll();

      return {
        total: all.filter((t) => !t.isDraft).length,
        unread: all.filter((t) => !t.isRead && !t.isDraft).length,
        starred: all.filter((t) => t.isStarred).length,
        archived: all.filter((t) => t.isArchived).length,
        important: all.filter((t) => t.isImportant).length,
        drafts: all.filter((t) => t.isDraft).length,
        totalSize: all.reduce((sum, t) => sum + (t.totalSize || 0), 0),
      };
    },

    /**
     * Sort threads by different criteria
     *
     * @param {EmailThread[]} threads - Threads to sort
     * @param {"date" | "sender" | "subject"} sortBy - Sort criterion
     * @param {"asc" | "desc"} order - Sort order
     * @returns {EmailThread[]} Sorted threads
     */
    sort(
      threads: EmailThread[],
      sortBy: "date" | "sender" | "subject",
      order: "asc" | "desc" = "desc",
    ): EmailThread[] {
      const sorted = [...threads].sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
          case "date":
            comparison =
              new Date(a.lastMessageAt).getTime() -
              new Date(b.lastMessageAt).getTime();
            break;
          case "sender":
            comparison = a.participants[0].localeCompare(b.participants[0]);
            break;
          case "subject":
            comparison = a.subject.localeCompare(b.subject);
            break;
        }

        return order === "asc" ? comparison : -comparison;
      });

      return sorted;
    },
  },

  /**
   * Translations Module
   *
   * Manages translation history, favorites, and saved phrases.
   * Provides comprehensive translation tracking and organization.
   */
  translations: {
    /**
     * Get all translations from storage
     * Returns translations sorted by creation date (newest first)
     *
     * @returns {Promise<Translation[]>} Array of all translations
     */
    async getAll(): Promise<Translation[]> {
      const all = await getData(KEYS.TRANSLATIONS, []);
      return all.sort(
        (a: Translation, b: Translation) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    },

    /**
     * Get the active translation retention policy.
     *
     * @returns {Promise<TranslationRetentionPolicy>} Retention policy
     */
    async getRetentionPolicy(): Promise<TranslationRetentionPolicy> {
      const stored = await getData<TranslationRetentionPolicy | null>(
        KEYS.TRANSLATION_RETENTION,
        null,
      );
      return normalizeTranslationRetentionPolicy(stored);
    },

    /**
     * Update translation retention policy.
     * Merges with defaults to avoid accidental undefined behavior.
     *
     * @param {Partial<TranslationRetentionPolicy>} partial - Policy overrides
     * @returns {Promise<TranslationRetentionPolicy>} Updated policy
     */
    async setRetentionPolicy(
      partial: Partial<TranslationRetentionPolicy>,
    ): Promise<TranslationRetentionPolicy> {
      const current = await this.getRetentionPolicy();
      const merged = { ...current, ...partial };
      await setData(KEYS.TRANSLATION_RETENTION, merged);
      return merged;
    },

    /**
     * Get a specific translation by ID
     *
     * @param {string} id - Translation ID
     * @returns {Promise<Translation | null>} The translation or null if not found
     */
    async get(id: string): Promise<Translation | null> {
      const all = await this.getAll();
      return all.find((t) => t.id === id) || null;
    },

    /**
     * Save a new translation or update existing one
     *
     * @param {Translation} translation - Translation to save
     * @returns {Promise<Translation>} The saved translation
     */
    async save(translation: Translation): Promise<Translation> {
      const all = await this.getAll();
      const index = all.findIndex((t) => t.id === translation.id);
      if (index >= 0) {
        all[index] = translation;
      } else {
        all.push(translation);
      }
      await setData(KEYS.TRANSLATIONS, all);
      await this.applyRetentionPolicy();
      return translation;
    },

    /**
     * Delete a translation by ID
     *
     * @param {string} id - Translation ID to delete
     * @returns {Promise<void>}
     */
    async delete(id: string): Promise<void> {
      const all = await this.getAll();
      const filtered = all.filter((t) => t.id !== id);
      await setData(KEYS.TRANSLATIONS, filtered);
    },

    /**
     * Toggle favorite status of a translation
     *
     * @param {string} id - Translation ID
     * @returns {Promise<void>}
     */
    async toggleFavorite(id: string): Promise<void> {
      const all = await this.getAll();
      const translation = all.find((t) => t.id === id);
      if (translation) {
        translation.isFavorite = !translation.isFavorite;
        await setData(KEYS.TRANSLATIONS, all);
      }
    },

    /**
     * Get all favorite translations
     *
     * @returns {Promise<Translation[]>} Array of favorited translations
     */
    async getFavorites(): Promise<Translation[]> {
      const all = await this.getAll();
      return all.filter((t) => t.isFavorite);
    },

    /**
     * Search translations by text content
     * Searches both source and target text
     *
     * @param {string} query - Search query
     * @returns {Promise<Translation[]>} Matching translations
     */
    async search(query: string): Promise<Translation[]> {
      const all = await this.getAll();
      const lowerQuery = query.toLowerCase();
      return all.filter(
        (t) =>
          t.sourceText.toLowerCase().includes(lowerQuery) ||
          t.targetText.toLowerCase().includes(lowerQuery) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)),
      );
    },

    /**
     * Filter translations by language pair
     *
     * @param {string} sourceLang - Source language code
     * @param {string} targetLang - Target language code
     * @returns {Promise<Translation[]>} Translations for the language pair
     */
    async getByLanguagePair(
      sourceLang: string,
      targetLang: string,
    ): Promise<Translation[]> {
      const all = await this.getAll();
      return all.filter(
        (t) => t.sourceLang === sourceLang && t.targetLang === targetLang,
      );
    },

    /**
     * Get translations by source language
     *
     * @param {string} sourceLang - Source language code
     * @returns {Promise<Translation[]>} Translations in that source language
     */
    async getBySourceLanguage(sourceLang: string): Promise<Translation[]> {
      const all = await this.getAll();
      return all.filter((t) => t.sourceLang === sourceLang);
    },

    /**
     * Get translations by target language
     *
     * @param {string} targetLang - Target language code
     * @returns {Promise<Translation[]>} Translations in that target language
     */
    async getByTargetLanguage(targetLang: string): Promise<Translation[]> {
      const all = await this.getAll();
      return all.filter((t) => t.targetLang === targetLang);
    },

    /**
     * Get recent translations (last N translations)
     *
     * @param {number} limit - Number of recent translations to retrieve
     * @returns {Promise<Translation[]>} Recent translations
     */
    async getRecent(limit: number = 20): Promise<Translation[]> {
      const all = await this.getAll();
      return all.slice(0, limit);
    },

    /**
     * Get translations by tag
     *
     * @param {string} tag - Tag to filter by
     * @returns {Promise<Translation[]>} Translations with that tag
     */
    async getByTag(tag: string): Promise<Translation[]> {
      const all = await this.getAll();
      return all.filter((t) => t.tags?.includes(tag));
    },

    /**
     * Get all unique tags from translations
     *
     * @returns {Promise<string[]>} Array of unique tags
     */
    async getAllTags(): Promise<string[]> {
      const all = await this.getAll();
      const tagSet = new Set<string>();
      all.forEach((t) => {
        t.tags?.forEach((tag) => tagSet.add(tag));
      });
      return Array.from(tagSet).sort();
    },

    /**
     * Bulk delete translations
     *
     * @param {string[]} ids - Array of translation IDs to delete
     * @returns {Promise<void>}
     */
    async bulkDelete(ids: string[]): Promise<void> {
      const all = await this.getAll();
      const filtered = all.filter((t) => !ids.includes(t.id));
      await setData(KEYS.TRANSLATIONS, filtered);
    },

    /**
     * Clear all translations
     *
     * @returns {Promise<void>}
     */
    async clearAll(): Promise<void> {
      await setData(KEYS.TRANSLATIONS, []);
    },

    /**
     * Get translation statistics
     * Calculates comprehensive translation usage metrics
     *
     * @returns {Promise<TranslationStatistics>} Statistics object
     */
    async getStatistics(): Promise<TranslationStatistics> {
      const all = await this.getAll();
      const languagePairs: Record<string, number> = {};
      const languageUsage: Record<string, number> = {};

      all.forEach((t) => {
        // Track language pairs
        const pairKey = `${t.sourceLang}-${t.targetLang}`;
        languagePairs[pairKey] = (languagePairs[pairKey] || 0) + 1;

        // Track individual language usage
        languageUsage[t.sourceLang] = (languageUsage[t.sourceLang] || 0) + 1;
        languageUsage[t.targetLang] = (languageUsage[t.targetLang] || 0) + 1;
      });

      // Find most used languages
      let mostUsedSourceLang = "";
      let mostUsedTargetLang = "";
      let maxSourceCount = 0;
      let maxTargetCount = 0;

      all.forEach((t) => {
        const sourceCount = all.filter(
          (tr) => tr.sourceLang === t.sourceLang,
        ).length;
        const targetCount = all.filter(
          (tr) => tr.targetLang === t.targetLang,
        ).length;

        if (sourceCount > maxSourceCount) {
          maxSourceCount = sourceCount;
          mostUsedSourceLang = t.sourceLang;
        }
        if (targetCount > maxTargetCount) {
          maxTargetCount = targetCount;
          mostUsedTargetLang = t.targetLang;
        }
      });

      return {
        totalTranslations: all.length,
        favoriteCount: all.filter((t) => t.isFavorite).length,
        savedPhrasesCount: (await getData(KEYS.SAVED_PHRASES, [])).length,
        languagePairs,
        languageUsage,
        mostUsedSourceLang,
        mostUsedTargetLang,
      };
    },

    /**
     * Export all translations to JSON format
     *
     * @returns {Promise<string>} JSON string of all translations
     */
    async exportToJSON(): Promise<string> {
      const all = await this.getAll();
      return JSON.stringify(all, null, 2);
    },

    /**
     * Apply retention policy to translation history.
     * Keeps favorites if configured, then trims by age and max entries.
     *
     * @param {TranslationRetentionPolicy} policyOverride - Optional policy override
     * @returns {Promise<void>}
     */
    async applyRetentionPolicy(
      policyOverride?: TranslationRetentionPolicy,
    ): Promise<void> {
      const policy = policyOverride || (await this.getRetentionPolicy());
      const all = await this.getAll();

      if (all.length === 0) return;

      const now = new Date();
      const cutoff = policy.maxAgeDays
        ? new Date(now.getTime() - policy.maxAgeDays * 24 * 60 * 60 * 1000)
        : null;

      const favorites = all.filter((t) => t.isFavorite);
      const nonFavorites = all.filter((t) => !t.isFavorite);

      const filteredNonFavorites = nonFavorites.filter((t) =>
        cutoff ? new Date(t.createdAt) >= cutoff : true,
      );

      let retained: Translation[] = [];

      if (policy.keepFavorites) {
        const maxEntries = policy.maxEntries;
        const availableSlots = Math.max(maxEntries - favorites.length, 0);
        retained = [
          ...favorites,
          ...filteredNonFavorites.slice(0, availableSlots),
        ].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      } else {
        let toRetain = all;
        if (cutoff) {
          toRetain = all.filter((t) => new Date(t.createdAt) >= cutoff);
        }
        retained = toRetain.slice(0, policy.maxEntries);
      }

      await setData(KEYS.TRANSLATIONS, retained);
    },
  },

  /**
   * Saved Phrases Module
   *
   * Manages frequently used phrases for quick translation.
   * Tracks usage count and last used timestamp.
   */
  savedPhrases: {
    /**
     * Get all saved phrases
     * Returns phrases sorted by usage count (most used first)
     *
     * @returns {Promise<SavedPhrase[]>} Array of all saved phrases
     */
    async getAll(): Promise<SavedPhrase[]> {
      const all = await getData(KEYS.SAVED_PHRASES, []);
      const needsMigration = all.some((phrase: SavedPhrase) => !phrase.tags);

      if (needsMigration) {
        const migrated = all.map((phrase: SavedPhrase) => ({
          ...phrase,
          tags: phrase.tags ?? [],
        }));
        await setData(KEYS.SAVED_PHRASES, migrated);
        return migrated.sort(
          (a: SavedPhrase, b: SavedPhrase) => b.usageCount - a.usageCount,
        );
      }

      return all.sort(
        (a: SavedPhrase, b: SavedPhrase) => b.usageCount - a.usageCount,
      );
    },

    /**
     * Get a specific saved phrase by ID
     *
     * @param {string} id - Phrase ID
     * @returns {Promise<SavedPhrase | null>} The phrase or null if not found
     */
    async get(id: string): Promise<SavedPhrase | null> {
      const all = await this.getAll();
      return all.find((p) => p.id === id) || null;
    },

    /**
     * Save a new phrase or update existing one
     *
     * @param {SavedPhrase} phrase - Phrase to save
     * @returns {Promise<SavedPhrase>} The saved phrase
     */
    async save(phrase: SavedPhrase): Promise<SavedPhrase> {
      const all = await this.getAll();
      const index = all.findIndex((p) => p.id === phrase.id);
      if (index >= 0) {
        all[index] = phrase;
      } else {
        all.push(phrase);
      }
      await setData(KEYS.SAVED_PHRASES, all);
      return phrase;
    },

    /**
     * Delete a saved phrase by ID
     *
     * @param {string} id - Phrase ID to delete
     * @returns {Promise<void>}
     */
    async delete(id: string): Promise<void> {
      const all = await this.getAll();
      const filtered = all.filter((p) => p.id !== id);
      await setData(KEYS.SAVED_PHRASES, filtered);
    },

    /**
     * Increment usage count for a phrase
     * Also updates lastUsedAt timestamp
     *
     * @param {string} id - Phrase ID
     * @returns {Promise<void>}
     */
    async incrementUsage(id: string): Promise<void> {
      const all = await this.getAll();
      const phrase = all.find((p) => p.id === id);
      if (phrase) {
        phrase.usageCount += 1;
        phrase.lastUsedAt = new Date().toISOString();
        await setData(KEYS.SAVED_PHRASES, all);
      }
    },

    /**
     * Get phrases by language
     *
     * @param {string} sourceLang - Source language code
     * @returns {Promise<SavedPhrase[]>} Phrases in that language
     */
    async getByLanguage(sourceLang: string): Promise<SavedPhrase[]> {
      const all = await this.getAll();
      return all.filter((p) => p.sourceLang === sourceLang);
    },

    /**
     * Get phrases by category
     *
     * @param {string} category - Category name
     * @returns {Promise<SavedPhrase[]>} Phrases in that category
     */
    async getByCategory(category: string): Promise<SavedPhrase[]> {
      const all = await this.getAll();
      return all.filter((p) => p.category === category);
    },

    /**
     * Get phrases by tag
     *
     * @param {string} tag - Tag name
     * @returns {Promise<SavedPhrase[]>} Phrases with that tag
     */
    async getByTag(tag: string): Promise<SavedPhrase[]> {
      const all = await this.getAll();
      return all.filter((p) => p.tags?.includes(tag));
    },

    /**
     * Add tags to a saved phrase
     *
     * @param {string} id - Phrase ID
     * @param {string[]} tags - Tags to add
     * @returns {Promise<void>}
     */
    async addTags(id: string, tags: string[]): Promise<void> {
      const all = await this.getAll();
      const phrase = all.find((p) => p.id === id);
      if (phrase) {
        const uniqueTags = new Set([...(phrase.tags || []), ...tags]);
        phrase.tags = Array.from(uniqueTags).sort();
        await setData(KEYS.SAVED_PHRASES, all);
      }
    },

    /**
     * Remove tags from a saved phrase
     *
     * @param {string} id - Phrase ID
     * @param {string[]} tags - Tags to remove
     * @returns {Promise<void>}
     */
    async removeTags(id: string, tags: string[]): Promise<void> {
      const all = await this.getAll();
      const phrase = all.find((p) => p.id === id);
      if (phrase) {
        phrase.tags = (phrase.tags || []).filter((tag) => !tags.includes(tag));
        await setData(KEYS.SAVED_PHRASES, all);
      }
    },

    /**
     * Get all unique categories
     *
     * @returns {Promise<string[]>} Array of unique categories
     */
    async getAllCategories(): Promise<string[]> {
      const all = await this.getAll();
      const categories = new Set<string>();
      all.forEach((p) => {
        if (p.category) categories.add(p.category);
      });
      return Array.from(categories).sort();
    },

    /**
     * Get all unique tags
     *
     * @returns {Promise<string[]>} Array of unique tags
     */
    async getAllTags(): Promise<string[]> {
      const all = await this.getAll();
      const tags = new Set<string>();
      all.forEach((p) => {
        p.tags?.forEach((tag) => tags.add(tag));
      });
      return Array.from(tags).sort();
    },

    /**
     * Search saved phrases
     *
     * @param {string} query - Search query
     * @returns {Promise<SavedPhrase[]>} Matching phrases
     */
    async search(query: string): Promise<SavedPhrase[]> {
      const all = await this.getAll();
      const lowerQuery = query.toLowerCase();
      return all.filter(
        (p) =>
          p.phrase.toLowerCase().includes(lowerQuery) ||
          p.category?.toLowerCase().includes(lowerQuery) ||
          p.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)),
      );
    },

    /**
     * Clear all saved phrases
     *
     * @returns {Promise<void>}
     */
    async clearAll(): Promise<void> {
      await setData(KEYS.SAVED_PHRASES, []);
    },
  },

  async isInitialized(): Promise<boolean> {
    const val = await AsyncStorage.getItem(KEYS.INITIALIZED);
    return val === "true";
  },

  async setInitialized(): Promise<void> {
    await AsyncStorage.setItem(KEYS.INITIALIZED, "true");
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  },
};

// Export as named export for backwards compatibility
export { db as database };
