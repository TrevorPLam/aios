/**
 * Governance & Best Practices
 *
 * This feature module follows the vertical slice architecture pattern.
 *
 * Constitution (Article 4): Incremental Delivery
 * - Each layer (domain/data/ui) should be independently testable
 * - Changes should be small and focused on one concern
 *
 * Principles:
 * - Respect Boundaries by Default (P13): Follow import direction (ui → domain → data → platform)
 * - Localize Complexity (P14): Keep feature logic within this module
 * - Consistency Beats Novelty (P15): Match patterns from other features
 *
 * Best Practices:
 * - domain/ contains business logic (no UI, no data access)
 * - data/ contains data access (imports from platform, uses domain types)
 * - ui/ contains React components (imports from design-system, uses domain)
 * - Cross-feature imports require ADR (see .repo/policy/BOUNDARIES.md)
 *
 * See: .repo/policy/BOUNDARIES.md for import rules
 * See: .repo/policy/constitution.json for governance
 */
export * as domain from "./domain";
export * as data from "./data";
export * as ui from "./ui";
