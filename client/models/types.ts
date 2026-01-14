export type ModuleType =
  | "command"
  | "notebook"
  | "planner"
  | "calendar"
  | "email"
  | "lists"
  | "alerts"
  | "messages";
  | "contacts"
  | "translator";

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

export type AlertType = "alarm" | "reminder";

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

export type MessageType = "text" | "image" | "video" | "audio" | "file" | "gif";

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
export type ContactSharingField = "email" | "birthday" | "business";

export interface ContactSharingPreferences {
  shareEmail: boolean;
  shareBirthday: boolean;
  shareBusinessInfo: boolean;
}

export interface Settings {
  aiName: string;
  enabledModules: ModuleType[];
  aiLimitTier: AILimitTier;
  darkMode: boolean;
  contactSharingPreferences: ContactSharingPreferences;
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
    "messages",
    "contacts",
    "translator",
  ],
  aiLimitTier: 1,
  darkMode: true,
  contactSharingPreferences: {
    shareEmail: true,
    shareBirthday: true,
    shareBusinessInfo: true,
  },
};

export const TIER_LIMITS: Record<AILimitTier, number> = {
  0: 6,
  1: 12,
  2: 18,
  3: 24,
};
