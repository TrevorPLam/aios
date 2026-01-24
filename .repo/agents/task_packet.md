# /.repo/agents/task_packet.md
{
  "goal": "",
  "non_goals": [],
  "acceptance_criteria": [],
  "approach": "",
  "files_touched": [],
  "verification_plan": [],
  "risks": [],
  "rollback_plan": "",
  "hitl_requirements": [],
  "notes": "Filepaths required. No guessing. UNKNOWN → HITL."
}

**Token optimization tips:**
- Use `read_file` with `offset` and `limit` parameters for large files
- Specify `target_directories` parameter in searches to limit scope
- Use grep to find relevant sections before reading entire files