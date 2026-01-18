# Documentation Path Instructions

**Scope:** Applies to changes in `/docs/**` directory  
**Authority:** Extends global `.github/copilot-instructions.md`

## Plain English Summary

- Documentation follows the **Diátaxis framework**: tutorials, how-to guides, reference, and explanation
- Every doc must have Plain English Summary, Technical Detail, Assumptions, Failure Modes, and Verification
- Voice is professional, clear, evidence-based - no marketing fluff
- Links must be relative and tested by CI
- No "doc landfill": unused docs go to `docs/archive/` with clear deprecation notices
- Templates are mandatory for ADRs, runbooks, and module docs

## Technical Detail

### Diátaxis Framework (REQUIRED)

Place documentation in the correct category:

| Type | Purpose | Location | Example |
|------|---------|----------|---------|
| **Tutorial** | Learning-oriented, step-by-step lessons | `docs/diataxis/tutorials/` | "Getting started with AIOS development" |
| **How-To Guide** | Task-oriented, practical steps | `docs/operations/runbooks/` or module guides | "How to debug React Native issues" |
| **Reference** | Information-oriented, dry facts | `docs/apis/`, `docs/modules/` | API specs, function signatures |
| **Explanation** | Understanding-oriented, concepts | `docs/architecture/`, `docs/decisions/` | Architecture overview, ADRs |

**Wrong:**
```
docs/stuff.md  # No category
docs/everything-about-api.md  # Mixing tutorial + reference + explanation
```

**Right:**
```
docs/diataxis/tutorials/api-first-steps.md  # Tutorial
docs/apis/README.md  # Reference
docs/architecture/api-design.md  # Explanation
```

### Document Structure Template

**MANDATORY for all docs:**

```markdown
# Title

## Plain English Summary
- 5-12 bullet points
- Non-technical language where possible
- What this doc covers
- When to use this doc
- Key takeaways

## Technical Detail
(Structured content with clear headings)

## Assumptions
(Explicit prerequisites and context)

## Failure Modes
(What breaks, symptoms, solutions)

## How to Verify
(Commands to check/test)
```

### Voice & Style

**DO:**
- Use active voice: "The API validates input" not "Input is validated by the API"
- Be specific: "Run `npm test`" not "Run the tests"
- Cite evidence: "See `client/App.tsx:42`" not "The client does X"
- Use concrete examples
- Include runnable commands with expected output
- Link to related docs

**DON'T:**
- Use marketing language: "revolutionary", "game-changing", "amazing"
- Make unsupported claims: "This is the best approach"
- Use passive voice excessively
- Hide information behind vague statements
- Create walls of text without structure
- Duplicate content (link instead)

**Example:**

❌ **Bad:**
```markdown
Our authentication system is state-of-the-art and provides amazing security.
```

✅ **Good:**
```markdown
Authentication uses JWT tokens with bcrypt-hashed passwords (see `server/middleware/auth.ts:15`).
Tokens expire after 24 hours. Password hashing uses cost factor 10 (configurable via `AUTH_BCRYPT_ROUNDS`).
```

### Link Discipline

**ALWAYS use relative links:**

```markdown
✅ [API Documentation](../apis/README.md)
✅ [ADR-003](../decisions/003-jwt-auth.md)
❌ [API Docs](https://github.com/TrevorPowellLam/Mobile-Scaffold/blob/main/docs/apis/README.md)
```

**Check links locally:**
```bash
# Install lychee if needed
npm install -g lychee

# Check all docs
lychee "docs/**/*.md"
```

**CI will fail on broken links** (`.github/workflows/docs-links.yml`).

### Templates (REQUIRED)

Use these templates:

| Document Type | Template Location |
|---------------|-------------------|
| ADR | `docs/.templates/adr-template.md` |
| Runbook | `docs/.templates/runbook-template.md` |
| Module documentation | `docs/.templates/module-template.md` |

**Creating an ADR:**
```bash
# Copy template
cp docs/.templates/adr-template.md docs/decisions/008-my-decision.md

# Fill in:
# - Status: Proposed/Accepted/Deprecated/Superseded
# - Context: Why this decision is needed
# - Decision: What was decided
# - Consequences: Trade-offs and implications
# - Links: Affected code/docs/APIs
```

### No Doc Landfill

**NEVER leave orphaned or outdated docs.**

If a doc is no longer relevant:

1. **Move to archive:**
   ```bash
   git mv docs/old-thing.md docs/archive/old-thing.md
   ```

2. **Add deprecation notice at top:**
   ```markdown
   # ⚠️ DEPRECATED
   
   This document is no longer maintained.
   
   **Replaced by:** [New Document](../current/new-thing.md)  
   **Deprecated on:** 2026-01-18  
   **Reason:** Functionality removed in v2.0
   ```

3. **Update links:**
   ```bash
   # Find all references
   grep -r "old-thing.md" docs/
   
   # Update them to point to new location or replacement doc
   ```

4. **Update docs/README.md** to remove references

**NEVER delete docs** - history is valuable for understanding evolution.

### Code Examples

**ALWAYS include language hints:**

````markdown
```typescript
// Good: Language hint + context comment
import { authenticate } from '@/server/middleware/auth';

app.get('/api/users', authenticate, (req, res) => {
  // Implementation
});
```
````

**Show expected output:**

```markdown
## Running Tests

```bash
npm test
```

**Expected output:**
```
PASS  server/__tests__/auth.test.ts
  ✓ should authenticate valid token (42ms)
  ✓ should reject invalid token (18ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
```
```

### File Naming

Use kebab-case:
```
✅ user-authentication-guide.md
✅ oauth-implementation.md
❌ UserAuthenticationGuide.md
❌ oauth_implementation.md
❌ oauthimplementation.md
```

Be descriptive:
```
✅ server-deployment-runbook.md
❌ deployment.md
❌ runbook.md
```

### Documentation Checklist

Before submitting doc changes, verify:

```bash
# Run Vale prose linting
vale docs/

# Run markdownlint
markdownlint "docs/**/*.md"

# Check links
lychee "docs/**/*.md"

# Spell check
npx cspell "docs/**/*.md"
```

**PR checklist:**
- [ ] Plain English Summary included
- [ ] Technical Detail is structured
- [ ] Assumptions documented
- [ ] Failure modes listed
- [ ] Verification commands provided
- [ ] Links are relative and valid
- [ ] Code examples have language hints
- [ ] File follows Diátaxis placement
- [ ] Template used (if ADR/runbook/module)
- [ ] Vale passes
- [ ] Markdownlint passes
- [ ] No broken links

### Updating Existing Docs

**Preserve structure:**
- Don't change the document structure without strong reason
- Keep existing sections intact
- Add new information additively

**Track changes:**
```markdown
---
*Last Updated: 2026-01-18*  
*Change: Added examples for async authentication flow*
```

**Major rewrites require ADR:**

If you need to restructure substantial documentation, create an ADR first:
```markdown
# ADR-XXX: Restructure API Documentation

## Context
Current API docs mix reference and tutorials, causing confusion.

## Decision
Split into `docs/apis/reference/` and `docs/diataxis/tutorials/api-guides/`

## Consequences
- Better findability
- Requires updating 27 links
- Migration can be done incrementally
```

## Assumptions

- Contributors have read `docs/README.md` (the docs home)
- Markdown knowledge
- Diátaxis framework understanding (or willing to learn)
- Vale and markdownlint are installed
- CI runs doc checks automatically

## Failure Modes

| Failure Mode | Symptom | Solution |
|--------------|---------|----------|
| Mixed doc types | Tutorials contain reference material | Follow Diátaxis framework strictly |
| Broken links | 404 errors when clicking links | Use relative links, run lychee locally |
| Inconsistent style | Hard to read docs | Run Vale, follow voice guidelines |
| Missing structure | No Plain English Summary | Use templates, enforce in PR review |
| Outdated docs | Docs contradict code | Update docs in same PR as code changes |
| Doc landfill | Unused docs everywhere | Archive with deprecation notices |
| Link rot | External links break | Prefer linking to internal docs |

## How to Verify

**Verify doc structure:**
```bash
# Check that doc has required sections
grep -E "^## (Plain English Summary|Technical Detail|Assumptions|Failure Modes|How to Verify)" docs/path/to/doc.md

# Should show all 5 sections
```

**Run all doc quality checks:**
```bash
# Vale (prose linting)
vale docs/

# Markdownlint (formatting)
markdownlint "docs/**/*.md"

# Link checking
lychee "docs/**/*.md"

# Spell check
npx cspell "docs/**/*.md"
```

**Verify Diátaxis placement:**
```bash
# Tutorials should be in tutorials/
find docs/diataxis/tutorials/ -name "*.md"

# How-to guides in runbooks or module-specific
find docs/operations/runbooks/ -name "*.md"

# Reference in apis, modules, etc.
find docs/apis/ docs/modules/ -name "*.md"

# Explanation in architecture, decisions
find docs/architecture/ docs/decisions/ -name "*.md"
```

**Check for doc landfill:**
```bash
# Find docs not linked from any other doc or README
# (Manual inspection required)
for file in $(find docs/ -name "*.md"); do
  name=$(basename "$file")
  links=$(grep -r "$name" docs/ | wc -l)
  if [ "$links" -eq 1 ]; then
    echo "Orphan candidate: $file"
  fi
done
```

---

**Remember:** Documentation is a product. Treat it with the same care as production code.
