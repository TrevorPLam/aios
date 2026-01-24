# Applications Index

**File**: `apps/INDEX.md`

This index provides navigation to all application code in the repository.

## Applications Overview

The `apps/` directory contains the application shells that mount logic from `packages/`:

| Application | Purpose | Technology | Index |
|-------------|---------|------------|-------|
| `mobile/` | React Native mobile app | React Native, Expo | See below |
| `api/` | Backend API server | Node.js, Express | See below |
| `web/` | Web application | (if applicable) | See below |

## Application Structure

```
apps/
├── INDEX.md        ← You are here
├── mobile/         ← React Native mobile application
│   ├── README.md
│   ├── App.tsx
│   ├── index.js
│   └── navigation/
├── api/            ← Express API server
│   ├── README.md
│   ├── index.ts
│   ├── routes.ts
│   ├── middleware/
│   └── utils/
└── web/            ← Web application
    └── README.md
```

## Mobile Application (`apps/mobile/`)

**Purpose**: React Native/Expo mobile application for iOS, Android, and Web.

**Key Files**:
- [`App.tsx`](mobile/App.tsx) - Main application component
- [`index.js`](mobile/index.js) - Entry point
- [`navigation/`](mobile/navigation/) - Navigation setup

**Documentation**:
- [`README.md`](mobile/README.md) - Mobile app documentation
- [`AGENTS.md`](mobile/AGENTS.md) - Agent guidance for mobile

**Tests**:
- [`__tests__/`](mobile/__tests__/) - Mobile app tests

**See Also**:
- [`packages/features/`](../packages/features/) - Feature modules used by mobile
- [`packages/design-system/`](../packages/design-system/) - UI components

## API Server (`apps/api/`)

**Purpose**: Node.js/Express backend API server (authoritative backend runtime per ADR-008).

**Key Files**:
- [`index.ts`](api/index.ts) - Server entry point
- [`routes.ts`](api/routes.ts) - API route definitions
- [`middleware/`](api/middleware/) - Express middleware (auth, error handling, validation)
- [`utils/`](api/utils/) - Utility functions

**Documentation**:
- [`README.md`](api/README.md) - API server documentation
- [`AGENTS.md`](api/AGENTS.md) - Agent guidance for API

**Tests**:
- [`__tests__/`](api/__tests__/) - API server tests

**See Also**:
- [`packages/features/`](../packages/features/) - Feature modules used by API
- [`packages/platform/`](../packages/platform/) - Platform adapters
- [`docs/decisions/008-backend-runtime-decision.md`](../docs/decisions/008-backend-runtime-decision.md) - Backend runtime decision

## Web Application (`apps/web/`)

**Purpose**: Web application (if applicable).

**Documentation**:
- [`README.md`](web/README.md) - Web app documentation

## Architecture Notes

### Application Shells
Applications in `apps/` are **shells** that:
- Mount logic from `packages/features/`
- Use `packages/platform/` for infrastructure
- Use `packages/design-system/` for UI (mobile/web)
- Use `packages/contracts/` for shared types

### Boundary Rules
- Apps may import from `packages/*`
- Apps should NOT implement business logic (use features)
- Apps should NOT implement persistence (use platform)

See [`../packages/README.md`](../packages/README.md) for boundary details.

### Backend Runtime Clarification
- `apps/api/` is the authoritative backend runtime.
- The Django `backend/` tree is legacy and should not receive new development unless superseded by a new ADR.

## Quick Navigation

### For Mobile Development
1. **Start**: [`mobile/README.md`](mobile/README.md)
2. **Code**: [`mobile/App.tsx`](mobile/App.tsx)
3. **Features**: [`../packages/features/`](../packages/features/)
4. **UI**: [`../packages/design-system/`](../packages/design-system/)

### For API Development
1. **Start**: [`api/README.md`](api/README.md)
2. **Routes**: [`api/routes.ts`](api/routes.ts)
3. **Features**: [`../packages/features/`](../packages/features/)
4. **Platform**: [`../packages/platform/`](../packages/platform/)

## See Also

- [Repository Root Index](../INDEX.md) - Master repository index
- [`packages/INDEX.md`](../packages/INDEX.md) - Packages index
- [`packages/README.md`](../packages/README.md) - Package boundary map
- [`.repo/policy/BOUNDARIES.md`](../.repo/policy/BOUNDARIES.md) - Boundary rules
