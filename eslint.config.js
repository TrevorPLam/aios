// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: ["dist/*"],
  },
  // Node.js environment for automation scripts and Node.js files
  {
    files: [
      ".repo/automation/scripts/**/*.js",
      "scripts/**/*.{js,mjs}",
      "jest.setup.js",
      "*.config.js",
      "*.config.mjs",
    ],
    languageOptions: {
      globals: {
        __dirname: "readonly",
        __filename: "readonly",
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        global: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
        jest: "readonly",
      },
    },
  },
  // Disable import resolution for TypeScript files (TypeScript handles this)
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "import/no-unresolved": "off",
      "import/export": "off",
    },
  },
  // Make react/no-unescaped-entities a warning instead of error
  {
    files: ["**/*.{tsx,jsx}"],
    rules: {
      "react/no-unescaped-entities": "warn",
    },
  },
]);
