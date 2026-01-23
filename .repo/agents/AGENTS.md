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
