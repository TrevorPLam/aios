const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Mobile-only app - iOS and Android only, no web
// This ensures Metro only bundles for mobile platforms
config.resolver.platforms = ["ios", "android"];

module.exports = config;
