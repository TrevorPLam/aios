# [Concept/Decision/Architecture] Explained

> **Type:** Explanation (Understanding-Oriented)
> **Audience:** Architects, senior developers
> **Purpose:** Deep understanding of [topic]

## Plain English Summary

- This document explains why we chose [decision/architecture]
- You'll understand the reasoning, trade-offs, and alternatives we considered
- This is about understanding "why" and "how it works" - not step-by-step instructions
- If you need to implement something, see [How-To link]
- If you need specific details, see [Reference link]
- If you're learning basics, see [Tutorial link]

## Context

[Describe the situation or problem that led to this decision/design]

### Background

- [Historical context #1]
- [Historical context #2]
- [Business/technical constraints]

### Problem Statement

[What problem were we trying to solve?]

---

## The Decision/Design

[Explain what we chose to do]

### Summary

[1-2 sentences on the high-level approach]

#### Key Principles

1. [Principle #1] - [Why it matters]
2. [Principle #2] - [Why it matters]
3. [Principle #3] - [Why it matters]

---

## How It Works

[Explain the mechanism/architecture in depth]

### Component 1: [Name]

[Detailed explanation of this component]

### Responsibilities

- [Responsibility #1]
- [Responsibility #2]

### Interactions

- Calls: [what it calls]
- Called by: [what calls it]
- Data flow: [how data flows]

### Component 2: [Name]

[Continue for all major components...]

### Diagram

```mermaid
graph TD
 A[Component 1] --> | data | B[Component 2]
    B --> C[Component 3]
 C --> | result | A
```text

[Or link to architecture diagram]

---

## Why This Approach

### Rationale

#### We chose this because
1. [Reason #1] - [Explanation with evidence]
2. [Reason #2] - [Explanation with evidence]
3. [Reason #3] - [Explanation with evidence]

### Key Benefits
- ✅ [Benefit #1] - [Why it matters]
- ✅ [Benefit #2] - [Why it matters]
- ✅ [Benefit #3] - [Why it matters]

### Trade-offs Accepted
- ⚠️ [Trade-off #1] - [Why acceptable]
- ⚠️ [Trade-off #2] - [Why acceptable]

---

## Alternatives Considered

### Alternative A: [Approach Name]

#### Description
[What this alternative was]

### Pros
- [Advantage #1]
- [Advantage #2]

### Cons
- [Disadvantage #1]
- [Disadvantage #2]

### Why we didn't choose it
[Explanation]

---

### Alternative B: [Approach Name]

#### Description (2)
[What this alternative was]

### Pros (2)
- [Advantage #1]

### Cons (2)
- [Disadvantage #1]

### Why we didn't choose it (2)
[Explanation]

---

## Trade-offs and Compromises

### Trade-off 1: [Name]

**Situation:** [Describe the trade-off]

**We chose:** [Option A over Option B]

**Because:** [Reasoning]

### Impact
- On performance: [Impact]
- On developer experience: [Impact]
- On users: [Impact]

---

### Trade-off 2: [Name]

[Continue pattern...]

---

## Implications

### For Developers

#### What this means for you
- [Implication #1]
- [Implication #2]
- [Implication #3]

### Development patterns to follow
- [Pattern #1]
- [Pattern #2]

---

### For Users

#### User experience implications
- [Impact #1]
- [Impact #2]

---

### For Operations

#### Operational implications
- [Impact #1]
- [Impact #2]

---

## Edge Cases and Limitations

### Limitation 1: [Name]

**What it is:** [Describe limitation]

**Why it exists:** [Reason]

**Workaround:** [How to work around it]

**Future:** [Will it be fixed? When?]

---

### Limitation 2: [Name]

[Continue pattern...]

---

## Historical Context

### Evolution

**Phase 1:** [Original approach]

- Used from: [date/version]
- Why: [reasoning]

**Phase 2:** [First iteration]

- Changed to: [new approach]
- Why: [reasoning]
- Migration: [how we transitioned]

**Phase 3 (Current):** [Current approach]

- Changed to: [new approach]
- Why: [reasoning]
- Migration: [how we transitioned]

### Lessons Learned

- [Lesson #1]
- [Lesson #2]
- [Lesson #3]

---

## Related Concepts

### Builds On

- [Foundational concept #1] - [Why relevant]
- [Foundational concept #2] - [Why relevant]

### Related To

- [Related concept #1] - [Connection]
- [Related concept #2] - [Connection]

### Enables

- [What this makes possible #1]
- [What this makes possible #2]

---

## Examples in Practice

### Example 1: [Scenario]

**Situation:** [Concrete scenario]

### How the design handles it
[Detailed walkthrough]

**Result:** [Outcome]

---

### Example 2: [Scenario]

[Continue pattern...]

---

## Future Considerations

### Potential Evolution

#### What might change
- [Possible change #1] - [Why/when]
- [Possible change #2] - [Why/when]

### What will remain stable
- [Stable aspect #1] - [Why]
- [Stable aspect #2] - [Why]

### Migration Paths

If we need to change this in the future:

1. [Step 1]
2. [Step 2]
3. [Step 3]

---

## Decision Log

**Decision Date:** [Date]
**Decided By:** [People/role]
**Documented In:** [ADR link if applicable]
**Status:** [Active/Deprecated/Superseded]

### Stakeholders
- [Stakeholder #1] - [Role]
- [Stakeholder #2] - [Role]

### Review Schedule
- Next review: [Date]
- Review frequency: [Quarterly/Annually/etc]

---

## Related Documentation

### ADRs
- [ADR that formalized this decision]

### Reference
- [API/component reference]

### How-To
- [How to implement using this design]

### Tutorial
- [Learning resource]

### Architecture
- [Higher-level architecture doc]
- [C4 diagrams]

---

## Assumptions

- [Assumption #1]
- [Assumption #2]
- [Assumption #3]

## Failure Modes

| Failure | Cause | Mitigation |
| --------- | ------- | ------------ |
| [Failure] | [Why it happens] | [What we do] |

## How to Verify

### Verify understanding
- Can you explain why we chose this approach?
- Can you describe the trade-offs?
- Can you name the alternatives considered?

### Verify implementation
```bash
# Check if implementation matches design
[commands to inspect]
```text

---

## Discussion

### Open Questions
- [Question #1 that remains]
- [Question #2 that remains]

### Known Issues
- [Issue #1] - [Status/plan]
- [Issue #2] - [Status/plan]

---

**HIGH LEVERAGE:** Understanding "why" prevents cargo-culting and enables informed decisions when extending or modifying the system. This explanation captures institutional knowledge that would otherwise live only in maintainers' heads.

**CAPTION:** This deep-dive explanation ensures that future contributors understand not just "what" we built, but "why" we built it this way. The alternatives and trade-offs are explicitly documented so future decisions can reference this reasoning.

---

*Last Updated: [Date]*
*Reviewers: [Names]*
*Discussion: [Link to original discussion/RFC]*
