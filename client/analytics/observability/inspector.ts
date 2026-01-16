/**
 * Event Inspector / Debugger
 *
 * Real-time event inspection for debugging.
 * Shows events as they're logged with validation status.
 *
 * TODO: Implement inspector UI similar to Segment Live Debugger
 * - Real-time event stream
 * - Event details view
 * - Validation errors highlighted
 * - Search and filter
 * - Export events for analysis
 */

import { AnalyticsEvent } from "../types";

export interface InspectorEvent {
  event: AnalyticsEvent;
  timestamp: number;
  validationErrors: string[];
  deliveryStatus: "queued" | "sent" | "failed" | "dropped";
}

export class EventInspector {
  private events: InspectorEvent[] = [];
  private maxEvents = 100;
  private listeners: ((event: InspectorEvent) => void)[] = [];

  /**
   * TODO: Capture event for inspection
   */
  capture(event: AnalyticsEvent, validationErrors: string[] = []): void {
    const inspectorEvent: InspectorEvent = {
      event,
      timestamp: Date.now(),
      validationErrors,
      deliveryStatus: "queued",
    };

    this.events.push(inspectorEvent);
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Notify listeners
    this.listeners.forEach((listener) => listener(inspectorEvent));
  }

  /**
   * TODO: Subscribe to new events
   */
  subscribe(listener: (event: InspectorEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * TODO: Get recent events
   */
  getEvents(limit?: number): InspectorEvent[] {
    return limit ? this.events.slice(-limit) : [...this.events];
  }

  /**
   * TODO: Clear captured events
   */
  clear(): void {
    this.events = [];
  }
}

/**
 * TODO: Create React component for Event Inspector UI
 *
 * Features:
 * - Real-time event list
 * - Event details modal
 * - Validation error highlighting
 * - Filter by event name, module, status
 * - Search by property values
 * - Export to JSON/CSV
 */
