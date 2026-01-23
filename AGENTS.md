# Agent Entry Point (Concise)

**Role:** AI coding agent. Follow repo rules, keep changes small and verifiable.

## Read Order (Required)
1. `.repo/tasks/TODO.md` (current task)
2. `.repo/repo.manifest.yaml` (commands — never guess)
3. `.repo/agents/QUICK_REFERENCE.md` (rules)

## Tech Stack
- Backend: **Django 4.2 + Python 3.11**
- Frontend: **React 18 + TypeScript**

## Commands (use manifest)
- Install: `npm install`
- Quick checks: `npm run lint && npm run check:types`
- Full CI: `npm test && npm run lint && npm run check:types && npm run check:governance`

## Testing
- Prefer `make lint`, `make test`, `make verify` when instructed in tasks/PR.
- Always capture evidence (command + result) in PR and final response.

## Project Structure (high level)
- `.repo/` → governance, tasks, policies, templates
- `apps/` → app entrypoints
- `backend/` → Django services/modules
- `frontend/` → React web app
- `packages/` → shared libs/features
- `docs/` → architecture + ADRs

## Code Style
- Follow local patterns and existing naming.
- Prefer small, typed helpers and explicit returns.
- No `try/catch` around imports.

**Example (TypeScript):**
```ts
export const toSlug = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, '-');
```

**Example (Python):**
```py
def is_active(user: User) -> bool:
    return user.is_active and not user.is_deleted
```

## Git Workflow
- Work only on the active task in `.repo/tasks/TODO.md`.
- Commit atomic changes with clear messages.
- Update task status, archive completed tasks, and promote the next task.

## Boundaries (NEVER do these)
- Don’t cross module/feature boundaries without an ADR.
- Don’t touch security/auth/money/external systems without HITL.
- Don’t commit secrets or `.env` files.
- Don’t proceed with UNKNOWN items — create HITL and stop.
- Don’t skip filepaths in logs, PRs, or summaries.

## If unsure
- Mark `<UNKNOWN>` → create HITL → stop.
