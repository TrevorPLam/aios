#!/usr/bin/env node

/**
 * Agent Trace Validation Script
 *
 * Validates trace logs against AGENT_TRACE_SCHEMA.json
 *
 * Usage:
 *   node .repo/automation/scripts/validate-agent-trace.js <trace-log-path>
 *
 * Exit codes:
 *   0 - Valid
 *   1 - Invalid
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPO_ROOT = join(__dirname, "../../../..");
const TRACE_SCHEMA_PATH = join(
  REPO_ROOT,
  ".repo/templates/AGENT_TRACE_SCHEMA.json",
);

function main() {
  const traceLogPath = process.argv[2];

  if (!traceLogPath) {
    console.error("Usage: node validate-agent-trace.js <trace-log-path>");
    process.exit(1);
  }

  if (!existsSync(traceLogPath)) {
    console.error(`Trace log not found: ${traceLogPath}`);
    process.exit(1);
  }

  if (!existsSync(TRACE_SCHEMA_PATH)) {
    console.error(`Schema not found: ${TRACE_SCHEMA_PATH}`);
    process.exit(1);
  }

  const schema = JSON.parse(readFileSync(TRACE_SCHEMA_PATH, "utf-8"));
  const traceLog = JSON.parse(readFileSync(traceLogPath, "utf-8"));

  const errors = [];

  // Check required fields
  for (const field of schema.required || []) {
    if (!(field in traceLog)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Check field types
  for (const [field, spec] of Object.entries(schema.properties || {})) {
    if (field in traceLog) {
      const value = traceLog[field];
      if (spec.type === "array" && !Array.isArray(value)) {
        errors.push(`Field '${field}' must be an array`);
      } else if (spec.type === "string" && typeof value !== "string") {
        errors.push(`Field '${field}' must be a string`);
      }

      // Check array item types
      if (spec.type === "array" && spec.items) {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (spec.items.type === "string" && typeof item !== "string") {
              errors.push(`Field '${field}[${index}]' must be a string`);
            }
          });
        }
      }
    }
  }

  if (errors.length > 0) {
    console.error("❌ Trace log validation failed:");
    errors.forEach((e) => console.error(`   - ${e}`));
    process.exit(1);
  }

  console.log("✅ Trace log is valid");
  process.exit(0);
}

main();
