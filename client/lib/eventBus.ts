/**
 * Event Bus for Cross-Module Communication
 *
 * Purpose (Plain English):
 * Allows different parts of the app to communicate without directly depending on each other.
 * For example, when a calendar event is created, other modules (Maps, Food, Wallet) can
 * optionally suggest relevant actions without the Calendar module knowing about them.
 *
 * What it interacts with:
 * - All modules can emit and subscribe to events
 * - Context engine uses events to track user activity
 * - Recommendation engine uses events to generate suggestions
 *
 * Technical Implementation:
 * A singleton event emitter using the observer pattern. Modules subscribe to event types
 * they care about and emit events when actions occur. This decouples modules and makes
 * the system extensible.
 *
 * Safe AI Extension Points:
 * - Add new event types to EVENT_TYPES
 * - Add event listeners for new modules
 * - Do NOT break existing event contracts
 *
 * Fragile Logic Warnings:
 * - Event payloads must match expected types
 * - Listeners are called synchronously - keep them fast
 * - Memory leaks if listeners aren't removed - always unsubscribe
 */

/**
 * Event Types
 *
 * Each event type represents a significant action in the app.
 * Modules emit these events when something happens, and other modules can listen.
 */
/**
 * Specific Event Payload Types
 *
 * Define specific payload types for each event category to enable type-safe event handling.
 */

// Import types from models
import type { Note, Task, CalendarEvent } from "@/models/types";

export enum EVENT_TYPES {
  // Calendar Events
  CALENDAR_EVENT_CREATED = "calendar:event:created",
  CALENDAR_EVENT_UPDATED = "calendar:event:updated",
  CALENDAR_EVENT_DELETED = "calendar:event:deleted",

  // Task Events
  TASK_CREATED = "task:created",
  TASK_COMPLETED = "task:completed",
  TASK_UPDATED = "task:updated",
  TASK_DELETED = "task:deleted",

  // Note Events
  NOTE_CREATED = "note:created",
  NOTE_UPDATED = "note:updated",
  NOTE_DELETED = "note:deleted",

  // Message Events
  MESSAGE_SENT = "message:sent",
  MESSAGE_RECEIVED = "message:received",
  CONVERSATION_CREATED = "conversation:created",

  // Navigation Events
  MODULE_OPENED = "navigation:module:opened",
  MODULE_CLOSED = "navigation:module:closed",
  CONTEXT_CHANGED = "navigation:context:changed",

  // User Activity Events
  USER_ACTION = "user:action",
  SEARCH_PERFORMED = "user:search",
  QUICK_CAPTURE_USED = "user:quick_capture",

  // System Events
  APP_FOREGROUNDED = "system:app:foregrounded",
  APP_BACKGROUNDED = "system:app:backgrounded",
  DATA_SYNCED = "system:data:synced",
  MEMORY_PRESSURE = "system:memory:pressure",
  MEMORY_CLEANUP = "system:memory:cleanup",
  EVENT_CREATED = "calendar:event:created",
  EVENT_UPDATED = "calendar:event:updated",
  EVENT_DELETED = "calendar:event:deleted",
}

// Note event payloads
export interface NoteEventPayload extends EventPayload {
  eventType:
    | EVENT_TYPES.NOTE_CREATED
    | EVENT_TYPES.NOTE_UPDATED
    | EVENT_TYPES.NOTE_DELETED;
  data: {
    note?: Note;
    noteId?: string;
  };
}

// Task event payloads
export interface TaskEventPayload extends EventPayload {
  eventType:
    | EVENT_TYPES.TASK_CREATED
    | EVENT_TYPES.TASK_UPDATED
    | EVENT_TYPES.TASK_DELETED
    | EVENT_TYPES.TASK_COMPLETED;
  data: {
    task?: Task;
    taskId?: string;
  };
}

// Calendar event payloads
export interface CalendarEventPayload extends EventPayload {
  eventType:
    | EVENT_TYPES.CALENDAR_EVENT_CREATED
    | EVENT_TYPES.CALENDAR_EVENT_UPDATED
    | EVENT_TYPES.CALENDAR_EVENT_DELETED;
  data: {
    event?: CalendarEvent;
    eventId?: string;
  };
}

// Union type for all specific payloads
export type TypedEventPayload =
  | NoteEventPayload
  | TaskEventPayload
  | CalendarEventPayload
  | EventPayload;

/**
 * Event Payload Type
 *
 * Generic structure for all events. Specific event types can extend this.
 */
export interface EventPayload {
  eventType: EVENT_TYPES;
  timestamp: string; // ISO 8601
  data: Record<string, unknown>;
  moduleId?: string;
}

/**
 * Event Listener Type
 */
type EventListener = (payload: EventPayload) => void | Promise<void>;

/**
 * Event Bus Class
 *
 * Singleton pattern - only one instance exists in the app.
 * Provides pub/sub functionality for cross-module communication.
 */
class EventBus {
  private listeners: Map<EVENT_TYPES, Set<EventListener>>;
  private eventHistory: EventPayload[];
  private maxHistorySize: number = 100;

  constructor() {
    this.listeners = new Map();
    this.eventHistory = [];
  }

  /**
   * Subscribe to an event type
   *
   * Plain English: "Tell me when this type of event happens"
   *
   * Technical: Adds a listener function to the set of listeners for this event type.
   * Returns an unsubscribe function to remove the listener.
   *
   * @param eventType - The type of event to listen for
   * @param listener - Function to call when event occurs
   * @returns Unsubscribe function
   */
  on(eventType: EVENT_TYPES, listener: EventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(listener);
    };
  }

  /**
   * Emit an event
   *
   * Plain English: "Something happened, notify anyone who cares"
   *
   * Technical: Calls all registered listeners for this event type with the payload.
   * Catches errors in listeners to prevent one bad listener from breaking others.
   * Stores event in history for debugging and analytics.
   *
   * @param eventType - Type of event
   * @param data - Event data
   * @param moduleId - Optional module that emitted the event
   */
  emit(
    eventType: EVENT_TYPES,
    data: Record<string, unknown>,
    moduleId?: string,
  ): void {
    const payload: EventPayload = {
      eventType,
      timestamp: new Date().toISOString(),
      data,
      moduleId,
    };

    // Add to history
    this.eventHistory.push(payload);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Notify listeners
    const listenersForType = this.listeners.get(eventType);
    if (listenersForType) {
      listenersForType.forEach((listener) => {
        try {
          // Call listener, handling both sync and async
          const result = listener(payload);
          if (result instanceof Promise) {
            result.catch((error) => {
              console.error(
                `Error in async event listener for ${eventType}:`,
                error,
              );
            });
          }
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error);
        }
      });
    }
  }

  /**
   * Get recent event history
   *
   * Useful for debugging and analytics. Returns last N events.
   *
   * @param count - Number of recent events to return (default: 10)
   * @returns Array of recent events
   */
  getRecentEvents(count: number = 10): EventPayload[] {
    return this.eventHistory.slice(-count);
  }

  /**
   * Clear event history
   *
   * Useful for testing and memory management.
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Get all active listeners
   *
   * Useful for debugging memory leaks.
   *
   * @returns Map of event types to listener counts
   */
  getListenerCounts(): Map<EVENT_TYPES, number> {
    const counts = new Map<EVENT_TYPES, number>();
    this.listeners.forEach((listeners, eventType) => {
      counts.set(eventType, listeners.size);
    });
    return counts;
  }

  /**
   * Remove all listeners for an event type
   *
   * Use with caution - mainly for testing.
   *
   * @param eventType - Event type to clear listeners for
   */
  removeAllListeners(eventType?: EVENT_TYPES): void {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }
}

// Export singleton instance
export const eventBus = new EventBus();
