# Repository Index

**File**: `INDEX.md`

This is the master index of all directories in the repository. Each major directory has its own `INDEX.md` file with detailed contents.

## Directory Index

| Directory | Purpose | Index File |
|-----------|---------|------------|
| `.repo/` | Governance framework, policies, agent rules | [`.repo/INDEX.md`](.repo/INDEX.md) |
| `apps/` | Applications (mobile, API, web) | [`apps/INDEX.md`](apps/INDEX.md) |
| `packages/` | Shared packages (features, platform, design-system, contracts) | [`packages/INDEX.md`](packages/INDEX.md) |
| `docs/` | Documentation (architecture, onboarding, runbooks) | [`docs/INDEX.md`](docs/INDEX.md) |
| `scripts/` | Automation and utility scripts | [`scripts/INDEX.md`](scripts/INDEX.md) |
| `agents/tasks/` | Task management (TODO, BACKLOG, ARCHIVE) | See `agents/tasks/` directory |

## Quick Navigation

### Applications
- **Mobile App**: [`apps/mobile/`](apps/mobile/) - React Native/Expo mobile application
- **API Server**: [`apps/api/`](apps/api/) - Node.js/Express backend API
- **Web App**: [`apps/web/`](apps/web/) - Web application (if applicable)

### Packages
- **Features**: [`packages/features/`](packages/features/) - Feature modules (vertical slices)
- **Platform**: [`packages/platform/`](packages/platform/) - Platform adapters and primitives
- **Design System**: [`packages/design-system/`](packages/design-system/) - Shared UI components
- **Contracts**: [`packages/contracts/`](packages/contracts/) - Shared types and schemas

### Supporting Directories
- **Documentation**: [`docs/INDEX.md`](docs/INDEX.md) - Comprehensive documentation index
- **Scripts**: [`scripts/INDEX.md`](scripts/INDEX.md) - Automation scripts
- **Governance**: [`.repo/INDEX.md`](.repo/INDEX.md) - Policies, agent framework, HITL

## Repository Structure Overview

```
.
├── INDEX.md              ← You are here (master index)
├── .repo/                ← Governance framework
│   ├── INDEX.md         ← Governance index
│   ├── policy/          ← Policy files
│   ├── agents/          ← Agent framework
│   └── templates/        ← Document templates
├── apps/                 ← Applications
│   ├── INDEX.md        ← Apps index
│   ├── mobile/         ← React Native mobile app
│   ├── api/            ← Express API server
│   └── web/            ← Web application
├── packages/             ← Shared packages
│   ├── INDEX.md        ← Packages index
│   ├── features/       ← Feature modules
│   ├── platform/       ← Platform adapters
│   ├── design-system/  ← UI components
│   └── contracts/      ← Shared types/schemas
├── docs/                 ← Documentation
│   └── INDEX.md        ← Documentation index
├── scripts/              ← Automation scripts
│   └── INDEX.md        ← Scripts index
└── agents/               ← Task management
    └── tasks/          ← TODO, BACKLOG, ARCHIVE
```

## Key Entry Points

### For Developers
- **Getting Started**: [`README.md`](README.md) - Project overview and quick start
- **Best Practices**: [`BESTPR.md`](BESTPR.md) - Repository best practices
- **Contributing**: [`CONTRIBUTING.md`](CONTRIBUTING.md) - Contribution guidelines
- **AI Agents**: [`AGENTS.md`](AGENTS.md) - AI contribution guide

### For Governance
- **Governance Framework**: [`.repo/GOVERNANCE.md`](.repo/GOVERNANCE.md) - Entry point
- **Constitution**: [`.repo/policy/CONSTITUTION.md`](.repo/policy/CONSTITUTION.md) - Fundamental rules
- **Agent Framework**: [`.repo/agents/AGENTS.md`](.repo/agents/AGENTS.md) - Agent rules

### For Documentation
- **Documentation Index**: [`docs/INDEX.md`](docs/INDEX.md) - Complete documentation catalog
- **Architecture**: [`docs/architecture/`](docs/architecture/) - System architecture
- **API Docs**: [`docs/apis/`](docs/apis/) - API documentation

## Task Management

- **P0 Tasks**: [`P0TODO.md`](P0TODO.md) - Critical priority tasks
- **P1 Tasks**: [`P1TODO.md`](P1TODO.md) - High priority tasks
- **P2 Tasks**: [`P2TODO.md`](P2TODO.md) - Medium priority tasks
- **P3 Tasks**: [`P3TODO.md`](P3TODO.md) - Backlog tasks
- **Task Archive**: [`agents/tasks/ARCHIVE.md`](agents/tasks/ARCHIVE.md) - Archived tasks

## See Also

- [`.repo/GOVERNANCE.md`](.repo/GOVERNANCE.md) - Governance framework entry point
- [`README.md`](README.md) - Project overview and quick start
- [`AGENTS.md`](AGENTS.md) - AI contribution guide
- [`BESTPR.md`](BESTPR.md) - Repository best practices
- [`packages/README.md`](packages/README.md) - Package boundary map
