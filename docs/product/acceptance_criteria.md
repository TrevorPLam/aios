# Acceptance Criteria Guidelines

## Plain English Summary

Acceptance criteria define when a feature is "done". They're testable conditions that must be met before we can ship. Write them in Given-When-Then format for clarity.

## Format

```gherkin
Given [initial context/state]
When [action is performed]
Then [expected outcome]
```text

## Example: User Registration

```gherkin
Scenario: Successful registration
  Given I am a new user on the registration screen
  When I enter valid email "test@example.com"
  And I enter valid password "SecurePass123!"
  And I tap "Register"
  Then I see email verification screen
  And I receive verification email within 1 minute

Scenario: Invalid email
  Given I am on the registration screen
  When I enter invalid email "notanemail"
  And I tap "Register"
  Then I see error "Please enter a valid email"
  And I remain on registration screen

Scenario: Weak password
  Given I am on the registration screen
  When I enter valid email "test@example.com"
  And I enter weak password "123"
  Then I see error "Password must be at least 8 characters"
  And I remain on registration screen
```text

## Best Practices

### DO

- ✅ Be specific and measurable
- ✅ Cover happy path and edge cases
- ✅ Include error scenarios
- ✅ Define expected behavior clearly
- ✅ Make testable by QA

### DON'T

- ❌ Be vague ("works well")
- ❌ Include implementation details
- ❌ Forget edge cases
- ❌ Write novels (keep concise)

## Related

- [PRD Template](./prd_template.md)
- [User Journeys](./user_journeys.md)
- [Testing Strategy](../testing/strategy.md)
