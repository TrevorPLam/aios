/**
 * AsyncStorage Mock
 * 
 * Mock for @react-native-async-storage/async-storage.
 * Provides in-memory storage for tests without requiring React Native environment.
 * 
 * Related: TASK-088 (Test Mocking Infrastructure)
 */

/**
 * In-memory AsyncStorage implementation for tests
 */
export class MockAsyncStorage {
  private storage: Map<string, string> = new Map();

  async getItem(key: string): Promise<string | null> {
    return this.storage.get(key) || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }

  async getAllKeys(): Promise<string[]> {
    return Array.from(this.storage.keys());
  }

  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    return keys.map((key) => [key, this.storage.get(key) || null]);
  }

  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    keyValuePairs.forEach(([key, value]) => {
      this.storage.set(key, value);
    });
  }

  async multiRemove(keys: string[]): Promise<void> {
    keys.forEach((key) => {
      this.storage.delete(key);
    });
  }
}

/**
 * Setup AsyncStorage mock for Jest
 */
export function setupAsyncStorageMock() {
  const mockStorage = new MockAsyncStorage();

  jest.mock("@react-native-async-storage/async-storage", () => ({
    __esModule: true,
    default: mockStorage,
  }));

  return mockStorage;
}
