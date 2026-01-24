# Backend (Legacy Django)

**Status:** Legacy (do not add new development)

## Overview

The `backend/` directory contains an early Django-based backend implementation that is no longer the active runtime. The authoritative backend runtime for AIOS is the Node.js/Express server in `apps/api/`.

## Guidance

- **Do not** add new features or endpoints here.
- Reference the current backend runtime in `apps/api/` for all backend work.
- If Django is reconsidered, create a new ADR and migration plan before resuming development.

## Related Documentation

- [ADR-008: Standardize on Node.js/Express for the backend runtime](../docs/decisions/008-backend-runtime-decision.md)
- [Apps Index](../apps/INDEX.md)
