/**
 * Setup file for React Native tests
 * Configures React Native Testing Library and mocks
 */

// Mock AsyncStorage before any imports
jest.mock("@react-native-async-storage/async-storage", () => {
  try {
    return require("@react-native-async-storage/async-storage/jest/async-storage-mock");
  } catch {
    // Fallback mock if jest mock doesn't exist
    return {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      getAllKeys: jest.fn(() => Promise.resolve([])),
    };
  }
});

// Mock React Native modules
jest.mock("react-native", () => {
  // Return a simple mock to avoid ES module issues
  return {
    Platform: {
      OS: "ios",
      select: jest.fn((dict) => dict.ios),
    },
    StyleSheet: {
      create: jest.fn((styles) => styles),
    },
  };
});
