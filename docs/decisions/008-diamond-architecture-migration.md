# ADR-008: Diamond++ Architecture Migration

**Status:** Accepted  
**Date:** 2026-01-23  
**Relates to:** [Diamond++ Migration Plan](../architecture/DIAMOND_PLUS_PLUS_MIGRATION_PLAN.md)

## Plain English Summary

- Moving from flat structure (`/client`, `/server`, `/shared`) to monorepo with `/apps` and `/packages`
- Features become vertical-slice packages with domain/data/ui separation
- Apps become thin composition shells
- Migration is incremental over 7 phases
- Optimized for AI-assisted parallel development
- No big bang rewrites—app stays running throughout

## Context

### Current Architecture Problems

The AIOS repository has grown organically into a workable but structurally implicit system:

1. **God Module:** A 5,747-line `client/storage/database.ts` acts as the central data store
2. **Interwoven Concerns:** UI, business logic, and persistence are mixed in screen files
3. **Implicit Boundaries:** Features (calendar, contacts, budget, etc.) exist conceptually but not structurally
4. **Developer-Dependent Knowledge:** Code placement relies on human judgment, not enforced structure
5. **Limited Reusability:** Business logic is tightly coupled to mobile app, cannot be shared with web or API
6. **AI Orchestration Challenges:** AI agents must guess where code belongs

### The Problem

As the system grows, these issues compound:
- New features require modifying the god module
- Cross-feature concerns create coupling
- Testing becomes difficult (cannot test features in isolation)
- Web app would require duplicating business logic
- API may drift from mobile implementation
- AI-assisted development is inefficient (agents must infer structure)

### Why Now?

Multiple drivers converge:
1. **Product expansion:** Web app needed (cross-platform architecture required)
2. **Team growth:** Clear boundaries enable parallel development
3. **AI orchestration:** Deterministic structure enables AI-assisted feature extraction
4. **Technical debt:** God module approaching unmanageability
5. **Velocity:** Current structure slowing feature development

## Decision

We will migrate to a **Diamond++ AI-native monorepo architecture** over 7 phases spanning 12-15 weeks.

### Target Architecture

```
aios/
├── apps/                          # Deployable runtimes (thin shells)
│   ├── mobile/                    # React Native
│   ├── web/                       # React web app
│   └── api/                       # Express backend
├── packages/                      # Reusable, enforceable boundaries
│   ├── features/                  # Vertical-slice feature packages
│   │   ├── calendar/
│   │   ├── contacts/
│   │   └── [...]/
│   ├── contracts/                 # Schemas, validators, DTOs
│   ├── platform/                  # Storage, network, analytics
│   └── design-system/             # Shared UI primitives
└── tools/                         # Build scripts, generators
```

### Key Principles

1. **Feature Independence:** Each feature is a complete vertical slice (domain + data + UI)
2. **Domain Purity:** Business logic has zero dependencies on React, storage, or HTTP
3. **Apps as Shells:** Apps contain routing, providers, and composition only
4. **Platform Abstraction:** Storage/network isolated behind adapters
5. **One-Way Dependencies:** `apps → features → platform → contracts`
6. **Public API Enforcement:** Only `index.ts` is importable from packages

### Phased Migration

See [DIAMOND_PLUS_PLUS_MIGRATION_PLAN.md](../architecture/DIAMOND_PLUS_PLUS_MIGRATION_PLAN.md) for full details.

**Phase Summary:**
- **Phase 0:** Repository normalization (structure without moving logic)
- **Phase 1:** Contracts extraction (shared types/schemas)
- **Phase 2:** Platform extraction (storage kernel decomposition)
- **Phase 3:** Pilot feature extraction (proves pattern)
- **Phase 4:** Design system extraction (UI primitives)
- **Phase 5:** Parallel feature extraction (**AI orchestration sweet spot**)
- **Phase 6:** Web app composition (validates cross-platform)
- **Phase 7:** API alignment (completes three-runtime alignment)

### Non-Negotiable Constraints

1. **Incremental Only:** No big bang rewrites
2. **Always Buildable:** App must run after every commit
3. **Evidence-Based:** All changes must be validated with tests/builds
4. **No Deletions:** Working code preserved until replacement proven
5. **AI-Optimized:** Structure must enable deterministic code placement

## Consequences

### Positive

1. **Deterministic Code Placement:**
   - AI agents know exactly where to place new code
   - No architectural decisions required for routine tasks
   - "Where does this go?" has one correct answer

2. **Cross-Platform Enablement:**
   - Web app can reuse all feature packages
   - API can share business logic with mobile
   - Platform adapters swap cleanly

3. **Parallel Development:**
   - Features can be built simultaneously without conflicts
   - AI agents can extract features in parallel (Phase 5)
   - Clear boundaries prevent merge conflicts

4. **Testability:**
   - Features test in isolation
   - Domain logic tests without platform mocks
   - Repository pattern enables adapter swapping

5. **Maintainability:**
   - God module eliminated (<50 lines or deleted)
   - Screens become small composition files (<200 lines)
   - Business logic centralized in feature packages

6. **Team Scalability:**
   - New developers understand structure immediately
   - Feature ownership is explicit
   - Codebase grows predictably

### Negative

1. **Migration Effort:**
   - 12-15 weeks to complete all phases
   - Requires disciplined execution
   - Human review needed for merges

2. **Build Complexity:**
   - Monorepo tooling required (pnpm, Turborepo)
   - CI must handle multi-package builds
   - Dependency graph must be maintained

3. **Learning Curve:**
   - Team must learn new patterns (repository, dependency injection)
   - Initial feature extraction slower than steady state
   - Import rules must be enforced

4. **Strictness:**
   - Less "quick and dirty" prototyping
   - Architectural rules are enforced, not suggested
   - Trade-off: short-term flexibility for long-term structure

### Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| App breaks during migration | High | Incremental phases, always buildable |
| Circular dependencies | Medium | Import linter, validation at PR time |
| `database.ts` remains coupled | High | Delete functions as extracted, lint enforcement |
| AI extractions introduce bugs | Medium | Human review, comprehensive tests |
| Team resistance to strictness | Low | Document rationale, show velocity gains |

### Validation Criteria

The migration is successful when:
- [ ] All features are in `packages/features/`
- [ ] Apps are <30% of total codebase
- [ ] `database.ts` deleted or <50 lines
- [ ] Web app runs using feature packages
- [ ] API shares business logic with mobile
- [ ] Import boundaries enforced by linter
- [ ] New feature development faster than pre-migration
- [ ] AI can place code deterministically

## Alternatives Considered

### Alternative 1: Status Quo
**Decision:** Keep flat structure, improve documentation

**Pros:**
- Zero migration effort
- No learning curve
- Existing patterns preserved

**Cons:**
- God module continues growing
- Web app would duplicate logic
- AI orchestration remains inefficient
- Technical debt compounds

**Rejected because:** Does not solve cross-platform or AI orchestration needs

### Alternative 2: Big Bang Rewrite
**Decision:** Rewrite entire app in new structure

**Pros:**
- Clean slate
- Perfect architecture immediately
- No migration debt

**Cons:**
- App unavailable during rewrite (weeks/months)
- High risk of bugs
- Feature development stops
- May miss requirements during rewrite

**Rejected because:** Violates constraint "existing app must keep running"

### Alternative 3: Micro-Frontends
**Decision:** Split into separate repositories per feature

**Pros:**
- Maximum isolation
- Independent deployments
- Clear ownership

**Cons:**
- Shared logic duplication
- Complex deployment pipeline
- Version synchronization issues
- Not optimized for mobile app structure

**Rejected because:** Over-engineers for current scale, complicates mobile builds

### Alternative 4: Modular Monolith (No Monorepo)
**Decision:** Use folders and conventions, not packages

**Pros:**
- Simpler build
- No monorepo tooling
- Faster initial setup

**Cons:**
- Boundaries not enforced (conventions violated over time)
- Cannot share packages between runtimes
- Import discipline relies on code review
- AI cannot enforce structure

**Rejected because:** Boundaries must be enforceable, not just documented

## Related Decisions

- [ADR-001: Record Architecture Decisions](./0001-record-architecture-decisions.md)
- [ADR-004: Documentation Structure](./004-docs-structure.md)
- [ADR-007: Governance CI Enforcement](./007-governance-ci-enforcement.md)

## References

- [Diamond++ Migration Plan](../architecture/DIAMOND_PLUS_PLUS_MIGRATION_PLAN.md) (Full 7-phase plan)
- [Diamond++ Quick Reference](../architecture/DIAMOND_QUICK_REFERENCE.md) (One-page guide)
- [Constitution](../governance/constitution.md) (Repository laws)
- [Vertical Slice Architecture](https://www.jimmybogard.com/vertical-slice-architecture/) (Jimmy Bogard)
- [Screaming Architecture](https://blog.cleancoder.com/uncle-bob/2011/09/30/Screaming-Architecture.html) (Robert C. Martin)

## Approval

- **Author:** Principal Software Architect
- **Reviewers:** Engineering leads, AI orchestration team
- **Approved:** 2026-01-23
- **Next Review:** After Phase 3 completion (pilot feature extracted)

---

**Document Control**

- **Version:** 1.0
- **Last Updated:** 2026-01-23
- **Status:** Accepted
