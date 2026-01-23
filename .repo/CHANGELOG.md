# Governance Framework Changelog

All notable changes to the governance framework will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - PHASE-5: PR Operating System
- Task packet template (`.repo/agents/prompts/task_packet.md`)
- PR template for agents (`.repo/agents/prompts/pr_template.md`)
- Change plan checklist (`.repo/agents/checklists/change-plan.md`)
- PR review checklist (`.repo/agents/checklists/pr-review.md`)
- Incident checklist (`.repo/agents/checklists/incident.md`)
- PR template (`.repo/templates/PR_TEMPLATE.md`)

### Added - PHASE-6: Logging + Trace + Waiver + ADR Templates
- Agent log template (`.repo/templates/AGENT_LOG_TEMPLATE.md`) - Updated to JSON structure
- Agent trace schema (`.repo/templates/AGENT_TRACE_SCHEMA.json`) - Updated with required fields
- Waiver template (`.repo/templates/WAIVER_TEMPLATE.md`)
- ADR template (`.repo/templates/ADR_TEMPLATE.md`)
- Runbook template (`.repo/templates/RUNBOOK_TEMPLATE.md`)
- RFC template (`.repo/templates/RFC_TEMPLATE.md`)

### Added - PHASE-7: Automation Stubs
- CI workflow template (`.repo/automation/ci/governance-verify.yml`)
- Governance verification script stub (`.repo/automation/scripts/governance-verify.js`)

### Added - Enhanced Governance Verification
- Implemented `governance-verify.js` with:
  - Trace log JSON validation against schema
  - HITL item status parsing from tables
  - Required artifact checking (ADR detection for API/module changes)
  - Boundary checker verification
  - Improved error reporting with exit codes
- Implemented `validate-agent-trace.js` for trace log validation

### Added - Example Files
- Example trace log (`.repo/examples/example_trace_log.json`)
- Example HITL item (`.repo/examples/example_hitl_item.md`)
- Example waiver (`.repo/examples/example_waiver.md`)
- Example task packet (`.repo/examples/example_task_packet.json`)
- Examples README (`.repo/examples/README.md`)

### Added - Quick Reference
- One-page cheat sheet (`.repo/agents/QUICK_REFERENCE.md`) with:
  - Decision tree for HITL requirements
  - Common commands and workflows
  - Artifact requirements table
  - Boundary rules quick reference
  - Exit codes and file locations

### Added - Documentation
- Boundary checker documentation (`.repo/docs/boundary-checker.md`)
  - Current implementation status
  - Configuration details
  - Implementation plan
  - Usage instructions
  - CI integration status
- CI integration guide (`.repo/docs/ci-integration.md`)
  - Three integration options (GitHub Actions, GitLab CI, Jenkins)
  - Exit code explanations
  - Required environment setup
  - Future enhancement suggestions

### Added - Automation Scripts
- HITL sync script (`.repo/automation/scripts/sync-hitl-to-pr.py`)
  - Syncs HITL status from index to PR description
  - GitHub API integration
  - Dry-run support
- Task archiving script (`.repo/automation/scripts/archive-task.py`)
  - Archives completed tasks
  - Promotes tasks between priority levels
  - Dry-run support
- Automation scripts README (`.repo/automation/scripts/README.md`)

### Added - CI Workflow Integration
- Added governance verification job to `.github/workflows/ci.yml` (Job 7)
  - Runs on every PR and push
  - Validates trace logs, HITL items, artifacts, and boundaries
  - Blocks merge on hard gate failures (exit code 1)
  - Warns on waiverable failures (exit code 2)
- Added HITL sync step that automatically updates PR descriptions
  - Uses GitHub API with auto-detected environment variables
  - Non-blocking (continues on error)
  - Runs after successful governance verification

### Added - Makefile Integration
- Created `Makefile` with governance targets:
  - `make check-governance` - Run governance verification locally
  - `make check-all` - Run lint, test, and governance checks
  - `make install` - Install Node.js and Python dependencies

### Added - Pre-commit Hooks
- Created `.pre-commit-config.yaml` with governance verification hook
  - Runs on changes to `.repo/`, `agents/`, `scripts/` files
  - Non-blocking (warns but doesn't prevent commits)
  - Can be installed with `pre-commit install`

### Enhanced - GitHub API Integration
- Enhanced `sync-hitl-to-pr.py` with automatic environment variable detection:
  - Auto-detects `GITHUB_TOKEN` (provided in CI)
  - Auto-detects `GITHUB_REPOSITORY` (format: `owner/repo`)
  - Auto-detects PR number from `GITHUB_EVENT_PATH`
  - Falls back gracefully if API unavailable
  - No manual configuration needed in CI

### Added - Dependencies
- Created `.repo/automation/scripts/requirements.txt` with:
  - `requests>=2.31.0` - For GitHub API integration
- Documented installation: `pip install -r .repo/automation/scripts/requirements.txt`

### Added - Security Patterns Implementation
- Replaced placeholder security patterns with real regex patterns
- Added patterns for: passwords, API keys, secrets, tokens, AWS keys, bearer tokens
- Patterns enforced by `check:security` command

### Added - Trace Log Directory
- Created `.repo/traces/` directory for standardized trace log storage
- Added README with naming conventions and usage instructions
- Documented in `AGENTS.md`

### Enhanced - Governance Verification
- Added git integration to detect changed files automatically
- Added PR body validation (checks for required sections, HITL references)
- Added task format validation (checks for required fields, acceptance criteria)
- Enhanced with `--base-ref` and `--pr-body` command-line options
- CI workflow updated to use new features

### Added - HITL Item Generator
- Created `create-hitl-item.py` script
- Auto-generates next available HITL ID
- Creates HITL item file and adds to index
- Validates required fields
- Supports dry-run mode

### Added - Waiver Management
- Created `manage-waivers.py` script with three commands:
  - `create` - Create new waiver
  - `check-expired` - Check for expired waivers
  - `list` - List active waivers
- Auto-generates waiver IDs
- Tracks expiration dates
- Validates waiver format

### Added - Complete Automation Implementation
- **Security Pattern Scanning** (`check-security-patterns.js`)
  - Scans codebase for forbidden patterns from SECURITY_BASELINE.md
  - Reports violations with file and line numbers
  - Integrated into `check:security` command
- **Boundary Checker** (`check-boundaries.js`)
  - Enforces architectural boundaries (ui → domain → data → platform)
  - Detects cross-feature imports (require ADR)
  - Integrated into `check:boundaries` command
- **Manifest Validation** (`validate-manifest.js`)
  - Validates manifest commands against package.json, CI, Makefile
  - Prevents command drift
  - Added `check:manifest` script
- **Agent Log System** (`create-agent-log.py`)
  - Creates and manages agent logs in JSON format
  - Integrates with three-pass workflow
  - Tracks actions and evidence
  - Created `.repo/logs/` directory
- **Task Promotion** (`promote-task.py`)
  - Automates promotion from BACKLOG to TODO
  - Validates task format before promotion
  - Supports dry-run mode
- **Evidence Schema** (`EVIDENCE_SCHEMA.json`)
  - Standardized evidence format
  - Validator script (`validate-evidence.js`)
  - Supports build, test, lint, type-check, security, boundary, governance evidence
- **Enhanced ADR Detection**
  - Detects cross-feature imports in code
  - Detects API signature changes
  - Better trigger detection in governance-verify.js
- **Waiver Expiration in CI**
  - Added waiver expiration check to CI workflow
  - Warns on expired waivers
  - Non-blocking but visible

### Changed
- Updated `AGENTS.md` to reference quick reference, examples, and trace log location
- Updated `GOVERNANCE.md` directory structure to include new files
- Updated `ci-integration.md` to reflect actual CI integration
- Updated automation scripts README with all new scripts
- Updated CI workflow to check for expired waivers
- Updated `package.json` with new check scripts
- Updated `repo.manifest.yaml` to use implemented boundary and security checks

## [1.0.0] - Initial Release

### Added
- Core governance framework structure
- Policy files (CONSTITUTION.md, PRINCIPLES.md, QUALITY_GATES.md, etc.)
- Agent framework foundation
- Basic templates

---

## Version History

- **1.0.0** - Initial framework release
- **Unreleased** - PR Operating System, enhanced verification, examples, and automation

## Notes

- All changes follow the 3-layer update model (CUSTOM, UPDATEABLE, IMMUTABLE)
- Breaking changes to immutable layers require explicit approval
- See individual policy files for detailed change history
