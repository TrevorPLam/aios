# AIOS Governance

## Plain English Summary

- This document defines who makes decisions, how changes get reviewed, and how the project evolves
- Contributions follow a pull request workflow with automated checks and code review
- Major architecture decisions are documented in Architecture Decision Records (ADRs)
- Security issues get fast-tracked with private disclosure process
- The project maintainer(s) have final say but seek community input for major changes
- Breaking changes require RFC (Request for Comments) process before implementation
- Documentation changes follow same rigor as code changes
- Inactive maintainers can be replaced through transparent succession process
- **Best Practices Guide:** See `BESTPR.md` for token-optimized agent development guidelines
- **Governance Framework:** See `.repo/policy/` for detailed governance policies and standards

## Governance Framework Links

For detailed governance policies, see:

- **[Constitution](.repo/policy/CONSTITUTION.md)** — Immutable foundational rules
- **[Principles](.repo/policy/PRINCIPLES.md)** — Operating principles (P3-P25)
- **[Quality Gates](.repo/policy/QUALITY_GATES.md)** — Merge rules and requirements
- **[Security Baseline](.repo/policy/SECURITY_BASELINE.md)** — Security standards
- **[Boundaries](.repo/policy/BOUNDARIES.md)** — Module boundaries and architecture rules
- **[HITL (Human-In-The-Loop)](.repo/policy/HITL.md)** — Human approval requirements
- **[Documentation Index](.repo/docs/DOCS_INDEX.md)** — Central documentation hub

## Technical Detail

### Project Ownership

**Repository Owner:** TrevorPowellLam
**Project Type:** Open Source (MIT License)
**Governance Model:** Benevolent Dictator with Community Input

### Decision-Making Process

#### 1. Minor Changes (Bug Fixes, Docs, Refactoring)

- **Process:** Standard pull request workflow
- **Review:** One maintainer approval required
- **Timeline:** 24-48 hours for review
- **Automation:** CI must pass (tests, lint, security scans)

#### 2. Feature Additions

- **Process:** Issue discussion → PR with tests → Review
- **Review:** Maintainer approval + community feedback period
- **Timeline:** 3-7 days
- **Requirements:**
  - Aligns with product vision (see README.md)
  - Tests included (unit + integration)
  - Documentation updated
  - No breaking changes to existing modules

#### 3. Breaking Changes

- **Process:** RFC → Community discussion (14 days) → Implementation PR
- **Review:** Maintainer approval + stakeholder sign-off
- **Timeline:** 2-4 weeks minimum
- **Requirements:**
  - RFC document in `docs/decisions/rfcs/`
  - Migration guide
  - Deprecation warnings in prior release
  - Compatibility shims if feasible

#### 4. Architecture Decisions

- **Process:** ADR creation → Review → Approval
- **Review:** Technical stakeholders + maintainer
- **Documentation:** `docs/decisions/adr/`
- **Requirements:**
  - Follow ADR template
  - Link to affected code/docs/APIs
  - Consider alternatives
  - Document trade-offs

### Review Requirements

#### Code Review Checklist

- [ ] CI passes (tests, lint, type-check, security)
- [ ] Code follows existing patterns and style guide
- [ ] Changes adhere to repo best practices in BESTPR.md
- [ ] Tests cover new/changed behavior
- [ ] Documentation updated (code + user docs)
- [ ] No security vulnerabilities introduced
- [ ] Performance impact assessed
- [ ] Breaking changes documented with migration path

#### Documentation Review Checklist

- [ ] Vale prose linting passes
- [ ] Markdownlint passes
- [ ] Links validated
- [ ] Follows Diátaxis structure (tutorial/howto/reference/explanation)
- [ ] Plain English Summary included
- [ ] Technical Detail provided
- [ ] Examples/commands provided
- [ ] Cross-references correct

### Roles and Responsibilities

#### Maintainer(s)

- Final approval on all changes
- Security vulnerability coordination
- Release management
- Community moderation
- Architecture guidance

**Current Maintainer:** TrevorPowellLam

#### Contributors

- Submit pull requests
- Participate in issue discussions
- Report bugs and security issues
- Improve documentation
- Review others' PRs (optional)

#### Community Members

- Use the software
- Provide feedback
- Participate in RFC discussions
- Help other users

### Conflict Resolution

1. **Technical Disagreements**
   - Document both positions
   - Seek data/evidence
   - Prototype alternatives if feasible
   - Maintainer makes final call
   - Document decision in ADR

2. **Code of Conduct Violations**
   - See CODE_OF_CONDUCT.md
   - Private reporting to maintainer
   - Investigation within 48 hours
   - Action proportional to severity

3. **Stalled Decisions**
   - Set explicit deadline
   - Gather all input
   - Maintainer breaks tie
   - Document reasoning

### Succession Planning

#### Maintainer Inactivity

If maintainer is inactive (no response to critical issues/PRs for 60 days):

1. Community nominates interim maintainer
2. 7-day voting period (GitHub reactions on nomination issue)
3. Nominee with most support takes over
4. Original maintainer can return and reclaim role

#### Adding Co-Maintainers

- Consistent, high-quality contributions over 6+ months
- Demonstrated understanding of codebase and vision
- Community trust (reviewed 20+ PRs, resolved issues)
- Maintainer invitation with community visibility

### Release Process

#### Version Numbering (Semantic Versioning)

- **Major (X.0.0):** Breaking changes
- **Minor (0.X.0):** New features, backward compatible
- **Patch (0.0.X):** Bug fixes, security patches

#### Release Cadence

- **Patch releases:** As needed (bug fixes, security)
- **Minor releases:** Monthly or feature-driven
- **Major releases:** Quarterly or when breaking changes accumulate

#### Release Checklist

- [ ] All CI checks pass
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Git tag created (e.g., v1.2.3)
- [ ] GitHub release notes published
- [ ] Security advisories disclosed (if applicable)
- [ ] Documentation site updated

### Security Response

See SECURITY.md for full details. Key points:

- Private disclosure via GitHub Security Advisories
- 48-hour acknowledgment
- 30-day maximum time to patch
- Coordinated disclosure
- Credit to reporter (unless anonymous requested)

### Communication Channels

- **Issues:** Bug reports, feature requests, questions
- **Pull Requests:** Code and documentation changes
- **Discussions:** Long-form technical discussions, RFCs
- **Security:** Private GitHub Security Advisories
- **Announcements:** GitHub Releases, CHANGELOG.md

### Contribution Agreement

By contributing, you agree:

- Your contributions are your original work
- You have rights to submit the contribution
- Your contribution is licensed under MIT (project license)
- You grant maintainers right to modify/distribute
- You've followed Code of Conduct

No CLA (Contributor License Agreement) required beyond implicit agreement above.

## Assumptions

- Maintainer is responsive within 48 hours for critical issues
- Contributors follow pull request template and guidelines
- Community members engage in good faith
- GitHub platform remains available and suitable
- Open source model aligns with project goals long-term

## Failure Modes

| Failure Mode | Symptom | Mitigation |
| -------------- | --------- | ------------ |
| Maintainer burnout | No reviews for weeks | Succession process, add co-maintainers |
| Toxic community | COC violations increase | Strong moderation, explicit consequences |
| Decision paralysis | Issues/PRs stall indefinitely | Deadline-driven decisions, maintain velocity |
| Scope creep | PRs add unrelated features | RFC for major features, reject out-of-scope |
| Security negligence | Vulnerabilities ignored | Escalation path, public disclosure after 30 days |
| Documentation rot | Docs out of sync with code | Docs-as-code automation, PR requirements |

## How to Verify

### Check governance is followed

```bash
# Recent PRs have required approvals
gh pr list --state closed --limit 10 --json number,reviews

# ADRs exist for major decisions
ls -la docs/decisions/adr/

# Security policy is public
cat SECURITY.md

# Code of conduct exists
cat CODE_OF_CONDUCT.md

# Recent releases follow semantic versioning
gh release list --limit 10
```text

### Verify you can contribute
```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/Mobile-Scaffold.git
cd Mobile-Scaffold

# Create feature branch
git checkout -b feature/my-change

# Make changes, run checks
npm run lint
npm run check:types
npm test

# Submit PR via GitHub UI
```text

---

**HIGH LEVERAGE:** Governance prevents project chaos, maintainer burnout, and community toxicity. It creates predictable processes for contributions, decisions, and conflict resolution. Clear ownership and decision rights reduce bikeshedding and keep velocity high.

**CAPTION:** This governance model reduces ambiguity in decision-making, prevents contributor confusion, and ensures project sustainability through explicit succession planning and transparent processes.
