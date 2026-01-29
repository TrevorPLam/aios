/**
 * Base Jest configuration
 * Shared settings for all test environments
 */
module.exports = {
  // Test environment
  testEnvironment: "node",

  // Module file extensions
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  // Transform files
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: {
          compilerOptions: {
            module: "ESNext",
            target: "ES2022",
            jsx: "react-jsx",
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            strict: true,
          },
        },
      },
    ],
  },

  // Module name mapper for path aliases
  // Note: This will be overridden by package-specific configs
  moduleNameMapper: {},

  // Test match patterns
  testMatch: [
    "**/__tests__/**/*.(test|spec).(ts|tsx|js|jsx)",
    "**/*.(test|spec).(ts|tsx|js|jsx)",
  ],

  // Coverage configuration
  // Note: Package-specific configs should override this with their own patterns
  collectCoverageFrom: [
    "**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/__tests__/**",
    "!**/node_modules/**",
    "!**/dist/**",
    "!**/build/**",
    "!**/*.test.{ts,tsx}",
    "!**/*.spec.{ts,tsx}",
    "!**/index.ts",
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Setup files
  setupFilesAfterEnv: [],

  // Ignore patterns
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/build/",
    "/.next/",
  ],

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Verbose output
  verbose: true,
};
