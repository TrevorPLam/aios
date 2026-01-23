# AGENT.md (Folder-Level Guide)

## Purpose of this folder
Client-side React Native application code including screens, components, services, and hooks.

## What agents may do here
- Create and modify screens, components, and UI elements
- Add or update services and hooks
- Modify navigation structure
- Update tests for client-side code
- Follow React Native and Expo best practices

## What agents may NOT do
- Bypass module boundary rules (ui → domain → data → platform)
- Cross feature boundaries without ADR
- Import server code directly into client
- Bypass security or validation layers

## Required links
- Refer to higher-level policy: /.repo/policy/BOUNDARIES.md
- Architecture: docs/architecture/
- Module structure: docs/modules/
