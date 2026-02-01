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
**Batch Goal:** [Brief description of what this group of tasks achieves]  
**Batch Size Target:** 5

---

## task_begin
## 1. # [id:TASK-YYYYMMDD-001][type:feature][priority:high][component:backend] Title of the task

**Status:** todo  
**Created:** 2026-XX-XX  
**Assignee:** @agent

### Description
> Detailed explanation of the requirement, including user stories, context, and constraints.

### Acceptance Criteria
- [ ] Criterion 1 (Concrete condition)
- [ ] Criterion 2 (Concrete condition)

### Definition of Done
- [ ] Unit tests passed
- [ ] Linting/Formatting checks passed
- [ ] Documentation updated
- [ ] No new errors introduced

### Relevant Files
- `src/path/to/file.ts`
- `tests/path/to/file.test.ts`

### Dependencies
- Depends on: [id:TASK-...], or None

### Plan
1. [Step 1]  
2. [Step 2]

### Notes & Summary
- [log] ...
- [summary] ...
## task_end

---

## task_begin
## 2. # [id:TASK-YYYYMMDD-002][type:feature][priority:medium][component:api] Title of the task

**Status:** todo  
**Created:** 2026-XX-XX  
**Assignee:** @agent

### Description
> Context and requirements.

### Acceptance Criteria
- [ ] Criterion 1  
- [ ] Criterion 2

### Definition of Done
- [ ] Unit tests passed
- [ ] Linting/Formatting checks passed
- [ ] Documentation updated

### Relevant Files
- `src/api/endpoint.ts`

### Dependencies
- None

### Plan
1. [Step 1]

### Notes & Summary
- [log] ...
- [summary] ...
## task_end

---

# Project Backlog

<!--
SYSTEM INSTRUCTIONS — BACKLOG.md (agent-enforced)

Purpose: Storage of unscheduled tasks. Agent replenishes TODO.md from here.

Global Rules:
1) All tasks MUST follow this header format:
   ### # [id:...][type:...][priority:...][component:...] Title
2) Task blocks MUST be wrapped with:
   ## task_begin
   ## task_end
3) Grouping rules (for deterministic batching):
   - Tasks are grouped using:
     ## group_begin [type:X][priority:Y]
     ## group_end
   - When replenishing TODO.md:
     a) Select ONE group only (single type).
     b) Take up to 5 tasks in listed order.
     c) MOVE tasks to TODO.md (copy then delete from source).
4) Agent MUST NOT rewrite task content except to:
   - normalize formatting
   - fix obvious tag typos
   - add missing fields if absent
5) Do NOT reorder tasks inside a group.
-->

## group_begin [type:feature][priority:medium]
## 🚀 Features (Unscheduled) — Medium

## task_begin
### # [id:TASK-YYYYMMDD-101][type:feature][priority:medium][component:frontend] Example Feature Title
**Status:** todo  
**Description:** Implement the user dashboard widget for metrics.  
**Acceptance Criteria:**  
- [ ] Widget displays daily active users.  
- [ ] Widget refreshes every 60s.  
**Relevant Files:** `src/components/Dashboard.tsx`
## task_end

---
## group_end

## group_begin [type:bug][priority:critical]
## 🐛 Bugs (Unscheduled) — Critical

## task_begin
### # [id:TASK-YYYYMMDD-201][type:bug][priority:critical][component:auth] Fix Token Expiry Issue
**Status:** todo  
**Description:** Users are not logged out when the JWT expires.  
**Acceptance Criteria:**  
- [ ] User is redirected to login on 401 error.  
**Relevant Files:** `src/auth/middleware.ts`
## task_end

---
## group_end

## group_begin [type:bug][priority:high]
## 🐛 Bugs (Unscheduled) — High

## task_begin
### # [id:TASK-YYYYMMDD-202][type:bug][priority:high][component:ui] Fix Mobile Overflow
**Status:** todo  
**Description:** Sidebar overflows on iPhone SE screens.  
**Acceptance Criteria:**  
- [ ] No horizontal scroll on mobile.  
**Relevant Files:** `src/styles/layout.css`
## task_end

---
## group_end

## group_begin [type:chore][priority:low]
## 🧹 Chores & Refactoring (Unscheduled) — Low

## task_begin
### # [id:TASK-YYYYMMDD-301][type:chore][priority:low][component:build] Update Node Dependencies
**Status:** todo  
**Description:** Upgrade packages to latest stable versions.  
**Definition of Done:**  
- [ ] Run full regression suite.
## task_end

---
## group_end

## group_begin [type:documentation][priority:medium]
## 📚 Documentation (Unscheduled) — Medium

## task_begin
### # [id:TASK-YYYYMMDD-401][type:documentation][priority:medium][component:api] Update Swagger Docs
**Status:** todo  
**Description:** Ensure /users endpoints match current implementation.
## task_end

---
## group_end

# Task Archive

<!--
SYSTEM INSTRUCTIONS — ARCHIVE.md (agent-enforced)

Purpose: Append-only history of completed tasks.

Rules:
1) APPEND-ONLY — agent MUST append new completed tasks at bottom.
2) NEVER modify existing archived tasks (no rewrites, no reformatting).
3) Each archived task MUST be a full task block from TODO.md.
4) Required:
   **Status:** done
   **Completed:** YYYY-MM-DD
   **Assignee:** @agent
5) Final Summary <= 8 lines.
-->

## ✅ Completed Tasks (Chronological)

---

## task_begin
### # [id:TASK-20260201-001][type:feature][priority:high][component:backend] Add User Profile Edit Endpoint

**Status:** done  
**Completed:** 2026-02-01  
**Assignee:** @agent

### Description
> Allow users to update their bio and avatar URL via the API.

### Acceptance Criteria
- [x] Endpoint accepts PUT requests at /api/users/profile  
- [x] Validates inputs (bio max 200 chars)  
- [x] Updates database record  

### Definition of Done
- [x] All tests pass  
- [x] Documentation updated  

### Relevant Files
- `src/api/user/profile.ts`  
- `tests/user/profile.test.ts`

### Final Summary
- Implemented PUT /api/users/profile.  
- Added Zod validation.  
- Added unit tests.  
## task_end

---

## task_begin
### # [id:TASK-20260131-005][type:bug][priority:critical][component:database] Fix Connection Timeout on Prod

**Status:** done  
**Completed:** 2026-01-31  
**Assignee:** @agent

### Description
> The connection pool is timing out during high traffic spikes.

### Final Summary
- Increased pool size 10 → 50.  
- Added keep-alive check.  
## task_end

---

# TASK INDEX

<!--
SYSTEM INSTRUCTIONS — TASK_INDEX.md (agent-enforced)

Purpose: Central registry mapping every task's ID to its current location.

Rules:
1) Every task MUST have an entry here.
2) On task creation → append new entry.
3) When moving tasks → update `status` + `location`.
4) When completing → set status=done, location=ARCHIVE.md, add completed date.
5) Strict boundaries:
   ## index_entry_begin
   ## index_entry_end
6) Entries MUST remain in chronological order.
7) Allowed statuses: todo | in-progress | blocked | done
8) Allowed locations: BACKLOG.md | TODO.md | ARCHIVE.md
-->

## 🗂 Task Registry

---

## index_entry_begin
[id:TASK-20260201-001]  
type: feature  
priority: high  
component: backend  
status: done  
location: ARCHIVE.md  
created: 2026-02-01  
completed: 2026-02-01  
title: Add User Profile Edit Endpoint
## index_entry_end

---

## index_entry_begin
[id:TASK-20260131-005]  
type: bug  
priority: critical  
component: database  
status: done  
location: ARCHIVE.md  
created: 2026-01-31  
completed: 2026-01-31  
title: Fix Connection Timeout on Prod
## index_entry_end

---

## Template for New Index Entries

## index_entry_begin
[id:TASK-YYYYMMDD-XXX]  
type: <feature|bug|chore|documentation|etc>  
priority: <critical|high|medium|low>  
component: <backend|api|ui|etc>  
status: todo  
location: BACKLOG.md  
created: YYYY-MM-DD  
title: New Task Title Goes Here  
## index_entry_end

---
