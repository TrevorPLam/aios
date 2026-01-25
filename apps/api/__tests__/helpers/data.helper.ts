/**
 * Test Data Helpers
 * 
 * Reusable utilities for creating test data.
 * Reduces duplication of data creation across test files.
 * 
 * Related: TASK-089 (Test Helper Utilities)
 * 
 * Note: Interfaces are defined inline to avoid circular dependencies.
 * For production code, import types from contracts/models.
 */

import { randomUUID } from "crypto";

/**
 * Analytics event interface for tests
 * Based on the analytics event structure in packages/platform/analytics/
 * 
 * IMPORTANT: Keep this in sync with the actual AnalyticsEvent type.
 * If the analytics event structure changes, update this interface.
 */
interface AnalyticsEventForTests {
  eventId: string;
  eventName: string;
  timestamp: string;
  properties: Record<string, unknown>;
  identity: {
    userId: string;
    sessionId: string;
    deviceId: string;
  };
  appVersion: string;
  platform: "ios" | "android";
}

/**
 * Create test analytics event
 * 
 * Usage:
 * ```typescript
 * const event = createTestAnalyticsEvent({ eventName: "custom_event" });
 * ```
 */
export function createTestAnalyticsEvent(
  overrides?: Partial<AnalyticsEventForTests>
): AnalyticsEventForTests {
  const defaults: AnalyticsEventForTests = {
    eventId: randomUUID(),
    eventName: "test_event",
    timestamp: new Date().toISOString(),
    properties: { test_property: "test_value" },
    identity: {
      userId: randomUUID(),
      sessionId: `session_${Date.now()}`,
      deviceId: `device_${randomUUID()}`,
    },
    appVersion: "1.0.0",
    platform: "ios" as const,
  };

  return { ...defaults, ...overrides };
}

/**
 * Create batch of test analytics events
 */
export function createTestAnalyticsEventBatch(
  count: number,
  userId?: string,
): AnalyticsEventForTests[] {
  const batchUserId = userId || randomUUID();
  return Array.from({ length: count }, (_, i) =>
    createTestAnalyticsEvent({
      eventName: `test_event_${i}`,
      identity: {
        userId: batchUserId,
        sessionId: `session_${Date.now()}`,
        deviceId: `device_${randomUUID()}`,
      },
    }),
  );
}

/**
 * Create test note data
 */
export function createTestNote(overrides?: Partial<TestNote>) {
  const defaults = {
    title: "Test Note",
    bodyMarkdown: "Test content",
    tags: ["test"],
    links: [],
  };

  return { ...defaults, ...overrides };
}

interface TestNote {
  title: string;
  bodyMarkdown: string;
  tags: string[];
  links: string[];
}

/**
 * Create test task data
 */
export function createTestTask(overrides?: Partial<TestTask>) {
  const defaults = {
    title: "Test Task",
    description: "Test task description",
    status: "pending" as const,
    priority: "medium" as const,
    dueDate: new Date(Date.now() + 86400000).toISOString(), // tomorrow
  };

  return { ...defaults, ...overrides };
}

interface TestTask {
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: string;
}

/**
 * Create test calendar event data
 */
export function createTestCalendarEvent(overrides?: Partial<TestCalendarEvent>) {
  const defaults = {
    title: "Test Event",
    description: "Test event description",
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
    location: "Test Location",
    attendees: [],
  };

  return { ...defaults, ...overrides };
}

interface TestCalendarEvent {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  attendees: string[];
}

/**
 * Wait for a condition to be true (useful for async assertions)
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeoutMs = 5000,
  intervalMs = 100,
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    if (await condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Condition not met within ${timeoutMs}ms`);
}

/**
 * Sleep for specified milliseconds (useful for testing delays)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
