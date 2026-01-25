#!/usr/bin/env node
// Validate .agent-context.toon or .agent-context.json file against schema
// Usage: node validate-agent-context.js <context-file> [--check-files] [--check-boundaries] [--check-links]

const fs = require("fs");
const path = require("path");

// Simple .toon parser (basic implementation)
function parseToonFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const result = {};
  let currentPath = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("type:") || trimmed.startsWith("id:") || trimmed.startsWith("filepath:") || trimmed.startsWith("$schema:") || trimmed.startsWith("version:") || trimmed.startsWith("purpose:")) continue;

    const keyMatch = trimmed.match(/^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\[(\d+)\](?:\{([^}]+)\})?)?:\s*(.*)$/);
    if (keyMatch) {
      const [, indent, key, , arrayLen, fields, value] = keyMatch;
      const indentLevel = indent.length / 2;

      currentPath = currentPath.slice(0, indentLevel);
      currentPath.push(key);

      let target = result;
      for (let i = 0; i < currentPath.length - 1; i++) {
        if (!target[currentPath[i]]) {
          target[currentPath[i]] = {};
        }
        target = target[currentPath[i]];
      }

      const finalKey = currentPath[currentPath.length - 1];

      if (arrayLen) {
        if (fields) {
          target[finalKey] = [];
        } else {
          const values = value.split(",").map(v => parseValue(v.trim()));
          target[finalKey] = values;
        }
      } else {
        target[finalKey] = parseValue(value);
      }
    }
  }

  return result;
}

function parseValue(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null" || value === "") return null;
  if (value.match(/^-?\d+$/)) return parseInt(value, 10);
  if (value.match(/^-?\d+\.\d+$/)) return parseFloat(value);
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).replace(/\\"/g, '"');
  }
  return value;
}

// Try to load ajv, fall back to basic validation if not available
let Ajv;
let ajv;
try {
  Ajv = require("ajv");
  ajv = new Ajv({ allErrors: true, strict: false });
} catch (err) {
  console.warn(
    "⚠️  ajv not found. Install with: npm install ajv (in .repo/automation/scripts/)",
  );
  console.warn("   Falling back to basic validation only.");
}

const contextFile = process.argv[2];
const checkFiles = process.argv.includes("--check-files");
const checkBoundaries = process.argv.includes("--check-boundaries");
const checkLinks = process.argv.includes("--check-links");

if (!contextFile) {
  console.error(
    "Usage: node validate-agent-context.js <context-file> [--check-files] [--check-boundaries] [--check-links]",
  );
  process.exit(1);
}

if (!fs.existsSync(contextFile)) {
  console.error(`File not found: ${contextFile}`);
  process.exit(1);
}

// Get repo root (assumes script is in .repo/automation/scripts/)
const REPO_ROOT = path.resolve(__dirname, "../../..");
const SCHEMA_FILE = path.join(
  REPO_ROOT,
  ".repo/templates/AGENT_CONTEXT_SCHEMA.json",
);

let errors = [];
let warnings = [];

function addError(msg) {
  errors.push(msg);
}

function addWarning(msg) {
  warnings.push(msg);
}

try {
  let content;
  if (contextFile.endsWith(".toon")) {
    // Parse .toon file
    content = parseToonFile(contextFile);
  } else {
    // Parse .json file
    content = JSON.parse(fs.readFileSync(contextFile, "utf8"));
  }

  // Load and validate against JSON schema if ajv is available
  if (ajv && fs.existsSync(SCHEMA_FILE)) {
    const schema = JSON.parse(fs.readFileSync(SCHEMA_FILE, "utf8"));
    const validate = ajv.compile(schema);
    const valid = validate(content);

    if (!valid) {
      validate.errors.forEach((err) => {
        addError(`${err.instancePath || "root"}: ${err.message}`);
      });
    }
  } else {
    // Fallback: Basic validation
    const required = ["version", "type", "folder"];
    const missing = required.filter((field) => !content[field]);

    if (missing.length > 0) {
      addError(`Missing required fields: ${missing.join(", ")}`);
    }

    if (content.type && content.type !== "folder_context") {
      addError(`Invalid type: ${content.type} (expected: folder_context)`);
    }

    if (content.folder && !content.folder.path) {
      addError("Missing folder.path");
    }
  }

  // File path validation
  if (checkFiles && content.folder && content.folder.path) {
    const folderPath = path.join(REPO_ROOT, content.folder.path);
    if (!fs.existsSync(folderPath)) {
      addError(`Folder path does not exist: ${content.folder.path}`);
    } else if (!fs.statSync(folderPath).isDirectory()) {
      addError(`Folder path is not a directory: ${content.folder.path}`);
    }

    // Check if patterns match actual code (basic check)
    if (content.patterns) {
      Object.keys(content.patterns).forEach((patternName) => {
        // This is a basic check - could be enhanced to actually parse code
        const pattern = content.patterns[patternName];
        if (typeof pattern !== "string" || pattern.length === 0) {
          addWarning(`Pattern "${patternName}" is empty or invalid`);
        }
      });
    }
  }

  // Boundary validation
  if (checkBoundaries && content.boundaries) {
    if (content.boundaries.can_import_from) {
      content.boundaries.can_import_from.forEach((importPath) => {
        const fullPath = path.join(REPO_ROOT, importPath);
        if (!fs.existsSync(fullPath)) {
          addWarning(
            `Boundary can_import_from path does not exist: ${importPath}`,
          );
        }
      });
    }
    if (content.boundaries.cannot_import_from) {
      content.boundaries.cannot_import_from.forEach((importPath) => {
        const fullPath = path.join(REPO_ROOT, importPath);
        if (!fs.existsSync(fullPath)) {
          addWarning(
            `Boundary cannot_import_from path does not exist: ${importPath}`,
          );
        }
      });
    }
  }

  // Link validation
  if (checkLinks && content.quick_links) {
    Object.keys(content.quick_links).forEach((linkType) => {
      const linkPath = content.quick_links[linkType];
      if (linkPath) {
        const fullPath = path.join(REPO_ROOT, linkPath);
        if (!fs.existsSync(fullPath)) {
          addWarning(
            `Quick link "${linkType}" points to non-existent file: ${linkPath}`,
          );
        }
      }
    });
  }

  // Output results
  if (errors.length > 0) {
    console.error("❌ Validation failed:");
    errors.forEach((err) => console.error(`   ${err}`));
    console.error(
      "\nSee: .repo/templates/AGENT_CONTEXT_SCHEMA.json for schema",
    );
    console.error("Note: .toon files are converted to JSON for validation");
    console.error("See: .repo/docs/TROUBLESHOOTING.md for help");
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn("⚠️  Warnings:");
    warnings.forEach((warn) => console.warn(`   ${warn}`));
    console.warn("\nWarnings are non-blocking but should be addressed");
  }

  console.log(`✅ ${contextFile} is valid`);
  process.exit(0);
} catch (e) {
  console.error(`Error validating ${contextFile}:`, e.message);
  process.exit(1);
}
