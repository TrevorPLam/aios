# Diamond++ Architecture Quick Reference

**Status:** Quick Reference  
**Related:** [Full Migration Plan](./DIAMOND_PLUS_PLUS_MIGRATION_PLAN.md)

## Plain English Summary

This is a one-page quick reference for the Diamond++ architecture. Use this when you need to quickly answer "where does this code go?"

---

## Directory Structure (Target State)

```
aios/
├── apps/                          # Thin shells (routing, providers, config)
│   ├── mobile/                    # React Native
│   ├── web/                       # React web
│   └── api/                       # Express API
├── packages/                      
│   ├── features/                  # Vertical-slice feature packages
│   │   ├── calendar/
│   │   ├── contacts/
│   │   └── [feature-name]/
│   │       ├── domain/            # Pure logic (no React, no storage)
│   │       ├── data/              # Repositories, queries
│   │       ├── ui/                # Components (no routing)
│   │       └── index.ts           # Public API
│   ├── contracts/                 # Schemas, types, validators
│   ├── platform/                  # Storage, network, logging
│   └── design-system/             # Shared UI primitives
└── tools/                         # Generators, scripts
```

---

## Where Does Code Go?

| I'm writing... | It goes in... | Package |
|----------------|---------------|---------|
| A business rule | `domain/rules.ts` | `@aios/features/<feature>` |
| A data entity | `domain/entities.ts` | `@aios/features/<feature>` |
| Storage query | `data/repository.ts` | `@aios/features/<feature>` |
| Feature UI | `ui/<Component>.tsx` | `@aios/features/<feature>` |
| Shared UI | `components/<Component>.tsx` | `@aios/design-system` |
| Shared type | `types/<name>.ts` | `@aios/contracts` |
| Zod schema | `schemas/<name>.ts` | `@aios/contracts` |
| Storage adapter | `storage/adapters/<name>.ts` | `@aios/platform` |
| Screen | `screens/<Name>Screen.tsx` | `apps/<runtime>` |
| API route | `routes/<name>.ts` | `apps/api` |

---

## The Rules

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
- React
- React Native
- Storage APIs
- HTTP clients
- Any platform code

Only pure TypeScript.

### 4. Public API Only
Only `index.ts` is importable.  
Internal files are private.

### 5. Apps Are Shells
Apps contain:
- Routing
- Providers
- Configuration
- Composition

Apps **do not** contain:
- Business logic
- Storage code
- Utilities
- Validation

---

## Feature Package Anatomy

```
packages/features/calendar/
├── domain/                        # ← Pure business logic
│   ├── types.ts
│   ├── entities.ts
│   ├── rules.ts
│   └── logic.ts
├── data/                          # ← Storage, queries
│   ├── repository.ts
│   ├── mappers.ts
│   └── queries.ts
├── ui/                            # ← Components
│   ├── CalendarView.tsx
│   ├── EventCard.tsx
│   └── styles.ts
├── index.ts                       # ← Public API
├── package.json
└── README.md
```

---

## Import Examples

### ✅ Correct
```typescript
// App imports feature
import { CalendarView, useCalendar } from '@aios/features/calendar';

// Feature imports platform
import { IStorage } from '@aios/platform/storage';

// Feature imports contracts
import { EventSchema } from '@aios/contracts/schemas';

// Feature imports design system
import { Button } from '@aios/design-system';
```

### ❌ Incorrect
```typescript
// Feature imports another feature
import { Contact } from '@aios/features/contacts'; // ❌ NO

// Feature imports from app
import { useNavigation } from '@aios/apps/mobile'; // ❌ NO

// App imports internal feature file
import { EventCard } from '@aios/features/calendar/ui/EventCard'; // ❌ NO
// Use: import { EventCard } from '@aios/features/calendar';

// Domain imports React
import { useState } from 'react'; // ❌ NO (in domain/)
```

---

## Phase Order (TL;DR)

1. **Phase 0:** Set up monorepo structure (1 week)
2. **Phase 1:** Extract contracts (1 week)
3. **Phase 2:** Extract platform (2-3 weeks)
4. **Phase 3:** Extract pilot feature (2 weeks)
5. **Phase 4:** Extract design system (1-2 weeks)
6. **Phase 5:** Extract all features in parallel (4-8 weeks) ← **AI sweet spot**
7. **Phase 6:** Build web app (2-3 weeks)
8. **Phase 7:** Align API (2-3 weeks)

**Total:** 12-15 weeks with parallelization

---

## Common Mistakes

### ❌ Mistake 1: Big Bang Extraction
**Don't:** Extract all features at once  
**Do:** Extract one at a time, validate, then move to next

### ❌ Mistake 2: Logic in Screens
**Don't:** Write business logic in screen files  
**Do:** Move logic to `domain/`, screens compose only

### ❌ Mistake 3: Direct Storage Access
**Don't:** Import `database.ts` or storage directly  
**Do:** Use repositories in `data/`

### ❌ Mistake 4: Circular Dependencies
**Don't:** Feature A imports Feature B, Feature B imports Feature A  
**Do:** Extract shared logic to contracts or create one feature

### ❌ Mistake 5: Platform Leakage
**Don't:** Import React Native in `domain/`  
**Do:** Keep domain pure, use dependency injection

---

## Decision Flowchart

```
Is it a business rule?
├─ YES → domain/rules.ts
└─ NO ↓

Is it a storage operation?
├─ YES → data/repository.ts
└─ NO ↓

Is it a UI component?
├─ Feature-specific? → ui/<Component>.tsx
├─ Reusable? → @aios/design-system
└─ NO ↓

Is it a shared type/schema?
├─ YES → @aios/contracts
└─ NO ↓

Is it platform abstraction?
├─ YES → @aios/platform
└─ NO ↓

Is it routing/composition?
├─ YES → apps/<runtime>
└─ NO → Re-evaluate or ask for guidance
```

---

## AI Orchestration Tips

### ✅ **Use AI for:**
- Scaffolding packages
- Extracting types
- Parallel feature extraction (Phase 5)
- Repetitive refactors

### ⚠️ **Supervise AI for:**
- Storage decomposition (complex)
- First pilot feature (sets pattern)
- Dependency boundary decisions

### ❌ **Don't use AI for:**
- Merging features (human reviews boundaries)
- Resolving circular deps (needs architecture decision)
- Defining feature boundaries (needs domain knowledge)

---

## Validation Checklist (Per Feature)

- [ ] Feature package builds independently
- [ ] No imports from other features
- [ ] `domain/` has zero platform dependencies
- [ ] Screen file is <200 lines
- [ ] `index.ts` exports documented
- [ ] Tests migrated and passing
- [ ] Feature works identically in app

---

## Key Files

- **Full Plan:** [docs/architecture/DIAMOND_PLUS_PLUS_MIGRATION_PLAN.md](./DIAMOND_PLUS_PLUS_MIGRATION_PLAN.md)
- **Constitution:** [docs/governance/constitution.md](../governance/constitution.md)
- **Architecture Index:** [docs/architecture/README.md](./README.md)

---

**Last Updated:** 2026-01-23
