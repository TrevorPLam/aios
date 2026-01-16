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
  PhotoAlbum,
  Message,
  Conversation,
  Contact,
  Budget,
  Integration,
  AlertHistoryEntry,
  AlertStatistics,
  ContactGroup,
  EmailThread,
  EmailMessage,
} from "@/models/types";
import { generateId } from "@/utils/helpers";
import {
  isBirthdayInRange,
  sortByUpcomingBirthday,
  validateTag,
  validateGroup,
  validateNote,
  arePotentialDuplicates,
  matchesSearchQuery,
} from "@/utils/contactHelpers";

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
          (t.userNotes || "").toLowerCase().includes(lowerQuery)
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
          t.status !== "cancelled"
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
          t.status !== "cancelled"
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
        Date.now() + 7 * 24 * 60 * 60 * 1000
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
            t.status !== "cancelled"
        ).length,
        dueToday: all.filter((t) => t.dueDate && t.dueDate.startsWith(today))
          .length,
        dueThisWeek: all.filter(
          (t) =>
            t.dueDate &&
            t.dueDate >= now &&
            t.dueDate <= weekFromNow &&
            t.status !== "completed" &&
            t.status !== "cancelled"
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
        (t) => t.status === "completed"
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
      status: TaskStatus
    ): Promise<void> {
      const all = await this.getAll();
      const updated = all.map((t) =>
        taskIds.includes(t.id)
          ? { ...t, status, updatedAt: new Date().toISOString() }
          : t
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
        (t) => !taskIds.includes(t.id) && !taskIds.includes(t.parentTaskId || "")
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
        (alert) => !alert.sound || !alert.vibration || alert.tags === undefined
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
        (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
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
      entry: Omit<AlertHistoryEntry, "id">
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
          0
        ) / snoozedEntries.length;

      // Calculate average snooze count
      const avgSnoozeCount =
        snoozedEntries.reduce((sum, entry) => sum + entry.snoozeCount, 0) /
        snoozedEntries.length;

      // Estimate optimal single snooze duration with defensive check
      const estimatedOptimal = avgSnoozeCount > 0
        ? avgTotalSnoozeDuration / avgSnoozeCount
        : 10; // Default fallback if somehow avgSnoozeCount is 0

      // Round to nearest valid snooze option: 5, 10, 15, 30, or 60 minutes
      const validOptions = [5, 10, 15, 30, 60];
      const closest = validOptions.reduce((prev, curr) =>
        Math.abs(curr - estimatedOptimal) < Math.abs(prev - estimatedOptimal)
          ? curr
          : prev
      );

      return closest;
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
      const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

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
    async updateNote(contactId: string, noteId: string, newText: string): Promise<void> {
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
        contact.groups = [...new Set([...(contact.groups || []), validatedGroup])];
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
          primary.phoneNumbers = [...new Set([...primary.phoneNumbers, ...duplicate.phoneNumbers])];
          // Merge emails
          primary.emails = [...new Set([...primary.emails, ...duplicate.emails])];
          // Merge tags
          primary.tags = [...new Set([...(primary.tags || []), ...(duplicate.tags || [])])];
          // Merge groups
          primary.groups = [...new Set([...(primary.groups || []), ...(duplicate.groups || [])])];
          // Merge notes
          primary.notes = [...(primary.notes || []), ...(duplicate.notes || [])];
          // Merge call history
          primary.callHistory = [...(primary.callHistory || []), ...(duplicate.callHistory || [])];
          // Update contact frequency
          primary.contactFrequency = (primary.contactFrequency || 0) + (duplicate.contactFrequency || 0);
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
        group.contactIds = group.contactIds.filter((id) => !contactIds.includes(id));
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
    async getByType(
      type: HistoryLogEntry["type"],
    ): Promise<HistoryLogEntry[]> {
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
        oldestEntry: entries.length > 0 ? entries[entries.length - 1].timestamp : null,
        newestEntry: entries.length > 0 ? entries[0].timestamp : null,
      };
    },
    async exportToJSON(): Promise<string> {
      const entries = await this.getAll();
      return JSON.stringify(entries, null, 2);
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

  /**
   * Email Threads Module
   *
   * Manages email thread storage with advanced filtering, search, and organization features.
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
          thread.messages.some((m) =>
            m.body.toLowerCase().includes(lowerQuery),
          )
        ) {
          return true;
        }

        // Search in labels
        if (
          thread.labels?.some((l) => l.toLowerCase().includes(lowerQuery))
        ) {
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
        totalSize: all.reduce(
          (sum, t) => sum + (t.totalSize || 0),
          0,
        ),
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
