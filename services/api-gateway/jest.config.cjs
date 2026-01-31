/**
 * Jest configuration for API Gateway service
 * Extends shared Node.js configuration
 */
const nodeConfig = require("@aios/jest-config/node");

module.exports = {
  ...nodeConfig,
  displayName: "api-gateway",
  testEnvironment: "node",
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: {
          module: "commonjs",
          target: "ES2022",
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          strict: true,
        },
      },
    ],
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/**/node_modules/**",
    "!src/**/dist/**",
    "!src/index.ts", // Main entry point, tested via integration tests
    "!src/storage.ts", // Mocked in tests
    "!src/middleware/rateLimiter.ts", // Rate limiter mocked in tests
    "!src/utils/logger.ts", // Logger mocked in tests
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/build/",
    "/__tests__/",
  ],
  testMatch: [
    "**/__tests__/**/*.test.ts",
    "**/__tests__/**/*.spec.ts",
  ],
  moduleNameMapper: {
    "^@aios/platform$": "<rootDir>/../../packages/platform",
    "^@aios/platform/(.*)$": "<rootDir>/../../packages/platform/$1",
    "^@aios/contracts$": "<rootDir>/../../packages/contracts",
    "^@aios/contracts/(.*)$": "<rootDir>/../../packages/contracts/$1",
    "^@aios/features/(.*)$": "<rootDir>/../../packages/features/$1",
  },
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 40,
      lines: 50,
      statements: 50,
    },
  },
};
