# Contributing to AIOS

Thank you for your interest in contributing to the AIOS monorepo! This document provides guidelines for contributing to this project.

## Quick Links

- [ALIGNMENT Contribution Guidelines](.alignment/CONTRIBUTING.md) - Comprehensive guide for ALIGNMENT contributions
- [Principles Workflow](.alignment/principles/PRINCIPLES-WORKFLOW.md) - Process for proposing new principles
- [Security Policy](SECURITY.md) - Security requirements and reporting

## Development Setup

### Prerequisites
- Git
- Node.js (for Turbo monorepo)
- pnpm (package manager)

### Quick Start
```bash
# Clone and setup
git clone <your-fork>
cd aios
make setup

# Verify everything works
make verify
```

### Project Structure
- `apps/` - Frontend applications (web, mobile-android, mobile-ios, mobile-shared)
- `packages/` - Shared libraries (api-sdk, config, contracts, features)
- `services/` - Backend services (api-gateway)
- Turbo monorepo with pnpm workspace configuration

## How to Contribute

### 1. Types of Contributions

We welcome contributions in several areas:

- **Web application features** - New features for apps/web (React/Vite)
- **Mobile applications** - Updates to mobile-android, mobile-ios, mobile-shared
- **Package libraries** - Shared TypeScript utilities and contracts
- **API services** - Improvements to services/api-gateway
- **Turbo configuration** - Build system optimizations and caching
- **Standards improvements** - Enhancements to existing standards in `.alignment/standards/`
- **Documentation fixes** - Typos, clarifications, or improvements

### 2. Contribution Process

#### For Small Changes (typos, small fixes)

1. Fork the repository
2. Create a branch: `git checkout -b fix/your-fix-name`
3. Make your changes
4. Commit with clear message: `git commit -m "Fix typo in Section 3"`
5. Push and create a Pull Request

#### For Larger Changes (new standards, principles, major updates)

1. **Open an issue first** to discuss the proposal
2. Wait for feedback and approval
3. Fork and create a feature branch
4. Implement changes following the guidelines below
5. Test your changes (run validation scripts if applicable)
6. Submit a Pull Request with detailed description

### 3. Standards for Contributions

#### Documentation Standards

- **Markdown format** - Use proper Markdown syntax
- **Consistent formatting** - Follow existing patterns in similar documents
- **Clear headings** - Use hierarchical heading structure (# → ## → ###)
- **Priority tiers** - Use P0/P1/P2 consistently
- **Cross-references** - Use relative links for internal references

#### Principle Document Standards

See [PRINCIPLES-WORKFLOW.md](.alignment/principles/PRINCIPLES-WORKFLOW.md) for detailed requirements:

- Must have clear "Core Principle" statement
- Include "Key Concepts" section
- List "Golden Rules"
- Reference external standards
- Define integration points with standards

#### Code/Script Standards

- **Shell scripts** - Follow bash best practices, include error handling
- **Documentation** - Include usage comments and examples
- **Testing** - Test scripts on multiple scenarios before submitting

### 4. Pull Request Guidelines

**PR Title Format:**
```
[Type] Brief description

Types: Fix, Feature, Docs, Refactor, Test, Tool
Examples:
- [Fix] Correct typo in Section 6
- [Feature] Add Testing Principles document
- [Docs] Improve Migration Guide clarity
- [Tool] Enhance validation script for Section 10
```

**PR Description Should Include:**
- **What changed** - Summary of changes
- **Why** - Rationale for the change
- **Testing** - How you tested the changes
- **Related issues** - Link to any related issues
- **Breaking changes** - Call out any breaking changes

### 5. Review Process

1. **Automated checks** - PRs will be validated by CI/CD
2. **Maintainer review** - A maintainer will review your PR
3. **Feedback** - Address any feedback or requested changes
4. **Approval** - Once approved, your PR will be merged
5. **Release** - Changes will be included in the next version release

### 6. Community Guidelines

- **Be respectful** - Treat all contributors with respect
- **Be constructive** - Provide actionable feedback
- **Be patient** - Maintainers are volunteers
- **Be open** - Consider alternative viewpoints
- **Follow CoC** - Adhere to the Code of Conduct (if added)

### 7. Getting Help

- **Questions** - Open a GitHub Discussion or Issue
- **Clarifications** - Ask in your PR or Issue
- **Documentation** - Check [FAQ](.alignment/supporting/FAQ.md) first

## Recognition

Contributors will be recognized in:
- Release notes for significant contributions
- CHANGELOG.md for all merged PRs
- GitHub contributors page

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Ready to contribute?** Check out our [Issues](../../issues) for good first issues tagged with `good-first-issue` or `help-wanted`.
