# ADR-007: Governance enforcement via CI pipeline

**Status:** Accepted  
**Date:** 2026-01-18  
**Context:** Current PR - Governance compliance implementation

## Context

GOVERNANCE.md defines standards for code and documentation quality, but without automated enforcement, these standards rely on manual review. As the project scales:

- Manual enforcement is inconsistent
- Governance violations slip through review
- Maintainer time is spent on policy enforcement rather than strategic review
- New contributors may not be aware of all requirements

The project needs to automatically enforce governance requirements in the CI pipeline.

## Decision

Integrate governance enforcement directly into the main CI workflow (`.github/workflows/ci.yml`) by:

### 1. Documentation Validation Job

Add `docs-validation` job to main CI that runs:

```yaml
- Spell check (cspell with strict mode)
- Markdown linting (markdownlint)
- Enforces on all PRs
- Blocks merge on failure
```

### 2. Branch Protection Rules

Require all CI checks to pass before merge:

**Code checks:**
- TypeScript type checking
- ESLint
- Prettier formatting
- Unit tests
- Security audit
- Client build
- Server build

**Documentation checks (NEW):**
- docs-validation (spell + markdown)
- Documentation workflows (links, quality)

**Configuration guide:** `.github/BRANCH_PROTECTION_SETUP.md`

### 3. Phased Rollout Approach

**Phase 1 (Current):**
- Add docs-validation to main CI
- Make core checks blocking
- Vale set to advisory (suggestion level)

**Phase 2 (After team familiarity):**
- Make Vale checks blocking
- Add custom governance rules
- Implement automated Diátaxis categorization check

**Phase 3 (Future):**
- ADR requirement detection (when architecture files change)
- Plain English Summary validation
- Documentation coverage requirements

## Alternatives Considered

### 1. Separate Documentation CI Pipeline

**Pros:**
- Faster code-only PRs
- Can evolve independently
- Optional for documentation-only changes

**Cons:**
- Easy to ignore/bypass
- Creates two classes of PRs
- Doesn't enforce governance consistently

**Why rejected:** Governance requires consistent enforcement across all changes

### 2. Pre-merge Manual Checklist

**Pros:**
- Flexible for edge cases
- Human judgment

**Cons:**
- Not scalable
- Easy to forget
- Inconsistent across reviewers

**Why rejected:** Automation is more reliable and scalable

### 3. Git Hooks (Pre-commit/Pre-push)

**Pros:**
- Catches issues early
- Fast feedback

**Cons:**
- Can be bypassed (`--no-verify`)
- Not enforced for all contributors
- Doesn't work in web-based Git editors

**Why rejected:** CI is the enforcement point of truth

### 4. Post-merge Quality Checks

**Pros:**
- Doesn't block development
- Can be more comprehensive

**Cons:**
- Allows violations into main
- Requires rollback/hotfixes
- Breaks main branch

**Why rejected:** Prevention is better than cure

## Consequences

### Positive

- **Automated governance** - Standards enforced automatically
- **Consistent quality** - All PRs meet same bar
- **Faster reviews** - Reviewers focus on content and design
- **Clear expectations** - Contributors see requirements upfront
- **Prevents regressions** - No backsliding on quality
- **Measurable compliance** - CI status shows governance health

### Negative

- **Longer CI times** - Documentation checks add ~2-3 minutes
- **Initial friction** - Contributors must fix validation errors
- **Tool maintenance** - Configurations need updates
- **False positives** - May require dictionary/rule adjustments
- **Learning curve** - Team needs to understand tooling

### Mitigations

- Parallel job execution minimizes total CI time
- Clear error messages with fix suggestions
- Comprehensive documentation: `BRANCH_PROTECTION_SETUP.md`
- Phased rollout reduces initial friction
- Regular review and tuning of rules

## Implementation Strategy

### Stage 1: Foundation (Complete)
- ✅ Add Vale configuration (`.vale.ini`)
- ✅ Expand spell check dictionary (`.cspell.json`)
- ✅ Add docs-validation job to main CI
- ✅ Document branch protection requirements

### Stage 2: Enforcement (In Progress)
- ⏳ Administrator configures branch protection
- ⏳ Monitor for false positives
- ⏳ Adjust rules based on feedback

### Stage 3: Enhancement (Future)
- ⏸️ Add custom governance rules
- ⏸️ Implement ADR enforcement
- ⏸️ Add Plain English Summary validation
- ⏸️ Make Vale checks blocking

## Compliance Scorecard

After implementation:

| Governance Requirement | Before | After | Status |
|------------------------|--------|-------|--------|
| Markdownlint passes | Manual | Automated | ✅ Enforced |
| Links validated | Separate | Automated | ✅ Enforced |
| Spell check passes | Separate | Automated | ✅ Enforced |
| Vale prose linting | Missing | Advisory | 🟡 Added |
| Diátaxis structure | Manual | Manual | ⏸️ Future |
| Plain English Summary | Manual | Manual | ⏸️ Future |
| Technical Detail | Manual | Manual | ⏸️ Future |
| Examples provided | Manual | Manual | ⏸️ Future |

**Automation coverage:** 3/8 → 4/8 (50% increase)

## Related Decisions

- ADR-004: Documentation structure (what we enforce)
- ADR-006: Documentation automation (tools we use)
- Future: ADR on custom governance rules

## Verification

After branch protection configuration:

```bash
# Test 1: PR with spelling errors should be blocked
# Test 2: PR with broken markdown should be blocked
# Test 3: PR with valid docs should pass
# Test 4: Code-only PR should still require docs checks
```

## References

- Main CI workflow: `.github/workflows/ci.yml`
- Branch protection guide: `.github/BRANCH_PROTECTION_SETUP.md`
- Governance: `GOVERNANCE.md` (lines 71-79)
- Analysis: `GOVERNANCE_COMPLIANCE_ANALYSIS.md`

---

**Accepted by:** Development team  
**Implementation:** In progress (awaiting branch protection configuration)  
**Expected completion:** 2026-01-18
