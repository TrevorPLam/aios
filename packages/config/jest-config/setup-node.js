/**
 * Setup file for Node.js tests
 * Configures server-side test environment
 */

// Increase timeout for integration tests
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests (optional)
// Uncomment if you want to suppress console logs during tests
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };
