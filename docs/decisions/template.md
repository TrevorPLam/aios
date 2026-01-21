# [NUMBER]. [TITLE]

 **Status:** [Proposed | Accepted | Deprecated | Superseded]
**Date:** YYYY-MM-DD
**Deciders:** [List names/roles]
**Technical Story:** [Link to issue/ticket]

## Plain English Summary

[2-3 sentences explaining what this decision is about in simple terms that any team member can understand]

## Context

What is the issue that we're seeing that is motivating this decision or change?

### Forces at Play

- [Describe the forces/factors influencing this decision]
- [Technical constraints, business requirements, team capabilities, etc.]

## Decision

What is the change that we're proposing and/or doing?

### Alternatives Considered

#### Option 1: [Name]

### Pros

- [Advantage]

### Cons

- [Disadvantage]

#### Option 2: [Name]

### Pros (2)

- [Advantage]

### Cons (2)

- [Disadvantage]

### Chosen Solution

[Describe the chosen option and why]

## Technical Detail

### Implementation Approach

[Detailed technical explanation of how this will be implemented]

### Components Affected

- `client/` - [How client is affected]
- `server/` - [How server is affected]
- `shared/` - [How shared code is affected]

### Code Examples

```typescript
// Example demonstrating the decision
```text

### Migration Path

1. [Step one]
2. [Step two]

## Assumptions

- **Assumption 1:** [What we're assuming to be true]
  - *If false:* [What happens and what to do]
- **Assumption 2:** [Another assumption]
  - *If false:* [Impact and response]

## Consequences

### Positive

- [Good consequence]

### Negative

- [Bad consequence or trade-off]

### Neutral

- [Neither good nor bad, just different]

## Failure Modes

### Failure Mode 1: [Name]

- **Symptom:** [How this failure manifests]
- **Impact:** [Effect on system/users]
- **Detection:** [How to detect this failure]
- **Mitigation:** [How to prevent or recover]

### Failure Mode 2: [Name]

- **Symptom:** [How this failure manifests]
- **Impact:** [Effect on system/users]
- **Detection:** [How to detect this failure]
- **Mitigation:** [How to prevent or recover]

## How to Verify

### Manual Verification

```bash
# Commands to verify the decision is implemented correctly
npm run test:integration
```text

### Automated Checks

- [ ] Unit tests pass: `npm test`
- [ ] Integration tests pass: `npm run test:integration`
- [ ] Linting passes: `npm run lint`
- [ ] Build succeeds: `npm run build`

### Success Criteria

1. [Measurable criterion 1]
2. [Measurable criterion 2]

## Decision-to-Docs Binding

This section explicitly links this architectural decision to its supporting documentation.

### Primary Documentation

- **Architecture:** [Link to C4 or Arc42 section this affects]
- **Module Docs:** [Link to affected module documentation]
- **API Contracts:** [Link to OpenAPI specs or API docs]

### Related ADRs

- [ADR-XXXX](./XXXX-title.md) - [How it relates]

### Tutorial/How-To Updates Required

- [ ] [Tutorial name](../diataxis/tutorials/tutorial-name.md) - [What needs updating]
- [ ] [How-to guide](../diataxis/how-to-guides/guide-name.md) - [What needs updating]

### Explanation Updates Required

- [ ] [Concept explanation](../diataxis/explanation/concept-name.md) - [What needs updating]

### Reference Updates Required

- [ ] [API reference](../apis/openapi/openapi.yaml) - [What needs updating]
- [ ] [Module reference](../modules/module-name.md) - [What needs updating]

### Documentation Review Checklist

- [ ] All linked documentation has been updated
- [ ] New examples reflect this decision
- [ ] Deprecated patterns are marked as such
- [ ] Migration guides are created if needed
- [ ] Glossary terms are updated

## Compliance and Governance

### Security Impact

- [Describe any security implications]
- [Link to threat model updates if needed]

### Privacy Impact

- [Describe any privacy implications]

### Accessibility Impact

- [Describe any accessibility implications]

## Notes

[Additional notes, references, or context]

## References

- [Link to relevant resources]
- [Research papers, blog posts, etc.]
