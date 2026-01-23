# Quick Reference Card

One-page cheat sheet for governance framework usage.

## Decision Tree: HITL Requirements

```
Is change type security/release/schema? → HITL REQUIRED
Does change involve external credentials/dashboards? → HITL REQUIRED
Do keywords appear (credentials, token, billing, app store, vendor, prod deploy, payment, oauth)? → HITL REQUIRED
Otherwise → No HITL
```

## Common Commands

```bash
# Install dependencies
npm install

# Quick check (lint + types + build)
npm run check:quick

# Full CI check (lint + types + tests)
npm run check:ci

# Governance verification
node .repo/automation/scripts/governance-verify.js --trace-log <path>

# Validate trace log
node .repo/automation/scripts/validate-agent-trace.js <path>

# Boundary check (when implemented)
npm run check:boundaries
```

## Artifact Requirements Table

| Change Type | Task Packet | Trace Log | ADR | HITL | Waiver |
|------------|-------------|-----------|-----|------|--------|
| Feature | ✅ | ✅ | If cross-feature | If external/risky | If exception |
| Bug Fix | ✅ | ✅ | ❌ | If security | If exception |
| Refactor | ✅ | ✅ | If boundary change | ❌ | If exception |
| Security | ✅ | ✅ | ✅ | ✅ | ❌ |
| Release | ✅ | ✅ | ✅ | ✅ | ❌ |
| API Change | ✅ | ✅ | ✅ | If external | If exception |
| Module Boundary | ✅ | ✅ | ✅ | ❌ | If exception |

## Workflow Checklist

### Before Starting Work
- [ ] Read relevant policy files (CONSTITUTION.md, PRINCIPLES.md, BOUNDARIES.md)
- [ ] Check repo.manifest.yaml for commands
- [ ] Identify change type
- [ ] Determine if HITL required
- [ ] Create task packet

### During Work
- [ ] Follow boundary model: ui → domain → data → platform
- [ ] Mark UNKNOWNs and create HITL items
- [ ] Document filepaths in all changes
- [ ] Create trace log as you work

### Before PR
- [ ] Run `npm run lint && npm run check:types && npm test`
- [ ] Validate trace log: `node .repo/automation/scripts/validate-agent-trace.js <path>`
- [ ] Run governance verify: `node .repo/automation/scripts/governance-verify.js`
- [ ] Ensure all HITL items are Completed (or waived)
- [ ] Include filepaths in PR description

## Boundary Rules Quick Reference

**Allowed:**
- `ui` → `domain`
- `domain` → `data`
- `data` → `platform`
- `platform` → nothing

**Forbidden:**
- `ui` → `data` (skip domain)
- `ui` → `platform` (skip layers)
- Cross-feature without ADR
- `packages/` importing from `apps/`

## Exit Codes

- `0` - Success
- `1` - Hard gate failure (governance integrity violation)
- `2` - Waiverable gate failure (warnings, requires waiver)

## File Locations

- Policies: `.repo/policy/`
- Templates: `.repo/templates/`
- Examples: `.repo/examples/`
- HITL Items: `.repo/hitl/`
- Waivers: `.repo/waivers/`
- ADRs: `.repo/docs/adr/` or `docs/adr/`

## Emergency Contacts

- **Uncertain about command?** → Set `<UNKNOWN>` in manifest, create HITL
- **Boundary violation?** → Create ADR or waiver
- **Security concern?** → HITL required immediately
- **Policy unclear?** → Read CONSTITUTION.md first, then HITL if still unclear
