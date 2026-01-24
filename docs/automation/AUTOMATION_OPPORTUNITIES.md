# Additional Automation Opportunities

This document identifies scripts and processes that could benefit from automation but are currently manual.

**Date**: 2025-01-24

---

## High Priority (Should Be Automated Soon)

### 1. PR Body Validation ⚠️ **NOT AUTOMATED**

**Script**: `scripts/validate-pr-body.sh`  
**Current Status**: Manual only  
**Should Run**: On every PR (CI workflow)  
**Purpose**: Validates PR body contains required sections (what, why, filepaths, verification, risks, rollback)

**Implementation**:
- Add to `.github/workflows/ci.yml` in `governance-verify` job
- Run before governance verification
- Fail PR if required sections missing

**Impact**: Ensures PRs follow governance framework (Principle 17: PR Narration)

---

### 2. Artifact Checking by Change Type ⚠️ **NOT AUTOMATED**

**Script**: `scripts/check-artifacts-by-change-type.js`  
**Current Status**: Manual only  
**Should Run**: On every PR (CI workflow)  
**Purpose**: Checks required artifacts based on change type (feature, api_change, security, etc.)

**Implementation**:
- Add to `.github/workflows/ci.yml` in `governance-verify` job
- Parse change type from PR description
- Verify required artifacts exist (ADR, task_packet, trace_log, etc.)

**Impact**: Ensures required artifacts are present for each change type

---

### 3. Agent Context Validation ⚠️ **NOT AUTOMATED**

**Script**: `scripts/validate-agent-context.js`  
**Current Status**: Manual only  
**Should Run**: Pre-commit (when `.agent-context.json` files change)  
**Purpose**: Validates `.agent-context.json` files against schema and checks file paths/links

**Implementation**:
- Add to `.husky/pre-commit` hook
- Only run when `.agent-context.json` files are staged
- Validate schema, check file paths exist, verify links

**Impact**: Prevents invalid context files from being committed

---

### 4. Startup Blocker Checks ⚠️ **NOT AUTOMATED**

**Script**: `scripts/check-startup-blockers.mjs`  
**Current Status**: Manual only (`npm run check:startup`)  
**Should Run**: Pre-commit or CI (on critical file changes)  
**Purpose**: Checks for common issues that prevent React Native/Expo apps from starting

**Implementation**:
- Add to `.husky/pre-commit` (lightweight check)
- Full check in CI on `package.json`, `app.json`, `babel.config.js` changes
- Warn-only in pre-commit, fail in CI

**Impact**: Catches startup issues before they reach CI

---

### 5. Evidence Validation ⚠️ **NOT AUTOMATED**

**Script**: `scripts/validate-evidence.js`  
**Current Status**: Manual only  
**Should Run**: Pre-commit (when evidence files change)  
**Purpose**: Validates evidence files against EVIDENCE_SCHEMA.json

**Implementation**:
- Add to `.husky/pre-commit` hook
- Only run when evidence files are staged
- Validate schema and required fields

**Impact**: Ensures evidence files are valid

---

## Medium Priority (Would Improve Workflow)

### 6. Deep Dependency Check ⚠️ **NOT AUTOMATED**

**Script**: `scripts/deep-dependency-check.mjs`  
**Current Status**: Manual only (`npm run check:deps`)  
**Should Run**: Weekly schedule or on dependency changes  
**Purpose**: Checks for dependency issues, circular dependencies, unused deps

**Implementation**:
- Add to CI workflow with weekly schedule
- Run on `package.json` or `package-lock.json` changes
- Warn-only (non-blocking)

**Impact**: Helps maintain clean dependency tree

---

### 7. Exception Checking ⚠️ **NOT AUTOMATED**

**Script**: `scripts/tools/check-exceptions.mjs`  
**Current Status**: Manual only (`npm run check:exceptions`)  
**Should Run**: CI on every PR  
**Purpose**: Checks for governance exceptions and ensures they're properly documented

**Implementation**:
- Add to `.github/workflows/ci.yml` in `governance-verify` job
- Run as part of governance checks
- Warn-only (non-blocking)

**Impact**: Ensures exceptions are tracked

---

### 8. Traceability Checking ⚠️ **NOT AUTOMATED**

**Script**: `scripts/tools/check-traceability.mjs`  
**Current Status**: Manual only (`npm run check:traceability`)  
**Should Run**: CI on every PR  
**Purpose**: Verifies traceability links between tasks, PRs, and artifacts

**Implementation**:
- Add to `.github/workflows/ci.yml` in `governance-verify` job
- Run as part of governance checks
- Warn-only (non-blocking)

**Impact**: Ensures proper traceability

---

### 9. Agent Platform Checking ⚠️ **NOT AUTOMATED**

**Script**: `scripts/tools/check-agent-platform.mjs`  
**Current Status**: Manual only (`npm run check:agent-platform`)  
**Should Run**: CI on every PR  
**Purpose**: Validates agent platform compatibility and requirements

**Implementation**:
- Add to `.github/workflows/ci.yml` in `governance-verify` job
- Run as part of governance checks
- Warn-only (non-blocking)

**Impact**: Ensures agent platform compatibility

---

### 10. Pattern Verification ⚠️ **NOT AUTOMATED**

**Script**: `scripts/pattern-verification.js`  
**Current Status**: Manual only  
**Should Run**: Pre-commit or CI (when PATTERNS.md files change)  
**Purpose**: Verifies pattern files exist and are referenced correctly

**Implementation**:
- Add to `.husky/pre-commit` hook
- Only run when `PATTERNS.md` files are staged
- Warn-only (non-blocking)

**Impact**: Ensures pattern files are maintained

---

## Low Priority (Nice to Have)

### 11. Documentation Metrics Update ⚠️ **NOT AUTOMATED**

**Script**: `scripts/update-documentation-metrics.mjs`  
**Current Status**: Manual only  
**Should Run**: Weekly schedule or post-commit  
**Purpose**: Updates documentation metrics (file count, TODO count, average age, etc.)

**Implementation**:
- Add to `.github/workflows/` with weekly schedule
- Or run in post-commit hook (optional)
- Auto-commit metrics file

**Impact**: Tracks documentation health over time

---

### 12. Context Verified Update ⚠️ **NOT AUTOMATED**

**Script**: `scripts/update-context-verified.js`  
**Current Status**: Manual only  
**Should Run**: Post-commit or on context file changes  
**Purpose**: Updates verification status in context files

**Implementation**:
- Add to `.husky/post-commit` hook
- Only run when `.agent-context.json` files are changed
- Update verification timestamps

**Impact**: Keeps context files up-to-date

---

## Summary Table

| Script | Priority | Should Run | Current Status |
|--------|----------|------------|----------------|
| `validate-pr-body.sh` | High | CI (on PRs) | ❌ Manual |
| `check-artifacts-by-change-type.js` | High | CI (on PRs) | ❌ Manual |
| `validate-agent-context.js` | High | Pre-commit | ❌ Manual |
| `check-startup-blockers.mjs` | High | Pre-commit + CI | ❌ Manual |
| `validate-evidence.js` | High | Pre-commit | ❌ Manual |
| `deep-dependency-check.mjs` | Medium | Weekly schedule | ❌ Manual |
| `check-exceptions.mjs` | Medium | CI (on PRs) | ❌ Manual |
| `check-traceability.mjs` | Medium | CI (on PRs) | ❌ Manual |
| `check-agent-platform.mjs` | Medium | CI (on PRs) | ❌ Manual |
| `pattern-verification.js` | Medium | Pre-commit | ❌ Manual |
| `update-documentation-metrics.mjs` | Low | Weekly schedule | ❌ Manual |
| `update-context-verified.js` | Low | Post-commit | ❌ Manual |

---

## Implementation Recommendations

### Phase 1: High Priority (Immediate)
1. Add PR body validation to CI
2. Add artifact checking to CI
3. Add agent context validation to pre-commit
4. Add startup blocker checks to pre-commit (warn-only)

### Phase 2: Medium Priority (Next Sprint)
5. Add evidence validation to pre-commit
6. Add exception/traceability/agent-platform checks to CI
7. Add pattern verification to pre-commit
8. Add deep dependency check to weekly schedule

### Phase 3: Low Priority (Future)
9. Add documentation metrics update to weekly schedule
10. Add context verified update to post-commit

---

## Notes

- All validation scripts should fail the build/commit if they find errors
- Check scripts can be warn-only (non-blocking) if appropriate
- Update scripts should auto-commit their changes when run in CI
- Pre-commit hooks should be fast (< 5 seconds) to avoid developer friction
