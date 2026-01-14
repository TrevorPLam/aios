const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Disable web platform for mobile-only app
// This ensures Metro only bundles for iOS and Android, not web
config.resolver.platforms = ["ios", "android"];

module.exports = config;
