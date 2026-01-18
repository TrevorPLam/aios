# Branch Protection Configuration Guide

**Purpose:** Configure GitHub branch protection rules to enforce documentation standards  
**Status:** Configuration required by repository administrator  
**Date:** 2026-01-18

## Required Branch Protection Rules

To enforce documentation standards as defined in GOVERNANCE.md, the following branch protection rules must be configured for the `main` and `develop` branches.

### Navigation

1. Go to: `Settings` → `Branches` → `Branch protection rules`
2. Add rule for `main` branch
3. Add rule for `develop` branch

### Required Status Checks

Enable "Require status checks to pass before merging" with the following checks:

#### Code Quality Checks (Existing)

- ✅ `type-check` - TypeScript Type Check
- ✅ `lint` - ESLint
- ✅ `format-check` - Prettier formatting
- ✅ `test` - Unit and integration tests
- ✅ `audit` - Security audit
- ✅ `build-client` - Expo build
- ✅ `build-server` - Server build

#### Documentation Checks (NEW - Required)

- ✅ `docs-validation` - Documentation spell check and markdown linting (from main CI)
- ✅ `Markdown Linting / markdownlint` - From docs-markdownlint.yml workflow
- ✅ `Check Documentation Links / link-checker` - From docs-links.yml workflow
- ✅ `Documentation Quality / spell-check` - From docs-quality.yml workflow

**Note:** Vale prose linting is configured but set to advisory (not blocking) until team is comfortable with the rules.

### Additional Protection Settings

Recommended settings:

- ✅ **Require a pull request before merging**
  - Required approvals: 1
  - Dismiss stale pull request approvals when new commits are pushed

- ✅ **Require conversation resolution before merging**
  - Ensures all review comments are addressed

- ✅ **Do not allow bypassing the above settings**
  - Enforces rules for all contributors including administrators

- ✅ **Require branches to be up to date before merging**
  - Ensures tests run against latest code

### Implementation Steps

1. **Administrator Action Required:**
   ```
   Repository Settings → Branches → Add rule
   ```

2. **Configure for `main` branch:**
   - Branch name pattern: `main`
   - Enable all checks listed above
   - Set required approvals: 1

3. **Configure for `develop` branch:**
   - Branch name pattern: `develop`
   - Enable all checks listed above
   - Set required approvals: 1

4. **Verify Configuration:**
   - Create a test PR
   - Verify all status checks appear
   - Verify PR cannot be merged until all checks pass

### Status Check Names Reference

Copy these exact names when configuring required status checks:

```
type-check
lint
format-check
docs-validation
test
audit
build-client
build-server
```

For documentation-specific workflows, also require:

```
Markdown Linting / markdownlint
Check Documentation Links / link-checker
Documentation Quality / spell-check
```

### Troubleshooting

**Issue:** Status check not appearing  
**Solution:** Check that the workflow file exists and has run at least once on the branch

**Issue:** Too many required checks slowing down development  
**Solution:** Consider making some checks advisory only (run but don't block) during initial rollout

**Issue:** Vale prose linting too strict  
**Solution:** Vale is currently set to `suggestion` level and not blocking. Can adjust `.vale.ini` as needed.

### Verification Checklist

After configuration:

- [ ] Create test PR with only code changes → Should require all code checks
- [ ] Create test PR with documentation changes → Should require all code + docs checks
- [ ] Create test PR with spelling errors → Should be blocked by spell check
- [ ] Create test PR with broken markdown links → Should be blocked by link check
- [ ] Verify cannot merge without approval
- [ ] Verify cannot merge with unresolved conversations

## Governance Compliance

This configuration enforces the Documentation Review Checklist from GOVERNANCE.md (lines 71-79):

- ✅ Markdownlint passes (enforced)
- ✅ Links validated (enforced)
- ✅ Spell check passes (enforced)
- 🟡 Vale prose linting passes (advisory, not blocking yet)
- ⚠️ Diátaxis structure (manual review)
- ⚠️ Plain English Summary (manual review)
- ⚠️ Technical Detail provided (manual review)
- ⚠️ Examples/commands provided (manual review)

**Automated:** 3/8 checklist items  
**Advisory:** 1/8 checklist items  
**Manual Review:** 4/8 checklist items

### Future Enhancements

Consider adding:

1. **Documentation coverage check** - Script to verify all new features have documentation
2. **ADR enforcement** - Check for ADR when architecture files change
3. **Vale as blocking** - After team familiarity, make Vale checks required
4. **Plain English Summary validator** - Script to check for required sections

---

**Action Required:** Repository administrator must configure branch protection rules as described above.

**Reference:** GOVERNANCE_COMPLIANCE_ANALYSIS.md - Priority 1, Item 3
