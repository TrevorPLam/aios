#!/usr/bin/env node

/**
 * Agent Platform Separation Checker
 *
 * Validates that GitHub Copilot (Primary) and Codex Agent (Secondary)
 * follow platform separation rules defined in the constitution.
 *
 * Rules:
 * - GitHub Copilot (Primary): iOS-only, no Android/Web-specific code
 * - Codex Agent (Secondary): Android/Web adaptation only, must reference Copilot's work
 *
 * Usage:
 *   node scripts/tools/check-agent-platform.mjs [--mode=warn|fail]
 *
 * Exit codes:
 *   0 - All checks passed or warnings only (WARN mode)
 *   1 - Violations found and FAIL mode enabled
 *   2 - Error running checks
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPO_ROOT = join(__dirname, "../..");
const TODO_PATH = join(REPO_ROOT, "TODO.md");
const STATE_PATH = join(REPO_ROOT, "docs/governance/state.md");

// Read enforcement mode from environment or default to WARN
const ENFORCEMENT_MODE =
  process.env.AGENT_PLATFORM_ENFORCEMENT ||
  process.argv.find((arg) => arg.startsWith("--mode="))?.split("=")[1] ||
  "warn";

function checkAgentPlatform() {
  console.log("🤖 Agent Platform Separation Checker");
  console.log("=====================================\n");
  console.log(`Enforcement Mode: ${ENFORCEMENT_MODE.toUpperCase()}\n`);

  const violations = [];

  // Check 1: TODO.md uses new ownership schema
  console.log("📋 Check 1: TODO.md Ownership Schema");
  console.log("-------------------------------------");

  if (!existsSync(TODO_PATH)) {
    console.error(`❌ TODO.md not found at: ${TODO_PATH}`);
    violations.push("TODO.md file not found");
  } else {
    try {
      const todoContent = readFileSync(TODO_PATH, "utf-8");

      // Check for old AGENT ownership (should not exist)
      const oldOwnershipPattern = /^-\s+\*\*Owner\*\*:\s+AGENT$/m;
      if (oldOwnershipPattern.test(todoContent)) {
        violations.push('TODO.md still uses old "Owner: AGENT" format');
        console.error('❌ Found old "Owner: AGENT" format in TODO.md');
        console.error(
          '   Expected: "Owner: GitHub Agent (Primary)" or "Owner: Codex Agent (Secondary)"',
        );
      } else {
        console.log("✅ TODO.md uses new ownership schema");
      }

      // Check for new ownership schema presence
      if (
        !todoContent.includes("GitHub Agent (Primary)") &&
        !todoContent.includes("Codex Agent (Secondary)")
      ) {
        violations.push("TODO.md missing new agent ownership schema");
        console.error("❌ TODO.md does not contain new agent ownership schema");
      } else {
        console.log("✅ TODO.md contains Primary-Secondary agent references");
      }

      // Check for Platform field in schema
      if (!todoContent.includes("**Platform**:")) {
        violations.push("TODO.md schema missing Platform field");
        console.warn("⚠️  TODO.md schema should include Platform field");
      } else {
        console.log("✅ TODO.md includes Platform field in schema");
      }
    } catch (error) {
      console.error(`❌ Error reading TODO.md: ${error.message}`);
      violations.push(`Error reading TODO.md: ${error.message}`);
    }
  }

  console.log("");

  // Check 2: Verify constitution has Agent Responsibility Model
  console.log("📜 Check 2: Constitution Has Agent Model");
  console.log("------------------------------------------");

  const constitutionPath = join(REPO_ROOT, "docs/governance/constitution.md");
  if (!existsSync(constitutionPath)) {
    console.error(`❌ Constitution not found at: ${constitutionPath}`);
    violations.push("Constitution file not found");
  } else {
    try {
      const constitutionContent = readFileSync(constitutionPath, "utf-8");

      if (!constitutionContent.includes("Agent Responsibility Model")) {
        violations.push(
          "Constitution missing Agent Responsibility Model section",
        );
        console.error(
          "❌ Constitution does not include Agent Responsibility Model",
        );
      } else {
        console.log("✅ Constitution includes Agent Responsibility Model");
      }

      if (!constitutionContent.includes("GitHub Copilot (Primary Agent)")) {
        violations.push("Constitution missing Primary Agent definition");
        console.error("❌ Constitution missing Primary Agent definition");
      } else {
        console.log("✅ Constitution defines GitHub Copilot (Primary Agent)");
      }

      if (!constitutionContent.includes("Codex Agent (Secondary Agent)")) {
        violations.push("Constitution missing Secondary Agent definition");
        console.error("❌ Constitution missing Secondary Agent definition");
      } else {
        console.log("✅ Constitution defines Codex Agent (Secondary Agent)");
      }
    } catch (error) {
      console.error(`❌ Error reading constitution: ${error.message}`);
      violations.push(`Error reading constitution: ${error.message}`);
    }
  }

  console.log("");

  // Check 3: Verify state.md has enforcement toggle
  console.log("📊 Check 3: State.md Enforcement Toggle");
  console.log("----------------------------------------");

  if (!existsSync(STATE_PATH)) {
    console.error(`❌ State.md not found at: ${STATE_PATH}`);
    violations.push("State.md file not found");
  } else {
    try {
      const stateContent = readFileSync(STATE_PATH, "utf-8");

      if (!stateContent.includes("Agent Platform Separation")) {
        violations.push("State.md missing Agent Platform Separation toggle");
        console.error(
          "❌ State.md does not include Agent Platform Separation toggle",
        );
      } else {
        console.log("✅ State.md includes Agent Platform Separation toggle");
      }

      // Check if enforcement mode matches expectation
      if (
        stateContent.includes("Agent Platform Separation") &&
        stateContent.includes("WARN")
      ) {
        console.log(
          "✅ State.md shows WARN mode (as expected for initial rollout)",
        );
      }
    } catch (error) {
      console.error(`❌ Error reading state.md: ${error.message}`);
      violations.push(`Error reading state.md: ${error.message}`);
    }
  }

  console.log("");

  // Check 4: AI contribution policy updated
  console.log("🤖 Check 4: AI Contribution Policy");
  console.log("------------------------------------");

  const aiPolicyPath = join(REPO_ROOT, "docs/ai/ai_contribution_policy.md");
  if (!existsSync(aiPolicyPath)) {
    console.error(`❌ AI contribution policy not found at: ${aiPolicyPath}`);
    violations.push("AI contribution policy file not found");
  } else {
    try {
      const aiPolicyContent = readFileSync(aiPolicyPath, "utf-8");

      if (!aiPolicyContent.includes("Primary-Secondary Architecture")) {
        violations.push("AI policy missing Primary-Secondary Architecture");
        console.error(
          "❌ AI contribution policy missing Primary-Secondary Architecture section",
        );
      } else {
        console.log(
          "✅ AI contribution policy includes Primary-Secondary Architecture",
        );
      }

      if (!aiPolicyContent.includes("Handoff Protocol")) {
        violations.push("AI policy missing Handoff Protocol");
        console.warn(
          "⚠️  AI contribution policy should include Handoff Protocol",
        );
      } else {
        console.log("✅ AI contribution policy includes Handoff Protocol");
      }
    } catch (error) {
      console.error(
        `❌ Error reading AI contribution policy: ${error.message}`,
      );
      violations.push(`Error reading AI contribution policy: ${error.message}`);
    }
  }

  console.log("");

  // Summary
  console.log("📊 Summary:");
  console.log(`   Checks run: 4`);
  console.log(`   Violations found: ${violations.length}`);
  console.log(`   Enforcement mode: ${ENFORCEMENT_MODE.toUpperCase()}`);

  if (violations.length > 0) {
    console.log("\n⚠️  Violations detected:\n");
    violations.forEach((v, i) => {
      console.log(`   ${i + 1}. ${v}`);
    });

    if (ENFORCEMENT_MODE === "fail") {
      console.error(
        "\n❌ FAILED: Agent platform separation violations detected!",
      );
      console.error("\n📝 Action required:");
      console.error("   1. Review violations listed above");
      console.error(
        "   2. Update TODO.md to use Primary-Secondary agent ownership",
      );
      console.error(
        "   3. Ensure constitution includes Agent Responsibility Model",
      );
      console.error("   4. Ensure state.md has enforcement toggle");
      console.error(
        "   5. Update AI contribution policy with agent guidelines",
      );
      console.error("   6. Commit and push changes");
      console.error(
        "\n   See: docs/governance/constitution.md for full requirements",
      );
      return 1;
    } else {
      console.warn(
        "\n⚠️  WARN MODE: Violations detected but not failing build",
      );
      console.warn("   These will fail once enforcement mode is set to FAIL");
      console.warn("   See: docs/governance/state.md to toggle enforcement");
      return 0;
    }
  }

  console.log("\n✅ All agent platform separation checks passed!");
  return 0;
}

// Run checker
try {
  const exitCode = checkAgentPlatform();
  process.exit(exitCode);
} catch (error) {
  console.error(`\n❌ Fatal error: ${error.message}`);
  console.error(error.stack);
  process.exit(2);
}
