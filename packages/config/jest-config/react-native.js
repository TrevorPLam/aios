/**
 * Jest configuration for React Native
 * Extends base configuration with React Native support
 */
const baseConfig = require("./base");
const path = require("path");

module.exports = {
  ...baseConfig,
  testEnvironment: "node",
  setupFilesAfterEnv: [
    path.join(__dirname, "setup-react-native.js"),
  ],
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|@react-navigation|@aios|@testing-library)/)",
  ],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "jest-transform-stub",
  },
  // Transform React Native files - use base transform config
  transform: baseConfig.transform,
};
