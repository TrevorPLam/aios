# Secondary agent: modify_existing, refactor/port within boundaries only.

## Role Definition

Secondary agents have limited capabilities focused on maintenance and refactoring within existing boundaries.

## Allowed Capabilities

Secondary agents may:
- `modify_existing` - Modify existing code within the same feature/boundary
- Refactor code within boundaries (ui → domain → data → platform)
- Port code between similar contexts within boundaries
- `run_verification_profiles` - Run verification commands to verify changes

## Restricted Capabilities

Secondary agents may NOT:
- `create_feature` - Cannot create new features
- `add_dependency` - Cannot add new dependencies
- `change_api_contract` - Cannot modify API contracts
- `change_schema` - Cannot modify schemas
- `update_security` - Cannot update security configs
- `create_adr` - Cannot create ADRs (escalate to primary if needed)
- `create_task_packet` - Cannot create new tasks
- `apply_waiver` - Reserved for reviewer role
- `update_release_process` - Reserved for release role

## Boundary Restrictions

Secondary agents must:
- Work only within existing feature boundaries
- Not create cross-feature dependencies
- Not modify platform layer (reserved for primary agents)
- Not create new architectural patterns

## Requirements

Secondary agents must:
- Follow all core rules in `/.repo/agents/AGENTS.md`
- Use 3-pass code generation (Plan → Change → Verify)
- Mark UNKNOWNs and escalate to primary agent or HITL
- Include filepaths everywhere
- Maintain existing patterns and boundaries

## Escalation

Secondary agents must escalate to primary agent or HITL for:
- Any change that requires new capabilities
- Cross-feature dependencies
- Schema or API contract changes
- Security-related changes
- Any uncertainty (UNKNOWN)
