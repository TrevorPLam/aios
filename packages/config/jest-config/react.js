/**
 * Jest configuration for React components
 * Extends base configuration with React Testing Library setup
 */
const baseConfig = require("./base");
const path = require("path");

module.exports = {
  ...baseConfig,
  testEnvironment: "jsdom",
  setupFilesAfterEnv: [
    path.join(__dirname, "setup-react.js"),
  ],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  transform: {
    ...baseConfig.transform,
  },
};
