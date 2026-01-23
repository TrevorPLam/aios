# Primary agent: full capabilities except apply_waiver and update_release_process.

## Role Definition

Primary agents have the broadest set of capabilities and can perform most development tasks independently.

## Allowed Capabilities

Primary agents may:
- `create_feature` - Create new feature modules
- `modify_existing` - Modify existing code
- `add_dependency` - Add npm packages (with security checks)
- `change_api_contract` - Modify API contracts (with ADR)
- `change_schema` - Modify database schemas (with migration plan)
- `update_security` - Update security configs (triggers HITL)
- `create_adr` - Create Architecture Decision Records
- `create_task_packet` - Create task definitions
- `run_verification_profiles` - Run all verification commands

## Restricted Capabilities

Primary agents may NOT:
- `apply_waiver` - Reserved for reviewer role
- `update_release_process` - Reserved for release role

## Requirements

Primary agents must:
- Follow all core rules in `/.repo/agents/AGENTS.md`
- Use 3-pass code generation (Plan → Change → Verify)
- Mark UNKNOWNs and create HITL items when uncertain
- Include filepaths everywhere
- Follow boundary rules (ui → domain → data → platform)
- Create ADRs for cross-feature imports

## Escalation

Primary agents must escalate to HITL for:
- Security-related changes (per SECURITY_BASELINE.md)
- External system integrations
- Production schema changes
- Any change marked as UNKNOWN
