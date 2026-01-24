# Comprehensive Project Analysis: AIOS

<!-- META: Document Header -->
**Date:** 2026-01-23  
**Scope:** Analysis of `apps/`, `assets/`, `attached_assets/`, `backend/`, `frontend/`, `packages/`, and `scripts/`

<!-- TODO: [analysis-1] Add inline commentary and metaheaders to PROJECT_ANALYSIS.md -->
<!-- COMMENT: This analysis was created through comprehensive codebase exploration. Each section includes inline commentary explaining findings and recommendations. -->

---

<!-- META: Executive Summary Section -->
## Executive Summary

The AIOS project is a **mobile-first productivity application** built with React Native/Expo, featuring a sophisticated monorepo architecture with clear boundary rules. However, the project shows signs of **architectural confusion** with duplicate/overlapping backend structures, incomplete feature implementations, and inconsistent patterns.

<!-- COMMENT: The executive summary highlights the core tension: excellent architecture design vs incomplete implementation. This is a common pattern in projects transitioning from design to execution. -->

### Key Findings

1. **Architectural Duplication**: Two backend systems exist (`backend/` Django vs `apps/api/` Node.js/Express) with unclear relationship
   <!-- COMMENT: This is the #1 blocker. Need ADR to decide which backend to use. -->
   <!-- TODO: [backend-decision] Create ADR: Django vs Node.js backend decision -->
2. **Incomplete Feature Implementations**: Many features have minimal structure (just index.ts exports)
   <!-- COMMENT: 6 out of 14 features are "MINIMAL" - this blocks API refactoring. -->
   <!-- TODO: [feature-data-layers] Implement feature data layers for minimal features -->
3. **Path Alias Inconsistency**: Both `@shared` and `@contracts` point to the same contracts package
   <!-- COMMENT: Easy fix - just need to standardize and update imports. -->
   <!-- TODO: [path-aliases] Standardize on @contracts alias (remove @shared) -->
4. **Empty Directories**: `backend/` and `frontend/` have empty subdirectories suggesting incomplete migration
   <!-- COMMENT: Suggests abandoned migration or future work. Need clarity. -->
5. **Strong Foundation**: Well-defined boundary rules, package structure, and governance framework
   <!-- COMMENT: This is the project's strength - excellent governance and architecture design. -->

---

<!-- META: Architecture Overview Section -->
## 1. Architecture Overview

### 1.1 Intended Architecture

<!-- COMMENT: The intended architecture follows a clean monorepo pattern with clear separation of concerns. The "legacy?" markers indicate uncertainty about backend/ and frontend/ directories. -->

The project follows a **monorepo structure** with clear separation:

```
apps/          → Application shells (mobile, api, web)
packages/      → Shared code organized by boundaries
  features/    → Vertical slice feature modules
  platform/    → Infrastructure adapters
  design-system/ → UI primitives
  contracts/   → Shared types/schemas
backend/       → Django backend (legacy?)  <!-- COMMENT: Unclear if this is active -->
frontend/      → React frontend (legacy?)  <!-- COMMENT: Unclear if this is active -->
```

<!-- COMMENT: The architecture is well-designed but the backend/ and frontend/ directories create confusion. They should either be removed, clearly marked as legacy, or integrated into the apps/ structure. -->

### 1.2 Boundary Rules (Well-Defined)

<!-- COMMENT: These boundary rules are excellent and well-documented. They enforce clean architecture principles. The issue is that apps/api/ doesn't follow them. -->

**Allowed Imports:**
- `features/*/domain` → `contracts`, local `domain`
- `features/*/data` → `platform`, `contracts`, local `domain`
- `features/*/ui` → `design-system`, local `domain`
- `apps/*` → `features/*`, `contracts`, `platform`, `design-system`

**Forbidden:**
- `domain` → `platform`, `ui`, `apps`
- `ui` → `data`, `platform`
- `apps` → business logic or persistence

**Status:** ✅ Rules are well-documented and enforced
<!-- COMMENT: However, enforcement is incomplete - apps/api/ violates these rules. Need to add boundary checking to CI/CD. -->
<!-- TODO: [boundary-enforcement] Add automated boundary checking to CI/CD pipeline -->

---

<!-- META: Individual Folder Analysis Section -->
## 2. Individual Folder Analysis

<!-- COMMENT: This section analyzes each major directory in detail, identifying strengths, weaknesses, and specific issues. -->

### 2.1 `apps/` Directory

#### Structure
```
apps/
├── mobile/     ✅ Active React Native app
├── api/        ✅ Active Node.js/Express server
└── web/        ⚠️  Placeholder only (README.md)
```

#### `apps/mobile/` - **GOOD**

<!-- COMMENT: This is the best-implemented part of the codebase. It follows all architectural rules correctly. -->

**Strengths:**
- ✅ Properly imports from `@packages/*` (follows boundaries)
  <!-- COMMENT: Example: `import { queryClient } from "@platform/lib/query-client"` - correct pattern -->
- ✅ Uses `@platform/lib/query-client` for React Query
- ✅ Imports feature UI components correctly
  <!-- COMMENT: Example: `import { ErrorBoundary } from "@features/core/ui/components/ErrorBoundary"` - correct pattern -->
- ✅ Well-structured navigation (`AppNavigator.tsx`, `RootStackNavigator.tsx`)
- ✅ Has test files in `__tests__/`

**Code Quality:**
- Uses TypeScript
- Follows React Native best practices
- Proper error boundaries (`ErrorBoundary`)
- Theme system integration (`ThemeProvider`)

**Issues:**
- ⚠️ No `package.json` in `apps/mobile/` (uses root package.json)
  <!-- COMMENT: This is actually fine for monorepos - root package.json is standard. Not really an issue. -->
- ⚠️ No explicit build configuration for mobile app
  <!-- COMMENT: Expo handles this, but could add explicit config for clarity. Low priority. -->

#### `apps/api/` - **MIXED**

<!-- COMMENT: This is where the biggest architectural violations occur. The API server should be a thin shell that mounts logic from packages, but it implements everything directly. -->

**Strengths:**
- ✅ Express server with proper middleware (auth, validation, error handling)
  <!-- COMMENT: The middleware implementation is actually good - auth.ts, errorHandler.ts, validation.ts are well-structured. -->
- ✅ Uses `@shared/schema` for validation
  <!-- COMMENT: Should use @contracts/schema instead - path alias issue. -->
- ✅ JWT authentication implemented
- ✅ Comprehensive route definitions (42+ endpoints)
  <!-- COMMENT: routes.ts has 722 lines - this is where the violations are. -->
- ✅ Has test files

**Critical Issues:**
- ❌ **Uses in-memory storage** (`storage.ts`) instead of `packages/platform/storage`
  <!-- COMMENT: storage.ts is 854 lines of in-memory implementation. Should use @platform/storage/database.ts instead. -->
  <!-- TODO: [database-integration] Migrate apps/api/storage.ts to use @platform/storage/database -->
- ❌ **Does NOT use `packages/features/*`** - implements business logic directly
  <!-- COMMENT: routes.ts directly calls storage methods instead of using feature data layers. -->
  <!-- TODO: [api-refactor] Refactor apps/api/routes.ts to use feature data layers -->
- ❌ **Violates boundary rules** - should mount logic from packages, not implement it
  <!-- COMMENT: This is the core architectural violation. Apps should only wire things together, not implement business logic. -->
- ❌ Uses `@shared/schema` but should use `@contracts/schema`
  <!-- COMMENT: Found in apps/api/routes.ts line 29: `import { ... } from "@shared/schema"` -->
- ⚠️ Path alias inconsistency: uses `@shared` instead of `@contracts`

**Architecture Violations:**
```typescript
// apps/api/routes.ts - WRONG PATTERN
// COMMENT: This violates the boundary rule: "apps should NOT implement business logic"
app.post("/api/notes", authenticate, asyncHandler(async (req, res) => {
  const note = await storage.createNote({ ...req.body, userId: req.user!.userId });
  // Should use: packages/features/notes/data instead
}));
```

**Should be:**
```typescript
// apps/api/routes.ts - CORRECT PATTERN
// COMMENT: Apps should only wire routes to feature data layers, not implement logic
import { notes } from "@features/notes/data";

app.post("/api/notes", authenticate, asyncHandler(async (req, res) => {
  const note = await notes.create({ ...req.body, userId: req.user!.userId });
}));
```
<!-- TODO: [api-refactor] Refactor all 42+ routes in apps/api/routes.ts to use feature data layers -->

#### `apps/web/` - **INCOMPLETE**

<!-- COMMENT: This is a placeholder. The question is: should this be implemented, or should frontend/ be used instead? -->

**Status:** ⚠️ Placeholder only
- Only contains `README.md` with placeholder text
  <!-- COMMENT: README says "Placeholder for the web composition shell" - suggests future work. -->
- No implementation
- Should wire providers, routes, and feature UI components
  <!-- COMMENT: Should follow same pattern as apps/mobile/ - just wire things together, no business logic. -->
<!-- TODO: [web-app-decision] Decide: apps/web/ or frontend/? Then implement or remove. -->

---

<!-- META: Packages Directory Analysis -->
### 2.2 `packages/` Directory

<!-- COMMENT: This is the core of the architecture - shared code organized by boundaries. The packages/ directory is well-structured but implementation depth varies. -->

#### `packages/features/` - **MIXED QUALITY**

**Structure Pattern (Good):**
Each feature follows:
```
feature/
├── domain/    → Business logic
├── data/      → Data access layer
├── ui/        → UI components
└── index.ts   → Public API
```

**Feature Completeness:**

| Feature | Domain | Data | UI | Status |
|---------|--------|-------|----|----|
| `core/` | ✅ 21 files | ✅ | ✅ 30 files | **COMPLETE** |
| `notes/` | ✅ | ✅ | ✅ 4 files | **GOOD** |
| `planner/` | ✅ | ✅ | ✅ 5 files | **GOOD** |
| `calendar/` | ✅ | ✅ | ✅ 5 files | **GOOD** |
| `contacts/` | ✅ 2 files | ✅ | ✅ 4 files | **GOOD** |
| `alerts/` | ✅ | ✅ | ✅ 3 files | **MINIMAL** |
| `budget/` | ✅ | ✅ | ✅ 2 files | **MINIMAL** |
| `email/` | ✅ | ✅ | ✅ 5 files | **GOOD** |
| `integrations/` | ✅ | ✅ | ✅ 3 files | **MINIMAL** |
| `lists/` | ✅ 5 files | ✅ | ✅ 3 files | **GOOD** |
| `messaging/` | ✅ | ✅ | ✅ 3 files | **MINIMAL** |
| `photos/` | ✅ | ✅ | ✅ 5 files | **GOOD** |
| `recommendations/` | ✅ | ✅ | ✅ 3 files | **MINIMAL** |
| `settings/` | ✅ | ✅ | ✅ 7 files | **GOOD** |
| `translator/` | ✅ | ✅ | ✅ 2 files | **MINIMAL** |

**Issues:**
- ⚠️ Many features have minimal implementations (just index.ts exports)
  <!-- COMMENT: 6 features are "MINIMAL" - alerts, budget, integrations, messaging, recommendations, translator -->
  <!-- TODO: [feature-implementation] Complete minimal feature implementations (prioritize by usage) -->
- ⚠️ `data/` layers often just export empty objects or stubs
  <!-- COMMENT: This blocks API refactoring. Need to implement actual data access using @platform/storage. -->
  <!-- TODO: [feature-data-layers] Implement feature data layers using @platform/storage -->
- ⚠️ Inconsistent implementation depth across features
  <!-- COMMENT: core/ has 21 domain files, contacts/ has 2. Need consistency. -->

**Example - Minimal Feature:**
```typescript
// packages/features/budget/data/index.ts (likely)
// COMMENT: This is a stub - needs actual implementation
export const budgetData = {
  // Empty or stub implementation
};
```

**Example - Complete Feature:**
```typescript
// packages/features/core/domain/index.ts
// COMMENT: This is the gold standard - comprehensive domain logic
export * from "./moduleRegistry";
export * from "./recommendationEngine";
export * from "./contextEngine";
// ... 9 exports
```

#### `packages/platform/` - **EXCELLENT**

**Strengths:**
- ✅ Comprehensive analytics system (53 files)
- ✅ Storage layer with database abstraction
- ✅ Well-tested (`__tests__/` directories)
- ✅ Proper separation of concerns
- ✅ Good documentation (`AGENT.md`)

**Structure:**
```
platform/
├── analytics/     → 53 files (comprehensive)
├── storage/       → Database abstraction
├── lib/           → 28 utility files
└── index.ts       → Clean exports
```

**Issues:**
- ⚠️ `packages/platform/storage/database.ts` is 5748 lines (too large)
  <!-- COMMENT: This is a code smell - file is too large to maintain. Should be split by feature/domain. -->
  <!-- TODO: [split-database] Split database.ts into smaller modules (users.ts, notes.ts, tasks.ts, etc.) -->
- ⚠️ Should be split into smaller modules
  <!-- COMMENT: Suggested structure: database.ts (connection), users.ts, notes.ts, tasks.ts, events.ts, etc. -->

#### `packages/design-system/` - **GOOD**

**Strengths:**
- ✅ Clean component structure
- ✅ Theme system (`ThemeContext`, `useTheme`)
- ✅ Has tests
- ✅ Proper exports

**Components:**
- `Button.tsx`, `Card.tsx`, `ThemedText.tsx`, `ThemedView.tsx`
- `HeaderTitle.tsx`, `Spacer.tsx`, `ScreenStateMessage.tsx`
- `KeyboardAwareScrollViewCompat.tsx`

**Issues:**
- ⚠️ Limited component set (8 components)
- ⚠️ Could expand with more primitives

#### `packages/contracts/` - **GOOD**

**Strengths:**
- ✅ Centralized type definitions
- ✅ Schema validation
- ✅ Shared constants
- ✅ Has tests

**Structure:**
```
contracts/
├── models/types.ts    → Type definitions
├── schema.ts          → Validation schemas
├── constants.ts       → Shared constants
└── meetingLinks.ts    → Domain-specific types
```

**Issues:**
- ⚠️ Path alias confusion: both `@shared` and `@contracts` point here
  <!-- COMMENT: Found in tsconfig.json and babel.config.js - both aliases point to packages/contracts/ -->
  <!-- TODO: [path-aliases] Remove @shared alias, standardize on @contracts -->
- ⚠️ Should standardize on `@contracts` only
  <!-- COMMENT: @contracts is more descriptive and follows naming convention better. -->

---

<!-- META: Backend Directory Analysis -->
### 2.3 `backend/` Directory - **CONFUSING**

<!-- COMMENT: This is the #1 architectural confusion. Django backend exists but is empty, while Node.js backend in apps/api/ is active. Need decision. -->

#### Structure
```
backend/
├── .agent-context.json  → Django context (mentions Django, FirmScopedMixin)
├── api/
│   └── clients/         → EMPTY
└── modules/
    ├── clients/         → EMPTY
    ├── core/            → EMPTY
    ├── crm/             → (not listed, assumed empty)
    ├── finance/         → (not listed, assumed empty)
    ├── firm/            → (not listed, assumed empty)
    └── projects/        → (not listed, assumed empty)
```

#### Critical Issues

**1. Architectural Confusion:**
- `.agent-context.json` describes Django backend with:
  - `FirmScopedMixin` (Django model pattern)
  - `ModelViewSet` (Django REST framework)
  - `serializers.ModelSerializer` (Django REST)
  - Mentions `makemigrations` (Django command)
  - References `backend/config/settings.py` (Django settings)

**2. Empty Directories:**
- All subdirectories are empty
- Suggests incomplete migration or abandoned approach

**3. Relationship to `apps/api/`:**
- **Unclear**: Is `backend/` legacy? Future? Alternative?
- Documentation doesn't explain the relationship
- `.agent-context.json` suggests active Django development

**4. Boundary Violations:**
- If Django backend exists, it should follow same boundary rules
- Should use `packages/contracts` for shared types
- Should use `packages/platform` for infrastructure

**Recommendation:**
- **DECIDE**: Django or Node.js? Can't have both.
  <!-- COMMENT: This is a critical decision that blocks all backend work. Need ADR. -->
  <!-- TODO: [backend-decision] Create ADR: Django vs Node.js backend decision -->
- If Django: Migrate `apps/api/` logic to Django, remove Node.js server
  <!-- COMMENT: Would require significant migration work. -->
- If Node.js: Remove `backend/` directory or clearly mark as legacy
  <!-- COMMENT: Easier path - just remove or add LEGACY.md marker. -->
- Update documentation to clarify
  <!-- COMMENT: Update apps/INDEX.md and backend/README.md to explain decision. -->

---

<!-- META: Frontend Directory Analysis -->
### 2.4 `frontend/` Directory - **INCOMPLETE**

<!-- COMMENT: Similar confusion to backend/ - empty directory with context file suggesting active development. -->

#### Structure
```
frontend/
├── .agent-context.json  → React/TypeScript context
└── src/
    ├── api/             → EMPTY
    └── components/      → EMPTY
```

#### Issues

**1. Empty Implementation:**
- `.agent-context.json` describes React/TypeScript frontend
- Mentions Vite, React Query, React Hook Form
- But `src/` directories are empty

**2. Relationship to `apps/web/`:**
- **Unclear**: Is `frontend/` legacy? Future? Alternative?
- `apps/web/` is also a placeholder
- Which one is the canonical web app?

**3. Context Mismatch:**
- `.agent-context.json` says "depends_on: ['backend/']"
- But `backend/` is Django, and `apps/api/` is Node.js
- Which backend should `frontend/` use?

**Recommendation:**
- **DECIDE**: `frontend/` or `apps/web/`?
  <!-- COMMENT: Both are placeholders. Need to decide which one to use. -->
  <!-- TODO: [web-app-decision] Decide: frontend/ or apps/web/? Then implement or remove. -->
- If `apps/web/`: Remove `frontend/` or mark as legacy
  <!-- COMMENT: Would align with apps/ structure better. -->
- If `frontend/`: Implement it or remove placeholder
  <!-- COMMENT: Would require moving it or implementing it. -->
- Update `.agent-context.json` to reflect actual dependencies
  <!-- COMMENT: Currently says "depends_on: ['backend/']" but should depend on apps/api/ if using Node.js. -->

---

<!-- META: Assets Directories Analysis -->
### 2.5 `assets/` and `attached_assets/` - **MINIMAL**

<!-- COMMENT: These directories appear to be working as intended - just asset storage. No issues here. -->

#### Structure
```
assets/
└── images/     → (not explored, assumed image assets)

attached_assets/
├── generated_images/
└── Pasted-You-are-building-the-initial-scaffold-for-a-mobile-app-_1768350922463.txt
```

**Status:** ✅ Appears to be working as intended (asset storage)

**Note:** The pasted text file contains the original project requirements/scaffold instructions.

---

### 2.6 `scripts/` Directory - **GOOD**

**Status:** ✅ Well-documented in `SCRIPTS.md`
- Clear purpose and boundaries
- References governance policies
- Follows best practices

---

<!-- META: File Interactions Analysis Section -->
## 3. File Interactions Analysis

<!-- COMMENT: This section analyzes how files and packages interact, identifying good and bad patterns. -->

### 3.1 Import Patterns

#### ✅ Good Patterns (Mobile App)
```typescript
// apps/mobile/App.tsx
import { queryClient } from "@platform/lib/query-client";
import { ErrorBoundary } from "@features/core/ui/components/ErrorBoundary";
import { ThemeProvider } from "@design-system/context/ThemeContext";
```
**Status:** ✅ Follows boundary rules correctly

#### ❌ Bad Patterns (API Server)
```typescript
// apps/api/routes.ts
import { storage } from "./storage";  // Local implementation
// Should import from @platform/storage or @features/*/data
```
**Status:** ❌ Violates boundary rules

### 3.2 Path Alias Inconsistency

**Problem:** Two aliases for the same package:
```json
// tsconfig.json & babel.config.js
"@shared/*": ["./packages/contracts/*"],
"@contracts/*": ["./packages/contracts/*"],
```

**Usage:**
- `apps/api/` uses `@shared/schema` ❌
- Should use `@contracts/schema` ✅

**Recommendation:**
- Remove `@shared` alias
  <!-- COMMENT: Remove from tsconfig.json and babel.config.js -->
- Standardize on `@contracts`
  <!-- COMMENT: More descriptive and follows naming convention -->
- Update all imports
  <!-- COMMENT: Found 3 files using @shared: apps/api/storage.ts, apps/api/routes.ts, apps/api/__tests__/messages.quickwins.e2e.test.ts -->
  <!-- TODO: [path-aliases] Update all @shared imports to @contracts -->

### 3.3 Cross-Package Dependencies

<!-- COMMENT: This section checks if boundary rules are being followed in cross-package imports. -->

**Good Example:**
```typescript
// packages/features/core/domain/recommendationEngine.ts
import { Recommendation, Note, Task } from "@contracts/models/types";
import { generateId } from "@platform/lib/helpers";
import { db } from "@platform/storage/database";
```
**Status:** ✅ Follows boundaries (domain → contracts, platform)

**Bad Example:**
```typescript
// If any feature/ui imports from data/ or platform directly
// This would violate: ui → data, platform (forbidden)
```
**Status:** ✅ No violations found in codebase

---

<!-- META: Code Quality Issues Section -->
## 4. Code Quality Issues

<!-- COMMENT: This section identifies code quality issues across the codebase. -->

### 4.1 Type Safety

**Strengths:**
- ✅ TypeScript used throughout
- ✅ `strict: true` in tsconfig.json
- ✅ Type definitions in `@contracts`

**Issues:**
- ⚠️ `apps/api/routes.ts` uses `as any` in validation:
  ```typescript
  validate(insertNoteSchema as any)  // Type assertion needed?
  ```
  <!-- COMMENT: Found multiple instances: lines 51, 201, 215, 268, 282, etc. This suggests type mismatch between Zod schemas and Express types. Should fix the type definitions instead of using `as any`. -->
  <!-- TODO: [type-safety] Fix type definitions to eliminate `as any` assertions in routes.ts -->

### 4.2 Error Handling

**Strengths:**
- ✅ Custom error handler middleware
- ✅ `asyncHandler` wrapper for async routes
- ✅ `AppError` class for structured errors

**Issues:**
- ⚠️ Some routes may not handle all error cases
- ⚠️ Translation endpoint has basic error handling

### 4.3 Testing

**Coverage:**
- ✅ `apps/mobile/__tests__/` - 4 test files
- ✅ `apps/api/__tests__/` - 5 test files
- ✅ `packages/design-system/__tests__/` - 2 test files
- ✅ `packages/platform/__tests__/` - Multiple test files
- ✅ `packages/contracts/__tests__/` - 1 test file

**Issues:**
- ⚠️ Many features lack tests
- ⚠️ No integration tests for API + features
- ⚠️ No E2E tests (mentioned in docs but not found)

### 4.4 Code Organization

**Strengths:**
- ✅ Clear folder structure
- ✅ Consistent naming conventions
- ✅ Good separation of concerns (where implemented)

**Issues:**
- ❌ `packages/platform/storage/database.ts` is 5748 lines (too large)
  <!-- COMMENT: This is a maintainability issue. Should be split into feature-specific modules. -->
- ⚠️ Some features have minimal implementations
  <!-- COMMENT: Already covered in section 2.2 -->
- ⚠️ Inconsistent depth across features
  <!-- COMMENT: core/ has 21 domain files, others have 1-2. Need consistency. -->

---

<!-- META: Missing Pieces & Gaps Section -->
## 5. Missing Pieces & Gaps

<!-- COMMENT: This section identifies what's missing from the codebase - gaps that need to be filled. -->

### 5.1 Critical Missing Components

1. **Database Integration**
   - `apps/api/` uses in-memory storage
   - `packages/platform/storage/database.ts` exists but not used by API
   - No migration strategy documented

2. **Feature Data Layers**
   - Many `packages/features/*/data/index.ts` are stubs
   - Should implement actual data access using `@platform/storage`

3. **Web Application**
   - `apps/web/` is placeholder
   - `frontend/` is empty
   - No clear plan for web app

4. **Backend Clarity**
   - `backend/` (Django) vs `apps/api/` (Node.js) confusion
   - Need decision and migration plan

### 5.2 Documentation Gaps

1. **Architecture Decision Records (ADRs)**
   - No ADRs explaining Django vs Node.js choice
   - No ADRs for monorepo structure decisions

2. **Migration Guides**
   - No guide for moving from in-memory to database
   - No guide for feature implementation

3. **Development Workflow**
   - Missing: How to add a new feature
   - Missing: How to test features
   - Missing: How to deploy

### 5.3 Integration Gaps

1. **API → Features Integration**
   - `apps/api/` doesn't use `packages/features/*/data`
   - Should refactor routes to use feature data layers

2. **Storage Integration**
   - `packages/platform/storage` not used by `apps/api/`
   - Should migrate `apps/api/storage.ts` to use platform storage

3. **Contract Usage**
   - `apps/api/` uses `@shared` instead of `@contracts`
   - Should standardize on `@contracts`

---

<!-- META: Improvements Needed Section -->
## 6. Improvements Needed (Prioritized)

<!-- COMMENT: This section provides prioritized, actionable improvements with specific todos. -->

### 🔴 CRITICAL (Do First)

<!-- COMMENT: These are blockers that must be addressed immediately. -->

#### 1. Resolve Backend Architecture Confusion
**Problem:** Two backend systems (Django `backend/` and Node.js `apps/api/`)
**Impact:** High - blocks development, causes confusion
**Solution:**
- **Option A:** Remove `backend/` if Django is abandoned
  <!-- COMMENT: Easiest path if Node.js is the choice. -->
- **Option B:** Migrate `apps/api/` to Django if Django is the choice
  <!-- COMMENT: Would require significant migration work - 42+ endpoints, middleware, etc. -->
- **Option C:** Clearly document that `backend/` is legacy/future
  <!-- COMMENT: If keeping both, need clear documentation explaining why. -->
- **Action:** Create ADR documenting decision
  <!-- TODO: [backend-decision] Create ADR: Django vs Node.js backend decision -->

#### 2. Fix API Server Boundary Violations
**Problem:** `apps/api/` implements business logic instead of mounting from packages
**Impact:** High - violates architecture, creates technical debt
**Solution:**
```typescript
// BEFORE (apps/api/routes.ts)
// COMMENT: Violates boundary rule: apps should NOT implement business logic
import { storage } from "./storage";
app.post("/api/notes", async (req, res) => {
  const note = await storage.createNote({ ... });
});

// AFTER
// COMMENT: Correct pattern: apps only wire routes to feature data layers
import { notes } from "@features/notes/data";
app.post("/api/notes", async (req, res) => {
  const note = await notes.create({ ... });
});
```
**Action:** Refactor all routes to use feature data layers
<!-- TODO: [api-refactor] Refactor all 42+ routes in apps/api/routes.ts to use feature data layers -->
<!-- COMMENT: This is a large refactoring. Should be done incrementally, starting with one feature (e.g., notes) as a proof of concept. -->

#### 3. Standardize Path Aliases
**Problem:** Both `@shared` and `@contracts` point to same package
**Impact:** Medium - causes confusion, inconsistent imports
**Solution:**
- Remove `@shared` alias from `tsconfig.json` and `babel.config.js`
  <!-- COMMENT: Simple find-and-replace in config files. -->
- Update all imports from `@shared/*` to `@contracts/*`
  <!-- COMMENT: Found 3 files: apps/api/storage.ts, apps/api/routes.ts, apps/api/__tests__/messages.quickwins.e2e.test.ts -->
- Update `apps/api/` imports
  <!-- TODO: [path-aliases] Remove @shared alias and update all imports to @contracts -->

#### 4. Implement Feature Data Layers
**Problem:** Many feature `data/` layers are stubs
**Impact:** High - blocks API refactoring
**Solution:**
- Implement `packages/features/*/data/index.ts` for each feature
  <!-- COMMENT: Start with core features: notes, tasks, events, projects. Then expand to others. -->
- Use `@platform/storage` for database access
  <!-- COMMENT: Should use @platform/storage/database.ts, not in-memory storage. -->
- Export clean API for each feature
  <!-- COMMENT: Each feature should export: create, read, update, delete, list methods. -->
<!-- TODO: [feature-data-layers] Implement feature data layers using @platform/storage -->
<!-- COMMENT: This is a prerequisite for API refactoring. Can't refactor routes until data layers exist. -->

### 🟡 HIGH PRIORITY (Do Soon)

<!-- COMMENT: These are important but not blockers. Should be done soon to avoid technical debt. -->

#### 5. Resolve Frontend/Web App Confusion
**Problem:** Both `frontend/` and `apps/web/` exist, both incomplete
**Impact:** Medium - blocks web development
**Solution:**
- Decide: `frontend/` or `apps/web/`?
- Remove/archive the other
- Implement the chosen one

#### 6. Integrate Database Storage
**Problem:** `apps/api/` uses in-memory storage, `packages/platform/storage` exists but unused
**Impact:** High - data loss on restart, no persistence
  <!-- COMMENT: This is actually critical for production, but marked as high priority because it's not a blocker for development. -->
**Solution:**
- Migrate `apps/api/storage.ts` to use `@platform/storage/database`
  <!-- COMMENT: database.ts exists but is 5748 lines. May need to refactor it first. -->
- Implement database migrations
  <!-- COMMENT: Need migration strategy for moving from in-memory to database. -->
- Update feature data layers to use database
  <!-- COMMENT: Feature data layers should use database, not in-memory storage. -->
<!-- TODO: [database-integration] Migrate apps/api/storage.ts to use @platform/storage/database -->

#### 7. Split Large Files
**Problem:** `packages/platform/storage/database.ts` is 5748 lines
**Impact:** Medium - maintainability issues
  <!-- COMMENT: File is too large to maintain effectively. Hard to navigate, test, and understand. -->
**Solution:**
- Split into smaller modules (e.g., `users.ts`, `notes.ts`, `tasks.ts`)
  <!-- COMMENT: Suggested structure: database.ts (connection), users.ts, notes.ts, tasks.ts, events.ts, projects.ts, conversations.ts, messages.ts, analytics.ts -->
- Keep `database.ts` as main export/connection file
  <!-- COMMENT: database.ts should only handle connection and re-export from feature modules. -->
<!-- TODO: [split-database] Split database.ts into smaller modules by feature/domain -->

### 🟢 MEDIUM PRIORITY (Do When Time Permits)

<!-- COMMENT: These are nice-to-haves that improve quality but aren't blockers. -->

#### 8. Complete Feature Implementations
**Problem:** Many features have minimal implementations
**Impact:** Medium - incomplete functionality
**Solution:**
- Prioritize features by usage
- Implement domain logic for each
- Add UI components where missing

#### 9. Expand Design System
**Problem:** Only 8 components in design system
**Impact:** Low - limits UI consistency
**Solution:**
- Add common components (Input, Select, Modal, etc.)
- Document component usage
- Add Storybook or similar

#### 10. Improve Test Coverage
**Problem:** Many features lack tests
**Impact:** Medium - risk of regressions
**Solution:**
- Add unit tests for feature domain logic
- Add integration tests for API + features
- Add E2E tests for critical flows

#### 11. Add Development Documentation
**Problem:** Missing guides for common tasks
**Impact:** Low - slows onboarding
**Solution:**
- "How to Add a New Feature" guide
- "How to Test Features" guide
- "How to Deploy" guide

---

<!-- META: Positive Aspects Section -->
## 7. Positive Aspects (Keep Doing)

<!-- COMMENT: It's important to recognize what's working well so we don't break it while fixing issues. -->

### ✅ Excellent Architecture Foundation
- Clear boundary rules
- Well-documented policies
- Good monorepo structure

### ✅ Strong Governance
- `.repo/` directory with policies
- Agent rules and context files
- Quality gates and checks

### ✅ Good Code Organization
- Consistent folder structure
- Clear separation of concerns (where implemented)
- TypeScript throughout

### ✅ Comprehensive Platform Layer
- Excellent analytics system
- Good storage abstraction
- Useful utility libraries

### ✅ Mobile App Implementation
- Well-structured React Native app
- Proper use of packages
- Good navigation setup

---

<!-- META: Recommendations Summary Section -->
## 8. Recommendations Summary

<!-- COMMENT: This section provides a prioritized action plan based on the analysis. -->

### Immediate Actions (This Week)

<!-- COMMENT: These should be done first to unblock development. -->
1. ✅ Create ADR: Django vs Node.js backend decision
2. ✅ Remove or archive `backend/` if not using Django
3. ✅ Standardize on `@contracts` alias (remove `@shared`)
4. ✅ Update `apps/api/` imports to use `@contracts`

### Short-Term (This Month)
5. ✅ Refactor `apps/api/routes.ts` to use feature data layers
6. ✅ Implement feature data layers (start with core features)
7. ✅ Integrate database storage into API
8. ✅ Resolve `frontend/` vs `apps/web/` decision

### Medium-Term (Next Quarter)
9. ✅ Complete feature implementations
10. ✅ Expand design system
11. ✅ Improve test coverage
12. ✅ Add development documentation

---

<!-- META: Risk Assessment Section -->
## 9. Risk Assessment

<!-- COMMENT: This section categorizes risks by severity to help prioritize work. -->

### High Risk
- **Architectural Confusion**: Two backend systems create confusion and technical debt
- **Boundary Violations**: API server doesn't follow architecture rules
- **Data Loss**: In-memory storage means data lost on restart

### Medium Risk
- **Incomplete Features**: Many features are stubs, limiting functionality
- **Test Coverage**: Missing tests increase regression risk
- **Documentation**: Missing guides slow development

### Low Risk
- **Design System**: Limited but functional
- **Path Aliases**: Confusing but not blocking
- **Empty Directories**: Cleanup needed but not urgent

---

<!-- META: Conclusion Section -->
## 10. Conclusion

<!-- COMMENT: Final summary and next steps. -->

The AIOS project has a **strong architectural foundation** with clear boundary rules and good governance. However, there are **critical issues** that need immediate attention:

1. **Backend architecture confusion** must be resolved
2. **API server boundary violations** must be fixed
3. **Feature data layers** must be implemented
4. **Database integration** must be completed

The project is in a **transitional state** - the architecture is defined but not fully implemented. With focused effort on the critical issues, the project can achieve its architectural goals.

**Overall Grade: B-**
- Architecture: A (well-designed)
- Implementation: C (incomplete)
- Code Quality: B (good where complete)
- Documentation: B (good policies, missing guides)

---

**Next Steps:**
1. Review this analysis with team
   <!-- COMMENT: Get team alignment on findings and priorities. -->
2. Prioritize critical issues
   <!-- COMMENT: Focus on 🔴 CRITICAL items first. -->
3. Create action plan
   <!-- COMMENT: Break down critical issues into specific tasks with owners and timelines. -->
4. Begin implementation
   <!-- COMMENT: Start with backend decision ADR, then path aliases, then feature data layers. -->

<!-- COMMENT: End of analysis. All inline commentary and todos have been added throughout the document. -->

---

<!-- META: Multi-Lens Analysis Section -->
## 11. Multi-Lens Analysis

<!-- COMMENT: This section analyzes the codebase from multiple perspectives to provide comprehensive insights. Each lens focuses on a different aspect of the system. -->

---

<!-- META: Security Lens Analysis -->
## 11.1 Security Lens Analysis

<!-- COMMENT: Security is critical for any production application. This lens examines authentication, authorization, input validation, data protection, and vulnerability management. -->

### Authentication & Authorization

**Current Implementation:**
```typescript
// apps/api/middleware/auth.ts
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";
```
<!-- COMMENT: JWT_SECRET has a default value - this is a security risk if deployed without environment variable. -->
<!-- TODO: [security-jwt-secret] Remove default JWT_SECRET, require environment variable -->
<!-- COMMENT: 7-day token expiry is reasonable but could be shorter for access tokens. Consider refresh token pattern. -->

**Strengths:**
- ✅ JWT-based authentication implemented
- ✅ Password hashing with bcryptjs (10 rounds)
- ✅ User isolation in queries (userId filtering)
- ✅ Bearer token authentication pattern

**Critical Security Issues:**
- ❌ **Default JWT_SECRET in code** (line 5-6 in auth.ts)
  <!-- COMMENT: If JWT_SECRET env var is not set, uses insecure default. Production deployments could be vulnerable. -->
  <!-- TODO: [security-jwt-secret] Fail fast if JWT_SECRET not set in production -->
- ❌ **No rate limiting on auth endpoints**
  <!-- COMMENT: `/api/auth/login` and `/api/auth/register` have no rate limiting. Vulnerable to brute force attacks. -->
  <!-- TODO: [security-rate-limiting] Add rate limiting to authentication endpoints -->
- ⚠️ **JWT tokens never invalidated**
  <!-- COMMENT: Logout endpoint (line 142 in routes.ts) just returns success but doesn't blacklist token. Tokens valid until expiry. -->
  <!-- TODO: [security-token-blacklist] Implement JWT blacklist for logout functionality -->
- ⚠️ **No token refresh mechanism**
  <!-- COMMENT: Single 7-day token. Should use short-lived access tokens + long-lived refresh tokens. -->
  <!-- TODO: [security-refresh-tokens] Implement refresh token pattern for better security -->

### Input Validation

**Current Implementation:**
```typescript
// apps/api/routes.ts
validate(insertNoteSchema as any)  // Multiple instances
```
<!-- COMMENT: Uses Zod schemas for validation, which is good. But `as any` type assertions suggest type mismatches. -->

**Strengths:**
- ✅ Zod schema validation on all POST/PUT endpoints
- ✅ UUID validation for path parameters
- ✅ Query parameter validation available
- ✅ User-friendly error messages via zod-validation-error

**Issues:**
- ⚠️ **Type assertions (`as any`) in validation**
  <!-- COMMENT: Found in routes.ts lines 51, 201, 215, 268, 282, etc. Suggests type definitions need fixing. -->
  <!-- TODO: [security-type-safety] Fix type definitions to eliminate `as any` in validation -->
- ⚠️ **No input length limits**
  <!-- COMMENT: Zod schemas validate format but may not limit length. Could allow DoS via large payloads. -->
  <!-- TODO: [security-input-limits] Add max length validation to all string fields -->
- ⚠️ **No request size limits**
  <!-- COMMENT: Express doesn't have explicit body size limits configured. Could allow memory exhaustion attacks. -->
  <!-- TODO: [security-request-limits] Add express.json({ limit: '10mb' }) to prevent large payload attacks -->

### Data Protection

**Current State:**
- ✅ Passwords hashed with bcryptjs (10 rounds)
- ✅ No passwords in logs (checked errorHandler.ts)
- ✅ User data isolated by userId
- ❌ **In-memory storage** - data lost on restart, no encryption at rest
  <!-- COMMENT: apps/api/storage.ts uses in-memory storage. No persistence, no encryption. -->
  <!-- TODO: [security-data-encryption] Implement database with encryption at rest -->
- ⚠️ **No HTTPS enforcement**
  <!-- COMMENT: CORS configured but no explicit HTTPS requirement. Should enforce in production. -->
  <!-- TODO: [security-https-enforcement] Add HTTPS redirect middleware for production -->

### Dependency Security

**Current State:**
```json
// package.json shows dependencies
"bcryptjs": "^3.0.3",
"jsonwebtoken": "^9.0.3",
"express": "^5.2.1",
```
<!-- COMMENT: Dependencies appear up-to-date. Need to verify with npm audit. -->

**Issues:**
- ⚠️ **No automated dependency scanning**
  <!-- COMMENT: No evidence of Dependabot, Snyk, or automated npm audit in CI/CD. -->
  <!-- TODO: [security-dependency-scanning] Add automated dependency vulnerability scanning to CI/CD -->
- ⚠️ **No dependency update policy documented**
  <!-- COMMENT: docs/security/dependency_policy.md exists but may not be enforced. -->
  <!-- TODO: [security-dependency-policy] Enforce dependency update policy in CI/CD -->

### Security Documentation

**Strengths:**
- ✅ Comprehensive security docs in `docs/security/`
- ✅ Threat model documented
- ✅ Security baseline policy exists

**Gaps:**
- ⚠️ **No security incident response plan**
  <!-- COMMENT: docs/security/threat_model.md mentions incident response but no detailed plan. -->
  <!-- TODO: [security-incident-response] Create detailed incident response runbook -->

---

<!-- META: Performance Lens Analysis -->
## 11.2 Performance Lens Analysis

<!-- COMMENT: Performance affects user experience and operational costs. This lens examines response times, resource usage, scalability, and optimization opportunities. -->

### API Performance

**Current Implementation:**
```typescript
// apps/api/index.ts - Request logging
const duration = Date.now() - start;
logger.info("API request", { duration: `${duration}ms` });
```
<!-- COMMENT: Request duration is logged but not monitored or alerted on. No performance SLAs defined. -->

**Issues:**
- ❌ **In-memory storage** - no persistence, but also no I/O overhead
  <!-- COMMENT: Current in-memory storage is fast but doesn't scale. Database will add latency. -->
  <!-- TODO: [performance-database-optimization] Design database queries for performance (indexes, connection pooling) -->
- ⚠️ **No response caching**
  <!-- COMMENT: No caching layer for frequently accessed data (e.g., user settings, recommendations). -->
  <!-- TODO: [performance-caching] Add Redis or in-memory cache for frequently accessed data -->
- ⚠️ **No request batching**
  <!-- COMMENT: Multiple API calls required for related data. Could batch requests. -->
  <!-- TODO: [performance-batching] Add GraphQL or batch endpoint for related data -->
- ⚠️ **No pagination on list endpoints**
  <!-- COMMENT: `/api/notes`, `/api/tasks`, etc. return all records. Could be slow with large datasets. -->
  <!-- TODO: [performance-pagination] Add pagination to all list endpoints -->

### Mobile App Performance

**Current State:**
- ✅ React Query for data fetching (caching built-in)
- ✅ Lazy loading mentioned in docs
- ⚠️ **No performance monitoring**
  <!-- COMMENT: No evidence of performance tracking (e.g., React Native Performance Monitor). -->
  <!-- TODO: [performance-mobile-monitoring] Add performance monitoring to mobile app -->
- ⚠️ **Large bundle size potential**
  <!-- COMMENT: Many packages in package.json. No bundle size analysis visible. -->
  <!-- TODO: [performance-bundle-analysis] Add bundle size analysis and budgets -->

### Database Performance

**Current State:**
- ⚠️ **database.ts is 5748 lines** - potential performance issues
  <!-- COMMENT: Large file suggests complex queries. Need to analyze query performance. -->
  <!-- TODO: [performance-query-analysis] Analyze and optimize database queries -->
- ⚠️ **No connection pooling configured**
  <!-- COMMENT: If using PostgreSQL, need connection pooling (e.g., pg-pool). -->
  <!-- TODO: [performance-connection-pooling] Configure database connection pooling -->
- ⚠️ **No query optimization**
  <!-- COMMENT: No evidence of indexes, query plans, or optimization. -->
  <!-- TODO: [performance-database-indexes] Add database indexes for frequently queried fields -->

---

<!-- META: Dependency Management Lens -->
## 11.3 Dependency Management Lens

<!-- COMMENT: Dependencies are a critical part of the codebase. This lens examines dependency health, security, versioning, and management practices. -->

### Dependency Analysis

**Total Dependencies:**
- Production: ~50 dependencies
- Development: ~20 devDependencies

**Key Dependencies:**
```json
// package.json highlights
"react": "19.1.0",           // COMMENT: Very new version, may have compatibility issues
"react-native": "0.83.1",    // COMMENT: Latest version
"expo": "^54.0.31",          // COMMENT: Expo SDK 54
"express": "^5.2.1",         // COMMENT: Express 5 is relatively new
"@tanstack/react-query": "^5.90.19",  // COMMENT: Well-maintained
"drizzle-orm": "^0.45.1",    // COMMENT: Modern ORM
```

**Issues:**
- ⚠️ **React 19.1.0 is very new**
  <!-- COMMENT: Released recently. May have breaking changes or compatibility issues with React Native. -->
  <!-- TODO: [deps-react-version] Verify React 19 compatibility with React Native 0.83 -->
- ⚠️ **Express 5.2.1 is relatively new**
  <!-- COMMENT: Express 5 has breaking changes from v4. Need to verify compatibility. -->
  <!-- TODO: [deps-express-version] Review Express 5 migration guide and verify compatibility -->
- ⚠️ **No lock file versioning strategy**
  <!-- COMMENT: package-lock.json exists but no strategy for updates documented. -->
  <!-- TODO: [deps-update-strategy] Document dependency update strategy and schedule -->
- ⚠️ **No dependency audit automation**
  <!-- COMMENT: No evidence of automated npm audit in CI/CD. -->
  <!-- TODO: [deps-audit-automation] Add npm audit to CI/CD pipeline -->

### Dependency Health

**Strengths:**
- ✅ Most dependencies are actively maintained
- ✅ Using modern, well-supported packages
- ✅ TypeScript types available for most packages

**Risks:**
- ⚠️ **Potential breaking changes**
  <!-- COMMENT: New versions of React, Express may have breaking changes. -->
  <!-- TODO: [deps-breaking-changes] Review changelogs for React 19 and Express 5 -->
- ⚠️ **No dependency pinning strategy**
  <!-- COMMENT: Some dependencies use ^ (caret) which allows minor updates. Could introduce breaking changes. -->
  <!-- TODO: [deps-pinning-strategy] Consider pinning critical dependencies -->

---

<!-- META: Error Handling & Resilience Lens -->
## 11.4 Error Handling & Resilience Lens

<!-- COMMENT: Error handling and resilience are critical for production systems. This lens examines error handling patterns, recovery mechanisms, and system resilience. -->

### Error Handling Patterns

**Current Implementation:**
```typescript
// apps/api/middleware/errorHandler.ts
export class AppError extends Error {
  constructor(public statusCode: number, public message: string) {}
}

export const errorHandler = (err: Error | AppError, req, res, next) => {
  if (err instanceof AppError) {
    logger.warn("Operational error", { statusCode, message, path, method });
    return res.status(err.statusCode).json({ status: "error", message });
  }
  // Unexpected errors
  logger.error("Unexpected error", { error: err, stack: err.stack });
  return res.status(500).json({ status: "error", message: "Internal server error" });
};
```
<!-- COMMENT: Good error handling pattern. Distinguishes operational vs unexpected errors. -->

**Strengths:**
- ✅ Custom AppError class for operational errors
- ✅ Structured error logging
- ✅ No sensitive data leakage in responses
- ✅ asyncHandler wrapper for promise rejections

**Issues:**
- ⚠️ **No error recovery mechanisms**
  <!-- COMMENT: Errors are logged but no retry logic, circuit breakers, or fallback mechanisms. -->
  <!-- TODO: [resilience-retry-logic] Add retry logic for transient failures -->
- ⚠️ **No error alerting**
  <!-- COMMENT: Errors are logged but no alerting system (e.g., Sentry, PagerDuty). -->
  <!-- TODO: [resilience-error-alerting] Integrate error alerting system (e.g., Sentry) -->
- ⚠️ **No graceful degradation**
  <!-- COMMENT: If database fails, entire API fails. No fallback to cached data. -->
  <!-- TODO: [resilience-graceful-degradation] Implement fallback mechanisms for critical failures -->
- ⚠️ **No health check endpoint**
  <!-- COMMENT: `/status` endpoint exists but doesn't check database connectivity. -->
  <!-- TODO: [resilience-health-checks] Add comprehensive health check endpoint -->

### Resilience Patterns

**Missing:**
- ❌ **No circuit breakers**
  <!-- COMMENT: No protection against cascading failures. -->
  <!-- TODO: [resilience-circuit-breakers] Implement circuit breaker pattern for external services -->
- ❌ **No rate limiting**
  <!-- COMMENT: No protection against API abuse or DoS attacks. -->
  <!-- TODO: [resilience-rate-limiting] Add rate limiting middleware -->
- ❌ **No request timeout**
  <!-- COMMENT: Long-running requests could hang indefinitely. -->
  <!-- TODO: [resilience-timeouts] Add request timeout middleware -->

---

<!-- META: API Design Lens -->
## 11.5 API Design Lens

<!-- COMMENT: API design affects developer experience and system maintainability. This lens examines REST API design, versioning, documentation, and consistency. -->

### REST API Design

**Current Implementation:**
```typescript
// apps/api/routes.ts - 42+ endpoints
app.get("/api/notes", authenticate, ...);
app.post("/api/notes", authenticate, ...);
app.put("/api/notes/:id", authenticate, ...);
app.delete("/api/notes/:id", authenticate, ...);
```
<!-- COMMENT: Standard REST patterns. Good consistency across resources. -->

**Strengths:**
- ✅ Consistent REST patterns (GET, POST, PUT, DELETE)
- ✅ Resource-based URLs (`/api/notes`, `/api/tasks`)
- ✅ Proper HTTP status codes
- ✅ Authentication on all data endpoints

**Issues:**
- ⚠️ **No API versioning**
  <!-- COMMENT: URLs are `/api/notes` not `/api/v1/notes`. Future changes will break clients. -->
  <!-- TODO: [api-versioning] Add API versioning (e.g., /api/v1/notes) -->
- ⚠️ **No API documentation**
  <!-- COMMENT: No OpenAPI/Swagger spec visible. -->
  <!-- TODO: [api-documentation] Generate OpenAPI/Swagger documentation -->
- ⚠️ **Inconsistent error responses**
  <!-- COMMENT: Some endpoints may return different error formats. -->
  <!-- TODO: [api-error-consistency] Standardize error response format across all endpoints -->
- ⚠️ **No pagination**
  <!-- COMMENT: List endpoints return all records. No limit/offset or cursor-based pagination. -->
  <!-- TODO: [api-pagination] Add pagination to all list endpoints -->
- ⚠️ **No filtering/sorting**
  <!-- COMMENT: List endpoints don't support query parameters for filtering or sorting. -->
  <!-- TODO: [api-filtering] Add query parameters for filtering and sorting -->

### API Consistency

**Issues:**
- ⚠️ **Mixed response formats**
  <!-- COMMENT: Some endpoints return `{ data: [...] }`, others return array directly. -->
  <!-- TODO: [api-response-format] Standardize response format (wrapper object vs direct array) -->
- ⚠️ **No HATEOAS links**
  <!-- COMMENT: Responses don't include links to related resources. -->
  <!-- TODO: [api-hateoas] Add HATEOAS links to API responses (optional, nice-to-have) -->

---

<!-- META: Testing & Quality Assurance Lens -->
## 11.6 Testing & Quality Assurance Lens

<!-- COMMENT: Testing ensures code quality and prevents regressions. This lens examines test coverage, test types, and quality assurance practices. -->

### Test Coverage

**Current State:**
- ✅ `apps/mobile/__tests__/` - 4 test files
- ✅ `apps/api/__tests__/` - 5 test files
- ✅ `packages/design-system/__tests__/` - 2 test files
- ✅ `packages/platform/__tests__/` - Multiple test files
- ✅ `packages/contracts/__tests__/` - 1 test file

**Issues:**
- ⚠️ **No coverage metrics visible**
  <!-- COMMENT: No evidence of coverage reports or thresholds. -->
  <!-- TODO: [testing-coverage-metrics] Add test coverage reporting and enforce thresholds -->
- ⚠️ **Many features lack tests**
  <!-- COMMENT: 6 minimal features likely have no tests. -->
  <!-- TODO: [testing-feature-coverage] Add tests for all feature modules -->
- ⚠️ **No integration tests**
  <!-- COMMENT: Tests appear to be unit tests only. No API + database integration tests. -->
  <!-- TODO: [testing-integration] Add integration tests for API endpoints -->
- ⚠️ **No E2E tests**
  <!-- COMMENT: No end-to-end tests for critical user flows. -->
  <!-- TODO: [testing-e2e] Add E2E tests for critical user flows -->

### Test Quality

**Issues:**
- ⚠️ **No test data factories**
  <!-- COMMENT: Test data creation may be duplicated across tests. -->
  <!-- TODO: [testing-factories] Create test data factories for consistent test data -->
- ⚠️ **No test utilities**
  <!-- COMMENT: Common test patterns (e.g., authenticated requests) may be duplicated. -->
  <!-- TODO: [testing-utilities] Create test utilities for common patterns -->

---

<!-- META: Build & Deployment Lens -->
## 11.7 Build & Deployment Lens

<!-- COMMENT: Build and deployment processes affect development velocity and production reliability. This lens examines build configuration, CI/CD, and deployment practices. -->

### Build Configuration

**Current State:**
```json
// package.json scripts
"server:build": "esbuild apps/api/index.ts --platform=node ...",
"expo:static:build": "node scripts/build.js",
```
<!-- COMMENT: Build scripts exist but may not be optimized. -->

**Issues:**
- ⚠️ **No build optimization**
  <!-- COMMENT: esbuild config may not be optimized for production. -->
  <!-- TODO: [build-optimization] Optimize build configuration for production -->
- ⚠️ **No build caching**
  <!-- COMMENT: No evidence of build caching (e.g., Turborepo, Nx). -->
  <!-- TODO: [build-caching] Add build caching to speed up CI/CD -->
- ⚠️ **No build size analysis**
  <!-- COMMENT: No bundle size analysis or budgets. -->
  <!-- TODO: [build-size-analysis] Add bundle size analysis and budgets -->

### CI/CD

**Issues:**
- ⚠️ **No CI/CD configuration visible**
  <!-- COMMENT: No .github/workflows/ or CI config files found. -->
  <!-- TODO: [ci-cd-setup] Set up CI/CD pipeline (GitHub Actions, GitLab CI, etc.) -->
- ⚠️ **No automated testing in CI**
  <!-- COMMENT: Tests exist but may not run automatically. -->
  <!-- TODO: [ci-cd-testing] Add automated test execution to CI/CD -->
- ⚠️ **No automated deployment**
  <!-- COMMENT: No evidence of automated deployment pipeline. -->
  <!-- TODO: [ci-cd-deployment] Set up automated deployment pipeline -->

---

<!-- META: Maintainability & Technical Debt Lens -->
## 11.8 Maintainability & Technical Debt Lens

<!-- COMMENT: Maintainability affects long-term development velocity. This lens examines code organization, technical debt, and maintainability metrics. -->

### Code Organization

**Strengths:**
- ✅ Clear folder structure
- ✅ Consistent naming conventions
- ✅ TypeScript throughout
- ✅ Good separation of concerns (where implemented)

**Issues:**
- ❌ **Large files**
  <!-- COMMENT: database.ts (5748 lines), routes.ts (722 lines) are too large. -->
  <!-- TODO: [maintainability-split-files] Split large files into smaller modules -->
- ⚠️ **Inconsistent implementation depth**
  <!-- COMMENT: core/ has 21 domain files, others have 1-2. -->
  <!-- TODO: [maintainability-consistency] Standardize implementation depth across features -->
- ⚠️ **No code metrics**
  <!-- COMMENT: No cyclomatic complexity, code duplication metrics. -->
  <!-- TODO: [maintainability-metrics] Add code quality metrics (complexity, duplication) -->

### Technical Debt

**Identified Debt:**
1. **Architectural violations** - API implements business logic
   <!-- TODO: [debt-api-refactor] Refactor API to use feature data layers -->
2. **In-memory storage** - needs database migration
   <!-- TODO: [debt-database-migration] Migrate from in-memory to database -->
3. **Path alias inconsistency** - @shared vs @contracts
   <!-- TODO: [debt-path-aliases] Standardize path aliases -->
4. **Empty directories** - backend/, frontend/ confusion
   <!-- TODO: [debt-cleanup-directories] Clean up or document empty directories -->
5. **Type assertions** - `as any` in validation
   <!-- TODO: [debt-type-safety] Fix type definitions to eliminate `as any` -->

---

<!-- META: Scalability Lens -->
## 11.9 Scalability Lens

<!-- COMMENT: Scalability ensures the system can handle growth. This lens examines horizontal scaling, database scaling, and performance under load. -->

### Horizontal Scaling

**Current State:**
- ⚠️ **Stateless API** - ✅ Good for scaling
  <!-- COMMENT: JWT-based auth is stateless, good for horizontal scaling. -->
- ❌ **In-memory storage** - ❌ Doesn't scale
  <!-- COMMENT: In-memory storage can't be shared across instances. -->
  <!-- TODO: [scalability-database] Migrate to shared database for horizontal scaling -->
- ⚠️ **No load balancing configuration**
  <!-- COMMENT: No evidence of load balancer configuration. -->
  <!-- TODO: [scalability-load-balancing] Document load balancing requirements -->

### Database Scaling

**Issues:**
- ⚠️ **No database sharding strategy**
  <!-- COMMENT: No strategy for scaling database beyond single instance. -->
  <!-- TODO: [scalability-database-sharding] Design database sharding strategy (if needed) -->
- ⚠️ **No read replicas**
  <!-- COMMENT: No read replica configuration for scaling reads. -->
  <!-- TODO: [scalability-read-replicas] Design read replica strategy -->

---

<!-- META: Developer Experience Lens -->
## 11.10 Developer Experience Lens

<!-- COMMENT: Developer experience affects productivity and code quality. This lens examines tooling, documentation, and development workflow. -->

### Development Tooling

**Strengths:**
- ✅ TypeScript for type safety
- ✅ ESLint for code quality
- ✅ Prettier for formatting
- ✅ Jest for testing

**Issues:**
- ⚠️ **No pre-commit hooks visible**
  <!-- COMMENT: Husky is in package.json but no hooks configured visible. -->
  <!-- TODO: [dx-pre-commit-hooks] Set up pre-commit hooks for linting and testing -->
- ⚠️ **No development server hot reload**
  <!-- COMMENT: Expo has hot reload, but API server may not. -->
  <!-- TODO: [dx-api-hot-reload] Add hot reload for API server development -->
- ⚠️ **No debugging configuration**
  <!-- COMMENT: No .vscode/launch.json or debugging setup documented. -->
  <!-- TODO: [dx-debugging] Add debugging configuration for VS Code -->

### Documentation

**Strengths:**
- ✅ Comprehensive architecture docs
- ✅ Security documentation
- ✅ Policy documentation

**Gaps:**
- ⚠️ **No API documentation**
  <!-- COMMENT: No OpenAPI/Swagger docs for API. -->
  <!-- TODO: [dx-api-docs] Generate API documentation -->
- ⚠️ **No development setup guide**
  <!-- COMMENT: No step-by-step guide for new developers. -->
  <!-- TODO: [dx-setup-guide] Create development setup guide -->
- ⚠️ **No contribution guidelines**
  <!-- COMMENT: CONTRIBUTING.md exists but may not be comprehensive. -->
  <!-- TODO: [dx-contribution-guide] Enhance contribution guidelines -->

---

<!-- COMMENT: End of multi-lens analysis. All perspectives have been examined with detailed commentary and actionable TODOs. -->
