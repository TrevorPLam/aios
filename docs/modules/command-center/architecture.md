# Command Center Architecture

> **Type:** Explanation (Understanding-Oriented)
> **Audience:** Developers and product owners

## Plain English Summary

- Command Center aggregates recommendations from multiple modules and presents them as a prioritized card queue.
- It uses confidence levels and evidence to keep decisions explainable.
- WHY: Transparent AI guidance reduces user friction and builds trust.

## Architecture Overview

```text
[Module Data] → [Recommendation Builder] → [Card Queue] → [Command Center UI]
```

### Key Components

1. **Recommendation Builder**
   - Collects candidate suggestions across modules.
   - Applies confidence scoring and expiration rules.

2. **Card Queue**
   - Orders recommendations by confidence and recency.
   - Enforces a small, swipeable set to reduce overload.

3. **Command Center UI**
   - Displays cards with confidence meters and actions.
   - Captures Accept/Decline feedback for tuning.

## Data Flow

1. Module data is gathered (tasks, events, messages).
2. Recommendations are scored and filtered.
3. The queue is rendered as cards.
4. Feedback updates local state and future suggestions.

## Design Decisions

- **Confidence levels are explicit** to keep reasoning transparent.
- **Short card queue** reduces cognitive load while keeping momentum.
- **Local-first data** respects privacy and offline use.

## Failure Modes

| Failure | Symptom | Mitigation |
| --- | --- | --- |
| No recommendations | Empty screen | Show empty state + refresh guidance |
| Stale recommendations | Outdated cards | Respect `expiresAt` and refresh |
| Low trust | Users ignore cards | Use evidence text and allow decline |

## How to Verify

```bash
# Manual verification
# - Open Command Center
# - Confirm confidence and evidence are visible
# - Decline a card and ensure it is removed
```

---

*Last Updated: 2026-01-21*
