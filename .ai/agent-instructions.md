# AI Agent Instructions - AIOS

## Repository Overview
This is a monorepo containing multiple applications (web, mobile, API) and shared packages (design system, features, platform utilities).

## Architecture
- **Monorepo**: Yes (apps/ and packages/ structure)
- **Apps**: 
  - `apps/web` - Web application
  - `apps/mobile` - React Native mobile app
  - `apps/api` - API server
- **Packages**:
  - `packages/design-system` - Shared UI components and theme
  - `packages/features` - Feature modules (alerts, budget, calendar, etc.)
  - `packages/platform` - Platform utilities (analytics, storage, logging)
  - `packages/contracts` - Shared types and schemas

## Key Conventions
- Features follow domain-driven design with `data/`, `domain/`, `ui/` layers
- Design system provides theming and reusable components
- Platform package handles cross-cutting concerns
- Contracts define shared types and schemas

## Common Tasks
- **Adding a feature**: Create in `packages/features/[feature-name]/` with data/domain/ui structure
- **Adding UI component**: Add to `packages/design-system/components/` if reusable
- **Adding platform utility**: Add to `packages/platform/lib/`
