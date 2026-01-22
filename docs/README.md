# AIOS Documentation Home

## Welcome to the AIOS Documentation System

This is the central hub for all documentation in the AIOS (AI Operating System) repository. Whether you're a new contributor, experienced developer, product manager, or curious user, this guide will help you find what you need.

## Plain English Summary

- This documentation follows **Diátaxis framework**: tutorials (learning), how-to guides (tasks), reference (facts), and explanation (understanding)
- All documentation is **version-controlled** and lives alongside the code
- **Automated quality gates** ensure docs stay accurate, readable, and linked correctly
- Documentation is **required for all code changes** - no exceptions
- We use **evidence-based documentation**: concrete file paths, commands, and examples over abstract descriptions
- **Plain English first**: every document starts with a non-technical summary
- Documentation is a **product**, not an afterthought - it's tested, linted, and reviewed like code

## 🚀 Quick Start

### I want to

| Goal | Start Here |
| ------ | ----------- |
| Understand what AIOS is | [Project README](../README.md) |
| Set up the development environment | [Getting Started Tutorial](./diataxis/tutorials/getting-started.md) |
| Contribute code or docs | [CONTRIBUTING.md](../CONTRIBUTING.md) |
| Understand governance & constitution | [Governance Constitution](./governance/constitution.md) ⭐ **NEW** |
| Review governance implementation | [Governance Implementation Report](./governance_implementation_report.md) ⭐ **NEW** |
| Find a specific API | [API Reference](./apis/README.md) |
| Understand architecture decisions | [ADR Index](./decisions/README.md) |
| Learn about a module | [Module Documentation](./modules/README.md) |
| Fix a production issue | [Operations Runbooks](./operations/runbooks/README.md) |
| Report a security issue | [SECURITY.md](../SECURITY.md) |
| See what's coming next | [Roadmap](./roadmaps/roadmap.md) |

## 📚 Documentation Structure

Our documentation is organized following the **Diátaxis framework** for clarity and findability:

### 1. **Learning-Oriented (Tutorials)**

*Location: `docs/diataxis/tutorials/`*

Step-by-step lessons for newcomers. Start here if you're new.

- Getting started with AIOS development
- Building your first module
- Setting up testing environment

### 2. **Task-Oriented (How-To Guides)**

*Location: `docs/operations/runbooks/` and module-specific guides*

Practical steps to accomplish specific goals.

- How to add a new module
- How to debug React Native issues
- How to deploy to production

### 3. **Understanding-Oriented (Explanation)**

*Location: `docs/architecture/`, `docs/decisions/`*

Conceptual clarity on how things work and why.

- [Architecture Overview](./architecture/README.md)
- [Architecture Decision Records](./decisions/README.md)
- [Security Model](./security/threat_model.md)

### 4. **Information-Oriented (Reference)**

*Location: `docs/apis/`, `docs/modules/`, technical specs*

Dry, accurate facts. Look things up here.

- [API Documentation](./apis/README.md)
- [Module Reference](./modules/README.md)
- [Glossary](./glossary.md)

## 🗺️ Complete Navigation Map

### Core Documentation

```text
docs/
├── README.md (you are here)
├── INDEX.md (legacy index, see this file instead)
├── glossary.md
│
├── diataxis/                    # Framework rules & templates
│   ├── rules.md
│   └── templates/
│
├── architecture/                # System design & decisions
│   ├── README.md
│   ├── c4/                     # C4 model diagrams
│   ├── arc42/                  # arc42 documentation spine
│   └── diagrams/               # Visual diagrams (existing)
│
├── decisions/                  # Architecture Decision Records
│   ├── README.md
│   └── [numbered ADRs]
│
├── modules/                    # Module-specific documentation
│   ├── README.md
│   ├── client/
│   ├── server/
│   └── shared/
│
├── apis/                       # API contracts & specs
│   ├── README.md
│   └── openapi/
│
├── data/                       # Data models & schemas
│   ├── README.md
│   └── schemas/
│
├── operations/                 # Production operations
│   ├── README.md
│   ├── runbooks/
│   ├── oncall/
│   └── observability/
│
├── security/                   # Security documentation
│   ├── threat_model.md
│   ├── secrets_handling.md
│   └── dependency_policy.md
│
├── testing/                    # Testing strategy
│   ├── strategy.md
│   ├── test_pyramid.md
│   └── quality_gates.md
│
├── product/                    # Product documentation
│   ├── README.md
│   ├── user_journeys.md
│   └── acceptance_criteria.md
│
├── ai/                         # AI-assisted development
│   ├── README.md
│   ├── ai_contribution_policy.md
│   └── prompting_playbook.md
│
└── roadmaps/                   # Future plans
    ├── roadmap.md
    └── decisions_backlog.md
```text

## 🔧 How Documentation Works

### Docs-as-Code Principles

1. **Documentation lives in Git**
   - Versioned alongside code
   - Reviewed in pull requests
   - Tracked in CHANGELOG.md

2. **Automated Quality Gates**
   - **Vale:** Prose linting for clear, consistent writing
   - **Markdownlint:** Formatting consistency
   - **Link checker:** Prevents broken links
   - **API linting:** OpenAPI contract validation

3. **Required for All Changes**
   - Pull request template requires doc updates
   - CI fails if docs are missing or broken
   - Code review includes doc review

4. **Evidence-Based**
   - Reference concrete file paths: `client/screens/CommandCenter.tsx`
   - Include runnable commands: `npm run test`
   - Link to actual code, not just descriptions
   - Show example output

### Documentation Site

We use **MkDocs** with Material theme to generate a searchable, browsable documentation site from these markdown files.

### Build locally
```bash
# Install MkDocs
pip install mkdocs-material

# Serve locally
mkdocs serve

# Build static site
mkdocs build
```text

**View online:** *(TODO: Add deployment URL)*

## ✍️ Contributing to Documentation

### Before You Write

1. **Check if doc already exists**: Search this README and [INDEX.md](./INDEX.md)
2. **Choose the right location**: Use Diátaxis framework (tutorial/how-to/reference/explanation)
3. **Review the template**: See `docs/diataxis/templates/`
4. **Check the style guide**: [STYLE_GUIDE.md](./STYLE_GUIDE.md)

### Required Document Structure

Every document must include:

```markdown
# Title

## Plain English Summary (2)
- 5-12 bullet points
- Non-technical language
- What, why, when to use this doc

## Technical Detail
(Structured with clear headings)

## Assumptions
(Explicit prerequisites and context)

## Failure Modes
(What breaks + what to do)

## How to Verify
(Commands to check/test)
```text

### Documentation Checklist

- [ ] Plain English Summary included
- [ ] Technical Detail is structured and clear
- [ ] Assumptions are explicit
- [ ] Failure modes documented
- [ ] Verification commands provided
- [ ] Links are relative and valid
- [ ] File paths are absolute from repo root
- [ ] Code examples are runnable
- [ ] vale linting passes
- [ ] markdownlint passes

### Submit Documentation Changes

```bash
# Same process as code changes
git checkout -b docs/improve-api-reference
# ... make changes
npm run lint:docs  # Run doc linters (TODO)
git add docs/
git commit -m "docs: improve API reference examples"
git push origin docs/improve-api-reference
# Open PR on GitHub
```text

## 🔍 Finding Information

### Search Strategies

1. **Use the site search** (when docs site is deployed)
2. **Check the glossary** for term definitions
3. **Browse by topic** using navigation above
4. **Search GitHub:** Use repo search for specific terms
5. **Check ADRs** for "why" questions about architecture

### Common Questions

#### Q: Where is the API documentation?
A: [docs/apis/README.md](./apis/README.md) and existing [technical/API_DOCUMENTATION.md](./technical/API_DOCUMENTATION.md)

### Q: How do I understand module X?
A: Start with [MODULE_DETAILS.md](../MODULE_DETAILS.md), then check `docs/modules/` for deep dives

#### Q: What testing strategy do we use?
A: See [docs/testing/strategy.md](./testing/strategy.md)

### Q: Who decides on changes?
A: See [GOVERNANCE.md](../GOVERNANCE.md) and [ADR process](./adr/README.md)

#### Q: How do I report security issues?
A: See [SECURITY.md](../SECURITY.md) - use private disclosure

## 📊 Documentation Health

### Metrics We Track

- Documentation coverage (% of modules with docs)
- Link health (broken links)
- Prose quality (Vale warnings)
- Update recency (days since last edit)
- Search effectiveness (TODO: implement analytics)

**Current Status:** See [DOCUMENTATION_METRICS.md](../DOCUMENTATION_METRICS.md)

### Quality Gates (CI)

All documentation changes must pass:

- ✅ Vale prose linting
- ✅ Markdownlint formatting
- ✅ Link checking
- ✅ Spell checking (cspell)
- ✅ PR template requirements

## 🎯 High-Leverage Documentation Features

### 1. Documentation Coverage Map

**Location:** [docs/coverage.md](./coverage.md)
**Purpose:** Makes documentation completeness measurable
**How it works:** Lists all modules/services with required documentation and tracks completion

### 2. Decision-to-Docs Binding

**Location:** ADR template requires links to affected docs
**Purpose:** Prevents decisions from becoming disconnected from implementation
**How it works:** Every ADR must link to module docs, APIs, and migration guides

### 3. Runbook-to-Automation Ladder

**Location:** Runbook template includes "Automation Candidate" section
**Purpose:** Turns manual ops into an automation backlog
**How it works:** Each runbook identifies automation opportunities with triggers and guardrails

### 4. Plain English Contract Blocks

**Location:** Standardized callout blocks in all docs
**Purpose:** Makes repo usable by non-coders and stakeholders
**How it works:** Every doc starts with plain-language summary

### 5. Standardized Verification

**Location:** [docs/verification.md](./verification.md)
**Purpose:** Stops "it works on my machine" documentation
**How it works:** Canonical commands for lint, test, build, deploy

## 🆘 Getting Help

- **Documentation questions:** Open an issue with `documentation` label
- **Broken links or errors:** Open an issue with `documentation` and `bug` labels
- **Suggestions for improvement:** Open a discussion or issue
- **Urgent doc needs:** Tag maintainer in issue

## 📝 Documentation Standards

### File Naming

- Use kebab-case: `user-authentication.md`
- Be descriptive: `oauth-implementation-guide.md` not `auth.md`
- Version if needed: `api-v2-migration.md`

### Linking

- Use relative links: `[ADR](./adr/README.md)` not absolute URLs
- Link to specific sections: `[Setup](#setup)`
- Test all links in CI

### Code Examples

- Include language hints: ` ```typescript `
- Show complete, runnable examples
- Include expected output
- Reference actual files: `// See: client/App.tsx`

### Diagrams

- Use Mermaid for architecture diagrams (renders in GitHub)
- Store sources in `architecture/diagrams/`
- Include alt text for accessibility
- Provide both visual and text descriptions

## 🔐 Security & Sensitive Information

### NEVER include in documentation
- API keys, tokens, passwords
- Real user data or PII
- Internal infrastructure details (IPs, hostnames)
- Unpatched vulnerability details

### Safe to include
- Example/dummy credentials clearly marked as fake
- Public API endpoints
- General architecture patterns
- Already-public security advisories

See [SECURITY.md](../SECURITY.md) for full policy.

## 📅 Documentation Maintenance

### Regular Reviews

- **Monthly:** Check for broken links and outdated content
- **Per Release:** Update changelogs, migration guides, version numbers
- **Per ADR:** Update affected documentation
- **Per Module:** Keep module docs in sync with code

### Archival Process

- Move outdated docs to `docs/archive/`
- Add deprecation notice at top of old doc
- Link to replacement documentation
- Never delete (for historical reference)

## Technical Detail (2)

### Tech Stack

- **Format:** Markdown (CommonMark)
- **Site Generator:** MkDocs with Material theme
- **Prose Linting:** Vale (`.vale.ini`)
- **Markdown Linting:** markdownlint (`.markdownlint.json`)
- **Link Checking:** lychee
- **Diagrams:** Mermaid
- **CI/CD:** GitHub Actions

### Local Development

```bash
# Install dependencies
pip install mkdocs-material
npm install -g markdownlint-cli

# Run linters locally
markdownlint "docs/**/*.md"
vale docs/

# Serve docs site
mkdocs serve  # Visit http://localhost:8000

# Build static site (2)
mkdocs build  # Output in site/
```text

### CI Workflows

- `.github/workflows/docs-vale.yml` - Prose linting
- `.github/workflows/docs-markdownlint.yml` - Markdown linting
- `.github/workflows/docs-links.yml` - Link validation
- `.github/workflows/docs-quality.yml` - Overall quality (existing)

## Assumptions (2)

- Contributors have basic Markdown knowledge
- Git and GitHub workflows are understood
- Documentation is valued as much as code
- Readers prefer clear explanations over jargon
- English is the primary language (translations TODO)

## Failure Modes (2)

| Failure Mode | Symptom | Solution |
| -------------- | --------- | ---------- |
| Docs out of sync | Code and docs contradict | Enforce doc updates in PR template |
| Broken links | 404s everywhere | Automated link checking in CI |
| Inconsistent style | Hard to read/find info | Vale + markdownlint + templates |
| Missing docs | "Where's the docs for X?" | Coverage map + CI enforcement |
| Stale content | Docs describe old versions | Regular review schedule + CHANGELOG |
| Inaccessible | Can't find/understand docs | Search, glossary, plain English summaries |

## How to Verify (2)

### Check documentation structure
```bash
# All required directories exist
ls -la docs/architecture docs/adr docs/apis docs/operations

# MkDocs config exists
cat mkdocs.yml

# Linting configs exist
cat .vale.ini .markdownlint.json
```text

### Verify documentation quality
```bash
# Run all doc checks
npm run lint:docs  # TODO: Add this script

# Check links
npx lychee "docs/**/*.md"

# Lint prose
vale docs/

# Lint markdown
markdownlint "docs/**/*.md"
```text

### Build documentation site
```bash
mkdocs serve
# Open http://localhost:8000
# Navigate through docs, test search
```text

---

**HIGH LEVERAGE:** A well-organized documentation home reduces time-to-productivity for new contributors, prevents duplicate documentation, and ensures consistency across all docs. The Diátaxis framework prevents "Franken-docs" where tutorials, references, and explanations are mixed confusingly.

**CAPTION:** This documentation system turns docs into a first-class product with automated quality gates, making it impossible for documentation to rot or become inconsistent. The Plain English summaries make the codebase accessible to non-engineers while maintaining technical depth for senior developers.

---

*Last Updated: {{ git_revision_date }}*
*Found an issue? [Open an issue](https://github.com/TrevorPLam/aios/issues/new) or submit a PR.*
