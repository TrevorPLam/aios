# AIOS

Monorepo with apps, services, and shared packages.

This repo follows the **Repository Alignment Standard v1.2.0** (see [ALIGNMENT/README.md](ALIGNMENT/README.md)).

## Repo Contract (setup + verify)

Preferred (deterministic, used in CI):

```bash
make setup
make verify
```

Notes for Windows:
- `make setup` / `make verify` run `./scripts/*.sh` and require a Bash environment (WSL2 or Git Bash).

## Usage

```bash
# Run all apps in development
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Run linter
pnpm lint

# Type check
pnpm type-check
```

## Project Structure

### Core Layer (`packages/`)
- `packages/ui/` - Design system components (React/Vue/Svelte)
- `packages/utils/` - Shared utilities (logging, error-handling, validation)
- `packages/api-sdk/` - Generated API clients and manual extensions
- `packages/config/` - Shared configurations (ESLint, TypeScript, Jest)
- `packages/features/` - Feature modules (DDD structure)
- `packages/platform/` - Platform utilities (analytics, storage, logging)
- `packages/contracts/` - Shared types and schemas

### Applications (`apps/`)
- `apps/web/` - Main web application (Next.js)
- `apps/mobile-shared/` - Shared mobile code (React Native/Expo)
- `apps/mobile-ios/` - iOS-specific mobile application
- `apps/mobile-android/` - Android-specific mobile application

### Services (`services/`)
- `services/api-gateway/` - API gateway with routing and middleware

### Infrastructure (`infrastructure/`)
- `infrastructure/k8s/` - Kubernetes manifests with Kustomize
- `infrastructure/terraform/` - Cloud infrastructure modules
- `infrastructure/docker/` - Docker configurations
- `infrastructure/scripts/` - Deployment scripts

### Tools (`tools/`)
- `tools/codegen/` - Code generation scripts
- `tools/migration-assistant/` - DB migration helpers

### Documentation (`docs/`)
- `docs/architecture/` - Architecture documentation
- `docs/api/` - OpenAPI specs
- `docs/decisions/` - Architecture Decision Records (ADRs)
- `docs/onboarding/` - Getting started guides

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

Proprietary - See [LICENSE](LICENSE) for details.

