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

export interface BudgetLineItem {
  id: string;
  name: string;
  budgeted: number;
  actual: number;
}

export interface BudgetCategory {
  id: string;
  name: string;
  lineItems: BudgetLineItem[];
  isExpanded: boolean;
}

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
  aiCustomPrompt: "You are AIOS, the perfect personal assistant. You are intelligent, helpful, proactive, and always focused on making your user's life easier. You anticipate needs, provide thoughtful recommendations, and handle tasks efficiently. You communicate clearly and professionally while maintaining a warm, supportive tone. Your goal is to empower your user to be more productive and organized.",
};

export const TIER_LIMITS: Record<AILimitTier, number> = {
  0: 6,
  1: 12,
  2: 18,
  3: 24,
};
