#!/usr/bin/env node

/**
 * Governance Verification Script
 *
 * Enforces governance structure, required artifacts, logs, trace schema, HITL/waivers.
 * Validates:
 * - Trace log JSON against AGENT_TRACE_SCHEMA.json
 * - HITL item status from tables
 * - Required artifacts (ADR detection for API/module changes)
 * - Boundary checker verification
 *
 * Usage:
 *   node .repo/automation/scripts/governance-verify.js \
 *     [--trace-log <path>] \
 *     [--hitl-file <path>] \
 *     [--pr-body <path>] \
 *     [--base-ref <ref>]
 *
 * Exit codes:
 *   0 - All checks passed
 *   1 - Hard gate failures (governance integrity violations)
 *   2 - Waiverable gate failures (with auto-generated waiver)
 */

import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, dirname, relative } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPO_ROOT = join(__dirname, "../../../..");
const TRACE_SCHEMA_PATH = join(REPO_ROOT, ".repo/templates/AGENT_TRACE_SCHEMA.json");
const HITL_INDEX_PATH = join(REPO_ROOT, ".repo/policy/HITL.md");
const HITL_ITEMS_DIR = join(REPO_ROOT, ".repo/hitl");
const WAIVERS_DIR = join(REPO_ROOT, ".repo/waivers");
const ADR_DIR = join(REPO_ROOT, ".repo/docs/adr");
const BOUNDARIES_POLICY = join(REPO_ROOT, ".repo/policy/BOUNDARIES.md");

// Parse command line arguments
const args = process.argv.slice(2);
let traceLogPath = null;
let hitlFilePath = HITL_INDEX_PATH;
let prBodyPath = null;
let baseRef = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--trace-log" && i + 1 < args.length) {
    traceLogPath = args[i + 1];
    i++;
  } else if (args[i] === "--hitl-file" && i + 1 < args.length) {
    hitlFilePath = args[i + 1];
    i++;
  } else if (args[i] === "--pr-body" && i + 1 < args.length) {
    prBodyPath = args[i + 1];
    i++;
  } else if (args[i] === "--base-ref" && i + 1 < args.length) {
    baseRef = args[i + 1];
    i++;
  }
}

// Get changed files from git
function getChangedFiles(baseRef = "HEAD") {
  try {
    // Try to get changed files from git
    const command = `git diff --name-only ${baseRef} HEAD 2>/dev/null || git diff --name-only origin/${baseRef}...HEAD 2>/dev/null || echo ""`;
    const output = execSync(command, { cwd: REPO_ROOT, encoding: "utf-8" }).trim();
    if (output) {
      return output.split("\n").filter((f) => f.trim());
    }
  } catch (error) {
    // Git not available or not a git repo
  }
  return [];
}

// Load JSON schema
function loadSchema() {
  if (!existsSync(TRACE_SCHEMA_PATH)) {
    throw new Error(`Trace schema not found: ${TRACE_SCHEMA_PATH}`);
  }
  return JSON.parse(readFileSync(TRACE_SCHEMA_PATH, "utf-8"));
}

// Validate trace log against schema
function validateTraceLog(traceLogPath) {
  if (!traceLogPath) {
    console.log("⚠️  No trace log provided, skipping trace validation");
    return { valid: true, errors: [] };
  }

  if (!existsSync(traceLogPath)) {
    return {
      valid: false,
      errors: [`Trace log not found: ${traceLogPath}`],
    };
  }

  const schema = loadSchema();
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
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Parse HITL status from markdown table
function parseHITLStatus(hitlFilePath) {
  if (!existsSync(hitlFilePath)) {
    return { valid: false, errors: [`HITL index not found: ${hitlFilePath}`], items: [] };
  }

  const content = readFileSync(hitlFilePath, "utf-8");
  const errors = [];
  const items = [];

  // Find Active table
  const activeTableMatch = content.match(/### Active\s*\n\|[^\n]+\n\|[^\n]+\n((?:\|[^\n]+\n?)+)/);
  if (activeTableMatch) {
    const tableRows = activeTableMatch[1].trim().split("\n").filter((row) => row.trim().startsWith("|"));
    for (const row of tableRows) {
      const cells = row.split("|").map((c) => c.trim()).filter((c) => c);
      if (cells.length >= 4) {
        const id = cells[0];
        const category = cells[1];
        const status = cells[2];
        const summary = cells[3];
        items.push({ id, category, status, summary });
      }
    }
  }

  // Check for required HITL items that are not Completed
  const requiredNotCompleted = items.filter(
    (item) => item.status && !["Completed", "Superseded"].includes(item.status)
  );

  if (requiredNotCompleted.length > 0) {
    errors.push(
      `Required HITL items not completed: ${requiredNotCompleted.map((i) => i.id).join(", ")}`
    );
  }

  return {
    valid: requiredNotCompleted.length === 0,
    errors,
    items,
  };
}

// Check for ADR when API/module changes detected
function checkArtifacts(changedFiles = []) {
  const errors = [];
  const warnings = [];

  // Detect API changes
  const apiFiles = changedFiles.filter(
    (f) =>
      f.includes("/api/") ||
      f.includes("/routes") ||
      f.includes("openapi") ||
      f.includes("schema")
  );

  // Detect module/package boundary changes
  const moduleFiles = changedFiles.filter(
    (f) =>
      f.includes("packages/") ||
      f.includes("src/") ||
      (f.includes("index.ts") && (f.includes("features/") || f.includes("platform/")))
  );

  if (apiFiles.length > 0 || moduleFiles.length > 0) {
    // Check if ADR exists
    if (existsSync(ADR_DIR)) {
      const adrFiles = readdirSync(ADR_DIR).filter((f) => f.endsWith(".md"));
      if (adrFiles.length === 0) {
        warnings.push(
          "API/module changes detected but no ADR found. Consider creating an ADR per BOUNDARIES.md"
        );
      }
    } else {
      warnings.push(
        "API/module changes detected but ADR directory not found. Consider creating an ADR per BOUNDARIES.md"
      );
    }
  }

  return { valid: true, errors, warnings };
}

// Validate PR body format
function validatePRBody(prBodyPath) {
  if (!prBodyPath || !existsSync(prBodyPath)) {
    return { valid: true, errors: [], warnings: [] }; // Optional
  }

  const errors = [];
  const warnings = [];
  const content = readFileSync(prBodyPath, "utf-8");

  // Check for required sections
  const requiredSections = [
    { pattern: /##?\s*(filepaths?|files?|changes?)/i, name: "Filepaths" },
    { pattern: /##?\s*(evidence|verification|proof)/i, name: "Evidence" },
  ];

  for (const section of requiredSections) {
    if (!section.pattern.test(content)) {
      warnings.push(`PR body missing '${section.name}' section`);
    }
  }

  // Check for HITL references
  const hitlRefs = content.match(/HITL-\d+/g);
  if (hitlRefs) {
    // Verify HITL items exist (basic check)
    const hitlContent = existsSync(HITL_INDEX_PATH)
      ? readFileSync(HITL_INDEX_PATH, "utf-8")
      : "";
    for (const ref of hitlRefs) {
      if (!hitlContent.includes(ref)) {
        warnings.push(`PR references ${ref} but it's not in HITL index`);
      }
    }
  }

  return { valid: true, errors, warnings };
}

// Validate task format
function validateTaskFormat(todoPath) {
  if (!existsSync(todoPath)) {
    return { valid: true, errors: [], warnings: [] }; // Optional
  }

  const errors = [];
  const warnings = [];
  const content = readFileSync(todoPath, "utf-8");

  // Check for required task fields
  const requiredFields = [
    { pattern: /\[TASK-\d+\]/, name: "Task ID" },
    { pattern: /\*\*Priority\*\*:\s*(P0|P1|P2|P3)/i, name: "Priority" },
    { pattern: /\*\*Status\*\*:/i, name: "Status" },
  ];

  for (const field of requiredFields) {
    if (!field.pattern.test(content)) {
      warnings.push(`Task missing '${field.name}' field`);
    }
  }

  // Check for acceptance criteria
  if (!/Acceptance Criteria/i.test(content) && !/acceptance criteria/i.test(content)) {
    warnings.push("Task missing 'Acceptance Criteria' section");
  }

  return { valid: true, errors, warnings };
}

// Verify boundary checker configuration
function verifyBoundaryChecker() {
  const errors = [];
  const warnings = [];

  // Check if boundary policy exists
  if (!existsSync(BOUNDARIES_POLICY)) {
    errors.push("Boundary policy not found: .repo/policy/BOUNDARIES.md");
    return { valid: false, errors, warnings };
  }

  // Check manifest for boundary checker command
  const manifestPath = join(REPO_ROOT, ".repo/repo.manifest.yaml");
  if (existsSync(manifestPath)) {
    const manifest = readFileSync(manifestPath, "utf-8");
    if (manifest.includes("check:boundaries: \"<UNKNOWN>\"")) {
      warnings.push("Boundary checker command is <UNKNOWN> in manifest. Should be implemented.");
    }
  }

  return { valid: true, errors, warnings };
}

// Main verification function
function main() {
  console.log("🔍 Governance Verification");
  console.log("=========================\n");

  const allErrors = [];
  const allWarnings = [];
  let hasHardFailures = false;

  // 1. Validate trace log (REQUIRED for non-doc changes per Article 2 & Principle 24)
  console.log("📋 Validating trace log...");
  const changedFiles = getChangedFiles(baseRef);
  const isDocOnlyChange = changedFiles.length > 0 && 
    changedFiles.every((f) => 
      f.endsWith(".md") || 
      f.endsWith(".txt") || 
      f.includes("/docs/") || 
      f.includes("/.repo/docs/") ||
      f.includes("/examples/")
    );
  
  if (traceLogPath) {
    const traceResult = validateTraceLog(traceLogPath);
    if (!traceResult.valid) {
      console.error("❌ Trace log validation failed:");
      traceResult.errors.forEach((e) => console.error(`   - ${e}`));
      allErrors.push(...traceResult.errors);
      hasHardFailures = true;
    } else {
      console.log("✅ Trace log valid\n");
    }
  } else if (!isDocOnlyChange && changedFiles.length > 0) {
    // Trace log is REQUIRED for non-documentation changes
    console.error("❌ Trace log is REQUIRED for non-documentation changes");
    console.error("   Per Article 2 (Verifiable over Persuasive) and Principle 24 (Logs Required for Non-Docs)");
    console.error("   Create a trace log using:");
    console.error("   node .repo/automation/scripts/create-trace-log.js --intent '<intent>' --files '<files>' --commands '<commands>' --evidence '<evidence>'");
    console.error(`   Changed files: ${changedFiles.slice(0, 5).join(", ")}${changedFiles.length > 5 ? "..." : ""}`);
    allErrors.push("Trace log required for non-documentation changes");
    hasHardFailures = true;
  } else if (isDocOnlyChange) {
    console.log("ℹ️  Documentation-only change detected. Trace log not required.\n");
  } else {
    console.log("⚠️  No trace log provided and no changed files detected\n");
  }

  // 2. Parse HITL status
  console.log("👤 Checking HITL items...");
  const hitlResult = parseHITLStatus(hitlFilePath);
  if (!hitlResult.valid) {
    console.error("❌ HITL validation failed:");
    hitlResult.errors.forEach((e) => console.error(`   - ${e}`));
    allErrors.push(...hitlResult.errors);
    hasHardFailures = true;
  } else {
    console.log(`✅ HITL items valid (${hitlResult.items.length} items checked)\n`);
  }

  // 3. Get changed files from git (already done above for trace log check)
  console.log("📝 Changed files detected:");
  if (changedFiles.length > 0) {
    console.log(`   Found ${changedFiles.length} changed file(s)\n`);
  } else {
    console.log("   No changed files detected (or not a git repo)\n");
  }

  // 4. Check artifacts
  console.log("📦 Checking required artifacts...");
  const artifactResult = checkArtifacts(changedFiles);
  if (artifactResult.warnings.length > 0) {
    console.warn("⚠️  Artifact warnings:");
    artifactResult.warnings.forEach((w) => console.warn(`   - ${w}`));
    allWarnings.push(...artifactResult.warnings);
  } else {
    console.log("✅ Artifacts check passed\n");
  }

  // 5. Validate PR body (if provided)
  if (prBodyPath) {
    console.log("📄 Validating PR body...");
    const prBodyResult = validatePRBody(prBodyPath);
    if (prBodyResult.warnings.length > 0) {
      console.warn("⚠️  PR body warnings:");
      prBodyResult.warnings.forEach((w) => console.warn(`   - ${w}`));
      allWarnings.push(...prBodyResult.warnings);
    } else {
      console.log("✅ PR body valid\n");
    }
  }

  // 6. Validate task format (if TODO file exists)
  const todoPath = join(REPO_ROOT, "agents/tasks/TODO.md");
  if (existsSync(todoPath)) {
    console.log("📋 Validating task format...");
    const taskResult = validateTaskFormat(todoPath);
    if (taskResult.warnings.length > 0) {
      console.warn("⚠️  Task format warnings:");
      taskResult.warnings.forEach((w) => console.warn(`   - ${w}`));
      allWarnings.push(...taskResult.warnings);
    } else {
      console.log("✅ Task format valid\n");
    }
  }

  // 7. Verify boundary checker
  console.log("🔗 Verifying boundary checker...");
  const boundaryResult = verifyBoundaryChecker();
  if (!boundaryResult.valid) {
    console.error("❌ Boundary checker verification failed:");
    boundaryResult.errors.forEach((e) => console.error(`   - ${e}`));
    allErrors.push(...boundaryResult.errors);
    hasHardFailures = true;
  } else if (boundaryResult.warnings.length > 0) {
    console.warn("⚠️  Boundary checker warnings:");
    boundaryResult.warnings.forEach((w) => console.warn(`   - ${w}`));
    allWarnings.push(...boundaryResult.warnings);
  } else {
    console.log("✅ Boundary checker verified\n");
  }

  // Summary
  console.log("📊 Summary");
  console.log("==========");
  console.log(`Errors: ${allErrors.length}`);
  console.log(`Warnings: ${allWarnings.length}\n`);

  // Auto-generate waiver for waiverable failures
  if (allWarnings.length > 0 && !hasHardFailures) {
    console.log("\n💡 Waiverable failures detected. Consider creating a waiver:");
    console.log("   python3 .repo/automation/scripts/manage-waivers.py create \\");
    console.log("     --waives \"<policy>\" \\");
    console.log("     --why \"<justification>\" \\");
    console.log("     --scope \"<scope>\" \\");
    console.log("     --owner \"<owner>\" \\");
    console.log("     --expiration \"<YYYY-MM-DD>\"");
  }

  if (hasHardFailures) {
    console.error("❌ Hard gate failures detected. Merge blocked.");
    process.exit(1);
  } else if (allWarnings.length > 0) {
    console.warn("⚠️  Warnings detected. Review recommended.");
    process.exit(2);
  } else {
    console.log("✅ All governance checks passed!");
    process.exit(0);
  }
}

main();
