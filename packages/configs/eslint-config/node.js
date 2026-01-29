module.exports = {
  extends: ["./index.js"],
  env: {
    node: true,
    es2022: true,
  },
  plugins: ["prettier"],
  rules: {
    "@typescript-eslint/no-var-requires": "off", // Allow require() in Node.js
    "prettier/prettier": "warn",
  },
};
