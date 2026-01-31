# Turbo Monorepo CI/CD Best Practices

This guide outlines best practices for implementing efficient CI/CD pipelines in Turbo monorepos, specifically for the AIOS project.

## Overview

Turbo monorepos require special considerations for CI/CD due to:
- Multiple packages and applications
- Inter-package dependencies
- Build caching optimization
- Incremental builds
- Parallel execution

## Core Principles

### 1. Incremental Builds
Only build and test what changed to maximize efficiency.

### 2. Intelligent Caching
Leverage Turbo's built-in caching at multiple levels.

### 3. Dependency Awareness
Understand and respect package dependency graphs.

### 4. Parallel Execution
Run independent tasks in parallel where possible.

## Turbo Configuration

### turbo.json Best Practices

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [
    "**/.env.*local",
    "pnpm-lock.yaml",
    "turbo.json"
  ],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"],
      "cache": false
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "cache": false
    },
    "lint": {
      "outputs": [],
      "cache": false
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": [],
      "cache": false
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### Key Configuration Points

1. **Global Dependencies**: Files that affect all packages
2. **Pipeline Dependencies**: Define task relationships
3. **Outputs**: Specify what to cache for each task
4. **Cache Control**: Fine-tune caching behavior

## CI/CD Workflow Strategy

### 1. Setup Phase

**Goals:**
- Install dependencies efficiently
- Set up caching layers
- Prepare build environment

**Implementation:**
```yaml
setup:
  runs-on: ubuntu-latest-4-core
  steps:
    - name: Checkout
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'pnpm'
    
    - name: Setup pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 8.15.0
    
    - name: Cache Turbo
      uses: actions/cache@v4
      with:
        path: |
          .turbo
          node_modules/.cache
        key: turbo-${{ hashFiles('**/turbo.json', '**/package.json', '**/pnpm-lock.yaml') }}
        restore-keys: |
          turbo-${{ hashFiles('**/turbo.json', '**/package.json') }}-
          turbo-
    
    - name: Install dependencies
      run: pnpm install --frozen-lockfile
```

### 2. Affected Package Detection

**Goals:**
- Identify changed packages
- Determine build scope
- Optimize execution plan

**Implementation:**
```yaml
detect-changes:
  runs-on: ubuntu-latest-4-core
  outputs:
    apps-changed: ${{ steps.changes.outputs.apps }}
    packages-changed: ${{ steps.changes.outputs.packages }}
    all-changed: ${{ steps.changes.outputs.all }}
  steps:
    - name: Checkout
      uses: actions/checkout@v4
    
    - name: Detect changes
      uses: dorny/paths-filter@v3
      id: changes
      with:
        filters: |
          apps:
            - 'apps/**'
          packages:
            - 'packages/**'
          all:
            - 'apps/**'
            - 'packages/**'
            - 'turbo.json'
            - 'pnpm-lock.yaml'
```

### 3. Build Phase

**Goals:**
- Build only affected packages
- Leverage Turbo caching
- Parallelize independent builds

**Implementation:**
```yaml
build:
  runs-on: ubuntu-latest-4-core
  needs: [setup, detect-changes]
  if: needs.detect-changes.outputs.all-changed == 'true'
  steps:
    - name: Checkout
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'pnpm'
    
    - name: Setup pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 8.15.0
    
    - name: Restore Turbo cache
      uses: actions/cache@v4
      with:
        path: |
          .turbo
          node_modules/.cache
        key: turbo-${{ hashFiles('**/turbo.json', '**/package.json', '**/pnpm-lock.yaml') }}
        restore-keys: |
          turbo-${{ hashFiles('**/turbo.json', '**/package.json') }}-
          turbo-
    
    - name: Install dependencies
      run: pnpm install --frozen-lockfile
    
    - name: Build affected packages
      run: pnpm turbo build --filter=!@aios/mobile-android --filter=!@aios/mobile-ios
```

### 4. Test Phase

**Goals:**
- Test only affected packages
- Run tests in parallel
- Generate coverage reports

**Implementation:**
```yaml
test:
  runs-on: ubuntu-latest-4-core
  needs: [setup, detect-changes, build]
  if: needs.detect-changes.outputs.all-changed == 'true'
  strategy:
    matrix:
      scope: [apps, packages]
  steps:
    - name: Checkout
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'pnpm'
    
    - name: Setup pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 8.15.0
    
    - name: Restore Turbo cache
      uses: actions/cache@v4
      with:
        path: |
          .turbo
          node_modules/.cache
        key: turbo-${{ hashFiles('**/turbo.json', '**/package.json', '**/pnpm-lock.yaml') }}
        restore-keys: |
          turbo-${{ hashFiles('**/turbo.json', '**/package.json') }}-
          turbo-
    
    - name: Install dependencies
      run: pnpm install --frozen-lockfile
    
    - name: Test ${{ matrix.scope }}
      run: pnpm turbo test --filter=${{ matrix.scope }}/*
```

## Caching Strategy

### Multi-Layer Caching

1. **Dependency Cache**: Node modules and pnpm store
2. **Turbo Cache**: Build artifacts and task outputs
3. **GitHub Actions Cache**: Persistent storage
4. **Runner Cache**: Temporary runner storage

### Cache Key Strategy

```bash
# Dependency cache key
pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}

# Turbo cache key
turbo-${{ hashFiles('**/turbo.json', '**/package.json', '**/pnpm-lock.yaml') }}

# Build cache key
build-${{ hashFiles('**/turbo.json', '**/package.json') }}-${{ github.sha }}
```

### Cache Optimization

1. **Granular Cache Keys**: Use specific file hashes
2. **Fallback Keys**: Provide partial cache matches
3. **Cache Paths**: Include all relevant directories
4. **Cache TTL**: Set appropriate retention periods

## Performance Optimization

### 1. Parallel Execution

```yaml
# Run independent jobs in parallel
jobs:
  lint:
    runs-on: ubuntu-latest-4-core
    steps:
      - name: Lint
        run: pnpm turbo lint
  
  type-check:
    runs-on: ubuntu-latest-4-core
    steps:
      - name: Type check
        run: pnpm turbo type-check
  
  test:
    runs-on: ubuntu-latest-4-core
    needs: [lint, type-check]
    steps:
      - name: Test
        run: pnpm turbo test
```

### 2. Smart Filtering

```bash
# Build only changed packages
pnpm turbo build --filter=`pnpm turbo ls --filter=...`

# Test packages that depend on changes
pnpm turbo test --filter=...^

# Build specific scopes
pnpm turbo build --filter=apps/*
pnpm turbo build --filter=packages/*
```

### 3. Resource Optimization

```yaml
# Use larger runners for heavy tasks
heavy-task:
  runs-on: ubuntu-latest-8-core
  
# Use standard runners for light tasks
light-task:
  runs-on: ubuntu-latest-4-core
```

## Security Considerations

### 1. Dependency Security

```yaml
- name: Security audit
  run: |
    pnpm audit --audit-level moderate
    pnpm audit --audit-level high
```

### 2. Secret Management

```yaml
- name: Setup secrets
  env:
    NODE_ENV: production
    API_KEY: ${{ secrets.API_KEY }}
```

### 3. Code Scanning

```yaml
- name: CodeQL Analysis
  uses: github/codeql-action/analyze@v3
  with:
    languages: javascript, typescript
```

## Monitoring and Observability

### 1. Build Metrics

```yaml
- name: Collect metrics
  run: |
    echo "Build duration: ${{ steps.build.outputs.duration }}"
    echo "Cache hit rate: ${{ steps.cache.outputs.cache-hit }}"
    echo "Packages built: ${{ steps.build.outputs.package-count }}"
```

### 2. Performance Tracking

```yaml
- name: Performance report
  run: |
    pnpm turbo run build --dry-run=json > build-plan.json
    # Analyze build plan and report metrics
```

### 3. Failure Analysis

```yaml
- name: Analyze failures
  if: failure()
  run: |
    echo "::group::Failure Analysis"
    pnpm turbo run build --force
    echo "::endgroup::"
```

## Best Practices Summary

### Do's

1. ✅ Use Turbo's built-in caching
2. ✅ Implement multi-layer caching strategy
3. ✅ Build only affected packages
4. ✅ Run independent tasks in parallel
5. ✅ Use specific cache keys
6. ✅ Monitor build performance
7. ✅ Implement proper error handling
8. ✅ Use appropriate runner sizes

### Don'ts

1. ❌ Build all packages on every change
2. ❌ Ignore dependency relationships
3. ❌ Use single cache key for everything
4. ❌ Run tasks sequentially when parallel is possible
5. ❌ Skip performance monitoring
6. ❌ Ignore security scanning
7. ❌ Use oversized runners unnecessarily
8. ❌ Forget cache cleanup

## Troubleshooting

### Common Issues

1. **Cache Misses**: Check cache key generation
2. **Build Failures**: Verify dependency graph
3. **Test Failures**: Check test dependencies
4. **Performance Issues**: Analyze build plan
5. **Memory Issues**: Optimize runner size

### Debug Commands

```bash
# Check Turbo configuration
pnpm turbo ls

# Analyze build plan
pnpm turbo run build --dry-run=json

# Force rebuild
pnpm turbo run build --force

# Check cache status
pnpm turbo status
```

## Advanced Topics

### 1. Custom Pipelines

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

### 2. Remote Caching

```bash
# Setup remote cache
pnpm turbo link

# Use remote cache
pnpm turbo run build --team=my-team
```

### 3. Conditional Execution

```yaml
- name: Conditional build
  if: contains(github.event.head_commit.message, '[build-all]')
  run: pnpm turbo build
```

## Implementation Checklist

### Initial Setup

- [ ] Configure turbo.json properly
- [ ] Set up pnpm workspace
- [ ] Define pipeline dependencies
- [ ] Configure cache strategies

### CI/CD Implementation

- [ ] Create setup workflow
- [ ] Implement change detection
- [ ] Set up build pipeline
- [ ] Configure test pipeline
- [ ] Add security scanning

### Optimization

- [ ] Enable parallel execution
- [ ] Optimize cache keys
- [ ] Monitor performance
- [ ] Fine-tune runner sizes

### Maintenance

- [ ] Regular dependency updates
- [ ] Performance monitoring
- [ ] Cache cleanup
- [ ] Documentation updates

---

**Remember**: Turbo monorepo CI/CD is about efficiency. Start with the basics and optimize incrementally based on your specific needs and performance metrics.
