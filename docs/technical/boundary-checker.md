# Boundary Checker Documentation

## Overview

The boundary checker enforces architectural boundaries defined in `.repo/policy/BOUNDARIES.md`. It uses a hybrid approach: static analysis plus manifest-defined exceptions.

## Current Implementation Status

**Status**: `<UNKNOWN>` in manifest (not yet implemented)

The boundary checker is planned but not yet implemented. The enforcement method is documented as `hybrid_static_checker_plus_manifest` in BOUNDARIES.md.

## Configuration

### Manifest Configuration

Boundary checker configuration is in `.repo/repo.manifest.yaml`:

```yaml
boundaries:
  enforcement: hybrid_checker_plus_manifest_edges
  edges_model: layered_allow_list
  edges: []  # Explicit exceptions beyond default import direction
```

### Boundary Model

The default allowed import direction is:
- `ui` → `domain`
- `domain` → `data`
- `data` → `platform`
- `platform` → nothing

This is enforced at the package level:
- `packages/features/*/ui` may import from `packages/features/*/domain`
- `packages/features/*/domain` may import from `packages/features/*/data`
- `packages/features/*/data` may import from `packages/platform`
- `packages/platform` depends on nothing

### Cross-Feature Rule

Cross-feature imports require an ADR (Architecture Decision Record). See `.repo/policy/BOUNDARIES.md` for details.

## Implementation Plan

### Phase 1: Static Analysis

The boundary checker should:
1. Parse all TypeScript/JavaScript files
2. Extract import statements
3. Map imports to package/layer structure
4. Validate against allowed import direction
5. Check for cross-feature imports (require ADR)

### Phase 2: Manifest Integration

1. Read explicit edges from `repo.manifest.yaml`
2. Allow exceptions listed in manifest
3. Validate that exceptions have required justification (ADR for large, Task Packet for small)

### Phase 3: CI Integration

1. Run as part of `check:boundaries` command
2. Fail PR if violations found (unless waived)
3. Auto-generate task for remediation if waived

## Tools Considered

### Option 1: ESLint with Custom Rules

- **Pros**: Already in use, extensible
- **Cons**: Requires custom rule development
- **Status**: Recommended approach

### Option 2: Import-Linter

- **Pros**: Purpose-built for boundary checking
- **Cons**: Additional dependency, may need configuration
- **Status**: Alternative approach

### Option 3: TypeScript Path Mapping

- **Pros**: Compile-time enforcement
- **Cons**: Less flexible, harder to configure exceptions
- **Status**: Not recommended for hybrid approach

## Usage Instructions

Once implemented, the boundary checker will be run via:

```bash
npm run check:boundaries
```

Or as part of governance verification:

```bash
node .repo/automation/scripts/governance-verify.js
```

## Violation Handling

### Small Violations

- Allowed with explicit Task Packet justification + filepaths
- Must be represented as explicit edge in manifest
- Auto-task created for remediation

### Large Violations

- Requires ADR
- Must be represented as explicit edge in manifest
- Auto-task created for remediation

### Waivers

- Violations can be waived per `.repo/policy/WAIVERS.md`
- Waiver must include remediation plan
- Auto-task created for remediation

## CI Integration Status

**Current**: Not integrated (checker not implemented)

**Planned**: 
- Add to `.repo/automation/ci/governance-verify.yml`
- Run as part of PR checks
- Block merge on violations (unless waived)

## Future Enhancements

1. **Visual Boundary Map**: Generate diagram of allowed/actual imports
2. **Incremental Checking**: Only check changed files in PR
3. **Auto-Fix Suggestions**: Suggest correct import paths
4. **Boundary Coverage**: Track boundary rule coverage over time

## Related Documentation

- `.repo/policy/BOUNDARIES.md` - Boundary rules and policy
- `.repo/repo.manifest.yaml` - Manifest configuration
- `.repo/policy/QUALITY_GATES.md` - Quality gate requirements
- `.repo/templates/ADR_TEMPLATE.md` - ADR template for exceptions
