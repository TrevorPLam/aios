/**
 * Multi-Destination Routing
 *
 * Routes events to multiple destinations based on rules.
 * Enables sending different events to different backends.
 *
 * TODO: Implement multi-destination routing similar to Segment
 * - Define destinations (analytics, data warehouse, monitoring)
 * - Route events based on event type, module, or custom rules
 * - Parallel sending to multiple destinations
 * - Per-destination error handling
 */

import { AnalyticsEvent, EventName } from "../types";

export interface Destination {
  name: string;
  endpoint: string;
  enabled: boolean;
  eventFilter?: (event: AnalyticsEvent) => boolean;
  transform?: (event: AnalyticsEvent) => any;
}

export class DestinationRouter {
  private destinations: Map<string, Destination> = new Map();

  /**
   * TODO: Register a destination
   */
  registerDestination(destination: Destination): void {
    this.destinations.set(destination.name, destination);
  }

  /**
   * TODO: Route event to appropriate destinations
   */
  async route(event: AnalyticsEvent): Promise<void> {
    const applicableDestinations = Array.from(
      this.destinations.values(),
    ).filter(
      (dest) => dest.enabled && (!dest.eventFilter || dest.eventFilter(event)),
    );

    // TODO: Send to all applicable destinations in parallel
    throw new Error("Not implemented");
  }

  /**
   * TODO: Get destinations for event
   */
  getDestinationsForEvent(event: AnalyticsEvent): Destination[] {
    return Array.from(this.destinations.values()).filter(
      (dest) => dest.enabled && (!dest.eventFilter || dest.eventFilter(event)),
    );
  }
}

/**
 * Example Usage:
 *
 * router.registerDestination({
 *   name: "analytics",
 *   endpoint: "/api/analytics",
 *   enabled: true,
 *   eventFilter: (e) => !e.event_name.startsWith("debug_")
 * });
 *
 * router.registerDestination({
 *   name: "monitoring",
 *   endpoint: "/api/monitoring",
 *   enabled: true,
 *   eventFilter: (e) => e.event_name.includes("error") || e.event_name.includes("crash")
 * });
 */
