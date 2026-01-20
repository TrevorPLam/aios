# Architecture Diagrams

This directory contains architecture diagrams for AIOS using Mermaid format, which allows version control and automatic rendering on GitHub.

## Available Diagrams

1. [System Architecture](./system-architecture.md) - High-level system components and their relationships
2. [Data Flow](./data-flow.md) - How data flows through the application
3. [Module Relationships](./module-relationships.md) - Inter-module dependencies and communication
4. [Deployment Architecture](./deployment-architecture.md) - Development, staging, and production environments

## Viewing Diagrams

All diagrams use Mermaid syntax and render automatically on GitHub. To view locally:

1. **GitHub:** View directly in the repository (auto-renders)
2. **VS Code:** Install "Markdown Preview Mermaid Support" extension
3. **Command Line:** Use `mmdc` (Mermaid CLI) to generate images

## Updating Diagrams

When updating diagrams:

1. Edit the Mermaid code directly in the markdown files
2. Test rendering on [Mermaid Live Editor](https://mermaid.live)
3. Commit changes - GitHub will auto-render updates
4. No binary image files needed (diagrams are text-based)

## Benefits of Mermaid

- ✅ Version controlled (text-based)
- ✅ Easy to update and review
- ✅ Auto-renders on GitHub
- ✅ No external tools required
- ✅ Diff-friendly for code review
