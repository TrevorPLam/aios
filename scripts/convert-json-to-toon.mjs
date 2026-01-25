#!/usr/bin/env node
// Convert JSON files to .toon format
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join, basename } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function jsonToToon(obj, indent = 0) {
  const indentStr = "  ".repeat(indent);
  let result = "";

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      if (value.length === 0) {
        result += `${indentStr}${key}: []\n`;
      } else if (typeof value[0] === "object" && value[0] !== null) {
        // Array of objects
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
        // Array of primitives
        result += `${indentStr}${key}[${value.length}]: ${value.map((v) => {
          if (typeof v === "string" && (v.includes(",") || v.includes(":") || v.includes("\n"))) {
            return `"${v.replace(/"/g, '\\"')}"`;
          }
          return String(v);
        }).join(", ")}\n`;
      }
    } else if (typeof value === "object") {
      // Nested object
      result += `${indentStr}${key}:\n`;
      result += jsonToToon(value, indent + 1);
    } else {
      // Primitive value
      if (typeof value === "string" && (value.includes(",") || value.includes(":") || value.includes("\n"))) {
        result += `${indentStr}${key}: "${value.replace(/"/g, '\\"')}"\n`;
      } else {
        result += `${indentStr}${key}: ${String(value)}\n`;
      }
    }
  }

  return result;
}

function convertJsonToToon(jsonPath, toonPath, metadata = {}) {
  const jsonContent = readFileSync(jsonPath, "utf-8");
  const jsonData = JSON.parse(jsonContent);

  const header = `type: ${metadata.type || "governance"}
id: ${metadata.id || basename(toonPath)}
filepath: ${toonPath}
$schema: http://json-schema.org/draft-07/schema#
version: ${jsonData.version || "1.0.0"}
purpose: ${metadata.purpose || jsonData.description || ""}
${metadata.last_updated ? `last_updated: ${metadata.last_updated}\n` : ""}`;

  const toonContent = header + "\n" + jsonToToon(jsonData);
  writeFileSync(toonPath, toonContent, "utf-8");
  console.log(`✅ Converted ${jsonPath} → ${toonPath}`);
}

// Convert files
const files = [
  {
    json: ".repo/policy/automation-commands.json",
    toon: ".repo/policy/automation-commands.toon",
    metadata: { type: "automation_catalog", purpose: "Non-AI powered automation commands available for agentic orchestration" }
  },
  {
    json: ".repo/policy/constitution.json",
    toon: ".repo/policy/constitution.toon",
    metadata: { type: "governance", purpose: "Behavioral governance rules - what to do, not how to do it" }
  },
  {
    json: ".repo/policy/procedures.json",
    toon: ".repo/policy/procedures.toon",
    metadata: { type: "governance", purpose: "Procedural instructions - how to do things step-by-step" }
  },
  {
    json: ".repo/automation/AUTOMATION_MANIFEST.json",
    toon: ".repo/automation/AUTOMATION_MANIFEST.toon",
    metadata: { type: "manifest", purpose: "Complete guide for injecting automation scripts and AI infrastructure into other repositories" }
  }
];

files.forEach(({ json, toon, metadata }) => {
  try {
    convertJsonToToon(json, toon, metadata);
  } catch (error) {
    console.error(`❌ Error converting ${json}:`, error.message);
  }
});
