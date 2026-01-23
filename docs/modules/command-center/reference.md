# Command Center Reference

> **Type:** Reference (Information-Oriented)
> **Audience:** Developers and QA
> **Scope:** Command Center UI, data model, and actions

## Plain English Summary

- This reference lists Command Center data fields, actions, and UI behaviors.
- Use it when you need exact names or expectations for recommendations.
- WHY: Reference docs prevent guesswork during QA and feature work.

## Core Concepts

### Recommendation Card

| Field | Meaning | Example |
| --- | --- | --- |
| `title` | Short summary of the suggestion | "Review today’s tasks" |
| `confidence` | Strength of evidence | `low`, `medium`, `high` |
| `evidence` | Supporting context | "3 tasks due today" |
| `expiresAt` | When the suggestion becomes stale | ISO timestamp |

### Actions

| Action | Result | Notes |
| --- | --- | --- |
| Accept | Applies or queues the suggestion | Shows success feedback |
| Decline | Removes suggestion from queue | Used to tune signals |
| Refresh | Fetches new recommendations | Avoid if no feedback yet |

## UI Expectations

- Cards are swipeable and show confidence meters.
- Confidence colors align with the design system: purple (low), yellow (medium), green (high).
- Empty states explain why no recommendations are available.

## Data Sources

- Seed data: `apps/mobile/utils/seedData.ts`
- Recommendation logic engine: `apps/mobile/lib/recommendationEngine.ts`
- Command Center UI + wiring: `apps/mobile/screens/CommandCenterScreen.tsx`

## Error Handling

- No recommendations → show empty state with refresh option.
- Expired recommendations → hide or deprioritize.

## How to Verify

```bash
# Manual verification
# - Open Command Center
# - Inspect a card for title/confidence/evidence
# - Trigger accept/decline and confirm UI updates
```

---

*Last Updated: 2026-01-21*

