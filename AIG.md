# AIOS Governance & AI Index (AIG)

This index catalogs governance, actions/automation, and AI behavior/controls documentation in the AIOS repository. It is organized by category so you can quickly find the policies, controls, and behavioral guidance that shape how the system and contributors operate.

## AI Controls & Behavior

- **docs/ai/README.md** — Overview of approved and prohibited AI uses with links to deeper AI policy documents and quick rules for safe AI usage.
- **docs/ai/ai_contribution_policy.md** — Unified AGENT ownership model and AI usage expectations, including when to seek human review.
- **docs/ai/evidence_requirements.md** — Required evidence (tests, lint, manual verification) for AI-generated contributions.
- **docs/ai/safe_editing_rules.md** — Guardrails for safe AI-assisted edits, including small-change discipline and test-first workflow.
- **docs/ai/prompting_playbook.md** — Guidance on prompting AI effectively with examples for tests, refactors, and documentation.
- **.github/copilot-instructions.md** — Auto-generated runtime instructions for GitHub Copilot aligned to the constitution (behavioral rules and constraints).
- **docs/security/agent-threat-model.md** — Threat model for AI agents (prompt injection, secret exfiltration, etc.) with mitigations and detection tips.
- **docs/ux.md** — UX flows describing AI-driven behaviors (recommendations, attention management, workflow suggestions) in the product experience.
- **README.md** — Product-level description of AIOS’s AI-powered modules and behaviors, including AI recommendations and assist features.

## Governance & Decision Framework

- **GOVERNANCE.md** — Core governance model, decision-making process, review checklists, release process, and succession planning.
- **docs/governance/constitution.md** — Highest-authority governance source of truth; contains immutable rules, AI agent laws, and enforcement requirements.
- **docs/governance/state.md** — Living document for temporary constraints, enforcement toggles, and active governance migrations.
- **docs/governance/exceptions.yml** — Structured exception/waiver registry with expiry requirements for policy deviations.
- **docs/governance_implementation_report.md** — Audit-style report of governance control-plane artifacts implemented, including enforcement mechanisms.
- **ARCHITECTURE_DECISIONS.md** — Root-level ADRs that document accepted architectural decisions and rationale.
- **docs/decisions/README.md** — Index and guidance for Architecture Decision Records (ADRs) in `docs/decisions/`.
- **docs/decisions/0001-record-architecture-decisions.md** — ADR establishing ADR usage (meta-governance for decisions).
- **docs/decisions/004-docs-structure.md** — ADR defining documentation structure (governance for doc organization).
- **docs/decisions/006-docs-automation.md** — ADR on documentation automation and quality enforcement.
- **docs/decisions/007-governance-ci-enforcement.md** — ADR on governance CI enforcement and quality gates.

## Contribution & Review Controls

- **CONTRIBUTING.md** — Contributor workflows, coding standards, and the unified AGENT ownership model for AIOS development.
- **CODE_OF_CONDUCT.md** — Behavioral standards and enforcement expectations for community interactions.
- **.github/pull_request_template.md** — PR checklist ensuring documentation, testing, and security considerations are captured.
- **.github/ISSUE_TEMPLATE/** — Structured issue templates that standardize change requests and reporting.
- **.github/CODEOWNERS** — Review ownership map that enforces approvals on sensitive areas (governance, security, workflows).
- **.github/CODEOWNERS.example** — Sample ownership template showing intended review patterns.
- **.github/BRANCH_PROTECTION_SETUP.md** — Required branch protection settings to enforce governance and documentation checks.
- **.github/instructions/client.instructions.md** — Client-specific AI assistant rules: testing, typing, accessibility, and dependency constraints.
- **.github/instructions/server.instructions.md** — Server-side AI assistant rules: API contract discipline, validation, migrations, observability.
- **.github/instructions/docs.instructions.md** — Documentation rules (Diátaxis, structure, link discipline) for AI-assisted doc changes.

## Automation & Actions (CI/CD, GitHub Actions)

- **.github/WORKFLOWS_SUMMARY.md** — High-level summary of GitHub Actions workflows and their purpose.
- **.github/workflows/ci.yml** — Core CI pipeline (lint, typecheck, tests, build) enforcing quality gates.
- **.github/workflows/codeql.yml** — Static analysis security scanning with CodeQL.
- **.github/workflows/trivy.yml** — Dependency and configuration vulnerability scanning.
- **.github/workflows/sbom.yml** — Software Bill of Materials generation for supply-chain transparency.
- **.github/workflows/ossf-scorecard.yml** — Security posture scoring against OpenSSF best practices.
- **.github/workflows/slsa-provenance.yml** — Build provenance generation for supply-chain integrity.
- **.github/workflows/docs-quality.yml** — Documentation quality checks (spelling, linting, quality gates).
- **.github/workflows/docs-markdownlint.yml** — Markdown style enforcement.
- **.github/workflows/docs-links.yml** — Link validation to prevent documentation rot.
- **.github/workflows/docs-vale.yml** — Prose linting for documentation quality.
- **.github/workflows/api-spectral.yml** — OpenAPI spec linting to enforce API contract quality.
- **.github/workflows/constitution-sync.yml** — Ensures Copilot instructions match the constitution (governance enforcement).
- **.github/workflows/exceptions-expiry.yml** — Enforces expiry of governance exceptions/waivers.
- **.github/workflows/traceability-check.yml** — Validates traceability matrix completeness (warn/fail based on state).
- **.github/workflows/documentation-metrics.yml** — Generates documentation metrics for governance reporting.
- **.github/workflows/documentation-stale.yml** — Flags stale docs to prevent governance drift.
- **.github/workflows/documentation-issue-automation.yml** — Automates issue creation and tracking for documentation governance.
- **.github/workflows/agent-platform-check.yml** — Enforcement workflow for AGENT ownership consistency in TODO assignments.
- **docs/github-actions-guide.md** — Detailed documentation for workflow usage and troubleshooting.
- **.github/dependabot.yml** — Automated dependency update policy and scheduling.

## Security & Compliance Controls

- **SECURITY.md** — Public security policy with disclosure process and agentic security guidance.
- **docs/security/SECURITY.md** — Consolidated security documentation with module security status and practices.
- **docs/security.md** — Security architecture overview, threat model, and mitigation strategy for the system.
- **docs/security/agent-threat-model.md** — AI/agent-specific threat model and defensive guidance.
- **docs/security/threat_model.md** — Broader system threat modeling and risk analysis.
- **docs/security/dependency_policy.md** — Policy for dependency selection, review, and security vetting.
- **docs/security/supply_chain.md** — Supply-chain security practices and provenance expectations.
- **docs/security/secrets_handling.md** — Rules for secret management and safe handling.
- **.spectral.yml** — API linting rules that enforce secure/consistent OpenAPI definitions.

## Documentation Governance & Quality

- **DOCUMENTATION_GUIDE.md** — Navigation and maintenance guide for the documentation system.
- **DOCUMENTATION_BEST_PRACTICES.md** — Standards and conventions for writing and maintaining docs.
- **DOCUMENTATION_QUALITY_CONTROL.md** — Processes and checks for documentation quality assurance, including link validation and checklists.
- **DOCUMENTATION_METRICS.md** — Metrics used to track documentation health and coverage.
- **docs/README.md** — Documentation home and navigation hub, including governance linkouts.
- **docs/INDEX.md** — Documentation index for structured discovery across doc sets.
- **docs/STYLE_GUIDE.md** — Style rules and conventions for doc writing.
- **docs/traceability_matrix.md** — Governance control tying features to code/tests/docs/ops artifacts.
- **.vale.ini** / **.vale/** — Prose linting configuration and style packs for documentation governance.
- **.markdownlint.json** — Markdown style rules enforced in documentation workflows.

## Operational Actions & Runbooks

- **docs/operations/README.md** — Operations overview and links to runbooks, on-call, and observability guides.
- **docs/operations/runbooks/README.md** — Runbook index covering common operational procedures.
- **docs/operations/runbooks/common_incidents.md** — Step-by-step responses for frequent incidents.
- **docs/operations/runbooks/runbook_template.md** — Standard template for creating new operational runbooks.
- **docs/operations/oncall/escalation.md** — Escalation procedures for incident response.
- **docs/operations/oncall/postmortem_template.md** — Template for documenting incidents and corrective actions.
- **docs/operations/observability/logging.md** — Logging strategy and expectations.
- **docs/operations/observability/metrics.md** — Metrics strategy and what to monitor.
- **docs/operations/observability/tracing.md** — Tracing strategy for distributed diagnostics.
- **docs/operations/server-logging.md** — Server logging practices and operational guidance.

## Action Tracking & Planning Artifacts

- **P0TODO.md, P1TODO.md, P2TODO.md, P3TODO.md** — Single source of truth for actionable work and ownership assignments.
- **CHANGELOG.md** — Record of changes with highlights of major actions and feature updates.
- **WORK_SESSION_SUMMARY.md** — Session-level actions, workflow outcomes, and follow-ups.
- **TASK_COMPLETION_REPORT.md** — Summary of completed tasks and verification notes.
- **TASK_COMPLETION_SESSION_3.md** — Session-specific task completion log and actions taken.
- **SESSION_3_FINAL_SUMMARY.md** — Finalized actions and outcomes for session 3.
- **SESSION_COMPLETION_REPORT_2026-01-19.md** — Session completion report with action outcomes.
