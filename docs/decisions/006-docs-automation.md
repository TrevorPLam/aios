# ADR-006: Documentation automation and quality enforcement

**Status:** Accepted
**Date:** 2026-01-17
**Context:** PR #94 - Documentation and automation system

## Context

As AIOS grows, documentation quality becomes critical for maintainability, onboarding, and community contributions. Manual documentation review is:

- Time-consuming for maintainers
- Inconsistent in enforcement
- Prone to human error (broken links, typos)
- Difficult to scale with project growth

The project needs automated documentation quality enforcement that runs on every PR.

## Decision

Implement a comprehensive documentation automation system with multiple layers:

### 1. Markdown Linting

**Tool:** markdownlint
**Config:** `.markdownlint.json`
**Workflow:** `.github/workflows/docs-markdownlint.yml`

Enforces:

- Consistent heading structure
- Proper list formatting
- No trailing spaces
- Consistent code block formatting

### 2. Link Validation

**Tool:** Lychee
**Config:** `.lycheeignore`
**Workflow:** `.github/workflows/docs-links.yml`

Features:

- Validates internal and external links
- Weekly scheduled checks
- Caching to reduce API calls
- Creates issues for broken links
- PR comments for immediate feedback

### 3. Spell Checking

**Tool:** cspell
**Config:** `.cspell.json`
**Workflow:** `.github/workflows/docs-quality.yml`

Features:

- Project-specific dictionary
- Catches typos before merge
- Code-aware (ignores technical terms)
- Fast and lightweight

### 4. Prose Linting

**Tool:** Vale
**Config:** `.vale.ini`, `.vale/Vocab/AIOS/`
**Workflow:** `.github/workflows/docs-vale.yml`

Features:

- Style consistency (e.g., Microsoft Writing Style Guide)
- Readability improvements
- Terminology consistency
- Project vocabulary support

### 5. Documentation Metrics

**Script:** `scripts/docs/update-documentation-metrics.mjs`
**Workflow:** `.github/workflows/documentation-metrics.yml`

Tracks:

- Number of active docs
- Average doc age
- TODO count
- CI pass rate
- Issue resolution time

### 6. Issue Automation

#### Workflows

- `documentation-issue-automation.yml` - Auto-label and triage
- `documentation-stale.yml` - Manage stale issues

## Alternatives Considered

### 1. Manual Review Only

#### Pros

- No tooling setup
- Human judgment for context

### Cons

- Doesn't scale
- Inconsistent enforcement
- Reviewer fatigue

**Why rejected:** Not sustainable for growing project

### 2. Single All-in-One Tool

#### Pros (2)

- Simpler configuration
- Single workflow

### Cons (2)

- Less flexible
- May miss edge cases
- Vendor lock-in

**Why rejected:** Best-of-breed approach gives better results

### 3. Pre-commit Hooks Only

#### Pros (3)

- Catches issues locally
- Immediate feedback

### Cons (3)

- Can be bypassed
- Not enforced in CI
- Inconsistent setup across contributors

**Why rejected:** Need CI enforcement as source of truth

## Consequences

### Positive

- **Consistent quality** - Automated checks catch issues
- **Faster reviews** - Maintainers focus on content, not formatting
- **Better contributor experience** - Clear, actionable feedback
- **Prevents regressions** - Broken links caught immediately
- **Scalable** - Handles growing documentation without manual effort
- **Measurable** - Metrics track documentation health over time

### Negative

- **Initial setup complexity** - Multiple tools to configure
- **Maintenance overhead** - Tools need updates
- **False positives** - Requires dictionary maintenance
- **CI time** - Documentation checks add ~2-3 minutes per PR
- **Learning curve** - Contributors need to understand tools

### Mitigations

- Comprehensive setup guide: `.github/BRANCH_PROTECTION_SETUP.md`
- Well-documented configurations with comments
- Project-specific dictionary reduces false positives
- Parallel workflow execution minimizes CI time
- Clear error messages with fix suggestions

## Implementation Details

### Workflow Triggers

- **On PR:** docs-markdownlint, docs-vale, docs-links (changed files only)
- **On push to main:** All workflows (full validation)
- **Scheduled:** docs-links (weekly), documentation-metrics (monthly)
- **Manual:** All workflows support workflow_dispatch

### Performance Optimization

- Cache lychee results (reduces API calls)
- Run only on changed files in PRs
- Parallel workflow execution
- Fail fast on critical errors

### Integration Points

- PR comments for immediate feedback
- Status checks in CI (blocking)
- Issue creation for scheduled checks
- Metrics dashboard in DOCUMENTATION_METRICS.md

## Related Decisions

- ADR-004: Documentation structure (provides foundation)
- Future: ADR on branch protection rules (enforcement)

## References

- Workflows: `.github/workflows/docs-*.yml`
- Configurations: `.markdownlint.json`, `.cspell.json`, `.vale.ini`, `.lycheeignore`
- Metrics: `DOCUMENTATION_METRICS.md`
- Best practices: `DOCUMENTATION_BEST_PRACTICES.md`

---

**Accepted by:** Development team
**Implementation:** Complete in PR #94
**Status checks:** Active and blocking on main/develop branches
