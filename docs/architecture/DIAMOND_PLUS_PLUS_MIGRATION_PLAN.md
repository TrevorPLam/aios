# Diamond++ Architecture Migration Game Plan

**Status:** Active Migration Plan  
**Version:** 1.0  
**Authority:** Principal Architect  
**Created:** 2026-01-23

## Plain English Summary

This document defines the phased migration path from the current flat structure to a Diamond++ AI-native monorepo architecture. This is not a tutorial or style guide—it is an executable architectural migration plan.

Key points:
- Current state: Mobile app in `/client`, API in `/server`, shared code in `/shared`
- Target: `/apps` + `/packages` with vertical-slice feature packages
- Migration is incremental—no big bang rewrites
- App stays running throughout all phases
- Each phase has clear entry/exit criteria
- Optimized for AI-assisted parallel development
- Zero governance/process discussion—pure architecture

---

## Section 1: Architectural End State

### 1.1 Target Architecture Overview

The Diamond++ monorepo architecture creates **maximum structural separation** while maintaining buildability and enabling deterministic code placement for AI orchestration.

**Directory Structure:**
```
aios/
├── apps/                          # Deployable runtimes (thin shells)
│   ├── mobile/                    # React Native (iOS/Android)
│   ├── web/                       # React web app
│   └── api/                       # Backend API server
├── packages/                      # Reusable, enforceable boundaries
│   ├── features/                  # Vertical-slice feature packages
│   │   ├── calendar/
│   │   ├── contacts/
│   │   ├── budget/
│   │   ├── notes/
│   │   └── [...]/
│   ├── contracts/                 # Schemas, validators, DTOs
│   ├── platform/                  # Storage, network, analytics, logging
│   └── design-system/             # Shared UI primitives
├── shared/                        # (deprecated, migration target)
└── tools/                         # Build scripts, generators
```

### 1.2 Feature Package Anatomy

Every feature package follows this **mandatory structure**:

```
packages/features/calendar/
├── domain/                        # Pure business logic
│   ├── types.ts                   # Domain types
│   ├── entities.ts                # Core entities
│   ├── rules.ts                   # Business rules
│   └── logic.ts                   # Pure functions
├── data/                          # Data layer (adapters)
│   ├── repository.ts              # Storage interface
│   ├── mappers.ts                 # DTO ↔ Domain mapping
│   └── queries.ts                 # Query definitions
├── ui/                            # Shared UI components
│   ├── CalendarView.tsx           # Components (no routing)
│   ├── EventCard.tsx
│   └── styles.ts
├── index.ts                       # Strict public API
├── package.json                   # Package metadata
└── README.md                      # Feature documentation
```

**Hard Rules:**
- `domain/` = **zero** dependencies on React, storage, HTTP, or platform APIs
- `data/` = can depend on `@aios/platform` but not on other features
- `ui/` = can depend on `@aios/design-system` but no routing
- `index.ts` = the **only** file other packages can import from
- No circular dependencies between features

### 1.3 App Structure (Thin Shells)

Apps are **composition-only**:

```
apps/mobile/
├── src/
│   ├── navigation/                # Routing configuration
│   ├── providers/                 # Context/provider wiring
│   ├── screens/                   # Screen compositions (thin)
│   ├── config/                    # Environment config
│   └── App.tsx                    # Root component
├── package.json
└── [...expo/RN config...]

apps/web/
├── src/
│   ├── routes/                    # Web routing
│   ├── providers/
│   ├── pages/                     # Page compositions
│   └── [...web config...]

apps/api/
├── src/
│   ├── routes/                    # HTTP route handlers
│   ├── middleware/
│   ├── config/
│   └── server.ts
```

Apps **do not contain**:
- Business logic
- Data persistence code
- Utility functions
- Validation logic
- Feature-specific types

### 1.4 Platform Package

The `@aios/platform` package provides **isolated adapters**:

```
packages/platform/
├── storage/
│   ├── index.ts                   # Public API
│   ├── adapters/
│   │   ├── asyncStorage.ts        # Mobile storage
│   │   ├── localStorage.ts        # Web storage
│   │   └── postgres.ts            # Server storage
│   └── types.ts
├── network/
│   ├── index.ts
│   ├── client.ts
│   └── types.ts
├── analytics/
├── logging/
└── index.ts                       # Platform barrel export
```

### 1.5 Non-Negotiable Boundaries

These boundaries **cannot be violated**:

1. **Feature Independence:** Features cannot import from other features
2. **Domain Purity:** `domain/` folders have zero platform dependencies
3. **One-Way Flow:** `apps → features → platform → contracts`
4. **Public API Enforcement:** Only `index.ts` exports are importable
5. **No God Modules:** No file over 500 lines
6. **Explicit Dependencies:** All cross-package imports via `package.json`

---

## Section 2: Phased Migration Plan

### Phase 0: Repository Normalization (Foundation)

**Goal:** Establish monorepo structure without moving code.

**Duration:** 1 week  
**Risk:** Low  
**AI Orchestration:** Helpful (structure creation, config generation)

#### What Changes:
1. Create directory structure:
   ```bash
   mkdir -p apps/mobile apps/web apps/api
   mkdir -p packages/features packages/contracts packages/platform packages/design-system
   mkdir -p tools/generators
   ```

2. Move existing code to `apps/`:
   - `client/` → `apps/mobile/src/`
   - `server/` → `apps/api/src/`
   - Keep `shared/` as-is (migration target, not source)

3. Set up workspace configuration:
   - Add `pnpm-workspace.yaml` (or npm/yarn workspaces)
   - Configure root `package.json` with workspace globs
   - Update `tsconfig.json` with path mappings

4. Add tooling:
   - Workspace-aware build scripts
   - Dependency graph visualization
   - Import boundary linter (e.g., `eslint-plugin-boundaries`)

#### What Stays Untouched:
- All business logic remains in `apps/mobile/src/`
- `database.ts` stays intact
- API routes unchanged
- No feature extraction yet

#### Why This Phase Exists:
- Establishes physical structure for future extractions
- Proves monorepo tooling works
- Creates deterministic paths for AI code placement
- Low risk—no logic changes

#### Stop Conditions:
- [ ] All apps build and run successfully
- [ ] Workspace commands (`pnpm build`, `pnpm test`) work
- [ ] Import paths resolve correctly
- [ ] CI passes
- [ ] Developer can run mobile app and API unchanged

#### Architectural Guarantees After Phase 0:
✓ Monorepo structure exists  
✓ Apps are in `apps/`  
✓ Empty packages exist in `packages/`  
✓ Tooling supports multi-package operations

---

### Phase 1: Contracts Package Extraction

**Goal:** Extract shared types, schemas, and validators into `@aios/contracts`.

**Duration:** 1 week  
**Risk:** Low  
**AI Orchestration:** Highly helpful (type extraction, schema generation)

#### What Changes:
1. Create `packages/contracts/`:
   ```
   packages/contracts/
   ├── src/
   │   ├── schemas/                # Zod schemas
   │   ├── types/                  # Shared TypeScript types
   │   ├── validators/             # Validation functions
   │   └── index.ts
   ├── package.json
   └── tsconfig.json
   ```

2. Move from `shared/` and `apps/`:
   - DTOs (Data Transfer Objects)
   - API request/response types
   - Zod schemas
   - Constants that are domain-agnostic

3. Update imports:
   - Find: `import { X } from '../../shared/schema'`
   - Replace: `import { X } from '@aios/contracts'`

4. Set up package:
   - Add `package.json` with clear exports
   - Configure TypeScript for library build
   - Add unit tests for validators

#### What Stays Untouched:
- `database.ts` god module
- Feature logic in apps
- Storage adapters
- UI components

#### Why This Phase Exists:
- Contracts are the **most stable** boundary
- Enables API/mobile alignment without feature coupling
- Creates first reusable package
- Low risk—types rarely break at runtime

#### Stop Conditions:
- [ ] `@aios/contracts` builds independently
- [ ] All apps import from `@aios/contracts` successfully
- [ ] Validator tests pass
- [ ] Type errors resolved
- [ ] No circular dependencies

#### Architectural Guarantees After Phase 1:
✓ Shared contracts live in one place  
✓ API and mobile share validation logic  
✓ First reusable package exists  
✓ Import discipline proven

---

### Phase 2: Platform Package Creation

**Goal:** Extract storage kernel and platform adapters into `@aios/platform`.

**Duration:** 2-3 weeks  
**Risk:** Medium-High  
**AI Orchestration:** Risky (complex state management, needs validation)

#### What Changes:
1. Create `packages/platform/storage/`:
   ```
   packages/platform/storage/
   ├── index.ts                    # Public API
   ├── types.ts                    # Storage interfaces
   ├── adapters/
   │   ├── asyncStorage.ts         # Mobile
   │   ├── localStorage.ts         # Web
   │   └── postgres.ts             # Server
   └── __tests__/
   ```

2. Extract from `apps/mobile/src/storage/database.ts`:
   - **Strategy:** Decompose by feature area, not all at once
   - Start with **read-only** queries (lowest risk)
   - Keep write operations in `database.ts` initially
   - Create adapters for:
     - Key-value storage
     - List storage
     - Relational queries (later)

3. Create interfaces:
   ```typescript
   // packages/platform/storage/types.ts
   export interface IStorage {
     get<T>(key: string): Promise<T | null>;
     set<T>(key: string, value: T): Promise<void>;
     delete(key: string): Promise<void>;
     clear(): Promise<void>;
   }
   
   export interface IListStorage<T> {
     getAll(): Promise<T[]>;
     getById(id: string): Promise<T | null>;
     create(item: T): Promise<T>;
     update(id: string, item: Partial<T>): Promise<T>;
     delete(id: string): Promise<void>;
   }
   ```

4. Add network abstraction:
   ```
   packages/platform/network/
   ├── index.ts
   ├── client.ts                   # HTTP client wrapper
   ├── types.ts
   └── __tests__/
   ```

5. Add logging/analytics:
   ```
   packages/platform/logging/
   packages/platform/analytics/
   ```

#### What Stays Untouched:
- Complex `database.ts` logic (migrations happen in Phase 3+)
- Feature screens
- Navigation
- Business rules

#### Why This Phase Exists:
- Isolates platform dependencies
- Enables cross-platform (mobile/web) feature packages
- Creates testable adapters
- Required before feature extraction

#### Critical Migration Strategy:
**DO NOT attempt to extract all of `database.ts` at once.**

1. Start with **one feature area** (e.g., settings)
2. Extract read operations first
3. Validate with existing screens
4. Extract write operations
5. Remove code from `database.ts`
6. Repeat for next feature area

#### Stop Conditions:
- [ ] `@aios/platform` builds and tests pass
- [ ] Storage adapters work on mobile
- [ ] At least 3 feature areas migrated from `database.ts`
- [ ] Network client handles auth/errors
- [ ] Logging available to all packages
- [ ] Zero references to `database.ts` in migrated areas

#### Architectural Guarantees After Phase 2:
✓ Storage abstracted behind interfaces  
✓ Platform dependencies isolated  
✓ Cross-platform adapters exist  
✓ `database.ts` is smaller  
✓ Dependency injection pattern proven

---

### Phase 3: First Feature Package Extraction (Pilot)

**Goal:** Extract one **complete** feature into `packages/features/[name]`.

**Duration:** 2 weeks  
**Risk:** Medium  
**AI Orchestration:** Helpful with supervision (logic extraction, refactoring)

#### Choosing the Pilot Feature:
Select a feature that is:
- **Self-contained** (minimal cross-feature dependencies)
- **Non-critical** (can tolerate iteration)
- **Representative** (has domain logic, data layer, UI)

**Recommended pilot:** `settings` or `notes`  
**Avoid for pilot:** `calendar` (too complex), `auth` (too critical)

#### What Changes:
1. Create feature package:
   ```
   packages/features/settings/
   ├── domain/
   │   ├── types.ts
   │   ├── entities.ts
   │   ├── rules.ts
   │   └── logic.ts
   ├── data/
   │   ├── repository.ts
   │   ├── mappers.ts
   │   └── queries.ts
   ├── ui/
   │   ├── SettingsView.tsx
   │   ├── SettingRow.tsx
   │   └── styles.ts
   ├── index.ts
   ├── package.json
   └── README.md
   ```

2. Extract from `apps/mobile/src/`:
   - Domain logic from screens → `domain/`
   - Storage calls from screens → `data/repository.ts`
   - UI components from screens → `ui/`
   - Types from scattered files → `domain/types.ts`

3. Refactor screen to be thin:
   ```typescript
   // apps/mobile/src/screens/SettingsScreen.tsx (AFTER)
   import { SettingsView } from '@aios/features/settings';
   import { useSettings } from '@aios/features/settings';
   
   export const SettingsScreen = () => {
     const settings = useSettings();
     return <SettingsView {...settings} />;
   };
   ```

4. Create repository pattern:
   ```typescript
   // packages/features/settings/data/repository.ts
   import { IStorage } from '@aios/platform/storage';
   
   export class SettingsRepository {
     constructor(private storage: IStorage) {}
     
     async getSettings(): Promise<Settings> {
       // Storage calls here
     }
   }
   ```

#### What Stays Untouched:
- Other feature screens
- Remaining `database.ts` logic
- Navigation structure
- API routes (for now)

#### Why This Phase Exists:
- Proves feature package pattern works
- Establishes extraction playbook
- Validates dependency boundaries
- Creates template for AI-assisted extraction

#### Migration Process:
1. **Identify:** List all files related to pilot feature
2. **Extract domain:** Move pure logic to `domain/`
3. **Extract data:** Move storage to `data/repository.ts`
4. **Extract UI:** Move components to `ui/`
5. **Thin screen:** Refactor screen to composition-only
6. **Test:** Ensure feature works identically
7. **Document:** Record lessons learned

#### Stop Conditions:
- [ ] Pilot feature package builds independently
- [ ] Feature works in mobile app unchanged from user perspective
- [ ] Screen file is <100 lines
- [ ] Zero direct imports from `apps/mobile/src/storage/database.ts`
- [ ] Tests pass
- [ ] `index.ts` exports are documented

#### Architectural Guarantees After Phase 3:
✓ Feature package pattern proven  
✓ Domain/data/UI separation validated  
✓ Extraction playbook exists  
✓ Template for next 40+ features  
✓ AI can replicate pattern

---

### Phase 4: Design System Package

**Goal:** Extract shared UI primitives into `@aios/design-system`.

**Duration:** 1-2 weeks  
**Risk:** Low  
**AI Orchestration:** Highly helpful (component extraction, prop typing)

#### What Changes:
1. Create design system package:
   ```
   packages/design-system/
   ├── src/
   │   ├── components/
   │   │   ├── Button.tsx
   │   │   ├── Card.tsx
   │   │   ├── Input.tsx
   │   │   └── [...]/
   │   ├── theme/
   │   │   ├── colors.ts
   │   │   ├── spacing.ts
   │   │   └── typography.ts
   │   ├── hooks/
   │   │   ├── useTheme.ts
   │   │   └── usePlatform.ts
   │   └── index.ts
   ├── package.json
   └── README.md
   ```

2. Extract from `apps/mobile/src/components/`:
   - Reusable UI primitives
   - Theme tokens
   - Common hooks
   - Layout components

3. Move theme:
   - Colors, spacing, typography
   - Platform-specific styles
   - Accessibility helpers

#### What Stays Untouched:
- Feature-specific components (stay in feature packages)
- Screens
- Navigation components

#### Why This Phase Exists:
- Enables UI consistency across mobile/web
- Required for feature packages to build UI
- Prevents duplication

#### Stop Conditions:
- [ ] `@aios/design-system` builds
- [ ] Theme tokens documented
- [ ] Components have Storybook/docs
- [ ] Feature packages can import design system
- [ ] Mobile app renders identically

#### Architectural Guarantees After Phase 4:
✓ Shared UI primitives in one place  
✓ Theme system centralized  
✓ Feature packages can build UI without app dependencies

---

### Phase 5: Parallel Feature Extraction

**Goal:** Extract remaining features using established pattern.

**Duration:** 4-8 weeks (parallelizable)  
**Risk:** Medium  
**AI Orchestration:** **Highly valuable** (parallel extraction, consistency enforcement)

#### What Changes:
1. Extract features in priority order:
   - **High value, low complexity first:**
     - Notes
     - Contacts
     - Tasks
   - **High value, high complexity later:**
     - Calendar
     - Budget
     - Email

2. Use template from Phase 3 pilot:
   ```bash
   tools/generators/create-feature-package.sh <feature-name>
   # Scaffolds: domain/, data/, ui/, index.ts, tests
   ```

3. Create feature extraction queue:
   - Track in project board
   - Assign to AI agents in parallel
   - Review and validate each extraction

#### What Stays Untouched:
- Previously extracted features
- API (Phase 6 target)
- Core app shell

#### Why This Phase Exists:
- **AI orchestration sweet spot:** Repetitive but requires intelligence
- Maximum parallelization
- Feature boundaries prevent conflicts

#### AI Orchestration Strategy:
**Assign each feature to a separate AI agent:**
- Agent A: Extract calendar feature
- Agent B: Extract contacts feature
- Agent C: Extract budget feature
- Agents work in parallel on separate branches
- Merge sequentially after validation

**Benefits:**
- 10x faster than sequential extraction
- AI agents apply consistent patterns
- Structural conflicts minimized

#### Stop Conditions (Per Feature):
- [ ] Feature package builds independently
- [ ] Feature works in app unchanged
- [ ] Tests migrated and passing
- [ ] Documentation complete
- [ ] Code removed from app

#### Stop Conditions (Phase Complete):
- [ ] All features extracted
- [ ] `apps/mobile/src/screens/` are thin shells
- [ ] `database.ts` deleted or <50 lines
- [ ] Dependency graph visualized
- [ ] Import boundaries enforced

#### Architectural Guarantees After Phase 5:
✓ All features are vertical-slice packages  
✓ Apps are composition shells  
✓ Business logic centralized in packages  
✓ AI can deterministically place new feature code

---

### Phase 6: Web App Composition

**Goal:** Create `apps/web` using existing feature packages.

**Duration:** 2-3 weeks  
**Risk:** Medium  
**AI Orchestration:** Helpful (component adaptation, routing setup)

#### What Changes:
1. Create web app:
   ```
   apps/web/
   ├── src/
   │   ├── pages/
   │   │   ├── Calendar.tsx
   │   │   ├── Contacts.tsx
   │   │   └── [...]/
   │   ├── routes/
   │   │   └── index.tsx
   │   ├── providers/
   │   │   └── AppProviders.tsx
   │   └── App.tsx
   ├── public/
   ├── package.json
   └── vite.config.ts (or Next.js config)
   ```

2. Compose features:
   ```typescript
   // apps/web/src/pages/Calendar.tsx
   import { CalendarView, useCalendar } from '@aios/features/calendar';
   
   export const CalendarPage = () => {
     const calendar = useCalendar();
     return (
       <div>
         <h1>Calendar</h1>
         <CalendarView {...calendar} />
       </div>
     );
   };
   ```

3. Set up platform adapters:
   - Use web storage adapter from `@aios/platform`
   - Configure network client for browser
   - Add web-specific providers

#### What Stays Untouched:
- Mobile app
- Feature packages
- API

#### Why This Phase Exists:
- Proves cross-platform architecture works
- Validates platform abstraction
- Demonstrates feature reusability

#### Stop Conditions:
- [ ] Web app builds and runs
- [ ] Features render correctly in browser
- [ ] Storage works with localStorage
- [ ] Navigation works
- [ ] No mobile-specific code imported

#### Architectural Guarantees After Phase 6:
✓ Cross-platform feature packages work  
✓ Web app is a thin shell  
✓ Platform abstraction validated

---

### Phase 7: API Alignment

**Goal:** Align API to use feature packages (domain/data layers).

**Duration:** 2-3 weeks  
**Risk:** High  
**AI Orchestration:** Risky (requires validation of business logic)

#### What Changes:
1. Refactor API routes to use feature repositories:
   ```typescript
   // apps/api/src/routes/calendar.ts
   import { CalendarRepository } from '@aios/features/calendar/data';
   
   export const calendarRouter = express.Router();
   
   calendarRouter.get('/events', async (req, res) => {
     const repo = new CalendarRepository(storage);
     const events = await repo.getEvents();
     res.json(events);
   });
   ```

2. Extract API-specific logic:
   - Auth middleware stays in API
   - HTTP concerns stay in API
   - Business logic moves to feature packages

3. Use PostgreSQL adapter from `@aios/platform`

#### What Stays Untouched:
- HTTP routing
- Middleware
- Authentication

#### Why This Phase Exists:
- Completes three-runtime alignment (mobile/web/API)
- Ensures business logic is shared
- Prevents API drift

#### Stop Conditions:
- [ ] API uses feature repositories
- [ ] API tests pass
- [ ] Business logic shared with mobile/web
- [ ] Database schema aligned

#### Architectural Guarantees After Phase 7:
✓ Three runtimes share business logic  
✓ API is a thin shell  
✓ Single source of truth for domain logic

---

## Section 3: Risk & Dependency Awareness

### 3.1 Ordering Constraints

**Must happen in order:**
1. Phase 0 → Phase 1 → Phase 2 (foundation required)
2. Phase 2 → Phase 3 (platform needed for features)
3. Phase 3 → Phase 5 (pilot proves pattern)
4. Phase 2 + Phase 4 → Phase 6 (web needs platform + design system)

**Can happen in parallel:**
- Phase 4 (design system) + Phase 3 (pilot feature)
- Phase 5 features (each feature independently)
- Phase 6 (web) + Phase 7 (API) after Phase 5

### 3.2 Common Failure Modes

#### Failure Mode 1: "Big Bang" Extraction
**Symptom:** Attempting to extract all features at once  
**Impact:** App breaks, can't build, blocked for weeks  
**Prevention:** 
- Extract one feature at a time
- Validate each extraction before moving to next
- Keep app running throughout

#### Failure Mode 2: Circular Dependencies
**Symptom:** Feature A imports Feature B, Feature B imports Feature A  
**Impact:** Build fails, cannot resolve modules  
**Prevention:**
- Enforce import boundaries with linter
- Use `@aios/contracts` for shared types
- If two features need each other, they're one feature

#### Failure Mode 3: `database.ts` Remains Coupled
**Symptom:** Features import from `database.ts` instead of using repositories  
**Impact:** Cannot build features independently, platform abstraction broken  
**Prevention:**
- Delete `database.ts` functions as they're extracted
- Lint rule: no imports from `apps/` in `packages/`
- Repository pattern is non-negotiable

#### Failure Mode 4: "Screens" Contain Business Logic
**Symptom:** Screen files remain large (>500 lines)  
**Impact:** Business logic still coupled to app, not reusable  
**Prevention:**
- Screen file size limit: 200 lines
- Move all logic to feature packages
- Screens should be composition-only

#### Failure Mode 5: Platform Leakage
**Symptom:** `domain/` folders import from `@react-native` or `expo`  
**Impact:** Cannot share domain logic across platforms  
**Prevention:**
- Strict ESLint rule: `domain/` cannot import platform APIs
- Use dependency injection for platform concerns
- Domain logic must be pure TypeScript

### 3.3 AI Orchestration: Where It Helps vs Hurts

#### ✅ **AI Orchestration is Highly Valuable:**
- **Phase 0:** Scaffolding directory structure
- **Phase 1:** Type extraction and import updates
- **Phase 3:** Pilot feature extraction (with human supervision)
- **Phase 4:** Design system extraction (low risk, high repetition)
- **Phase 5:** **Parallel feature extraction (sweet spot)**
  - Assign each feature to separate AI agent
  - Work in parallel on separate branches
  - Human reviews and merges sequentially

#### ⚠️ **AI Orchestration Needs Supervision:**
- **Phase 2:** Storage kernel decomposition (complex state)
- **Phase 3:** First pilot feature (establishes pattern)
- **Phase 7:** API alignment (business logic correctness critical)

#### ❌ **AI Orchestration is Risky:**
- Merging extracted features (human reviews dependency boundaries)
- Resolving circular dependencies (architectural decision required)
- Deciding feature boundaries (requires domain knowledge)

---

## Section 4: Stop Conditions Summary

### Phase 0: Repository Normalization
- [ ] Monorepo tooling works (`pnpm build`, `pnpm test`)
- [ ] Apps moved to `apps/`
- [ ] Empty package directories exist
- [ ] Mobile app and API run unchanged
- [ ] CI passes

### Phase 1: Contracts Package
- [ ] `@aios/contracts` builds independently
- [ ] Apps import from `@aios/contracts`
- [ ] Validator tests pass
- [ ] No circular dependencies

### Phase 2: Platform Package
- [ ] `@aios/platform` builds and tests pass
- [ ] Storage adapters work on mobile
- [ ] At least 3 feature areas migrated from `database.ts`
- [ ] Logging and network clients available

### Phase 3: Pilot Feature
- [ ] Pilot feature package builds independently
- [ ] Feature works identically in app
- [ ] Screen file <100 lines
- [ ] Zero imports from `database.ts` in feature

### Phase 4: Design System
- [ ] `@aios/design-system` builds
- [ ] Components documented
- [ ] Feature packages can import design system

### Phase 5: Parallel Feature Extraction
- [ ] All features extracted to packages
- [ ] `apps/mobile/src/screens/` are thin
- [ ] `database.ts` deleted
- [ ] Import boundaries enforced

### Phase 6: Web App
- [ ] Web app builds and runs
- [ ] Features render in browser
- [ ] Storage works with web adapters

### Phase 7: API Alignment
- [ ] API uses feature repositories
- [ ] API tests pass
- [ ] Business logic shared across runtimes

---

## Section 5: Architectural Guarantees by Phase

| Phase | Guarantees |
|-------|------------|
| **Phase 0** | Monorepo structure exists, apps buildable |
| **Phase 1** | Shared contracts in one place, validation centralized |
| **Phase 2** | Storage abstracted, platform dependencies isolated |
| **Phase 3** | Feature package pattern proven, extraction playbook exists |
| **Phase 4** | UI primitives centralized, theme system shared |
| **Phase 5** | All features are packages, apps are shells |
| **Phase 6** | Cross-platform validated, web app exists |
| **Phase 7** | Three runtimes aligned, business logic shared |

---

## Section 6: Success Metrics

By completing this migration, the following **must be true**:

### Code Placement is Deterministic
- ✅ New feature? → `packages/features/<name>/`
- ✅ Shared type? → `packages/contracts/`
- ✅ Storage logic? → `packages/platform/storage/`
- ✅ UI primitive? → `packages/design-system/`
- ✅ Screen composition? → `apps/<runtime>/screens/`

### Boundaries are Enforced
- ✅ Features cannot import from other features
- ✅ `domain/` has zero platform dependencies
- ✅ Apps cannot contain business logic
- ✅ Circular dependencies are impossible

### AI Orchestration is Optimized
- ✅ AI agents know exactly where to place code
- ✅ Features can be built in parallel
- ✅ Conflicts are structural, not logical
- ✅ Pattern is repeatable without human decisions

### Business Logic is Centralized
- ✅ Rules live in `domain/`
- ✅ Storage lives in `data/`
- ✅ UI lives in `ui/`
- ✅ Apps are composition-only

### Cross-Platform Works
- ✅ Features run on mobile, web, and API
- ✅ Platform adapters swap cleanly
- ✅ No platform-specific code in features

---

## Section 7: Next Steps

### Immediate Actions:
1. **Review this plan** with stakeholders
2. **Create project board** with phases as columns
3. **Set up monorepo tooling** (Phase 0 prerequisite)
4. **Identify pilot feature** (Phase 3 prerequisite)
5. **Run baseline tests** to establish current coverage

### Continuous Actions:
- Track progress in project board
- Document lessons learned per phase
- Update this plan as discoveries happen
- Validate architectural guarantees at phase boundaries

### Long-Term Actions:
- Train AI agents on extraction patterns
- Build code generators for feature scaffolding
- Create architecture decision records (ADRs) for key choices
- Measure build times and dependency graph health

---

## Appendix A: Tooling Recommendations

### Monorepo Management
- **pnpm workspaces** (recommended) or npm/yarn workspaces
- **Turborepo** or **Nx** for build caching
- **Lerna** (optional, for versioning)

### Import Boundaries
- **eslint-plugin-boundaries** (enforce no cross-feature imports)
- **dependency-cruiser** (visualize dependency graph)
- **madge** (detect circular dependencies)

### Code Generation
- **Plop** (feature package scaffolding)
- **Hygen** (template-based generation)
- Custom scripts in `tools/generators/`

### Build & Test
- **Vitest** or **Jest** (testing)
- **TypeScript Project References** (incremental builds)
- **esbuild** or **swc** (fast builds)

### Documentation
- **TypeDoc** (API documentation)
- **Storybook** (design system)
- **Docusaurus** (architecture docs)

---

## Appendix B: Estimated Timeline

| Phase | Duration | Parallelizable? |
|-------|----------|-----------------|
| Phase 0: Repo Normalization | 1 week | No |
| Phase 1: Contracts | 1 week | No |
| Phase 2: Platform | 2-3 weeks | No |
| Phase 3: Pilot Feature | 2 weeks | No |
| Phase 4: Design System | 1-2 weeks | Yes (with Phase 3) |
| Phase 5: Feature Extraction | 4-8 weeks | **Yes (high value)** |
| Phase 6: Web App | 2-3 weeks | Yes (after Phase 5) |
| Phase 7: API Alignment | 2-3 weeks | Yes (with Phase 6) |

**Total Sequential:** ~20 weeks  
**Total with Parallelization:** ~12-15 weeks

---

## Appendix C: Decision Matrix

Use this matrix to decide where new code belongs:

| Code Type | Location | Package |
|-----------|----------|---------|
| Business rule | `domain/rules.ts` | `@aios/features/<name>` |
| Entity/Model | `domain/entities.ts` | `@aios/features/<name>` |
| Storage logic | `data/repository.ts` | `@aios/features/<name>` |
| UI component (feature-specific) | `ui/<Component>.tsx` | `@aios/features/<name>` |
| UI component (reusable) | `components/<Component>.tsx` | `@aios/design-system` |
| Type (shared) | `types/<name>.ts` | `@aios/contracts` |
| Validation schema | `schemas/<name>.ts` | `@aios/contracts` |
| Storage adapter | `storage/adapters/<name>.ts` | `@aios/platform` |
| HTTP client | `network/client.ts` | `@aios/platform` |
| Screen composition | `screens/<Name>Screen.tsx` | `apps/<runtime>` |
| Route handler | `routes/<name>.ts` | `apps/api` |
| Navigation | `navigation/<Name>.tsx` | `apps/<runtime>` |

---

## Document Control

**Status:** Active  
**Version:** 1.0  
**Last Updated:** 2026-01-23  
**Next Review:** After Phase 3 completion  
**Owner:** Principal Architect  
**Reviewers:** Engineering leads, AI orchestration team

**Change Log:**
- 2026-01-23: Initial version created
- (Future updates tracked here)

---

**End of Document**
