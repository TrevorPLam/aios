module.exports = {
  extends: ["@aios/eslint-config/react"],
  ignorePatterns: ["**/__tests__/**", "**/ui/**"],
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  rules: {
    "import/default": "warn",
    "import/order": "warn",
    "import/export": "warn",
    "prefer-const": "warn",
    "@typescript-eslint/no-duplicate-enum-values": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-namespace": "warn",
  },
};
