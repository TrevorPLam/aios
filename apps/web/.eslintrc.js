module.exports = {
  extends: ["@aios/eslint-config/react"],
  rules: {
    "@typescript-eslint/no-require-imports": "off", // Next.js uses require
  },
};
