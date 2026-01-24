/**
 * Server-side storage layer.
 *
 * Provides in-memory persistence with messaging quick wins:
 * - Search helpers for API usage
 * - Edited metadata updates
 * - Conversation preview synchronization on message changes
 */
import type {
  User,
  InsertUser,
  Recommendation,
  Note,
  Task,
  Project,
  Event,
  Settings,
  Conversation,
  Message,
  AnalyticsEvent,
  InsertAnalyticsEvent,
} from "@shared/schema";
import { notesData } from "@features/notes/data";
import { randomUUID } from "crypto";

const MESSAGE_PREVIEW_LIMIT = 80;

/**
 * Build a short preview string for conversation summaries.
 */
function buildMessagePreview(content: string): string {
  const trimmed = content.trim();
  if (trimmed.length <= MESSAGE_PREVIEW_LIMIT) return trimmed;
  return `${trimmed.slice(0, MESSAGE_PREVIEW_LIMIT - 1)}…`;
}

/**
 * Assemble a searchable string for message content and metadata.
 * Keeps server search logic consistent with client-side filtering.
 */
function buildMessageSearchIndex(message: Message): string {
  const attachmentTokens = message.attachments
    .map((attachment) =>
      [attachment.fileName, attachment.mimeType, attachment.type]
        .filter(Boolean)
        .join(" "),
    )
    .filter(Boolean);
  return [message.content, message.senderName, ...attachmentTokens]
    .join(" ")
    .toLowerCase();
}

// Storage interface with all CRUD methods
export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Recommendation methods
  getRecommendations(userId: string): Promise<Recommendation[]>;
  getRecommendation(
    id: string,
    userId: string,
  ): Promise<Recommendation | undefined>;
  createRecommendation(
    recommendation: Omit<Recommendation, "id" | "createdAt">,
  ): Promise<Recommendation>;
  updateRecommendation(
    id: string,
    userId: string,
    updates: Partial<Recommendation>,
  ): Promise<Recommendation | undefined>;
  deleteRecommendation(id: string, userId: string): Promise<boolean>;

  // Note methods
  getNotes(userId: string): Promise<Note[]>;
  getNote(id: string, userId: string): Promise<Note | undefined>;
  createNote(note: Omit<Note, "id" | "createdAt" | "updatedAt">): Promise<Note>;
  updateNote(
    id: string,
    userId: string,
    updates: Partial<Note>,
  ): Promise<Note | undefined>;
  deleteNote(id: string, userId: string): Promise<boolean>;

  // Task methods
  getTasks(userId: string): Promise<Task[]>;
  getTask(id: string, userId: string): Promise<Task | undefined>;
  createTask(task: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task>;
  updateTask(
    id: string,
    userId: string,
    updates: Partial<Task>,
  ): Promise<Task | undefined>;
  deleteTask(id: string, userId: string): Promise<boolean>;

  // Project methods
  getProjects(userId: string): Promise<Project[]>;
  getProject(id: string, userId: string): Promise<Project | undefined>;
  createProject(
    project: Omit<Project, "id" | "createdAt" | "updatedAt">,
  ): Promise<Project>;
  updateProject(
    id: string,
    userId: string,
    updates: Partial<Project>,
  ): Promise<Project | undefined>;
  deleteProject(id: string, userId: string): Promise<boolean>;

  // Event methods
  getEvents(userId: string): Promise<Event[]>;
  getEvent(id: string, userId: string): Promise<Event | undefined>;
  createEvent(
    event: Omit<Event, "id" | "createdAt" | "updatedAt">,
  ): Promise<Event>;
  updateEvent(
    id: string,
    userId: string,
    updates: Partial<Event>,
  ): Promise<Event | undefined>;
  deleteEvent(id: string, userId: string): Promise<boolean>;

  // Settings methods
  getSettings(userId: string): Promise<Settings | undefined>;
  createSettings(
    settings: Omit<Settings, "id" | "createdAt" | "updatedAt">,
  ): Promise<Settings>;
  updateSettings(
    userId: string,
    updates: Partial<Settings>,
  ): Promise<Settings | undefined>;

  // Conversation methods
  getConversations(userId: string): Promise<Conversation[]>;
  getConversation(
    id: string,
    userId: string,
  ): Promise<Conversation | undefined>;
  createConversation(
    conversation: Omit<Conversation, "id" | "createdAt" | "updatedAt">,
  ): Promise<Conversation>;
  updateConversation(
    id: string,
    userId: string,
    updates: Partial<Conversation>,
  ): Promise<Conversation | undefined>;
  deleteConversation(id: string, userId: string): Promise<boolean>;

  // Message methods
  getMessages(conversationId: string, userId: string): Promise<Message[]>;
  getMessage(id: string, userId: string): Promise<Message | undefined>;
  createMessage(
    message: Omit<Message, "id" | "createdAt" | "updatedAt">,
  ): Promise<Message>;
  updateMessage(
    id: string,
    userId: string,
    updates: Partial<Message>,
  ): Promise<Message | undefined>;
  deleteMessage(id: string, userId: string): Promise<boolean>;
  searchMessages(
    query: string,
    userId: string,
    options?: {
      conversationId?: string;
      limit?: number;
    },
  ): Promise<Message[]>;

  // Analytics methods
  saveAnalyticsEvents(
    events: Array<{
      eventId: string;
      eventName: string;
      timestamp: string;
      properties: Record<string, any>;
      identity: {
        userId?: string;
        deviceId?: string;
        sessionId?: string;
      };
      appVersion?: string;
      platform?: string;
    }>,
  ): Promise<void>;
  getAnalyticsEvents(
    userId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      eventNames?: string[];
      limit?: number;
    },
  ): Promise<AnalyticsEvent[]>;
  deleteUserAnalytics(userId: string): Promise<void>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private recommendations: Map<string, Recommendation>;
  private tasks: Map<string, Task>;
  private projects: Map<string, Project>;
  private events: Map<string, Event>;
  private settings: Map<string, Settings>;
  private conversations: Map<string, Conversation>;
  private messages: Map<string, Message>;
  private analyticsEvents: Map<string, AnalyticsEvent>;

  constructor() {
    this.users = new Map();
    this.recommendations = new Map();
    this.tasks = new Map();
    this.projects = new Map();
    this.events = new Map();
    this.settings = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.analyticsEvents = new Map();
  }

  /**
   * Update conversation preview fields based on the latest message.
   * Keeps message edits/deletes in sync with list previews.
   */
  private syncConversationPreview(conversationId: string): void {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return;

    const latest = Array.from(this.messages.values())
      .filter((message) => message.conversationId === conversationId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0];

    if (latest) {
      conversation.lastMessageId = latest.id;
      conversation.lastMessageAt = latest.createdAt;
      conversation.lastMessagePreview = buildMessagePreview(latest.content);
    } else {
      conversation.lastMessageId = null;
      conversation.lastMessageAt = null;
      conversation.lastMessagePreview = "";
    }

    conversation.updatedAt = new Date();
    this.conversations.set(conversationId, conversation);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Recommendation methods
  async getRecommendations(userId: string): Promise<Recommendation[]> {
    return Array.from(this.recommendations.values()).filter(
      (rec) => rec.userId === userId,
    );
  }

  async getRecommendation(
    id: string,
    userId: string,
  ): Promise<Recommendation | undefined> {
    const rec = this.recommendations.get(id);
    return rec?.userId === userId ? rec : undefined;
  }

  async createRecommendation(
    recommendation: Omit<Recommendation, "id" | "createdAt">,
  ): Promise<Recommendation> {
    const id = randomUUID();
    const newRec: Recommendation = {
      ...recommendation,
      id,
      createdAt: new Date(),
    };
    this.recommendations.set(id, newRec);
    return newRec;
  }

  async updateRecommendation(
    id: string,
    userId: string,
    updates: Partial<Recommendation>,
  ): Promise<Recommendation | undefined> {
    const rec = this.recommendations.get(id);
    if (!rec || rec.userId !== userId) return undefined;

    const updated = { ...rec, ...updates };
    this.recommendations.set(id, updated);
    return updated;
  }

  async deleteRecommendation(id: string, userId: string): Promise<boolean> {
    const rec = this.recommendations.get(id);
    if (!rec || rec.userId !== userId) return false;
    return this.recommendations.delete(id);
  }

  // Note methods
  async getNotes(userId: string): Promise<Note[]> {
    return notesData.getNotes(userId);
  }

  async getNote(id: string, userId: string): Promise<Note | undefined> {
    return notesData.getNote(id, userId);
  }

  async createNote(
    note: Omit<Note, "id" | "createdAt" | "updatedAt">,
  ): Promise<Note> {
    return notesData.createNote(note);
  }

  async updateNote(
    id: string,
    userId: string,
    updates: Partial<Note>,
  ): Promise<Note | undefined> {
    return notesData.updateNote(id, userId, updates);
  }

  async deleteNote(id: string, userId: string): Promise<boolean> {
    return notesData.deleteNote(id, userId);
  }

  // Task methods
  async getTasks(userId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId,
    );
  }

  async getTask(id: string, userId: string): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    return task?.userId === userId ? task : undefined;
  }

  async createTask(
    task: Omit<Task, "id" | "createdAt" | "updatedAt">,
  ): Promise<Task> {
    const id = randomUUID();
    const now = new Date();
    const newTask: Task = {
      ...task,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(
    id: string,
    userId: string,
    updates: Partial<Task>,
  ): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task || task.userId !== userId) return undefined;

    const updated = { ...task, ...updates, updatedAt: new Date() };
    this.tasks.set(id, updated);
    return updated;
  }

  async deleteTask(id: string, userId: string): Promise<boolean> {
    const task = this.tasks.get(id);
    if (!task || task.userId !== userId) return false;
    return this.tasks.delete(id);
  }

  // Project methods
  async getProjects(userId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.userId === userId,
    );
  }

  async getProject(id: string, userId: string): Promise<Project | undefined> {
    const project = this.projects.get(id);
    return project?.userId === userId ? project : undefined;
  }

  async createProject(
    project: Omit<Project, "id" | "createdAt" | "updatedAt">,
  ): Promise<Project> {
    const id = randomUUID();
    const now = new Date();
    const newProject: Project = {
      ...project,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(
    id: string,
    userId: string,
    updates: Partial<Project>,
  ): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project || project.userId !== userId) return undefined;

    const updated = { ...project, ...updates, updatedAt: new Date() };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: string, userId: string): Promise<boolean> {
    const project = this.projects.get(id);
    if (!project || project.userId !== userId) return false;
    return this.projects.delete(id);
  }

  // Event methods
  async getEvents(userId: string): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      (event) => event.userId === userId,
    );
  }

  async getEvent(id: string, userId: string): Promise<Event | undefined> {
    const event = this.events.get(id);
    return event?.userId === userId ? event : undefined;
  }

  async createEvent(
    event: Omit<Event, "id" | "createdAt" | "updatedAt">,
  ): Promise<Event> {
    const id = randomUUID();
    const now = new Date();
    const newEvent: Event = {
      ...event,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.events.set(id, newEvent);
    return newEvent;
  }

  async updateEvent(
    id: string,
    userId: string,
    updates: Partial<Event>,
  ): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event || event.userId !== userId) return undefined;

    const updated = { ...event, ...updates, updatedAt: new Date() };
    this.events.set(id, updated);
    return updated;
  }

  async deleteEvent(id: string, userId: string): Promise<boolean> {
    const event = this.events.get(id);
    if (!event || event.userId !== userId) return false;
    return this.events.delete(id);
  }

  // Settings methods
  async getSettings(userId: string): Promise<Settings | undefined> {
    return Array.from(this.settings.values()).find(
      (settings) => settings.userId === userId,
    );
  }

  async createSettings(
    settings: Omit<Settings, "id" | "createdAt" | "updatedAt">,
  ): Promise<Settings> {
    const id = randomUUID();
    const now = new Date();
    const newSettings: Settings = {
      ...settings,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.settings.set(id, newSettings);
    return newSettings;
  }

  async updateSettings(
    userId: string,
    updates: Partial<Settings>,
  ): Promise<Settings | undefined> {
    const existing = await this.getSettings(userId);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates, updatedAt: new Date() };
    this.settings.set(existing.id, updated);
    return updated;
  }

  // Conversation methods
  async getConversations(userId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(
      (conversation) => conversation.userId === userId,
    );
  }

  async getConversation(
    id: string,
    userId: string,
  ): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation || conversation.userId !== userId) return undefined;
    return conversation;
  }

  async createConversation(
    conversation: Omit<Conversation, "id" | "createdAt" | "updatedAt">,
  ): Promise<Conversation> {
    const id = randomUUID();
    const now = new Date();
    const newConversation: Conversation = {
      ...conversation,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.conversations.set(id, newConversation);
    return newConversation;
  }

  async updateConversation(
    id: string,
    userId: string,
    updates: Partial<Conversation>,
  ): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation || conversation.userId !== userId) return undefined;

    const updated = { ...conversation, ...updates, updatedAt: new Date() };
    this.conversations.set(id, updated);
    return updated;
  }

  async deleteConversation(id: string, userId: string): Promise<boolean> {
    const conversation = this.conversations.get(id);
    if (!conversation || conversation.userId !== userId) return false;

    // Also delete all messages in this conversation
    const messagesToDelete = Array.from(this.messages.values()).filter(
      (message) => message.conversationId === id,
    );
    messagesToDelete.forEach((message) => this.messages.delete(message.id));

    return this.conversations.delete(id);
  }

  // Message methods
  async getMessages(
    conversationId: string,
    userId: string,
  ): Promise<Message[]> {
    // Verify user has access to this conversation
    const conversation = this.conversations.get(conversationId);
    if (!conversation || conversation.userId !== userId) return [];

    return Array.from(this.messages.values())
      .filter((message) => message.conversationId === conversationId)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
  }

  async getMessage(id: string, userId: string): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;

    // Verify user has access to the conversation
    const conversation = this.conversations.get(message.conversationId);
    if (!conversation || conversation.userId !== userId) return undefined;

    return message;
  }

  async createMessage(
    message: Omit<Message, "id" | "createdAt" | "updatedAt">,
  ): Promise<Message> {
    const id = randomUUID();
    const now = new Date();
    const newMessage: Message = {
      ...message,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.messages.set(id, newMessage);

    // Sync conversation previews for new message insertions.
    const conversation = this.conversations.get(newMessage.conversationId);
    if (conversation) {
      conversation.lastMessageId = newMessage.id;
      conversation.lastMessageAt = newMessage.createdAt;
      conversation.lastMessagePreview = buildMessagePreview(newMessage.content);
      conversation.updatedAt = now;
      this.conversations.set(conversation.id, conversation);
    }

    return newMessage;
  }

  async updateMessage(
    id: string,
    userId: string,
    updates: Partial<Message>,
  ): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;

    // Verify user has access to the conversation
    const conversation = this.conversations.get(message.conversationId);
    if (!conversation || conversation.userId !== userId) return undefined;

    const contentUpdated =
      typeof updates.content === "string" &&
      updates.content !== message.content;
    const updatedAt = new Date();
    const updated = {
      ...message,
      ...updates,
      isEdited: contentUpdated ? true : (updates.isEdited ?? message.isEdited),
      updatedAt,
    };
    this.messages.set(id, updated);

    // Refresh preview if the latest message was edited.
    if (contentUpdated && conversation.lastMessageId === updated.id) {
      conversation.lastMessagePreview = buildMessagePreview(updated.content);
      conversation.updatedAt = updatedAt;
      this.conversations.set(conversation.id, conversation);
    }

    return updated;
  }

  async deleteMessage(id: string, userId: string): Promise<boolean> {
    const message = this.messages.get(id);
    if (!message) return false;

    // Verify user has access to the conversation
    const conversation = this.conversations.get(message.conversationId);
    if (!conversation || conversation.userId !== userId) return false;

    const deleted = this.messages.delete(id);
    if (deleted && conversation.lastMessageId === message.id) {
      this.syncConversationPreview(message.conversationId);
    }

    return deleted;
  }

  async searchMessages(
    query: string,
    userId: string,
    options?: {
      conversationId?: string;
      limit?: number;
    },
  ): Promise<Message[]> {
    const normalized = query.trim().toLowerCase();

    const accessibleConversationIds = new Set(
      Array.from(this.conversations.values())
        .filter((conversation) => conversation.userId === userId)
        .map((conversation) => conversation.id),
    );

    if (
      options?.conversationId &&
      !accessibleConversationIds.has(options.conversationId)
    ) {
      return [];
    }

    const scoped = Array.from(this.messages.values()).filter(
      (message) =>
        accessibleConversationIds.has(message.conversationId) &&
        (!options?.conversationId ||
          message.conversationId === options.conversationId),
    );

    const filtered = normalized
      ? scoped.filter((message) =>
          buildMessageSearchIndex(message).includes(normalized),
        )
      : scoped;

    const sorted = filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return typeof options?.limit === "number"
      ? sorted.slice(0, options.limit)
      : sorted;
  }

  // Analytics methods
  async saveAnalyticsEvents(
    events: Array<{
      eventId: string;
      eventName: string;
      timestamp: string;
      properties: Record<string, any>;
      identity: {
        userId?: string;
        deviceId?: string;
        sessionId?: string;
      };
      appVersion?: string;
      platform?: string;
    }>,
  ): Promise<void> {
    const now = new Date();

    for (const event of events) {
      // Skip if event ID already exists (idempotency)
      if (this.analyticsEvents.has(event.eventId)) {
        console.log(`[Analytics] Skipping duplicate event: ${event.eventId}`);
        continue;
      }

      const analyticsEvent: AnalyticsEvent = {
        id: event.eventId,
        userId: event.identity.userId || null,
        eventName: event.eventName,
        eventProperties: event.properties,
        timestamp: new Date(event.timestamp),
        sessionId: event.identity.sessionId || null,
        deviceId: event.identity.deviceId || null,
        platform: event.platform || null,
        appVersion: event.appVersion || null,
        createdAt: now,
      };

      this.analyticsEvents.set(event.eventId, analyticsEvent);
    }

    console.log(`[Analytics] Saved ${events.length} events`);
  }

  async getAnalyticsEvents(
    userId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      eventNames?: string[];
      limit?: number;
    },
  ): Promise<AnalyticsEvent[]> {
    let results = Array.from(this.analyticsEvents.values()).filter(
      (event) => event.userId === userId,
    );

    // Apply filters
    if (filters?.startDate) {
      results = results.filter(
        (event) => new Date(event.timestamp) >= filters.startDate!,
      );
    }

    if (filters?.endDate) {
      results = results.filter(
        (event) => new Date(event.timestamp) <= filters.endDate!,
      );
    }

    if (filters?.eventNames && filters.eventNames.length > 0) {
      results = results.filter((event) =>
        filters.eventNames!.includes(event.eventName),
      );
    }

    // Sort by timestamp descending (newest first)
    results.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    // Apply limit
    if (filters?.limit && filters.limit > 0) {
      results = results.slice(0, filters.limit);
    }

    return results;
  }

  async deleteUserAnalytics(userId: string): Promise<void> {
    const eventsToDelete = Array.from(this.analyticsEvents.values()).filter(
      (event) => event.userId === userId,
    );

    for (const event of eventsToDelete) {
      this.analyticsEvents.delete(event.id);
    }

    console.log(
      `[Analytics] Deleted ${eventsToDelete.length} events for user ${userId}`,
    );
  }
}

export const storage = new MemStorage();
