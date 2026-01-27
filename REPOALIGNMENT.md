🏗️ Repository Context Engineering: Building the "Agentic Blueprint"
Your repository's structure and documentation are the primary tools for context engineering. Here’s a strategic approach to architect it.

1. Create Foundational Context Files
These files at the root of your repo form the immutable core of your AI's knowledge. Think of them as the project's constitution.

Recommended Core Files:

ARCHITECTURE.md: The single most important file. Describe the high-level structure (frontend/backend), key technologies, and data flow in simple terms.

PRODUCT.md: Define what the software does—its core purpose, user roles, and key workflows. This aligns the AI with business goals.

CONTRIBUTING.md or AGENTS.md: This is your rulebook. Explicitly state coding standards, naming conventions, and, critically, anti-patterns to avoid (e.g., "Never commit API keys," "Always use this error handling pattern").

2. Implement a Context Hierarchy with Custom Instructions
To make this context active, structure it so AI tools like GitHub Copilot automatically consume it. This creates a hierarchy of knowledge.

Primary Strategy: The Central Instruction File
Create a .github/copilot-instructions.md file. This is automatically loaded by GitHub Copilot and serves as the master index. It should be concise and link to your foundational files.

Example .github/copilot-instructions.md:

markdown
# Project Blueprint for AI Agents
Refer to these documents for all decisions:
* **Purpose & Goals:** See [PRODUCT.md](../PRODUCT.md)
* **System Design:** Follow patterns in [ARCHITECTURE.md](../ARCHITECTURE.md)
* **Coding Rules:** Strictly adhere to [CONTRIBUTING.md](../CONTRIBUTING.md)

**Critical Directives:**
1. Prioritize simple, working code over clever solutions.
2. Never delete or modify existing tests without discussion.
3. Ask for clarification if a requirement is ambiguous.
This method ensures every new AI agent session starts with the correct, persistent context, eliminating the need to re-explain your project's fundamentals.

💬 Strategic Prompt Engineering Within the Context
With a strong context foundation, your interactive prompts become far more effective. The principle is to provide a complete, consistent picture of the world to the AI.

The "Plan-First, Then Execute" Workflow:

The Planning Prompt: Start a session by asking the AI to plan, not code.

User Prompt: "Review the ARCHITECTURE.md and the current src/auth/ directory. Create a step-by-step plan to implement a password reset feature that matches our existing patterns."

This leverages the curated context to generate a spec you can review before any code is written.

The Execution Prompt: Once the plan is approved, direct the AI to implement a single, specific step from it.

User Prompt: "Execute step 2 from the approved plan: 'Create the PasswordResetRequest.jsx component using the same styling pattern as LoginForm.jsx'."

This narrow focus, backed by references to existing files (LoginForm.jsx), gives the AI maximum clarity and minimizes errors.

Key Prompting Tactics:

Order Matters: Place the most critical instructions (the "what" and "why") at the beginning of your prompt, and the specific action (the "how") at the end. AI models pay the most attention to these areas.

Reference the Context: Always explicitly tell the AI to consult the foundational files you've created (e.g., "As per CONTRIBUTING.md, use functional components...").