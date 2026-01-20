# [Module Name]

**Location:** `[path/to/module/]`  
**Language:** [Primary language(s)]  
**Framework:** [Main framework or runtime]  
**Status:** [Active | Deprecated | Experimental]

## Plain English Summary

[2-3 sentences explaining what this module does and why it exists. Write for someone who has never seen the codebase before.]

## Purpose

### What This Module Does
[Describe the primary responsibilities]

### What This Module Does NOT Do
[Explicitly state what's out of scope]

### Key Use Cases
1. [Use case 1]
2. [Use case 2]
3. [Use case 3]

## Technical Detail

### Architecture Overview

```
[module-name]/
├── src/
│   ├── components/     # [Description]
│   ├── services/       # [Description]
│   ├── utils/          # [Description]
│   └── types/          # [Description]
├── tests/
├── package.json
└── tsconfig.json
```

### Key Components

#### Component 1: [Name]
**Location:** `[path/to/component]`  
**Purpose:** [What it does]  
**Interface:**
```typescript
// Example interface or key functions
export interface Example {
  // ...
}
```

#### Component 2: [Name]
**Location:** `[path/to/component]`  
**Purpose:** [What it does]  
**Interface:**
```typescript
// Example interface or key functions
```

### Data Flow

```
[User/System] → [Component A] → [Component B] → [Result]
```

[Explain the typical flow of data through this module]

### State Management

[How does this module manage state? Redux? Context? Local state?]

### Error Handling

[How does this module handle and propagate errors?]

## APIs and Interfaces

### Public API

#### Exported Functions
```typescript
// List key exported functions with signatures
export function keyFunction(param: Type): ReturnType;
```

#### Exported Types
```typescript
// List key exported types
export interface ImportantType {
  // ...
}
```

### Internal APIs

[Document internal APIs if they're used by other parts of this module]

### Events

[If this module emits or listens for events, document them]

| Event Name | Payload | When Fired |
|------------|---------|------------|
| `event:name` | `{ data }` | When X happens |

## Dependencies

### External Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `package-name` | `^1.0.0` | [Why we use it] |

### Internal Dependencies

- `../shared/utils` - [What we use from it]
- `../shared/types` - [What types we import]

### Dependency Rationale

[Explain why major dependencies were chosen. Link to ADRs if applicable.]

## Build and Deploy

### Build Process

```bash
# Install dependencies
npm install

# Build for development
npm run build:dev

# Build for production
npm run build

# Run tests
npm test
```

### Configuration

**Environment Variables:**
```bash
MODULE_VAR_1=value    # [Description]
MODULE_VAR_2=value    # [Description]
```

**Configuration Files:**
- `config/[file].json` - [Purpose]
- `.env.example` - [Purpose]

### Deployment

[How is this module deployed? Is it bundled? Served separately?]

```bash
# Deployment commands
npm run deploy
```

## Common Tasks

### Task 1: [Common Task Name]

**Goal:** [What this accomplishes]

**Steps:**
```bash
# Step 1
command-one

# Step 2
command-two
```

### Task 2: [Another Common Task]

**Goal:** [What this accomplishes]

**Steps:**
```bash
# Commands
```

## Testing

### Test Structure

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
└── fixtures/       # Test data
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- path/to/test.spec.ts

# Run with coverage
npm run test:coverage
```

### Test Coverage Goals

- **Unit Tests:** [Target %]
- **Integration Tests:** [Target %]
- **E2E Tests:** [Target %]

## Performance Considerations

### Performance Characteristics
- [Metric 1]: [Expected value]
- [Metric 2]: [Expected value]

### Optimization Strategies
1. [Strategy 1]
2. [Strategy 2]

### Known Performance Issues
- [Issue 1]: [Description and mitigation]

## Assumptions

- **Assumption 1:** [What we assume to be true]
  - *If false:* [What happens and what to do]
- **Assumption 2:** [Another assumption]
  - *If false:* [Impact and response]
- **Assumption 3:** [Third assumption]
  - *If false:* [Impact and response]

## Failure Modes

### Failure Mode 1: [Name]
- **Symptom:** [How this failure manifests]
- **Impact:** [Effect on system/users]
- **Detection:** [How to detect this failure]
- **Mitigation:** [How to prevent or recover]
- **Monitoring:** [Metrics or logs to watch]

### Failure Mode 2: [Name]
- **Symptom:** [How this failure manifests]
- **Impact:** [Effect on system/users]
- **Detection:** [How to detect this failure]
- **Mitigation:** [How to prevent or recover]
- **Monitoring:** [Metrics or logs to watch]

### Failure Mode 3: [Name]
- **Symptom:** [How this failure manifests]
- **Impact:** [Effect on system/users]
- **Detection:** [How to detect this failure]
- **Mitigation:** [How to prevent or recover]
- **Monitoring:** [Metrics or logs to watch]

## How to Verify

### Manual Verification
```bash
# Commands to verify module is working correctly
npm run verify
```

### Automated Checks
- [ ] All tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] Linting passes: `npm run lint`
- [ ] Type checking passes: `npm run type-check`

### Success Criteria
1. [Measurable criterion 1]
2. [Measurable criterion 2]
3. [Measurable criterion 3]

### Health Check

```bash
# Command to check module health
npm run health-check
```

## Troubleshooting

### Problem 1: [Common Issue]
**Symptoms:** [What you see]  
**Cause:** [Why it happens]  
**Solution:**
```bash
# Fix commands
```

### Problem 2: [Another Common Issue]
**Symptoms:** [What you see]  
**Cause:** [Why it happens]  
**Solution:**
```bash
# Fix commands
```

## Migration and Upgrade Guides

### Upgrading from Version X to Y

[If applicable, document breaking changes and migration steps]

## Security Considerations

- [Security consideration 1]
- [Security consideration 2]
- [Link to threat model if applicable]

## Related Documentation

- [Architecture Diagram](../architecture/c4/level-2-container.md) - [Specific section]
- [API Documentation](../apis/[related-api].md) - [How they relate]
- [ADR](../decisions/NNNN-decision-name.md) - [Relevant decision]
- [Tutorial](../diataxis/tutorials/[tutorial-name].md) - [Related guide]

## Maintenance and Support

### Module Owner
- **Team:** [Team name]
- **Primary Contact:** [Name/Role]
- **Slack Channel:** #[channel-name]

### SLA Commitments
- [Response time commitments]
- [Availability targets]

### Deprecation Policy

[If this module might be deprecated, document the policy]

## Notes

[Any additional context, historical notes, or gotchas that don't fit elsewhere]

## References

- [Link to external documentation]
- [Link to related projects]
- [Link to research or RFCs]
