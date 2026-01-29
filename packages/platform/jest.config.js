/**
 * Jest configuration for @aios/platform
 * Uses React Native preset for storage tests
 */
const path = require("path");
const baseConfig = require(
  path.join(__dirname, "../config/jest-config/react-native"),
);

module.exports = {
  ...baseConfig,
  displayName: "@aios/platform",
  roots: ["<rootDir>"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    // Merge base config's moduleNameMapper (for asset mocks) with our path mappings
    ...baseConfig.moduleNameMapper,
    "^@aios/ui$": "<rootDir>/../ui",
    "^@aios/features$": "<rootDir>/../features",
    "^@aios/platform$": "<rootDir>/..",
    "^@aios/contracts$": "<rootDir>/../contracts",
    "^@aios/utils$": "<rootDir>/../utils",
    "^@aios/api-sdk$": "<rootDir>/../api-sdk",
  },
  collectCoverageFrom: [
    "**/*.ts",
    "!**/*.d.ts",
    "!**/__tests__/**",
    "!**/node_modules/**",
    "!**/dist/**",
    "!**/build/**",
    "!**/index.ts",
  ],
};
