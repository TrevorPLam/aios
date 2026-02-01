# Current Sprints & Active Tasks

<!--
SYSTEM INSTRUCTIONS — TODO.md (agent-enforced)

Purpose: Active work queue. This file MUST contain tasks of a SINGLE batch type.

Global Rules:
1) Task blocks MUST be wrapped with:
   ## task_begin
   ## task_end
2) Every task MUST include tags in the title line:
   [id:...][type:...][priority:...][component:...]
3) Batch rules:
   - TODO.md MUST contain only ONE [type:*] at a time.
   - Batch size target: 5 tasks (or fewer if backlog has fewer).
   - Do NOT add tasks manually unless explicitly instructed.
4) Ordering rules:
   - Preserve the order as moved from BACKLOG.md.
   - Do NOT reorder unless explicitly instructed.
5) Completion rules:
   - When Status becomes done, MOVE the entire task block to ARCHIVE.md.
   - Remove it from TODO.md after archiving.
6) Notes discipline:
   - "Notes & Summary" is for execution logs and final summaries.
   - Keep Notes <= 10 lines. Prefer bullets. No long transcripts.
-->

## 🎯 Current Batch Focus
**Batch Type:** [type:feature]  
**Batch Goal:** Declare and install dependencies for api-gateway and contracts packages  
**Batch Size Target:** 5

---

## task_begin
## 1. # [id:TASK-20260131-001][type:feature][priority:critical][component:backend] Declare and install api-gateway dependencies

**Status:** todo  
**Created:** 2026-01-31  
**Assignee:** @agent

### Description
> Add express bcryptjs jsonwebtoken zod to services/api-gateway/package.json; run pnpm install; confirm build and type-check pass.

### Acceptance Criteria
- [ ] package.json updated
- [ ] pnpm install succeeds
- [ ] build and type-check pass

### Dependencies
- REPORT_TASKS.toon subtasks TASK-01-1..4

### Plan
1. Add dependencies to package.json
2. Run pnpm install
3. Verify build and type-check
4. See .agents/tasks/REPORT_TASKS.toon for subtasks and AGENT/USER

### Notes & Summary
- See .agents/tasks/REPORT_TASKS.toon for subtasks and AGENT/USER.
## task_end

---

## task_begin
## 2. # [id:TASK-20260131-002][type:feature][priority:critical][component:backend] Declare and install contracts dependencies

**Status:** todo  
**Created:** 2026-01-31  
**Assignee:** @agent

### Description
> Add zod drizzle-orm drizzle-zod to packages/contracts/package.json; run pnpm install; confirm type-check and build.

### Acceptance Criteria
- [ ] package.json updated
- [ ] pnpm install succeeds
- [ ] contracts and dependents build

### Dependencies
- REPORT_TASKS.toon subtasks TASK-02-1..4

### Plan
1. Add dependencies to package.json
2. Run pnpm install
3. Verify type-check and build
4. See REPORT_TASKS.toon for subtasks

### Notes & Summary
- See REPORT_TASKS.toon for subtasks.
## task_end

---

## task_begin
## 3. # [id:TASK-20260131-003][type:feature][priority:critical][component:backend] Add missing landing template or make it optional

**Status:** todo  
**Created:** 2026-01-31  
**Assignee:** @agent

### Description
> Create services/api-gateway/templates/landing-page.html or make startup conditional so server does not crash on boot.

### Acceptance Criteria
- [ ] Template exists or conditional load
- [ ] Server starts without crash on /

### Dependencies
- REPORT_TASKS.toon subtasks TASK-03-1..4

### Plan
1. Create template file or make startup conditional
2. Test server startup
3. Verify no crash on /
4. See REPORT_TASKS.toon for subtasks and AGENT/USER

### Notes & Summary
- See .agents/tasks/REPORT_TASKS.toon for subtasks and AGENT/USER.
## task_end

---

## task_begin
## 4. # [id:TASK-20260131-004][type:feature][priority:critical][component:documentation] Document JWT_SECRET in .env.example

**Status:** todo  
**Created:** 2026-01-31  
**Assignee:** @agent

### Description
> Add # JWT_SECRET=... and one-line note to .env.example; reference in README or service docs.

### Acceptance Criteria
- [ ] .env.example documents JWT_SECRET
- [ ] No secret value committed

### Dependencies
- REPORT_TASKS.toon subtasks TASK-04-1..3

### Plan
1. Add JWT_SECRET to .env.example
2. Add one-line documentation
3. Reference in README or service docs
4. See REPORT_TASKS.toon for subtasks

### Notes & Summary
- See REPORT_TASKS.toon for subtasks.
## task_end

---
