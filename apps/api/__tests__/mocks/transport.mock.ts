/**
 * Transport Mock
 * 
 * Mock for analytics transport layer to test offline queueing and retry logic.
 * Allows controlled simulation of network failures and successes.
 * 
 * Related: TASK-088 (Test Mocking Infrastructure)
 */

import { Transport, TransportResult } from "@platform/analytics/transport";

/**
 * Create a mock transport with controllable behavior
 */
export class MockTransport {
  private sendResults: TransportResult[] = [];
  private currentIndex = 0;
  public sendCalls: any[] = [];

  /**
   * Queue a result for the next send() call
   */
  queueResult(result: TransportResult) {
    this.sendResults.push(result);
  }

  /**
   * Get mock send function
   */
  getMockSend() {
    return jest.fn(async (events: any[]) => {
      this.sendCalls.push(events);
      const result = this.sendResults[this.currentIndex] || {
        success: true,
        shouldRetry: false,
      };
      this.currentIndex = Math.min(
        this.currentIndex + 1,
        this.sendResults.length - 1,
      );
      return result;
    });
  }

  /**
   * Reset mock state
   */
  reset() {
    this.sendResults = [];
    this.currentIndex = 0;
    this.sendCalls = [];
  }
}

/**
 * Create a mock transport that always succeeds
 */
export function createSuccessTransport() {
  const mock = new MockTransport();
  mock.queueResult({ success: true, shouldRetry: false });
  return mock;
}

/**
 * Create a mock transport that always fails with retry
 */
export function createFailureTransport(error = "Network error") {
  const mock = new MockTransport();
  mock.queueResult({ success: false, shouldRetry: true, error });
  return mock;
}

/**
 * Create a mock transport that fails once then succeeds
 */
export function createRetrySuccessTransport() {
  const mock = new MockTransport();
  mock.queueResult({ success: false, shouldRetry: true, error: "Temporary error" });
  mock.queueResult({ success: true, shouldRetry: false });
  return mock;
}

/**
 * Setup transport mock for Jest
 */
export function setupTransportMock(mockTransport: MockTransport) {
  jest
    .spyOn(Transport.prototype, "send")
    .mockImplementation(mockTransport.getMockSend());
}
