/**
 * How to Use:
 * - Call moduleRegistry.getModules() to list modules for grids/sidebars.
 * - Use moduleRegistry.getModule(moduleId) for metadata lookups.
 *
 * UI integration example:
 * - ModuleGridScreen renders cards from moduleRegistry.getModules().
 *
 * Public API:
 * - ModuleTier, ModuleCategory, ModuleDefinition, ModuleUsage, moduleRegistry.
 *
 * Expected usage pattern:
 * - Treat moduleRegistry as the single source of truth for module metadata.
 *
 * WHY: Keeps navigation, search, and UI metadata aligned across the app.
 */
/**
 * Module Registry
 *
 * Purpose (Plain English):
 * Central catalog of all modules in the app. Defines what modules exist, their icons,
 * colors, and metadata. Used by Sidebar, Command Center, Module Grid, and everywhere
 * that needs to display or navigate to modules.
 *
 * What it interacts with:
 * - Navigation system (to navigate to modules)
 * - Sidebar (to display available modules)
 * - Command Center (to show module recommendations)
 * - Context Engine (to filter modules by context)
 * - Analytics (to track module usage)
 *
 * Technical Implementation:
 * Single source of truth for module configuration. Adding a new module means
 * adding one entry here - everything else picks it up automatically.
 *
 * Safe AI Extension Points:
 * - Add new modules to MODULES array
 * - Add new module tiers
 * - Add module dependencies
 *
 * Fragile Logic Warnings:
 * - Module IDs must match navigation route names EXACTLY
 * - Changing module IDs breaks saved user preferences
 * - Icon names must match Feather icon set
 */

import { ModuleType } from "@/models/types";
import type { AppStackParamList } from "@/navigation/AppNavigator";

/**
 * Module Tier
 *
 * Plain English: Which "wave" of modules this belongs to.
 * - Core: Always available (14 existing modules)
 * - Tier1: Super app essentials (Wallet, Maps, etc.)
 * - Tier2: Life management (Health, Education, etc.)
 * - Tier3: Innovation edge (Memory Bank, Future Predictor, etc.)
 */
export type ModuleTier = "core" | "tier1" | "tier2" | "tier3";

/**
 * Module Category
 *
 * Plain English: What type of thing is this module?
 */
export type ModuleCategory =
  | "productivity"
  | "communication"
  | "organization"
  | "finance"
  | "lifestyle"
  | "utilities"
  | "commerce"
  | "health"
  | "education"
  | "innovation";

/**
 * Module Definition
 *
 * Complete metadata for a module.
 */
export interface ModuleDefinition {
  id: ModuleType;
  name: string; // Display name
  description: string; // Short description
  icon: string; // Feather icon name
  color: string; // Hex color
  routeName: keyof AppStackParamList; // Navigation route
  tier: ModuleTier;
  category: ModuleCategory;
  isCore: boolean; // Part of the 14 production modules
  requiresOnboarding: boolean; // Show in onboarding selection
  tags: string[]; // For search and categorization
}

/**
 * Module Usage Tracking
 */
export interface ModuleUsage {
  moduleId: ModuleType;
  openCount: number;
  lastOpened: string; // ISO 8601
  totalTimeSpent: number; // seconds
  favorited: boolean;
}

/**
 * All Modules
 *
 * SINGLE SOURCE OF TRUTH for module definitions.
 * Add new modules here.
 */
const MODULES: ModuleDefinition[] = [
  // Core Modules (14 production-ready)
  {
    id: "command",
    name: "Command Center",
    description: "AI-powered recommendation hub",
    icon: "zap",
    color: "#00D9FF",
    routeName: "CommandCenter",
    tier: "core",
    category: "productivity",
    isCore: true,
    requiresOnboarding: true,
    tags: ["ai", "recommendations", "home", "dashboard"],
  },
  {
    id: "notebook",
    name: "Notebook",
    description: "Notes with tags and links",
    icon: "book",
    color: "#00D9FF",
    routeName: "Notebook",
    tier: "core",
    category: "productivity",
    isCore: true,
    requiresOnboarding: true,
    tags: ["notes", "markdown", "writing", "documents"],
  },
  {
    id: "planner",
    name: "Planner",
    description: "Tasks and project management",
    icon: "check-square",
    color: "#00D9FF",
    routeName: "Planner",
    tier: "core",
    category: "productivity",
    isCore: true,
    requiresOnboarding: true,
    tags: ["tasks", "todos", "projects", "gtd"],
  },
  {
    id: "calendar",
    name: "Calendar",
    description: "Event scheduling and management",
    icon: "calendar",
    color: "#00D9FF",
    routeName: "Calendar",
    tier: "core",
    category: "organization",
    isCore: true,
    requiresOnboarding: true,
    tags: ["events", "schedule", "appointments", "meetings"],
  },
  {
    id: "email",
    name: "Email",
    description: "Professional email management",
    icon: "mail",
    color: "#00D9FF",
    routeName: "Email",
    tier: "core",
    category: "communication",
    isCore: true,
    requiresOnboarding: true,
    tags: ["email", "inbox", "messages", "threads"],
  },
  {
    id: "messages",
    name: "Messages",
    description: "P2P messaging and group chat",
    icon: "message-circle",
    color: "#00D9FF",
    routeName: "Messages",
    tier: "core",
    category: "communication",
    isCore: true,
    requiresOnboarding: true,
    tags: ["chat", "messaging", "conversations", "dm"],
  },
  {
    id: "lists",
    name: "Lists",
    description: "Checklists and to-do lists",
    icon: "list",
    color: "#00D9FF",
    routeName: "Lists",
    tier: "core",
    category: "organization",
    isCore: true,
    requiresOnboarding: false,
    tags: ["lists", "checklists", "todos", "shopping"],
  },
  {
    id: "alerts",
    name: "Alerts",
    description: "Smart reminders and alarms",
    icon: "bell",
    color: "#00D9FF",
    routeName: "Alerts",
    tier: "core",
    category: "utilities",
    isCore: true,
    requiresOnboarding: false,
    tags: ["reminders", "alarms", "notifications", "alerts"],
  },
  {
    id: "contacts",
    name: "Contacts",
    description: "Contact management",
    icon: "users",
    color: "#00D9FF",
    routeName: "Contacts",
    tier: "core",
    category: "communication",
    isCore: true,
    requiresOnboarding: false,
    tags: ["contacts", "people", "address book", "phonebook"],
  },
  {
    id: "translator",
    name: "Translator",
    description: "Real-time language translation",
    icon: "globe",
    color: "#00D9FF",
    routeName: "Translator",
    tier: "core",
    category: "utilities",
    isCore: true,
    requiresOnboarding: false,
    tags: ["translation", "languages", "international", "speech"],
  },
  {
    id: "photos",
    name: "Photos",
    description: "Photo gallery and management",
    icon: "image",
    color: "#00D9FF",
    routeName: "Photos",
    tier: "core",
    category: "lifestyle",
    isCore: true,
    requiresOnboarding: false,
    tags: ["photos", "images", "gallery", "pictures"],
  },
  {
    id: "budget",
    name: "Budget",
    description: "Personal finance tracking",
    icon: "dollar-sign",
    color: "#00D9FF",
    routeName: "Budget",
    tier: "core",
    category: "finance",
    isCore: true,
    requiresOnboarding: false,
    tags: ["budget", "finance", "money", "expenses", "spending"],
  },
];

/**
 * Module Registry Class
 */
class ModuleRegistry {
  private modules: ModuleDefinition[];
  private usageCache: Map<ModuleType, ModuleUsage>;

  constructor() {
    this.modules = MODULES;
    this.usageCache = new Map();
  }

  /**
   * Get All Modules
   *
   * @param tier - Optional tier filter
   * @returns Array of module definitions
   */
  getAllModules(tier?: ModuleTier): ModuleDefinition[] {
    if (tier) {
      return this.modules.filter((m) => m.tier === tier);
    }
    return [...this.modules];
  }

  /**
   * Get Core Modules
   *
   * Plain English: "Get the 14 production-ready modules"
   *
   * @returns Array of core modules
   */
  getCoreModules(): ModuleDefinition[] {
    return this.modules.filter((m) => m.isCore);
  }

  /**
   * Get Modules For Onboarding
   *
   * Plain English: "Get modules to show when user first starts"
   * These are modules suitable for initial selection (3 modules to start).
   *
   * @returns Array of modules for onboarding
   */
  getOnboardingModules(): ModuleDefinition[] {
    return this.modules.filter((m) => m.requiresOnboarding);
  }

  /**
   * Get Module By ID
   *
   * @param id - Module ID
   * @returns Module definition or undefined
   */
  getModule(id: ModuleType): ModuleDefinition | undefined {
    return this.modules.find((m) => m.id === id);
  }

  /**
   * Get Modules By Category
   *
   * @param category - Module category
   * @returns Array of modules in category
   */
  getModulesByCategory(category: ModuleCategory): ModuleDefinition[] {
    return this.modules.filter((m) => m.category === category);
  }

  /**
   * Search Modules
   *
   * Plain English: "Find modules by name, description, or tags"
   *
   * @param query - Search query
   * @returns Matching modules
   */
  searchModules(query: string): ModuleDefinition[] {
    const lowerQuery = query.toLowerCase();

    return this.modules.filter((m) => {
      return (
        m.name.toLowerCase().includes(lowerQuery) ||
        m.description.toLowerCase().includes(lowerQuery) ||
        m.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
      );
    });
  }

  /**
   * Get Module Usage
   *
   * @param moduleId - Module ID
   * @returns Usage stats or undefined
   */
  getUsage(moduleId: ModuleType): ModuleUsage | undefined {
    return this.usageCache.get(moduleId);
  }

  /**
   * Record Module Open
   *
   * Plain English: "Track that user opened this module"
   * Used for usage-based sorting and analytics.
   *
   * @param moduleId - Module ID
   */
  recordModuleOpen(moduleId: ModuleType): void {
    const existing = this.usageCache.get(moduleId);

    if (existing) {
      this.usageCache.set(moduleId, {
        ...existing,
        openCount: existing.openCount + 1,
        lastOpened: new Date().toISOString(),
      });
    } else {
      this.usageCache.set(moduleId, {
        moduleId,
        openCount: 1,
        lastOpened: new Date().toISOString(),
        totalTimeSpent: 0,
        favorited: false,
      });
    }
  }

  /**
   * Get Most Used Modules
   *
   * Plain English: "Get modules sorted by how often user opens them"
   * Used for sidebar ordering.
   *
   * @param limit - Max number of modules to return
   * @returns Array of most-used modules
   */
  getMostUsedModules(limit: number = 10): ModuleDefinition[] {
    const usageArray = Array.from(this.usageCache.values());
    usageArray.sort((a, b) => b.openCount - a.openCount);

    const topIds = usageArray.slice(0, limit).map((u) => u.moduleId);
    return topIds
      .map((id) => this.getModule(id))
      .filter((m): m is ModuleDefinition => m !== undefined);
  }

  /**
   * Get Recently Used Modules
   *
   * Plain English: "Get modules user opened recently"
   *
   * @param limit - Max number of modules to return
   * @returns Array of recently used modules
   */
  getRecentlyUsedModules(limit: number = 5): ModuleDefinition[] {
    const usageArray = Array.from(this.usageCache.values());
    usageArray.sort((a, b) => {
      return (
        new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime()
      );
    });

    const recentIds = usageArray.slice(0, limit).map((u) => u.moduleId);
    return recentIds
      .map((id) => this.getModule(id))
      .filter((m): m is ModuleDefinition => m !== undefined);
  }

  /**
   * Toggle Favorite
   *
   * @param moduleId - Module ID
   * @returns New favorited state
   */
  toggleFavorite(moduleId: ModuleType): boolean {
    const usage = this.usageCache.get(moduleId);

    if (usage) {
      const newState = !usage.favorited;
      this.usageCache.set(moduleId, {
        ...usage,
        favorited: newState,
      });
      return newState;
    }

    // Create new usage entry
    this.usageCache.set(moduleId, {
      moduleId,
      openCount: 0,
      lastOpened: new Date().toISOString(),
      totalTimeSpent: 0,
      favorited: true,
    });
    return true;
  }

  /**
   * Get Favorite Modules
   *
   * @returns Array of favorited modules
   */
  getFavoriteModules(): ModuleDefinition[] {
    const favoriteIds = Array.from(this.usageCache.values())
      .filter((u) => u.favorited)
      .map((u) => u.moduleId);

    return favoriteIds
      .map((id) => this.getModule(id))
      .filter((m): m is ModuleDefinition => m !== undefined);
  }

  /**
   * Get Modules for Sidebar
   *
   * Plain English: "Get the top 10 modules to show in sidebar"
   * Uses combination of:
   * - Favorites (always included)
   * - Most used
   * - Recently used
   * - Command center (always first)
   *
   * @returns Array of modules for sidebar
   */
  getModulesForSidebar(): ModuleDefinition[] {
    const commandCenter = this.getModule("command");
    const favorites = this.getFavoriteModules();
    const mostUsed = this.getMostUsedModules(8);

    // Combine and deduplicate
    const modules = new Map<ModuleType, ModuleDefinition>();

    // Command center always first
    if (commandCenter) {
      modules.set("command", commandCenter);
    }

    // Add favorites
    favorites.forEach((m) => modules.set(m.id, m));

    // Add most used up to limit of 10
    for (const m of mostUsed) {
      if (modules.size >= 10) break;
      modules.set(m.id, m);
    }

    // If still room, add core modules
    if (modules.size < 10) {
      const coreModules = this.getCoreModules();
      for (const m of coreModules) {
        if (modules.size >= 10) break;
        if (!modules.has(m.id)) {
          modules.set(m.id, m);
        }
      }
    }

    return Array.from(modules.values());
  }
}

// Export singleton instance
export const moduleRegistry = new ModuleRegistry();
