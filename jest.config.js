module.exports = {
  preset: "react-native",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@react-native-async-storage)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/apps/mobile/$1",
    "^@shared/(.*)$": "<rootDir>/packages/contracts/$1",
    "^@contracts/(.*)$": "<rootDir>/packages/contracts/$1",
    "^@features/(.*)$": "<rootDir>/packages/features/$1",
    "^@platform/(.*)$": "<rootDir>/packages/platform/$1",
    "^@design-system/(.*)$": "<rootDir>/packages/design-system/$1",
    "^@apps/(.*)$": "<rootDir>/apps/$1",
  },
  collectCoverageFrom: [
    "apps/mobile/**/*.{ts,tsx}",
    "apps/api/**/*.{ts,tsx}",
    "packages/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/vendor/**",
    "!apps/mobile/index.js",
  ],
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 20,
      lines: 20,
      statements: 20,
    },
  },
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
