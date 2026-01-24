# Changelog Enforcement - Brainstorming

**Purpose:** Brainstorm strategies to enforce CHANGELOG.md updates when they should occur.

---

## 1. When Should Changelog Be Updated?

### ✅ **REQUIRED** (User-Facing Changes)

- **Feature changes** (`change_type: feature`)
  - New user-facing functionality
  - New UI components/screens
  - New user workflows
  - New configuration options visible to users

- **API changes** (`change_type: api_change`)
  - New endpoints
  - Changed request/response formats
  - Breaking API changes
  - API version changes

- **Security changes** (`change_type: security`)
  - Security improvements
  - Authentication changes
  - Permission changes
  - Vulnerability fixes (if user-visible)

- **Breaking changes**
  - Configuration format changes
  - Database schema changes affecting users
  - Removed features/endpoints
  - Changed default behavior

### ⚠️ **OPTIONAL** (May Require Update)

- **Cross-module changes** (`change_type: cross_module`)
  - Only if user-facing impact
  - Performance improvements (if significant)
  - Major refactoring (if affects user experience)

- **Non-doc changes** (`change_type: non_doc_change`)
  - Bug fixes (if user-visible)
  - Performance improvements
  - Configuration changes

### ❌ **NOT REQUIRED**

- **Documentation-only changes**
- **Test-only changes**
- **Internal refactoring** (no user impact)
- **CI/CD changes** (unless affects deployment)
- **Development tooling changes**

---

## 2. Detection Strategies

### Strategy A: Change Type Based

**Logic:**
- If `change_type` in PR is: `feature`, `api_change`, `security` → **REQUIRE** changelog
- If `change_type` is: `cross_module` → **WARN** (check if user-facing)
- If `change_type` is: `non_doc_change` → **WARN** (check if bug fix or user-visible)
- If `change_type` is: `doc-only` → **SKIP**

**Pros:**
- Simple to implement
- Leverages existing change type system
- Clear rules

**Cons:**
- May miss edge cases
- Requires accurate change type classification

### Strategy B: File Path Based

**Logic:**
- Check changed files for user-facing paths:
  - `apps/mobile/` (UI changes)
  - `apps/api/routes/` (API changes)
  - `packages/contracts/` (API contract changes)
  - `docs/` (if user-facing docs)
- Exclude:
  - `*.test.*`, `*.spec.*` (test files)
  - `.repo/` (internal governance)
  - `docs/development/`, `docs/architecture/` (dev docs)

**Pros:**
- Catches changes regardless of change type accuracy
- Objective (file paths are clear)

**Cons:**
- May have false positives (internal refactoring)
- Requires maintaining path patterns

### Strategy C: Git Diff Analysis

**Logic:**
- Analyze git diff for patterns:
  - New exports in `packages/contracts/` → API change
  - New routes in `apps/api/` → API change
  - New screens in `apps/mobile/` → Feature
  - Security-related keywords → Security change
  - Breaking change markers (`BREAKING:`, `[BREAKING]`)

**Pros:**
- Most accurate detection
- Catches breaking changes automatically

**Cons:**
- Complex to implement
- Requires parsing diffs
- May miss semantic changes

### Strategy D: Hybrid Approach (Recommended)

**Combine:**
1. **Primary:** Change type from PR description
2. **Secondary:** File path analysis
3. **Tertiary:** Git diff keywords (for breaking changes)

**Logic:**
```
IF change_type IN ['feature', 'api_change', 'security']:
    REQUIRE changelog
ELSE IF change_type == 'cross_module' AND touches_user_facing_files:
    REQUIRE changelog
ELSE IF change_type == 'non_doc_change' AND (is_bug_fix OR touches_user_facing_files):
    WARN (suggest changelog)
ELSE IF git_diff_contains_breaking_markers:
    REQUIRE changelog
ELSE:
    SKIP
```

---

## 3. Enforcement Mechanisms

### Option 1: CI Check (Hard Block)

**Implementation:**
- Add check to `governance-verify.js`
- Run in CI before merge
- **Hard fail** if changelog required but missing

**Pros:**
- Strongest enforcement
- Prevents merging without changelog

**Cons:**
- May block legitimate cases
- Requires accurate detection

**Code Location:**
```javascript
// In governance-verify.js
function checkChangelog() {
  const changeType = parseChangeTypeFromPR();
  const requiresChangelog = ['feature', 'api_change', 'security'].includes(changeType);
  
  if (requiresChangelog) {
    const changelogUpdated = checkChangelogUpdated();
    if (!changelogUpdated) {
      logError("CHANGELOG.md must be updated for feature/api_change/security changes");
      return false;
    }
  }
  return true;
}
```

### Option 2: CI Check (Soft Warning)

**Implementation:**
- Add check to `governance-verify.js`
- Run in CI
- **Warn** if changelog should be updated but missing
- Don't block merge

**Pros:**
- Less strict, allows exceptions
- Still raises awareness

**Cons:**
- May be ignored
- Weaker enforcement

### Option 3: Pre-commit Hook

**Implementation:**
- Git pre-commit hook
- Check before commit
- Can be bypassed with `--no-verify`

**Pros:**
- Catches early (before PR)
- Fast feedback

**Cons:**
- Can be bypassed
- May slow down commits

### Option 4: Agent Workflow Step

**Implementation:**
- Add to `procedures.json.three_pass_workflow.pass3_verify`
- Agent checks and updates changelog as part of workflow

**Pros:**
- Automated
- Part of agent's natural workflow

**Cons:**
- Only works for agent-created PRs
- Requires agent to understand what to write

**Code Location:**
```json
// In procedures.json
"pass3_verify": {
  "steps": [
    "...",
    "Update CHANGELOG.md if change type requires it (feature/api_change/security)",
    "..."
  ]
}
```

### Option 5: PR Template Reminder

**Implementation:**
- Add checkbox to PR template:
  ```markdown
  - [ ] CHANGELOG.md updated (if feature/api_change/security)
  ```

**Pros:**
- Simple
- Reminds without blocking

**Cons:**
- Easy to check without actually updating
- No enforcement

### Option 6: Automated Changelog Generation

**Implementation:**
- Script analyzes PR and generates changelog entry
- Agent/human reviews and commits

**Pros:**
- Reduces manual work
- Consistent format

**Cons:**
- May generate low-quality entries
- Requires review anyway

---

## 4. Detection Implementation Details

### Change Type Parsing

**From PR Description:**
```javascript
function parseChangeType(prDescription) {
  // JSON format: "change_type": "feature"
  const jsonMatch = prDescription.match(/"change_type"\s*:\s*"([^"]+)"/);
  if (jsonMatch) return jsonMatch[1];
  
  // Markdown format: ## Change Type: feature
  const mdMatch = prDescription.match(/change[_\s]?type[:：]\s*(\w+)/i);
  if (mdMatch) return mdMatch[1].toLowerCase();
  
  return null;
}
```

### Changelog Update Detection

**Check if CHANGELOG.md was modified:**
```javascript
function checkChangelogUpdated() {
  // Check git diff for CHANGELOG.md
  try {
    const diff = execSync('git diff --name-only HEAD origin/main', { encoding: 'utf8' });
    return diff.includes('CHANGELOG.md');
  } catch (err) {
    // Fallback: check if file exists and was recently modified
    const stats = fs.statSync('CHANGELOG.md');
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return stats.mtimeMs > oneDayAgo;
  }
}
```

### User-Facing File Detection

**Pattern matching:**
```javascript
const USER_FACING_PATTERNS = [
  /^apps\/mobile\//,           // Mobile UI
  /^apps\/api\/routes\//,     // API routes
  /^packages\/contracts\//,    // API contracts
  /^docs\/(?!development|architecture)/, // User docs (exclude dev docs)
];

const INTERNAL_PATTERNS = [
  /\.test\./, /\.spec\./,      // Test files
  /^\.repo\//,                 // Governance
  /^docs\/(development|architecture)/, // Dev docs
];

function isUserFacing(filePath) {
  if (INTERNAL_PATTERNS.some(p => p.test(filePath))) return false;
  return USER_FACING_PATTERNS.some(p => p.test(filePath));
}
```

### Breaking Change Detection

**Keyword detection:**
```javascript
const BREAKING_KEYWORDS = [
  /\[BREAKING\]/i,
  /BREAKING:/i,
  /breaking change/i,
  /removed/i,
  /deprecated/i,
];

function hasBreakingChange(prDescription, gitDiff) {
  const text = (prDescription + ' ' + gitDiff).toLowerCase();
  return BREAKING_KEYWORDS.some(pattern => pattern.test(text));
}
```

---

## 5. Recommended Implementation

### Phase 1: Soft Enforcement (Warning)

1. **Add to `governance-verify.js`:**
   - Check change type from PR
   - Check if CHANGELOG.md was modified
   - **Warn** if required but missing (don't block)

2. **Add to PR template:**
   - Checkbox reminder

3. **Add to agent workflow:**
   - Reminder in Pass 3 (Verify)

### Phase 2: Hard Enforcement (Block)

1. **Refine detection logic** based on Phase 1 feedback
2. **Upgrade to hard fail** in CI
3. **Add exceptions mechanism** (waiver-like system)

### Phase 3: Automation (Optional)

1. **Auto-generate changelog entries** from PR
2. **Agent updates changelog** as part of workflow

---

## 6. Edge Cases & Exceptions

### Exception Cases

- **Hotfixes:** May skip changelog if urgent
- **Internal-only changes:** Even if change_type is feature, if no user impact
- **WIP PRs:** Don't require changelog until ready for review
- **Revert PRs:** May reference original changelog entry

### Handling Ambiguity

- **Default to requiring changelog** if uncertain
- **Allow waiver** (similar to quality gate waivers)
- **Human review** for edge cases

---

## 7. Changelog Format Requirements

### Required Format

Follow [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
## [Unreleased]

### Added
- New feature X

### Changed
- Improved Y

### Fixed
- Bug Z

### Security
- Security improvement
```

### Entry Requirements

- **Date:** Optional (can use "Unreleased" section)
- **Change type:** Must match PR change type
- **Description:** Clear, user-focused
- **Links:** Optional (link to PR, issue, etc.)

---

## 8. Integration Points

### Files to Modify

1. **`.repo/automation/scripts/governance-verify.js`**
   - Add `checkChangelog()` function
   - Integrate into verification flow

2. **`.repo/policy/procedures.json`**
   - Add changelog step to `pass3_verify`
   - Add changelog requirements to change types

3. **`.repo/templates/PR_TEMPLATE.md`**
   - Add changelog checkbox

4. **`.repo/repo.manifest.yaml`**
   - Add `check:changelog` command (optional)

5. **`CHANGELOG.md`** (root)
   - Ensure format is documented
   - Add "Unreleased" section

---

## 9. Success Metrics

- **Coverage:** % of user-facing PRs with changelog entries
- **Accuracy:** % of changelog entries that are actually user-facing
- **Completeness:** % of changelog entries with proper format
- **Timeliness:** % of changelog entries added before merge

---

## 10. Next Steps

1. ✅ **Move CHANGELOG.md to root** (DONE)
2. ⏭️ **Implement Phase 1** (soft warning in governance-verify)
3. ⏭️ **Add to PR template** (checkbox reminder)
4. ⏭️ **Add to agent workflow** (Pass 3 step)
5. ⏭️ **Monitor and refine** (based on usage)
6. ⏭️ **Upgrade to Phase 2** (hard enforcement) if needed
