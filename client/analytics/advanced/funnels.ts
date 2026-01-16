/**
 * Funnel Analysis Support
 *
 * Tracks user progress through defined funnels.
 * Enables conversion rate optimization.
 *
 * TODO: Implement funnel tracking similar to Amplitude/Mixpanel
 * - Define funnels (sequence of events)
 * - Track funnel progress
 * - Identify drop-off points
 * - Calculate conversion rates
 */

import { EventName } from "../types";

export interface FunnelDefinition {
  name: string;
  steps: EventName[];
  timeWindow?: number; // Max time to complete funnel (ms)
}

export interface FunnelProgress {
  funnelName: string;
  currentStep: number;
  completedSteps: EventName[];
  startedAt: number;
  completed: boolean;
}

export class FunnelTracker {
  private funnels: Map<string, FunnelDefinition> = new Map();
  private userProgress: Map<string, FunnelProgress[]> = new Map();

  /**
   * TODO: Define a funnel
   */
  defineFunnel(funnel: FunnelDefinition): void {
    this.funnels.set(funnel.name, funnel);
  }

  /**
   * TODO: Track event in funnel context
   */
  trackFunnelEvent(userId: string, eventName: EventName): void {
    throw new Error("Not implemented");
  }

  /**
   * TODO: Get funnel progress for user
   */
  getProgress(userId: string, funnelName: string): FunnelProgress | null {
    throw new Error("Not implemented");
  }

  /**
   * TODO: Calculate conversion rate
   */
  getConversionRate(funnelName: string): number {
    throw new Error("Not implemented");
  }
}

/**
 * Example Funnel Definition:
 *
 * funnelTracker.defineFunnel({
 *   name: "onboarding",
 *   steps: [
 *     "onboarding_started",
 *     "profile_created",
 *     "first_module_opened",
 *     "onboarding_completed"
 *   ],
 *   timeWindow: 3600000 // 1 hour
 * });
 */
