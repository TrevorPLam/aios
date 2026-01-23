Diamond++ Architecture Migration – Markdown Task List
Up-to-date as of 2026-01-23
How to Use This List
•  Copy everything into a single DIAMOND_MIGRATION.md file at the repo root.
•  Check the boxes (- [x]) as you finish items; commit the file so the team always sees live progress.
•  Each phase has its own “Quality Gate” checklist – you may not proceed to the next phase until every gate is ticked.
•  If an item spawns sub-tasks, create a nested list under it and keep the parent box unchecked until children are done.
Global Quality Gates (must stay green after Phase 0)
•  [ ] pnpm build passes in ≤ 5 min
•  [ ] pnpm test passes (≥ 70 % total coverage, ≥ 90 % domain)
•  [ ] pnpm lint – zero warnings
•  [ ] npx madge --circular packages/ – zero cycles
•  [ ] Import-boundary ESLint rules pass on every package
•  [ ] No database.ts import remains anywhere (except Phase 0/1 legacy shim)
Phase 0 – Repository Normalisation (Week 1)
Day 1 · Infrastructure
•  [ ] Install pnpm & create pnpm-workspace.yaml
•  [ ] Scaffold /apps, /packages, /tools directories
•  [ ] Root package.json scripts: build, test, lint
•  [ ] Commit .npmrc with shamefully-hoist=true
Day 2 · Code Move
•  [ ] git mv client apps/mobile/src
•  [ ] git mv server apps/api/src
•  [ ] git mv shared → temp/ (contracts extraction source)
•  [ ] Update all internal import paths (@/ → @aios/mobile/)
Day 3 · TypeScript & Tooling
•  [ ] Root tsconfig.json with project references
•  [ ] tsconfig.base.json (strict, exactOptionalPropertyTypes)
•  [ ] Add eslint-plugin-boundaries + rules
•  [ ] Add madge script for circular-dep check
Day 4 · CI / CD
•  [ ] GitHub workflow: build + test + lint on PR
•  [ ] Job fails if any global gate fails
•  [ ] Cache pnpm store & Turborepo (if used)
Day 5 · Validation
Quality Gate Phase 0
•  [ ] pnpm install finishes
•  [ ] pnpm build – all packages & apps
•  [ ] pnpm test – existing tests still pass
•  [ ] Manual smoke: expo start launches
•  [ ] Commit & tag v0.0.0-phase0
Phase 1 – Contracts Extraction (Week 2)
Package Skeleton
•  [ ] packages/contracts/package.json (name: @aios/contracts)
•  [ ] src/types, src/schemas, src/validators folders
Type & Schema Migration
•  [ ] Move every shared type into contracts/src/types/*.ts
•  [ ] Write Zod schemas for each (use z.infer<> for types)
•  [ ] Export from index.ts barrel
Validation Utils
•  [ ] validateContact, validateNote, … wrappers around Zod
•  [ ] Unit tests for every validator (edge-cases, i18n, etc.)
Consumer Update
•  [ ] Apps import only from @aios/contracts
•  [ ] Delete old temp/ folder when empty
Quality Gate Phase 1
•  [ ] packages/contracts builds standalone
•  [ ] npx madge --circular packages/contracts → clean
•  [ ] 100 % type coverage (tsc --noEmit)
•  [ ] Unit tests ≥ 90 % in contracts
•  [ ] Zero any without // eslint-disable-next-line @typescript-eslint/no-explicit-any comment
Phase 2 – Platform Creation (Weeks 3-5)
Interfaces & Adapters
•  [ ] IStorage, IRepository<T> interfaces
•  [ ] AsyncStorageAdapter (+ web LocalStorageAdapter)
•  [ ] BaseRepository<T> with CRUD
Feature Repositories (minimum 3)
•  [ ] SettingsRepository (simplest)
•  [ ] NotesRepository (+ search(), getByTag())
•  [ ] TasksRepository
Replace database.ts Calls
•  [ ] Refactor 3+ screens to use injected repositories
•  [ ] Delete migrated methods from database.ts after each
Observability & Logging
•  [ ] ILogger interface + console / file transports
•  [ ] Add performance timers around storage calls
Quality Gate Phase 2
•  [ ] packages/platform builds & tests ≥ 80 % coverage
•  [ ] grep -r "AsyncStorage" packages/features → 0 hits
•  [ ] wc -l apps/mobile/src/storage/database.ts ≤ 2 800 (≈ 50 % gone)
•  [ ] Screens still function (manual test checklist)
Phase 3 – Pilot Feature Extraction (Weeks 6-7)
Pick Pilot → Notes
•  [ ] Analyse: NotebookScreen.tsx + components + utils
•  [ ] Create packages/features/notes
Domain Layer
•  [ ] domain/types.ts (pure TS interfaces)
•  [ ] domain/rules.ts (title ≤ 200 chars, etc.)
•  [ ] domain/logic.ts (search, sort, filter – zero side-effects)
Data Layer
•  [ ] data/NotesDataService.ts (depends on NotesRepository)
•  [ ] Mappers if DTO ≠ domain shape
UI Layer
•  [ ] ui/NoteCard.tsx, ui/NotesList.tsx, ui/NoteEditor.tsx
•  [ ] hooks/useNotes.ts (React Query or simple fetch)
Thin Screen
•  [ ] Refactor NotebookScreen.tsx to < 100 lines
•  [ ] Business logic removed; only composition & navigation left
Quality Gate Phase 3
•  [ ] Feature builds independently
•  [ ] Unit tests for domain ≥ 90 %, UI ≥ 60 %
•  [ ] Screen file ≤ 100 lines
•  [ ] Zero imports from apps/ inside feature
•  [ ] Manual regression: create, edit, delete, search notes → identical behaviour
Phase 4 – Design System (Week 8)
Core Tokens
•  [ ] Colors, typography, spacing in packages/design-system/theme
•  [ ] Dark / light mode switcher
Primitive Components
•  [ ] Button, Input, Card, Avatar, Icon…
•  [ ] Prop interfaces exported; zero feature logic
Storybook
•  [ ] pnpm storybook launches
•  [ ] Visual regression tests (Chromatic or similar)
Quality Gate Phase 4
•  [ ] Design-system package ≤ 3 000 lines
•  [ ] All components typed (zero any)
•  [ ] Accessibility props validated (eslint-a11y)
•  [ ] Mobile & web render identically (visual diff)
Phase 5 – Parallel Feature Extraction (Weeks 9-16)
Preparation
•  [ ] Write tools/generators/create-feature CLI
•  [ ] Publish extraction playbook (checklist + Phase 3 example)
Batch Plan (AI-friendly)
Week	Features (suggested)	Max Lines / Screen After
9	Settings, Lists, Alerts	200
10	Tasks, Calendar, Contacts	200
11	Budget, Email, Messages	200
12	Photos, Integrations, Translator	200
13	History, CommandCenter, Planner	200
14	Remaining 5 screens	200
15	Cross-feature clean-up	200
16	Delete database.ts entirely	—
Per-Feature Checklist
•  [ ] Create branch feat/extract-<name>
•  [ ] Run generator; populate domain / data / ui
•  [ ] Replace screen imports; thin to < 200 lines
•  [ ] Write tests (≥ 60 % coverage)
•  [ ] Open PR; pass CI + manual QA; merge
Quality Gate Phase 5
•  [ ] All 42 features extracted
•  [ ] apps/mobile/src/storage/database.ts deleted
•  [ ] Every screen ≤ 200 lines (wc -l)
•  [ ] npx madge --circular packages/features → clean
•  [ ] Full regression suite passes (automated + manual)
Phase 6 – Web App Composition (Weeks 17-19)
Scaffold
•  [ ] apps/web with Vite + React + TypeScript
•  [ ] React-Router routes mirror mobile navigation
Adapters
•  [ ] Web storage adapter (localStorage)
•  [ ] Web analytics adapter (GA4 / Plausible)
Feature Integration
•  [ ] Compose same feature packages into web pages
•  [ ] Responsive wrappers where needed
Quality Gate Phase 6
•  [ ] pnpm dev starts web on localhost:3000
•  [ ] Lighthouse score ≥ 90 (performance, a11y, best-practices, SEO)
•  [ ] All features render without mobile-only crashes
•  [ ] E2E Cypress tests for critical flows
Phase 7 – API Alignment (Weeks 20-22)
Refactor Server
•  [ ] apps/api/src/routes use feature repositories
•  [ ] Share domain logic with mobile/web (import from features)
Schema & Migrations
•  [ ] Align DB schema with feature models
•  [ ] Write Prisma or Drizzle migrations
Observability
•  [ ] OpenAPI spec auto-generated
•  [ ] Load-test ≥ 1 000 req/s
Quality Gate Phase 7
•  [ ] API tests pass
•  [ ] No business-logic duplication between API & clients
•  [ ] pnpm build for api finishes
•  [ ] Security audit pass (npm audit 0 critical)
Post-Migration Optimisations (Weeks 23-28)
•  [ ] Add caching layer (React-Query / Redis)
•  [ ] Bundle-size budget enforcement (< 5 MB)
•  [ ] Service-worker offline support (web)
•  [ ] Centralised logging & error tracking (Sentry)
•  [ ] Monthly dependency updates scheduled
Final Success Checklist
•  [ ] Global quality gates still green
•  [ ] All phase gates above completed
•  [ ] Mobile, Web, API share zero business-logic duplication
•  [ ] database.ts does not exist
•  [ ] Average screen size ≤ 200 lines (measured)
•  [ ] Test coverage ≥ 75 % total, ≥ 90 % domain
•  [ ] Build + test + lint + circular-check ≤ 5 min
•  [ ] Team demo day: new feature shipped end-to-end in under 1 hour
Mark items complete directly in this file; commit history = live progress tracker.
