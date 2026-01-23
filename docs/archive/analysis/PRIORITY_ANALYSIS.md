# DIAMONDREPO.md Task Analysis: Agent vs Human Execution

**Purpose:** Break down each checklist item to determine what can be executed by agents vs. what requires human judgment/approval.

**Related File:** `/.repo/policy/DIAMONDREPO.md`

**Legend:**
- 🤖 **AGENT**: Can be fully executed by agents
- 👤 **HUMAN**: Requires human judgment/approval/decision
- ✅ **AGENT-VERIFY**: Agent can verify/check compliance
- 🔧 **AGENT-ASSIST**: Agent can assist but human must approve
- 🔄 **AGENT-AUTOMATE**: Agent can create automation to enforce

---

## 0. Definitions & Protocols

* **The Checklist:** This file (`/.repo/policy/DIAMONDREPO.md`).
  - 🤖 **AGENT**: Can read/parse the file
  - ✅ **AGENT-VERIFY**: Can verify file exists and is properly formatted

* **"Done":** Marked as `[x]`.
  - ✅ **AGENT-VERIFY**: Can parse checkboxes and verify completion status
  - 👤 **HUMAN**: Must mark items as done (agent can suggest)

* **"N/A" (Not Applicable):** Marked as `[N/A]`.
  - 👤 **HUMAN**: Requires judgment to determine if item is truly N/A
  - ✅ **AGENT-VERIFY**: Can verify N/A marking exists and is valid

* **"Touched Code" (The Ratchet):** `git diff --name-only main...HEAD`
  - 🤖 **AGENT**: Can execute git command and identify touched files
  - ✅ **AGENT-VERIFY**: Can verify which files are in diff

* **"New Code":** Lines of code added or modified in the current PR.
  - 🤖 **AGENT**: Can calculate diff statistics
  - ✅ **AGENT-VERIFY**: Can verify new code metrics

* **"Break Glass" Protocol:**
  - 👤 **HUMAN**: Must decide when production-critical hotfix is needed
  - 🤖 **AGENT**: Can apply label and verify PR description has ticket link
  - ✅ **AGENT-VERIFY**: Can verify label exists and ticket link format

* **"Prod-Parity":** Environment definition
  - 👤 **HUMAN**: Must define what "prod-parity" means for their org
  - ✅ **AGENT-VERIFY**: Can verify environment matches definition

---

## 1. Repository Hygiene

### 1.1 Naming: Repo slug is `lowercase-kebab-case` and ≤ 35 chars
**Status:** ✅ **AGENT-VERIFY**
- **Subtasks:**
  - [ ] 🤖 Extract repo name from git remote URL
  - [ ] 🤖 Verify lowercase-kebab-case format (regex: `^[a-z0-9]+(?:-[a-z0-9]+)*$`)
  - [ ] 🤖 Count characters (excluding org prefix)
  - [ ] 🤖 Verify ≤ 35 chars
  - [ ] ✅ Report violations in CI

### 1.2 Branching: Default branch is `main`; linear history enforced
**Status:** ✅ **AGENT-VERIFY** + 👤 **HUMAN** (for initial setup)
- **Subtasks:**
  - [ ] ✅ Verify default branch is `main` (git command)
  - [ ] ✅ Verify repo settings enforce squash/rebase (API check)
  - [ ] ✅ Verify no merge commits in history (git log check)
  - [ ] 👤 Configure repo settings (one-time, human)

### 1.3 Large Assets: No binaries > 50 MB in git history
**Status:** ✅ **AGENT-VERIFY** + 🤖 **AGENT** (can fix)
- **Subtasks:**
  - [ ] 🤖 Scan git history for files > 50 MB (`git rev-list --objects --all | git cat-file --batch-check`)
  - [ ] 🤖 Identify binary files (file type detection)
  - [ ] 🤖 Suggest Git LFS migration for large files
  - [ ] ✅ Fail CI if large binaries found
  - [ ] 🔧 **AGENT-ASSIST**: Can create migration script

### 1.4 Standards: `.editorconfig` and `.gitignore` present
**Status:** 🤖 **AGENT** (can create) + ✅ **AGENT-VERIFY**
- **Subtasks:**
  - [ ] ✅ Verify `.editorconfig` exists
  - [ ] ✅ Verify `.editorconfig` has UTF-8, LF, EOF newline rules
  - [ ] ✅ Verify `.gitignore` exists
  - [ ] 🤖 Generate `.gitignore` from gitignore.io API if missing
  - [ ] 🤖 Create `.editorconfig` template if missing
  - [ ] ✅ Validate format compliance

### 1.5 Governance: `LICENSE`, `CODE_OF_CONDUCT.md`, `SECURITY.md` present
**Status:** 🤖 **AGENT** (can create templates) + 👤 **HUMAN** (must review content)
- **Subtasks:**
  - [ ] ✅ Verify `LICENSE` file exists
  - [ ] ✅ Verify SPDX format compliance
  - [ ] ✅ Verify `CODE_OF_CONDUCT.md` exists
  - [ ] ✅ Verify Contributor Covenant v2.1+ format
  - [ ] ✅ Verify `SECURITY.md` exists
  - [ ] ✅ Verify disclosure email/SLA present
  - [ ] 🤖 Generate templates if missing (from standard templates)
  - [ ] 👤 **HUMAN**: Must review and customize content (org-specific)

---

## 2. Local Development Experience (DevEx)

### 2.1 Bootstrap: One command installs all dependencies
**Status:** 🤖 **AGENT** (can create) + ✅ **AGENT-VERIFY**
- **Subtasks:**
  - [ ] ✅ Verify setup command exists (`make setup`, `npm run setup`, etc.)
  - [ ] ✅ Verify command installs all dependencies
  - [ ] ✅ Test command in clean environment
  - [ ] 🤖 Create setup script if missing
  - [ ] 🤖 Add environment requirement checks to script

### 2.2 Runtime: Versions pinned in config files matching CI
**Status:** ✅ **AGENT-VERIFY** + 🤖 **AGENT** (can sync)
- **Subtasks:**
  - [ ] ✅ Verify `.nvmrc`, `.python-version`, or `go.mod` exists
  - [ ] ✅ Extract version from config file
  - [ ] ✅ Extract version from CI config (`.github/workflows/*.yml`)
  - [ ] ✅ Compare versions and report mismatch
  - [ ] 🤖 Update config file to match CI if mismatch found

### 2.3 Arch Support: Docker/DevContainers support amd64 and arm64
**Status:** ✅ **AGENT-VERIFY** + 🔧 **AGENT-ASSIST**
- **Subtasks:**
  - [ ] ✅ Verify `docker-compose.yml` or `devcontainer.json` exists
  - [ ] ✅ Parse Dockerfile for multi-arch support
  - [ ] ✅ Check for `platform:` specifications
  - [ ] ✅ Verify `docker buildx` or equivalent configured
  - [ ] 🔧 **AGENT-ASSIST**: Can suggest multi-arch Dockerfile changes
  - [ ] 👤 **HUMAN**: Must test on both architectures

### 2.4 Feedback Loop: HMR < 1.5s; API restart < 3s
**Status:** ✅ **AGENT-VERIFY** (can measure) + 👤 **HUMAN** (must optimize)
- **Subtasks:**
  - [ ] ✅ Measure HMR time (instrument build tool)
  - [ ] ✅ Measure API restart time (instrument server)
  - [ ] ✅ Report if thresholds exceeded
  - [ ] 🔧 **AGENT-ASSIST**: Can suggest optimization strategies
  - [ ] 👤 **HUMAN**: Must implement optimizations

### 2.5 Pre-commit: Framework installed; execution < 5s
**Status:** 🤖 **AGENT** (can setup) + ✅ **AGENT-VERIFY**
- **Subtasks:**
  - [ ] ✅ Verify pre-commit framework installed (Husky, Pre-commit, etc.)
  - [ ] ✅ Measure hook execution time
  - [ ] ✅ Verify parallelization enabled
  - [ ] 🤖 Install framework if missing
  - [ ] 🤖 Configure hooks for parallel execution
  - [ ] ✅ Fail if execution > 5s

---

## 3. Code Quality & Craftsmanship

### 3.1 Inheritance: Linter/Formatter configs extend shared `@org/config`
**Status:** ✅ **AGENT-VERIFY** + 🤖 **AGENT** (can refactor)
- **Subtasks:**
  - [ ] ✅ Parse ESLint/Pylint/etc. config files
  - [ ] ✅ Verify `extends` field points to shared package
  - [ ] ✅ Detect local overrides
  - [ ] ✅ Verify ADR exists if overrides present
  - [ ] 🤖 Refactor config to extend shared package
  - [ ] 🤖 Create ADR template if override needed

### 3.2 Deterministic Formatting: Formatter runs on CI; zero diff
**Status:** 🤖 **AGENT** (can setup) + ✅ **AGENT-VERIFY**
- **Subtasks:**
  - [ ] ✅ Verify formatter configured (Prettier, Black, Gofmt, etc.)
  - [ ] ✅ Run formatter in CI
  - [ ] ✅ Check for diff after formatting
  - [ ] ✅ Fail CI if diff exists
  - [ ] 🤖 Add formatter to CI pipeline if missing
  - [ ] 🤖 Auto-format and commit if diff found (optional)

### 3.3 Typing: Strict mode enabled; zero implicit `any`
**Status:** ✅ **AGENT-VERIFY** + 🤖 **AGENT** (can fix)
- **Subtasks:**
  - [ ] ✅ Verify `tsconfig.json` has `strict: true`
  - [ ] ✅ Verify `mypy --strict` in Python configs
  - [ ] ✅ Scan for implicit `any` or `interface{}`
  - [ ] ✅ Report violations
  - [ ] 🤖 Fix type issues automatically where possible
  - [ ] 🔧 **AGENT-ASSIST**: Suggest fixes for complex cases

### 3.4 Complexity: Cyclomatic complexity ≤ 10 per function
**Status:** ✅ **AGENT-VERIFY** + 🔧 **AGENT-ASSIST**
- **Subtasks:**
  - [ ] ✅ Run complexity analyzer (ESLint, SonarQube, etc.)
  - [ ] ✅ Extract complexity scores per function
  - [ ] ✅ Report functions with complexity > 10
  - [ ] 🔧 **AGENT-ASSIST**: Suggest refactoring strategies
  - [ ] 👤 **HUMAN**: Must refactor complex functions

### 3.5 Debt: All `TODO`/`FIXME` comments include ticket ID
**Status:** ✅ **AGENT-VERIFY** + 🤖 **AGENT** (can fix format)
- **Subtasks:**
  - [ ] ✅ Scan codebase for `TODO`/`FIXME` comments
  - [ ] ✅ Verify ticket ID format (regex: `TODO\([A-Z]+-\d+\)`)
  - [ ] ✅ Report violations
  - [ ] 🤖 Suggest ticket ID format fixes
  - [ ] 👤 **HUMAN**: Must create tickets for missing IDs

---

## 4. Testing Strategy

### 4.1 Pyramid: Ratio of Unit+Integration to E2E tests ≥ 4:1
**Status:** ✅ **AGENT-VERIFY**
- **Subtasks:**
  - [ ] ✅ Count unit test files
  - [ ] ✅ Count integration test files
  - [ ] ✅ Count E2E test files
  - [ ] ✅ Calculate ratio: (unit + integration) / E2E
  - [ ] ✅ Report if ratio < 4:1
  - [ ] 🔧 **AGENT-ASSIST**: Suggest test distribution improvements

### 4.2 Performance: Unit suite < 30s; Integration suite < 3m
**Status:** ✅ **AGENT-VERIFY**
- **Subtasks:**
  - [ ] ✅ Measure unit test execution time
  - [ ] ✅ Measure integration test execution time
  - [ ] ✅ Report if thresholds exceeded
  - [ ] 🔧 **AGENT-ASSIST**: Identify slow tests
  - [ ] 👤 **HUMAN**: Must optimize slow tests

### 4.3 Coverage (Ratchet): Executable line coverage ≥ 90% on New Code
**Status:** ✅ **AGENT-VERIFY** + 🤖 **AGENT** (can generate reports)
- **Subtasks:**
  - [ ] 🤖 Identify "New Code" via `git diff main...HEAD`
  - [ ] 🤖 Run coverage tool with diff filter
  - [ ] ✅ Calculate executable line coverage (exclude comments/blanks/types)
  - [ ] ✅ Verify ≥ 90% threshold
  - [ ] ✅ Fail CI if threshold not met
  - [ ] 🤖 Generate coverage report

### 4.4 Mutation Score: ≥ 80% on New Code using Stryker/Pitest/Mutmut
**Status:** ✅ **AGENT-VERIFY** + 🤖 **AGENT** (can setup)
- **Subtasks:**
  - [ ] ✅ Verify mutation testing tool configured
  - [ ] 🤖 Run mutation testing on New Code
  - [ ] ✅ Calculate mutation score
  - [ ] ✅ Verify ≥ 80% threshold
  - [ ] ✅ Fail CI if threshold not met
  - [ ] 🤖 Setup mutation testing if missing

### 4.5 Isolation: No shared state; ephemeral containers
**Status:** ✅ **AGENT-VERIFY** + 🔧 **AGENT-ASSIST**
- **Subtasks:**
  - [ ] ✅ Scan test files for shared database connections
  - [ ] ✅ Verify Testcontainers or in-memory DBs used
  - [ ] ✅ Detect hardcoded database URLs
  - [ ] ✅ Report violations
  - [ ] 🔧 **AGENT-ASSIST**: Suggest Testcontainers migration
  - [ ] 👤 **HUMAN**: Must refactor tests to use ephemeral resources

---

## 5. CI/CD & Release Engineering

### 5.1 Speed: `push` to `artifact-ready` ≤ 8 mins
**Status:** ✅ **AGENT-VERIFY** + 🔧 **AGENT-ASSIST**
- **Subtasks:**
  - [ ] ✅ Measure CI pipeline execution time
  - [ ] ✅ Exclude queue time from measurement
  - [ ] ✅ Report if > 8 mins
  - [ ] 🔧 **AGENT-ASSIST**: Identify slow pipeline steps
  - [ ] 🔧 **AGENT-ASSIST**: Suggest parallelization opportunities
  - [ ] 👤 **HUMAN**: Must optimize pipeline

### 5.2 Supply Chain: SLSA Level 2 compliant
**Status:** ✅ **AGENT-VERIFY** + 🤖 **AGENT** (can setup)
- **Subtasks:**
  - [ ] ✅ Verify builds are scripted (not manual)
  - [ ] ✅ Verify builds are isolated (no external dependencies during build)
  - [ ] ✅ Verify provenance generation (SLSA Level 2 requirement)
  - [ ] ✅ Verify lockfiles committed
  - [ ] 🤖 Setup SLSA provenance generation if missing
  - [ ] 🤖 Generate SBOM (Software Bill of Materials)

### 5.3 Security: Dependency scanning blocks on High/Critical CVEs
**Status:** 🤖 **AGENT** (can setup) + ✅ **AGENT-VERIFY**
- **Subtasks:**
  - [ ] ✅ Verify dependency scanner configured (Snyk/Trivy)
  - [ ] ✅ Run scanner in CI
  - [ ] ✅ Parse CVE severity levels
  - [ ] ✅ Fail CI on High/Critical CVEs
  - [ ] 🤖 Setup scanner if missing
  - [ ] 🤖 Auto-create security tickets for CVEs

### 5.4 Versioning: Automated SemVer based on Conventional Commits
**Status:** 🤖 **AGENT** (can setup) + ✅ **AGENT-VERIFY**
- **Subtasks:**
  - [ ] ✅ Verify commit messages follow Conventional Commits format
  - [ ] ✅ Verify semantic-release or equivalent configured
  - [ ] ✅ Verify version bumping automated
  - [ ] ✅ Verify changelog generation automated
  - [ ] 🤖 Setup semantic-release if missing
  - [ ] 🤖 Validate commit message format in pre-commit

### 5.5 Rollout: Pipeline supports Canary or Blue/Green for production
**Status:** ✅ **AGENT-VERIFY** + 👤 **HUMAN** (must configure infrastructure)
- **Subtasks:**
  - [ ] ✅ Verify deployment pipeline exists
  - [ ] ✅ Check for Canary/Blue-Green configuration
  - [ ] ✅ Verify traffic splitting capability
  - [ ] ✅ Verify rollback mechanism
  - [ ] 🔧 **AGENT-ASSIST**: Suggest pipeline improvements
  - [ ] 👤 **HUMAN**: Must configure infrastructure (K8s, load balancers, etc.)

---

## 6. Documentation & Observability

### 6.1 README: Purpose, 1-command setup, Maintainer list
**Status:** ✅ **AGENT-VERIFY** + 🤖 **AGENT** (can generate template)
- **Subtasks:**
  - [ ] ✅ Verify README.md exists
  - [ ] ✅ Parse README for purpose statement
  - [ ] ✅ Verify setup command documented
  - [ ] ✅ Verify maintainer list present
  - [ ] 🤖 Generate README template if missing
  - [ ] 🔧 **AGENT-ASSIST**: Suggest improvements

### 6.2 ADRs: Significant decisions stored in `/docs/adr/`
**Status:** ✅ **AGENT-VERIFY** + 🤖 **AGENT** (can create)
- **Subtasks:**
  - [ ] ✅ Verify `/docs/adr/` directory exists
  - [ ] ✅ Verify ADR format (Status, Context, Decision, Consequences)
  - [ ] ✅ Check for ADRs when cross-feature changes made
  - [ ] 🤖 Create ADR template if missing
  - [ ] 🤖 Generate ADR from code changes (suggest)

### 6.3 API: OpenAPI/GraphQL specs auto-generated from code
**Status:** ✅ **AGENT-VERIFY** + 🤖 **AGENT** (can setup)
- **Subtasks:**
  - [ ] ✅ Verify API spec file exists
  - [ ] ✅ Verify spec is generated (not manually written)
  - [ ] ✅ Check for generation script in CI
  - [ ] ✅ Verify spec matches code
  - [ ] 🤖 Setup code-to-spec generation if missing
  - [ ] 🤖 Add spec validation to CI

### 6.4 Telemetry: RED metrics and structured JSON logging
**Status:** ✅ **AGENT-VERIFY** + 🤖 **AGENT** (can instrument)
- **Subtasks:**
  - [ ] ✅ Scan code for logging statements
  - [ ] ✅ Verify JSON structured logging (not console.log)
  - [ ] ✅ Verify RED metrics (Rate, Errors, Duration) instrumented
  - [ ] ✅ Check for metrics export (Prometheus, StatsD, etc.)
  - [ ] 🤖 Add instrumentation if missing
  - [ ] 🤖 Convert console.log to structured logging

### 6.5 Tracing: Distributed tracing with correlation IDs
**Status:** ✅ **AGENT-VERIFY** + 🤖 **AGENT** (can setup)
- **Subtasks:**
  - [ ] ✅ Verify OpenTelemetry or equivalent configured
  - [ ] ✅ Verify correlation IDs propagated (X-Request-ID, TraceParent)
  - [ ] ✅ Check service boundaries for trace context
  - [ ] 🤖 Setup OpenTelemetry if missing
  - [ ] 🤖 Add correlation ID middleware

---

## 7. Security, FinOps & Sustainability

### 7.1 Privilege: Containers run as non-root; read-only filesystem
**Status:** ✅ **AGENT-VERIFY** + 🤖 **AGENT** (can fix)
- **Subtasks:**
  - [ ] ✅ Parse Dockerfile for `USER` directive
  - [ ] ✅ Verify non-root user specified
  - [ ] ✅ Check for read-only filesystem (except `/tmp`)
  - [ ] ✅ Report violations
  - [ ] 🤖 Fix Dockerfile to use non-root user
  - [ ] 🤖 Add read-only filesystem configuration

### 7.2 Secrets: Automated scanning for secrets in diff
**Status:** 🤖 **AGENT** (can setup) + ✅ **AGENT-VERIFY**
- **Subtasks:**
  - [ ] ✅ Verify secret scanner configured (Gitleaks, TruffleHog, etc.)
  - [ ] ✅ Run scanner on git diff
  - [ ] ✅ Run scanner in pre-commit hooks
  - [ ] ✅ Run scanner in CI
  - [ ] ✅ Fail on secret detection
  - [ ] 🤖 Setup scanner if missing
  - [ ] 🤖 Configure pre-commit hooks

### 7.3 FinOps: IaC resources tagged with CostCenter, Env, Service
**Status:** ✅ **AGENT-VERIFY** + 🤖 **AGENT** (can fix)
- **Subtasks:**
  - [ ] ✅ Parse Terraform/CloudFormation/Pulumi files
  - [ ] ✅ Verify required tags present (CostCenter, Env, Service)
  - [ ] ✅ Run Checkov or OPA policy checks
  - [ ] ✅ Fail CI if tags missing
  - [ ] 🤖 Add missing tags automatically
  - [ ] 🤖 Setup policy-as-code enforcement

### 7.4 Bundle Budget: Total Entrypoint Size growth ≤ 2% without approval
**Status:** ✅ **AGENT-VERIFY** + 🔧 **AGENT-ASSIST**
- **Subtasks:**
  - [ ] ✅ Measure bundle size before PR
  - [ ] ✅ Measure bundle size after PR
  - [ ] ✅ Calculate percentage change
  - [ ] ✅ Verify approval if > 2% increase
  - [ ] ✅ Fail CI if threshold exceeded without approval
  - [ ] 🔧 **AGENT-ASSIST**: Identify large dependencies
  - [ ] 👤 **HUMAN**: Must approve > 2% increases

---

## Final Gate

### Final.1 Author Validation: I have verified all relevant items
**Status:** 👤 **HUMAN** (must do) + ✅ **AGENT-VERIFY** (can check)
- **Subtasks:**
  - [ ] 👤 Human marks checkbox
  - [ ] ✅ Agent can verify checkbox is checked
  - [ ] ✅ Agent can verify relevant items are checked (not all if N/A)

### Final.2 Peer Validation: Reviewer verified "Touched Code" items
**Status:** 👤 **HUMAN** (must do) + ✅ **AGENT-VERIFY** (can check)
- **Subtasks:**
  - [ ] 👤 Reviewer marks checkbox
  - [ ] ✅ Agent can verify checkbox is checked
  - [ ] ✅ Agent can verify reviewer is different from author

### Final.3 Hash: Merge commit includes CHECKLIST.md file hash
**Status:** 🤖 **AGENT** (can add) + ✅ **AGENT-VERIFY**
- **Subtasks:**
  - [ ] 🤖 Calculate file hash: `git hash-object CHECKLIST.md`
  - [ ] 🤖 Add hash to commit message footer: `CHECKLIST_SHA: <hash>`
  - [ ] ✅ Verify hash in commit message
  - [ ] ✅ Verify hash matches file content

---

## Implementation Guide Tasks

### IG.1 Option A: Checkbox Parser
**Status:** 🤖 **AGENT** (can create)
- **Subtasks:**
  - [ ] 🤖 Create GitHub Action / GitLab CI job
  - [ ] 🤖 Implement grep logic for unchecked items
  - [ ] 🤖 Handle `[N/A]` items correctly
  - [ ] 🤖 Fail CI on unchecked items
  - [ ] 🤖 Add to CI pipeline

### IG.2 Option B: Ratchet Coverage
**Status:** 🤖 **AGENT** (can setup)
- **Subtasks:**
  - [ ] 🤖 Install coverage-diff tool
  - [ ] 🤖 Configure to run on PR diff only
  - [ ] 🤖 Set 90% threshold
  - [ ] 🤖 Add to CI pipeline
  - [ ] 🤖 Generate coverage reports

### IG.3 Option C: FinOps Policy
**Status:** 🤖 **AGENT** (can setup)
- **Subtasks:**
  - [ ] 🤖 Install Checkov or Terraform Compliance
  - [ ] 🤖 Configure tag requirements
  - [ ] 🤖 Add to CI pipeline
  - [ ] 🤖 Fail on policy violations

---

## Summary Statistics

- **Total Items:** 34 main checklist items + 3 implementation guide items = 37 items
- **Fully Agent Executable:** ~60% (22 items)
- **Agent Verifiable:** ~85% (31 items)
- **Requires Human Judgment:** ~40% (15 items)
- **Agent Can Assist:** ~70% (26 items)

**Key Insights:**
1. Most verification tasks can be automated by agents
2. Human judgment needed for: approvals, content review, infrastructure setup, optimization decisions
3. Agents excel at: verification, setup automation, code generation, reporting
4. Hybrid approach works best: agents verify/assist, humans approve/decide
