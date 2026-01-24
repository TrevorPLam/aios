# 🤖 Agent Task Management System

> **Kanban-style task flow for AI-orchestrated development.**

---

## Overview

This folder implements a simple, effective task management workflow designed for AI agents and human oversight:

| File | Purpose | Rule |
|------|---------|------|
| `TODO.md` | Current active tasks | **3-5 tasks at a time, grouped by similar types** |
| `BACKLOG.md` | Prioritized queue | Ordered P0 → P3 |
| `ARCHIVE.md` | Completed tasks | Historical record |

---

## 🔄 Workflow Cycle

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  BACKLOG    │────▶│    TODO     │────▶│   ARCHIVE   │
│  (Queue)    │     │  (Active)   │     │  (Done)     │
└─────────────┘     └─────────────┘     └─────────────┘
     ▲                    │                    │
     │                    │                    │
     └────────────────────┴────────────────────┘
              (New tasks added to backlog)
```

### Step-by-Step Process

1. **Start Work**: Pick up tasks from `TODO.md` (3-5 tasks grouped by similar types)
2. **Complete Work**: Mark all acceptance criteria as done for a task
3. **Archive**: Move completed task to top of `ARCHIVE.md`
4. **Promote**: Move next highest priority task of similar type from `BACKLOG.md` to `TODO.md` (maintain 3-5 similar tasks)
5. **Repeat**

### Task Grouping Rules

**Similar task types are determined by:**
- **Module/Feature area**: Same module (Calendar, Planner, Lists, Email, Analytics, etc.)
- **Change type**: Same change type (feature, api_change, security, cross_module, non_doc_change)
- **Related work**: Related tasks (e.g., all Phase 0 analytics tasks, all Phase 1 analytics tasks)

**Promotion logic:**
- If `TODO.md` has 3-5 tasks of similar type: Only promote tasks of the same type
- If `TODO.md` has 2 or fewer tasks: Can promote any task (type mixing allowed)
- If no similar tasks available in backlog: Work with what's available (don't force grouping)

---

## 📋 Task Format (Consistent Across All Files)

```markdown
### [TASK-XXX] Task Title
- **Priority:** P0 | P1 | P2 | P3
- **Status:** Pending | In Progress | Completed
- **Created:** YYYY-MM-DD
- **Completed:** YYYY-MM-DD (only in ARCHIVE.md)
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

---

## 🎯 Priority Levels

| Level | Name | Meaning | Expected Turnaround |
|-------|------|---------|---------------------|
| **P0** | Critical | Blocking issues, security, broken CI | Immediate |
| **P1** | High | Important features, significant improvements | This week |
| **P2** | Medium | Standard features, non-urgent improvements | This month |
| **P3** | Low | Nice-to-haves, polish, minor enhancements | When possible |

---

## ✅ Acceptance Criteria Best Practices

Good acceptance criteria are:
- **Specific**: Clear, unambiguous requirements
- **Measurable**: Can be objectively verified as done/not done
- **Achievable**: Reasonable scope for a single task
- **Relevant**: Directly contributes to task goal
- **Testable**: Can be validated through testing or review

**Examples:**

❌ Bad: "Make the code better"
✅ Good: "Reduce function complexity to under 10 cyclomatic complexity"

❌ Bad: "Add tests"
✅ Good: "Add unit tests achieving 80%+ coverage for `auth/` module"

❌ Bad: "Fix the bug"
✅ Good: "Prevent null pointer exception when user.email is undefined"

---

## 🤖 Agent Instructions

### For AI Coding Agents:

1. **Before starting work**: Read `TODO.md` to understand the current tasks (3-5 tasks)
2. **During work**: Reference acceptance criteria as your checklist
3. **After completing**:
   - Mark criteria as `[x]` complete
   - Notify human to review and archive
   - Or if autonomous: follow archive workflow

### For Creating New Tasks:

1. Add to `BACKLOG.md` in correct priority position
2. Use sequential task numbers: `[TASK-XXX]`
3. Include clear context explaining WHY the task matters
4. Write specific, testable acceptance criteria

---

## 📊 Tracking Progress

Update the statistics table in `ARCHIVE.md` when completing tasks:

```markdown
## Statistics
| Metric | Count |
|--------|-------|
| Total Completed | X |
| P0 Completed | X |
| P1 Completed | X |
| P2 Completed | X |
| P3 Completed | X |
```

---

## 🔗 Related Files

- `/AGENTS.md` — Main agent instructions for the repository
- `/CONTRIBUTING.md` — Contribution guidelines
- `/.repo/policy/CONSTITUTION.md` — Repository governance rules
- `/.repo/policy/PRINCIPLES.md` — Operating principles
