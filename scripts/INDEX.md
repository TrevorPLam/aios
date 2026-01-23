# Scripts Index

**File**: `scripts/INDEX.md`

This index provides navigation to all automation and utility scripts.

## Scripts Overview

The `scripts/` directory contains automation scripts, build tools, and utility scripts that support development, testing, and maintenance.

## Script Structure

```
scripts/
├── INDEX.md              ← You are here
├── AGENT.md             ← Folder-level guide
├── build.js             ← Static build for Expo deployment
├── check-expo-config.mjs ← Expo configuration validation
├── check-startup-blockers.mjs ← Startup blocker checks
├── check-worklets-version.mjs ← Worklets version validation
├── deep-dependency-check.mjs ← Dependency analysis
├── post-install-check.mjs ← Post-install validation
├── docs/                ← Documentation scripts
│   └── update-documentation-metrics.mjs
└── tools/               ← Governance tools
    ├── check-agent-platform.mjs
    ├── check-exceptions.mjs
    ├── check-traceability.mjs
    └── compile-constitution.mjs
```

## Script Categories

### Build Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| [`build.js`](build.js) | Static build for Expo deployment | `npm run expo:static:build` |

### Check Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| [`check-expo-config.mjs`](check-expo-config.mjs) | Validates Expo configuration | `npm run check:expo-config` |
| [`check-startup-blockers.mjs`](check-startup-blockers.mjs) | Checks for startup blockers | `npm run check:startup` |
| [`check-worklets-version.mjs`](check-worklets-version.mjs) | Validates worklets version | `npm run check:worklets` |
| [`deep-dependency-check.mjs`](deep-dependency-check.mjs) | Analyzes dependencies | `npm run check:deps` |
| [`post-install-check.mjs`](post-install-check.mjs) | Post-install validation | `npm run check:postinstall` |

### Governance Tools (`tools/`)

| Script | Purpose | Usage |
|--------|---------|-------|
| [`tools/check-agent-platform.mjs`](tools/check-agent-platform.mjs) | Validates agent platform consistency | `npm run check:agent-platform` |
| [`tools/check-exceptions.mjs`](tools/check-exceptions.mjs) | Validates exception expiry | `npm run check:exceptions` |
| [`tools/check-traceability.mjs`](tools/check-traceability.mjs) | Validates traceability requirements | `npm run check:traceability` |
| [`tools/compile-constitution.mjs`](tools/compile-constitution.mjs) | Compiles constitution into copilot instructions | `npm run compile:constitution` |

### Documentation Scripts (`docs/`)

| Script | Purpose | Usage |
|--------|---------|-------|
| [`docs/update-documentation-metrics.mjs`](docs/update-documentation-metrics.mjs) | Updates documentation metrics | (internal use) |

## Integration with Manifest

Scripts are referenced in `/.repo/repo.manifest.yaml`:
- Commands in the manifest call these scripts
- Scripts should be executable and reliable
- Script failures should provide clear error messages

See [`.repo/repo.manifest.yaml`](../.repo/repo.manifest.yaml) for command definitions.

## Script Requirements

When creating or modifying scripts:
- Include error handling and clear error messages
- Use appropriate exit codes (0 for success, non-zero for failure)
- Document script purpose and usage
- Test scripts before committing
- Follow existing script patterns and conventions

## Quick Navigation

### For Script Development
1. **Guide**: [`AGENT.md`](AGENT.md) - Folder-level guide
2. **Patterns**: See existing scripts for patterns
3. **Manifest**: [`../.repo/repo.manifest.yaml`](../.repo/repo.manifest.yaml) - How scripts are used

### For Running Scripts
1. **Commands**: See `package.json` scripts section
2. **Manifest**: [`../.repo/repo.manifest.yaml`](../.repo/repo.manifest.yaml) - Command definitions
3. **Best Practices**: [`../BESTPR.md`](../BESTPR.md) - Repository best practices

## See Also

- [Repository Root Index](../INDEX.md) - Master repository index
- [`AGENT.md`](AGENT.md) - Folder-level guide
- [`.repo/repo.manifest.yaml`](../.repo/repo.manifest.yaml) - Command definitions
- [`.repo/docs/standards/manifest.md`](../.repo/docs/standards/manifest.md) - Manifest guide
