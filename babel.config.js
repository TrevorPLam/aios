module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./apps/mobile",
            "@shared": "./packages/contracts",
            "@contracts": "./packages/contracts",
            "@features": "./packages/features",
            "@platform": "./packages/platform",
            "@design-system": "./packages/design-system",
            "@apps": "./apps",
          },
          extensions: [".ios.js", ".android.js", ".js", ".ts", ".tsx", ".json"],
        },
      ],
      "react-native-worklets/plugin",
    ],
  };
};
