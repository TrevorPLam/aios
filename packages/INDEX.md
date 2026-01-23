# Packages Index

**File**: `packages/INDEX.md`

This index provides navigation to all shared packages in the repository.

## Packages Overview

The `packages/` directory contains shared code organized by architectural boundaries:

| Package | Purpose | Boundary Layer |
|---------|---------|----------------|
| `features/` | Feature modules (vertical slices) | Feature layer |
| `platform/` | Platform adapters and primitives | Platform layer |
| `design-system/` | Shared UI components | UI layer |
| `contracts/` | Shared types and schemas | Contracts |

## Package Structure

```
packages/
├── INDEX.md           ← You are here
├── README.md          ← Boundary map
├── features/          ← Feature modules
│   ├── alerts/
│   ├── budget/
│   ├── calendar/
│   ├── contacts/
│   ├── core/
│   ├── email/
│   ├── integrations/
│   ├── lists/
│   ├── messaging/
│   ├── notes/
│   ├── photos/
│   ├── planner/
│   ├── recommendations/
│   ├── settings/
│   └── translator/
├── platform/          ← Platform adapters
│   ├── analytics/
│   ├── lib/
│   └── storage/
├── design-system/      ← UI components
│   ├── components/
│   ├── constants/
│   ├── context/
│   └── hooks/
└── contracts/          ← Shared types
    ├── models/
    └── schema.ts
```

## Feature Modules (`packages/features/`)

**Purpose**: Vertical slice feature modules following the boundary model.

**Structure**: Each feature has:
- `domain/` - Business logic
- `data/` - Data access layer
- `ui/` - UI components
- `index.ts` - Public API

**Features**:
- [`alerts/`](features/alerts/) - Alerts and notifications
- [`budget/`](features/budget/) - Budget management
- [`calendar/`](features/calendar/) - Calendar and scheduling
- [`contacts/`](features/contacts/) - Contact management
- [`core/`](features/core/) - Core functionality
- [`email/`](features/email/) - Email management
- [`integrations/`](features/integrations/) - Third-party integrations
- [`lists/`](features/lists/) - List management
- [`messaging/`](features/messaging/) - Messaging
- [`notes/`](features/notes/) - Notes and notebooks
- [`photos/`](features/photos/) - Photo management
- [`planner/`](features/planner/) - Planning and task management
- [`recommendations/`](features/recommendations/) - Recommendations
- [`settings/`](features/settings/) - Settings and configuration
- [`translator/`](features/translator/) - Translation features

**Boundary Rules**:
- `ui/` may import from `domain/`
- `domain/` may import from `data/`
- `data/` may import from `platform/`
- Cross-feature imports require ADR

See [`README.md`](README.md) for details.

## Platform (`packages/platform/`)

**Purpose**: Platform adapters and primitives (storage, analytics, logging).

**Components**:
- [`analytics/`](platform/analytics/) - Analytics infrastructure
- [`lib/`](platform/lib/) - Platform utilities
- [`storage/`](platform/storage/) - Storage adapters (database, file system)

**Boundary Rules**:
- Platform depends on nothing
- May be imported by `data/` layers
- Must not import from features or apps

See [`platform/AGENT.md`](platform/AGENT.md) for agent guidance.

## Design System (`packages/design-system/`)

**Purpose**: Shared UI primitives (no feature logic).

**Components**:
- [`components/`](design-system/components/) - UI components (Button, Card, ThemedView, etc.)
- [`constants/`](design-system/constants/) - Theme and UI constants
- [`context/`](design-system/context/) - React contexts (Theme)
- [`hooks/`](design-system/hooks/) - React hooks (useTheme, useColorScheme)

**Boundary Rules**:
- May be imported by `ui/` layers
- Must not contain feature logic
- Must not import from features

## Contracts (`packages/contracts/`)

**Purpose**: Canonical schemas, DTOs, and validators used by apps and features.

**Components**:
- [`models/`](contracts/models/) - Type definitions
- [`schema.ts`](contracts/schema.ts) - Validation schemas
- [`constants.ts`](contracts/constants.ts) - Shared constants

**Boundary Rules**:
- May be imported by any layer
- Must not depend on other packages

## Import Rules

### Allowed Imports
- `features/*/domain` → `contracts`, local `domain`
- `features/*/data` → `platform`, `contracts`, local `domain`
- `features/*/ui` → `design-system`, local `domain`
- `apps/*` → `features/*`, `contracts`, `platform`, `design-system`

### Forbidden Imports
- `domain` → `platform`, `ui`, `apps`
- `ui` → `data`, `platform`
- `apps` → business rules or persistence (use features/platform)

See [`README.md`](README.md) for complete boundary map.

## Quick Navigation

### For Feature Development
1. **Structure**: See any feature in [`features/`](features/) for pattern
2. **Boundaries**: [`README.md`](README.md) - Boundary map
3. **Platform**: [`platform/`](platform/) - Platform adapters
4. **UI**: [`design-system/`](design-system/) - UI components

### For Platform Development
1. **Start**: [`platform/AGENT.md`](platform/AGENT.md)
2. **Storage**: [`platform/storage/`](platform/storage/)
3. **Analytics**: [`platform/analytics/`](platform/analytics/)

## See Also

- [Repository Root Index](../INDEX.md) - Master repository index
- [`README.md`](README.md) - Package boundary map
- [`.repo/policy/BOUNDARIES.md`](../.repo/policy/BOUNDARIES.md) - Boundary rules
- [`platform/AGENT.md`](platform/AGENT.md) - Platform agent guide
