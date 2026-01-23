# Trace Logs Directory

This directory contains agent trace logs following the `AGENT_TRACE_SCHEMA.json` format.

## Naming Convention

Trace logs should be named with a clear identifier:
- `trace-{task-id}-{timestamp}.json` - For task-specific traces
- `trace-{pr-number}-{timestamp}.json` - For PR-specific traces
- `trace-{commit-hash}.json` - For commit-specific traces

## Usage

Trace logs are automatically detected by:
- Governance verification script (`.repo/automation/scripts/governance-verify.js`)
- CI workflow (`.github/workflows/ci.yml`)

## Schema

All trace logs must conform to `.repo/templates/AGENT_TRACE_SCHEMA.json`.

## Validation

Validate trace logs with:
```bash
node .repo/automation/scripts/validate-agent-trace.js <trace-log-path>
```

## Example

See `.repo/examples/example_trace_log.json` for a complete example.
