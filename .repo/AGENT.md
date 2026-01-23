# AGENT.md (Folder-Level Guide)

## Purpose of this folder

This `.repo/` folder contains the governance framework for the repository. It includes:
- Policy files (CONSTITUTION.md, PRINCIPLES.md, QUALITY_GATES.md, etc.)
- Agent framework definitions (agents/ directory)
- Command manifest (repo.manifest.yaml)
- Templates for logs and traces
- Documentation standards

This is the authoritative source for all governance rules and agent operating procedures.

## What agents may do here

- **Read** all policy files and documentation
- **Reference** policy files in PRs, ADRs, and documentation
- **Create HITL items** when policy questions arise
- **Update** repository-specific content (HITL items, waivers, manifest commands)
- **Follow** the policies defined here in all work

## What agents may NOT do

- **Modify policy files** without proper process:
  - CONSTITUTION.md requires explicit founder approval (Article 1)
  - Other policy files may be updated but must follow Layer rules
- **Guess** at policy interpretation - use UNKNOWN + HITL
- **Bypass** HITL requirements for risky changes
- **Ignore** boundary rules or security baselines

## Required links

- Refer to higher-level policy: 
  - `/.repo/policy/CONSTITUTION.md` - Fundamental articles
  - `/.repo/policy/PRINCIPLES.md` - Operating principles
  - `/.repo/policy/BOUNDARIES.md` - Architectural boundaries
  - `/.repo/policy/SECURITY_BASELINE.md` - Security requirements
  - `/.repo/policy/HITL.md` - Human-in-the-loop process
  - `/.repo/policy/QUALITY_GATES.md` - Quality standards

## Agent Framework

For agent-specific rules, see:
- `/.repo/agents/AGENTS.md` - Core agent rules
- `/.repo/agents/capabilities.md` - Available capabilities
- `/.repo/agents/roles/` - Role definitions

## Manifest

Always check `/.repo/repo.manifest.yaml` for command definitions before running any checks or builds.

## When in Doubt

If you're uncertain about:
- Policy interpretation → Create HITL item
- Command to run → Check repo.manifest.yaml
- Whether change is allowed → Check relevant policy file
- Security implications → Check SECURITY_BASELINE.md and create HITL if triggered
