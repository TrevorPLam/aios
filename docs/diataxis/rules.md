# Diátaxis Documentation Framework Rules

## Plain English Summary

- Diátaxis is a framework that organizes documentation into four types: tutorials, how-to guides, reference, and explanation
- Each type has a specific purpose and audience - this prevents confusion and makes docs easier to find
- Tutorials teach beginners through learning-oriented lessons
- How-to guides solve specific problems with step-by-step instructions
- Reference docs provide technical facts and specifications
- Explanations provide deep understanding of concepts and decisions
- Using this framework consistently prevents "Franken-docs" where everything is mixed together
- Every new document must fit into one of these four categories

## Technical Detail

### The Four Documentation Types

```
                    LEARNING-ORIENTED          TASK-ORIENTED
                    ┌──────────────────┐      ┌──────────────────┐
    PRACTICAL       │                  │      │                  │
    STEPS          │    TUTORIALS     │      │   HOW-TO GUIDES  │
                    │                  │      │                  │
                    └──────────────────┘      └──────────────────┘

                    ┌──────────────────┐      ┌──────────────────┐
    THEORETICAL    │                  │      │                  │
    KNOWLEDGE      │  EXPLANATION     │      │   REFERENCE      │
                    │                  │      │                  │
                    └──────────────────┘      └──────────────────┘
                    UNDERSTANDING-ORIENTED     INFORMATION-ORIENTED
```

### 1. Tutorials (Learning-Oriented)

**Purpose:** Teach a beginner through practical steps  
**Audience:** New contributors, new users  
**Goal:** Learning by doing  
**Location:** `docs/diataxis/tutorials/` or module-specific tutorial sections

**Characteristics:**
- Focused on **teaching**
- Takes the user **through a series of steps**
- Ensures **reliable results** (everything works if followed correctly)
- Aimed at **beginners** who are getting started
- **Inspires confidence** through early success
- Covers **one clear objective**

**Writing Rules:**
- [ ] Start with a clear learning objective
- [ ] Provide complete, working examples
- [ ] Test every step personally
- [ ] Avoid explaining concepts in depth (save for Explanation)
- [ ] Ensure user gets tangible result quickly
- [ ] Include "What you'll learn" section
- [ ] Include "Prerequisites" section
- [ ] End with "Next steps" pointing to related docs

**Example Topics:**
- "Getting Started with AIOS Development"
- "Building Your First Module"
- "Creating a Component from Scratch"

**Template:** [tutorial_template.md](./templates/tutorial_template.md)

---

### 2. How-To Guides (Task-Oriented)

**Purpose:** Solve a specific problem  
**Audience:** Experienced users with a specific goal  
**Goal:** Accomplish a task  
**Location:** `docs/operations/runbooks/`, module guides, or task-specific docs

**Characteristics:**
- Focused on **achieving a goal**
- Shows **how to solve a problem**
- Assumes **user knows basics**
- Task-oriented, **practical**
- Results-focused
- Addresses **a specific use case**

**Writing Rules:**
- [ ] Clear title starting with "How to..."
- [ ] List prerequisites/assumptions
- [ ] Numbered steps or clear sequence
- [ ] Include necessary code/commands
- [ ] Link to reference docs for details
- [ ] Include troubleshooting section
- [ ] Show expected outcomes
- [ ] Keep focused on one task

**Example Topics:**
- "How to Add a New Module"
- "How to Debug WebSocket Connection Issues"
- "How to Deploy to Production"

**Template:** [howto_template.md](./templates/howto_template.md)

---

### 3. Reference (Information-Oriented)

**Purpose:** Provide accurate technical facts  
**Audience:** Anyone looking up specifics  
**Goal:** Look up information  
**Location:** `docs/apis/`, `docs/modules/`, technical specifications

**Characteristics:**
- Focused on **information**
- Provides **dry, factual descriptions**
- Structured like a **dictionary or encyclopedia**
- **Consistent format**
- Accurate and **up-to-date**
- **Comprehensive coverage**

**Writing Rules:**
- [ ] Consistent structure across all reference docs
- [ ] Accurate, technical language
- [ ] Complete coverage (no gaps)
- [ ] No opinions or explanations (link to Explanation docs)
- [ ] Include all parameters, options, return values
- [ ] Show type signatures
- [ ] Include code examples
- [ ] Link to related references

**Example Topics:**
- "API Endpoint Reference"
- "Configuration Options"
- "Module Props and Methods"

**Template:** [reference_template.md](./templates/reference_template.md)

---

### 4. Explanation (Understanding-Oriented)

**Purpose:** Explain concepts, decisions, and context  
**Audience:** Users wanting to understand "why" and "how it works"  
**Goal:** Deepen understanding  
**Location:** `docs/architecture/`, `docs/adr/`, concept docs

**Characteristics:**
- Focused on **understanding**
- Provides **context and background**
- Explains **design decisions**
- Explores **alternatives** and trade-offs
- Discusses **implications**
- Makes **connections** to broader concepts

**Writing Rules:**
- [ ] Explain the "why" behind decisions
- [ ] Provide context and history
- [ ] Discuss alternatives considered
- [ ] Explain trade-offs
- [ ] Link to ADRs for specific decisions
- [ ] Use diagrams where helpful
- [ ] Connect to broader architectural concepts
- [ ] No step-by-step instructions (link to How-To)

**Example Topics:**
- "Why We Chose React Native"
- "Authentication Architecture Explained"
- "Module Boundary Design"

**Template:** [explanation_template.md](./templates/explanation_template.md)

---

## Decision Tree: Which Type?

Use this to choose the right documentation type:

```
START: What is the purpose of this document?

├─ To teach a beginner? → TUTORIAL
│
├─ To solve a specific problem? → HOW-TO GUIDE
│
├─ To look up facts and specs? → REFERENCE
│
└─ To understand concepts/decisions? → EXPLANATION
```

Or ask yourself:

- **"I want to learn X"** → Tutorial
- **"I want to accomplish Y"** → How-To Guide
- **"I want to know about Z"** → Reference
- **"I want to understand why/how W"** → Explanation

---

## Application to AIOS

### Module Documentation Structure

For each module, create all four types:

```
docs/modules/notebook/
├── README.md (overview + links)
├── tutorial.md (learning-oriented)
├── howto/
│   ├── create-note.md
│   ├── search-notes.md
│   └── export-notes.md
├── reference.md (API, props, types)
└── architecture.md (explanation)
```

### Documentation Audit Checklist

When reviewing documentation:
- [ ] Document fits clearly into one category
- [ ] Title/header indicates the type
- [ ] Content matches the type's characteristics
- [ ] Follows the appropriate template
- [ ] Links to other types where appropriate
- [ ] Doesn't mix types (no tutorials in reference docs)

---

## Common Mistakes

### ❌ Anti-Patterns

1. **Tutorial + Reference Mix**
   - Problem: Explaining every parameter while teaching
   - Solution: Link to reference for details

2. **How-To + Explanation Mix**
   - Problem: Explaining architecture in a how-to guide
   - Solution: Brief context + link to explanation doc

3. **Reference + Tutorial Mix**
   - Problem: Step-by-step examples in API reference
   - Solution: Show syntax + link to tutorial

4. **Explanation + How-To Mix**
   - Problem: Including implementation steps in architecture doc
   - Solution: Explain concepts + link to how-to

### ✅ Good Patterns

1. **Cross-Linking**
   - Tutorial → Reference (for API details)
   - How-To → Explanation (for understanding)
   - Reference → Tutorial (for learning)
   - Explanation → How-To (for implementation)

2. **Progressive Disclosure**
   - Start simple in tutorial
   - Add complexity in how-to
   - Full details in reference
   - Deep dive in explanation

---

## Enforcement

### In Pull Requests

Reviewers should check:
- [ ] New docs use appropriate Diátaxis category
- [ ] Docs follow the correct template
- [ ] Docs don't mix categories
- [ ] Links to related doc types exist

### In Documentation Coverage Map

Track for each module:
- [ ] Has tutorial
- [ ] Has how-to guides (at least 3)
- [ ] Has reference documentation
- [ ] Has explanation/architecture doc

---

## Assumptions

- Contributors understand the difference between learning, doing, looking up, and understanding
- Documentation is reviewed with same rigor as code
- Each document serves a single primary purpose
- Users can find docs by navigating structure or searching

## Failure Modes

| Failure Mode | Symptom | Solution |
|--------------|---------|----------|
| Category confusion | Docs mix types | Template enforcement, review checklist |
| Missing category | No tutorials or only reference | Coverage map, requirements |
| Wrong audience | Beginners get reference first | Clear navigation, "Start here" guides |
| Duplication | Same info in multiple places | Single source of truth, cross-links |

## How to Verify

**Check structure exists:**
```bash
ls -la docs/diataxis/
ls -la docs/diataxis/templates/
```

**Audit a document:**
```bash
# Read the document and ask:
# 1. Which category is this?
# 2. Does it fit the category rules?
# 3. Does it follow the template?
# 4. Does it link to other categories?
```

**Check coverage:**
```bash
# For each module, verify all four types exist
find docs/modules/ -name "tutorial.md"
find docs/modules/ -name "howto/"
find docs/modules/ -name "reference.md"
find docs/modules/ -name "architecture.md"
```

---

**HIGH LEVERAGE:** Diátaxis prevents documentation chaos by providing clear categories and rules. This framework is used by major projects like Django, and prevents the common problem of documentation that tries to be everything at once and ends up being useful for nothing.

**CAPTION:** Using Diátaxis consistently means users always know where to look - beginners go to tutorials, problem-solvers go to how-tos, fact-checkers go to reference, and architects go to explanations. This structure scales to any documentation size.

---

**References:**
- [Diátaxis Official Site](https://diataxis.fr/)
- [Why Diátaxis Works](https://diataxis.fr/)
- [AIOS Documentation Home](../README.md)
