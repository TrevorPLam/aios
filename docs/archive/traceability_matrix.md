# AIOS Traceability Matrix

## Plain English Summary

- This matrix links features to their documentation, code, tests, and operational artifacts
- Every row represents a feature or capability in the system
- Columns trace from product requirements through implementation to operations
- TODOs indicate gaps that need to be filled
- CI checks this matrix to ensure new features are properly documented
- Start with high-priority features; fill incrementally

## Technical Detail

### Matrix Purpose

The traceability matrix ensures:

1. **No orphaned code:** Every feature has docs
2. **No orphaned docs:** Every doc references actual code
3. **Testability:** Every feature has tests
4. **Operability:** Critical features have runbooks
5. **Observability:** Important flows have dashboards/metrics

### Column Definitions

| Column | Description | Example |
| -------- | ------------- | --------- |
| **Feature/Capability** | Name of the feature | "User Authentication" |
| **PRD Link** | Product requirements doc | `docs/product/auth-requirements.md` |
| **ADR Link** | Architecture decision record | `docs/decisions/003-jwt-auth.md` |
| **Modules** | Implementation file paths | `apps/api/middleware/auth.ts` |
| **APIs** | API endpoints | `POST /api/login, GET /api/me` |
| **Data Schemas** | Database tables/schemas | `users table, sessions table` |
| **Tests** | Test file paths | `apps/api/__tests__/auth.test.ts` |
| **Runbooks** | Operations documentation | `docs/operations/runbooks/auth-issues.md` |
| **Dashboards** | Monitoring dashboards | `Grafana: User Auth Dashboard` |
| **Notes** | Additional context | Status, blockers, TODOs |

### How to Use

#### Adding a new feature

1. Create row in this matrix
2. Fill in known columns
3. Mark unknowns as TODO with expected completion date
4. Link to tracking issue if needed
5. Update as you implement

### Finding feature documentation

1. Search this file for feature name
2. Follow links to relevant docs/code
3. Use as navigation map

### Auditing completeness

```bash
# Count TODOs
grep -o "TODO" docs/traceability_matrix.md | wc -l

# Check enforcement mode
grep "Traceability" .repo/policy/QUALITY_GATES.md
```text

## Traceability Matrix

| Feature/Capability | PRD Link | ADR Link | Modules | APIs | Data Schemas | Tests | Runbooks | Dashboards | Notes |
| ------------------- | ---------- | ---------- | --------- | ------ | -------------- | ------- | ---------- | ------------ | ------- |
| **User Authentication** | TODO: `docs/product/` | [ADR-003](decisions/003-jwt-auth.md) | `apps/api/middleware/auth.ts`, `apps/api/routes.ts:45-89` | `POST /api/login`, `POST /api/register`, `GET /api/me` | `users` table (see `apps/api/storage.ts:20`) | `apps/api/__tests__/auth.test.ts` | TODO: `docs/operations/runbooks/` | TODO: Auth metrics | Status: Implemented. Missing: PRD, runbook, metrics |
| **Data Persistence** | TODO | [ADR-001](decisions/001-use-asyncstorage.md) | `apps/mobile/storage/`, `apps/api/storage.ts` | N/A (local) | `users`, `settings`, `analytics_events` tables | `apps/api/__tests__/storage.test.ts`, TODO: client tests | TODO | TODO | Status: Implemented. AsyncStorage for client, PostgreSQL for server |
| **Analytics Tracking** | TODO | [ADR-005](decisions/005-analytics-architecture.md) | `apps/mobile/analytics/`, `apps/api/routes.ts:analytics` | `POST /api/analytics/events` | `analytics_events` table | TODO: Integration tests | TODO | TODO | Status: Implemented. Missing: comprehensive tests, runbook, dashboard |
| **Documentation System** | TODO | [ADR-004](decisions/004-docs-structure.md), [ADR-006](decisions/006-docs-automation.md) | `docs/`, `.github/workflows/docs-*.yml` | N/A | N/A | CI workflows | `docs/README.md` | [Documentation Metrics](DOCUMENTATION_METRICS.md) | Status: Active. Well documented. |
| **API Specification** | TODO | TODO | `docs/apis/openapi/openapi.yaml` | All `/api/*` endpoints | Documented in OpenAPI | `.github/workflows/api-spectral.yml` | TODO | TODO | Status: OpenAPI spec exists. Missing: ADR, tests, runbook |
| **Security Scanning** | TODO | [ADR-007](decisions/007-governance-ci-enforcement.md) | `.github/workflows/codeql.yml`, `trivy.yml`, `sbom.yml` | N/A | N/A | CI workflows test security | `docs/security/SECURITY.md` | [OSSF Scorecard](https://github.com/TrevorPLam/aios/security/scorecard) | Status: Active. CodeQL, Trivy, SBOM, OSSF Scorecard |

## Planned Features (Not Yet Implemented)

| Feature/Capability | PRD Link | ADR Link | Modules | APIs | Data Schemas | Tests | Runbooks | Dashboards | Notes |
| ------------------- | ---------- | ---------- | --------- | ------ | -------------- | ------- | ---------- | ------------ | ------- |
| **Push Notifications** | TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO | Planned for Q2 2026 |
| **Offline Sync** | TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO | Under consideration |

## Assumptions

- Features are added incrementally to this matrix
- TODOs are filled as documentation/code is created
- Matrix is kept up-to-date with every feature PR
- Links use relative paths from repo root
- CI checks this file for completeness (warn-only initially)

## Failure Modes

| Failure Mode | Symptom | Solution |
| -------------- | --------- | ---------- |
| Matrix is stale | Docs don't match implementation | Require matrix update in PR template |
| Too many TODOs | Matrix is overwhelming | Start with critical features, expand gradually |
| Broken links | Links 404 | CI link checker validates all links |
| Missing features | Feature exists but not in matrix | Audit codebase, add missing rows |
| Duplicate rows | Same feature listed multiple times | Consolidate, use one row per capability |

## How to Verify

### Check matrix completeness
```bash
# Count total rows
 grep "^\ | " docs/traceability_matrix.md | grep -v "Feature/Capability" | grep -v "\-\-\-" | wc -l

# Count TODOs (automated check provides accurate count)
grep -o "TODO" docs/traceability_matrix.md | wc -l

# Run automated traceability checker for current status
npm run check:traceability
```text

### Run traceability checker
```bash
node scripts/tools/check-traceability.mjs
# Should pass in warn mode, may fail in enforce mode if TODOs present
```text

## Validate links
```bash
# Check all links in matrix resolve
lychee docs/traceability_matrix.md
```text

### Find features missing tests
```bash
# Look for rows where Tests column has TODO
grep "TODO" docs/traceability_matrix.md | grep "Tests"
```text

---

### Current Status
- Total features: 6 implemented, 2 planned
- Completion: ~30% (many TODOs remain)
- Enforcement mode: See `/.repo/policy/QUALITY_GATES.md`
- Target: 80% completion by 2026-03-01

### Next Actions
1. Add PRD links for existing features
2. Create runbooks for auth and analytics
3. Add comprehensive tests for analytics
4. Create dashboards for key metrics
5. Fill TODOs incrementally (1-2 per sprint)

---

*Last Updated: 2026-01-18*
*Maintained by: Repository maintainers*
*Enforcement: Warn-only (toggle to fail when >80% complete)*

