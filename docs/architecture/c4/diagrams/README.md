# C4 Diagram Editing Guide

## Plain English Summary

This guide explains how to edit the architecture diagrams in the C4 documentation. The diagrams are written in Mermaid, a simple text-based format that GitHub renders automatically. You don't need special software—just edit the text in the markdown files, and GitHub will show the updated diagram. This makes diagrams easy to version control, review in pull requests, and keep synchronized with the code.

## Technical Detail

### Diagram Format

All C4 diagrams in this repository use **Mermaid** syntax embedded directly in markdown files. Mermaid is a text-based diagram language that GitHub renders natively.

### Why Mermaid?

- ✅ Renders in GitHub, GitLab, VS Code
- ✅ Version control friendly (plain text)
- ✅ PR diffs show diagram changes
- ✅ No binary files to track
- ✅ No external tools required
- ✅ Accessible (text can be read by screen readers)

### Alternative Considered

- PlantUML (requires Java, external rendering)
- Draw.io (binary files, harder to diff)
- Lucidchart (proprietary, not in repo)

### Mermaid Syntax Overview

#### Basic Structure

```mermaid
graph TB
    A[Component A] --> B[Component B]
    B --> C[Component C]
```text

#### Graph Types

### For C4 diagrams, we use `graph TB` (top to bottom)
```text
graph TB    - Top to bottom (recommended)
graph LR    - Left to right
graph BT    - Bottom to top
graph RL    - Right to left
```text

#### Node Shapes

```mermaid
graph LR
    A[Rectangle - System/Component]
    B[(Database - Cylinder)]
    C([Rounded - Actor/User])
    D{{Diamond - Decision}}
    E>Ribbon - External]
    F[[Subroutine]]
```text

### In our C4 diagrams
- `[Text]` - Systems, containers, components (rectangles)
- `[(Text)]` - Databases (cylinders)
- `([Text])` - Users/actors (rounded)

#### Connections

```mermaid
graph LR
 A --> | Solid arrow<br/>with label | B
 B -.-> | Dotted arrow<br/>future/optional | C
 C ==> | Thick arrow<br/>emphasis | D
```text

#### Subgraphs (Containers)

```mermaid
graph TB
    subgraph "System Boundary"
        A[Component 1]
        B[Component 2]
    end
    C[External System] --> A
```text

#### Styling

```mermaid
graph LR
    A[Component A]
    B[Component B]

    style A fill:#4A90E2,stroke:#2E5C8A,stroke-width:2px,color:#fff
    style B fill:#7ED321,stroke:#5FA319,stroke-width:3px
```text

### Our Color Scheme
- Blue (#4A90E2) - Internal AIOS systems/components
- Green (#7ED321) - Databases and storage
- Orange (#F5A623) - Shared/library components
- Teal (#50E3C2) - Users and actors
- Gray (#E8E8E8) - External systems

### Editing Diagrams

#### Step 1: Locate the Diagram

Diagrams are embedded in markdown files:

- System Context: `docs/architecture/c4/system_context.md`
- Container: `docs/architecture/c4/container.md`
- Component: `docs/architecture/c4/component.md`
- Deployment: `docs/architecture/c4/deployment.md`

#### Step 2: Find the Mermaid Code Block

Look for:

````markdown
```mermaid
graph TB
    ...diagram code...
```text
````text

#### Step 3: Edit the Diagram

Use any text editor:

- VS Code (with Mermaid extension for preview)
- GitHub web editor
- Vim, Emacs, Nano, etc.

### Example: Adding a new component

Before:

```mermaid
graph TB
    A[Component A] --> B[Component B]
```text

After:

```mermaid
graph TB
    A[Component A] --> B[Component B]
    A --> C[New Component]
    style C fill:#4A90E2,stroke:#2E5C8A,stroke-width:2px
```text

#### Step 4: Preview

### VS Code
1. Install "Markdown Preview Mermaid Support" extension
2. Open markdown file
3. Click preview button (Cmd+Shift+V or Ctrl+Shift+V)
4. See rendered diagram

### GitHub
1. Push changes to branch
2. Open file in GitHub web interface
3. Diagram renders automatically

### Mermaid Live Editor
1. Go to <https://mermaid.live/>
2. Copy/paste diagram code
3. Edit and preview in real-time
4. Copy back to file

#### Step 5: Verify and Commit

```bash
# Check syntax (optional, using mermaid-cli)
npx -p @mermaid-js/mermaid-cli mmdc -i docs/architecture/c4/system_context.md -o /tmp/test.svg

# Commit changes
git add docs/architecture/c4/system_context.md
git commit -m "Update system context diagram to include new integration"
git push
```text

### Common Editing Tasks

#### Add a New System/Component

```mermaid
graph TB
    Existing[Existing System]
    New[New System<br/>Description<br/>----<br/>Technology]

    Existing --> New

    style New fill:#4A90E2,stroke:#2E5C8A,stroke-width:2px,color:#fff
```text

### Steps
1. Add node: `New[New System]`
2. Add description lines with `<br/>`
3. Add separator `----`
4. Add technology stack
5. Connect with arrow: `Existing --> New`
6. Add styling

#### Add a Connection

```mermaid
graph TB
    A[System A]
    B[System B]

 A --> | HTTPS<br/>JSON | B
```text

 **Format:** `A --> | Protocol<br/>Format | B`

#### Change Arrow Style

```mermaid
graph TB
    A[System A]
    B[System B]
    C[System C]

 A --> | Implemented | B
 A -.-> | Planned | C
```text

- `-->` Solid line (implemented, active)
- `-.->` Dotted line (planned, future, optional)
- `==>` Thick line (emphasis, primary flow)

#### Update Styling

```mermaid
graph TB
    A[Component]

    style A fill:#4A90E2,stroke:#2E5C8A,stroke-width:3px,color:#fff
```text

### Parameters
- `fill` - Background color
- `stroke` - Border color
- `stroke-width` - Border thickness (px)
- `color` - Text color

#### Add Subgraph (Container)

```mermaid
graph TB
    subgraph "Container Name"
        A[Component 1]
        B[Component 2]
        A --> B
    end

    External[External] --> A
```text

#### Multi-line Labels

Use `<br/>` for line breaks:

```mermaid
graph TB
    A[Mobile Application<br/>React Native + Expo<br/>----<br/>iOS & Android]
```text

### Best Practices

1. **Keep it Simple**
   - One diagram per abstraction level
   - Limit nodes to 5-15 per diagram
   - Use subgraphs to group related components

2. **Consistent Naming**
   - Use consistent names across diagrams
   - Match code/file names where possible
   - Use CamelCase for components

3. **Meaningful Labels**
   - Label arrows with protocols/formats
   - Include technology stack in node descriptions
   - Separate sections with `----`

4. **Styling Consistency**
   - Use defined color palette
   - Same style for same component type
   - Highlight primary components with thicker borders

5. **Readability**
   - Left-to-right or top-to-bottom flow
   - Avoid crossing arrows when possible
   - Group related nodes

6. **Documentation**
   - Update text documentation with diagram
   - Explain changes in commit message
   - Cross-reference file paths in description

### Troubleshooting

#### Diagram Doesn't Render

**Problem:** GitHub shows code block instead of diagram.

### Causes
- Syntax error in Mermaid code
- Missing closing backticks
- Wrong language identifier

### Fix
1. Check syntax: <https://mermaid.live/>
2. Verify code block:

   ````text
   ```mermaid
   graph TB
       A --> B
   ```text
   ````text

1. No extra spaces before closing backticks

#### Arrows Point Wrong Direction

**Problem:** Diagram layout is messy.

### Fix (2)
- Change graph direction: `graph TB` vs `graph LR`
- Reorder node definitions
- Use subgraphs to organize

#### Labels Overlap

**Problem:** Text overlaps with nodes/arrows.

### Fix (3)
- Use `<br/>` to break long labels
- Shorten text
- Increase spacing between nodes

#### Styling Not Applied

**Problem:** Style statement doesn't work.

### Fix (4)
- Check node ID matches style ID
- Put style statements after all nodes
- Verify color format (#RRGGBB)

#### Can't Preview Locally

**Problem:** VS Code doesn't show diagram.

### Fix (5)
1. Install extension: "Markdown Preview Mermaid Support"
2. Restart VS Code
3. Open Command Palette (Cmd+Shift+P)
4. Search "Markdown: Open Preview"

### Testing Changes

#### Manual Testing

```bash
# 1. View in VS Code preview
code docs/architecture/c4/system_context.md
# Cmd+Shift+V (macOS) or Ctrl+Shift+V (Windows/Linux)

# 2. View in Mermaid Live Editor
# Copy diagram code from markdown file
# Paste into https://mermaid.live/
# Edit and verify

# 3. View on GitHub
git add docs/architecture/c4/system_context.md
git commit -m "Update system context diagram"
git push
# Open file in GitHub web interface
```text

#### Automated Validation (Optional)

```bash
# Install mermaid-cli
npm install -g @mermaid-js/mermaid-cli

# Validate syntax
mmdc -i docs/architecture/c4/system_context.md -o /tmp/test.svg

# If successful, syntax is valid
# If error, fix syntax errors shown
```text

### Example Workflow

**Scenario:** Add new external integration to System Context diagram

```bash
# 1. Create feature branch
git checkout -b feature/add-slack-integration

# 2. Open diagram file
code docs/architecture/c4/system_context.md

# 3. Find Mermaid code block
# Search for: ```mermaid

# 4. Add new node
# Before ExternalSystems line, add
SlackAPI[Slack API<br/>----<br/>Webhook integration<br/>OAuth 2.0]

# 5. Add connection
# After existing connections, add
 AIOS -.-> | Future: Webhooks<br/>JSON | SlackAPI

# 6. Add styling
# After existing style statements, add
style SlackAPI fill:#E8E8E8,stroke:#999,stroke-width:2px

# 7. Preview in VS Code
# Cmd+Shift+V

# 8. Commit
git add docs/architecture/c4/system_context.md
git commit -m "Add Slack integration to system context diagram"
git push origin feature/add-slack-integration

# 9. Create PR
gh pr create --title "Add Slack integration" --body "Adds Slack API to system context diagram"

# 10. Review diagram in PR
# GitHub will show rendered diagram in PR view
```text

## Assumptions

1. **Mermaid support**: GitHub and GitLab support Mermaid natively
2. **Text-based preferred**: Team prefers text-based diagrams over binary formats
3. **Simple diagrams**: C4 diagrams should be simple enough for Mermaid (not super complex)
4. **VS Code usage**: Developers use VS Code or similar editor with Mermaid support
5. **No diagram tool**: No dedicated diagramming tool required (Lucidchart, draw.io, etc.)

## Failure Modes

### Mermaid Deprecation

**Problem**: GitHub stops supporting Mermaid rendering.

### Impact
- Diagrams no longer render
- Code blocks shown instead
- Documentation less useful

### Mitigation
- Monitor GitHub roadmap
- Keep diagrams simple (easy to migrate)
- Export to SVG/PNG as backup

### Recovery
- Migrate to alternative format (PlantUML, SVG, images)
- Keep text source for reference

### Complex Diagrams Unreadable

**Problem**: Diagram becomes too complex for Mermaid.

### Impact (2)
- Cluttered diagram
- Arrows cross everywhere
- Hard to understand

### Mitigation (2)
- Follow C4 principle: one page per level
- Split into multiple focused diagrams
- Use subgraphs for organization

### Recovery (2)
- Simplify diagram
- Create separate diagrams for subsystems

### Inconsistent Styling

**Problem**: Different diagrams use different colors/styles.

### Impact (3)
- Confusing for readers
- Unprofessional appearance
- Harder to navigate

### Mitigation (3)
- Document color scheme (done above)
- Use consistent style snippets
- Review in PRs

### Recovery (3)
- Standardize styling across all diagrams
- Create style guide (this document)

## How to Verify

### Diagram Renders Correctly

```bash
# 1. Check GitHub rendering
# Push to branch and view file on GitHub
git push origin feature-branch
# Open file in GitHub web interface (2)
# Verify diagram renders (not code block)

# 2. Check VS Code preview
code docs/architecture/c4/system_context.md
# Press Cmd+Shift+V (macOS) or Ctrl+Shift+V (Windows/Linux)
# Verify diagram displays

# 3. Validate syntax with Mermaid Live
# Go to https://mermaid.live/
# Copy diagram code from markdown
# Paste into editor
# Verify no syntax errors
```text

### All Diagrams Present

```bash
# Check all C4 diagram files exist
ls -1 docs/architecture/c4/*.md
# Expected
# README.md
# system_context.md (contains diagram)
# container.md (contains diagram)
# component.md (contains diagram)
# deployment.md (contains diagram)

# Check each file contains Mermaid diagram
for file in docs/architecture/c4/{system_context,container,component,deployment}.md; do
    echo "=== $file ==="
    grep -c '```mermaid' "$file"
    # Should output 1 or more (number of diagrams in file)
done
```text

### Styling Consistency

```bash
# Check color usage across diagrams
grep "fill:#4A90E2" docs/architecture/c4/*.md  # Blue - Internal systems
grep "fill:#7ED321" docs/architecture/c4/*.md  # Green - Databases
grep "fill:#F5A623" docs/architecture/c4/*.md  # Orange - Shared/libraries
grep "fill:#50E3C2" docs/architecture/c4/*.md  # Teal - Users
grep "fill:#E8E8E8" docs/architecture/c4/*.md  # Gray - External systems

# Verify consistent usage
```text

### Documentation Up-to-Date

```bash
# Verify diagram matches description
# (Manual review required)
# 1. Read diagram
# 2. Read "Technical Detail" section
# 3. Confirm they match

# Check for file paths in documentation
grep "apps/mobile/" docs/architecture/c4/*.md | wc -l
grep "apps/api/" docs/architecture/c4/*.md | wc -l
# Should reference actual code files
```text

## Related Documentation

- [C4 Model Overview](../README.md) - Introduction to C4 model
- [System Context](../system_context.md) - Level 1 diagram
- [Container Diagram](../container.md) - Level 2 diagram
- [Component Diagram](../component.md) - Level 3 diagram
- [Deployment Diagram](../deployment.md) - Deployment architecture

## References

- Mermaid Documentation: <https://mermaid.js.org/>
- Mermaid Live Editor: <https://mermaid.live/>
- C4 Model: <https://c4model.com/>
- GitHub Mermaid Support: <https://github.blog/2022-02-14-include-diagrams-markdown-files-mermaid/>
- VS Code Mermaid Extension: <https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid>
- Mermaid CLI: <https://github.com/mermaid-js/mermaid-cli>

