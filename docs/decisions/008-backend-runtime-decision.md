# ADR-008: Standardize on Node.js/Express for the backend runtime

**Status:** Accepted
**Date:** 2026-01-23

## Context

AIOS currently contains two backend implementations: the Django-based `backend/` tree and the Node.js/Express server in `apps/api/`. This split creates confusion about which runtime is authoritative, blocks architectural decisions, and risks duplicated effort.

## Decision Drivers

- Avoid duplicated backend development effort.
- Provide a single authoritative runtime so follow-on tasks can proceed.
- Reduce risk of inconsistent APIs and diverging data models.
- Preserve existing Node.js/Express investment already used by app workflows.

## Decision

Standardize on the Node.js/Express backend in `apps/api/` as the authoritative backend runtime for AIOS.

The Django `backend/` tree is designated **legacy** and should not receive new development unless a future ADR explicitly reverses this decision.

## How This Decision Was Made

1. Reviewed repository structure and existing backend entrypoints (`backend/` vs `apps/api/`).
2. Confirmed the architectural blocker called out in TASK-012 (derived from PROJECT_ANALYSIS.md section 2.3).
3. Selected the runtime currently aligned with application shells and existing backend docs in `apps/`.

## Alternatives Considered

### Option A: Standardize on Django (`backend/`)

**Pros**
- Leverages the existing Django scaffolding.

**Cons**
- Requires migrating the current Node.js/Express API layer or deprecating it.
- Risks blocking near-term backend work while a migration plan is executed.

### Option B: Maintain Both Backends

**Pros**
- Avoids immediate migration work.

**Cons**
- Continues ambiguity, duplication, and architectural drift.
- Increases coordination cost and slows delivery.

## Consequences

- New backend development will happen in `apps/api/`.
- Documentation will reference `apps/api/` as the backend entrypoint.
- The `backend/` directory remains in the repository for historical reference only and may be removed after verification that no active dependencies remain.

## Migration / Cleanup Plan

1. Update documentation to clarify the Node.js backend decision and mark `backend/` as legacy.
2. Track any remaining Django dependencies and remove them in a future cleanup task if needed.
3. If a Django backend is reconsidered, create a new ADR and plan a migration path before restarting development.
