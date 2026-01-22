# AIOS Documentation Navigation Guide

**Last Updated:** January 21, 2026 (Post-Archival Cleanup)
**Version:** 3.1 - Archival Cleanup

This guide helps you find the right documentation in our newly organized structure.

---

## 🎯 Quick Start - Which Document Do I Need?

### For Quick Reference

→ **[F&F.md](./F&F.md)** - Start here!

- Module status at a glance
- Feature lists (what's implemented vs. planned)
- Development priorities
- Quick reference tables

### For Technical Deep-Dive

→ **[MODULE_DETAILS.md](./MODULE_DETAILS.md)**

- Database layer implementation
- Test coverage metrics
- Quality assessments
- Architecture notes
- Recent enhancements

### For Market Positioning

→ **[docs/analysis/COMPETITIVE_ANALYSIS.md](./docs/analysis/COMPETITIVE_ANALYSIS.md)**

- Feature comparison matrices
- Unique advantages
- Target market analysis
- Strategic recommendations

### For Development Setup

→ **[README.md](./README.md)**

- Installation instructions
- Running the app
- Tech stack
- API endpoints

---

## 📊 Documentation Consolidation Results

### Before Consolidation (January 2026)

- Total files: 79 markdown files
- Root directory: 72 files (chaos!)
- Organized: 3 files in /docs

### After Archival Cleanup (January 21, 2026)

- Total active files (core index): 51 files
- Root directory: 20 files (core entry points + governance + planning)
- Organized: 30+ files properly structured in /docs
- Archived: 90+ historical files in /docs/archive
- **Reduction: root clutter preserved in archives**

---

## 🗂️ New Documentation Structure

### F&F.md - Features & Functionality (Core Reference)

```text
├── Quick Reference (module status table)
├── Module Status Overview (14 modules)
│   ├── Purpose
│   ├── Implemented Features
│   ├── Planned Features
│   └── AI Features
├── Development Priorities
├── Competitive Benchmarking (summary)
└── Key Differentiators
```text

### MODULE_DETAILS.md - Technical Implementation

```text
├── Module Implementation Details (9 modules)
│   ├── Database Layer
│   ├── Key Features
│   ├── Test Coverage
│   ├── Quality Metrics
│   └── Recent Enhancements
└── Quality Standards
```text

### /docs/analysis/COMPETITIVE_ANALYSIS.md - Market Positioning

```text
├── Command Center vs. Notion AI, Motion, Superhuman
├── Notebook vs. Notion, Obsidian, Bear, Evernote
├── Lists vs. Todoist, Microsoft To Do, Any.do
├── Budget vs. YNAB, Mint, Monarch Money
├── Calendar vs. Fantastical, Google Calendar, etc.
├── Integrations vs. Zapier, IFTTT, Make
├── Overall Market Position
└── Development Priorities Based on Competitive Gaps
```text

### /docs/ Directory Structure

```text
docs/
├── technical/              # Technical implementation guides
│   ├── API_DOCUMENTATION.md
│   ├── TESTING_INSTRUCTIONS.md
│   ├── MOBILE_CONFIGURATION_EXPLANATION.md
│   ├── IMPLEMENTATION_ROADMAP.md
│   ├── URGENT_WORKLETS_FIX.md
│   ├── WORKLETS_FIX_GUIDE.md
│   ├── WORKLETS_PREVENTION.md
│   ├── design_guidelines.md
│   ├── replit-deployment.md
│   ├── CONTEXTUAL_NAVIGATION.md
│   └── NAVIGATION_IMPROVEMENTS.md
├── security/               # Security documentation
│   └── SECURITY.md         # Consolidated security docs
├── analysis/               # Analysis and reports
│   ├── COMPETITIVE_ANALYSIS.md
│   └── CODE_QUALITY_ANALYSIS.md
├── planning/               # Roadmaps and planning
│   ├── MISSING_FEATURES.md
│   └── PERFECT.md
├── analytics/              # Analytics and telemetry
│   ├── WORLD_CLASS_ANALYTICS_ROADMAP.md
│   ├── WORLD_CLASS_FEATURES_SUMMARY.md
│   └── telemetry.md
└── archive/                # Historical documents
    ├── 2026-01-pre-consolidation/
    ├── completion-summaries/  (10 files)
    ├── enhancements/          (11 files)
    ├── analysis/              (37 files)
    ├── security/              (9 files)
    ├── project-management/    (12 files)
    └── sessions/              (1 file)
```text

---

## 🎓 Use Cases

### "I want to know what features are available"

→ [F&F.md](./F&F.md) - See module completion status and feature lists

### "I want to understand how a module works"

→ [MODULE_DETAILS.md](./MODULE_DETAILS.md) - See database methods and architecture

### "I want to know how we compare to competitors"

→ [docs/analysis/COMPETITIVE_ANALYSIS.md](./docs/analysis/COMPETITIVE_ANALYSIS.md) - Feature matrices

### "I want to contribute to development"

→ [F&F.md](./F&F.md) (Development Priorities) + [README.md](./README.md)

### "I want technical documentation"

→ [docs/technical/](./docs/technical/) - All technical guides

### "I want security information"

→ [SECURITY.md](./SECURITY.md) (reporting) or [docs/security/SECURITY.md](./docs/security/SECURITY.md) (detailed)

### "I want to see historical analysis"

→ [docs/archive/](./docs/archive/) - Organized by category

---

## 📈 Benefits of New Structure

### Before (Scattered Documentation)

- ❌ 72 files in root - overwhelming to navigate
- ❌ Mixed concerns (reference + technical + competitive + historical)
- ❌ Hard to find specific information
- ❌ Duplicate content scattered everywhere
- ❌ Maintenance nightmare (update 6+ files)

### After (Organized Documentation)

- ✅ 10 files in root - clean and focused
- ✅ Separated concerns with clear categories
- ✅ Quick navigation with logical structure
- ✅ No duplication - single source of truth
- ✅ Easy maintenance (update 2-3 files)
- ✅ Historical context preserved in archives

---

## 🔄 Document Maintenance

### Single Source of Truth

#### Module Status & Features
1. **F&F.md** (PRIMARY) - Quick reference, status table
2. **MODULE_DETAILS.md** (SECONDARY) - Technical details
3. **README.md** (TERTIARY) - High-level overview only

### Technical Documentation
1. **/docs/technical/** (PRIMARY) - Detailed guides
2. **README.md** (SECONDARY) - Quick start only

### Security
1. **/docs/security/SECURITY.md** (PRIMARY) - Detailed status
2. **Root SECURITY.md** (SECONDARY) - Reporting process

### Planning
1. **/docs/planning/MISSING_FEATURES.md** (PRIMARY) - What's missing
2. **/docs/technical/IMPLEMENTATION_ROADMAP.md** (SECONDARY) - How to implement

### When to Update Documentation

#### For New Features
- [ ] Update F&F.md (module status & feature list)
- [ ] Update MODULE_DETAILS.md (if database/technical changes)
- [ ] Update README.md (if affects quick start)
- [ ] Update /docs/planning/MISSING_FEATURES.md (remove if implemented)

### For Bug Fixes
- [ ] Update relevant technical documentation
- [ ] Update release notes

### For Security Fixes
- [ ] Update /docs/security/SECURITY.md
- [ ] Document in release notes

### For Documentation Changes
- [ ] Update "Last Updated" date
- [ ] Check all cross-references
- [ ] Update this guide if structure changed

---

## 📝 Quick Edit Guide

### Adding a New Feature to a Module

1. **Update F&F.md:**
   - Move from "Planned" to "Implemented" section
   - Update completion percentage
   - Update progress in quick reference table

2. **If technical change, update MODULE_DETAILS.md:**
   - Add to database methods list
   - Update test coverage if applicable

3. **If affects competitive position:**
   - Update docs/analysis/COMPETITIVE_ANALYSIS.md
   - Adjust competitive advantages section

---

## 🎯 Documentation Cheat Sheet

| I Need... | Go To... |
| ----------- | ---------- |
| Feature status | F&F.md |
| Completion % | F&F.md (Quick Reference table) |
| What's implemented | F&F.md (Module sections) |
| Database methods | MODULE_DETAILS.md |
| Test coverage | MODULE_DETAILS.md |
| vs. Competitors | docs/analysis/COMPETITIVE_ANALYSIS.md |
| API docs | docs/technical/API_DOCUMENTATION.md |
| Security info | docs/security/SECURITY.md |
| Missing features | docs/planning/MISSING_FEATURES.md |
| Setup instructions | README.md |
| How to contribute | CONTRIBUTING.md |
| Report security issue | SECURITY.md |
| Historical analysis | docs/archive/ |

---

## 💡 Pro Tips

1. **Start with F&F.md** - It's the master reference for module status
2. **Use the archive** - Historical context preserved in docs/archive/
3. **Check /docs/technical/** - All implementation guides in one place
4. **Search within docs** - Use Ctrl+F / Cmd+F to find specific topics
5. **Follow the hierarchy** - Root docs are entry points, /docs has details
6. **Update sparingly** - Consolidation means less maintenance!

---

## 📚 Related Resources

- **Analysis Documents:**
  - [DOCUMENTATION_ANALYSIS.md](./DOCUMENTATION_ANALYSIS.md) - Full analysis that led to reorganization
  - [DOCUMENTATION_CONSOLIDATION_PLAN.md](./DOCUMENTATION_CONSOLIDATION_PLAN.md) - Implementation plan
  - [DOCUMENTATION_PART_ONE_SUMMARY.md](./DOCUMENTATION_PART_ONE_SUMMARY.md) - Summary of findings

- **Archive:**
  - [docs/archive/](./docs/archive/) - Historical documents organized by category

---

**Last Updated:** January 21, 2026
**Consolidation Version:** 3.1
**Root Files:** 20
**Active Docs (core index):** 51
**Archived Docs:** 90+

---

*Need help? Open an issue on GitHub with the "documentation" label.*
