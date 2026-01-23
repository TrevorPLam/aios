# AGENT.md (Folder-Level Guide)

## Purpose of this folder

The `packages/platform/` folder contains platform adapters and primitives that provide infrastructure services to the application. This includes:
- Storage adapters (database, file system)
- Analytics and logging infrastructure
- Network/API clients
- Platform-specific utilities
- Shared infrastructure code

This is the **platform layer** in the boundary model: `ui → domain → data → platform`

## What agents may do here

- **Create platform adapters** for storage, analytics, logging, etc.
- **Add platform utilities** that are shared across features
- **Modify platform code** to improve infrastructure
- **Add platform abstractions** that enable feature development
- **Update platform dependencies** (with security checks)

## What agents may NOT do

- **Add feature logic** - Features belong in `packages/features/`
- **Add business rules** - Business logic belongs in feature domain layers
- **Create UI components** - UI belongs in `packages/design-system/` or feature UI layers
- **Import from features** - Platform must not depend on features (violates boundaries)
- **Import from apps** - Platform must not depend on apps (violates boundaries)

## Boundary Rules

The platform layer:
- **Depends on nothing** - It is the foundation layer
- **May be imported by** - Data layers, domain layers (indirectly), apps
- **Must not import** - Features, apps, UI components, business logic

Import direction: `ui → domain → data → platform` (platform is at the bottom)

## Required links

- Refer to higher-level policy: 
  - `/.repo/policy/BOUNDARIES.md` - Architectural boundary rules
  - `/.repo/policy/PRINCIPLES.md` - Operating principles
  - `/.repo/agents/AGENTS.md` - Core agent rules

## Examples

### Allowed
- Creating a new storage adapter: `packages/platform/storage/adapters/newAdapter.ts`
- Adding analytics utilities: `packages/platform/analytics/utils/helpers.ts`
- Updating database connection logic: `packages/platform/storage/database.ts`

### Forbidden
- Adding contact management logic (belongs in `packages/features/contacts/`)
- Creating UI components (belongs in `packages/design-system/`)
- Importing from `packages/features/` (violates boundary rules)

## Cross-Feature Dependencies

If platform code needs to be shared across features:
- Use contracts: `packages/contracts/` for shared types/schemas
- Keep platform code generic and reusable
- Do not create feature-specific platform code

## Testing

Platform code should have comprehensive tests:
- Unit tests for utilities
- Integration tests for adapters
- Tests should be in `__tests__/` directories co-located with code

## When in Doubt

- Check `/.repo/policy/BOUNDARIES.md` for boundary rules
- Verify import direction follows `ui → domain → data → platform`
- Create HITL item if boundary rules are unclear
- Reference `packages/README.md` for package structure guidance
