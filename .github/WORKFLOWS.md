# GitHub Actions Workflows

**File**: `.github/WORKFLOWS.md`

This document catalogs all GitHub Actions workflows in the repository, their triggers, purposes, and status.

## Workflow Summary

| Workflow | Status | Triggers | Purpose |
|----------|--------|----------|---------|
| `ci.yml` | Active | Push/PR to main/develop | Main CI pipeline (type-check, lint, test, build, governance) |
| `codeql.yml` | Active | Push/PR + Daily schedule | Security code analysis |
| `api-spectral.yml` | Active | PR/Push (API files) | OpenAPI spec linting |
| `compile-constitution.yml` | Active | Push/PR (constitution.json) | Auto-generate copilot instructions |
| `pr-log-injection.yml` | Active | PR opened/edited | Inject PR template data into logs |
| `docs-links.yml` | Active | PR/Push + Weekly schedule | Check documentation links |
| `docs-quality.yml` | Active | PR/Push (docs) | Documentation quality checks |
| `docs-markdownlint.yml` | Active | PR/Push (markdown) | Markdown linting |
| `docs-vale.yml` | Active | PR/Push (docs) | Prose linting with Vale |
| `gitleaks.yml` | Active | Push/PR + Weekly schedule | Secret scanning |
| `ossf-scorecard.yml` | Active | Push + Weekly schedule | Security best practices scorecard |
| `release.yml` | Active | Push to main/develop | Semantic versioning and releases |
| `sbom.yml` | Active | Push/Release + Weekly schedule | Generate Software Bill of Materials |
| `slsa-provenance.yml` | Active | Release published | Generate SLSA provenance for builds |
| `trivy.yml` | Active | Push/PR + Daily schedule | Vulnerability scanning |

**Total**: 15 workflows

## Detailed Workflow Descriptions

### 1. CI (`ci.yml`)

**Status**: Active  
**Triggers**: 
- Push to `main`, `develop`, `copilot/**`
- Pull requests to `main`, `develop`

**Jobs**:
- `type-check`: TypeScript type checking
- `lint`: ESLint validation
- `format-check`: Prettier format validation
- `docs-validation`: Spell check and markdown lint
- `test`: Jest test suite with coverage
- `coverage-ratchet`: Coverage check for new code (PR only)
- `todo-format-check`: TODO/FIXME format validation
- `audit`: Security audit (npm audit + pattern checks)
- `boundaries`: Architectural boundary checking
- `expo-config-check`: Expo configuration validation
- `build-client`: Build Expo app
- `build-server`: Build Express server
- `bundle-budget`: Bundle size budget check (PR only)
- `governance-verify`: Governance framework verification

**Purpose**: Comprehensive CI pipeline ensuring code quality, security, and compliance.

---

### 2. CodeQL Security Scan (`codeql.yml`)

**Status**: Active  
**Triggers**:
- Push to `main`, `develop`, `copilot/**`
- Pull requests to `main`, `develop`
- Daily schedule (2 AM UTC)

**Purpose**: Static security analysis using GitHub's CodeQL engine.

**Languages**: JavaScript

---

### 3. API Spec Linting (`api-spectral.yml`)

**Status**: Active  
**Triggers**:
- Pull requests (when API files change)
- Push to `main` (when API files change)

**Paths Watched**:
- `docs/apis/**/*.yaml`
- `docs/apis/**/*.yml`
- `docs/apis/**/*.json`
- `.spectral.yml`

**Jobs**:
- `spectral`: Lint OpenAPI specs with Spectral
- `validate-openapi`: Validate OpenAPI structure

**Purpose**: Ensure API contract consistency and prevent drift.

---

### 4. Compile Constitution (`compile-constitution.yml`)

**Status**: Active  
**Triggers**:
- Push to `main`, `develop` (when `constitution.json` changes)
- Pull requests (when `constitution.json` changes)
- Manual dispatch

**Purpose**: Auto-generate copilot instructions and AGENTS.md files from constitution.

**Actions**:
- Compiles `.repo/policy/constitution.json` to generate:
  - `.github/copilot-instructions.md`
  - `.github/AGENTS.md`
  - `.github/instructions/*.md` files
- Auto-commits changes on push
- Comments on PRs when regeneration needed

---

### 5. PR Log Injection (`pr-log-injection.yml`)

**Status**: Active  
**Triggers**:
- Pull request opened
- Pull request edited
- Pull request synchronized
- Manual dispatch

**Purpose**: Extract PR template data and inject into trace logs, agent logs, and interaction logs.

**Actions**:
- Extracts PR template information
- Finds latest trace/agent logs
- Injects PR data into logs
- Commits updated logs back to PR

---

### 6. Documentation Links (`docs-links.yml`)

**Status**: Active  
**Triggers**:
- Pull requests (when docs change)
- Push to `main`
- Weekly schedule (Mondays 9 AM UTC)
- Manual dispatch

**Purpose**: Check for broken links in documentation.

**Actions**:
- Uses Lychee to check all markdown links
- Comments on PRs with broken links
- Creates issues for broken links (scheduled runs)
- Uploads link check reports as artifacts

---

### 7. Documentation Quality (`docs-quality.yml`)

**Status**: Active  
**Triggers**:
- Pull requests (when markdown files change)
- Push to `main` (when markdown files change)

**Jobs**:
- `link-check`: Markdown link validation
- `markdown-lint`: Markdown formatting lint
- `spell-check`: Spell checking with cspell

**Purpose**: Ensure documentation quality and consistency.

---

### 8. Markdown Linting (`docs-markdownlint.yml`)

**Status**: Active  
**Triggers**:
- Pull requests (when markdown files change)
- Push to `main` (when markdown files change)

**Purpose**: Enforce markdown formatting standards.

**Actions**:
- Runs markdownlint on all markdown files
- Comments on PRs with formatting issues

---

### 9. Vale Prose Linting (`docs-vale.yml`)

**Status**: Active  
**Triggers**:
- Pull requests (when docs change)
- Push to `main` (when docs change)

**Purpose**: Enforce consistent writing style and tone.

**Actions**:
- Runs Vale prose linting on documentation
- Posts review comments on PRs
- Uploads Vale results as artifacts

---

### 10. Secret Scanning (`gitleaks.yml`)

**Status**: Active  
**Triggers**:
- Push to `main`, `develop`
- Pull requests to `main`, `develop`
- Weekly schedule (Sundays 2 AM UTC)

**Purpose**: Detect secrets, API keys, and credentials in code.

**Actions**:
- Scans entire repository history
- Uses `.gitleaks.toml` configuration
- Redacts secrets from output
- Publishes to GitHub Security

---

### 11. OpenSSF Scorecard (`ossf-scorecard.yml`)

**Status**: Active  
**Triggers**:
- Push to `main`
- Weekly schedule (Wednesdays 10 AM UTC)
- Manual dispatch

**Purpose**: Measure security best practices compliance.

**Actions**:
- Runs OpenSSF Scorecard analysis
- Evaluates 15+ security dimensions
- Uploads SARIF to GitHub Security
- Updates scorecard badge in README

---

### 12. Release (`release.yml`)

**Status**: Active  
**Triggers**:
- Push to `main`, `develop`

**Purpose**: Automated semantic versioning and releases.

**Actions**:
- Runs semantic-release
- Generates changelog
- Creates GitHub releases
- Publishes to npm (if configured)

**Note**: Skips if commit message contains `[skip ci]`

---

### 13. Generate SBOM (`sbom.yml`)

**Status**: Active  
**Triggers**:
- Push to `main`
- Release published
- Weekly schedule (Sundays midnight UTC)
- Manual dispatch

**Purpose**: Generate Software Bill of Materials for supply chain security.

**Actions**:
- Generates SPDX JSON SBOM
- Generates CycloneDX JSON SBOM
- Generates human-readable table
- Attaches to releases
- Runs dependency review

---

### 14. SLSA Provenance (`slsa-provenance.yml`)

**Status**: Active  
**Triggers**:
- Release published
- Manual dispatch

**Purpose**: Generate SLSA Level 3 provenance for build integrity.

**Jobs**:
- `build`: Builds artifacts and generates hashes
- `provenance`: Generates SLSA provenance
- `verify`: Verifies provenance integrity

**Actions**:
- Builds server and client
- Packages build artifacts
- Generates cryptographically signed provenance
- Verifies build integrity

---

### 15. Trivy Security Scan (`trivy.yml`)

**Status**: Active  
**Triggers**:
- Pull requests to `main`
- Push to `main`
- Daily schedule (2 AM UTC)
- Manual dispatch

**Purpose**: Comprehensive vulnerability scanning.

**Jobs**:
- `trivy-scan`: Filesystem and config scanning
- `trivy-npm`: NPM dependencies scanning

**Actions**:
- Scans filesystem for vulnerabilities
- Scans configuration files
- Scans npm dependencies
- Uploads SARIF to GitHub Security
- Creates issues for critical vulnerabilities (scheduled)

---

## Workflow Logs and Artifacts

### Where to Find Logs

1. **GitHub Actions UI**: 
   - Navigate to `Actions` tab in GitHub repository
   - View workflow runs, logs, and artifacts
   - URL: `https://github.com/{owner}/{repo}/actions`

2. **Workflow Artifacts**:
   - Link check reports: `lychee-report.md` (30 day retention)
   - Vale results: `vale-results.json` (30 day retention)
   - SBOM files: `sbom-*.json`, `sbom-*.txt` (90 day retention)
   - Trivy reports: `trivy-*.txt`, `trivy-*.sarif` (30 day retention)
   - Scorecard results: `results.sarif` (90 day retention)

3. **Security Alerts**:
   - CodeQL results: GitHub Security > Code scanning alerts
   - Trivy results: GitHub Security > Code scanning alerts
   - Scorecard: GitHub Security > Code scanning alerts

### Local Logs

- **Agent Interaction Logs**: `.agent-logs/interactions/*.jsonl`
- **Agent Error Logs**: `.agent-logs/errors/*.jsonl`
- **Agent Metrics**: `.agent-logs/metrics/*.json`
- **Trace Logs**: `.repo/traces/*.json`
- **Agent Logs**: `.repo/logs/*.json`

---

## Workflow Status

All 15 workflows are **ACTIVE** and configured to run automatically based on their triggers.

### Scheduled Workflows

- **CodeQL**: Daily at 2 AM UTC
- **Gitleaks**: Weekly on Sundays at 2 AM UTC
- **OpenSSF Scorecard**: Weekly on Wednesdays at 10 AM UTC
- **SBOM**: Weekly on Sundays at midnight UTC
- **Trivy**: Daily at 2 AM UTC
- **Docs Links**: Weekly on Mondays at 9 AM UTC

### Event-Driven Workflows

- **CI**: Runs on every push/PR
- **API Spectral**: Runs when API files change
- **Compile Constitution**: Runs when constitution.json changes
- **PR Log Injection**: Runs on PR events
- **Documentation workflows**: Run when documentation changes
- **Release**: Runs on push to main/develop
- **SLSA Provenance**: Runs on release publication

---

## Monitoring Workflows

### Check Workflow Status

1. **GitHub UI**: Go to repository > Actions tab
2. **GitHub CLI**: `gh workflow list` and `gh run list`
3. **API**: Use GitHub REST API to query workflow runs

### Common Issues

- **Workflow failures**: Check Actions tab for error details
- **Missing artifacts**: Verify artifact retention settings
- **Scheduled runs not executing**: Check repository settings > Actions > General
- **Permission errors**: Verify workflow permissions in workflow files

---

## See Also

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Repository Manifest](.repo/repo.manifest.yaml) - Command source of truth
- [Constitution](.repo/policy/constitution.json) - Governance rules
- [CI Integration Guide](docs/technical/ci-integration.md)

---

**Last Updated**: 2026-01-24  
**Total Active Workflows**: 15
