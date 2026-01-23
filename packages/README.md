# Packages Boundary Map

This directory defines enforceable architectural boundaries for AIOS.

## Package Types
- `features/*` — vertical slices. Only public API is `index.ts`.
- `contracts` — canonical schemas/DTOs/validators used by apps and features.
- `platform` — storage/network/logging/analytics adapters and primitives.
- `design-system` — shared UI primitives only (no feature logic).

## Allowed Imports
- `features/*/domain` may import:
  - `contracts`
  - local `domain` modules
- `features/*/data` may import:
  - `platform`
  - `contracts`
  - local `domain`
- `features/*/ui` may import:
  - `design-system`
  - local `domain`
- `apps/*` may import:
  - `features/*`
  - `contracts`
  - `platform`
  - `design-system`

## Forbidden
- `domain` importing `platform`, `ui`, or `apps`.
- `ui` importing `data` or `platform`.
- `apps` implementing business rules or persistence.
