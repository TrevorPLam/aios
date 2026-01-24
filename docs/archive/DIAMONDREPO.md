# The Diamond-Prime Repository Checklist (v3.1)

**File Path:** `/.repo/policy/DIAMONDREPO.md` (also referenced as `CHECKLIST.md`)

**Status:** Canonical / Ready for Deployment

**Version:** 3.1.0  
**Enforcement:** CI Pipeline (Blocking)

**Legend:**
- 🤖 **AGENT**: Can be fully executed by agents
- 👤 **HUMAN**: Requires human judgment/approval/decision
- ✅ **AGENT-VERIFY**: Agent can verify/check compliance
- 🔧 **AGENT-ASSIST**: Agent can assist but human must approve
- 🔄 **AGENT-AUTOMATE**: Agent can create automation to enforce

**Note:** See `PRIORITY_ANALYSIS.md` for detailed subtask breakdowns.

---

## 0. Definitions & Protocols

* **The Checklist:** This file (`/.repo/policy/DIAMONDREPO.md`).
* **"Done":** Marked as `[x]`.
* **"N/A" (Not Applicable):** Marked as `[N/A]`. Use only if the tech stack lacks the capability (e.g., a CLI tool has no "Bundle Size").
* **"Touched Code" (The Ratchet):** Any file identified via `git diff --name-only main...HEAD`. Only these files must meet strict quality/coverage thresholds.
* **"New Code":** Lines of code added or modified in the current PR.
* **"Break Glass" Protocol:**
  * Apply the `override-checklist` label in GitHub/GitLab.
  * The PR description **must** contain a link to a "Clean Up" ticket (e.g., `[DEBT-123](url)`) with a < 7-day SLA.
* **"Prod-Parity":** An environment using the same Infrastructure-as-Code (IaC) as production, with sanitized/anonymized data and equivalent security headers.

---

## 1. Repository Hygiene

* [ ] ✅ **Naming:** Repo slug is `lowercase-kebab-case` and ≤ 35 chars (excluding org prefix).
* [ ] ✅ **Branching:** Default branch is `main`; linear history (squash/rebase) enforced. *(👤 Human: Initial repo setup)*
* [ ] ✅ **Large Assets:** No binaries > 50 MB in git history (use Git LFS). *(🤖 Agent: Can scan & suggest fixes)*
* [ ] 🤖 **Standards:** `.editorconfig` (UTF-8, LF, EOF newline) and `.gitignore` (via gitignore.io) are present.
* [ ] 🤖 **Governance:** `LICENSE` (SPDX), `CODE_OF_CONDUCT.md`, and `SECURITY.md` (with disclosure SLA) are present. *(👤 Human: Must review content)*

## 2. Local Development Experience (DevEx)

* [ ] 🤖 **Bootstrap:** One command (`make setup` or equivalent) installs all dependencies.
* [ ] ✅ **Runtime:** Versions pinned in `.nvmrc`, `.python-version`, or `go.mod` match CI runners. *(🤖 Agent: Can sync versions)*
* [ ] ✅ **Arch Support:** `docker-compose` or DevContainers support `amd64` and `arm64` (Apple Silicon) natively. *(🔧 Agent-Assist: Can suggest changes)*
* [ ] ✅ **Feedback Loop:** Incremental Hot Module Reload (HMR) < 1.5s; API incremental restart < 3s. *(👤 Human: Must optimize if slow)*
* [ ] 🤖 **Pre-commit:** Framework (e.g., Husky, Pre-commit) installed; total execution < 5s on a standard dev machine (e.g., 16GB RAM / 8-core CPU).

## 3. Code Quality & Craftsmanship

* [ ] ✅ **Inheritance:** Linter/Formatter configs extend a shared `@org/config` with zero local overrides without an **ADR (Architecture Decision Record)**. *(🤖 Agent: Can refactor configs)*
* [ ] 🤖 **Deterministic Formatting:** Formatter (Prettier, Black, Gofmt, etc.) runs on CI; zero diff allowed.
* [ ] ✅ **Typing:** Strict mode enabled (e.g., TS `strict: true`); zero implicit `any` or `interface{}` without a documented exception. *(🤖 Agent: Can fix type issues)*
* [ ] ✅ **Complexity:** Cyclomatic complexity ≤ 10 per function (enforced via linter). *(🔧 Agent-Assist: Can suggest refactoring)*
* [ ] ✅ **Debt:** All `TODO`/`FIXME` comments include a ticket ID: `// TODO(PROJ-123)`. *(👤 Human: Must create tickets)*

## 4. Testing Strategy

* [ ] ✅ **Pyramid:** Ratio of Unit+Integration to E2E tests is ≥ 4:1.
* [ ] ✅ **Performance:** Unit suite < 30s; Integration suite < 3m. *(👤 Human: Must optimize slow tests)*
* [ ] ✅ **Coverage (Ratchet):** Executable line coverage on **New Code** (lines in the diff, excluding comments, blank lines, and type-only declarations) is ≥ 90%. *(🤖 Agent: Can generate reports)*
* [ ] ✅ **Mutation Score:** Score ≥ 80% on **New Code** using tools like **Stryker, Pitest, or Mutmut**. *(🤖 Agent: Can setup & run)*
* [ ] ✅ **Isolation:** No shared state; databases use ephemeral containers (e.g., Testcontainers). *(🔧 Agent-Assist: Can suggest migration)*

## 5. CI/CD & Release Engineering

* [ ] ✅ **Speed:** `push` to `artifact-ready` ≤ 8 mins (execution time). *(👤 Human: Must optimize pipeline)*
* [ ] ✅ **Supply Chain:** **SLSA (Supply-chain Levels for Software Artifacts) Level 2** compliant. Builds are scripted and isolated. *(🤖 Agent: Can setup provenance)*
* [ ] 🤖 **Security:** Dependency scanning (Snyk/Trivy) blocks on High/Critical CVEs.
* [ ] 🤖 **Versioning:** Automated SemVer based on **Conventional Commits** (see https://www.conventionalcommits.org/).
* [ ] ✅ **Rollout:** Pipeline supports Canary or Blue/Green for all production-level services. *(👤 Human: Must configure infrastructure)*

## 6. Documentation & Observability

* [ ] ✅ **README:** Purpose, 1-command setup, and Maintainer list present. *(🤖 Agent: Can generate template)*
* [ ] ✅ **ADRs:** Significant decisions stored in `/docs/adr/` with date and status. *(🤖 Agent: Can create from code changes)*
* [ ] ✅ **API:** OpenAPI/GraphQL specs auto-generated from code (not manual). *(🤖 Agent: Can setup generation)*
* [ ] ✅ **Telemetry:** **RED (Rate, Errors, Duration)** metrics and structured JSON logging enabled. *(🤖 Agent: Can instrument code)*
* [ ] ✅ **Tracing:** Distributed tracing (OpenTelemetry) with correlation IDs across service boundaries. *(🤖 Agent: Can setup)*

## 7. Security, FinOps & Sustainability

* [ ] ✅ **Privilege:** Containers run as non-root; filesystem is read-only except `/tmp`. *(🤖 Agent: Can fix Dockerfile)*
* [ ] 🤖 **Secrets:** Automated pre-commit and CI scanning (e.g., Gitleaks) for secrets in the diff.
* [ ] ✅ **FinOps:** IaC resources tagged with `CostCenter`, `Env`, and `Service` (enforced via policy-as-code like Checkov or OPA as a blocking CI gate). *(🤖 Agent: Can add tags)*
* [ ] ✅ **Bundle Budget:** Frontend PRs fail if **Total Entrypoint Size** (sum of all entrypoints) grows > 2% without approval. *(👤 Human: Must approve > 2% increases)*

---

## Final Gate

* [ ] 👤 **Author Validation:** I have verified all relevant items. *(✅ Agent: Can verify checkbox)*
* [ ] 👤 **Peer Validation:** Reviewer has verified "Touched Code" items. *(✅ Agent: Can verify checkbox & reviewer)*
* [ ] 🤖 **Hash:** Merge commit includes the `DIAMONDREPO.md` file hash (e.g., `DIAMONDREPO_SHA: $(git hash-object .repo/policy/DIAMONDREPO.md)`) in the commit message footer to ensure version alignment.

---

### Implementation Guide for DevOps/SREs

#### How to Automate Enforcement

You can automate the "blocking" nature of this checklist using a GitHub Action or GitLab CI job.

**Option A: The "Checkbox Parser" (GitHub Script)**
Create a job that reads the PR description or the `DIAMONDREPO.md` file in the branch.

```bash
# Example logic for a CI runner
# Check for unchecked items (excluding N/A)
unchecked=$(grep -c "\[ \]" .repo/policy/DIAMONDREPO.md || true)
if [ "$unchecked" -gt 0 ]; then
  # Check if there are any N/A items to see if we should allow partial completion
  na_count=$(grep -c "\[N/A\]" .repo/policy/DIAMONDREPO.md || true)
  echo "Error: $unchecked unchecked items found in DIAMONDREPO.md (N/A items: $na_count)"
  exit 1
fi
```

**Option B: The "Ratchet" Coverage**
Use a tool like `diff-quality` (Python), `coverage-diff` (JavaScript), or `jest --coverage --changedSince` to ensure that only the lines changed in the current PR meet the 90% threshold, rather than demanding 90% for a 10-year-old monolith.

**Option C: FinOps Policy**
Use **Checkov** or **Terraform Compliance** to verify that the tags (`CostCenter`, `Env`) exist in the code before the plan is even allowed to execute.

---

### Implementation Strategy: The "Ratchet" Method

To adopt this checklist without halting development, use the **Ratchet Strategy**:

1. **Phase 1 (The Floor):** Enforce only **Critical** items (Security, CI/CD, Hygiene) immediately.
2. **Phase 2 (The Ratchet):** For Code Quality and Testing, configure your tooling to only fail on **New Code**.
   * *SonarQube/CodeClimate:* Set "Quality Gate" to "New Code".
   * *Jest/Pytest:* Use `--changedSince` or similar flags.
   * *Linting:* Use `git diff --name-only main...HEAD | xargs eslint`.
3. **Phase 3 (The Squeeze):** Every quarter, dedicate a "Fix-It" sprint to backfill compliance on one specific section (e.g., "This sprint we fix all PII logging issues").

---

**End of Checklist**
