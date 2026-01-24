# GitHub Actions Workflows Guide

This document provides an overview of all GitHub Actions workflows in this repository, their purpose, and how to use them effectively.

## 📚 Documentation Workflows

### Vale Prose Linting (`docs-vale.yml`)

**Caption:** Vale prevents inconsistent tone and unclear writing in PRs.

**Purpose:** Automatically reviews documentation prose for style consistency, clarity, and readability.

### Triggers

- Pull requests modifying `docs/**/*.md`
- Pushes to main branch

**Configuration:** `.vale.ini`

### What it checks

- Writing style consistency
- Grammar and spelling
- Passive voice usage
- Word choice and clarity
- Technical jargon consistency

### How to fix issues

- Review Vale comments in PR
- Edit documentation to address suggestions
- Run Vale locally: `vale docs/`

---

### Markdown Linting (`docs-markdownlint.yml`)

**Caption:** Markdownlint prevents formatting entropy and unreadable diffs.

**Purpose:** Enforces consistent Markdown formatting to ensure clean diffs and maintainable documentation.

### Triggers (2)

- Pull requests modifying markdown files
- Pushes to main branch

**Configuration:** `.markdownlint.json`

### What it checks (2)

- Heading hierarchy
- List formatting
- Code block syntax
- Line length limits
- Trailing whitespace
- Consistent indentation

### How to fix issues (2)

- Install markdownlint extension in your editor
- Run locally: `npx markdownlint-cli2 "docs/**/*.md"`
- Auto-fix: `npx markdownlint-cli2 --fix "docs/**/*.md"`

---

### Link Checker (`docs-links.yml`)

**Caption:** Broken links destroy trust; this catches rot early.

**Purpose:** Validates all links in documentation to prevent broken references and 404 errors.

### Triggers (3)

- Pull requests (checks changed files only)
- Pushes to main (checks all files)
- Weekly schedule (Mondays at 9 AM UTC)
- Manual dispatch

**Configuration:** `.lycheeignore`

### What it checks (3)

- External HTTP/HTTPS links
- Internal repository links
- Relative documentation links
- Anchor links within pages

### Special behavior

- **PRs:** Only checks links in modified files for fast feedback
- **Main branch:** Checks all links comprehensively
- **Scheduled runs:** Creates GitHub issue if broken links found

### How to fix issues (3)

- Update or remove broken links
- Check if external sites have moved
- Verify internal file paths are correct
- Run locally: `lychee docs/`

---

### API Spec Linting (`api-spectral.yml`)

**Caption:** Spectral enforces API consistency and prevents contract drift.

**Purpose:** Validates OpenAPI specifications for completeness, consistency, and best practices.

### Triggers (4)

- Pull requests modifying `docs/apis/**/*.{yaml,yml,json}`
- Pushes to main branch

**Configuration:** `.spectral.yml`

### What it checks (4)

- OpenAPI schema validity
- Required fields presence
- Consistent response formats
- Security definitions
- API documentation completeness
- Naming conventions

### How to fix issues (4)

- Review Spectral error messages
- Update OpenAPI specs to match standards
- Run locally: `spectral lint docs/apis/*.yaml`

---

## 🔒 Security Workflows

### SBOM Generation (`sbom.yml`)

**Caption:** SBOM creates audit-ready inventory of all dependencies.

**Purpose:** Generates Software Bill of Materials for compliance, security auditing, and supply chain transparency.

### Triggers (5)

- Pushes to main branch
- Release publications
- Weekly schedule (Sundays at midnight UTC)
- Manual dispatch

### Formats generated

- **SPDX JSON:** Industry-standard SBOM format
- **CycloneDX JSON:** OWASP SBOM standard
- **Human-readable table:** Quick reference

### Artifacts

- Uploaded to workflow artifacts (90-day retention)
- Attached to GitHub releases automatically

### Use cases

- Compliance audits
- Security vulnerability tracking
- License compliance verification
- Supply chain risk assessment

---

### Trivy Security Scanner (`trivy.yml`)

**Caption:** Trivy catches security issues in dependencies and configuration.

**Purpose:** Comprehensive security scanning for vulnerabilities in dependencies, configuration files, and infrastructure-as-code.

### Triggers (6)

- Pull requests
- Pushes to main
- Daily schedule (2 AM UTC)
- Manual dispatch

### What it scans

- **Filesystem:** All project files for vulnerabilities
- **NPM dependencies:** node_modules for known CVEs
- **Configuration files:** Misconfigurations in YAML, JSON, etc.
- **IaC files:** Security issues in infrastructure definitions

### Severity levels

- CRITICAL: Immediate action required
- HIGH: Should be addressed soon
- MEDIUM: Plan to address

### Special features

- Uploads results to GitHub Security tab
- Creates issues for critical vulnerabilities (scheduled runs)
- Comprehensive reports in artifacts

### How to fix issues (5)

1. Review Trivy findings in Security > Code scanning
2. Update vulnerable dependencies
3. Fix configuration issues
4. Re-run workflow to verify fixes

---

### SLSA Provenance (`slsa-provenance.yml`)

**Caption:** SLSA provenance provides verifiable build integrity.

**Purpose:** Generates cryptographically signed build provenance for supply chain security and verifiable builds.

### Triggers (7)

- Release publications
- Manual dispatch with tag input

### What it provides

- Tamper-proof build records
- Cryptographic signatures
- Verifiable build process
- Supply chain transparency

**SLSA Level:** Level 3 (highest for GitHub Actions)

### Artifacts generated

- Build artifacts with checksums
- SLSA provenance attestation
- Verification instructions

### How to verify

```bash
slsa-verifier verify-artifact \
  --provenance-path provenance.intoto.jsonl \
  --source-uri github.com/owner/repo \
  artifact-name.tar.gz
```text

---

### OpenSSF Scorecard (`ossf-scorecard.yml`)

**Caption:** OpenSSF Scorecard measures security best practices compliance.

**Purpose:** Evaluates repository against security best practices defined by the Open Source Security Foundation.

### Triggers (8)
- Pushes to main
- Weekly schedule (Wednesdays at 10 AM UTC)
- Manual dispatch

### Security checks
- Binary artifacts
- Branch protection
- CI tests
- Code review practices
- Dangerous workflow patterns
- Dependency updates automation
- Fuzzing presence
- License verification
- Project maintenance status
- Pinned dependencies
- SAST tools usage
- Security policy presence
- Signed releases
- Token permissions
- Known vulnerabilities

### Scoring
- Each check receives 0-10 score
- Results uploaded to GitHub Security tab
- Public repositories can publish to OpenSSF database

### How to improve score
1. Review scorecard results in Security tab
2. Implement recommended security practices
3. Enable branch protection rules
4. Add security policy (SECURITY.md)
5. Pin workflow dependencies
6. Enable automated security scanning

---

## 🤖 Dependency Management

### Dependabot (`dependabot.yml`)

**Caption:** Dependabot automates dependency updates and security patches.

**Purpose:** Automatically creates pull requests for dependency updates and security vulnerabilities.

### Configuration
- **NPM dependencies:** Weekly updates on Mondays
- **GitHub Actions:** Weekly updates on Tuesdays
- **Docker:** Weekly updates on Wednesdays (if applicable)

### Features
- **Grouped updates:** Minor and patch updates grouped together
- **Security priority:** Security vulnerabilities always updated
- **Automatic labeling:** PRs labeled for easy filtering
- **Semantic commits:** Follows conventional commit format

### Update strategy
- Development dependencies grouped
- Production patches grouped
- Major version updates require manual review
- Core dependencies (React, React Native, Expo) opt-in only

### How to manage
1. Review Dependabot PRs regularly
2. Test updates before merging
3. Check for breaking changes
4. Update ignore rules if needed

---

## 📝 Pull Request Automation

### PR Template (`pull_request_template.md`)

**Caption:** PR template prevents undocumented changes from quietly landing.

**Purpose:** Ensures all pull requests include necessary context, documentation, and verification steps.

### Sections
1. **Description:** What changed and why
2. **Type of change:** Bug fix, feature, docs, etc.
3. **Related issues:** Links to issues
4. **Checklist:**
   - Code quality
   - Documentation updates
   - Testing verification
   - Security review
   - Database migrations
5. **Screenshots/videos:** Visual proof
6. **Risks:** Potential issues
7. **Deployment notes:** Special considerations

### Benefits
- Prevents incomplete PRs
- Ensures documentation is updated
- Encourages thorough testing
- Improves code review quality
- Creates better audit trail

---

### CODEOWNERS (`CODEOWNERS.example`)

**Caption:** CODEOWNERS ensures qualified reviewers see critical changes.

**Purpose:** Automatically requests reviews from appropriate team members based on files changed.

### Setup
1. Rename `CODEOWNERS.example` to `CODEOWNERS`
2. Replace placeholder usernames with real GitHub usernames/teams
3. Enable branch protection requiring CODEOWNERS approval

### Protected areas
- Documentation (`docs/`)
- GitHub workflows (`.github/`)
- Security files (`SECURITY.md`, auth code)
- Database schema and migrations
- Configuration files
- Critical application code

### Team examples
- `@frontend-team`: Client-side code
- `@backend-team`: Server-side code
- `@security-team`: Security-sensitive code
- `@devops-team`: Infrastructure and CI/CD
- `@tech-writers`: Documentation

### How to customize
1. Define your teams in GitHub Organization settings
2. Map file patterns to teams
3. Use more specific patterns to override defaults
4. Test with sample PRs

---

## 🎯 Best Practices

### Running Workflows Locally

Before pushing, run checks locally to catch issues early:

```bash
# Markdown linting
npx markdownlint-cli2 "docs/**/*.md"

# Link checking
lychee docs/

# Vale prose linting
vale docs/

# TypeScript checks
npm run check:types

# Linting
npm run lint

# Tests
npm test
```text

### Workflow Triggers

- **Pull requests:** Fast feedback, checks only changed files
- **Push to main:** Comprehensive checks, all files
- **Scheduled:** Regular health checks, catch rot
- **Manual dispatch:** On-demand runs for testing

### Artifact Retention

- **Security reports:** 30-90 days
- **SBOM:** 90 days
- **Build artifacts:** 30 days
- **Test results:** 30 days

### Permissions

All workflows follow principle of least privilege:

- Read-only access by default
- Write access only when necessary
- Security-events write for SARIF uploads
- Contents write only for releases

---

## 🚨 Troubleshooting

### Workflow Failing?

1. **Check workflow logs:** Actions tab > Select workflow > View details
2. **Review error messages:** Look for specific failure reasons
3. **Check configuration files:** Ensure configs are valid
4. **Run locally:** Reproduce issue on your machine
5. **Check permissions:** Verify workflow has necessary permissions

### Common Issues

#### Vale/Markdownlint failures
- Install editor extensions for real-time feedback
- Run locally before pushing
- Review style guide documentation

### Link checker false positives
- Add to `.lycheeignore` if intentional
- Check if external site is down temporarily
- Verify link format is correct

### Trivy vulnerabilities
- Update dependencies to patched versions
- Check for available security advisories
- Consider alternative packages if no fix available

### SLSA provenance not generated
- Ensure release is published, not draft
- Check build artifacts were created
- Verify workflow has correct permissions

---

## 📊 Monitoring Workflow Health

### GitHub Actions Dashboard

View all workflow runs: **Actions tab**

Filter by:

- Workflow name
- Status (success, failure, cancelled)
- Branch
- Event type

### Security Tab

View security findings: **Security tab > Code scanning**

Includes:

- Trivy vulnerabilities
- CodeQL alerts
- OpenSSF Scorecard results
- Dependabot alerts

### Artifacts (2)

Download artifacts: **Actions tab > Workflow run > Artifacts**

Available artifacts:

- Security reports
- SBOM files
- Test results
- Link checker reports

---

## 🔄 Maintenance

### Updating Workflows

1. **Review action versions:** Check for updates in GitHub Marketplace
2. **Test in fork:** Test changes in your fork first
3. **Update in PR:** Make changes via pull request
4. **Monitor results:** Watch first few runs after update

### Deprecation Notices

Watch for deprecation warnings in workflow logs:

- Node.js version updates
- Action version changes
- API deprecations

### Scheduled Review

Quarterly review:

- Workflow effectiveness
- False positive rate
- Artifact retention needs
- Team ownership accuracy

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vale Documentation](https://vale.sh/)
- [Spectral Documentation](https://stoplight.io/open-source/spectral)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [SLSA Framework](https://slsa.dev/)
- [OpenSSF Scorecard](https://securityscorecards.dev/)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)

---

## 🤝 Contributing

Improvements to workflows are welcome! When contributing:

1. Test thoroughly in your fork
2. Document all changes
3. Update this guide
4. Follow existing patterns
5. Consider backwards compatibility

For questions or issues, open a GitHub issue with the `github-actions` label.
