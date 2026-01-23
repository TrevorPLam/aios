# Automation Scripts Documentation

## Overview

This document provides detailed information about the governance automation scripts and their integration.

## Scripts

### `governance-verify.js`

Governance verification script that enforces structure, required artifacts, logs, trace schema, and HITL/waivers.

**Location**: `.repo/automation/scripts/governance-verify.js`

**Features:**
- Validates trace log JSON against `AGENT_TRACE_SCHEMA.json`
- Parses HITL item status from markdown tables
- Checks for required artifacts (ADR detection for API/module changes)
- Verifies boundary checker configuration
- Improved error reporting with exit codes

**Exit Codes:**
- `0` - All checks passed ✅
- `1` - Hard gate failures (governance integrity violations) - **Merge blocked** ❌
- `2` - Waiverable gate failures (warnings) - **Review required** ⚠️

### `sync-hitl-to-pr.py`

Syncs HITL status from `.repo/policy/HITL.md` to PR description via GitHub API.

**Location**: `.repo/automation/scripts/sync-hitl-to-pr.py`

**Features:**
- Auto-detects GitHub environment variables in CI
- Reads HITL index table
- Formats HITL items as markdown section
- Updates PR description via GitHub API
- Falls back gracefully if API unavailable
- Supports dry-run mode

**Auto-detection:**
- `GITHUB_TOKEN` - Automatically used if available
- `GITHUB_REPOSITORY` - Auto-parsed for owner/repo
- `GITHUB_EVENT_PATH` - Auto-detects PR number from event

**Requirements:**
- Python 3.6+
- `requests` library (see `requirements.txt`)

## CI Integration

### GitHub Actions

Governance verification is integrated into `.github/workflows/ci.yml` as Job 7.

**Workflow:**
1. Checkout code
2. Setup Node.js and Python
3. Install dependencies (npm and pip)
4. Find trace log (if available)
5. Run governance verification
6. Sync HITL status to PR (if PR event)
7. Block merge on hard gate failures

**Automatic Features:**
- Runs on every PR and push
- Auto-detects trace logs
- Auto-syncs HITL status to PR descriptions
- Blocks merge on hard gate failures

## Local Usage

### Makefile

Use the Makefile for local verification:

```bash
# Run governance verification
make check-governance

# Run all checks (lint, test, governance)
make check-all

# Install dependencies
make install
```

### Direct Usage

```bash
# Governance verification
node .repo/automation/scripts/governance-verify.js \
  --trace-log <path> \
  --hitl-file .repo/policy/HITL.md

# HITL sync (manual)
python3 .repo/automation/scripts/sync-hitl-to-pr.py \
  --pr-number <number> \
  --hitl-file .repo/policy/HITL.md

# HITL sync (auto-detects in CI)
python3 .repo/automation/scripts/sync-hitl-to-pr.py \
  --hitl-file .repo/policy/HITL.md
```

## Pre-commit Hooks

Governance verification runs automatically via pre-commit hooks (non-blocking).

**Installation:**
```bash
pre-commit install
```

**Configuration:**
- File: `.pre-commit-config.yaml`
- Triggers on: `.repo/`, `agents/`, `scripts/` file changes
- Non-blocking: Warns but doesn't prevent commits

**Manual Run:**
```bash
pre-commit run --all-files
```

## Dependencies

### Python Dependencies

Install Python dependencies:

```bash
pip install -r .repo/automation/scripts/requirements.txt
```

**Requirements:**
- `requests>=2.31.0` - For GitHub API integration

### Node.js Dependencies

Node.js dependencies are installed via `npm install` (part of project dependencies).

## Error Handling

All scripts follow consistent error handling:
- Exit code `0` for success
- Exit code `1` for errors (hard failures)
- Exit code `2` for warnings (waiverable failures)
- Clear error messages to stderr
- Helpful usage information

## Testing

Run scripts with `--dry-run` flag to test without making changes:

```bash
# Governance verification (always runs, no dry-run needed)
node .repo/automation/scripts/governance-verify.js --hitl-file .repo/policy/HITL.md

# HITL sync (dry-run)
python3 .repo/automation/scripts/sync-hitl-to-pr.py \
  --pr-number 123 \
  --hitl-file .repo/policy/HITL.md \
  --dry-run
```

## Related Documentation

- `.repo/docs/ci-integration.md` - CI integration guide
- `.repo/policy/HITL.md` - HITL process
- `.repo/policy/QUALITY_GATES.md` - Quality gate definitions
- `.repo/templates/AGENT_TRACE_SCHEMA.json` - Trace log schema
- `.repo/automation/scripts/README.md` - Script usage reference
