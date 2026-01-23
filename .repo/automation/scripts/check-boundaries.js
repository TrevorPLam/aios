#!/usr/bin/env node

/**
 * Boundary Checker
 *
 * Enforces architectural boundaries defined in BOUNDARIES.md.
 * Checks import statements against allowed import direction: ui → domain → data → platform
 *
 * Usage:
 *   node .repo/automation/scripts/check-boundaries.js [--path <path>]
 *
 * Exit codes:
 *   0 - No violations found
 *   1 - Violations found
 */

import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, dirname, relative, parse } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPO_ROOT = join(__dirname, "../../../..");
const BOUNDARIES_POLICY = join(REPO_ROOT, ".repo/policy/BOUNDARIES.md");
const MANIFEST_PATH = join(REPO_ROOT, ".repo/repo.manifest.yaml");

// Allowed import direction: ui → domain → data → platform
const ALLOWED_IMPORTS = {
  ui: ["domain", "design-system", "contracts"],
  domain: ["data", "contracts"],
  data: ["platform", "contracts", "domain"],
  platform: [], // Platform depends on nothing
};

// Cross-feature imports require ADR
const CROSS_FEATURE_REQUIRES_ADR = true;

// Parse allowed exceptions from manifest
function getAllowedExceptions() {
  if (!existsSync(MANIFEST_PATH)) {
    return [];
  }

  try {
    const content = readFileSync(MANIFEST_PATH, "utf-8");
    // Simple YAML parsing for edges array
    const edgesMatch = content.match(/edges:\s*\[(.*?)\]/s);
    if (edgesMatch) {
      // For now, return empty - full YAML parsing would require a library
      // This is a placeholder for manifest exceptions
      return [];
    }
  } catch (error) {
    // Ignore parsing errors
  }

  return [];
}

// Determine layer from file path
function getLayer(filePath) {
  const relativePath = relative(REPO_ROOT, filePath);

  // Check for packages/features structure
  if (relativePath.includes("packages/features/")) {
    if (relativePath.includes("/ui/")) return "ui";
    if (relativePath.includes("/domain/")) return "domain";
    if (relativePath.includes("/data/")) return "data";
  }

  // Check for packages/platform
  if (relativePath.includes("packages/platform/")) {
    return "platform";
  }

  // Check for packages/design-system
  if (relativePath.includes("packages/design-system/")) {
    return "design-system";
  }

  // Check for packages/contracts
  if (relativePath.includes("packages/contracts/")) {
    return "contracts";
  }

  // Check for apps (can import from features)
  if (relativePath.includes("apps/")) {
    return "app";
  }

  return null;
}

// Determine feature from file path
function getFeature(filePath) {
  const match = filePath.match(/packages\/features\/([^/]+)/);
  return match ? match[1] : null;
}

// Check if import is cross-feature
function isCrossFeatureImport(fromPath, toPath) {
  const fromFeature = getFeature(fromPath);
  const toFeature = getFeature(toPath);

  return fromFeature && toFeature && fromFeature !== toFeature;
}

// Parse import statements from file
function parseImports(filePath, content) {
  const imports = [];

  // Match import statements
  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];

    // Skip node_modules and external packages
    if (
      importPath.startsWith(".") ||
      importPath.startsWith("/") ||
      importPath.startsWith("@")
    ) {
      imports.push({
        from: filePath,
        to: importPath,
        line: content.substring(0, match.index).split("\n").length,
      });
    }
  }

  return imports;
}

// Resolve import path to actual file
function resolveImportPath(fromFile, importPath) {
  const fromDir = dirname(fromFile);

  // Handle relative imports
  if (importPath.startsWith(".")) {
    return join(fromDir, importPath);
  }

  // Handle package aliases (@features/, @platform/, etc.)
  if (importPath.startsWith("@")) {
    const aliasMatch = importPath.match(
      /^@(features|platform|design-system|contracts)\/(.+)$/,
    );
    if (aliasMatch) {
      const [, packageType, rest] = aliasMatch;
      return join(REPO_ROOT, "packages", packageType, rest);
    }
  }

  return null;
}

// Check if import violates boundaries
function checkImportViolation(fromFile, toFile, importPath) {
  const fromLayer = getLayer(fromFile);
  const toLayer = getLayer(toFile);

  if (!fromLayer || !toLayer) {
    return null; // Can't determine layers, skip
  }

  // Apps can import from features (allowed)
  if (fromLayer === "app") {
    return null;
  }

  // Check cross-feature imports
  if (isCrossFeatureImport(fromFile, toFile)) {
    return {
      type: "cross-feature",
      message: `Cross-feature import requires ADR: ${relative(REPO_ROOT, fromFile)} → ${relative(REPO_ROOT, toFile)}`,
    };
  }

  // Check layer boundaries
  const allowed = ALLOWED_IMPORTS[fromLayer] || [];
  if (!allowed.includes(toLayer)) {
    return {
      type: "layer-violation",
      message: `Layer violation: ${fromLayer} cannot import from ${toLayer}. Allowed: ${allowed.join(", ") || "nothing"}`,
    };
  }

  return null;
}

// Scan a single file
function scanFile(filePath) {
  const violations = [];

  try {
    const content = readFileSync(filePath, "utf-8");
    const imports = parseImports(filePath, content);

    for (const imp of imports) {
      const resolvedPath = resolveImportPath(filePath, imp.to);

      if (
        (resolvedPath && existsSync(resolvedPath + ".ts")) ||
        existsSync(resolvedPath + ".tsx")
      ) {
        const actualPath = existsSync(resolvedPath + ".ts")
          ? resolvedPath + ".ts"
          : resolvedPath + ".tsx";
        const violation = checkImportViolation(filePath, actualPath, imp.to);

        if (violation) {
          violations.push({
            file: relative(REPO_ROOT, filePath),
            line: imp.line,
            ...violation,
          });
        }
      }
    }
  } catch (error) {
    // Skip files that can't be read
  }

  return violations;
}

// Recursively scan directory
function scanDirectory(dirPath, allViolations = []) {
  if (!existsSync(dirPath)) {
    return allViolations;
  }

  const entries = readdirSync(dirPath);

  for (const entry of entries) {
    const fullPath = join(dirPath, entry);

    // Skip ignored directories
    if (
      entry.startsWith(".") ||
      entry === "node_modules" ||
      entry === "dist" ||
      entry === "build"
    ) {
      continue;
    }

    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      scanDirectory(fullPath, allViolations);
    } else if (
      stat.isFile() &&
      (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx"))
    ) {
      // Only scan TypeScript files in packages directory
      if (fullPath.includes("packages/") || fullPath.includes("apps/")) {
        const violations = scanFile(fullPath);
        allViolations.push(...violations);
      }
    }
  }

  return allViolations;
}

// Main function
function main() {
  console.log("🔗 Boundary Checker");
  console.log("==================\n");

  const scanPath = process.argv.includes("--path")
    ? process.argv[process.argv.indexOf("--path") + 1]
    : join(REPO_ROOT, "packages");

  console.log(`🔍 Scanning: ${scanPath}\n`);

  const violations = scanDirectory(scanPath);

  if (violations.length > 0) {
    console.error(`❌ Found ${violations.length} boundary violation(s):\n`);

    violations.forEach((v) => {
      console.error(`  File: ${v.file}:${v.line}`);
      console.error(`  Type: ${v.type}`);
      console.error(`  Issue: ${v.message}`);
      console.error("");
    });

    console.error(
      "⚠️  Boundary violations detected. Fix or create ADR/waiver.",
    );
    process.exit(1);
  } else {
    console.log("✅ No boundary violations found");
    process.exit(0);
  }
}

main();
