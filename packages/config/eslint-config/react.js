module.exports = {
  extends: ["./index.js"],
  plugins: ["react", "react-hooks", "react-native", "prettier"],
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    "react/react-in-jsx-scope": "off", // Not needed with React 17+
    "react/prop-types": "off", // Using TypeScript for prop validation
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "react-native/no-unused-styles": "warn",
    "react-native/split-platform-components": "warn",
    "react-native/no-inline-styles": "off",
    "react-native/no-color-literals": "off",
    "prettier/prettier": "warn",
  },
};
