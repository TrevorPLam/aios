# Scripts Directory Index

**File**: `scripts/INDEX.md`

This file catalogs the scripts in the `scripts/` directory. See [root `INDEX.md`](../INDEX.md) for repository overview.

## Directory Structure

```
scripts/
├── tools/                    # Development and governance tools
│   ├── check-agent-platform.mjs
│   ├── check-exceptions.mjs
│   ├── check-traceability.mjs
│   └── compile-constitution.mjs
├── build.js                  # Build scripts
├── check-*.mjs              # Validation scripts
├── *.sh                     # Shell scripts (governance, tasks, etc.)
└── *.py                     # Python scripts
```

## Script Categories

### Governance Scripts
- `governance-verify.sh` - Enforces quality gates per `.repo/policy/QUALITY_GATES.md`
- `create-hitl-item.sh` - Creates HITL items
- `create-waiver.sh` - Creates policy waivers
- `check-expired-waivers.sh` - Checks for expired waivers
- `validate-manifest-commands.sh` - Validates manifest commands
- `validate-pr-body.sh` - Validates PR body format

### Task Management Scripts
- `validate-task-format.sh` - Validates task format
- `get-next-task-number.sh` - Gets next task number
- `promote-task.sh` - Promotes tasks from backlog
- `archive-task.py` - Archives completed tasks

### Trace & Log Scripts
- `generate-trace-log.sh` - Generates trace logs
- `validate-trace-log.sh` - Validates trace logs
- `generate-agent-log.sh` - Generates agent logs

### ADR Scripts
- `detect-adr-triggers.sh` - Detects ADR triggers
- `create-adr-from-trigger.sh` - Creates ADR from trigger

### Build & Check Scripts
- `build.js` - Static build for Expo deployment
- `check-bundle-budget.mjs` - Checks bundle size budget
- `check-coverage-ratchet.mjs` - Checks coverage ratchet
- `check-expo-config.mjs` - Validates Expo configuration
- `check-startup-blockers.mjs` - Checks startup blockers
- `check-todo-format.mjs` - Validates TODO format
- `check-worklets-version.mjs` - Checks worklets version
- `post-install-check.mjs` - Post-install verification
- `deep-dependency-check.mjs` - Deep dependency analysis
- `update-documentation-metrics.mjs` - Updates documentation metrics

### Tools (`scripts/tools/`)
Development and governance tool scripts:
- `check-agent-platform.mjs` - Validates agent platform consistency
- `check-exceptions.mjs` - Validates exception expiry
- `check-traceability.mjs` - Validates traceability requirements
- `compile-constitution.mjs` - Compiles constitution into copilot instructions

## Navigation

- [Root `INDEX.md`](../INDEX.md) - Repository master index
- [`scripts/SCRIPTS.md`](SCRIPTS.md) - What agents may do in this directory
- [`.repo/policy/QUALITY_GATES.md`](../.repo/policy/QUALITY_GATES.md) - Quality gate definitions

## See Also

- `scripts/SCRIPTS.md` - What agents may do in this directory
- `scripts/AGENT.md` - Folder-level agent guide
- [`.repo/policy/QUALITY_GATES.md`](../.repo/policy/QUALITY_GATES.md) - Quality gate definitions
