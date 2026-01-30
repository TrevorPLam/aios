# AGENTS.md

## What this repo is

AIOS is a monorepo with apps, services, and shared packages. It also includes the **Repository Alignment Standard** under `ALIGNMENT/`.

## Project structure

- `apps/` — application code
- `packages/` — shared libraries (UI, utils, API SDK, contracts)
- `services/` — backend services (including `services/api-gateway/`)
- `infrastructure/` — IaC and deployment artifacts
- `docs/` — architecture, ADRs, onboarding, API docs
- `AGENTS/` — agent registry + task tracking (TOON)
- `ALIGNMENT/` — alignment standard reference

## Exact commands

- setup: `make setup`
- verify: `make verify`

Notes:
- These commands run `./scripts/*.sh` and require a Bash environment (WSL2 or Git Bash on Windows).

## Rules

- Keep changes small and focused; prefer the existing patterns.
- Do not add dependencies without explicit approval.
- Do not modify protected paths without explicit human approval.
- `make verify` must pass for any PR.

## Protected paths

Changes touching these require extra review:

- `infrastructure/`
- `services/api-gateway/`
- `.github/workflows/`
- `scripts/`
- Root config files (e.g. `package.json`, lockfiles, TS config)

## Canonical agents registry

The canonical registry of agents for this repo is `AGENTS/AGENTS.toon`. If an agent definition changes, update that file.

## Related TOON files

- `AGENTS/TOON.toon` — format definition and examples
- `AGENTS/tasks/BACKLOG.toon` — idea intake
- `AGENTS/tasks/TODO.toon` — active work
- `AGENTS/tasks/ARCHIVE.toon` — completed work
