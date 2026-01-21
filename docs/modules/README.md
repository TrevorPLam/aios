# Module Documentation

## Plain English Summary

This directory contains detailed documentation for each major module in the AIOS system. Think of modules as the main building blocks of our application - the mobile app (client), the server API (server), and code used by both (shared).

## Technical Detail

The AIOS system is organized into three main modules:

```text
/home/runner/work/Mobile-Scaffold/Mobile-Scaffold/
├── client/          # React Native mobile application
├── server/          # Node.js/Express backend API
└── shared/          # TypeScript code shared between client and server
```text

Each module has its own:

- Dependencies (`package.json`)
- Build configuration
- Test suite
- Type definitions
- Documentation

### Module Documentation Structure

Each module document follows this structure:

- **Purpose** - What the module does
- **Architecture** - How it's structured
- **Key Components** - Main pieces and their responsibilities
- **APIs** - Interfaces exposed to other modules
- **Dependencies** - External packages and internal dependencies
- **Build & Deploy** - How to build, test, and deploy
- **Common Tasks** - Frequently performed operations
- **Failure Modes** - What can go wrong and how to fix it

## Available Module Documentation

| Module | Description | Document |
| -------- | ------------- | ---------- |
| **Client** | React Native mobile app (iOS/Android) | [client.md](./client.md) |
| **Server** | Node.js/Express REST API backend | [server.md](./server.md) |
| **Shared** | TypeScript utilities, types, validators | [shared.md](./shared.md) |

## Assumptions

- **Assumption 1:** Each module maintains clear boundaries with documented interfaces
  - *If false:* Refactor to clarify module boundaries and update documentation
- **Assumption 2:** Shared code is truly reusable between client and server
  - *If false:* Move module-specific code out of `shared/` into respective modules
- **Assumption 3:** Modules can be built and tested independently
  - *If false:* Document dependencies and required build order

## Failure Modes

### Failure Mode 1: Circular Dependencies

- **Symptom:** Build fails with "cannot resolve module" or infinite import loops
- **Impact:** Cannot build or run the application
- **Detection:** Build errors, TypeScript compiler errors
- **Mitigation:**
  - Run `npm run lint` to detect circular dependencies
  - Use `madge` to visualize dependency graph: `npx madge --circular --extensions ts,tsx ./`
  - Refactor to break cycles using dependency inversion

### Failure Mode 2: Version Mismatches

- **Symptom:** Shared code behaves differently in client vs server
- **Impact:** Subtle bugs, inconsistent validation, data corruption
- **Detection:** Integration tests fail, production errors
- **Mitigation:**
  - Keep `shared/` version synchronized across modules
  - Use workspace features to manage shared dependencies
  - Test shared code in both contexts

### Failure Mode 3: Documentation Drift

- **Symptom:** Documentation doesn't match actual module structure
- **Impact:** Developers make incorrect assumptions, onboarding is confusing
- **Detection:** PR reviews catch discrepancies
- **Mitigation:**
  - Update module docs when making structural changes
  - Include doc updates in PR checklist
  - Regular documentation audits

## How to Verify

### Manual Verification

```bash
# Verify all modules can be built independently
cd client && npm run build
cd ../server && npm run build
cd ../shared && npm run build

# Check for circular dependencies
npx madge --circular --extensions ts,tsx ./client/
npx madge --circular --extensions ts,tsx ./server/
npx madge --circular --extensions ts,tsx ./shared/

# Verify documentation exists
ls -la docs/modules/*.md
```text

### Automated Checks

- [ ] All modules build successfully: `npm run build`
- [ ] All module tests pass: `npm test`
- [ ] No circular dependencies detected
- [ ] Module documentation files exist for client, server, shared

### Success Criteria

1. Each module can be built independently
2. Module boundaries are clear and documented
3. Shared code works consistently in all contexts
4. New developers can understand module structure from documentation

## Creating New Modules

If you need to add a new module:

1. **Copy the template:**

   ```bash
   cp docs/modules/_template.md docs/modules/new-module-name.md
   ```text

1. **Fill in all sections:**
   - Replace placeholders with actual information
   - Include concrete examples from your module
   - Document all failure modes you can think of

2. **Update this README:**
   - Add your module to the table above
   - Update any affected diagrams or lists

3. **Link from other docs:**
   - Update architecture diagrams
   - Reference from API documentation
   - Link from tutorials if relevant

## Related Documentation

- [Architecture Overview](../architecture/README.md) - System-wide architecture
- [API Documentation](../apis/README.md) - REST API contracts
- [Data Models](../data/README.md) - Database schemas and data structures
- [Diataxis Tutorials](../diataxis/tutorials/) - Step-by-step guides using these modules
- [ADR Index](../decisions/README.md) - Decisions affecting module design

## Notes

Module documentation should be:

- **Practical** - Focus on what developers need to know to work with the module
- **Current** - Update when module structure changes
- **Specific** - Include actual file paths, commands, and examples
- **Honest** - Document limitations and known issues

Think of module docs as the "tour guide" for a specific part of the codebase.
