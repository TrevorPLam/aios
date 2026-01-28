// Logger and LogLevel are already exported from @aios/platform/lib via packages/platform/index.ts
// Only export analytics-specific logging functions here to avoid duplicate exports
export {
  logButtonPress,
  logPlaceholderAction,
} from "@aios/platform/analytics/analyticsLogger";
