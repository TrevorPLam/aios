# AGENT.md (Folder-Level Guide)

## Purpose of this folder
Shared code used by both client and server including types, utilities, constants, and validation schemas.

## What agents may do here
- Create shared types and interfaces
- Add utility functions used across client and server
- Define shared constants and configuration
- Create Zod validation schemas
- Platform-agnostic code only

## What agents may NOT do
- Add platform-specific code (React Native or Node.js specific)
- Include dependencies that are not available on both platforms
- Bypass validation rules
- Create circular dependencies

## Required links
- Refer to higher-level policy: /.repo/policy/BOUNDARIES.md
- Shared platform directory rule: src/platform/ (conceptual - this is the platform layer)
