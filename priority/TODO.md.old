# Priority Tasks - Textbook Codebase Standard v2.2 Implementation

This document contains the task list for implementing the complete Textbook Codebase Standard v2.2 (Solo Founder) — Agent-Ready Handoff across all 9 phases.

## PHASE 1: Master Handoff Skeleton + Locked Decisions

- [ ] Review and confirm locked decisions in phase1.md
- [ ] Set up execution order for implementing phases 2-9
- [ ] Establish authority chain: Manifest > Agents > Policy > Standards > Product
- [ ] Implement selected principles (P3-P25) throughout the codebase

## PHASE 2: Policy Corpus (Authoritative Rules)

### Create `/.repo/policy/` directory and files

- [ ] Create `/.repo/policy/CONSTITUTION.md` - Immutable foundational rules
  - [ ] Article 1: Final Authority (solo founder)
  - [ ] Article 2: Verifiable over Persuasive
  - [ ] Article 3: No Guessing (UNKNOWN handling)
  - [ ] Article 4: Incremental Delivery
  - [ ] Article 5: Strict Traceability
  - [ ] Article 6: Safety Before Speed
  - [ ] Article 7: Per-Repo Variation Allowed
  - [ ] Article 8: HITL for External Systems

- [ ] Create `/.repo/policy/PRINCIPLES.md` - Operating principles
  - [ ] Document global filepath requirement
  - [ ] Document P3-P25 principles in plain English
  - [ ] Include evidence-based workflow requirements

- [ ] Create `/.repo/policy/QUALITY_GATES.md` - Merge rules
  - [ ] Define merge policy (soft block with auto-generated waivers)
  - [ ] Define hard gates (non-waiverable)
  - [ ] Define waiverable gates (coverage, performance, warnings)
  - [ ] Document coverage strategy (gradual ratchet)
  - [ ] Document performance budgets (strict with fallback)
  - [ ] Document zero warnings policy

- [ ] Create `/.repo/policy/SECURITY_BASELINE.md` - Security rules
  - [ ] Define absolute prohibitions (no secrets in commits/logs)
  - [ ] Define dependency vulnerability handling (always HITL)
  - [ ] Define security check frequency (every PR)
  - [ ] Document security review triggers (IDs: 1,2,4,5,6,8,9,10)
  - [ ] Document forbidden patterns (A-H placeholders)
  - [ ] Document mandatory HITL actions (IDs: 1-8)

- [ ] Create `/.repo/policy/BOUNDARIES.md` - Module boundaries
  - [ ] Document boundary model (hybrid_domain_feature_layer)
  - [ ] Document directory pattern: src/<domain>/<feature>/<layer>/
  - [ ] Document allowed import direction (ui → domain → data → platform)
  - [ ] Document cross-feature rule (ADR required)
  - [ ] Document enforcement method (hybrid checker + manifest)
  - [ ] Document violation severity and handling

- [ ] Create `/.repo/policy/HITL.md` - Human-In-The-Loop rules
  - [ ] Set up HITL storage model (index + items directory)
  - [ ] Document HITL categories and statuses
  - [ ] Document merge blocking rules
  - [ ] Document external systems detection
  - [ ] Create HITL item file format specification
  - [ ] Set up Active and Archived index tables

## PHASE 3: Manifest + Command Resolution Standard

- [ ] Create `/.repo/repo.manifest.yaml` - Source of truth for executable commands
  - [ ] Define repo metadata (ships, ship_kind, release_protects)
  - [ ] Define prerequisites (package_manager, runtime, platform tools)
  - [ ] Fill canonical commands (install, check:quick, check:ci, check:release, check:governance, check:boundaries, check:security)
  - [ ] Define verify profiles (quick, ci, release, governance)
  - [ ] Define test requirements (unit+integration)
  - [ ] Define budget settings (mode, enforcement, fallback)
  - [ ] Define security settings (every_pr, dependency handling)
  - [ ] Define boundary enforcement settings and edges

- [ ] Create `/.repo/docs/standards/manifest.md` - Command resolution guide
  - [ ] Document what the manifest is (instruction card)
  - [ ] Document non-negotiable rule (no guessing, use UNKNOWN)
  - [ ] Document command resolution process (5-step process)
  - [ ] Document what each command must accomplish
  - [ ] Document placeholder handling (FILL_FROM_REPO, UNKNOWN)
  - [ ] Document merge blocking conditions
  - [ ] Document minimal acceptance checks

## PHASE 4: Agents Framework + Folder-Level Guides

### Create `/.repo/agents/` directory structure

- [ ] Create `/.repo/agents/AGENTS.md` - Core agent rules
  - [ ] Document no guessing rule
  - [ ] Document filepath requirement
  - [ ] Document three-pass code generation (Plan, Change, Verify)
  - [ ] Document log and trace requirements
  - [ ] Document boundary enforcement

- [ ] Create `/.repo/agents/capabilities.md` - Agent capability list
  - [ ] List all agent capabilities (create_feature, modify_existing, add_dependency, etc.)

- [ ] Create `/.repo/agents/roles/` directory with role definitions
  - [ ] Create `primary.md` - Full capabilities except waivers and release
  - [ ] Create `secondary.md` - Modify/refactor within boundaries only
  - [ ] Create `reviewer.md` - Human controls waivers + enforcement
  - [ ] Create `release.md` - Human controls release process and deploy

### Create folder-level AGENT.md guides

- [ ] Create `/.repo/AGENT.md` - Root folder guide
- [ ] Create `/src/AGENT.md` - Source folder guide
- [ ] Create `/src/platform/AGENT.md` - Platform folder guide
- [ ] Create `/tests/AGENT.md` - Tests folder guide
- [ ] Create `/docs/AGENT.md` - Docs folder guide
- [ ] Create `/scripts/AGENT.md` - Scripts folder guide

## PHASE 5: PR Operating System

### Create `/.repo/agents/prompts/` directory

- [ ] Create `task_packet.md` - Task packet template
  - [ ] Include goal, non_goals, acceptance_criteria
  - [ ] Include approach, files_touched, verification_plan
  - [ ] Include risks, rollback_plan, hitl_requirements

- [ ] Create `pr_template.md` - PR template
  - [ ] Include change_type, summary, task_packet
  - [ ] Include filepath_changes, verification_commands_run
  - [ ] Include evidence, risks, rollback, hitl

### Create `/.repo/agents/checklists/` directory

- [ ] Create `change-plan.md` - Change planning checklist
- [ ] Create `pr-review.md` - PR review checklist
- [ ] Create `incident.md` - Incident response checklist

### Create `/.repo/templates/` directory

- [ ] Create `PR_TEMPLATE.md` - Formal PR template

## PHASE 6: Logging + Trace + Waiver + ADR Templates

### Create templates in `/.repo/templates/` directory

- [ ] Create `AGENT_LOG_TEMPLATE.md` - Agent log structure
  - [ ] Include intent, plan, actions, evidence
  - [ ] Include decisions, risks, follow_ups, reasoning_summary

- [ ] Create `AGENT_TRACE_SCHEMA.json` - Trace validation schema
  - [ ] Define required fields (intent, files, commands, evidence, hitl, unknowns)
  - [ ] Define JSON schema structure for validation

- [ ] Create `WAIVER_TEMPLATE.md` - Waiver structure
  - [ ] Include waives, why, scope, owner
  - [ ] Include expiration, remediation_plan, link

- [ ] Create `ADR_TEMPLATE.md` - Architecture Decision Record template
  - [ ] Include context, decision_drivers, options
  - [ ] Include decision, consequences, modules, commands
  - [ ] Include migration, boundary_impact, hitl

- [ ] Create `RUNBOOK_TEMPLATE.md` - Runbook template
  - [ ] Include title, summary, steps
  - [ ] Include rollback, verification

- [ ] Create `RFC_TEMPLATE.md` - Request for Comments template
  - [ ] Include title, problem, proposed_solution
  - [ ] Include alternatives, impact, risks

## PHASE 7: Automation Stubs

### Create `/.repo/automation/` directory structure

- [ ] Create `/.repo/automation/ci/governance-verify.yml` - CI job template
  - [ ] Template for calling manifest-defined commands
  - [ ] Include install and governance verify steps

- [ ] Create `/.repo/automation/scripts/` directory
  - [ ] Create `governance-verify.js` - Main governance verification script
  - [ ] Create `validate-agent-trace.js` - Trace log validation script

## PHASE 8: Docs Glue (Indexes + Standards + ADR Scaffold)

### Create `/.repo/docs/` directory structure

- [ ] Create `/.repo/docs/DOCS_INDEX.md` - Central documentation index
  - [ ] Link to Start Here documents (governance, policy files)
  - [ ] Link to Standards documents
  - [ ] Link to ADR History

### Create `/.repo/docs/standards/` directory

- [ ] Create `documentation.md` - Documentation standards
  - [ ] Docs must update when code updates
  - [ ] Filepath requirements
  - [ ] Examples are contracts

- [ ] Create `adr.md` - ADR standards
  - [ ] Define when ADR is required
  - [ ] Reference ADR template

- [ ] Create `api.md` - API standards
  - [ ] Document API shape, input, output requirements
  - [ ] Define api-contract change type

- [ ] Create `style.md` - Code style standards
  - [ ] Clear naming requirements
  - [ ] No duplication
  - [ ] Single responsibility functions
  - [ ] Comment purpose (WHY not WHAT)

### Create `/.repo/docs/adr/` directory

- [ ] Create `README.md` - ADR directory index
- [ ] Create `0001-example.md` - Example ADR

## PHASE 9: Root Scaffolds

### Update/Create root-level files

- [ ] Update `/README.md` - Link to /.repo/DOCS_INDEX.md
- [ ] Update `/SECURITY.md` - Link to /.repo/policy/SECURITY_BASELINE.md
- [ ] Update or create `/CODEOWNERS` - Set owner
- [ ] Verify `/LICENSE` exists
- [ ] Verify priority TODO files exist (P0TODO.md, P1TODO.md, P2TODO.md)
- [ ] Verify `/COMPLETEDTODO.md` exists
- [ ] Create `/.repo/archive/todo/README.md` - Archive directory for TODO snapshots

## Integration and Verification Tasks

- [ ] Verify all `<FILL_FROM_REPO>` placeholders are resolved or documented as UNKNOWN
- [ ] Run governance-verify to ensure all required artifacts are present
- [ ] Test command resolution from manifest
- [ ] Verify boundary enforcement works
- [ ] Verify HITL workflow is functional
- [ ] Verify all templates are complete and valid
- [ ] Create initial waivers for any pre-existing violations
- [ ] Document any UNKNOWN items that require human input
- [ ] Archive this TODO list upon completion

## Notes

- **No guessing**: If information cannot be determined from repo contents, mark as UNKNOWN and create HITL item
- **Filepaths required**: All tasks, PRs, logs, and documentation must include explicit file paths
- **Evidence over vibes**: All completed tasks must include verification evidence
- **Incremental delivery**: Break down large tasks into smaller, reviewable increments
- **Safety first**: For risky changes involving login, money, security, or production: STOP → ASK → VERIFY → PROCEED
