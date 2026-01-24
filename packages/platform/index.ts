/**
 * Governance & Best Practices
 *
 * This index file exports public APIs following repository boundaries.
 *
 * Constitution (Article 4): Incremental Delivery
 * - Export only what's needed, keep APIs small and focused
 * - Each export should be independently testable
 *
 * Principles:
 * - Respect Boundaries by Default (P13): Follow import direction rules
 * - Consistency Beats Novelty (P15): Match existing index patterns
 * - Naming Matters (P21): Use clear, descriptive export names
 *
 * Best Practices:
 * - Export types, functions, and components that are part of public API
 * - Re-export from subdirectories to provide clean import paths
 * - Group related exports logically
 * - Document complex exports with JSDoc
 *
 * See: .repo/policy/BOUNDARIES.md for import rules
 * See: .repo/policy/constitution.json for governance
 */
export * from "./analytics";
export * from "./logging";
export * from "./storage";
export * from "./lib";
