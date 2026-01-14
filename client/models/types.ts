import { DEFAULT_AI_CUSTOM_PROMPT } from "@/constants/aiDefaults";

export type ModuleType =
  | "command"
  | "notebook"
  | "planner"
  | "calendar"
  | "email"
  | "lists"
  | "alerts"
  | "photos"
  | "messages"
  | "contacts"
  | "translator"
  | "budget";

export type ConfidenceLevel = "low" | "medium" | "high";

export type RecommendationStatus =
  | "active"
  | "accepted"
  | "declined"
  | "dismissed"
  | "expired";

export type DecisionType = "accepted" | "declined" | "dismissed";

export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type RecurrenceRule = "none" | "daily" | "weekly" | "monthly" | "custom";

export type AILimitTier = 0 | 1 | 2 | 3;

export interface Recommendation {
  id: string;
  module: ModuleType;
  title: string;
  summary: string;
  type: string;
  status: RecommendationStatus;
  createdAt: string;
  expiresAt: string;
  confidence: ConfidenceLevel;
  priority: TaskPriority;
  dedupeKey: string;
  countsAgainstLimit: boolean;
  why: string;
  evidenceTimestamps: string[];
}

export interface RecommendationDecision {
  id: string;
  recommendationId: string;
  decision: DecisionType;
  decidedAt: string;
}

export interface Note {
  id: string;
  title: string;
  bodyMarkdown: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  links: string[];
}

export interface Task {
  id: string;
  title: string;
  userNotes: string;
  aiNotes: string[];
  priority: TaskPriority;
  dueDate: string | null;
  status: TaskStatus;
  recurrenceRule: RecurrenceRule;
  projectId: string | null;
  parentTaskId: string | null;
  dependencyIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  taskIds: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Calendar Event Interface
 * 
 * Represents a calendar event with support for recurrence and exceptions.
 * Events can be all-day or have specific start/end times.
 * 
 * @property {string} id - Unique identifier for the event
 * @property {string} title - Event title/name
 * @property {string} description - Optional event description
 * @property {string} location - Optional event location
 * @property {string} startAt - ISO 8601 timestamp of event start
 * @property {string} endAt - ISO 8601 timestamp of event end
 * @property {boolean} allDay - Whether the event is an all-day event
 * @property {string} timezone - Timezone of the event (e.g., "America/New_York")
 * @property {RecurrenceRule} recurrenceRule - How often the event repeats
 * @property {string[]} exceptions - Array of ISO 8601 dates to exclude from recurrence
 * @property {Record<string, Partial<CalendarEvent>>} overrides - Date-specific overrides for recurring events
 * @property {string} createdAt - ISO 8601 timestamp of creation
 * @property {string} updatedAt - ISO 8601 timestamp of last update
 * @property {"LOCAL"} source - Event source (currently only LOCAL supported)
 */
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  startAt: string;
  endAt: string;
  allDay: boolean;
  timezone: string;
  recurrenceRule: RecurrenceRule;
  exceptions: string[];
  overrides: Record<string, Partial<CalendarEvent>>;
  createdAt: string;
  updatedAt: string;
  source: "LOCAL";
}

export interface EmailThread {
  id: string;
  subject: string;
  participants: string[];
  messages: EmailMessage[];
  isRead: boolean;
  isStarred: boolean;
  lastMessageAt: string;
}

export interface EmailMessage {
  id: string;
  threadId: string;
  from: string;
  to: string[];
  subject: string;
  body: string;
  sentAt: string;
  isRead: boolean;
}

export interface ListItem {
  id: string;
  text: string;
  isChecked: boolean;
}

export interface List {
  id: string;
  title: string;
  items: ListItem[];
  createdAt: string;
  lastOpenedAt: string;
  updatedAt: string;
}

/**
 * Alert Type
 * 
 * Defines the type of alert/notification
 * - alarm: Sound-based alert (typically for wake-up times)
 * - reminder: Notification-based reminder (for tasks/events)
 */
export type AlertType = "alarm" | "reminder";

/**
 * Alert Interface
 * 
 * Represents an alarm or reminder in the system.
 * Supports one-time and recurring alerts with enable/disable functionality.
 * 
 * @property {string} id - Unique identifier for the alert
 * @property {string} title - Alert title/name
 * @property {string} description - Optional description or notes
 * @property {string} time - ISO 8601 timestamp when alert should trigger
 * @property {AlertType} type - Type of alert (alarm or reminder)
 * @property {boolean} isEnabled - Whether the alert is currently active
 * @property {RecurrenceRule} recurrenceRule - How often the alert repeats
 * @property {string} createdAt - ISO 8601 timestamp of creation
 * @property {string} updatedAt - ISO 8601 timestamp of last update
 */
export interface Alert {
  id: string;
  title: string;
  description: string;
  time: string;
  type: AlertType;
  isEnabled: boolean;
  recurrenceRule: RecurrenceRule;
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  id: string;
  uri: string;
  localPath: string;
  thumbnailUri?: string;
  width: number;
  height: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
  isBackedUp: boolean;
  tags: string[];
}

export interface PhotoEdit {
  photoId: string;
  editedUri: string;
  operations: PhotoEditOperation[];
  createdAt: string;
}

export type PhotoEditOperation =
  | { type: "crop"; x: number; y: number; width: number; height: number }
  | { type: "rotate"; degrees: number }
  | { type: "flip"; direction: "horizontal" | "vertical" }
  | { type: "brightness"; value: number }
  | { type: "contrast"; value: number }
  | { type: "saturation"; value: number }
  | { type: "filter"; name: string }
  | { type: "ai_auto_fix" };

export type PhotoGridSize = 2 | 3 | 4 | 5 | 6;
export type MessageType = "text" | "image" | "video" | "audio" | "file" | "gif";
export type ColorTheme = "cyan" | "purple" | "green" | "orange" | "pink" | "blue";
export type AIPersonality = "default" | "enthusiastic" | "coach" | "witty" | "militant";

export type ConversationType = "direct" | "group";

export interface MessageAttachment {
  id: string;
  type: MessageType;
  url: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  thumbnailUrl?: string;
  duration?: number; // For audio/video in seconds
  width?: number;
  height?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: MessageType;
  attachments: MessageAttachment[];
  replyToId: string | null;
  isEdited: boolean;
  isRead: boolean;
  deliveredAt: string | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string; // For group chats, otherwise derived from participants
  participants: ConversationParticipant[];
  lastMessageId: string | null;
  lastMessageAt: string | null;
  lastMessagePreview: string;
  unreadCount: number;
  isTyping: string[]; // Array of user IDs currently typing
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phoneNumbers: string[];
  emails: string[];
  birthday?: string;
  company?: string;
  jobTitle?: string;
  imageUri?: string;
  isRegistered: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationParticipant {
  userId: string;
  userName: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeenAt: string;
  joinedAt: string;
}

export interface VideoCallSession {
  id: string;
  conversationId: string;
  participants: VideoCallParticipant[];
  startedAt: string;
  endedAt: string | null;
  isActive: boolean;
}

export interface VideoCallParticipant {
  userId: string;
  userName: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  joinedAt: string;
  leftAt: string | null;
}

export type ContactSharingField = "email" | "birthday" | "business";

export interface ContactSharingPreferences {
  shareEmail: boolean;
  shareBirthday: boolean;
  shareBusinessInfo: boolean;
}

/**
 * Budget Line Item Interface
 * 
 * Represents a single line item within a budget category.
 * Tracks both budgeted and actual amounts for comparison.
 * 
 * @property {string} id - Unique identifier for the line item
 * @property {string} name - Line item name/description (e.g., "Rent", "Groceries")
 * @property {number} budgeted - Budgeted/planned amount
 * @property {number} actual - Actual spent amount
 */
export interface BudgetLineItem {
  id: string;
  name: string;
  budgeted: number;
  actual: number;
}

/**
 * Budget Category Interface
 * 
 * Represents a category containing multiple budget line items.
 * Categories can be expanded or collapsed in the UI.
 * 
 * @property {string} id - Unique identifier for the category
 * @property {string} name - Category name (e.g., "Housing", "Transportation")
 * @property {BudgetLineItem[]} lineItems - Array of line items in this category
 * @property {boolean} isExpanded - Whether the category is expanded in the UI
 */
export interface BudgetCategory {
  id: string;
  name: string;
  lineItems: BudgetLineItem[];
  isExpanded: boolean;
}

/**
 * Budget Interface
 * 
 * Represents a monthly budget with multiple categories and line items.
 * Used for tracking planned vs actual spending across various categories.
 * 
 * @property {string} id - Unique identifier for the budget
 * @property {string} name - Budget name/title
 * @property {string} month - Month in YYYY-MM format (e.g., "2026-01")
 * @property {BudgetCategory[]} categories - Array of budget categories
 * @property {string} createdAt - ISO 8601 timestamp of creation
 * @property {string} updatedAt - ISO 8601 timestamp of last update
 */
export interface Budget {
  id: string;
  name: string;
  month: string;
  categories: BudgetCategory[];
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  aiName: string;
  enabledModules: ModuleType[];
  aiLimitTier: AILimitTier;
  darkMode: boolean;
  photoGridSize: PhotoGridSize;
  contactSharingPreferences: ContactSharingPreferences;
  colorTheme: ColorTheme;
  aiPersonality: AIPersonality;
  aiCustomPrompt: string;
}

export interface HistoryLogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: "recommendation" | "archived" | "banked" | "deprecated" | "system";
  metadata?: Record<string, unknown>;
}

export interface AILimits {
  used: number;
  total: number;
  nextRefreshAt: string;
}

export const DEFAULT_SETTINGS: Settings = {
  aiName: "AIOS",
  enabledModules: [
    "command",
    "notebook",
    "planner",
    "calendar",
    "email",
    "lists",
    "alerts",
    "photos",
    "messages",
    "contacts",
    "translator",
    "budget",
  ] as ModuleType[],
  aiLimitTier: 1,
  darkMode: true,
  photoGridSize: 4,
  contactSharingPreferences: {
    shareEmail: true,
    shareBirthday: true,
    shareBusinessInfo: true,
  },
  colorTheme: "cyan",
  aiPersonality: "default",
  aiCustomPrompt: DEFAULT_AI_CUSTOM_PROMPT,
};

export const TIER_LIMITS: Record<AILimitTier, number> = {
  0: 6,
  1: 12,
  2: 18,
  3: 24,
};
