# Archived Policy Documents

**Date Archived:** 2026-01-24  
**Reason:** Consolidated into `.repo/policy/constitution.json`

## What Happened

All governance policy documents have been consolidated into a single, token-optimized, machine-readable JSON file: `.repo/policy/constitution.json`

## Archived Files

These 7 markdown files have been moved here:

1. **CONSTITUTION.md** → Now in `constitution.json` → `constitution.articles`
2. **PRINCIPLES.md** → Now in `constitution.json` → `principles`
3. **QUALITY_GATES.md** → Now in `constitution.json` → `quality_gates`
4. **SECURITY_BASELINE.md** → Now in `constitution.json` → `security`
5. **BOUNDARIES.md** → Now in `constitution.json` → `boundaries`
6. **HITL.md** → Now in `constitution.json` → `hitl`
7. **BESTPR.md** → Now in `constitution.json` → `best_practices`

## Current Policy Location

**Single source of truth:** `.repo/policy/constitution.json`

This JSON file contains all governance rules in a structured, machine-readable format that is:
- Token-optimized (compact)
- Easy to parse programmatically
- Hierarchically organized
- Single source of truth

## Migration Notes

- All content from these markdown files has been preserved in the JSON structure
- The JSON maintains the same information but in a more structured format
- References to these files should be updated to point to `constitution.json`
- The `constitution` section is marked as immutable (requires founder approval)

## Note on DIAMONDREPO.md

`DIAMONDREPO.md` was not consolidated as it was moved to `docs/` per user request.
