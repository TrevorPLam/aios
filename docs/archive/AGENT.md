# AGENT.md (Folder-Level Guide)

## Purpose of this folder

The `docs/` folder contains all documentation for the repository, including:
- Architecture documentation
- API documentation
- User guides
- Process documentation
- Decision records (ADRs)
- Standards and guidelines

Documentation helps developers and agents understand the system, make decisions, and maintain consistency.

## What agents may do here

- **Create documentation** for new features, APIs, or processes
- **Update documentation** to reflect code changes (Principle 19: docs age with code)
- **Fix documentation errors** or outdated information
- **Add examples** when code changes (Principle 20: examples are contracts)
- **Create ADRs** (Architecture Decision Records) for architectural decisions
- **Follow documentation standards** in `/.repo/docs/standards/`

## What agents may NOT do

- **Modify code through documentation** - Documentation describes code, it doesn't change it
- **Create documentation without corresponding code** - Docs must reflect reality
- **Skip updating docs when code changes** - Documentation must age with code
- **Ignore documentation standards** - Follow established formats and structures

## Documentation Principles

From `/.repo/policy/PRINCIPLES.md`:
- **Principle 19**: Documentation ages with code - update docs when code changes
- **Principle 20**: Examples are contracts - update examples when code changes
- **Principle 8**: Read repo first - check existing docs before creating new ones

## Required links

- Refer to higher-level policy:
  - `/.repo/policy/PRINCIPLES.md` - Operating principles (especially P19, P20)
  - `/.repo/policy/CONSTITUTION.md` - Fundamental rules
  - `/.repo/docs/standards/` - Documentation standards (if exists)

## Documentation Types

### Architecture Documentation
- System design and structure
- Component relationships
- Data flows and interactions

### API Documentation
- Endpoint definitions
- Request/response schemas
- Authentication requirements

### Process Documentation
- Development workflows
- Deployment procedures
- Testing strategies

### ADRs (Architecture Decision Records)
- Significant architectural decisions
- Cross-feature dependencies
- Boundary exceptions

## Documentation Standards

When creating documentation:
- Include filepaths to relevant code
- Use plain English for clarity
- Include examples when helpful
- Keep documentation up-to-date with code
- Follow existing documentation patterns

## When in Doubt

- Check existing documentation for patterns
- Reference `/.repo/policy/PRINCIPLES.md` for documentation principles
- Update related docs when making code changes
- Create HITL item if documentation requirements are unclear
