# Governance Framework Examples

This directory contains example files demonstrating the correct format for various governance artifacts.

## Files

### `example_trace_log.json`
Example trace log following `AGENT_TRACE_SCHEMA.json`. Shows:
- Intent declaration
- Files modified
- Commands executed
- Evidence of verification
- HITL items (if any)
- Unknowns (if any)

**Usage**: Reference when creating trace logs for agent actions.

### `example_hitl_item.md`
Example HITL (Human-In-The-Loop) item following the format defined in `.repo/policy/HITL.md`. Shows:
- Required metadata (ID, Category, Status, etc.)
- Summary of why HITL is required
- Required human actions
- Evidence checklist
- Related artifacts (PR, ADR, Task Packet, Waiver)

**Usage**: Reference when creating HITL items for escalation.

### `example_waiver.md`
Example waiver following `WAIVER_TEMPLATE.md`. Shows:
- What policy is being waived
- Justification
- Scope and impact
- Owner and expiration
- Remediation plan

**Usage**: Reference when requesting policy exceptions.

### `example_task_packet.json`
Example task packet following `task_packet.md` template. Shows:
- Clear goal and non-goals
- Acceptance criteria
- Approach and filepaths
- Verification plan
- Risk assessment
- Rollback plan

**Usage**: Reference when creating task packets for agent work.

## Integration with Governance

All examples align with:
- `.repo/templates/` - Template definitions
- `.repo/policy/HITL.md` - HITL process
- `.repo/policy/BOUNDARIES.md` - Boundary rules
- `.repo/policy/QUALITY_GATES.md` - Quality requirements

## Notes

- Replace placeholder values (e.g., `[Human Name]`) with actual values
- Filepaths must be absolute from repository root
- All dates must be ISO 8601 format (YYYY-MM-DD)
- No secrets or sensitive data in any examples
