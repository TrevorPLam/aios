# Governance Framework Index

**File**: `.repo/INDEX.md`

This index provides navigation to all governance framework components.

## Framework Structure

```
.repo/
├── INDEX.md              ← You are here
├── GOVERNANCE.md         ← Entry point (start here)
├── AGENT.md             ← Folder-level guide
├── repo.manifest.yaml   ← Command definitions (critical!)
├── policy/              ← Authoritative governance rules
├── agents/              ← AI agent framework
├── templates/           ← Document templates
├── docs/                ← Documentation standards
└── hitl/                ← Human-in-the-loop items
```

## Entry Points

| Document | Purpose | When to Use |
|----------|---------|-------------|
| [`GOVERNANCE.md`](GOVERNANCE.md) | Framework overview and quick start | First time reading the framework |
| [`AGENT.md`](AGENT.md) | Folder-level guide for `.repo/` | Understanding what agents can do here |
| [`repo.manifest.yaml`](repo.manifest.yaml) | Command definitions | Before running any checks or builds |

## Policy Files

| Policy | Purpose | Authority Level |
|--------|---------|----------------|
| [`policy/CONSTITUTION.md`](policy/CONSTITUTION.md) | 8 fundamental articles | Immutable (requires founder approval) |
| [`policy/PRINCIPLES.md`](policy/PRINCIPLES.md) | Operating principles (P3-P25) | Updateable |
| [`policy/QUALITY_GATES.md`](policy/QUALITY_GATES.md) | Quality standards and merge rules | Updateable |
| [`policy/SECURITY_BASELINE.md`](policy/SECURITY_BASELINE.md) | Security requirements and triggers | Updateable |
| [`policy/BOUNDARIES.md`](policy/BOUNDARIES.md) | Architectural boundaries | Updateable |
| [`policy/HITL.md`](policy/HITL.md) | Human-in-the-loop process | Updateable |

## Agent Framework

| Component | Purpose | Location |
|-----------|---------|----------|
| **Core Rules** | UNKNOWN workflow, 3-pass generation | [`agents/AGENTS.md`](agents/AGENTS.md) |
| **Capabilities** | List of agent capabilities | [`agents/capabilities.md`](agents/capabilities.md) |
| **Roles** | Role definitions | [`agents/roles/`](agents/roles/) |
|   - Primary | Full capabilities agent | [`agents/roles/primary.md`](agents/roles/primary.md) |
|   - Secondary | Limited capabilities agent | [`agents/roles/secondary.md`](agents/roles/secondary.md) |
|   - Reviewer | Human reviewer | [`agents/roles/reviewer.md`](agents/roles/reviewer.md) |
|   - Release | Human release manager | [`agents/roles/release.md`](agents/roles/release.md) |

## Templates

| Template | Purpose | Schema |
|----------|---------|--------|
| [`templates/AGENT_LOG_TEMPLATE.md`](templates/AGENT_LOG_TEMPLATE.md) | Agent log template | Markdown format |
| [`templates/AGENT_TRACE_SCHEMA.json`](templates/AGENT_TRACE_SCHEMA.json) | Trace log schema | JSON Schema |

## Documentation Standards

| Document | Purpose |
|----------|---------|
| [`docs/standards/manifest.md`](docs/standards/manifest.md) | How to fill repo.manifest.yaml |

## Quick Navigation

### For AI Agents
1. **Start**: [`GOVERNANCE.md`](GOVERNANCE.md)
2. **Read**: [`repo.manifest.yaml`](repo.manifest.yaml) for commands
3. **Follow**: [`agents/AGENTS.md`](agents/AGENTS.md) for core rules
4. **Check**: [`policy/SECURITY_BASELINE.md`](policy/SECURITY_BASELINE.md) for HITL triggers

### For Developers
1. **Start**: [`GOVERNANCE.md`](GOVERNANCE.md)
2. **Read**: [`policy/CONSTITUTION.md`](policy/CONSTITUTION.md) for fundamental rules
3. **Understand**: [`policy/PRINCIPLES.md`](policy/PRINCIPLES.md) for operating principles
4. **Check**: [`policy/QUALITY_GATES.md`](policy/QUALITY_GATES.md) for merge rules

### For Reviewers
1. **Check**: [`policy/HITL.md`](policy/HITL.md) for active HITL items
2. **Review**: [`hitl/`](hitl/) directory for HITL item files
3. **Understand**: [`agents/roles/reviewer.md`](agents/roles/reviewer.md) for reviewer capabilities

## Key Concepts

### UNKNOWN Workflow
When something is not explicitly known:
1. Mark it as `<UNKNOWN>`
2. Create HITL item
3. Stop on that portion
4. Wait for human resolution

See [`agents/AGENTS.md`](agents/AGENTS.md) for details.

### Three-Pass Code Generation
1. **Plan** - List actions, risks, files, UNKNOWNs
2. **Change** - Apply edits
3. **Verify** - Tests, evidence, logs, trace

See [`agents/AGENTS.md`](agents/AGENTS.md) for details.

### Boundary Model
Import direction: `ui → domain → data → platform`

See [`policy/BOUNDARIES.md`](policy/BOUNDARIES.md) for details.

## See Also

- [Repository Root Index](../INDEX.md) - Master repository index
- [`GOVERNANCE.md`](GOVERNANCE.md) - Framework entry point
- [`repo.manifest.yaml`](repo.manifest.yaml) - Command definitions
