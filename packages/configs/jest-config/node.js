/**
 * Jest configuration for Node.js services
 * Extends base configuration for server-side code
 */
const baseConfig = require("./base");
const path = require("path");

module.exports = {
  ...baseConfig,
  testEnvironment: "node",
  setupFilesAfterEnv: [
    path.join(__dirname, "setup-node.js"),
  ],
  moduleNameMapper: {},
};
