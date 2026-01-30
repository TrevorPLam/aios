# AIOS Repository — State-of-the-Repository Report

**Classification:** Forensic architectural audit  
**Date:** 2026-01-30  
**Methodology:** Static analysis, dependency audit, pattern review, critical-path tracing

---

## EXECUTIVE SUMMARY

### Overall Repository Health Score: **5.5 / 10**

The monorepo has a clear structure (apps, packages, services), strict TypeScript, and solid governance (alignment standard, blast radius, security workflows). Critical build/runtime gaps and undeclared dependencies in the API gateway and contracts, a missing template file that causes server crash on startup, a 5,700+ line database module, and zero tests for the API gateway materially reduce the score.

### Three Most Critical Issues (Immediate Attention)

1. **API gateway and contracts undeclared dependencies** — `services/api-gateway` imports `express`, `bcryptjs`, `jsonwebtoken`, and `zod`; `packages/contracts` imports `zod`, `drizzle-orm`, and `drizzle-zod`. None of these appear in the respective `package.json` files. `pnpm list --filter "@aios/api-gateway"` shows only `@aios/contracts` and `@aios/platform`. A clean install cannot build or run the gateway or contracts; this is a **build integrity and reproducibility failure**.

2. **Missing landing template causes server crash** — `services/api-gateway/src/index.ts` (lines 212–218) does `fs.readFileSync(path.resolve(process.cwd(), "services", "api-gateway", "templates", "landing-page.html"), "utf-8")`. The directory `services/api-gateway/templates/` and file `landing-page.html` do not exist. `configureExpoAndLanding(app)` runs at startup, so the process **crashes on boot** when that code path is hit.

3. **API gateway has no tests** — The gateway implements auth (JWT, bcrypt), rate limiting, validation, and 30+ routes in a single ~786-line `routes/index.ts` file. There is no `jest.config.js`, no `__tests__/` under `services/api-gateway`, and no test scripts in its `package.json`. Security-critical paths (login, register, token verification) are **untested**.

### Three Strongest Aspects

1. **Governance and safety** — `.alignment/` standards, blast-radius protection for `services/api-gateway/`, `scripts/security/check-blast-radius.sh`, verify.sh (gitleaks, lint, type-check, test, build), and security/validation workflows. CORS and auth are documented; JWT_SECRET is required at startup; error handler avoids leaking internals.

2. **TypeScript and boundaries** — Strict `tsconfig.base.json` (strict, noUnusedLocals, noUncheckedIndexedAccess). Clear workspace boundaries (packages → contracts/platform, features → ui/platform/contracts). Shared Zod schemas in `@aios/contracts/schema` used by the gateway for validation.

3. **Testing where present** — 47 test files across `packages/platform`, `packages/features`, and `packages/ui`; Jest configs in platform, features, and ui; storage and analytics have broad coverage (e.g. `database.test.ts`, analytics `__tests__/`). Good use of `asyncHandler` and `AppError` in the gateway for consistent error handling.

---

## DETAILED FINDINGS

### 1. Architectural & Structural Assessment

#### Strengths

- **Directory layout:** Clear split — `apps/*` (web, mobile-shared, mobile-ios, mobile-android), `packages/*` (ui, utils, api-sdk, config, contracts, features, platform), `services/api-gateway`. `pnpm-workspace.yaml` includes `apps/*`, `packages/*`, `packages/config/*`, `services/*`, `tools/*`.
- **Turbo pipeline:** `turbo.json` defines build/lint/type-check/test with correct `dependsOn: ["^build"]` for test and build; dev is non-cached and persistent.
- **Feature structure:** Features (alerts, budget, calendar, contacts, core, email, etc.) follow a consistent `data/`, `domain/`, `ui/` pattern with index re-exports.
- **Config centralization:** `packages/config/` holds eslint-config, jest-config, typescript-config; root extends shared configs.

#### Critical Issues

- **Single API gateway with no split:** All HTTP routes live in `services/api-gateway/src/routes/index.ts` (~786 lines). One file handles auth, recommendations, notes, tasks, projects, events, settings, conversations, messages, analytics, etc. Adding more resources will increase coupling and merge conflict risk.
- **Missing template and crash on startup:**  
  `services/api-gateway/src/index.ts` lines 212–218:
  ```ts
  const templatePath = path.resolve(process.cwd(), "services", "api-gateway", "templates", "landing-page.html");
  const landingPageTemplate = fs.readFileSync(templatePath, "utf-8");
  ```
  There is no `services/api-gateway/templates/` directory. Server crashes when `configureExpoAndLanding(app)` runs (during the async IIFE that starts the app).
- **Workspace vs. layout mismatch:** Root `package.json` lists `"workspaces": ["apps/*", "packages/*", "services/*", "tools/*"]` but there is no `tools/` at repo root (only `.alignment/tools/`). Minor inconsistency.

#### Concerns

- **README vs. reality:** README references `infrastructure/`, `docs/architecture/`, `docs/api/`, `tools/codegen/`, `tools/migration-assistant/`. None of these exist at repo root; either add them or update README.
- **Error handler order:** In `index.ts`, `setupErrorHandler(app)` is correctly called after `registerRoutes(app)`, so Express error handler is last. No issue here.

#### Opportunities

- Split `routes/index.ts` into domain route modules (e.g. `routes/auth.ts`, `routes/notes.ts`, `routes/tasks.ts`) and compose in `routes/index.ts`.
- Add a small health/readiness module and document startup sequence (CORS → body → logging → static/expo → routes → error handler).

---

### 2. Code Quality Deep Dive

#### Strengths

- **Naming:** Consistent use of `asyncHandler`, `AppError`, `validate(…Schema)`, `ensureString(param)`. Feature screens use clear names (`CalendarScreen`, `EventDetailScreen`, `ContactsScreen`).
- **Error handling in gateway:** `errorHandler.ts` distinguishes operational vs. unexpected errors, logs with context, and returns safe client messages. `asyncHandler` wraps async route handlers and forwards to `next(err)`.
- **Comments and governance:** Many files include governance/constitution references and JSDoc (e.g. `errorHandler.ts`, `auth.ts`, routes). Useful for audit and onboarding.

#### Critical Issues

- **Monolithic database module:** `packages/platform/storage/database.ts` is **~5,748 lines** with a single exported object `db` containing many nested modules (recommendations, notes, tasks, projects, events, settings, history, lists, alerts, photos, messages, conversations, contacts, budgets, integrations, emailThreads, translations, etc.). High cyclomatic and cognitive load; 282 uses of `.forEach`/`.map`/`.filter`/`.reduce` in that file alone. Refactors and debugging are costly and risky.
- **Duplication of message helpers:** `buildMessagePreview` and `buildMessageSearchIndex` are duplicated between:
  - `packages/platform/storage/database.ts` (lines 141–155)
  - `services/api-gateway/src/storage.ts` (lines 31–51)  
  Server version adds `mimeType`/`type` to the search index; client uses `fileName || url`. Logic should live in one place (e.g. shared helper in contracts or platform) and be reused.

#### Concerns

- **Long route file:** `services/api-gateway/src/routes/index.ts` (~786 lines) with repeated patterns (authenticate, validateParams, validate(schema), asyncHandler, storage/notesData call, 404 or 201/204). Extract a small “resource handler” helper or route factory to reduce repetition.
- **errorHandler `any`:** `asyncHandler` in `errorHandler.ts` line 147 is typed as `(req, res, next) => Promise<any>`. Prefer a generic or a concrete return type for clarity and safety.
- **@ts-expect-error in errorReporting:** `packages/platform/lib/errorReporting.ts` uses `@ts-expect-error` for `analytics.trackError`. Either extend analytics types or add a typed facade so the codebase doesn’t rely on expect-error.

#### Opportunities

- Add ESLint rules for max lines per file and max function length (e.g. 300 lines per file, 50 lines per function) and apply them first to new code and `database.ts` refactors.
- Increase comment-to-code ratio in `database.ts` for the larger modules (e.g. emailThreads, integrations) with one-line purpose and usage notes.

---

### 3. Dependency Health Audit

#### Strengths

- **Lockfile:** `pnpm-lock.yaml` lockfileVersion 9; pnpm 10.0.0 in root; workspace protocol used for internal packages.
- **No duplicate top-level declarations:** Each workspace declares its own deps; no obvious duplicate declarations of the same version across roots.
- **Dev tooling versions:** TypeScript ^5.0.0, ESLint ^8.57.0, Jest ^29.7.0, Prettier ^3.2.5 — reasonable and consistent.

#### Critical Issues

- **Undeclared dependencies in api-gateway:**  
  The service uses but does not declare:
  - `express` (index.ts, routes, middleware types)
  - `bcryptjs` (routes/index.ts)
  - `jsonwebtoken` (middleware/auth.ts)
  - `zod` (routes/index.ts, middleware/validation.ts)  
  `services/api-gateway/package.json` lists only `@aios/platform` and `@aios/contracts`. So either these are being satisfied by hoisting from another workspace (none of which declare them in the repo) or the project has been run only from an environment where they were installed ad hoc. **Action:** Add express, bcryptjs, jsonwebtoken, zod to `services/api-gateway/package.json` and run `pnpm install` to refresh the lockfile.

- **Undeclared dependencies in contracts:**  
  `packages/contracts/schema.ts` (and related) import:
  - `zod`
  - `drizzle-orm`, `drizzle-orm/pg-core`
  - `drizzle-zod`  
  `packages/contracts/package.json` has **no** `dependencies` or `devDependencies`. Type-check and build for contracts will fail on a clean clone. **Action:** Add zod, drizzle-orm, drizzle-zod (and any peer deps) to `packages/contracts/package.json`.

#### Concerns

- **Root workspace:** Root `package.json` has no `dependencies`, only `devDependencies`. That’s fine for a monorepo root, but it confirms that express/zod/bcrypt/jwt are not coming from root.
- **api-gateway and contracts not in lockfile as consumers of express/zod/drizzle:** Grep for `express@`, `zod@`, `drizzle` in `pnpm-lock.yaml` found no direct entries for these packages under the repo’s importers, supporting the conclusion that they are undeclared.

#### Opportunities

- Run `pnpm audit` in CI and enforce a policy (e.g. fail on high/critical or document exceptions). Security workflow already runs `pnpm audit --audit-level=moderate` with `continue-on-error: true`; consider making it fail for critical/high.
- Add a “dependency declaration” check (e.g. script or CI step) that parses imports in `services/api-gateway` and `packages/contracts` and verifies they appear in the corresponding package.json.

---

### 4. Testing & Reliability Analysis

#### Strengths

- **Coverage distribution:** 47 test files; platform has many `__tests__/` (analytics, lib, storage); features has domain and UI tests (e.g. calendar `EventDetailScreen.test.tsx`, core domain tests, lists validation/secondary nav); ui has themeColors and timeInput tests.
- **Jest configuration:** Shared base in `packages/config/jest-config/`; `packages/platform`, `packages/features`, and `packages/ui` each have `jest.config.js`. Turbo runs tests with `dependsOn: ["^build"]` and emits `coverage/`.
- **Verify pipeline:** `scripts/verify.sh` runs blast radius, gitleaks, lint, type-check, test, build in order. CI runs `make verify` after `make setup`.

#### Critical Issues

- **API gateway has no tests:** No `jest.config.js`, no `test` script in `services/api-gateway/package.json`, no `__tests__/` under the service. Auth (JWT sign/verify, bcrypt hash/compare), rate limiters, validation middleware, and all route handlers are untested. This is the highest-risk gap for regressions and security.
- **Missing test:coverage in CI:** The main CI workflow (e.g. `ci.yml`) runs `make verify`, which runs `pnpm test` but does not run `pnpm test:coverage` or enforce a coverage gate. Coverage is not visible or enforced in CI.

#### Concerns

- **Single e2e-style test:** `packages/platform/storage/__tests__/quickWins.e2e.test.ts` exists; no other e2e or API tests were found. The testing pyramid is skewed to unit tests; integration/e2e for the gateway is absent.
- **Flaky risk:** No evidence of flaky test tracking or quarantine; acceptable for current size but worth a policy (e.g. skip or quarantine with a ticket).

#### Opportunities

- Add Jest to api-gateway: `jest.config.js`, `test` and `test:coverage` scripts, and at least unit tests for `auth.ts` (generateToken/verifyToken/authenticate), `errorHandler.ts` (AppError, errorHandler, asyncHandler), and `validation.ts`. Then add a few route integration tests (e.g. POST /api/auth/register with valid/invalid payloads).
- Add a CI job that runs `pnpm test:coverage` and publishes or enforces a minimum coverage threshold (e.g. 80% for new code or for gateway once tests exist).

---

### 5. Security & Compliance Review

#### Strengths

- **No hardcoded secrets in code:** JWT secret comes from `process.env.JWT_SECRET`; auth.ts throws at module load if it’s missing. No literal passwords or API keys in the scanned code.
- **Auth design:** Passwords hashed with bcrypt (cost 10); generic “Invalid credentials” on login failure; auth routes use rate limiters and Zod validation; comments explicitly say “Never log passwords or tokens.”
- **CORS:** Explicit allowlist (REPLIT_DEV_DOMAIN, REPLIT_DOMAINS, localhost); no wildcard origin in code.
- **Logging:** Request logging truncates response body to 100 chars; logger docs say “Never log sensitive data (passwords, tokens, API keys).”
- **Verify and CI:** Gitleaks in verify.sh; security workflow runs TruffleHog and `pnpm audit`; blast radius protects api-gateway and scripts.

#### Critical Issues

- **.env.example does not document JWT_SECRET:** `.env.example` only has `NODE_ENV=development` and commented API_URL. JWT_SECRET is required for the server but not mentioned. New contributors or automation may start the server without it and hit the fatal throw, or worse, run with an empty default elsewhere. **Action:** Add a commented line such as `# JWT_SECRET=your-secret-here` and reference it in README or service docs.

#### Concerns

- **Body size limit:** `express.json({ limit: "10mb" })` is large; consider a lower default for API routes and a separate limit for upload endpoints if needed.
- **Security headers:** No explicit Helmet or X-Content-Type-Options, X-Frame-Options, etc. in the gateway. Consider adding security headers middleware.
- **Audit in CI:** `pnpm audit --audit-level=moderate` is set to `continue-on-error: true` in the security workflow, so vulnerabilities do not fail the job. Prefer failing on high/critical and documenting exceptions.

#### Opportunities

- Document in SECURITY.md or README: required env vars (JWT_SECRET, PORT, optional REPLIT_*, LOG_LEVEL), and that .env must not be committed.
- Add a minimal security-headers middleware (e.g. X-Content-Type-Options: nosniff, X-Frame-Options: DENY) for the gateway.

---

### 6. Performance Profiling

#### Strengths

- **Client storage:** AsyncStorage with JSON serialize/deserialize; no N+1 or heavy sync work in the hot path from the sampled code. Search index uses an inverted index and debouncing in `searchIndex.ts` to avoid excessive writes.
- **Turbo:** Build and test pipelines use Turbo with dependency-aware caching, which helps incremental performance.

#### Critical Issues

- **database.ts full reads:** Many methods in `packages/platform/storage/database.ts` do `getAll()` then `.filter()`/`.find()` in memory (e.g. recommendations, notes, tasks). With large datasets this is O(n) per call and can become a hotspot. No pagination or lazy loading at the storage layer in the sampled methods.
- **Recurrence expansion:** `buildRecurringOccurrences` and similar logic in database.ts use `while` loops over date ranges to expand recurring events; for very long ranges or many events this could be heavy. No explicit limits or caps were seen in the sampled code.

#### Concerns

- **Message search:** Server-side message search in api-gateway storage builds a search index string per message and uses `.includes(normalized)`. For large conversation histories this is linear scan; acceptable for small/medium data but worth documenting or capping.
- **Single-threaded gateway:** Node single-threaded; CPU-bound work in a route handler blocks others. No clustering or worker pattern in the current setup; acceptable for moderate load but a scalability limit.

#### Opportunities

- For database.ts, introduce pagination (e.g. `getNotes(userId, { limit, offset })`) or cursor-based APIs for list endpoints and document limits.
- Add response compression (e.g. `compression` middleware) for JSON API responses if payloads grow.

---

### 7. Maintainability Metrics

#### Strengths

- **Stable tooling:** Single pnpm version, single TypeScript base config, one Turbo pipeline. Reduces “which version do I use?” confusion.
- **Documentation surface:** README, CONTRIBUTING.md, CLAUDE.md, AGENTS.md, SECURITY.md, and .alignment/ give clear entry points. CONTRIBUTING points to .alignment for standards and PR format.
- **Protected paths:** Blast radius script and CODEOWNERS (if used) focus review on api-gateway, infrastructure, workflows, scripts — good for maintainability and safety.

#### Critical Issues

- **database.ts as a hotspot:** At ~5,748 lines and 282 array-iteration call sites, any change to behavior or types in this file is high-impact and merge-prone. It is the main maintainability and refactor bottleneck.
- **routes/index.ts:** One large file for all API routes increases merge conflicts and makes it hard to onboard (“where do I add a new endpoint?”). Splitting by domain would improve maintainability.

#### Concerns

- **Churn not measured:** No automated churn or hotspot metrics (e.g. from git history). Recommend tracking files with high commit frequency and high complexity to prioritize refactors.
- **Onboarding:** README references infrastructure and docs that don’t exist; Windows users must use WSL2 or Git Bash for make. Clarifying these in README would reduce friction.

#### Opportunities

- Extract database.ts into smaller modules (e.g. `storage/recommendations.ts`, `storage/notes.ts`, …) with a thin `database.ts` that re-exports a composed `db` object. Do incrementally with tests.
- Add a short “Architecture” section in README or docs: entry points (apps, api-gateway), where types/schemas live (contracts), where business logic lives (features/platform), and where to add new routes/tests.

---

## ACTIONABLE RECOMMENDATIONS

### IMMEDIATE (Next 1–2 Weeks)

1. **Declare and install api-gateway dependencies**  
   In `services/api-gateway/package.json`, add: `express`, `bcryptjs`, `jsonwebtoken`, `zod`, and any types (e.g. `@types/express`, `@types/jsonwebtoken`, `@types/bcryptjs` if needed). Run `pnpm install` and confirm build and type-check pass.

2. **Declare and install contracts dependencies**  
   In `packages/contracts/package.json`, add: `zod`, `drizzle-orm`, `drizzle-zod`, and any peer/typings. Run `pnpm install` and confirm type-check and build for contracts and dependents.

3. **Add missing landing template or make it optional**  
   Either: (a) add `services/api-gateway/templates/landing-page.html` with a minimal HTML placeholder and wire it into the build/deploy, or (b) change startup so that the landing page is only configured when the template file exists (e.g. `if (fs.existsSync(templatePath)) { ... }` and otherwise skip or return 503 for `/`). Option (a) is preferable for a consistent deploy.

4. **Document JWT_SECRET in .env.example**  
   Add a commented line for `JWT_SECRET` and a one-line note that it is required for the API gateway. Reference it in README or service README if present.

### SHORT-TERM (1 Month)

5. **Add API gateway tests**  
   Introduce Jest in api-gateway: config, test script, and unit tests for auth (token generation/verification, authenticate middleware), errorHandler (AppError, errorHandler, asyncHandler), and validation. Add at least one integration test per resource (e.g. auth register/login, one CRUD resource).

6. **Run test:coverage in CI and optionally enforce a gate**  
   Add a CI step that runs `pnpm test:coverage` and either publish coverage (e.g. Codecov) or fail if coverage drops below a threshold for changed packages.

7. **Extract message helpers to remove duplication**  
   Move `buildMessagePreview` and `buildMessageSearchIndex` to a shared module (e.g. under `packages/contracts` or `packages/platform`) and use it from both `packages/platform/storage/database.ts` and `services/api-gateway/src/storage.ts`.

8. **Split routes into domain files**  
   Create `routes/auth.ts`, `routes/notes.ts`, `routes/tasks.ts`, etc., and import/register them in `routes/index.ts` to reduce file size and merge conflict risk.

### MEDIUM-TERM (1–3 Months)

9. **Break up database.ts**  
   Split into per-domain modules (recommendations, notes, tasks, events, settings, lists, alerts, photos, messages, conversations, contacts, budgets, integrations, emailThreads, translations, …) with a single `database.ts` that composes and re-exports `db`. Add tests for the new modules and migrate callers incrementally.

10. **Harden security in CI**  
    Make `pnpm audit` fail for critical/high (or document and pin exceptions). Add security headers middleware to the gateway and document in SECURITY.md.

11. **Align README with repo**  
    Remove or qualify references to missing `infrastructure/`, `docs/`, `tools/` or add minimal placeholders and point to .alignment where appropriate.

### LONG-TERM (3–6 Months)

12. **Introduce pagination/caps in client storage**  
    Add optional limit/offset or cursor to list methods in database.ts and document maximum recommended sizes; consider lazy loading for very large lists.

13. **Track hotspots and tech debt**  
    Use git history and a simple complexity metric (e.g. line count + cyclomatic complexity) to identify high-churn, high-complexity files and prioritize refactors and tests.

14. **E2E or API contract tests**  
    Add a small suite of e2e or contract tests for the gateway (e.g. login → create note → fetch note) to protect critical user flows.

---

## RISK ASSESSMENT

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Clean install / CI build fails due to undeclared deps | High | High | Declare all deps in api-gateway and contracts (IMMEDIATE). |
| Server crash on startup when landing is requested | High | High | Add template file or make landing conditional (IMMEDIATE). |
| Regression in auth or payment-sensitive flows | Medium | Critical | Add gateway unit and integration tests (SHORT-TERM). |
| Refactor or bug fix in database.ts causes regressions | High | High | Split file and add tests (MEDIUM-TERM); avoid big-bang changes. |
| Dependency vulnerability in express/zod/jwt/bcrypt | Medium | High | Declare deps, run audit in CI, fail on critical/high (IMMEDIATE + SHORT-TERM). |
| Single developer or bus factor on api-gateway | Medium | Medium | Document startup, env, and route layout; add tests and split routes. |
| Scalability limit of single Node process | Low | Medium | Accept for current scale; add clustering or workers only when needed. |

### Scalability Limitations

- Gateway: single process, no horizontal scaling configuration in repo; client storage is in-memory/AsyncStorage, not a shared DB in the current design.
- Client `database.ts`: full-array reads and in-memory filters; will not scale to very large datasets without pagination or a different backend.

### Team Velocity Blockers

- Undeclared deps and missing template block “clone and run” and CI if not fixed.
- Lack of gateway tests makes changes to auth or routes slow (manual verification) and risky.
- Monolithic database and route files increase review time and conflict rate.

### Knowledge Concentration Risks

- Deep knowledge of `database.ts` and gateway route behavior is concentrated in the codebase itself; documentation and tests are the main mitigations. .alignment and governance comments help, but runbooks for “how to add a new resource” and “how to add a new storage module” would reduce concentration risk.

---

*End of report. Findings are evidence-based from the repository state as of the audit date. Re-run verification (e.g. `make verify`) and dependency checks after applying changes.*
