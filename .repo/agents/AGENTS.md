# /.repo/agents/AGENTS.md
Agents operate ONLY within the rules defined in /.repo/policy/*.md and /.repo/GOVERNANCE.md.

## Core Rules (Plain English)
- No guessing. If something is not explicitly known, declare UNKNOWN and create a HITL item.
- Filepaths required everywhere.
- Three-pass code generation required:
  1) Plan (list actions, risks, files, UNKNOWNs)
  2) Change (apply edits)
  3) Verify (tests, evidence, logs, trace)
- All logs must follow /.repo/templates/AGENT_LOG_TEMPLATE.md.
- All trace logs must follow /.repo/templates/AGENT_TRACE_SCHEMA.json.
- Cross-feature imports require ADR.
- Boundary model enforced: ui → domain → data → platform.

## UNKNOWN Workflow

When you encounter something that is not explicitly known from repo docs, manifest, or code:

1. **Mark it as UNKNOWN** - Use the `<UNKNOWN>` placeholder or explicit declaration
2. **Stop on that portion** - Do not proceed with uncertain work
3. **Create HITL item** - Follow the process in `/.repo/policy/HITL.md`
4. **Document what you know** - Include filepaths, context, and what you tried
5. **Wait for human resolution** - Do not guess or make assumptions

This is required by Article 3 (No Guessing) in `/.repo/policy/CONSTITUTION.md`.

## Three-Pass Code Generation

All code changes must follow this process:

### Pass 1: Plan
- List all actions you will take
- Identify risks and filepaths affected
- Mark any UNKNOWNs
- Reference relevant policies (BOUNDARIES.md, SECURITY_BASELINE.md, etc.)
- Get approval if HITL is required

### Pass 2: Change
- Apply edits to files
- Follow boundary rules (ui → domain → data → platform)
- Maintain existing patterns
- Include filepaths in all changes

### Pass 3: Verify
- Run tests (use commands from `/.repo/repo.manifest.yaml`)
- Provide evidence (command outputs, test results)
- Create trace log following `/.repo/templates/AGENT_TRACE_SCHEMA.json`
- Document verification in PR or task

## Filepaths Required

Filepaths must be included in:
- PR descriptions
- Task Packets
- Logs and trace files
- ADRs (Architecture Decision Records)
- Waivers
- Inline code comments when relevant
- HITL items

This is required by the global rule in `/.repo/policy/PRINCIPLES.md`.

## Trace Logs

Trace logs should be stored in `.repo/traces/` directory following the naming convention:
- `trace-{task-id}-{timestamp}.json` - For task-specific traces
- `trace-{pr-number}-{timestamp}.json` - For PR-specific traces

See `.repo/traces/README.md` for details.

## Boundary Enforcement

The boundary model is: **ui → domain → data → platform**

- **UI layer** may import from Domain layer
- **Domain layer** may import from Data layer
- **Data layer** may import from Platform layer
- **Platform layer** depends on nothing

Cross-feature imports require an ADR. See `/.repo/policy/BOUNDARIES.md` for details.

## Required References

Before making changes, agents must:
1. Read `/.repo/repo.manifest.yaml` for command definitions
2. Check `/.repo/policy/CONSTITUTION.md` for fundamental rules
3. Review `/.repo/policy/PRINCIPLES.md` for operating principles
4. Understand `/.repo/policy/BOUNDARIES.md` for architectural rules
5. Check `/.repo/policy/SECURITY_BASELINE.md` for security triggers
6. Review `/.repo/policy/HITL.md` for escalation process

## Agent Roles

See `/.repo/agents/roles/` for role-specific capabilities:
- `primary.md` - Full capabilities agent
- `secondary.md` - Limited capabilities agent
- `reviewer.md` - Human reviewer
- `release.md` - Human release manager

## Capabilities

See `/.repo/agents/capabilities.md` for the complete list of agent capabilities.

## Quick Reference

See `/.repo/agents/QUICK_REFERENCE.md` for a one-page cheat sheet with:
- Decision tree for HITL requirements
- Common commands and workflows
- Artifact requirements table
- Boundary rules quick reference
- Exit codes and file locations

## Examples

See `/.repo/examples/` for example files demonstrating correct formats:
- `example_trace_log.json` - Trace log format
- `example_hitl_item.md` - HITL item format
- `example_waiver.md` - Waiver format
- `example_task_packet.json` - Task packet format

## Folder-Level Guides

Each major directory may have an `AGENT.md` file with folder-specific rules:
- `/.repo/AGENT.md` - Governance folder rules
- `/packages/platform/AGENT.md` - Platform layer rules
- `/docs/AGENT.md` - Documentation rules
- `/scripts/AGENT.md` - Scripts folder rules

These supplement but do not override the core rules in this file.
