# Patterns Mappable to aios

**Analysis of which patterns from new apps can be directly applied to aios**

---

## Current aios State

### ✅ What aios Has

- **React Native 0.83.1** + **Expo 54** for mobile
- **Express.js** API server
- **Drizzle ORM** (configured, but not fully implemented)
- **PostgreSQL** (planned, currently in-memory storage)
- **AsyncStorage** for local-first storage
- **TypeScript** (strict mode)
- **ESLint + Prettier** for linting/formatting
- **Jest** for testing
- **IStorage interface** for storage abstraction
- **Zod** for validation
- **TanStack React Query** for data fetching
- **Monorepo structure** (packages: contracts, design-system, features, platform)
- **Governance framework** (`.repo/` structure)
- **Extensive automation scripts** (intelligent, ultra, vibranium)

### ❌ What aios Lacks

- **No repository pattern** (uses IStorage interface directly)
- **No factory pattern** for storage providers (AsyncStorage only)
- **No factory pattern** for AI providers (if they add AI features)
- **No persistent configuration** (only environment variables)
- **No Biome** (uses ESLint + Prettier)
- **No database** (in-memory storage, PostgreSQL planned)

---

## 🎯 High-Priority Mappings

### 1. **Repository Pattern for Drizzle ORM** (from cal.com, adapted)

**Why it fits:**

- Currently uses **IStorage interface** with in-memory storage
- **Drizzle ORM** is configured but not fully implemented
- Repository pattern provides **type-safe data access** with Drizzle
- Makes it easier to **migrate from in-memory to PostgreSQL**
- Better **separation of concerns** (business logic vs data access)

**Current State:**

```typescript
// apps/api/storage.ts (current)
export interface IStorage {
  getNotes(userId: string): Promise<Note[]>;
  getNote(id: string, userId: string): Promise<Note | undefined>;
  createNote(note: Omit<Note, "id" | "createdAt" | "updatedAt">): Promise<Note>;
  // ... in-memory implementation
}
```

**What to extract:**

```typescript
// packages/platform/repositories/base-repository.ts
import { eq, and } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";
import { db } from "@platform/storage/database";

export interface IRepository<T, TWhere, TSelect, TCreate, TUpdate> {
  findById(id: string, select?: TSelect): Promise<T | null>;
  findMany(where?: TWhere, select?: TSelect): Promise<T[]>;
  create(data: TCreate): Promise<T>;
  update(where: TWhere, data: TUpdate): Promise<T>;
  delete(where: TWhere): Promise<void>;
}

export abstract class BaseRepository<
  T,
  TWhere,
  TSelect,
  TCreate,
  TUpdate,
> implements IRepository<T, TWhere, TSelect, TCreate, TUpdate> {
  constructor(
    protected table: PgTable,
    protected userIdField: string = "userId",
  ) {}

  async findById(id: string, select?: TSelect): Promise<T | null> {
    const result = await db
      .select(select ? this.buildSelect(select) : undefined)
      .from(this.table)
      .where(eq(this.table.id, id))
      .limit(1);

    return (result[0] as T) || null;
  }

  async findMany(
    where?: TWhere,
    select?: TSelect,
    options?: { limit?: number; offset?: number; orderBy?: any },
  ): Promise<T[]> {
    let query = db
      .select(select ? this.buildSelect(select) : undefined)
      .from(this.table);

    if (where) {
      query = query.where(this.buildWhere(where));
    }

    if (options?.orderBy) {
      query = query.orderBy(options.orderBy);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.offset(options.offset);
    }

    return (await query) as T[];
  }

  async create(data: TCreate): Promise<T> {
    const result = await db
      .insert(this.table)
      .values(data as any)
      .returning();
    return result[0] as T;
  }

  async update(where: TWhere, data: TUpdate): Promise<T> {
    const result = await db
      .update(this.table)
      .set(data as any)
      .where(this.buildWhere(where))
      .returning();

    return result[0] as T;
  }

  async delete(where: TWhere): Promise<void> {
    await db.delete(this.table).where(this.buildWhere(where));
  }

  protected abstract buildSelect(select: TSelect): any;
  protected abstract buildWhere(where: TWhere): any;
}

// packages/platform/repositories/note-repository.ts
import { notes } from "@contracts/schema";
import { BaseRepository } from "./base-repository";
import { eq, and } from "drizzle-orm";

const noteMinimalSelect = {
  id: true,
  userId: true,
  title: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class NoteRepository extends BaseRepository<
  Note,
  { id: string; userId?: string },
  typeof noteMinimalSelect,
  Omit<Note, "id" | "createdAt" | "updatedAt">,
  Partial<Omit<Note, "id" | "createdAt">>
> {
  constructor() {
    super(notes, "userId");
  }

  protected buildSelect(select: typeof noteMinimalSelect): any {
    return select;
  }

  protected buildWhere(where: { id: string; userId?: string }): any {
    const conditions = [eq(notes.id, where.id)];
    if (where.userId) {
      conditions.push(eq(notes.userId, where.userId));
    }
    return and(...conditions);
  }

  async findByUserId(
    userId: string,
    select?: typeof noteMinimalSelect,
  ): Promise<Note[]> {
    return this.findMany({ userId }, select);
  }
}
```

**Implementation Steps:**

1. Create `packages/platform/repositories/` directory
2. Add base repository class
3. Create module-specific repositories (Notes, Tasks, Projects, etc.)
4. Refactor `IStorage` to use repositories
5. Update API routes to use repositories
6. Add tests for repositories
7. Document pattern

**Files to create:**

- `packages/platform/repositories/base-repository.ts`
- `packages/platform/repositories/note-repository.ts`
- `packages/platform/repositories/task-repository.ts`
- `packages/platform/repositories/project-repository.ts`
- `packages/platform/repositories/event-repository.ts`
- `packages/platform/repositories/__tests__/note-repository.test.ts`
- `docs/patterns/repository-pattern.md`

**Files to modify:**

- `apps/api/storage.ts` (refactor to use repositories)
- `apps/api/routes.ts` (use repositories)
- `packages/platform/storage/database.ts` (add Drizzle connection)

**Benefits:**

- ✅ Type-safe data access with Drizzle
- ✅ Easier migration from in-memory to PostgreSQL
- ✅ Easier testing (mock repository)
- ✅ Better separation of concerns
- ✅ Consistent patterns across modules

---

### 2. **Factory Pattern for Storage Providers** (from omni-storage)

**Why it fits:**

- Currently uses **AsyncStorage only** for local storage
- Might want to switch to **SQLite**, **MMKV**, or **FileSystem**
- Factory pattern enables **easy storage switching**
- Reduces vendor lock-in
- Supports **local-first** architecture

**Current State:**

```typescript
// packages/platform/storage/database.ts (current)
import AsyncStorage from "@react-native-async-storage/async-storage";

async function getData<T>(key: string, defaultValue: T): Promise<T> {
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}
```

**What to extract:**

```typescript
// packages/platform/storage/providers/base.ts
export interface StorageProvider {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
  getAllKeys(): Promise<string[]>;
  clear(): Promise<void>;
}

// packages/platform/storage/providers/factory.ts
import { StorageProvider } from "./base";
import { AsyncStorageProvider } from "./async-storage";
import { SQLiteStorageProvider } from "./sqlite";
import { MMKVStorageProvider } from "./mmkv";

export type StorageProviderType =
  | "async-storage"
  | "sqlite"
  | "mmkv"
  | "filesystem";

export class StorageProviderFactory {
  static create(provider: StorageProviderType, config?: any): StorageProvider {
    switch (provider) {
      case "async-storage":
        return new AsyncStorageProvider();
      case "sqlite":
        return new SQLiteStorageProvider(config);
      case "mmkv":
        return new MMKVStorageProvider(config);
      case "filesystem":
        return new FileSystemStorageProvider(config);
      default:
        throw new Error(`Unknown storage provider: ${provider}`);
    }
  }

  static createFromEnv(): StorageProvider {
    const provider = (process.env.STORAGE_PROVIDER ||
      "async-storage") as StorageProviderType;
    return this.create(provider);
  }
}

// packages/platform/storage/providers/async-storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StorageProvider } from "./base";

export class AsyncStorageProvider implements StorageProvider {
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }

  async getAllKeys(): Promise<string[]> {
    return AsyncStorage.getAllKeys();
  }

  async clear(): Promise<void> {
    await AsyncStorage.clear();
  }
}
```

**Implementation Steps:**

1. Create `packages/platform/storage/providers/` directory
2. Define `StorageProvider` interface
3. Create factory class
4. Refactor AsyncStorage logic into `AsyncStorageProvider`
5. Update storage layer to use factory
6. Add environment variable for storage selection
7. Document pattern

**Files to create:**

- `packages/platform/storage/providers/base.ts`
- `packages/platform/storage/providers/factory.ts`
- `packages/platform/storage/providers/async-storage.ts`
- `packages/platform/storage/providers/sqlite.ts` (example, optional)
- `packages/platform/storage/providers/mmkv.ts` (example, optional)
- `docs/patterns/storage-provider-factory.md`

**Files to modify:**

- `packages/platform/storage/database.ts` (use factory)
- `packages/features/core/data/index.ts` (use factory)
- `env.example` (add STORAGE_PROVIDER)

**Benefits:**

- ✅ Easy to switch storage backends
- ✅ Reduces vendor lock-in
- ✅ Consistent interface across providers
- ✅ Easier to test (mock storage)
- ✅ Supports local-first architecture

---

### 3. **Factory Pattern for AI Providers** (from esperanto)

**Why it fits:**

- aios has **AI-powered recommendations** scaffolded
- Might want to switch between **OpenAI**, **Anthropic**, **Google AI**, or **local models**
- Factory pattern enables **easy provider switching**
- Reduces vendor lock-in

**What to extract:**

```typescript
// packages/platform/ai/providers/base.ts
export interface AIProvider {
  generate(prompt: string, options?: GenerateOptions): Promise<string>;
  generateStream(
    prompt: string,
    options?: GenerateOptions,
  ): AsyncIterable<string>;
  getAvailableModels(): string[];
}

// packages/platform/ai/providers/factory.ts
import { AIProvider } from "./base";
import { OpenAIProvider } from "./openai";
import { AnthropicProvider } from "./anthropic";
import { GoogleAIProvider } from "./google-ai";
import { LocalAIProvider } from "./local";

export type AIProviderType = "openai" | "anthropic" | "google" | "local";

export class AIProviderFactory {
  static create(
    provider: AIProviderType,
    config: Record<string, string>,
  ): AIProvider {
    switch (provider) {
      case "openai":
        return new OpenAIProvider(config);
      case "anthropic":
        return new AnthropicProvider(config);
      case "google":
        return new GoogleAIProvider(config);
      case "local":
        return new LocalAIProvider(config);
      default:
        throw new Error(`Unknown AI provider: ${provider}`);
    }
  }

  static createFromEnv(): AIProvider {
    const provider = (process.env.AI_PROVIDER || "openai") as AIProviderType;
    const config = {
      openaiApiKey: process.env.OPENAI_API_KEY || "",
      anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
      googleApiKey: process.env.GOOGLE_AI_API_KEY || "",
      localModelPath: process.env.LOCAL_MODEL_PATH || "",
    };
    return this.create(provider, config);
  }
}
```

**Implementation Steps:**

1. Create `packages/platform/ai/providers/` directory
2. Define `AIProvider` interface
3. Create factory class
4. Implement providers (OpenAI, Anthropic, Google AI, Local)
5. Update recommendation engine to use factory
6. Add environment variable for provider selection
7. Document pattern

**Files to create:**

- `packages/platform/ai/providers/base.ts`
- `packages/platform/ai/providers/factory.ts`
- `packages/platform/ai/providers/openai.ts`
- `packages/platform/ai/providers/anthropic.ts`
- `packages/platform/ai/providers/google-ai.ts`
- `packages/platform/ai/providers/local.ts`
- `docs/patterns/ai-provider-factory.md`

**Files to modify:**

- `packages/features/recommendations/domain/` (use factory)
- `env.example` (add AI_PROVIDER)

**Benefits:**

- ✅ Easy to switch AI providers
- ✅ Reduces vendor lock-in
- ✅ Consistent interface across providers
- ✅ Easier to test (mock AI provider)
- ✅ Can support multiple providers simultaneously

---

### 4. **Biome Configuration** (from cal.com)

**Why it fits:**

- Currently uses **ESLint + Prettier** separately
- Biome is a **unified tool** that replaces both
- Better performance and simpler configuration
- Already TypeScript-focused

**What to extract:**

```json
// biome.json
{
  "formatter": {
    "lineWidth": 100,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "nursery": {
        "noUnresolvedImports": "warn"
      }
    }
  },
  "overrides": [
    {
      "includes": ["apps/**/*.tsx", "packages/**/*.tsx"],
      "linter": {
        "rules": {
          "style": {
            "noDefaultExport": "off"
          }
        }
      }
    }
  ]
}
```

**Implementation Steps:**

1. Install Biome: `npm install --save-dev @biomejs/biome`
2. Replace ESLint config with `biome.json`
3. Replace Prettier with Biome formatter
4. Update `package.json` scripts
5. Remove ESLint and Prettier dependencies

**Files to modify:**

- `package.json` (scripts, dependencies)
- `eslint.config.js` → `biome.json` (replace)
- `.prettierrc.json` (remove)
- `.lintstagedrc.json` (update to use Biome)

**Benefits:**

- ✅ Single tool instead of two
- ✅ Faster linting/formatting
- ✅ Better TypeScript support
- ✅ Simpler configuration

---

### 5. **Persistent Configuration** (from open-webui)

**Why it fits:**

- Currently uses **environment variables only**
- Some config should be **user-editable** (default AI model, storage settings)
- Database-backed config allows **runtime changes** without redeployment
- Falls back to environment variables (backward compatible)

**What to extract:**

```typescript
// packages/platform/config/persistent-config.ts
import { getConfig, saveConfig } from "./config-storage";

export class PersistentConfig<T> {
  private envValue: T;
  private configPath: string;
  private envName: string;

  constructor(envName: string, configPath: string, envValue: T) {
    this.envName = envName;
    this.configPath = configPath;
    this.envValue = envValue;

    // Try to load from storage, fallback to env
    const storedValue = getConfigValue(configPath);
    this.value = storedValue ?? envValue;
  }

  get value(): T {
    return this._value;
  }

  set value(newValue: T) {
    this._value = newValue;
    saveConfig(this.configPath, newValue);
  }
}

// Usage
export const DEFAULT_AI_MODEL = new PersistentConfig<string>(
  "DEFAULT_AI_MODEL",
  "ai.defaultModel",
  process.env.DEFAULT_AI_MODEL || "gpt-4",
);

export const STORAGE_PROVIDER = new PersistentConfig<string>(
  "STORAGE_PROVIDER",
  "storage.provider",
  process.env.STORAGE_PROVIDER || "async-storage",
);
```

**Implementation Steps:**

1. Add storage table/file for config
2. Create `packages/platform/config/persistent-config.ts`
3. Create `packages/platform/config/config-storage.ts` for storage operations
4. Migrate existing env vars to PersistentConfig where appropriate
5. Add config management API (optional)

**Files to create:**

- `packages/platform/config/persistent-config.ts`
- `packages/platform/config/config-storage.ts`
- `apps/api/routes/config.ts` (API for config management)
- `docs/patterns/persistent-config.md`

**Benefits:**

- ✅ Runtime configuration changes
- ✅ User-editable settings
- ✅ Environment variable fallback
- ✅ Type-safe configuration

---

### 6. **Testing Patterns** (from cal.com)

**Why it fits:**

- Currently uses **Jest** for testing
- Repository pattern makes testing easier
- Better test organization patterns

**What to extract:**

```typescript
// packages/platform/repositories/__tests__/note-repository.test.ts
import { describe, it, expect, vi, beforeEach } from "@jest/globals";
import { NoteRepository } from "../note-repository";
import { db } from "@platform/storage/database";

vi.mock("@platform/storage/database");

describe("NoteRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create note with minimal select", async () => {
    const mockInsert = vi.spyOn(db, "insert").mockResolvedValue({
      returning: () => [
        { id: "123", userId: "user1", title: "Test", createdAt: new Date() },
      ],
    });

    const repo = new NoteRepository();
    const note = await repo.create({
      userId: "user1",
      title: "Test Note",
      bodyMarkdown: "Test content",
      tags: [],
      links: [],
    });

    expect(mockInsert).toHaveBeenCalled();
    expect(note.id).toBeDefined();
    expect(note.userId).toBe("user1");
  });
});
```

**Implementation Steps:**

1. Create test utilities for mocking Drizzle
2. Add example repository tests
3. Document testing patterns
4. Add to testing guidelines

**Files to create:**

- `packages/platform/repositories/__tests__/note-repository.test.ts` (example)
- `packages/platform/repositories/__tests__/test-utils.ts` (test utilities)
- `docs/testing/repository-pattern.md`

**Benefits:**

- ✅ Easier to test data access
- ✅ Better test performance
- ✅ Consistent testing patterns

---

## 🟡 Medium-Priority Mappings

### 7. **GraphQL Setup** (from hoppscotch)

**Why it fits:**

- aios might add **complex queries** (recommendations, cross-module data)
- Better for **mobile apps** (flexible data fetching)
- Can expose **public API** for integrations

**When to implement:**

- When adding complex queries
- When exposing public API
- When mobile app needs flexible data fetching

---

## 🔴 Low-Priority Mappings

### 8. **Plugin System** (from eliza)

**Why it's low priority:**

- aios is an **application**, not a framework
- Plugin system adds **complexity**
- Most users won't need extensibility

**When to implement:**

- If aios becomes a framework
- If users request plugin support

---

## Implementation Roadmap

### Phase 1: Foundation (1-2 weeks)

1. ✅ **Repository Pattern for Drizzle ORM**
   - Create base repository
   - Refactor Notes, Tasks, Projects, Events modules
   - Add tests
   - Document pattern

2. ✅ **Biome Configuration**
   - Replace ESLint + Prettier
   - Update scripts
   - Test linting/formatting

### Phase 2: Provider Abstraction (2-3 weeks)

3. ✅ **Factory Pattern for Storage Providers**
   - Create storage provider interface
   - Refactor AsyncStorage to provider
   - Add factory
   - Document pattern

4. ✅ **Factory Pattern for AI Providers**
   - Create AI provider interface
   - Implement providers (OpenAI, Anthropic, Google AI)
   - Add factory
   - Document pattern

### Phase 3: Enhancement (1 week)

5. ✅ **Persistent Configuration**
   - Add storage for config
   - Create PersistentConfig class
   - Add API routes
   - Document usage

6. ✅ **Testing Patterns**
   - Add test utilities
   - Document testing guidelines
   - Add example tests

### Phase 4: Future (as needed)

7. ⏳ **GraphQL** (when needed)
8. ⏳ **Plugin System** (if becomes framework)

---

## Summary

### Immediate Actions

1. **Add repository pattern for Drizzle ORM** (foundation for data access)
2. **Add factory pattern for storage providers** (enables multi-provider support)
3. **Add factory pattern for AI providers** (enables multi-provider support)
4. **Replace ESLint + Prettier with Biome** (quick win)

### Future Considerations

- Persistent configuration when adding user-editable settings
- GraphQL when adding complex queries
- Plugin system if application becomes framework

---

## Files to Create/Modify

### New Files

```
packages/platform/
├── repositories/
│   ├── base-repository.ts
│   ├── note-repository.ts
│   ├── task-repository.ts
│   └── __tests__/
│       └── note-repository.test.ts
├── storage/
│   └── providers/
│       ├── base.ts
│       ├── factory.ts
│       └── async-storage.ts
├── ai/
│   └── providers/
│       ├── base.ts
│       ├── factory.ts
│       └── openai.ts
└── config/
    ├── persistent-config.ts
    └── config-storage.ts

biome.json

docs/
└── patterns/
    ├── repository-pattern.md
    ├── factory-pattern.md
    └── persistent-config.md
```

### Modified Files

```
package.json (scripts, dependencies)
eslint.config.js → biome.json (replace)
.prettierrc.json (remove)
apps/api/storage.ts (refactor to use repositories)
apps/api/routes.ts (use repositories)
packages/platform/storage/database.ts (use storage factory)
packages/features/recommendations/domain/ (use AI factory)
env.example (add STORAGE_PROVIDER, AI_PROVIDER)
```

---

## Key Differences from Other Templates

1. **React Native + Expo**
   - Repository pattern adapted for mobile-first architecture
   - Storage providers must support AsyncStorage, SQLite, MMKV

2. **Local-First Architecture**
   - Storage providers must support local storage
   - Repository pattern must handle sync between local and server

3. **Drizzle ORM**
   - Repository pattern adapted for Drizzle (not Prisma)
   - Uses Drizzle's query builder for type-safe queries

4. **Monorepo Structure**
   - Patterns must work across packages (contracts, design-system, features, platform)
   - Shared types in `packages/contracts`

5. **In-Memory to PostgreSQL Migration**
   - Repository pattern enables smooth migration
   - Factory pattern for storage providers supports both

---

**Last Updated:** 2024-12-19  
**Target:** aios  
**Source Repositories:** cal.com, esperanto, omni-storage, open-webui, hoppscotch
