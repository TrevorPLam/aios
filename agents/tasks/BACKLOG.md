# Future Work & Backlog

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

## group_begin [type:feature][priority:critical]
## 🚀 Features (Unscheduled) — Critical

## task_begin
### # [id:TASK-20260131-005][type:feature][priority:critical][component:backend] Add API gateway tests
**Status:** todo  
**Description:** Gateway has no tests; auth and routes untested.  
**Acceptance Criteria:**  
- [ ] Jest in api-gateway  
- [ ] Unit tests for auth errorHandler validation  
- [ ] Integration tests for auth and one CRUD  
**Dependencies:** TASK-05 in REPORT_TASKS.toon  
**Relevant Files:** `services/api-gateway/`
## task_end

---

## group_begin [type:feature][priority:high]
## 🚀 Features (Unscheduled) — High

## task_begin
### # [id:TASK-20260131-006][type:feature][priority:high][component:ci] Run test:coverage in CI and enforce gate
**Status:** todo  
**Description:** Coverage not visible or enforced in CI.  
**Acceptance Criteria:**  
- [ ] CI runs test:coverage  
- [ ] Publish or fail below threshold  
**Dependencies:** TASK-06 in REPORT_TASKS.toon  
**Relevant Files:** `.github/workflows/`
## task_end

---

## task_begin
### # [id:TASK-20260131-007][type:feature][priority:high][component:backend] Extract message helpers to remove duplication
**Status:** todo  
**Description:** buildMessagePreview and buildMessageSearchIndex duplicated in database.ts and api-gateway storage.ts.  
**Acceptance Criteria:**  
- [ ] Single shared module  
- [ ] Both callers refactored  
**Dependencies:** TASK-07 in REPORT_TASKS.toon  
**Relevant Files:** `database.ts` `storage.ts`
## task_end

---

## task_begin
### # [id:TASK-20260131-008][type:feature][priority:high][component:backend] Split routes into domain files
**Status:** todo  
**Description:** routes/index.ts is ~786 lines; single file for all routes increases coupling and merge risk.  
**Acceptance Criteria:**  
- [ ] Domain route files (auth notes tasks etc.)  
- [ ] routes/index.ts composes them  
**Dependencies:** TASK-08 in REPORT_TASKS.toon  
**Relevant Files:** `routes/index.ts`
## task_end

---

## task_begin
### # [id:TASK-20260131-010][type:feature][priority:high][component:security] Harden security in CI
**Status:** todo  
**Description:** pnpm audit continues on error; no security headers in gateway.  
**Acceptance Criteria:**  
- [ ] Audit fail on critical/high  
- [ ] Security headers middleware  
- [ ] SECURITY.md updated  
**Dependencies:** TASK-10 in REPORT_TASKS.toon  
**Relevant Files:** `SECURITY.md`
## task_end

---

## task_begin
### # [id:TASK-20260131-014][type:feature][priority:high][component:testing] E2E or API contract tests for gateway
**Status:** todo  
**Description:** No e2e or API contract tests for critical flows.  
**Acceptance Criteria:**  
- [ ] Small e2e or contract suite (e.g. login create note fetch note)  
- [ ] Wired into CI  
**Dependencies:** TASK-14 in REPORT_TASKS.toon  
**Relevant Files:** `tests/`
## task_end

---

## group_begin [type:feature][priority:medium]
## 🚀 Features (Unscheduled) — Medium

## task_begin
### # [id:TASK-20260131-009][type:feature][priority:medium][component:backend] Break up database.ts
**Status:** todo  
**Description:** database.ts is ~5748 lines; refactor and merge risk.  
**Acceptance Criteria:**  
- [ ] Per-domain storage modules  
- [ ] Thin database.ts re-exports db  
- [ ] Tests for new modules  
**Dependencies:** TASK-09 in REPORT_TASKS.toon  
**Relevant Files:** `database.ts`
## task_end

---

## task_begin
### # [id:TASK-20260131-011][type:feature][priority:medium][component:documentation] Align README with repo
**Status:** todo  
**Description:** README references missing infrastructure/ docs/ tools/.  
**Acceptance Criteria:**  
- [ ] README matches repo  
- [ ] No broken references  
**Dependencies:** TASK-11 in REPORT_TASKS.toon  
**Relevant Files:** `README.md`
## task_end

---

## group_begin [type:feature][priority:low]
## 🚀 Features (Unscheduled) — Low

## task_begin
### # [id:TASK-20260131-012][type:feature][priority:low][component:backend] Introduce pagination/caps in client storage
**Status:** todo  
**Description:** database.ts does getAll then filter; no pagination for large datasets.  
**Acceptance Criteria:**  
- [ ] Optional limit/offset or cursor  
- [ ] Document max sizes  
- [ ] Lazy loading considered  
**Dependencies:** TASK-12 in REPORT_TASKS.toon  
**Relevant Files:** `client/storage/`
## task_end

---

## task_begin
### # [id:TASK-20260131-013][type:feature][priority:low][component:documentation] Track hotspots and tech debt
**Status:** todo  
**Description:** No automated churn or hotspot metrics.  
**Acceptance Criteria:**  
- [ ] Script identifies high-churn high-complexity files  
- [ ] Prioritization  
- [ ] USER allocates refactor work  
**Dependencies:** TASK-13 in REPORT_TASKS.toon  
**Relevant Files:** `scripts/`
## task_end

---
## group_end
