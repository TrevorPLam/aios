#!/usr/bin/env node
// Generate .agent-context.toon file for a folder
// Usage: node generate-agent-context.js <folder_path>

const fs = require("fs");
const path = require("path");

const folderPath = process.argv[2];

if (!folderPath) {
  console.error("Usage: node generate-agent-context.js <folder_path>");
  process.exit(1);
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

const relativePath = path.relative(process.cwd(), folderPath).replace(/\\/g, "/") || ".";
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

const toonContent = header + jsonToToon(template);
const outputPath = path.join(folderPath, ".agent-context.toon");
fs.writeFileSync(outputPath, toonContent, "utf-8");
console.log(`Created ${outputPath}`);
console.log("Please fill in the template with folder-specific information.");
