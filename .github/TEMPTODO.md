# AIOS Repository .github Implementation Tasks

## Current State
- ✅ Basic .github structure exists
- ✅ 5 workflows: ci.yml, blast-radius.yml, governance-drift.yml, security.yml, validation.yml
- ✅ CODEOWNERS configured for @TrevorPLam
- ✅ SECURITY.md with comprehensive policy
- ✅ pull_request_template.md
- ❌ Missing CONTRIBUTING.md
- ❌ Missing Dependabot configuration
- ❌ No advanced caching
- ❌ No YAML anchors implementation

## High Priority Tasks

### 1. Create CONTRIBUTING.md
- [ ] Add contribution guidelines specific to AIOS monorepo
- [ ] Include setup instructions (make setup, make verify)
- [ ] Document Turbo monorepo workflow
- [ ] Add testing requirements for apps/services/packages

### 2. Implement YAML Anchors in Workflows
- [ ] Refactor ci.yml to use YAML anchors for common steps
- [ ] Create reusable Node.js setup anchor
- [ ] Apply anchors to validation.yml (8406 lines - huge optimization opportunity)
- [ ] Standardize workflow patterns across all 5 workflows

### 3. Create Reusable Workflow Templates
- [ ] Extract Node.js CI pattern to reusable workflow
- [ ] Extract security scanning to reusable workflow
- [ ] Create Turbo-specific verification workflow
- [ ] Create governance drift checking workflow

### 4. Enhanced Security Scanning
- [ ] Add CodeQL analysis workflow
- [ ] Configure secret scanning
- [ ] Enhance existing security.yml
- [ ] Add dependency scanning for pnpm packages

## Medium Priority Tasks

### 5. Upgrade Runner Types
- [ ] Test M2 macOS runners for mobile apps
- [ ] Upgrade to ubuntu-latest-4-core for faster builds
- [ ] Consider ARM64 runners for specific workloads

### 6. Advanced Caching Strategy
- [ ] Implement pnpm cache with Turbo-aware keys
- [ ] Add Turbo build caching
- [ ] Cache node_modules across workspaces
- [ ] Cache build artifacts for faster PR checks

### 7. Configure Dependabot
- [ ] Create dependabot.yml for pnpm workspace packages
- [ ] Configure GitHub Actions updates
- [ ] Add version bumping strategy for monorepo

### 8. Enhanced Templates
- [ ] Create multiple PR templates (feature, bugfix, hotfix, release)
- [ ] Create issue templates (bug, feature, performance, security)
- [ ] Add ISSUE_TEMPLATE directory structure

## Low Priority Tasks

### 9. Documentation & Monitoring
- [ ] Document Turbo monorepo CI/CD best practices
- [ ] Create team training materials
- [ ] Add workflow troubleshooting guide

## AIOS-Specific Considerations

### Turbo Monorepo Structure
- Handle pnpm workspace with multiple apps
- Respect Turbo build ordering and caching
- Optimize for incremental builds
- Handle inter-package dependencies

### Application Types
- Frontend: apps/web (React/Vite)
- Mobile: apps/mobile-android, apps/mobile-ios, apps/mobile-shared
- Packages: api-sdk, config, contracts, features
- Services: services/api-gateway

### Performance Requirements
- Turbo caching integration critical
- Parallel builds for multiple apps
- Fast PR feedback loops
- Efficient dependency management

### Governance Requirements
- Blast radius checks for infrastructure changes
- Governance drift detection
- Security scanning across all packages
- Compliance with alignment standards

## Implementation Order
1. CONTRIBUTING.md (immediate need)
2. YAML anchors in validation.yml (biggest impact - 8406 lines)
3. CodeQL security scanning (security priority)
4. Turbo-aware caching (performance priority)
5. Dependabot configuration (maintenance)
6. Enhanced templates (UX improvement)

## Success Metrics
- Reduce validation.yml from 8406 lines to ~2000 lines with anchors
- Achieve 50% faster Turbo builds with proper caching
- 100% dependency update automation across workspace
- Zero security vulnerabilities in automated scans
- Sub-5-minute PR feedback for common changes

## Turbo Optimization Notes
- Leverage Turbo's built-in caching
- Use pnpm's workspace filtering
- Implement incremental builds
- Cache .turbo directory properly
- Optimize build graph for parallel execution
