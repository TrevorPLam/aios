# Trace Logs Directory

This directory contains trace logs for agent work following the three-pass workflow (Plan → Change → Verify).

## Purpose

Trace logs provide a complete audit trail of agent actions, including:
- **Intent**: What the agent was trying to accomplish
- **Files**: Which files were modified
- **Commands**: What verification commands were run
- **Evidence**: Proof that the work was verified
- **HITL**: Human-in-the-loop items created
- **Unknowns**: Things marked as UNKNOWN

## Naming Convention

Trace logs follow this naming pattern:
```
trace-{task-id}-{timestamp}.json
```

Examples:
- `trace-TASK-001-2026-01-23T10-30-00-000Z.json`
- `trace-unknown-2026-01-23T10-30-00-000Z.json` (if no task ID)

## Schema

Trace logs must conform to `.repo/templates/AGENT_TRACE_SCHEMA.json`.

Required fields:
- `intent` (string): What the agent was trying to accomplish
- `files` (array): List of file paths modified
- `commands` (array): Verification commands run
- `evidence` (array): Evidence of verification (command outputs, test results)
- `hitl` (array): HITL item IDs created
- `unknowns` (array): Things marked as UNKNOWN

## Creating Trace Logs

### Automated (Recommended)

Use the trace log generator:
```bash
node .repo/automation/scripts/create-trace-log.js \
  --intent "Add contact management feature" \
  --files "packages/features/contacts/domain/contactService.ts,packages/features/contacts/ui/ContactList.tsx" \
  --commands "npm run check:types,npm test,npm run lint" \
  --evidence "Type checking passed,All tests passed (15/15),Linting clean"
```

### Manual

Create a JSON file following the schema:
```json
{
  "intent": "Add contact management feature",
  "files": [
    "packages/features/contacts/domain/contactService.ts",
    "packages/features/contacts/ui/ContactList.tsx"
  ],
  "commands": [
    "npm run check:types",
    "npm test",
    "npm run lint"
  ],
  "evidence": [
    "Type checking passed",
    "All tests passed (15/15)",
    "Linting clean"
  ],
  "hitl": [],
  "unknowns": []
}
```

## When to Create Trace Logs

Trace logs are **required** for all non-documentation changes per Article 2 (Verifiable over Persuasive) and Principle 24 (Logs Required for Non-Docs).

**Required for:**
- Feature additions
- Bug fixes
- Refactoring
- Security changes
- API changes
- Schema changes

**Not required for:**
- Documentation-only changes
- Comment-only changes
- Whitespace-only changes

## Validation

Trace logs are automatically validated by `governance-verify.js` in CI. You can validate locally:

```bash
node .repo/automation/scripts/validate-agent-trace.js .repo/traces/trace-*.json
```

## Examples

See `.repo/examples/example_trace_log.json` for a complete example.

## Related Documentation

- `.repo/agents/AGENTS.md` - Core agent rules
- `.repo/policy/CONSTITUTION.md` - Article 2 (Verification)
- `.repo/policy/PRINCIPLES.md` - Principle 24 (Logs Required)
- `.repo/templates/AGENT_TRACE_SCHEMA.json` - Schema definition
