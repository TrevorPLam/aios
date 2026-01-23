# Command Center Tutorial - Your First Recommendation Review

> **Type:** Tutorial (Learning-Oriented)
> **Audience:** New AIOS users
> **Time:** ~10 minutes
> **Prerequisites:** Access to the AIOS app and sample recommendations

## Plain English Summary

- This tutorial walks you through reviewing and acting on Command Center recommendations.
- You'll learn how to read confidence signals, accept suggestions, and give feedback.
- By the end, you'll know how to keep recommendations useful with quick refreshes.
- WHY: Command Center is the entry point for AI guidance, so first-time steps matter most.

## What You'll Learn

- [ ] How to open Command Center and identify recommendation cards
- [ ] How confidence levels influence your decision
- [ ] How to accept or decline a recommendation safely
- [ ] How to refresh suggestions when context changes

## What You'll Build

A consistent review routine for Command Center suggestions that keeps your day organized.

## Prerequisites

### Required

- [ ] AIOS installed (iOS simulator or device)
- [ ] Seed data loaded or an account with recommendations

### Verify prerequisites

```bash
npm run expo:dev
```

---

## Step 1: Open Command Center

### What we're doing

We start at the Command Center because it aggregates cross-module insights.

### Action

1. Launch the app.
2. Tap the Command Center icon in the main navigation.

### What you should see

You should see recommendation cards with confidence meters and action buttons.

**✅ Checkpoint:** At least one recommendation card is visible.

---

## Step 2: Review a recommendation

### What we're doing

We interpret a card's confidence level before acting.

### Action

1. Tap a recommendation card.
2. Read the confidence indicator and context text.

### What you should see

A detail view with confidence (low/medium/high) and supporting evidence.

**✅ Checkpoint:** You can explain why the recommendation is relevant.

---

## Step 3: Accept or decline with feedback

### What we're doing

We confirm actions so the system learns your preferences.

### Action

1. Tap **Accept** to apply the recommendation.
2. Tap **Decline** when it is not relevant.

### What you should see

A subtle confirmation and the next recommendation card in the queue.

**✅ Checkpoint:** The recommendation list updates after your action.

---

## Step 4: Refresh recommendations

### What we're doing

We pull new suggestions to keep the queue fresh.

### Action

Tap the Refresh button in Command Center to request new recommendation cards.

### What you should see

New recommendations load, with updated timestamps or content.

**✅ Checkpoint:** At least one new card appears.

---

## Testing Your Work

```bash
# Manual verification
# 1. Open Command Center
# 2. Accept and decline at least one card
# 3. Refresh recommendations
```

### Expected result

- [ ] Recommendation cards render with confidence signals
- [ ] Accept/Decline actions move you through the queue
- [ ] Refresh fetches new suggestions

---

## Troubleshooting

### Problem: No recommendations appear

**Symptom:** The list is empty.

#### Solution

- Confirm seed data exists in `apps/mobile/utils/seedData.ts`.
- Restart Expo and reopen Command Center.

---

## Assumptions

- Command Center is available in the main navigation.
- Sample recommendations exist in seed data or your account.

## How to Verify

```bash
# Manual verification checklist
# - Navigate to Command Center
# - View at least one recommendation card
# - Accept and decline actions update the list
```

---

*Last Updated: 2026-01-21*

