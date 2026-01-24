# 📋 Task Backlog

> **Prioritized Queue** — All open tasks ordered by priority (P0 highest → P3 lowest).

---

## Workflow Instructions

### Adding New Tasks:
1. Use the standard task format (see template below)
2. Assign appropriate priority: P0 (Critical) | P1 (High) | P2 (Medium) | P3 (Low)
3. Insert task in correct priority order (P0 tasks at top)
4. Include clear acceptance criteria

### Promoting Tasks:
1. When `TODO.md` is empty, move the TOP task from this file to `TODO.md`
2. Update status from `Pending` to `In Progress`
3. Remove the task from this file

### Task Format Template:
```markdown
### [TASK-XXX] Task Title
- **Priority:** P0 | P1 | P2 | P3
- **Status:** Pending
- **Created:** YYYY-MM-DD
- **Context:** Brief description of why this task matters

#### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

#### Notes
- Any relevant context or links
```

---

## Priority Legend
| Priority | Meaning | SLA |
|----------|---------|-----|
| **P0** | Critical / Blocking | Immediate |
| **P1** | High / Important | This week |
| **P2** | Medium / Should do | This month |
| **P3** | Low / Nice to have | When possible |

---

## P0 — Critical

### [TASK-012] Create ADR: Django vs Node.js Backend Decision
- **Priority:** P0
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** Two backend systems exist (`backend/` Django vs `apps/api/` Node.js/Express) with unclear relationship. This is the #1 architectural blocker.

#### Acceptance Criteria
- [ ] Create ADR documenting decision: Django or Node.js?
- [ ] If Django: Plan migration of `apps/api/` logic to Django
- [ ] If Node.js: Remove `backend/` directory or clearly mark as legacy
- [ ] Update documentation to clarify decision
- [ ] Update `apps/INDEX.md` and `backend/README.md`

#### Notes
- Source: PROJECT_ANALYSIS.md section 2.3
- Blocks all backend development work
- Need clear decision before proceeding

---

### [TASK-013] Fix API Server Boundary Violations
- **Priority:** P0
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** `apps/api/` implements business logic instead of mounting from packages. Violates architecture rules.

#### Acceptance Criteria
- [ ] Refactor all 42+ routes in `apps/api/routes.ts` to use feature data layers
- [ ] Remove business logic from `apps/api/storage.ts`
- [ ] Import from `@features/*/data` instead of local storage
- [ ] Verify no business logic remains in apps/api/
- [ ] Update tests to reflect new architecture

#### Notes
- Source: PROJECT_ANALYSIS.md section 2.1
- Start with one feature (e.g., notes) as proof of concept
- Requires feature data layers to be implemented first (TASK-014)

---

### [TASK-014] Implement Feature Data Layers
- **Priority:** P0
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** Many feature `data/` layers are stubs. Blocks API refactoring.

#### Acceptance Criteria
- [ ] Implement `packages/features/*/data/index.ts` for core features (notes, tasks, events, projects)
- [ ] Use `@platform/storage` for database access
- [ ] Export clean API for each feature (create, read, update, delete, list)
- [ ] Expand to remaining features
- [ ] Add tests for each data layer

#### Notes
- Source: PROJECT_ANALYSIS.md section 6
- Prerequisite for TASK-013 (API refactoring)
- Start with core features, then expand

---

### [TASK-015] Migrate API Storage to Database
- **Priority:** P0
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** `apps/api/` uses in-memory storage, causing data loss on restart. `packages/platform/storage` exists but unused.

#### Acceptance Criteria
- [ ] Migrate `apps/api/storage.ts` to use `@platform/storage/database`
- [ ] Implement database migrations
- [ ] Update feature data layers to use database
- [ ] Remove in-memory storage implementation
- [ ] Test data persistence across restarts

#### Notes
- Source: PROJECT_ANALYSIS.md section 6
- Critical for production readiness
- May need to refactor database.ts first (TASK-016)

---

### [TASK-016] Split Large Database File
- **Priority:** P0
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** `packages/platform/storage/database.ts` is 5748 lines (too large to maintain).

#### Acceptance Criteria
- [ ] Split into smaller modules: `users.ts`, `notes.ts`, `tasks.ts`, `events.ts`, `projects.ts`, etc.
- [ ] Keep `database.ts` as main export/connection file
- [ ] Ensure all imports still work
- [ ] Update tests
- [ ] Verify no functionality lost

#### Notes
- Source: PROJECT_ANALYSIS.md section 2.2
- Suggested structure: database.ts (connection), feature-specific modules
- Improves maintainability significantly

---

### [TASK-017] Standardize Path Aliases
- **Priority:** P0
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** Both `@shared` and `@contracts` point to same package. Causes confusion and inconsistent imports.

#### Acceptance Criteria
- [ ] Remove `@shared` alias from `tsconfig.json` and `babel.config.js`
- [ ] Update all imports from `@shared/*` to `@contracts/*`
- [ ] Update files: `apps/api/storage.ts`, `apps/api/routes.ts`, `apps/api/__tests__/messages.quickwins.e2e.test.ts`
- [ ] Verify no `@shared` imports remain
- [ ] Update documentation

#### Notes
- Source: PROJECT_ANALYSIS.md section 3.2
- Found 3 files using `@shared`
- `@contracts` is more descriptive

---

## P1 — High

### [TASK-018] Resolve Frontend/Web App Confusion
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** Both `frontend/` and `apps/web/` exist, both incomplete. Need decision on which to use.

#### Acceptance Criteria
- [ ] Decide: `frontend/` or `apps/web/`?
- [ ] If `apps/web/`: Remove `frontend/` or mark as legacy
- [ ] If `frontend/`: Implement it or remove placeholder
- [ ] Update `.agent-context.json` to reflect actual dependencies
- [ ] Implement chosen web app following same pattern as `apps/mobile/`

#### Notes
- Source: PROJECT_ANALYSIS.md section 2.4
- Both are currently placeholders
- `apps/web/` aligns better with apps/ structure

---

### [TASK-019] Add Automated Boundary Checking to CI/CD
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** Boundary rules are well-documented but enforcement is incomplete. `apps/api/` violates these rules.

#### Acceptance Criteria
- [ ] Create ESLint rule or script for boundary checking
- [ ] Detect violations: UI→Data, cross-feature without ADR, apps implementing business logic
- [ ] Add to CI/CD pipeline
- [ ] Fail CI on boundary violations
- [ ] Provide clear error messages with file paths

#### Notes
- Source: PROJECT_ANALYSIS.md section 1.2
- Can use ESLint custom rule or import-linter
- Critical for maintaining architecture integrity

---

### [TASK-020] Fix Type Safety Issues
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** `apps/api/routes.ts` uses `as any` in validation (multiple instances). Suggests type mismatch between Zod schemas and Express types.

#### Acceptance Criteria
- [ ] Fix type definitions to eliminate `as any` assertions
- [ ] Update Zod schema types to match Express types
- [ ] Fix all instances in `routes.ts` (lines 51, 201, 215, 268, 282, etc.)
- [ ] Verify no type assertions needed
- [ ] Update tests

#### Notes
- Source: PROJECT_ANALYSIS.md section 4.1
- Multiple instances found
- Should fix type definitions instead of using `as any`

---

### [TASK-004] Create .github/copilot-instructions.md
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** Context engineering file for GitHub Copilot and VS Code AI features.

#### Acceptance Criteria
- [ ] Document product vision and architecture principles
- [ ] Include contribution guidelines for AI
- [ ] Reference supporting docs (ARCHITECTURE.md, PRODUCT.md)
- [ ] Test with Copilot to verify context is picked up

#### Notes
- Part of the VS Code context engineering workflow standard

---

### [TASK-005] Create PRODUCT.md
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** Product vision document giving AI context about WHY features exist.

#### Acceptance Criteria
- [ ] Define UBOS product vision and mission
- [ ] Document target users (service firms)
- [ ] List key features and their business value
- [ ] Include product roadmap priorities

#### Notes
- AI agents need product context to make good decisions

---

### [TASK-006] Expand docs/ARCHITECTURE.md
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** Current file is 14 lines. Needs comprehensive system documentation.

#### Acceptance Criteria
- [ ] Add Mermaid diagrams for system architecture
- [ ] Document module ownership and boundaries
- [ ] Explain data flow and integration patterns
- [ ] Include decision rationale for key choices

#### Notes
- Critical for AI to understand system structure

---

## P2 — Medium

### [TASK-007] Create docs/adr/ Folder with ADR Template
- **Priority:** P2
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** Architecture Decision Records document WHY decisions were made.

#### Acceptance Criteria
- [ ] Create `docs/adr/` directory
- [ ] Add ADR template (ADR-000-template.md)
- [ ] Create first ADR for multi-tenancy model
- [ ] Document ADR process in docs/architecture/decisions/

#### Notes
- ADRs help AI understand historical context

---

### [TASK-008] Enable OpenAPI Drift Detection in CI
- **Priority:** P2
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** OpenAPI check job is disabled (`if: false`) in CI workflow.

#### Acceptance Criteria
- [ ] Fix blocking issues preventing OpenAPI generation
- [ ] Enable the `openapi-check` job
- [ ] Ensure schema drift fails CI
- [ ] Document OpenAPI workflow in CONTRIBUTING.md

#### Notes
- Committed OpenAPI artifact is single source of truth for API

---

### [TASK-009] Add Worker Runtime for Job Queue
- **Priority:** P2
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** Job queue models exist but no worker process to execute them.

#### Acceptance Criteria
- [ ] Create management command or worker process
- [ ] Add worker service to docker-compose.yml
- [ ] Document worker scaling strategy
- [ ] Add health checks for worker

#### Notes
- Per ANALYSIS.md: jobs modeled in DB but can't run
- backend/modules/jobs/models.py defines JobQueue/DLQ

---

## P3 — Low

### [TASK-010] Add Observability Stack (OpenTelemetry/Prometheus)
- **Priority:** P3
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** Logging and Sentry exist but no metrics/tracing.

#### Acceptance Criteria
- [ ] Add OpenTelemetry instrumentation
- [ ] Configure Prometheus metrics endpoint
- [ ] Create basic Grafana dashboards-as-code
- [ ] Document observability in RUNBOOK.md

#### Notes
- Per ANALYSIS.md: observability incomplete

---

### [TASK-011] Add SBOM Generation to CI
- **Priority:** P3
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** Supply chain security best practice.

#### Acceptance Criteria
- [ ] Add SBOM generation step to CI
- [ ] Choose format (SPDX or CycloneDX)
- [ ] Store SBOM artifact with releases
- [ ] Document in SECURITY.md

#### Notes
- Required for enterprise security compliance

---

## Additional Tasks from PROJECT_ANALYSIS.md and Other Sources

> **Note:** The following tasks were extracted from PROJECT_ANALYSIS.md, priority TODO files, IMPLEMENTATION_TASK_LIST.md, and agents/tasks/BACKLOG.md. They have been deduplicated and organized by priority.

### [TASK-021] Remove Default JWT_SECRET, Require Environment Variable
- **Priority:** P0
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** JWT_SECRET has a default value in code, which is a security risk if deployed without environment variable.

#### Acceptance Criteria
- [ ] Remove default JWT_SECRET from `apps/api/middleware/auth.ts`
- [ ] Fail fast if JWT_SECRET not set in production
- [ ] Add validation on server startup
- [ ] Update documentation to require JWT_SECRET

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.1
- Critical security issue

---

### [TASK-022] Add Rate Limiting to Authentication Endpoints
- **Priority:** P0
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** `/api/auth/login` and `/api/auth/register` have no rate limiting. Vulnerable to brute force attacks.

#### Acceptance Criteria
- [ ] Install rate limiting middleware (express-rate-limit)
- [ ] Add rate limiting to `/api/auth/login` (e.g., 5 attempts per 15 minutes)
- [ ] Add rate limiting to `/api/auth/register` (e.g., 3 attempts per hour)
- [ ] Return appropriate error messages
- [ ] Test rate limiting behavior

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.1
- Critical security issue

---

### [TASK-023] Implement JWT Blacklist for Logout Functionality
- **Priority:** P0
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** Logout endpoint returns success but doesn't blacklist token. Tokens valid until expiry.

#### Acceptance Criteria
- [ ] Implement token blacklist storage (Redis or in-memory with TTL)
- [ ] Check blacklist in JWT verification middleware
- [ ] Add token to blacklist on logout
- [ ] Handle blacklist cleanup (expired tokens)
- [ ] Test logout and subsequent token usage

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.1
- Security improvement

---

### [TASK-024] Implement Refresh Token Pattern
- **Priority:** P0
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** Single 7-day token. Should use short-lived access tokens + long-lived refresh tokens.

#### Acceptance Criteria
- [ ] Generate refresh tokens on login
- [ ] Store refresh tokens securely (hashed in database)
- [ ] Create `/api/auth/refresh` endpoint
- [ ] Shorten access token expiry (e.g., 15 minutes)
- [ ] Implement refresh token rotation
- [ ] Add refresh token revocation on logout
- [ ] Update client to handle token refresh

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.1
- Security best practice

---

### [TASK-025] Add Max Length Validation to All String Fields
- **Priority:** P0
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** Zod schemas validate format but may not limit length. Could allow DoS via large payloads.

#### Acceptance Criteria
- [ ] Audit all Zod schemas in `packages/contracts/schema.ts`
- [ ] Add `.max()` validation to all string fields
- [ ] Set reasonable limits (e.g., title: 200, description: 5000)
- [ ] Update API error messages
- [ ] Test with oversized payloads

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.1
- Security improvement

---

### [TASK-026] Add Request Size Limits to Express
- **Priority:** P0
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** Express doesn't have explicit body size limits configured. Could allow memory exhaustion attacks.

#### Acceptance Criteria
- [ ] Add `express.json({ limit: '10mb' })` to body parsing middleware
- [ ] Add `express.urlencoded({ limit: '10mb' })` for form data
- [ ] Configure appropriate limits for file uploads
- [ ] Return clear error messages for oversized requests
- [ ] Test with large payloads

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.1
- Security improvement

---

### [TASK-027] Implement Database with Encryption at Rest
- **Priority:** P0
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** In-memory storage has no encryption. Need database with encryption at rest.

#### Acceptance Criteria
- [ ] Migrate to PostgreSQL or similar database
- [ ] Configure database encryption at rest
- [ ] Ensure sensitive fields are encrypted
- [ ] Test encryption/decryption
- [ ] Document encryption configuration

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.1
- Security requirement

---

### [TASK-028] Add HTTPS Redirect Middleware for Production
- **Priority:** P0
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** CORS configured but no explicit HTTPS requirement. Should enforce in production.

#### Acceptance Criteria
- [ ] Create HTTPS redirect middleware
- [ ] Only enable in production environment
- [ ] Redirect HTTP to HTTPS
- [ ] Add HSTS headers
- [ ] Test redirect behavior

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.1
- Security best practice

---

### [TASK-029] Add Automated Dependency Vulnerability Scanning to CI/CD
- **Priority:** P0
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** No evidence of Dependabot, Snyk, or automated npm audit in CI/CD.

#### Acceptance Criteria
- [ ] Add `npm audit` to CI/CD pipeline
- [ ] Configure Dependabot or Snyk
- [ ] Fail CI on critical vulnerabilities
- [ ] Create security alerts for vulnerabilities
- [ ] Document vulnerability response process

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.1
- Security requirement

---

### [TASK-030] Create Detailed Incident Response Runbook
- **Priority:** P0
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** docs/security/threat_model.md mentions incident response but no detailed plan.

#### Acceptance Criteria
- [ ] Create incident response runbook in `docs/security/`
- [ ] Define incident severity levels
- [ ] Document response procedures
- [ ] Include contact information
- [ ] Add communication templates
- [ ] Create post-incident review process

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.1
- Security requirement

---

### [TASK-031] Design Database Queries for Performance
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** Current in-memory storage is fast but doesn't scale. Database will add latency. Need optimization.

#### Acceptance Criteria
- [ ] Design database schema with indexes
- [ ] Add indexes for frequently queried fields (userId, timestamp, etc.)
- [ ] Configure connection pooling
- [ ] Analyze query performance
- [ ] Optimize slow queries
- [ ] Document query patterns

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.2
- Performance optimization

---

### [TASK-032] Add Redis or In-Memory Cache for Frequently Accessed Data
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** No caching layer for frequently accessed data (e.g., user settings, recommendations).

#### Acceptance Criteria
- [ ] Choose caching solution (Redis or in-memory)
- [ ] Install and configure cache
- [ ] Add cache layer for user settings
- [ ] Add cache layer for recommendations
- [ ] Implement cache invalidation strategy
- [ ] Add cache metrics/monitoring

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.2
- Performance optimization

---

### [TASK-033] Add Pagination to All List Endpoints
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** `/api/notes`, `/api/tasks`, etc. return all records. Could be slow with large datasets.

#### Acceptance Criteria
- [ ] Add pagination to all list endpoints
- [ ] Support limit/offset or cursor-based pagination
- [ ] Add pagination metadata to responses
- [ ] Update API documentation
- [ ] Test with large datasets

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.2
- Performance requirement

---

### [TASK-034] Add Performance Monitoring to Mobile App
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** No evidence of performance tracking (e.g., React Native Performance Monitor).

#### Acceptance Criteria
- [ ] Add React Native Performance Monitor
- [ ] Track screen load times
- [ ] Monitor animation FPS
- [ ] Track memory usage
- [ ] Set performance budgets
- [ ] Create performance dashboard

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.2
- Performance monitoring

---

### [TASK-035] Add Bundle Size Analysis and Budgets
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** Many packages in package.json. No bundle size analysis visible.

#### Acceptance Criteria
- [ ] Add bundle size analysis tool (e.g., webpack-bundle-analyzer)
- [ ] Set bundle size budgets
- [ ] Add to CI/CD pipeline
- [ ] Fail CI on budget violations
- [ ] Document bundle optimization strategies

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.2
- Performance optimization

---

### [TASK-036] Analyze and Optimize Database Queries
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** database.ts is 5748 lines - potential performance issues. Need to analyze query performance.

#### Acceptance Criteria
- [ ] Profile database queries
- [ ] Identify slow queries
- [ ] Optimize query patterns
- [ ] Add query logging
- [ ] Create query performance dashboard
- [ ] Document optimization strategies

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.2
- Performance optimization

---

### [TASK-037] Configure Database Connection Pooling
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** If using PostgreSQL, need connection pooling (e.g., pg-pool).

#### Acceptance Criteria
- [ ] Configure connection pooling
- [ ] Set appropriate pool size
- [ ] Add pool monitoring
- [ ] Handle pool exhaustion
- [ ] Test under load
- [ ] Document pool configuration

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.2
- Performance optimization

---

### [TASK-038] Add Database Indexes for Frequently Queried Fields
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** No evidence of indexes, query plans, or optimization.

#### Acceptance Criteria
- [ ] Identify frequently queried fields
- [ ] Add indexes to database schema
- [ ] Create migration for indexes
- [ ] Analyze query plans
- [ ] Monitor index usage
- [ ] Document index strategy

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.2
- Performance optimization

---

### [TASK-039] Verify React 19 Compatibility with React Native 0.83
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** React 19.1.0 is very new. May have breaking changes or compatibility issues with React Native.

#### Acceptance Criteria
- [ ] Review React 19 changelog
- [ ] Review React Native 0.83 compatibility
- [ ] Test critical features
- [ ] Document compatibility issues
- [ ] Create migration plan if needed

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.3
- Dependency verification

---

### [TASK-040] Review Express 5 Migration Guide and Verify Compatibility
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** Express 5 has breaking changes from v4. Need to verify compatibility.

#### Acceptance Criteria
- [ ] Review Express 5 migration guide
- [ ] Identify breaking changes
- [ ] Test API endpoints
- [ ] Fix compatibility issues
- [ ] Document migration notes

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.3
- Dependency verification

---

### [TASK-041] Document Dependency Update Strategy and Schedule
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** package-lock.json exists but no strategy for updates documented.

#### Acceptance Criteria
- [ ] Create dependency update policy
- [ ] Define update schedule (e.g., monthly)
- [ ] Document update process
- [ ] Create update checklist
- [ ] Add to CONTRIBUTING.md

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.3
- Dependency management

---

### [TASK-042] Add npm Audit to CI/CD Pipeline
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** No evidence of automated npm audit in CI/CD.

#### Acceptance Criteria
- [ ] Add `npm audit` step to CI/CD
- [ ] Configure audit level (moderate/high/critical)
- [ ] Fail CI on critical vulnerabilities
- [ ] Create security alerts
- [ ] Document audit process

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.3
- Security requirement

---

### [TASK-043] Review Changelogs for React 19 and Express 5
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** New versions of React, Express may have breaking changes.

#### Acceptance Criteria
- [ ] Review React 19 changelog
- [ ] Review Express 5 changelog
- [ ] Identify breaking changes
- [ ] Create migration checklist
- [ ] Test compatibility
- [ ] Document findings

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.3
- Dependency verification

---

### [TASK-044] Consider Pinning Critical Dependencies
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** Some dependencies use ^ (caret) which allows minor updates. Could introduce breaking changes.

#### Acceptance Criteria
- [ ] Identify critical dependencies
- [ ] Evaluate pinning strategy
- [ ] Pin critical dependencies if needed
- [ ] Document pinning rationale
- [ ] Update dependency policy

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.3
- Dependency management

---

### [TASK-045] Add Retry Logic for Transient Failures
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** Errors are logged but no retry logic, circuit breakers, or fallback mechanisms.

#### Acceptance Criteria
- [ ] Identify transient failure scenarios
- [ ] Implement retry logic with exponential backoff
- [ ] Add retry configuration
- [ ] Test retry behavior
- [ ] Document retry strategy

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.4
- Resilience improvement

---

### [TASK-046] Integrate Error Alerting System (e.g., Sentry)
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** Errors are logged but no alerting system (e.g., Sentry, PagerDuty).

#### Acceptance Criteria
- [ ] Choose error alerting solution (Sentry, etc.)
- [ ] Install and configure alerting
- [ ] Integrate with error handler
- [ ] Configure alert thresholds
- [ ] Set up alert routing
- [ ] Test alerting

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.4
- Observability requirement

---

### [TASK-047] Implement Fallback Mechanisms for Critical Failures
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** If database fails, entire API fails. No fallback to cached data.

#### Acceptance Criteria
- [ ] Identify critical failure points
- [ ] Implement fallback mechanisms
- [ ] Add cached data fallback
- [ ] Test fallback behavior
- [ ] Document fallback strategy

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.4
- Resilience improvement

---

### [TASK-048] Add Comprehensive Health Check Endpoint
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** `/status` endpoint exists but doesn't check database connectivity.

#### Acceptance Criteria
- [ ] Enhance `/status` endpoint
- [ ] Check database connectivity
- [ ] Check external service health
- [ ] Return detailed health status
- [ ] Add health check monitoring
- [ ] Document health check format

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.4
- Observability requirement

---

### [TASK-049] Implement Circuit Breaker Pattern for External Services
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** No protection against cascading failures.

#### Acceptance Criteria
- [ ] Choose circuit breaker library
- [ ] Implement circuit breaker for external services
- [ ] Configure circuit breaker thresholds
- [ ] Add circuit breaker monitoring
- [ ] Test circuit breaker behavior
- [ ] Document circuit breaker strategy

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.4
- Resilience improvement

---

### [TASK-050] Add Rate Limiting Middleware
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** No protection against API abuse or DoS attacks.

#### Acceptance Criteria
- [ ] Install rate limiting middleware
- [ ] Configure rate limits per endpoint
- [ ] Add rate limit headers
- [ ] Handle rate limit errors
- [ ] Test rate limiting
- [ ] Document rate limit configuration

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.4
- Security requirement

---

### [TASK-051] Add Request Timeout Middleware
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** Long-running requests could hang indefinitely.

#### Acceptance Criteria
- [ ] Add request timeout middleware
- [ ] Configure timeout duration
- [ ] Handle timeout errors
- [ ] Add timeout logging
- [ ] Test timeout behavior
- [ ] Document timeout configuration

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.4
- Resilience improvement

---

### [TASK-052] Add API Versioning (e.g., /api/v1/notes)
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** URLs are `/api/notes` not `/api/v1/notes`. Future changes will break clients.

#### Acceptance Criteria
- [ ] Add version prefix to all API routes
- [ ] Update route handlers
- [ ] Update API documentation
- [ ] Test versioned endpoints
- [ ] Document versioning strategy

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.5
- API design improvement

---

### [TASK-053] Generate OpenAPI/Swagger Documentation
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** No OpenAPI/Swagger spec visible.

#### Acceptance Criteria
- [ ] Generate OpenAPI spec from routes
- [ ] Add API documentation endpoint
- [ ] Create Swagger UI
- [ ] Keep spec in sync with code
- [ ] Add to CI/CD for drift detection
- [ ] Document API usage

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.5
- API documentation requirement

---

### [TASK-054] Standardize Error Response Format Across All Endpoints
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** Some endpoints may return different error formats.

#### Acceptance Criteria
- [ ] Define standard error response format
- [ ] Update all error handlers
- [ ] Update error responses
- [ ] Test error responses
- [ ] Document error format
- [ ] Update API documentation

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.5
- API consistency improvement

---

### [TASK-055] Add Query Parameters for Filtering and Sorting
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** List endpoints don't support query parameters for filtering or sorting.

#### Acceptance Criteria
- [ ] Add filtering query parameters
- [ ] Add sorting query parameters
- [ ] Update route handlers
- [ ] Add validation for query parameters
- [ ] Test filtering and sorting
- [ ] Document query parameters

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.5
- API feature

---

### [TASK-056] Standardize Response Format (Wrapper Object vs Direct Array)
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** Some endpoints return `{ data: [...] }`, others return array directly.

#### Acceptance Criteria
- [ ] Choose standard response format
- [ ] Update all endpoints to use standard format
- [ ] Update API documentation
- [ ] Test response formats
- [ ] Document response format

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.5
- API consistency improvement

---

### [TASK-057] Add Test Coverage Reporting and Enforce Thresholds
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** No evidence of coverage reports or thresholds.

#### Acceptance Criteria
- [ ] Add test coverage tool (e.g., jest-coverage)
- [ ] Configure coverage thresholds
- [ ] Add coverage reporting to CI/CD
- [ ] Fail CI on threshold violations
- [ ] Create coverage dashboard
- [ ] Document coverage requirements

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.6
- Testing requirement

---

### [TASK-058] Add Tests for All Feature Modules
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** 6 minimal features likely have no tests.

#### Acceptance Criteria
- [ ] Identify features without tests
- [ ] Add unit tests for each feature
- [ ] Add integration tests
- [ ] Achieve 80%+ coverage
- [ ] Document test patterns

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.6
- Testing requirement

---

### [TASK-059] Add Integration Tests for API Endpoints
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** Tests appear to be unit tests only. No API + database integration tests.

#### Acceptance Criteria
- [ ] Set up integration test environment
- [ ] Add integration tests for API endpoints
- [ ] Test with real database
- [ ] Test authentication flows
- [ ] Test error scenarios
- [ ] Add to CI/CD

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.6
- Testing requirement

---

### [TASK-060] Add E2E Tests for Critical User Flows
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** No end-to-end tests for critical user flows.

#### Acceptance Criteria
- [ ] Set up E2E testing framework
- [ ] Add E2E tests for critical flows
- [ ] Test authentication flow
- [ ] Test data creation/update flows
- [ ] Add to CI/CD
- [ ] Document E2E test patterns

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.6
- Testing requirement

---

### [TASK-061] Create Test Data Factories for Consistent Test Data
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** Test data creation may be duplicated across tests.

#### Acceptance Criteria
- [ ] Create test data factory utilities
- [ ] Add factories for all data types
- [ ] Use factories in all tests
- [ ] Document factory usage
- [ ] Add factory examples

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.6
- Testing improvement

---

### [TASK-062] Create Test Utilities for Common Patterns
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** Common test patterns (e.g., authenticated requests) may be duplicated.

#### Acceptance Criteria
- [ ] Create test utility functions
- [ ] Add authenticated request helper
- [ ] Add database setup/teardown helpers
- [ ] Add mock helpers
- [ ] Document test utilities
- [ ] Use utilities in all tests

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.6
- Testing improvement

---

### [TASK-063] Optimize Build Configuration for Production
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** esbuild config may not be optimized for production.

#### Acceptance Criteria
- [ ] Review esbuild configuration
- [ ] Optimize for production builds
- [ ] Add minification
- [ ] Add tree shaking
- [ ] Test build output
- [ ] Document build optimization

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.7
- Build optimization

---

### [TASK-064] Add Build Caching to Speed Up CI/CD
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** No evidence of build caching (e.g., Turborepo, Nx).

#### Acceptance Criteria
- [ ] Choose build caching solution
- [ ] Configure build caching
- [ ] Add cache to CI/CD
- [ ] Measure cache hit rates
- [ ] Document caching strategy

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.7
- CI/CD optimization

---

### [TASK-065] Set Up CI/CD Pipeline (GitHub Actions, GitLab CI, etc.)
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** No .github/workflows/ or CI config files found.

#### Acceptance Criteria
- [ ] Choose CI/CD platform
- [ ] Create CI/CD configuration
- [ ] Add build step
- [ ] Add test step
- [ ] Add lint step
- [ ] Configure deployment
- [ ] Document CI/CD process

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.7
- CI/CD requirement

---

### [TASK-066] Add Automated Test Execution to CI/CD
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** Tests exist but may not run automatically.

#### Acceptance Criteria
- [ ] Add test execution to CI/CD
- [ ] Run all test suites
- [ ] Generate coverage reports
- [ ] Fail CI on test failures
- [ ] Document test execution

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.7
- CI/CD requirement

---

### [TASK-067] Set Up Automated Deployment Pipeline
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** No evidence of automated deployment pipeline.

#### Acceptance Criteria
- [ ] Set up deployment pipeline
- [ ] Configure deployment targets
- [ ] Add deployment approval gates
- [ ] Add deployment notifications
- [ ] Test deployment
- [ ] Document deployment process

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.7
- CI/CD requirement

---

### [TASK-068] Standardize Implementation Depth Across Features
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** core/ has 21 domain files, others have 1-2.

#### Acceptance Criteria
- [ ] Audit feature implementation depth
- [ ] Define minimum implementation requirements
- [ ] Create feature implementation checklist
- [ ] Update minimal features
- [ ] Document implementation standards

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.8
- Maintainability improvement

---

### [TASK-069] Add Code Quality Metrics (Complexity, Duplication)
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** No cyclomatic complexity, code duplication metrics.

#### Acceptance Criteria
- [ ] Add code quality tools (e.g., SonarQube)
- [ ] Configure complexity metrics
- [ ] Configure duplication detection
- [ ] Add to CI/CD
- [ ] Set quality gates
- [ ] Document quality metrics

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.8
- Code quality requirement

---

### [TASK-070] Migrate to Shared Database for Horizontal Scaling
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** In-memory storage can't be shared across instances.

#### Acceptance Criteria
- [ ] Migrate to shared database
- [ ] Configure database connection
- [ ] Test multi-instance deployment
- [ ] Document scaling strategy
- [ ] Update deployment docs

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.9
- Scalability requirement

---

### [TASK-071] Document Load Balancing Requirements
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** No evidence of load balancer configuration.

#### Acceptance Criteria
- [ ] Document load balancing requirements
- [ ] Configure load balancer
- [ ] Test load balancing
- [ ] Document load balancing strategy
- [ ] Update deployment docs

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.9
- Scalability requirement

---

### [TASK-072] Set Up Pre-commit Hooks for Linting and Testing
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** Husky is in package.json but no hooks configured visible.

#### Acceptance Criteria
- [ ] Configure Husky pre-commit hooks
- [ ] Add linting hook
- [ ] Add testing hook
- [ ] Add formatting hook
- [ ] Test hooks
- [ ] Document hook configuration

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.10
- Developer experience improvement

---

### [TASK-073] Add Hot Reload for API Server Development
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** Expo has hot reload, but API server may not.

#### Acceptance Criteria
- [ ] Add hot reload to API server
- [ ] Configure watch mode
- [ ] Test hot reload
- [ ] Document hot reload setup
- [ ] Update development docs

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.10
- Developer experience improvement

---

### [TASK-074] Add Debugging Configuration for VS Code
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** No .vscode/launch.json or debugging setup documented.

#### Acceptance Criteria
- [ ] Create .vscode/launch.json
- [ ] Configure debugging for API
- [ ] Configure debugging for mobile app
- [ ] Test debugging
- [ ] Document debugging setup

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.10
- Developer experience improvement

---

### [TASK-075] Create Development Setup Guide
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** No step-by-step guide for new developers.

#### Acceptance Criteria
- [ ] Create development setup guide
- [ ] Document prerequisites
- [ ] Document installation steps
- [ ] Document configuration
- [ ] Add troubleshooting section
- [ ] Update README.md

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.10
- Developer experience requirement

---

### [TASK-076] Enhance Contribution Guidelines
- **Priority:** P1
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** CONTRIBUTING.md exists but may not be comprehensive.

#### Acceptance Criteria
- [ ] Review CONTRIBUTING.md
- [ ] Add contribution workflow
- [ ] Add code style guidelines
- [ ] Add testing requirements
- [ ] Add PR template
- [ ] Update contribution guidelines

#### Notes
- Source: PROJECT_ANALYSIS.md section 11.10
- Developer experience requirement

---

### [TASK-085] Phase 0: Integration Testing (Analytics)
- **Priority:** P0
- **Status:** Pending
- **Created:** 2026-01-23
- **Context:** Phase 0: Integration Testing. End-to-end test from client to database. Verify offline queueing, retry, GDPR deletion. Critical to ensure Phase 0 works before Phase 1. T-081 through T-084 already COMPLETED - need tests.

#### Acceptance Criteria
- [ ] E2E test: Client sends events → Server receives → DB persists
- [ ] Test offline queueing (events queue when server down)
- [ ] Test retry logic (events retry on failure)
- [ ] Test batch sending (50 events sent as batch)
- [ ] Test GDPR deletion (deleteUserAnalytics removes all events)
- [ ] Test error handling (bad payload returns 400)
- [ ] Test coverage >80%

#### Notes
- Source: agents/tasks/TODO.md, P0TODO.md
- References: docs/analytics/PHASE_0_HANDOFF.md, docs/analytics/DEEP_ASSESSMENT_AND_GAMEPLAN.md (Task 0.5), apps/api/__tests__/analytics.test.ts (NEW FILE)
- Dependencies: None (T-081-T-084 already complete)
- Effort: M (4-6 hours)
- Note: Last step for Phase 0. Once complete, unblocks Phase 1 (T-071).

---

### [TASK-071-ANALYTICS] Phase 1: Production Readiness (Client Features)
- **Priority:** P0
- **Status:** Blocked
- **Created:** 2026-01-23
- **Context:** Phase 1: Production Readiness (Critical observability and privacy features). Event Inspector and Metrics Collection are critical for production monitoring. Consent Management required for GDPR/CCPA compliance. **BLOCKED BY:** Phase 0 (T-081-T-085) must complete first.

#### Acceptance Criteria
- [ ] Task 1.1: Event Inspector UI (20-30h) - Real-time event visualization
- [ ] Task 1.2: Metrics Collection (20-30h) - Throughput, latency, error rates
- [ ] Task 1.3: Consent Management (15-20h) - GDPR compliance
- [ ] Task 1.4: Data Retention (15-20h) - Automatic cleanup
- [ ] Task 1.5: Data Deletion API (10-15h) - User data deletion
- [ ] Task 1.6: Testing & Documentation (10-20h) - 80%+ coverage

#### Notes
- Source: agents/tasks/BACKLOG.md, P0TODO.md
- References: docs/analytics/IMPLEMENTATION_PLAN.md (Phase 1), docs/analytics/DEEP_ASSESSMENT_AND_GAMEPLAN.md (Phase 1 details)
- Dependencies: TASK-085 (Phase 0 complete and tested)
- Effort: L (80-120 hours total for Phase 1)
- Note: Phase 1 is production-critical. Target: 53/100 → 70/100 score.

---

> **Note:** Additional tasks from priority TODO files (P0TODO.md, P1TODO.md, P2TODO.md, P3TODO.md) and IMPLEMENTATION_TASK_LIST.md will be added in a follow-up update. This initial extraction covers the most critical tasks from PROJECT_ANALYSIS.md and analytics-related tasks.
