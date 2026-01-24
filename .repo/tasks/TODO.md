# 🤖 Current Active Tasks

> **Rule: 3-5 tasks should be in this file at a time, grouped by similar task types.**

Tasks should be grouped by similar types (same module/feature area, same change type, or related work). If there are fewer than 3 tasks of a similar type available, work with what's available. When a task is completed, it should be moved to `ARCHIVE.md` and the next highest priority task of a similar type from `BACKLOG.md` should be promoted here.

---

## Active Tasks

### [TASK-085] Phase 0: Integration Testing
- **Priority:** P0
- **Status:** In Progress
- **Created:** 2026-01-21
- **Context:** Phase 0: Integration Testing. End-to-end test from client to database. Verify offline queueing, retry, GDPR deletion. Critical to ensure Phase 0 works before Phase 1. T-081 through T-084 already COMPLETED - need tests.

#### Acceptance Criteria
- [x] E2E test: Client sends events → Server receives → DB persists
- [x] Test offline queueing (events queue when server down)
- [x] Test retry logic (events retry on failure)
- [x] Test batch sending (50 events sent as batch)
- [x] Test GDPR deletion (deleteUserAnalytics removes all events)
- [x] Test error handling (bad payload returns 400)
- [ ] Test coverage >80% (coverage run blocked by npm install dependency resolution error)

#### Notes
- References: docs/analytics/PHASE_0_HANDOFF.md, docs/analytics/DEEP_ASSESSMENT_AND_GAMEPLAN.md (Task 0.5), apps/api/__tests__/analytics.test.ts (NEW FILE)
- In progress: added client/transport retry coverage in packages/platform/analytics/__tests__/client.test.ts and packages/platform/analytics/__tests__/transport.test.ts.
- Test setup blocked by npm install dependency resolution failure (react/react-dom peer conflict).
- Dependencies: None (T-081-T-084 already complete)
- Effort: M (4-6 hours)
- Note: Last step for Phase 0. Once complete, unblocks Phase 1 (T-071).

#### Logs
- Trace: `.repo/traces/TASK-085-trace-*.json`
- Agent: `.repo/logs/TASK-085-log-*.json`

---

## Task Format Template

```markdown
### [TASK-XXX] Task Title
- **Priority:** P0 | P1 | P2 | P3
- **Status:** Pending | In Progress | Blocked | Completed
- **Type:** [Module/Feature area] | [Change type] | [Related work]
- **Created:** YYYY-MM-DD
- **Completed:** YYYY-MM-DD (only when moved to ARCHIVE.md)
- **Context:** Brief description of why this task matters

#### Acceptance Criteria
- [ ] Specific, measurable criterion 1
- [ ] Specific, measurable criterion 2

#### Notes
- Relevant context, links, or references

#### Logs
- Trace: `.repo/traces/TASK-XXX-trace-*.json`
- Agent: `.repo/logs/TASK-XXX-log-*.json`
```

**Note:** Tasks in TODO.md should be grouped by similar types. See `.repo/tasks/README.md` for grouping rules.
