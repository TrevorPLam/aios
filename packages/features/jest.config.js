/**
 * Jest configuration for @aios/features
 * Uses React Native preset for feature tests
 */
const path = require("path");
const baseConfig = require(path.join(__dirname, "../configs/jest-config/react-native"));

module.exports = {
  ...baseConfig,
  displayName: "@aios/features",
  roots: ["<rootDir>"],
  testMatch: ["**/__tests__/**/*.test.{ts,tsx}"],
  moduleNameMapper: {
    // Merge base config's moduleNameMapper (for asset mocks) with our path mappings
    ...baseConfig.moduleNameMapper,
    "^@aios/ui$": "<rootDir>/../ui",
    "^@aios/features$": "<rootDir>/..",
    "^@aios/platform$": "<rootDir>/../platform",
    "^@aios/contracts$": "<rootDir>/../contracts",
    "^@aios/utils$": "<rootDir>/../utils",
    "^@aios/api-sdk$": "<rootDir>/../api-sdk",
  },
  collectCoverageFrom: [
    "**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/__tests__/**",
    "!**/node_modules/**",
    "!**/dist/**",
    "!**/build/**",
    "!**/index.ts",
  ],
};
