import AsyncStorage from '@react-native-async-storage/async-storage';
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
} from '@/models/types';

const KEYS = {
  RECOMMENDATIONS: '@aios/recommendations',
  DECISIONS: '@aios/decisions',
  NOTES: '@aios/notes',
  TASKS: '@aios/tasks',
  PROJECTS: '@aios/projects',
  EVENTS: '@aios/events',
  SETTINGS: '@aios/settings',
  HISTORY: '@aios/history',
  AI_LIMITS: '@aios/ai_limits',
  INITIALIZED: '@aios/initialized',
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
  recommendations: {
    async getAll(): Promise<Recommendation[]> {
      return getData(KEYS.RECOMMENDATIONS, []);
    },
    async getActive(): Promise<Recommendation[]> {
      const all = await this.getAll();
      const now = new Date().toISOString();
      return all.filter((r) => r.status === 'active' && r.expiresAt > now);
    },
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
    async saveAll(recs: Recommendation[]): Promise<void> {
      await setData(KEYS.RECOMMENDATIONS, recs);
    },
    async updateStatus(id: string, status: Recommendation['status']): Promise<void> {
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
      const filtered = all.filter((t) => t.id !== id);
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

  events: {
    async getAll(): Promise<CalendarEvent[]> {
      return getData(KEYS.EVENTS, []);
    },
    async get(id: string): Promise<CalendarEvent | null> {
      const all = await this.getAll();
      return all.find((e) => e.id === id) || null;
    },
    async getForDate(date: string): Promise<CalendarEvent[]> {
      const all = await this.getAll();
      const targetDate = date.split('T')[0];
      return all.filter((e) => {
        const eventDate = e.startAt.split('T')[0];
        return eventDate === targetDate;
      });
    },
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
    async delete(id: string): Promise<void> {
      const all = await this.getAll();
      const filtered = all.filter((e) => e.id !== id);
      await setData(KEYS.EVENTS, filtered);
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
      return entries.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    },
    async add(entry: Omit<HistoryLogEntry, 'id' | 'timestamp'>): Promise<void> {
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

  async isInitialized(): Promise<boolean> {
    const val = await AsyncStorage.getItem(KEYS.INITIALIZED);
    return val === 'true';
  },

  async setInitialized(): Promise<void> {
    await AsyncStorage.setItem(KEYS.INITIALIZED, 'true');
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  },
};
