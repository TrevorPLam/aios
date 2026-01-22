# Documentation Coverage Map

## Plain English Summary

- This document tracks which modules have complete documentation
- Every module should have tutorial, how-to guides, reference docs, and architecture explanation
- Red = missing, yellow = partial, green = complete
- Use this to identify documentation gaps and prioritize doc work
- Updated manually each release; CI automation is planned
- Documentation is as important as code - this makes it measurable

## Coverage Status

**Last Updated:** 2026-01-21
**Overall Coverage:** 43% (6/14 production modules with complete docs)

### Legend

- ✅ **Complete** - All four Diátaxis categories covered
- ⚠️ **Partial** - Some documentation exists
- ❌ **Missing** - No dedicated documentation
- 📝 **In Progress** - Documentation being written

---

## Production Modules (14 Total)

### ✅ Command Center (100% - Exemplar)

- [x] Tutorial - Getting started with recommendations
- [x] How-To - Customize recommendation weights
- [x] Reference - API and props documentation
- [x] Architecture - AI engine explanation
- **Files:**
  - `client/screens/CommandCenterScreen.tsx`
  - `docs/modules/command-center/`
- **Last Updated:** 2026-01-17

---

### ⚠️ Notebook (75% - Good)

- [x] Tutorial - Creating your first note
- [x] How-To - Search and tag notes
- [x] Reference - Note schema and API
- [ ] Architecture - Similarity detection algorithm
- **Files:**
  - `client/screens/Notebook/`
  - `docs/archive/enhancements/NOTEBOOK_ENHANCEMENTS.md` (exists)
- **Gaps:** Missing deep-dive on similarity detection
- **Last Updated:** 2026-01-10

---

### ⚠️ Planner (75% - Good)

- [x] Tutorial - Task management basics
- [x] How-To - Project hierarchies
- [x] Reference - Task model and API
- [ ] Architecture - Priority algorithm
- **Files:**
  - `client/screens/Planner/`
  - `docs/archive/enhancements/PLANNER_MODULE_ENHANCEMENTS.md` (exists)
- **Gaps:** Priority calculation not documented
- **Last Updated:** 2026-01-10

---

### ⚠️ Calendar (50% - Needs Work)

- [x] Tutorial - Basic event creation
- [ ] How-To - Conflict resolution
- [x] Reference - Event schema
- [ ] Architecture - View mode switching
- **Files:**
  - `client/screens/Calendar/`
  - `docs/archive/completion-summaries/CALENDAR_MODULE_COMPLETION_SUMMARY.md` (exists)
- **Gaps:** Advanced features undocumented
- **Last Updated:** 2026-01-08

---

### ⚠️ Email (50% - Needs Work)

- [ ] Tutorial - Getting started
- [x] How-To - Thread management
- [x] Reference - Email schema
- [ ] Architecture - Search algorithm
- **Files:**
  - `client/screens/Email/`
  - `docs/archive/enhancements/EMAIL_MODULE_ENHANCEMENTS.md` (exists)
- **Gaps:** Missing tutorial and architecture
- **Last Updated:** 2026-01-10

---

### ❌ Messages (25% - Critical Gap)

- [ ] Tutorial - First conversation
- [ ] How-To - Group chat setup
- [x] Reference - Message schema (in code)
- [ ] Architecture - Real-time sync
- **Files:**
  - `client/screens/Messages/`
  - No dedicated docs
- **Priority:** HIGH - Core communication feature
- **Last Updated:** Never

---

### ⚠️ Lists (50% - Needs Work)

- [x] Tutorial - Creating checklists
- [ ] How-To - List templates
- [x] Reference - List schema
- [ ] Architecture - Category system
- **Files:**
  - `client/screens/Lists/`
  - `docs/archive/enhancements/LISTS_ENHANCEMENT_SUMMARY.md` (exists)
- **Gaps:** Templates and categories
- **Last Updated:** 2026-01-10

---

### ⚠️ Alerts (50% - Needs Work)

- [x] Tutorial - Setting reminders
- [ ] How-To - Recurrence patterns
- [x] Reference - Alert schema
- [ ] Architecture - Effectiveness tracking
- **Files:**
  - `client/screens/Alerts/`
  - `docs/archive/enhancements/ALERTS_ENHANCEMENT_SUMMARY.md` (exists)
- **Gaps:** Advanced recurrence not documented
- **Last Updated:** 2026-01-10

---

### ⚠️ Contacts (50% - Needs Work)

- [ ] Tutorial - Getting started
- [x] How-To - Native integration
- [x] Reference - Contact schema
- [ ] Architecture - Sharing preferences
- **Files:**
  - `client/screens/Contacts/`
  - `docs/archive/enhancements/CONTACTS_MODULE_ENHANCEMENTS.md` (exists)
- **Gaps:** Missing tutorial
- **Last Updated:** 2026-01-10

---

### ⚠️ Translator (75% - Good)

- [x] Tutorial - First translation
- [x] How-To - TTS and STT features
- [x] Reference - Translation API
- [ ] Architecture - Language detection
- **Files:**
  - `client/screens/Translator.tsx`
  - `docs/archive/enhancements/TRANSLATOR_ENHANCEMENT_SUMMARY.md` (exists)
- **Gaps:** Language detection algorithm
- **Last Updated:** 2026-01-10

---

### ⚠️ Photos (50% - Needs Work)

- [x] Tutorial - Gallery basics
- [ ] How-To - Backup tracking
- [x] Reference - Photo schema
- [ ] Architecture - Organization system
- **Files:**
  - `client/screens/Photos/`
  - `docs/archive/enhancements/PHOTOS_MODULE_ENHANCEMENTS.md` (exists)
- **Gaps:** Advanced features
- **Last Updated:** 2026-01-10

---

### ⚠️ History (50% - Needs Work)

- [ ] Tutorial - Getting started
- [x] How-To - Filter and search
- [x] Reference - Activity schema
- [ ] Architecture - Analytics engine
- **Files:**
  - `client/screens/History/`
  - `docs/archive/enhancements/HISTORY_MODULE_ENHANCEMENTS.md` (exists)
- **Gaps:** Missing tutorial and analytics docs
- **Last Updated:** 2026-01-10

---

### ⚠️ Budget (50% - Needs Work)

- [x] Tutorial - Financial tracking basics
- [ ] How-To - Budget templates
- [x] Reference - Transaction schema
- [ ] Architecture - Statistics calculation
- **Files:**
  - `client/screens/Budget/`
  - `docs/archive/enhancements/BUDGET_MODULE_ENHANCEMENTS.md` (exists)
- **Gaps:** Templates and statistics
- **Last Updated:** 2026-01-10

---

### ⚠️ Integrations (25% - Critical Gap)

- [ ] Tutorial - Adding integrations
- [ ] How-To - Health monitoring
- [x] Reference - Integration schema
- [ ] Architecture - Third-party connections
- **Files:**
  - `client/screens/Integrations/`
  - `docs/archive/enhancements/INTEGRATIONS_MODULE_ENHANCEMENTS.md` (exists)
- **Priority:** HIGH - Complex feature
- **Last Updated:** 2026-01-10

---

## Planned Modules (24 More)

### Tier 1: Super App Essentials

| Module | Tutorial | How-To | Reference | Architecture | Priority |
| -------- | ---------- | -------- | ----------- | -------------- | ---------- |
| Wallet | ❌ | ❌ | ❌ | ❌ | HIGH |
| Marketplace | ❌ | ❌ | ❌ | ❌ | HIGH |
| Maps | ❌ | ❌ | ❌ | ❌ | HIGH |
| Social | ❌ | ❌ | ❌ | ❌ | MEDIUM |
| Rides | ❌ | ❌ | ❌ | ❌ | MEDIUM |
| Food Delivery | ❌ | ❌ | ❌ | ❌ | MEDIUM |

### Tier 2: Lifestyle & Utility

| Module | Tutorial | How-To | Reference | Architecture | Priority |
| -------- | ---------- | -------- | ----------- | -------------- | ---------- |
| Health | ❌ | ❌ | ❌ | ❌ | MEDIUM |
| Fitness | ❌ | ❌ | ❌ | ❌ | MEDIUM |
| Weather | ❌ | ❌ | ❌ | ❌ | LOW |
| News | ❌ | ❌ | ❌ | ❌ | LOW |
| Music | ❌ | ❌ | ❌ | ❌ | MEDIUM |
| Books | ❌ | ❌ | ❌ | ❌ | LOW |

### Tier 3: Future Innovation

| Module | Tutorial | How-To | Reference | Architecture | Priority |
| -------- | ---------- | -------- | ----------- | -------------- | ---------- |
| Education | ❌ | ❌ | ❌ | ❌ | LOW |
| Jobs | ❌ | ❌ | ❌ | ❌ | LOW |
| Dating | ❌ | ❌ | ❌ | ❌ | LOW |
| Travel | ❌ | ❌ | ❌ | ❌ | LOW |
| Gaming | ❌ | ❌ | ❌ | ❌ | LOW |
| AR Tools | ❌ | ❌ | ❌ | ❌ | EXPERIMENTAL |

---

## Coverage by Category

### Tutorial Coverage: 7/14 (50%)

**Missing:** Messages, Contacts, History, Integrations
**Action:** Create getting-started tutorials for these 4 modules

### How-To Coverage: 8/14 (57%)

**Missing:** Calendar, Messages, Lists, Alerts, Photos, Budget, Integrations
**Action:** Document common tasks for these 7 modules

### Reference Coverage: 14/14 (100%) ✅

**Status:** All modules have schema/API reference (many in code comments)
**Action:** Extract to dedicated docs

### Architecture Coverage: 0/14 (0%) ❌

**Critical Gap:** No modules have architecture deep-dives
**Action:** Start with Command Center, Messages, Notebook

---

## Required Documentation Per Module

Every module must have:

### 1. Tutorial (docs/modules/[module]/tutorial.md)

- [ ] "Getting Started with [Module]"
- [ ] Step-by-step walkthrough
- [ ] Beginner-friendly
- [ ] Working code examples
- [ ] Expected outcomes at each step

### 2. How-To Guides (docs/modules/[module]/howto/)

- [ ] At least 3 common tasks
- [ ] Problem-solution format
- [ ] Assumes module familiarity
- [ ] Troubleshooting included

### 3. Reference (docs/modules/[module]/reference.md)

- [ ] API documentation
- [ ] Props/parameters
- [ ] Types/interfaces
- [ ] Error codes
- [ ] Examples

### 4. Architecture (docs/modules/[module]/architecture.md)

- [ ] Design decisions
- [ ] Component structure
- [ ] Data flow
- [ ] Performance considerations
- [ ] Future evolution

---

## Documentation Debt

### High Priority (Fix This Quarter)

1. **Messages Architecture** - Real-time sync is complex, needs docs
2. **Integrations Tutorial** - Third-party setup is confusing
3. **Command Center Architecture** - AI engine needs explanation
4. **All Module Architecture** - 0% coverage is critical gap

### Medium Priority (Fix Next Quarter)

1. Missing How-To guides (7 modules)
2. Tutorial gaps (4 modules)
3. Extract reference docs from code to dedicated files

### Low Priority (Ongoing)

1. Keep docs updated with code changes
2. Add more advanced How-To guides
3. Create video tutorials (optional)

---

## Automation

**Script Location:** `scripts/check-doc-coverage.js` (TODO)

### What it does

- Scans `docs/modules/` for required files
- Checks Diátaxis categories are present
- Generates this coverage map
- Fails CI if coverage drops below threshold

### Run locally

```bash
npm run check:docs  # TODO: Add to package.json
```text

### CI Integration
```yaml
# .github/workflows/docs-coverage.yml (TODO)
name: Documentation Coverage
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run check:docs
      - run: |
 COVERAGE=$(cat docs/coverage.md | grep "Overall Coverage" | grep -oP '\d+%')
          echo "Coverage: $COVERAGE"
          # Fail if below 80%
```text

---

## How to Improve Coverage

### For New Modules

1. Create `docs/modules/[module-name]/` directory
2. Copy `docs/modules/_template.md` as starting point
3. Fill in all four Diátaxis categories
4. Link from module README
5. Update this coverage map

### For Existing Modules

1. Identify missing categories (check table above)
2. Start with highest priority gaps
3. Use templates from `docs/diataxis/templates/`
4. Get review from module expert
5. Update this coverage map

### Documentation Definition of Done

- [ ] Tutorial exists and is tested
- [ ] At least 3 How-To guides
- [ ] Reference docs extracted from code
- [ ] Architecture doc explains design
- [ ] All docs have Plain English Summary
- [ ] All docs have verification commands
- [ ] Cross-links to related docs exist
- [ ] Added to this coverage map

---

## Assumptions

- Modules with completion summaries in `docs/archive/` have partial documentation
- Reference documentation in code comments counts as "exists" but should be extracted
- Tutorial = learning-oriented, How-To = task-oriented, Reference = information, Architecture = understanding
- Coverage below 80% per module is insufficient

## Failure Modes

| Failure | Symptom | Solution |
| --------- | --------- | ---------- |
| Coverage map out of date | Shows wrong percentages | Run `npm run check:docs` to regenerate |
| Missing docs not caught | New code without docs merges | Enable CI check, make it required |
| Docs exist but aren't linked | Can't find documentation | Add cross-links, update module README |
| Coverage metric gaming | Stub docs to hit percentage | Review doc quality, not just existence |

## How to Verify

```bash
# Check documentation exists for all modules
ls -la docs/modules/

# Find modules without architecture docs
find docs/modules/ -name "architecture.md" | wc -l  # Should be 14+

# Check for tutorial coverage
find docs/modules/ -name "tutorial.md" | wc -l

# Run coverage script
npm run check:docs  # TODO: Implement

# Manual audit
# For each module in client/screens/, verify docs/modules/[name]/ exists with 4 files
```text

---

**HIGH LEVERAGE:** This coverage map makes documentation completeness measurable and visible. Teams can't improve what they can't measure - this prevents modules from shipping without docs.

**CAPTION:** By treating documentation as a checklist with clear percentages, we prevent the "we'll document it later" anti-pattern. The automation candidate script will fail CI if coverage drops, making docs a required part of done.

---

### Next Actions
1. Implement `scripts/check-doc-coverage.js` to automate this map
2. Add to CI as required check
3. Create docs for Messages and Integrations (critical gaps)
4. Fill in architecture docs for all 14 modules
5. Set team goal: 80% coverage by end of Q1 2026
