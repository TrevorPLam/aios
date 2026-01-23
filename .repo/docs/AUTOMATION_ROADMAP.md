# Full Automation Roadmap

**Date:** 2026-01-23  
**Status:** Most automation in place, some setup and implementation needed

---

## ✅ What's Already Automated

### Core Automation (Complete)
- ✅ Governance verification (runs in CI, local, pre-commit)
- ✅ HITL status sync to PRs (automatic in CI)
- ✅ Trace log validation
- ✅ PR body validation
- ✅ Task format validation
- ✅ HITL item creation (script available)
- ✅ Waiver management (create, check-expired, list)
- ✅ Task archiving
- ✅ Git integration for changed files detection

### CI/CD Integration (Complete)
- ✅ GitHub Actions workflow (Job 7: governance-verify)
- ✅ Automatic HITL sync on PRs
- ✅ Merge blocking on hard gate failures
- ✅ Warning on waiverable failures

### Local Tools (Complete)
- ✅ Makefile targets (`make check-governance`)
- ✅ Pre-commit hooks (non-blocking)
- ✅ All Python scripts with dry-run support

---

## 🔧 What Needs Setup/Configuration

### 1. Pre-commit Hooks Installation ⚠️ **REQUIRES SETUP**

**Status:** Configuration exists, needs installation

**Action Required:**
```bash
# Install pre-commit hooks
pre-commit install

# Test the hooks
pre-commit run --all-files
```

**Files:**
- `.pre-commit-config.yaml` ✅ (exists)
- Pre-commit framework installation needed

---

### 2. Python Dependencies ⚠️ **REQUIRES SETUP**

**Status:** Scripts exist, dependencies need installation

**Action Required:**
```bash
# Install Python dependencies
pip install -r .repo/automation/scripts/requirements.txt

# Or add to project setup
# Add to package.json scripts or Makefile
```

**Files:**
- `.repo/automation/scripts/requirements.txt` ✅ (exists)
- Dependencies: `requests>=2.31.0`

**Recommendation:** Add to `Makefile install` target (already done ✅)

---

### 3. Security Pattern Enforcement ⚠️ **NEEDS IMPLEMENTATION**

**Status:** Patterns defined, enforcement not implemented

**Current State:**
- ✅ Security patterns defined in `SECURITY_BASELINE.md`
- ❌ `check:security` only runs `npm audit`
- ❌ Forbidden pattern scanning not implemented

**Action Required:**
1. Create script to scan for forbidden patterns
2. Integrate into `check:security` command
3. Add to CI workflow

**Files to Create:**
- `.repo/automation/scripts/check-security-patterns.js` (new)
- Update `package.json` scripts
- Update `.repo/repo.manifest.yaml` `check:security` command

**Example Implementation:**
```javascript
// Scan files for forbidden patterns
// Read patterns from SECURITY_BASELINE.md
// Report violations
// Exit with error if violations found
```

---

### 4. Boundary Checker Implementation ⚠️ **NEEDS DECISION + IMPLEMENTATION**

**Status:** Documented, not implemented

**Current State:**
- ✅ Policy defined in `BOUNDARIES.md`
- ✅ Documentation exists
- ❌ `check:boundaries` is `<UNKNOWN>` in manifest
- ❌ No actual checker implementation

**Decision Needed:**
Choose implementation approach:
- **Option A:** ESLint custom rule (recommended - already using ESLint)
- **Option B:** import-linter (purpose-built, additional dependency)

**Action Required (if Option A - ESLint):**
1. Create ESLint rule for boundary checking
2. Configure in `.eslintrc.js`
3. Add to `package.json` scripts: `"check:boundaries": "eslint . --rule boundary-checker"`
4. Update manifest: `check:boundaries: "npm run check:boundaries"`
5. Integrate into CI

**Action Required (if Option B - import-linter):**
1. Install import-linter: `npm install --save-dev import-linter`
2. Create `.importlinterrc` configuration
3. Add to `package.json` scripts
4. Update manifest
5. Integrate into CI

**Files to Create/Update:**
- ESLint rule: `.repo/automation/eslint-rules/boundary-checker.js` (if Option A)
- OR import-linter config: `.importlinterrc` (if Option B)
- Update `package.json`
- Update `.repo/repo.manifest.yaml`

---

### 5. Manifest Command Validation ⚠️ **NEEDS IMPLEMENTATION**

**Status:** No validation exists

**Problem:** Manifest commands may drift from actual commands in package.json/CI

**Action Required:**
1. Create validation script
2. Check manifest commands against:
   - `package.json` scripts
   - CI workflow commands
   - Makefile targets
3. Add to governance verification or separate check

**Files to Create:**
- `.repo/automation/scripts/validate-manifest.js` (new)

**Example:**
```javascript
// Read repo.manifest.yaml
// Read package.json scripts
// Read .github/workflows/ci.yml
// Compare and report discrepancies
```

---

### 6. Agent Log System ⚠️ **NEEDS IMPLEMENTATION**

**Status:** Template exists, automation missing

**Current State:**
- ✅ Template: `.repo/templates/AGENT_LOG_TEMPLATE.md`
- ❌ No automated log creation
- ❌ No integration with three-pass workflow

**Action Required:**
1. Create agent log generator script
2. Integrate with three-pass workflow:
   - Pass 1 (Plan): Create log entry
   - Pass 2 (Change): Update log with actions
   - Pass 3 (Verify): Add evidence
3. Auto-save to `.repo/logs/` directory

**Files to Create:**
- `.repo/automation/scripts/create-agent-log.py` (new)
- `.repo/logs/` directory (new)

---

### 7. Task Promotion Automation ⚠️ **NEEDS IMPLEMENTATION**

**Status:** Archive exists, promotion missing

**Current State:**
- ✅ `archive-task.py` exists
- ❌ No script to promote from BACKLOG to TODO

**Action Required:**
1. Create `promote-task.py` script
2. Move task from `BACKLOG.md` to `TODO.md`
3. Validate task format before promotion
4. Update task status

**Files to Create:**
- `.repo/automation/scripts/promote-task.py` (new)

---

### 8. ADR Trigger Detection Enhancement ⚠️ **NEEDS ENHANCEMENT**

**Status:** Basic detection exists, needs improvement

**Current State:**
- ✅ Basic detection in `governance-verify.js`
- ⚠️ Only checks file paths, not actual code changes
- ⚠️ Doesn't detect cross-feature imports

**Action Required:**
1. Enhance detection logic:
   - Parse actual import statements
   - Detect cross-feature imports
   - Check for API signature changes
   - Detect schema changes
2. Suggest ADR creation when triggers detected
3. Link to ADR template

**Files to Update:**
- `.repo/automation/scripts/governance-verify.js` (enhance `checkArtifacts()`)

---

### 9. Evidence Collection Standardization ⚠️ **NEEDS DEFINITION**

**Status:** Requirements documented, format missing

**Action Required:**
1. Define evidence format schema
2. Create evidence validator
3. Add to governance verification
4. Document in templates

**Files to Create:**
- `.repo/templates/EVIDENCE_SCHEMA.json` (new)
- `.repo/automation/scripts/validate-evidence.js` (new)

---

### 10. Waiver Expiration Tracking in CI ⚠️ **NEEDS INTEGRATION**

**Status:** Script exists, CI integration missing

**Current State:**
- ✅ `manage-waivers.py check-expired` exists
- ❌ Not run in CI
- ❌ No alerts for expired waivers

**Action Required:**
1. Add waiver expiration check to CI workflow
2. Fail or warn on expired waivers
3. Create GitHub issue/PR comment for expired waivers

**Files to Update:**
- `.github/workflows/ci.yml` (add waiver check step)

---

### 11. Auto-Generated Waivers for Waiverable Gates ⚠️ **NEEDS IMPLEMENTATION**

**Status:** Script exists, auto-generation missing

**Current State:**
- ✅ `manage-waivers.py create` exists
- ❌ No automatic waiver generation when waiverable gates fail
- ❌ Governance-verify doesn't create waivers automatically

**Action Required:**
1. Enhance `governance-verify.js` to detect waiverable failures
2. Auto-generate waiver using `manage-waivers.py`
3. Link waiver to PR
4. Require human approval

**Files to Update:**
- `.repo/automation/scripts/governance-verify.js` (add waiver generation)

---

## 📋 Setup Checklist

### Immediate Setup (5 minutes)
- [ ] Install pre-commit hooks: `pre-commit install`
- [ ] Install Python dependencies: `pip install -r .repo/automation/scripts/requirements.txt`
- [ ] Test governance verification: `make check-governance`

### Short-Term Implementation (1-2 days)
- [ ] Implement security pattern scanning
- [ ] Choose and implement boundary checker
- [ ] Create manifest validation script
- [ ] Add waiver expiration check to CI

### Medium-Term Implementation (1 week)
- [ ] Implement agent log system
- [ ] Create task promotion script
- [ ] Enhance ADR trigger detection
- [ ] Define evidence format schema
- [ ] Add auto-waiver generation

### Long-Term (Nice-to-Have)
- [ ] Metrics dashboard
- [ ] Visual boundary map
- [ ] Auto-fix suggestions for boundary violations

---

## 🚀 Quick Start Guide

### For New Contributors

1. **Install Dependencies:**
   ```bash
   npm install
   pip install -r .repo/automation/scripts/requirements.txt
   ```

2. **Install Pre-commit Hooks:**
   ```bash
   pre-commit install
   ```

3. **Run Local Checks:**
   ```bash
   make check-governance
   ```

4. **Create HITL Item (if needed):**
   ```bash
   python3 .repo/automation/scripts/create-hitl-item.py \
       --category "Clarification" \
       --summary "Need clarification on X" \
       --required-for "feature" \
       --owner "Your Name"
   ```

### For CI/CD

The CI workflow is already configured. It will:
- ✅ Run governance verification automatically
- ✅ Sync HITL status to PRs
- ✅ Block merge on hard failures
- ⚠️ **Missing:** Security pattern scanning (needs implementation)
- ⚠️ **Missing:** Boundary checking (needs implementation)
- ⚠️ **Missing:** Waiver expiration checks (needs integration)

---

## 🎯 Priority Order

### P0 - Critical (Blocks Full Automation)
1. **Security Pattern Enforcement** - Security depends on this
2. **Boundary Checker** - Architecture enforcement depends on this
3. **Pre-commit Installation** - Local development workflow

### P1 - High (Improves Automation)
4. **Manifest Validation** - Prevents command drift
5. **Waiver Expiration in CI** - Prevents expired waivers
6. **Auto-Waiver Generation** - Completes waiver workflow

### P2 - Medium (Enhances Automation)
7. **Agent Log System** - Audit trail
8. **Task Promotion** - Workflow automation
9. **ADR Detection Enhancement** - Better trigger detection
10. **Evidence Standardization** - Consistent verification

### P3 - Low (Nice-to-Have)
11. **Metrics Dashboard** - Visibility
12. **Visual Boundary Map** - Documentation
13. **Auto-Fix Suggestions** - Developer experience

---

## 📊 Current Automation Status

| Feature | Status | Setup Needed | Implementation Needed |
|---------|--------|--------------|----------------------|
| Governance Verification | ✅ Complete | - | - |
| HITL PR Sync | ✅ Complete | - | - |
| CI Integration | ✅ Complete | - | - |
| Makefile | ✅ Complete | - | - |
| Pre-commit Hooks | ⚠️ Config Only | ✅ Install | - |
| Python Dependencies | ⚠️ Scripts Only | ✅ Install | - |
| Security Patterns | ⚠️ Defined | - | ✅ Enforcement |
| Boundary Checker | ❌ Missing | - | ✅ Full Implementation |
| Manifest Validation | ❌ Missing | - | ✅ Create Script |
| Agent Log System | ❌ Missing | - | ✅ Create System |
| Task Promotion | ❌ Missing | - | ✅ Create Script |
| ADR Detection | ⚠️ Basic | - | ✅ Enhance |
| Evidence Format | ❌ Missing | - | ✅ Define Schema |
| Waiver Expiration CI | ⚠️ Script Only | - | ✅ Integrate |
| Auto-Waiver Generation | ❌ Missing | - | ✅ Implement |

**Summary:**
- **Fully Automated:** 5 features
- **Needs Setup:** 2 features
- **Needs Implementation:** 10 features

---

## 🔗 Related Documentation

- `.repo/docs/FRAMEWORK_ANALYSIS.md` - Complete gap analysis
- `.repo/docs/IMPLEMENTATION_SUMMARY.md` - What's been implemented
- `.repo/docs/ci-integration.md` - CI setup guide
- `.repo/docs/automation-scripts.md` - Script documentation
- `.repo/docs/boundary-checker.md` - Boundary checker details

---

**End of Roadmap**
