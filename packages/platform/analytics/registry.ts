/**
 * Module Registry
 *
 * Single source of truth for module metadata used by both navigation and analytics.
 * Centralizes module IDs, display names, routes, and categories.
 */

import { ModuleType } from "@contracts/models/types";
import { ModuleMetadata, ModuleCategory } from "./types";

/**
 * Module Registry
 *
 * Maps each module to its metadata including:
 * - id: ModuleType identifier
 * - displayName: Human-readable name
 * - route: Navigation route name
 * - category: Module category for grouping/filtering
 */
export const MODULE_REGISTRY: Record<ModuleType, ModuleMetadata> = {
  command: {
    id: "command",
    displayName: "Command Center",
    route: "CommandCenter",
    category: "system",
  },
  notebook: {
    id: "notebook",
    displayName: "Notebook",
    route: "Notebook",
    category: "productivity",
  },
  planner: {
    id: "planner",
    displayName: "Planner",
    route: "Planner",
    category: "productivity",
  },
  calendar: {
    id: "calendar",
    displayName: "Calendar",
    route: "Calendar",
    category: "productivity",
  },
  email: {
    id: "email",
    displayName: "Email",
    route: "Email",
    category: "communication",
  },
  messages: {
    id: "messages",
    displayName: "Messages",
    route: "Messages",
    category: "communication",
  },
  lists: {
    id: "lists",
    displayName: "Lists",
    route: "Lists",
    category: "productivity",
  },
  alerts: {
    id: "alerts",
    displayName: "Alerts",
    route: "Alerts",
    category: "utility",
  },
  photos: {
    id: "photos",
    displayName: "Photos",
    route: "Photos",
    category: "media",
  },
  contacts: {
    id: "contacts",
    displayName: "Contacts",
    route: "Contacts",
    category: "communication",
  },
  translator: {
    id: "translator",
    displayName: "Translator",
    route: "Translator",
    category: "utility",
  },
  budget: {
    id: "budget",
    displayName: "Budget",
    route: "Budget",
    category: "productivity",
  },
  history: {
    id: "history",
    displayName: "History",
    route: "History",
    category: "utility",
  },
};

/**
 * Get module metadata by ID
 */
export function getModuleMetadata(moduleId: ModuleType): ModuleMetadata {
  return MODULE_REGISTRY[moduleId];
}

/**
 * Get all modules by category
 */
export function getModulesByCategory(
  category: ModuleCategory,
): ModuleMetadata[] {
  return Object.values(MODULE_REGISTRY).filter((m) => m.category === category);
}

/**
 * Get all module IDs
 */
export function getAllModuleIds(): ModuleType[] {
  return Object.keys(MODULE_REGISTRY) as ModuleType[];
}

/**
 * Validate if a string is a valid module ID
 */
export function isValidModuleId(id: string): id is ModuleType {
  return id in MODULE_REGISTRY;
}
