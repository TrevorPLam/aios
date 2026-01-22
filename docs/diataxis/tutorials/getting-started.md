# Getting Started with AIOS Development

## Plain English Summary

- This tutorial shows how to install dependencies and run the AIOS mobile app plus backend server.
- You will use the same commands documented in the main README to keep setup consistent across the repo.
- The steps are intentionally small and reversible so you can stop and restart without data loss.
- You will verify both the Expo app and the backend server with simple happy/edge/error checks.
- Troubleshooting includes the common Worklets mismatch fix and cache cleaning steps.
- The tutorial assumes iOS-first development, with Android compatibility handled by Expo.

## Technical Detail

### 1) Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### 2) Clone and install dependencies

<!-- WHY: Mirror README commands so onboarding stays consistent and easy to verify. -->

```bash
git clone https://github.com/TrevorPowellLam/Mobile-Scaffold.git
cd Mobile-Scaffold
npm install
```

### 3) Optional environment variables (Replit only)

```bash
export REPLIT_DEV_DOMAIN=your-domain.repl.co
export EXPO_PUBLIC_DOMAIN=your-domain.repl.co:5000
```

### 4) Start the mobile app (Expo)

<!-- WHY: Expo dev mode is the primary workflow for iOS-first iteration. -->

```bash
npm run expo:dev
```

- Press `i` in the Expo CLI to open the iOS simulator.
- Use a physical device with Expo Go if you want to test on real hardware.

### 5) Start the backend server

<!-- WHY: API endpoints live in the server app, so run it alongside Expo. -->

Open a second terminal window and run:

```bash
npm run server:dev
```

### 6) Verification (happy / edge / error)

<!-- WHY: Explicit checks keep the tutorial deterministic and reduce guesswork. -->

- **Happy path:** Expo starts and you can open the app in iOS Simulator; backend server logs a startup message.
- **Edge case:** Restart Metro with a clean cache if changes do not appear:
  ```bash
  npm run expo:clean
  ```
- **Error case:** If you see the Worklets version mismatch error, rebuild native dependencies:
  ```bash
  npm run expo:clean:native && npm run expo:rebuild:ios
  ```

## Assumptions

- You are running commands from the repository root.
- You have access to either an iOS Simulator, Android emulator, or physical device.
- Network access is available for npm package installation.

## Failure Modes

- **Worklets mismatch error:** Run the one-time rebuild command above to align native dependencies.
- **Expo changes not appearing:** Clear the Metro cache with `npm run expo:clean`.
- **Native dependency issues:** Use `npm run expo:clean:native` or `npm run expo:clean:full` if needed.

## Rollback

- Delete the cloned repository folder to undo local setup changes.
- Re-run `npm install` after `npm run expo:clean:full` if dependency states become inconsistent.
