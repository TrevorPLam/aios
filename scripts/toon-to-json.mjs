#!/usr/bin/env node
// Helper module to convert .toon files to JSON for validation
// This allows validation scripts to work with both .json and .toon files

import { readFileSync } from "fs";

/**
 * Parse a .toon file and convert it to a JSON object
 * This is a simplified parser that handles the basic .toon format
 */
export function parseToonFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  // Skip header (lines until first empty line or first data line)
  let dataStart = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === "" || lines[i].includes(":")) {
      dataStart = i;
      break;
    }
  }

  const dataLines = lines.slice(dataStart);
  const result = {};
  let currentPath = [];

  for (const line of dataLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    // Match key: value or key[N]: value or key[N]{fields}:
    const keyMatch = trimmed.match(/^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\[(\d+)\](?:\{([^}]+)\})?)?:\s*(.*)$/);
    if (keyMatch) {
      const [, indent, key, , arrayLen, fields, value] = keyMatch;
      const indentLevel = indent.length / 2;

      // Adjust current path based on indent
      currentPath = currentPath.slice(0, indentLevel);
      currentPath.push(key);

      // Set value
      let target = result;
      for (let i = 0; i < currentPath.length - 1; i++) {
        if (!target[currentPath[i]]) {
          target[currentPath[i]] = {};
        }
        target = target[currentPath[i]];
      }

      const finalKey = currentPath[currentPath.length - 1];

      if (arrayLen) {
        // Array
        if (fields) {
          // Array of objects - will be handled by next lines
          target[finalKey] = [];
        } else {
          // Array of primitives
          const values = value.split(",").map(v => parseValue(v.trim()));
          target[finalKey] = values;
        }
      } else {
        // Single value
        target[finalKey] = parseValue(value);
      }
    } else if (trimmed.match(/^\s+[^:]+(,|$)/)) {
      // Array item line (for arrays of objects)
      // This is a simplified parser - may need enhancement
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
