# How to Tune Command Center Recommendations

> **Type:** How-To Guide (Task-Oriented)
> **Audience:** Power users and developers
> **Time:** ~15 minutes
> **Difficulty:** Beginner

## Plain English Summary

- This guide shows you how to refresh and tune Command Center recommendations.
- Use it when suggestions feel stale or off-target.
- WHY: Quick feedback loops keep the recommendation engine aligned with intent.

## Problem

Command Center recommendations can drift when your goals change. You need a safe, repeatable way to reset and recalibrate.

### When to use this guide

- When you see outdated suggestions
- When priorities change (new project, travel, deadlines)

### When NOT to use this guide

- If you're learning the basics → See the [Command Center tutorial](./tutorial.md)
- If you need API details → See the [reference doc](./reference.md)
- If you want system design context → See [architecture](./architecture.md)

## Prerequisites

- [ ] Access to Command Center
- [ ] Recommendations available in the queue

### Verify prerequisites

```bash
npm run expo:dev
```

---

## Solution

### Overview

1. Review confidence levels to identify weak signals.
2. Accept or decline recommendations to reset signals.
3. Refresh the queue to fetch new suggestions.

---

### Step 1: Identify weak signals

Open a recommendation card and check for low confidence. This is the best candidate for declining.

**Why this works:** Low confidence indicates weak evidence, so your feedback has higher impact.

---

### Step 2: Provide explicit feedback

Tap **Accept** for relevant items and **Decline** for irrelevant ones.

**Key points:**
- Always provide feedback before refreshing.
- Declines help remove repeated noise.

---

### Step 3: Refresh recommendations

Trigger a refresh by tapping the refresh button in Command Center.

**Key points:**
- Refreshing without feedback can repeat the same cards.
- Give 2-3 feedback actions before refreshing for best results.

---

## Verification

```bash
# Manual verification
# 1. Decline a low-confidence card
# 2. Accept a high-confidence card
# 3. Refresh recommendations
```

### Expected result

- [ ] Low-confidence cards stop repeating
- [ ] New cards appear after refresh
- [ ] Accepted cards create downstream actions (if applicable)

---

## Troubleshooting

### Issue: Recommendations keep repeating

**Cause:** Refreshing without feedback leaves the queue unchanged.

**Solution:** Provide at least one Accept/Decline action before refreshing.

---

## Best Practices

- ✅ Review confidence signals before acting.
- ✅ Use refresh only after feedback.
- ❌ Don't mass-decline without reading context.

---

## Assumptions

- The Command Center refresh control is enabled.
- Recommendations use confidence labels (low/medium/high).

## How to Verify

```bash
# Manual verification checklist
# - Provide at least two feedback actions
# - Refresh the queue
# - Confirm new cards appear
```

---

*Last Updated: 2026-01-21*
