/**
 * Circuit Breaker Pattern
 *
 * Prevents cascading failures by stopping requests to failing endpoints.
 * Opens circuit after threshold failures, attempts recovery after timeout.
 *
 * World-class standard: Firebase Analytics, Snowplow use circuit breakers
 */

export enum CircuitState {
  CLOSED = "CLOSED", // Normal operation
  OPEN = "OPEN", // Circuit tripped, rejecting requests
  HALF_OPEN = "HALF_OPEN", // Testing if service recovered
}

export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening
  successThreshold: number; // Number of successes to close from half-open
  timeout: number; // Time in ms before attempting recovery
  monitoringPeriod: number; // Rolling window for failure counting
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime: number | null;
  lastStateChange: number;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime: number | null = null;
  private lastStateChange: number = Date.now();
  private config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: config.failureThreshold || 5,
      successThreshold: config.successThreshold || 2,
      timeout: config.timeout || 60000, // 1 minute
      monitoringPeriod: config.monitoringPeriod || 120000, // 2 minutes
    };
  }

  /**
   * Check if request should be allowed
   */
  async allowRequest(): Promise<boolean> {
    const now = Date.now();

    switch (this.state) {
      case CircuitState.CLOSED:
        // Normal operation
        return true;

      case CircuitState.OPEN:
        // Check if timeout has elapsed
        if (
          this.lastFailureTime &&
          now - this.lastFailureTime >= this.config.timeout
        ) {
          this.transitionTo(CircuitState.HALF_OPEN);
          console.log(
            "[CircuitBreaker] Transitioning to HALF_OPEN, attempting recovery",
          );
          return true;
        }
        return false;

      case CircuitState.HALF_OPEN:
        // Allow limited requests to test recovery
        return true;

      default:
        return true;
    }
  }

  /**
   * Record successful request
   */
  async recordSuccess(): Promise<void> {
    const now = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;

      if (this.successCount >= this.config.successThreshold) {
        this.transitionTo(CircuitState.CLOSED);
        console.log("[CircuitBreaker] Service recovered, circuit CLOSED");
        this.failureCount = 0;
        this.successCount = 0;
      }
    } else if (this.state === CircuitState.CLOSED) {
      // Reset failure count on success in closed state
      this.failureCount = 0;
    }
  }

  /**
   * Record failed request
   */
  async recordFailure(): Promise<void> {
    const now = Date.now();
    this.lastFailureTime = now;

    if (this.state === CircuitState.HALF_OPEN) {
      // Failed during recovery, reopen circuit
      this.transitionTo(CircuitState.OPEN);
      console.warn("[CircuitBreaker] Recovery failed, circuit reopened");
      this.successCount = 0;
      return;
    }

    // Clean old failures outside monitoring period
    if (
      this.lastFailureTime &&
      now - this.lastFailureTime > this.config.monitoringPeriod
    ) {
      this.failureCount = 0;
    }

    this.failureCount++;

    if (
      this.state === CircuitState.CLOSED &&
      this.failureCount >= this.config.failureThreshold
    ) {
      this.transitionTo(CircuitState.OPEN);
      console.error(
        `[CircuitBreaker] Circuit OPENED after ${this.failureCount} failures`,
      );
    }
  }

  /**
   * Transition to new state
   */
  private transitionTo(newState: CircuitState): void {
    this.state = newState;
    this.lastStateChange = Date.now();
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failureCount,
      successes: this.successCount,
      lastFailureTime: this.lastFailureTime,
      lastStateChange: this.lastStateChange,
    };
  }

  /**
   * Force reset circuit
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.lastStateChange = Date.now();
    console.log("[CircuitBreaker] Circuit manually reset");
  }

  /**
   * Check if circuit is open (blocking requests)
   */
  isOpen(): boolean {
    return this.state === CircuitState.OPEN;
  }
}

/**
 * Usage in transport.ts:
 *
 * const circuitBreaker = new CircuitBreaker({
 *   failureThreshold: 5,
 *   timeout: 60000
 * });
 *
 * async send(events) {
 *   if (!await circuitBreaker.allowRequest()) {
 *     return { success: false, error: 'Circuit breaker open', shouldRetry: true };
 *   }
 *
 *   try {
 *     const result = await fetch(...);
 *     await circuitBreaker.recordSuccess();
 *     return result;
 *   } catch (error) {
 *     await circuitBreaker.recordFailure();
 *     throw error;
 *   }
 * }
 */
