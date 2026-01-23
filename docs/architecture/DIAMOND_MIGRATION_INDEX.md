# Diamond++ Architecture Migration - Index

**Status:** Active Migration  
**Current Phase:** Phase 0 - Planning & Documentation  
**Started:** 2026-01-23  
**Estimated Completion:** 12-15 weeks from implementation start

---

## Quick Navigation

### Essential Documents (Start Here)

1. **[Quick Reference](./DIAMOND_QUICK_REFERENCE.md)** ⭐  
   One-page guide - "Where does my code go?"  
   **Read this first if you just need to know where to put code.**

2. **[Full Migration Plan](./DIAMOND_PLUS_PLUS_MIGRATION_PLAN.md)** 📋  
   Complete 7-phase strategy with timelines, risks, and stop conditions  
   **Read this if you're planning or executing the migration.**

3. **[Architecture Diagrams](./DIAMOND_ARCHITECTURE_DIAGRAMS.md)** 📊  
   Visual representations of current vs target architecture  
   **Read this if you're a visual learner.**

4. **[ADR-008: Migration Decision](../decisions/008-diamond-architecture-migration.md)** 📝  
   Formal architecture decision record with rationale  
   **Read this if you need to understand why we're doing this.**

---

## Current State (Before Migration)

```
aios/
├── client/                 # 5,747-line database.ts god module
│   └── screens/            # 45+ screens with interwoven concerns
├── server/                 # API routes
└── shared/                 # Some shared types
```

**Problems:**
- God module approaching unmanageability
- Business logic coupled to mobile app
- Features exist conceptually, not structurally
- Cannot reuse code for web app
- AI agents must guess where code belongs

---

## Target State (After Migration)

```
aios/
├── apps/                   # Thin shells (<30% of codebase)
│   ├── mobile/             # React Native
│   ├── web/                # React web
│   └── api/                # Express
├── packages/               # Reusable boundaries
│   ├── features/           # Vertical-slice feature packages
│   │   ├── calendar/       # domain/ + data/ + ui/
│   │   ├── contacts/
│   │   └── [45+ more]/
│   ├── contracts/          # Schemas, types, validators
│   ├── platform/           # Storage, network, analytics
│   └── design-system/      # Shared UI primitives
└── tools/                  # Generators, scripts
```

**Benefits:**
- Deterministic code placement (AI-friendly)
- Cross-platform by default (mobile/web/API share logic)
- Parallel development (features independent)
- Testable (features test in isolation)
- Maintainable (clear boundaries)

---

## Migration Phases

| Phase | Goal | Duration | Risk | AI Value |
|-------|------|----------|------|----------|
| **0** | Repo normalization | 1 week | Low | Helpful |
| **1** | Contracts extraction | 1 week | Low | Helpful |
| **2** | Platform creation | 2-3 weeks | Med-High | Risky |
| **3** | Pilot feature | 2 weeks | Medium | Helpful (supervised) |
| **4** | Design system | 1-2 weeks | Low | Highly helpful |
| **5** | Feature extraction | 4-8 weeks | Medium | **⭐ Sweet spot** |
| **6** | Web app | 2-3 weeks | Medium | Helpful |
| **7** | API alignment | 2-3 weeks | High | Risky |

**Total:** 12-15 weeks with parallelization

---

## Phase 5 is the AI Orchestration Sweet Spot

Phase 5 (parallel feature extraction) is where AI orchestration provides maximum value:

- **Parallelizable:** Extract 45+ features simultaneously
- **Repetitive:** Same pattern for each feature
- **Independent:** Features don't conflict
- **Validatable:** Each extraction tested independently

**Strategy:**
1. Extract pilot feature (Phase 3) to establish pattern
2. Create feature extraction template/generator
3. Assign each feature to separate AI agent
4. Agents work in parallel on separate branches
5. Human reviews and merges sequentially

**Expected speedup:** 5-10x compared to sequential extraction

---

## Decision Flowchart

**Q: Where does this code go?**

```
Is it a business rule?
├─ YES → packages/features/<feature>/domain/rules.ts
└─ NO ↓

Is it a storage operation?
├─ YES → packages/features/<feature>/data/repository.ts
└─ NO ↓

Is it a UI component?
├─ Feature-specific? → packages/features/<feature>/ui/<Component>.tsx
├─ Reusable? → packages/design-system/components/<Component>.tsx
└─ NO ↓

Is it a shared type/schema?
├─ YES → packages/contracts/types/ or /schemas/
└─ NO ↓

Is it platform abstraction?
├─ YES → packages/platform/<storage|network|analytics>/
└─ NO ↓

Is it routing/composition?
├─ YES → apps/<runtime>/screens/ or /routes/
└─ NO → Ask for guidance (might need new category)
```

---

## The Rules (Non-Negotiable)

### 1. One-Way Dependency Flow
```
apps → features → platform → contracts
```
Never reverse this flow.

### 2. Feature Independence
Features **cannot** import from other features.  
If Feature A needs Feature B, you have one feature.

### 3. Domain Purity
`domain/` folders **cannot** import:
- React or React Native
- Storage APIs
- HTTP clients
- Any platform code

Only pure TypeScript/JavaScript.

### 4. Public API Only
Only `index.ts` is importable from packages.  
Internal files are private.

### 5. Apps Are Shells
Apps contain:
- ✅ Routing
- ✅ Providers
- ✅ Configuration
- ✅ Composition

Apps **do not** contain:
- ❌ Business logic
- ❌ Storage code
- ❌ Utilities
- ❌ Validation

---

## Common Questions

### Q: Can I start using the new structure now?
**A:** Not yet. Wait until Phase 0 is complete (directories exist, monorepo tooling works).

### Q: What if my feature needs data from another feature?
**A:** Use events/hooks at the app level, or extract shared logic to contracts. Features cannot directly import each other.

### Q: Where do I put API route handlers?
**A:** In `apps/api/routes/`. But the business logic they call should be in `packages/features/<name>/data/repository.ts`.

### Q: Can domain logic use React hooks?
**A:** No. Domain logic must be pure TypeScript. Hooks go in feature's `ui/` folder.

### Q: What if I need to break these rules?
**A:** You probably don't. If you truly need an exception, document it in an ADR and get architectural review.

---

## Success Metrics

The migration is successful when:

- ✅ All features are in `packages/features/`
- ✅ Apps are <30% of total codebase
- ✅ `database.ts` deleted or <50 lines
- ✅ Web app runs using feature packages
- ✅ API shares business logic with mobile
- ✅ Import boundaries enforced by linter
- ✅ New feature development faster than pre-migration
- ✅ AI can place code deterministically

---

## Next Actions

### For Developers
1. Read [Quick Reference](./DIAMOND_QUICK_REFERENCE.md)
2. Continue using current structure until Phase 0 complete
3. Prepare for changes - review migration plan

### For Architects
1. Review [Full Migration Plan](./DIAMOND_PLUS_PLUS_MIGRATION_PLAN.md)
2. Validate phases and timelines
3. Identify pilot feature for Phase 3
4. Set up project board for tracking

### For AI Orchestrators
1. Study Phase 5 strategy (parallel extraction)
2. Prepare feature extraction templates
3. Set up validation pipelines
4. Plan agent assignment strategy

---

## Document Links

### Primary Documents
- [DIAMOND_PLUS_PLUS_MIGRATION_PLAN.md](./DIAMOND_PLUS_PLUS_MIGRATION_PLAN.md) - Complete plan
- [DIAMOND_QUICK_REFERENCE.md](./DIAMOND_QUICK_REFERENCE.md) - Quick guide
- [DIAMOND_ARCHITECTURE_DIAGRAMS.md](./DIAMOND_ARCHITECTURE_DIAGRAMS.md) - Visual diagrams
- [ADR-008](../decisions/008-diamond-architecture-migration.md) - Decision record

### Related Documents
- [Architecture README](./README.md) - Architecture docs index
- [Constitution](../governance/constitution.md) - Repository laws
- [BESTPR.md](../../BESTPR.md) - AI agent best practices
- [Main README](../../README.md) - Project overview

---

## Version History

- **2026-01-23:** Initial migration plan and documentation created
- Phase 0 in progress

**Last Updated:** 2026-01-23  
**Next Review:** After Phase 3 completion
