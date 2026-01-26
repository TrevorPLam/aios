/**
 * Governance & Best Practices
 *
 * Platform utilities provide infrastructure primitives for features.
 *
 * Constitution (Article 13): Respect Boundaries by Default
 * - Platform layer has no dependencies on features or apps
 * - May be imported by data/ layers and apps
 * - Must not import from features or business logic
 *
 * Principles:
 * - Localize Complexity (P14): Platform utilities should be focused and reusable
 * - Consistency Beats Novelty (P15): Follow existing platform patterns
 * - Naming Matters (P21): Use clear, descriptive names for platform utilities
 *
 * Best Practices:
 * - Keep utilities generic and reusable
 * - No feature-specific logic in platform
 * - Document platform-specific assumptions (iOS vs Android vs Web)
 * - Use TypeScript strict mode
 *
 * See: .repo/policy/BOUNDARIES.md for import rules
 * See: .repo/policy/constitution.json for governance
 */
export * from "./lazyLoader";
export * from "./prefetchEngine";
export * from "./memoryManager";
export * from "./eventBus";
export * from "./query-client";
export * from "./storage";
export * from "./logger";
export * from "./errorReporting";
export * from "./keyboardShortcuts";
export * from "./navigationPerformance";
export * from "./navigationValidation";
export * from "./platformSupport";
export * from "./secondaryNavigation";
export * from "./lazyFallback";
export * from "./helpers";
export * from "./seedData";
export * from "./useAnalyticsNavigation";
export * from "./useScreenOptions";
export * from "./useDataLoader";
