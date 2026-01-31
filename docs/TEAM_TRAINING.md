# Team Training Guide - AIOS Repository

This guide provides comprehensive training for team members working with the AIOS Turbo monorepo.

## Quick Start

### For New Team Members

1. **Repository Overview**
   - AIOS is a Turbo monorepo with pnpm workspaces
   - Multiple applications: web, mobile-android, mobile-ios, mobile-shared
   - Shared packages: api-sdk, config, contracts, features
   - API Gateway service

2. **Initial Setup**
   ```bash
   # Clone and setup
   git clone <your-fork>
   cd aios
   make setup
   
   # Verify everything works
   make verify
   ```

3. **Daily Development Workflow**
   - Create feature branch from `develop`
   - Make changes following Turbo best practices
   - Run `make verify` before committing
   - Create pull request with proper templates

## Repository Structure

### Core Components

```
aios/
├── apps/                    # Applications
│   ├── web/                # React/Vite web application
│   ├── mobile-android/     # Android mobile app
│   ├── mobile-ios/         # iOS mobile app
│   └── mobile-shared/      # Shared mobile code
├── packages/               # Shared libraries
│   ├── api-sdk/           # TypeScript API SDK
│   ├── config/            # Configuration packages
│   ├── contracts/         # TypeScript contracts
│   └── features/          # Feature packages
├── services/               # Backend services
│   └── api-gateway/        # API Gateway service
├── .github/               # CI/CD workflows
└── docs/                  # Documentation
```

### Technology Stack

| Component | Technology | Purpose |
|-----------|-------------|---------|
| Monorepo | Turbo + pnpm | Build system and package management |
| Frontend | React + Vite | Web application |
| Mobile | React Native | Mobile applications |
| Backend | Node.js/TypeScript | API Gateway |
| Packages | TypeScript | Shared libraries |
| Build | Turbo | Incremental builds and caching |

## Turbo Monorepo Concepts

### 1. Workspace Configuration

**pnpm-workspace.yaml:**
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'services/*'
```

**turbo.json:**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    }
  }
}
```

### 2. Package Dependencies

**Internal Dependencies:**
```json
// apps/web/package.json
{
  "dependencies": {
    "@aios/api-sdk": "workspace:*",
    "@aios/contracts": "workspace:*"
  }
}
```

**Dependency Graph:**
- `apps/web` depends on `packages/api-sdk`
- `packages/api-sdk` depends on `packages/contracts`
- `services/api-gateway` depends on `packages/contracts`

### 3. Incremental Builds

Turbo automatically detects what changed and only builds affected packages:

```bash
# Build only changed packages
pnpm turbo build

# Build specific package
pnpm turbo build --filter=@aios/web

# Build packages that depend on changes
pnpm turbo build --filter=@aios/web^
```

## Development Workflows

### 1. Feature Development

**Step 1: Planning**
- Check if issue exists for your feature
- Understand impact on dependency graph
- Plan testing strategy

**Step 2: Development**
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Start development server
pnpm dev

# Work on specific package
pnpm --filter=@aios/web dev
```

**Step 3: Testing**
```bash
# Run tests for all packages
pnpm test

# Run tests for specific package
pnpm --filter=@aios/web test

# Run tests for affected packages
pnpm turbo test --filter=...
```

**Step 4: Building**
```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter=@aios/web build

# Build affected packages only
pnpm turbo build
```

### 2. Package Development

**Creating a New Package:**
```bash
# Create new package directory
mkdir packages/new-package
cd packages/new-package

# Initialize package
pnpm init

# Add to workspace
# Update pnpm-workspace.yaml if needed
```

**Package Structure:**
```
packages/new-package/
├── src/
│   ├── index.ts
│   └── components/
├── package.json
├── tsconfig.json
└── README.md
```

**Package Dependencies:**
```json
{
  "name": "@aios/new-package",
  "version": "0.1.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src"
  },
  "dependencies": {
    "@aios/contracts": "workspace:*"
  }
}
```

### 3. Cross-Package Changes

**When changing shared packages:**
1. Identify all dependent packages
2. Update version if breaking change
3. Test all affected packages
4. Update documentation

**Example: Updating API SDK**
```bash
# Change API SDK
cd packages/api-sdk
# Make changes

# Test dependent packages
pnpm turbo test --filter=@aios/web
pnpm turbo test --filter=@aios/mobile-android

# Build dependent packages
pnpm turbo build --filter=@aios/web
```

## Turbo Commands

### Essential Commands

```bash
# Install all dependencies
pnpm install

# Development mode (all packages)
pnpm dev

# Development mode (specific package)
pnpm --filter=@aios/web dev

# Build all packages
pnpm build

# Build affected packages only
pnpm turbo build

# Test all packages
pnpm test

# Test affected packages only
pnpm turbo test

# Lint all packages
pnpm lint

# Clean all packages
pnpm clean

# List all packages
pnpm turbo ls

# Show dependency graph
pnpm turbo ls --graph

# Run command on specific package
pnpm --filter=@aios/web <command>

# Run command on package and dependents
pnpm turbo <command> --filter=@aios/web^

# Run command on package and dependencies
pnpm turbo <command> --filter=@aios/web...
```

### Advanced Commands

```bash
# Dry run to see what would be executed
pnpm turbo build --dry-run

# Force rebuild (ignore cache)
pnpm turbo build --force

# Continue on errors
pnpm turbo build --continue

# Run in parallel
pnpm turbo build --parallel

# Specific turbo configuration
pnpm turbo build --turbo-config=./custom-turbo.json
```

## Caching Strategy

### 1. Turbo Cache

**Local Cache:**
```bash
# View cache status
pnpm turbo status

# Clear local cache
pnpm turbo clean
```

**Remote Cache (if configured):**
```bash
# Connect to remote cache
pnpm turbo link

# Use remote cache
pnpm turbo build --team=my-team
```

### 2. Package Manager Cache

**pnpm Store Cache:**
```bash
# Clear pnpm store
pnpm store prune

# View store status
pnpm store status
```

**Node Modules Cache:**
```bash
# Clear node_modules
rm -rf node_modules
rm -rf */node_modules

# Reinstall
pnpm install
```

## Testing Strategy

### 1. Unit Testing

**Package Tests:**
```bash
# Run tests for specific package
pnpm --filter=@aios/web test

# Run tests with coverage
pnpm --filter=@aios/web test --coverage

# Watch mode
pnpm --filter=@aios/web test --watch
```

**Test Configuration:**
```json
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: ['src/**/*.ts'],
};
```

### 2. Integration Testing

**Cross-Package Tests:**
```bash
# Test package integration
pnpm turbo test --filter=integration

# Test specific scenarios
pnpm turbo test --filter=@aios/web -- --testPathPattern=integration
```

### 3. E2E Testing

**Web Application:**
```bash
# Run E2E tests
pnpm --filter=@aios/web test:e2e

# Run E2E tests for specific scenarios
pnpm --filter=@aios/web test:e2e -- --grep "Login flow"
```

## Build and Deployment

### 1. Build Process

**Development Build:**
```bash
# Build for development
pnpm build

# Build specific package
pnpm --filter=@aios/web build
```

**Production Build:**
```bash
# Build for production
NODE_ENV=production pnpm build

# Build with optimization
pnpm build --production
```

### 2. Deployment

**Web Application:**
```bash
# Build and deploy web app
pnpm --filter=@aios/web build
# Deploy dist/ folder to hosting
```

**API Gateway:**
```bash
# Build and deploy API service
pnpm --filter=@aios/api-gateway build
# Deploy to serverless platform
```

## Troubleshooting

### Common Issues

**1. Dependency Resolution**
```bash
# Check dependency graph
pnpm turbo ls --graph

# Resolve circular dependencies
# Review package.json files
# Update dependency versions
```

**2. Cache Issues**
```bash
# Clear all caches
pnpm turbo clean
pnpm store prune
rm -rf node_modules
pnpm install
```

**3. Build Failures**
```bash
# Build with verbose output
pnpm turbo build --verbose

# Build specific package
pnpm --filter=@aios/web build --verbose
```

**4. Test Failures**
```bash
# Run tests with detailed output
pnpm --filter=@aios/web test --verbose

# Run specific test file
pnpm --filter=@aios/web test -- test-file.spec.ts
```

### Debug Commands

```bash
# Check package configuration
pnpm --filter=@aios/web list

# Verify dependencies
pnpm why <package-name>

# Check outdated packages
pnpm outdated

# Audit security
pnpm audit
```

## Best Practices

### 1. Package Development

**Package Structure:**
- Keep packages focused and single-purpose
- Use clear naming conventions
- Document public APIs
- Include comprehensive tests

**Dependencies:**
- Minimize external dependencies
- Use workspace dependencies for internal packages
- Keep dependency versions consistent
- Document peer dependencies

### 2. Turbo Configuration

**Pipeline Definition:**
- Define clear task dependencies
- Specify appropriate outputs
- Use environment variables for configuration
- Enable caching for expensive operations

**Performance:**
- Use incremental builds
- Leverage caching effectively
- Run tasks in parallel when possible
- Monitor build performance

### 3. Development Workflow

**Branch Strategy:**
- Use feature branches for development
- Keep develop branch stable
- Use pull requests for all changes
- Test across all affected packages

**Code Quality:**
- Follow TypeScript best practices
- Use ESLint and Prettier
- Write comprehensive tests
- Document public APIs

## Advanced Topics

### 1. Custom Turbo Tasks

**Defining Custom Tasks:**
```json
{
  "pipeline": {
    "custom-task": {
      "dependsOn": ["^build", "build"],
      "outputs": ["dist/**"],
      "env": ["NODE_ENV"],
      "passThroughEnv": ["CUSTOM_VAR"]
    }
  }
}
```

**Running Custom Tasks:**
```bash
pnpm turbo custom-task
```

### 2. Conditional Builds

**Environment-Specific Builds:**
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"],
      "env": ["NODE_ENV"],
      "inputs": ["src/**/*.tsx", "src/**/*.ts"]
    }
  }
}
```

### 3. Remote Caching

**Setting Up Remote Cache:**
```bash
# Install Turbo CLI
npm install -g turbo

# Login to Turbo
turbo login

# Link to remote cache
turbo link
```

## Performance Optimization

### 1. Build Performance

**Optimization Techniques:**
- Use appropriate cache keys
- Minimize build outputs
- Parallelize independent tasks
- Use faster runners for CI/CD

**Monitoring:**
```bash
# Analyze build performance
pnpm turbo build --dry-run=json

# Check cache hit rates
pnpm turbo status
```

### 2. Development Experience

**Fast Development:**
- Use watch mode for development
- Leverage hot module replacement
- Optimize for incremental changes
- Use appropriate file watching

## Resources

### Documentation

- [Turbo Documentation](https://turbo.build/docs)
- [pnpm Documentation](https://pnpm.io/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Tools and Extensions

- VS Code extensions for Turbo
- Turbo CLI for local development
- pnpm CLI for package management
- TypeScript for type safety

### Community

- Turbo Discord community
- GitHub discussions
- Stack Overflow tags
- Blog posts and tutorials

## Assessment

### Knowledge Check

After completing this training, you should be able to:

1. ✅ Explain Turbo monorepo concepts
2. ✅ Set up development environment
3. ✅ Use Turbo commands effectively
4. ✅ Develop packages and applications
5. ✅ Handle cross-package dependencies
6. ✅ Optimize build performance
7. ✅ Troubleshoot common issues

### Next Steps

1. **Complete setup** on your local machine
2. **Explore the codebase** to understand structure
3. **Make a small contribution** to practice workflow
4. **Review Turbo documentation** for advanced topics
5. **Ask questions** when unsure about something

---

**Welcome to the AIOS team!** 🚀

We're excited to have you contribute to our Turbo monorepo. Don't hesitate to ask for help - we're all learning together about monorepo best practices.
