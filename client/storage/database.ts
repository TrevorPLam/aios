import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Recommendation,
  RecommendationDecision,
  Note,
  Task,
  Project,
  CalendarEvent,
  Settings,
  HistoryLogEntry,
  AILimits,
  DEFAULT_SETTINGS,
  TIER_LIMITS,
  List,
  Alert,
  Photo,
  Message,
  Conversation,
  Contact,
  Budget,
  Integration,
} from "@/models/types";

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
  MESSAGES: "@aios/messages",
  CONVERSATIONS: "@aios/conversations",
  CONTACTS: "@aios/contacts",
  BUDGETS: "@aios/budgets",
  INTEGRATIONS: "@aios/integrations",
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

  notes: {
    async getAll(): Promise<Note[]> {
      return getData(KEYS.NOTES, []);
    },
    async get(id: string): Promise<Note | null> {
      const all = await this.getAll();
      return all.find((n) => n.id === id) || null;
    },
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
    async delete(id: string): Promise<void> {
      const all = await this.getAll();
      const filtered = all.filter((n) => n.id !== id);
      await setData(KEYS.NOTES, filtered);
    },
  },

  tasks: {
    async getAll(): Promise<Task[]> {
      return getData(KEYS.TASKS, []);
    },
    async get(id: string): Promise<Task | null> {
      const all = await this.getAll();
      return all.find((t) => t.id === id) || null;
    },
    async getTopLevel(): Promise<Task[]> {
      const all = await this.getAll();
      return all.filter((t) => !t.parentTaskId);
    },
    async getSubtasks(parentId: string): Promise<Task[]> {
      const all = await this.getAll();
      return all.filter((t) => t.parentTaskId === parentId);
    },
    async hasSubtasks(taskId: string): Promise<boolean> {
      const all = await this.getAll();
      return all.some((t) => t.parentTaskId === taskId);
    },
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
     * @returns {Promise<CalendarEvent[]>} Array of events on the specified date
     */
    async getForDate(date: string): Promise<CalendarEvent[]> {
      const all = await this.getAll();
      const targetDate = date.split("T")[0];
      return all.filter((e) => {
        const eventDate = e.startAt.split("T")[0];
        return eventDate === targetDate;
      });
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
    async updateLastOpened(id: string): Promise<void> {
      const all = await this.getAll();
      const list = all.find((l) => l.id === id);
      if (list) {
        list.lastOpenedAt = new Date().toISOString();
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
     *
     * @returns {Promise<Alert[]>} Array of all alerts
     */
    async getAll(): Promise<Alert[]> {
      return getData(KEYS.ALERTS, []);
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
     * @returns {Promise<Alert[]>} Array of alerts with the specified tag
     */
    async getByTag(tag: string): Promise<Alert[]> {
      const all = await this.getAll();
      return all.filter((a) => a.tags.includes(tag));
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
    async getAll(): Promise<import("@/models/types").AlertHistoryEntry[]> {
      return getData(KEYS.ALERT_HISTORY, []);
    },

    /**
     * Get history entries for a specific alert
     *
     * @param {string} alertId - The alert ID
     * @returns {Promise<AlertHistoryEntry[]>} Array of history entries for the alert
     */
    async getByAlert(alertId: string): Promise<import("@/models/types").AlertHistoryEntry[]> {
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
      entry: Omit<import("@/models/types").AlertHistoryEntry, "id">
    ): Promise<import("@/models/types").AlertHistoryEntry> {
      const all = await this.getAll();
      const newEntry: import("@/models/types").AlertHistoryEntry = {
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
    async update(entry: import("@/models/types").AlertHistoryEntry): Promise<void> {
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
    async getStatistics(
      alertId: string
    ): Promise<import("@/models/types").AlertStatistics> {
      const entries = await this.getByAlert(alertId);
      const totalTriggers = entries.length;
      const totalSnoozes = entries.reduce(
        (sum, entry) => sum + entry.snoozeCount,
        0
      );
      const onTimeCount = entries.filter((entry) => entry.wasOnTime).length;
      const lastEntry = entries.sort(
        (a, b) =>
          new Date(b.triggeredAt).getTime() -
          new Date(a.triggeredAt).getTime()
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
  },

  messages: {
    async getAll(): Promise<Message[]> {
      return getData(KEYS.MESSAGES, []);
    },
    async get(id: string): Promise<Message | null> {
      const all = await this.getAll();
      return all.find((m) => m.id === id) || null;
    },
    async getByConversation(conversationId: string): Promise<Message[]> {
      const all = await this.getAll();
      return all
        .filter((m) => m.conversationId === conversationId)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
    },
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
    async delete(id: string): Promise<void> {
      const all = await this.getAll();
      const filtered = all.filter((m) => m.id !== id);
      await setData(KEYS.MESSAGES, filtered);
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
          // Keep original creation date if exists
          createdAt: existingContact?.createdAt || nc.createdAt,
          // Update the modified timestamp
          updatedAt: new Date().toISOString(),
        };
      });

      await this.saveAll(updated);
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
