# AIOS Repository State

**Type:** Living Document
**Purpose:** Track dynamic state, temporary constraints, and enforcement toggles
**Update Frequency:** As needed (typically weekly or per-release)

## Plain English Summary

- This document tracks the **current state** of the repository, not permanent rules (see `constitution.md` for rules)
- Active migrations, temporary constraints, known breaks, and upcoming changes live here
- Enforcement toggles control when new quality checks start failing builds (vs just warning)
- Update this doc when starting migrations, resolving technical debt, or changing enforcement
- This is the "what's happening now" doc - constitution is "what must always be true"

## Technical Detail

### Enforcement Toggles

Control when automated checks transition from warn-only to fail-on-violation:

| Check | Status | Fail on Violation | Notes |
| ------- | -------- | ------------------- | ------- |
| **Traceability Matrix** | `WARN` | ❌ No (warnings only) | Matrix is incomplete. Toggle to `FAIL` when >80% complete. See: `docs/traceability_matrix.md` |
| **Exception Expiry** | `FAIL` | ✅ Yes | Active. Expired exceptions block builds. See: `.github/workflows/exceptions-expiry.yml` |
| **Constitution Sync** | `FAIL` | ✅ Yes | Active. Copilot instructions must match constitution. See: `.github/workflows/constitution-sync.yml` |
| **Documentation Quality** | `FAIL` | ✅ Yes | Active. Vale, markdownlint, link checks enforced. See: `.github/workflows/docs-*.yml` |
| **Security Scanning** | `FAIL` | ✅ Yes | Active. CodeQL, Trivy, SBOM required. See: `.github/workflows/codeql.yml`, `trivy.yml` |
| **AGENT Ownership Consistency** | `WARN` | ❌ No (not yet enforced) | Ensures TODO ownership uses AGENT-only assignments. Toggle to `FAIL` when enforcement script ready. |

### How to toggle

1. Update this file's enforcement table
2. Update the corresponding check script (e.g., `scripts/tools/check-traceability.mjs`)
3. Update the workflow YAML if needed
4. Create PR documenting the toggle and rationale
5. Announce in team chat/issue

### Example toggle

```javascript
// scripts/tools/check-traceability.mjs
 const ENFORCEMENT_MODE = process.env.TRACEABILITY_ENFORCEMENT |  | 'warn'; // Read from env or state.md

if (violations.length > 0) {
  if (ENFORCEMENT_MODE === 'fail') {
    process.exit(1); // Fail build
  } else {
    console.warn('Traceability violations found (warn-only mode)');
    process.exit(0); // Pass build
  }
}
```text

### Active Migrations

Current in-progress migrations and temporary states:

#### 1. Traceability Matrix Population (2026-01-18 → 2026-03-18)

**Status:** 🟡 In Progress (10% complete)

**Goal:** Complete `docs/traceability_matrix.md` with all features, APIs, and modules

### Current State
- 3 example rows populated
- ~27 features identified (see P0TODO.md, P1TODO.md, P2TODO.md, P3TODO.md)
- Enforcement mode: `WARN`

### Next Steps
1. Map existing features to code/tests/docs (week of 2026-01-25)
2. Fill matrix incrementally per module (4 weeks)
3. Reach 80% completion (2026-02-22)
4. Toggle enforcement to `FAIL` (2026-03-01)

**Owner:** @TrevorPowellLam
**Tracking Issue:** TODO (create issue #XXX)

#### 2. CODEOWNERS Activation (2026-01-18 → 2026-01-25)

**Status:** 🟢 Ready to Activate

**Goal:** Replace placeholder teams in `CODEOWNERS` with real GitHub usernames/teams

### Current State (2)
- `CODEOWNERS` file created from `CODEOWNERS.example`
- Contains placeholder teams: @repo-owners, @tech-leads, @security-team, etc.
- Not yet enforced in branch protection

### Next Steps (2)
1. Identify real team members/owners (this week)
2. Replace placeholders with actual GitHub handles
3. Enable CODEOWNERS requirement in branch protection settings
4. Announce to team

**Owner:** @TrevorPowellLam
**Tracking Issue:** TODO (create issue #XXX)

#### 3. Unified AGENT Ownership Adoption (2026-01-19 → 2026-02-19)

**Status:** 🟢 Complete

**Goal:** Standardize on a unified AGENT ownership model where a single AGENT handles all platform work

### Current State (3)
- Constitution updated with unified AGENT responsibilities
- P0TODO.md, P1TODO.md, P2TODO.md, P3TODO.md ownership standardized to AGENT-only assignments
- Documentation refreshed to remove Primary/Secondary split
- Enforcement mode: `WARN` (not yet enforced via CI)

### AGENT Responsibilities
- Builds all original features, screens, components, and business logic
- Delivers iOS, Android, and Web compatibility as required
- Owns architectural decisions and testing scope

### Next Steps (3)
1. Run `npm run compile:constitution` to update Copilot instructions (week of 2026-01-26)
2. Confirm enforcement check script scope: `scripts/tools/check-agent-platform.mjs` (week of 2026-02-02)
3. Toggle enforcement to `FAIL` once checks align with AGENT-only ownership (2026-02-16)

**Owner:** @TrevorPowellLam
**Tracking Issue:** TODO (create issue #XXX)

### Temporary Constraints

Limitations or workarounds that will be removed in the future:

#### 1. TypeScript `any` Types in Legacy Modules

**Constraint:** Some client analytics modules use `any` types

**Reason:** Pre-existing code before TypeScript strict mode enforcement

**Impact:** Type safety gaps in analytics tracking

### Remediation Plan
- Create exception: `EXC-002-legacy-analytics-types`
- Expires: 2026-04-18 (90 days)
- Fix incrementally: 2-3 files per sprint
- Tracking: TODO (create issue #XXX)

**Completion Target:** 2026-04-15

#### 2. Missing Module Documentation

**Constraint:** `docs/modules/` is mostly TODO

**Reason:** Recent addition of module docs structure

**Impact:** Developers lack deep-dive docs for modules

### Remediation Plan (2)
- Start with highest-traffic modules: server/routes.ts, client/screens/*
- 1-2 module docs per week
- Use template: `docs/.templates/module-template.md`
- Tracking: TODO (create issue #XXX)

**Completion Target:** 2026-03-31

### Known Breaks

Documented breakages or technical debt requiring attention:

#### 1. None Currently

**Last Check:** 2026-01-18

*(Add items here when builds break or tests start failing with "known issue" status)*

### Upcoming Enforcement Changes

Planned toggles and quality gate additions:

| Date | Change | Impact | Preparation Needed |
| ------ | -------- | -------- | ------------------- |
| 2026-02-01 | Enable test coverage threshold (80%) | PRs with <80% coverage will fail | Write tests for uncovered code |
| 2026-03-01 | Toggle traceability to `FAIL` | PRs modifying APIs without traceability updates will fail | Complete traceability matrix to 80% |
| 2026-04-01 | Require ADRs for new dependencies | Adding deps without ADR will be flagged in review | Document rationale for existing deps |

### Active Initiatives

Cross-cutting improvements in progress:

#### 1. Diamond-Standard Governance Rollout (2026-01-18 → 2026-02-01)

**Description:** Implementing constitution, Copilot instructions, traceability, and exception system

**Status:** 🟡 In Progress (Phases A-H Complete)

### Phases
- [x] A: Copilot instruction layer
- [x] B: Constitution and state docs
- [ ] C: Constitution compiler
- [ ] D: Exceptions/waivers system
- [ ] E: Traceability matrix
- [ ] F: Agent threat model + CODEOWNERS
- [ ] G: Cleanup placeholders
- [ ] H: Final report

**Owner:** @TrevorPowellLam (via Copilot)

#### 2. Documentation Quality Enforcement (Ongoing)

**Description:** Automated prose linting (Vale), markdown linting, link checking

**Status:** 🟢 Active and Enforced

### Metrics
- Vale warnings: 23 (down from 47 last month)
- Broken links: 0
- Markdownlint errors: 0

**Next:** Expand Vale vocabulary, add custom rules for technical terms

## State Management Checklist

Use this checklist when updating state:

### Starting a Migration

- [ ] Add entry to "Active Migrations" section
- [ ] Set status emoji: 🔴 Not Started, 🟡 In Progress, 🟢 Complete
- [ ] Define goal, current state, next steps
- [ ] Assign owner
- [ ] Create tracking issue and link it
- [ ] Set completion target date
- [ ] Add enforcement toggle if applicable

### Completing a Migration

- [ ] Update status to 🟢 Complete
- [ ] Document completion date
- [ ] Update enforcement toggle if needed
- [ ] Remove from "Active Migrations" or move to "Completed Migrations" archive section
- [ ] Close tracking issue
- [ ] Announce completion

### Adding a Temporary Constraint

- [ ] Add entry to "Temporary Constraints" section
- [ ] Explain why constraint exists
- [ ] Document impact
- [ ] Create remediation plan with timeline
- [ ] Create exception in `exceptions.yml` if policy violation
- [ ] Set completion target

### Resolving a Constraint

- [ ] Mark as resolved with date
- [ ] Close related exception in `exceptions.yml`
- [ ] Remove from "Temporary Constraints" or mark complete
- [ ] Update related enforcement toggles

### Toggling Enforcement

- [ ] Update "Enforcement Toggles" table
- [ ] Modify check script to read toggle
- [ ] Update workflow YAML if needed
- [ ] Create PR with justification
- [ ] Announce to team before merge
- [ ] Monitor for false positives in first week

### Documenting Known Breaks

- [ ] Add to "Known Breaks" section
- [ ] Include date discovered
- [ ] Explain impact and workaround
- [ ] Assign owner to fix
- [ ] Create issue for tracking
- [ ] Set fix target date

## Assumptions

- This document is updated regularly by maintainers
- Enforcement toggles are respected by CI scripts
- Team is notified when enforcement changes
- State changes are documented in CHANGELOG.md
- Active migrations have clear owners and timelines

## Failure Modes

| Failure Mode | Symptom | Solution |
| -------------- | --------- | ---------- |
| Stale state | Doc says "in progress" but done | Regular review, archive completed items |
| Untracked migrations | Migrations happen but not documented | Require state.md update in migration PRs |
| Surprise enforcement | Check starts failing without warning | Always warn before toggling to fail |
| Forgotten constraints | Temporary workarounds become permanent | Expiry dates + regular review |
| Ownership gaps | No clear owner for migration | Assign owner when adding to state.md |

## How to Verify

### Check current enforcement modes
```bash
# Read this file
cat docs/governance/state.md

# Check traceability enforcement
grep "ENFORCEMENT_MODE" scripts/tools/check-traceability.mjs

# Check exception enforcement
grep "status: active" docs/governance/exceptions.yml
```text

### List active migrations
```bash
# Extract "In Progress" items
grep -A 10 "Status.*In Progress" docs/governance/state.md
```text

### Verify toggles are implemented
```bash
# Check scripts read state
grep -r "docs/governance/state.md" scripts/tools/

# Check workflows use correct modes
grep -r "TRACEABILITY_ENFORCEMENT" .github/workflows/
```text

### Check for overdue migrations
```bash
# Manual review: Look for completion targets in the past
# TODO: Create automated check for this
```text

---

**LAST UPDATED:** 2026-01-18
**NEXT REVIEW:** 2026-01-25 (weekly during active migrations)

---

*Companion to `docs/governance/constitution.md` (permanent rules)*
