/**
 * Jest configuration for @aios/ui
 * Uses React preset for React component tests
 */
const path = require("path");
const baseConfig = require(path.join(__dirname, "../configs/jest-config/react"));

module.exports = {
  ...baseConfig,
  displayName: "@aios/ui",
  roots: ["<rootDir>"],
  testMatch: ["**/__tests__/**/*.test.{ts,tsx}"],
  moduleNameMapper: {
    // Merge base config's moduleNameMapper (for CSS mocks) with our path mappings
    ...baseConfig.moduleNameMapper,
    "^@aios/ui$": "<rootDir>/..",
    "^@aios/features$": "<rootDir>/../features",
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
