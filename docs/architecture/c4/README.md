# C4 Model Documentation

## Plain English Summary

The C4 model is a way to visualize software architecture at different levels of detail, like zooming in on a map. This documentation shows AIOS (AI Operating System) from four perspectives: the big picture (who uses it), the major parts (mobile app, server, database), the internal components (how each part is organized), and how it's deployed. Each diagram gets progressively more detailed, helping different audiences understand the system at the right level for their needs.

## Technical Detail

### What is the C4 Model?

The C4 model breaks down software architecture into four hierarchical levels:

1. **Level 1 - System Context**: Shows the system's place in the world - who uses it and what it connects to
2. **Level 2 - Container**: Shows the high-level technical building blocks (applications, databases, file systems)
3. **Level 3 - Component**: Shows the internal structure of containers (modules, classes, services)
4. **Level 4 - Code**: (Optional) Shows implementation details at the class/function level

### AIOS C4 Documentation Structure

```text
docs/architecture/c4/
├── README.md                    # This file - overview and reading guide
├── system_context.md            # Level 1: System in context
├── container.md                 # Level 2: Containers (app, API, DB)
├── component.md                 # Level 3: Components within containers
├── deployment.md                # Deployment architecture
└── diagrams/
    ├── README.md               # How to edit diagrams
    └── *.mmd                   # Mermaid diagram sources (embedded in docs)
```text

### Reading the Diagrams

All diagrams use Mermaid syntax and render directly in GitHub. Each diagram follows consistent conventions:

### Notation
- **Rectangles**: Software systems, containers, or components
- **Cylinders/Databases**: Data stores
- **Persons/Actors**: Human users or external systems
- **Arrows**: Dependencies, data flow, or interactions
- **Labels**: Technology choices, protocols, or descriptions

### Color Coding
- Blue: Internal AIOS components
- Gray: External systems
- Green: Data stores
- Orange: User interfaces

### How to Use This Documentation

#### For Different Audiences
| Audience | Start With | Focus On |
| ---------- | ----------- | ---------- |
| Business stakeholders | System Context | Who uses the system, what value it provides |
| Architects | All levels | Overall structure and key decisions |
| Developers | Container + Component | Technical structure and responsibilities |
| DevOps/SRE | Deployment | Runtime environment and infrastructure |
| Security engineers | All levels | Trust boundaries, data flow, attack surface |

### Navigation
1. Start with [System Context](./system_context.md) for the 30,000-foot view
2. Drill into [Container](./container.md) to see major technical components
3. Explore [Component](./component.md) for internal architecture details
4. Review [Deployment](./deployment.md) for runtime environment

### Diagram Maintenance

All diagrams are embedded in their respective markdown files using Mermaid syntax. To update:

1. Edit the markdown file containing the diagram
2. Modify the Mermaid code block
3. Preview locally with VS Code + Mermaid extension, or push to GitHub to see rendered
4. See [diagrams/README.md](./diagrams/README.md) for detailed editing instructions

## Assumptions

1. **Single-tenant architecture**: Each user has their own isolated data, no multi-tenancy at the database level
2. **Stateless API**: The Express server doesn't maintain session state; authentication is via JWT tokens
3. **Mobile-first design**: The primary interface is the React Native mobile app; web support is secondary
4. **Development environment**: Diagrams reflect both local development and production deployment patterns
5. **PostgreSQL as single source of truth**: AsyncStorage is used for offline caching but PostgreSQL is authoritative
6. **Synchronous HTTP**: Real-time features (if any) are not yet implemented; all communication is request-response
7. **Monolithic deployment**: Client and server are separate but deployed as single units (not microservices)

## Failure Modes

### Documentation Drift

**Problem**: Diagrams become outdated as code evolves.

### Symptoms
- Diagrams show modules or components that no longer exist
- New features aren't reflected in architecture documentation
- Technology stack changes aren't updated

### Mitigation
- Review and update diagrams during major feature additions
- Include architecture review in PR checklists for significant changes
- Tag documentation issues when code changes affect architecture

### Over-complexity

**Problem**: Diagrams become too detailed and hard to understand.

### Symptoms (2)
- Single diagram tries to show too much information
- Arrows crisscross making relationships unclear
- Newcomers find diagrams overwhelming rather than helpful

### Mitigation (2)
- Follow C4 principle: each level should fit on one page
- Create separate focused diagrams for complex subsystems
- Use consistent abstraction levels within each diagram

### Under-specification

**Problem**: Diagrams are too abstract to be useful.

### Symptoms (3)
- Developers can't map diagrams to actual code
- Deployment diagrams don't reflect actual infrastructure
- Component boundaries don't match code organization

### Mitigation (3)
- Include file paths and concrete examples in documentation text
- Cross-reference actual code locations (see "How to Verify")
- Validate diagrams against running system

### Format Lock-in

**Problem**: Diagram format becomes difficult to maintain or doesn't render properly.

### Symptoms (4)
- Mermaid syntax errors prevent rendering
- GitHub stops supporting current diagram format
- Local editing becomes difficult

### Mitigation (4)
- Use standard Mermaid syntax (widely supported)
- Keep diagram source in markdown (plain text, VCS-friendly)
- Test rendering in multiple environments (GitHub, VS Code, local tools)

## How to Verify

### Documentation Accuracy

Verify that the C4 documentation matches the actual codebase:

```bash
# 1. Check that all referenced files exist
grep -r "apps/mobile/" docs/architecture/c4/*.md
grep -r "apps/api/" docs/architecture/c4/*.md
grep -r "packages/contracts/" docs/architecture/c4/*.md

# 2. Verify module screens exist
ls apps/mobile/screens/*Screen.tsx | wc -l  # Should match module count

# 3. Check API routes in server
 grep "app\.(get | post | put | delete)" apps/api/routes.ts | wc -l

# 4. Verify database tables
grep "pgTable" packages/contracts/schema.ts

# 5. Confirm authentication middleware exists
ls apps/api/middleware/auth.ts
```text

### Diagram Rendering

Verify diagrams render correctly:

1. **GitHub**: View any `.md` file in this directory on GitHub - Mermaid diagrams should render
2. **VS Code**: Install "Markdown Preview Mermaid Support" extension and preview any diagram file
3. **Command line**: Use `mmdc` (Mermaid CLI) to validate syntax:

   ```bash
   npm install -g @mermaid-js/mermaid-cli
   # Extract and validate a diagram
   mmdc -i docs/architecture/c4/system_context.md -o /tmp/test.png
   ```text

### Cross-Reference to Code

Each diagram document includes a "How to Verify" section with specific file paths. To verify:

```bash
# Example: Verify container diagram references
# Check mobile app entry point
cat apps/mobile/index.js

# Check server entry point
cat apps/api/index.ts

# Check database schema
cat packages/contracts/schema.ts | head -50

# Check authentication flow
cat apps/api/middleware/auth.ts
cat apps/mobile/lib/storage.ts  # JWT token storage
```text

### Completeness Check

Ensure all C4 levels are documented:

```bash
# All required files should exist
ls -1 docs/architecture/c4/
# Expected output
# README.md
# system_context.md
# container.md
# component.md
# deployment.md
# diagrams/

# Each doc should have required sections
for file in docs/architecture/c4/*.md; do
  echo "=== $file ==="
 grep "^## Plain English Summary" "$file" && echo "✓ Summary" |  | echo "✗ Missing Summary"
 grep "^## Technical Detail" "$file" && echo "✓ Technical" |  | echo "✗ Missing Technical"
 grep "^## Assumptions" "$file" && echo "✓ Assumptions" |  | echo "✗ Missing Assumptions"
 grep "^## Failure Modes" "$file" && echo "✓ Failure Modes" |  | echo "✗ Missing Failure Modes"
 grep "^## How to Verify" "$file" && echo "✓ Verification" |  | echo "✗ Missing Verification"
done
```text

## Related Documentation

- [System Context Diagram](./system_context.md) - Level 1 C4 model
- [Container Diagram](./container.md) - Level 2 C4 model
- [Component Diagram](./component.md) - Level 3 C4 model
- [Deployment Diagram](./deployment.md) - Infrastructure and runtime
- [Diagram Editing Guide](./diagrams/README.md) - How to maintain diagrams
- [../README.md](../README.md) - Architecture documentation overview
- [../../technical/](../../technical/) - Technical documentation

## Revision History

| Date | Author | Changes |
| ------ | -------- | --------- |
| 2025-01-17 | AI Assistant | Initial creation of comprehensive C4 model documentation |

