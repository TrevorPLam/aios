# 🤖 Current Active Task

> **Rule: Only ONE task should be in this file at a time.**

When a task is completed, it should be moved to `ARCHIVE.md` and the next highest priority task from `BACKLOG.md` should be promoted here.

---

## Current Task

### [TASK-085] Phase 0: Integration Testing
- **Priority:** P0
- **Status:** Pending
- **Created:** 2026-01-21
- **Context:** Phase 0: Integration Testing. End-to-end test from client to database. Verify offline queueing, retry, GDPR deletion. Critical to ensure Phase 0 works before Phase 1. T-081 through T-084 already COMPLETED - need tests.

#### Acceptance Criteria
- [ ] E2E test: Client sends events → Server receives → DB persists
- [ ] Test offline queueing (events queue when server down)
- [ ] Test retry logic (events retry on failure)
- [ ] Test batch sending (50 events sent as batch)
- [ ] Test GDPR deletion (deleteUserAnalytics removes all events)
- [ ] Test error handling (bad payload returns 400)
- [ ] Test coverage >80%

#### Notes
- References: docs/analytics/PHASE_0_HANDOFF.md, docs/analytics/DEEP_ASSESSMENT_AND_GAMEPLAN.md (Task 0.5), apps/api/__tests__/analytics.test.ts (NEW FILE)
- Dependencies: None (T-081-T-084 already complete)
- Effort: M (4-6 hours)
- Note: Last step for Phase 0. Once complete, unblocks Phase 1 (T-071).

---

## Task Format Template

```markdown
### [TASK-XXX] Task Title
- **Priority:** P0 | P1 | P2 | P3
- **Status:** Pending | In Progress | Completed
- **Created:** YYYY-MM-DD
- **Completed:** YYYY-MM-DD (only when moved to ARCHIVE.md)
- **Context:** Brief description of why this task matters

#### Acceptance Criteria
- [ ] Specific, measurable criterion 1
- [ ] Specific, measurable criterion 2

#### Notes
- Relevant context, links, or references
```
