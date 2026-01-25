#!/usr/bin/env node
// Generate .agent-context.toon files for folders that don't have them
// Usage: node scripts/generate-missing-agent-contexts.mjs [--dry-run] [--folder <path>]

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DRY_RUN = process.argv.includes("--dry-run");
const SPECIFIC_FOLDER = process.argv.find((arg) => arg.startsWith("--folder="))?.split("=")[1];

// Directories to ignore
const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  ".expo",
  ".metro-cache",
  "__pycache__",
  ".next",
  "dist",
  "build",
  ".cache",
  ".turbo",
  "coverage",
  ".nyc_output",
  ".husky",
  ".vscode",
  ".github",
  ".repo",
]);

// Directories that should have agent context files
const TARGET_DIRS = [
  "apps",
  "apps/api",
  "apps/mobile",
  "apps/web",
  "packages",
  "packages/features",
  "packages/platform",
  "packages/design-system",
  "packages/contracts",
  "frontend",
  "scripts",
];

function shouldGenerateContext(dirPath) {
  const dirName = path.basename(dirPath);
  const relativePath = path.relative(process.cwd(), dirPath);

  // Skip ignored directories
  if (IGNORE_DIRS.has(dirName) || dirName.startsWith(".")) {
    return false;
  }

  // Skip if already has context file (.toon or .json)
  const contextPathToon = path.join(dirPath, ".agent-context.toon");
  const contextPathJson = path.join(dirPath, ".agent-context.json");
  if (fs.existsSync(contextPathToon) || fs.existsSync(contextPathJson)) {
    return false;
  }

  // Only generate for target directories or subdirectories of target dirs
  const isTargetDir = TARGET_DIRS.some((target) => {
    return relativePath === target || relativePath.startsWith(target + path.sep);
  });

  // Also generate for directories that have source files
  const hasSourceFiles = fs.readdirSync(dirPath).some((file) => {
    const filePath = path.join(dirPath, file);
    try {
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        const ext = path.extname(file);
        return [".ts", ".tsx", ".js", ".jsx", ".py"].includes(ext);
      }
    } catch (e) {
      // Ignore
    }
    return false;
  });

  return isTargetDir || hasSourceFiles;
}

// Helper function to convert object to .toon format
function jsonToToon(obj, indent = 0) {
  const indentStr = "  ".repeat(indent);
  let result = "";

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      if (value.length === 0) {
        result += `${indentStr}${key}: []\n`;
      } else if (typeof value[0] === "object" && value[0] !== null) {
        const fields = Object.keys(value[0]);
        result += `${indentStr}${key}[${value.length}]{${fields.join(",")}}:\n`;
        value.forEach((item) => {
          const values = fields.map((f) => {
            const v = item[f];
            if (v === undefined || v === null) return "";
            if (typeof v === "string" && (v.includes(",") || v.includes(":") || v.includes("\n"))) {
              return `"${v.replace(/"/g, '\\"')}"`;
            }
            if (Array.isArray(v)) {
              return `[${v.join(",")}]`;
            }
            return String(v);
          });
          result += `${indentStr}  ${values.join(",")}\n`;
        });
      } else {
        result += `${indentStr}${key}[${value.length}]: ${value.map((v) => {
          if (typeof v === "string" && (v.includes(",") || v.includes(":") || v.includes("\n"))) {
            return `"${v.replace(/"/g, '\\"')}"`;
          }
          return String(v);
        }).join(", ")}\n`;
      }
    } else if (typeof value === "object") {
      result += `${indentStr}${key}:\n`;
      result += jsonToToon(value, indent + 1);
    } else {
      if (typeof value === "string" && (value.includes(",") || value.includes(":") || value.includes("\n"))) {
        result += `${indentStr}${key}: "${value.replace(/"/g, '\\"')}"\n`;
      } else {
        result += `${indentStr}${key}: ${String(value)}\n`;
      }
    }
  }

  return result;
}

function generateContextFile(dirPath) {
  const relativePath = path.relative(process.cwd(), dirPath).replace(/\\/g, "/") || ".";
  const contextPath = path.join(dirPath, ".agent-context.toon");

  const template = {
    version: "1.0.0",
    type: "folder_context",
    folder: {
      path: relativePath,
      purpose: "TODO: Describe folder purpose",
      layer: "domain",
      depends_on: [],
      used_by: [],
    },
    agent_rules: {
      can_do: [],
      cannot_do: [],
      requires_hitl: [],
    },
    patterns: {},
    boundaries: {
      can_import_from: [],
      cannot_import_from: [],
      cross_module_requires_adr: true,
    },
    quick_links: {
      guide: `${relativePath}/.AGENT.toon`,
      index: `${relativePath}/INDEX.toon`,
      policy: ".repo/policy/constitution.toon",
      best_practices: ".repo/policy/procedures.toon",
    },
    common_tasks: [],
    metrics: {
      files_count: 0,
      last_modified: new Date().toISOString().split("T")[0],
      test_coverage: 0,
    },
  };

  const header = `type: folder_context
id: .agent-context.toon
filepath: ${relativePath}/.agent-context.toon
$schema: http://json-schema.org/draft-07/schema#
version: 1.0.0
purpose: Folder-level agent context for AI agents

`;

  if (DRY_RUN) {
    console.log(`[DRY RUN] Would create: ${contextPath}`);
  } else {
    const toonContent = header + jsonToToon(template);
    fs.writeFileSync(contextPath, toonContent, "utf-8");
    console.log(`✅ Created: ${contextPath}`);
  }
}

function scanDirectory(dirPath, depth = 0) {
  if (depth > 10) return; // Limit recursion

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory() && !IGNORE_DIRS.has(entry.name)) {
        const fullPath = path.join(dirPath, entry.name);

        if (shouldGenerateContext(fullPath)) {
          generateContextFile(fullPath);
        }

        // Recurse into subdirectories
        scanDirectory(fullPath, depth + 1);
      }
    }
  } catch (e) {
    // Ignore errors (permissions, etc.)
  }
}

// Main execution
console.log("🔍 Scanning for folders missing .agent-context.toon files...\n");

if (SPECIFIC_FOLDER) {
  const fullPath = path.resolve(process.cwd(), SPECIFIC_FOLDER);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    if (shouldGenerateContext(fullPath)) {
      generateContextFile(fullPath);
    } else {
      console.log(`ℹ️  ${SPECIFIC_FOLDER} already has .agent-context.toon or doesn't need one`);
    }
  } else {
    console.error(`❌ Directory not found: ${SPECIFIC_FOLDER}`);
    process.exit(1);
  }
} else {
  scanDirectory(process.cwd());
}

if (DRY_RUN) {
  console.log("\n[DRY RUN] No files were created. Run without --dry-run to generate files.");
} else {
  console.log("\n✅ Scan complete!");
}
