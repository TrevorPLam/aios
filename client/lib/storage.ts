/**
 * How to Use:
 * - Use saveToStorage/loadFromStorage for lightweight preferences and caches.
 * - Call getAsyncStorage() when you need raw storage access in platform code.
 *
 * UI integration example:
 * - Screens like AIPreferencesScreen persist toggles via saveToStorage.
 *
 * Public API:
 * - getAsyncStorage, saveToStorage, loadFromStorage.
 *
 * Expected usage pattern:
 * - Store small JSON-serializable payloads and handle null returns in tests.
 *
 * WHY: Standardizes AsyncStorage access so tests and runtime behave consistently.
 */
/**
 * Storage Helper
 *
 * Provides a consistent interface to AsyncStorage that works in both
 * production and test environments.
 */

let AsyncStorage: any = null;

/**
 * Get AsyncStorage instance
 * Returns null in test environments or if not available
 */
export async function getAsyncStorage() {
  if (AsyncStorage) {
    return AsyncStorage;
  }

  try {
    // Only load AsyncStorage in React Native environment
    if (
      typeof navigator !== "undefined" &&
      navigator.product === "ReactNative"
    ) {
      const module = await import("@react-native-async-storage/async-storage");
      AsyncStorage = module.default;
      return AsyncStorage;
    }
  } catch (error) {
    console.warn("AsyncStorage not available:", error);
  }

  return null;
}

/**
 * Save data to AsyncStorage
 */
export async function saveToStorage(key: string, data: any): Promise<void> {
  const storage = await getAsyncStorage();
  if (!storage) {
    // In test mode or when AsyncStorage unavailable, just skip
    return;
  }

  try {
    await storage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save to storage (key: ${key}):`, error);
  }
}

/**
 * Load data from AsyncStorage
 */
export async function loadFromStorage<T>(key: string): Promise<T | null> {
  const storage = await getAsyncStorage();
  if (!storage) {
    // In test mode or when AsyncStorage unavailable, return null
    return null;
  }

  try {
    const value = await storage.getItem(key);
    if (value) {
      return JSON.parse(value) as T;
    }
  } catch (error) {
    console.error(`Failed to load from storage (key: ${key}):`, error);
  }

  return null;
}
