/**
 * Mock / Testing Utilities
 *
 * Utilities for testing analytics instrumentation.
 * Mocks analytics client for unit tests.
 *
 * TODO: Implement testing utilities
 * - Mock analytics client
 * - Event assertion helpers
 * - Spy on analytics calls
 * - Generate test fixtures
 */

import { AnalyticsEvent, EventName, EventPropsMap } from "../types";

export class MockAnalyticsClient {
  private events: AnalyticsEvent[] = [];

  /**
   * TODO: Mock log method
   */
  async log<T extends EventName>(
    eventName: T,
    props: EventPropsMap[T],
  ): Promise<void> {
    const event: AnalyticsEvent<T> = {
      event_name: eventName,
      event_id: `mock_${Date.now()}`,
      occurred_at: new Date().toISOString(),
      session_id: "mock_session",
      props,
      app_version: "1.0.0",
      platform: "ios",
    };

    this.events.push(event as AnalyticsEvent);
  }

  /**
   * TODO: Assert event was logged
   */
  assertEventLogged(eventName: EventName): boolean {
    return this.events.some((e) => e.event_name === eventName);
  }

  /**
   * TODO: Get logged events
   */
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * TODO: Clear logged events
   */
  clear(): void {
    this.events = [];
  }
}

/**
 * Usage in tests:
 *
 * const mockAnalytics = new MockAnalyticsClient();
 *
 * // In your test
 * await mockAnalytics.log("button_clicked", { button_id: "submit" });
 *
 * expect(mockAnalytics.assertEventLogged("button_clicked")).toBe(true);
 * expect(mockAnalytics.getEvents()).toHaveLength(1);
 */
