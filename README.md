# AIOS

Monorepo containing web, mobile, and API applications with shared packages.

## Structure

- `apps/web/` - Web application
- `apps/mobile/` - React Native mobile app
- `apps/api/` - API server
- `packages/design-system/` - Shared UI components and theme
- `packages/features/` - Feature modules (DDD structure)
- `packages/platform/` - Platform utilities (analytics, storage, logging)
- `packages/contracts/` - Shared types and schemas
- `infrastructure/` - Infrastructure as code
- `tools/` - Development tools
- `docs/` - Documentation

## Getting Started

```bash
# Install dependencies
pnpm install

# Run all apps in development
pnpm dev

# Build all packages
pnpm build
```
