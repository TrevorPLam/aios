# .repo/ Directory Reorganization Plan

**Date:** 2026-01-24  
**Purpose:** Organize `.repo/` directory and move nested docs to root `docs/`

---

## Current Issues

1. **Nested `docs/` folder** - Should be moved to root `docs/` directory
2. **Redundant analysis files** in root - Should be archived
3. **Unclear organization** - Need better structure

---

## File Categorization

### Files in `.repo/docs/` to Move:

#### Agent Documentation → `docs/ai/`
- `AGENT_GETTING_STARTED.md` → `docs/ai/AGENT_GETTING_STARTED.md`

#### Analysis Documents → `docs/archive/analysis/`
- `AGENTIC_JSON_ANALYSIS.md` → `docs/archive/analysis/AGENTIC_JSON_ANALYSIS.md`
- `AGENTIC_SYSTEM_ASSESSMENT.md` → `docs/archive/analysis/AGENTIC_SYSTEM_ASSESSMENT.md`
- `FRAMEWORK_ANALYSIS.md` → `docs/archive/analysis/FRAMEWORK_ANALYSIS.md`

#### Implementation/Completion Docs → `docs/archive/project-management/`
- `COMPLETE_IMPLEMENTATION.md` → `docs/archive/project-management/COMPLETE_IMPLEMENTATION.md`
- `IMPLEMENTATION_COMPLETE.md` → `docs/archive/project-management/IMPLEMENTATION_COMPLETE.md`
- `IMPLEMENTATION_SUMMARY.md` → `docs/archive/project-management/IMPLEMENTATION_SUMMARY.md`

#### Technical Documentation → `docs/technical/`
- `automation-scripts.md` → `docs/technical/automation-scripts.md`
- `boundary-checker.md` → `docs/technical/boundary-checker.md`
- `ci-integration.md` → `docs/technical/ci-integration.md`
- `TROUBLESHOOTING.md` → `docs/technical/troubleshooting.md`
- `standards/manifest.md` → `docs/technical/manifest-standards.md`

#### Planning Documents → `docs/planning/`
- `AUTOMATION_ROADMAP.md` → `docs/planning/AUTOMATION_ROADMAP.md`

### Files in `.repo/` root to Archive:

#### Analysis Documents → `docs/archive/analysis/`
- `CRITICAL_ANALYSIS_FAILURES.md` → `docs/archive/analysis/CRITICAL_ANALYSIS_FAILURES.md`
- `PROJECTED_ANALYSIS_AFTER_FIXES.md` → `docs/archive/analysis/PROJECTED_ANALYSIS_AFTER_FIXES.md`
- `REPOSITORY_BEST_PRACTICES_ANALYSIS.md` → `docs/archive/analysis/REPOSITORY_BEST_PRACTICES_ANALYSIS.md`

#### Progress Tracking → `docs/archive/project-management/`
- `IMPLEMENTATION_PROGRESS.md` → `docs/archive/project-management/IMPLEMENTATION_PROGRESS.md`
- `CLEANUP_SUMMARY.md` → `docs/archive/project-management/CLEANUP_SUMMARY.md`

---

## Files to Keep in `.repo/` Root

### Core Governance Files (Active)
- `GOVERNANCE.md` - Framework entry point
- `repo.manifest.yaml` - Command definitions (critical!)
- `AGENT.md` - Folder-level agent guide
- `INDEX.md` - Directory index
- `CHANGELOG.md` - Framework change history
- `DOCUMENT_MAP.md` - Document navigation system

### Active Directories
- `policy/` - Authoritative governance rules
- `agents/` - AI agent framework
- `tasks/` - Task management
- `templates/` - Document templates
- `automation/` - Automation scripts
- `hitl/` - HITL items
- `logs/` - Agent logs
- `traces/` - Trace logs
- `examples/` - Example files

---

## After Reorganization

### `.repo/` Structure:
```
.repo/
├── GOVERNANCE.md           ← Entry point
├── repo.manifest.yaml      ← Commands (critical!)
├── AGENT.md                ← Agent guide
├── INDEX.md                ← Directory index
├── CHANGELOG.md            ← Change history
├── DOCUMENT_MAP.md         ← Document navigation
├── policy/                 ← Governance rules
├── agents/                 ← Agent framework
├── tasks/                  ← Task management
├── templates/              ← Templates
├── automation/             ← Scripts
├── hitl/                   ← HITL items
├── logs/                   ← Agent logs
├── traces/                 ← Trace logs
└── examples/               ← Examples
```

### All documentation moved to root `docs/`:
- Agent docs → `docs/ai/`
- Technical docs → `docs/technical/`
- Analysis docs → `docs/archive/analysis/`
- Implementation docs → `docs/archive/project-management/`
- Planning docs → `docs/planning/`

---

## Benefits

1. **Single documentation location** - All docs in root `docs/`
2. **Cleaner `.repo/`** - Only active governance files
3. **Better organization** - Logical categorization
4. **Easier navigation** - Clear structure
5. **Reduced confusion** - No nested docs folder
