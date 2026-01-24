// Logger and LogLevel are already exported from @platform/lib via packages/platform/index.ts
// Only export analytics-specific logging functions here to avoid duplicate exports
export {
  logButtonPress,
  logPlaceholderAction,
} from "@platform/analytics/analyticsLogger";
