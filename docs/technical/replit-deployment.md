# AIOS - AI Command Center Mobile App

## Overview

AIOS is a mobile-first iOS/Android application built with React Native and Expo, featuring a futuristic "HUD/control panel" aesthetic. The app serves as an AI-powered productivity hub with five core modules: Command Center (AI recommendations), Notebook (markdown notes), Planner (tasks/projects), Calendar, and Email. The unique feature is that AI doesn't generate freeform text - instead, it presents typed recommendation cards with bounded fields that users can accept, decline, or dismiss.

The architecture follows a client-server model where the Expo mobile app communicates with an Express backend. Data is stored locally on the device using AsyncStorage, with PostgreSQL available on the server side for future expansion.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

- **Framework**: React Native with Expo SDK 54, using the new architecture
- **Navigation**: React Navigation with native stack navigator for smooth transitions
- **State Management**: TanStack React Query for server state, local React state for UI
- **Animations**: React Native Reanimated for smooth, performant animations with gesture support via React Native Gesture Handler
- **Styling**: Dark-first theme with electric blue (#00D9FF) accent color, following HUD/control panel aesthetic
- **Path Aliases**: `@/` maps to `./apps/mobile/`, `@packages/contracts/` maps to `./packages/contracts/`

### Module Structure

The app has five main modules, all accessible via a grid screen:

1. **Command Center** - Swipeable AI recommendation cards with confidence meters and expiry indicators
2. **Notebook** - Markdown editor with tag (#hashtag) and link ([[wikilink]]) parsing
3. **Planner** - Tasks with priorities, due dates, projects, and AI-generated notes
4. **Calendar** - Native CRUD calendar with recurrence support
5. **Email** - UI mockup (no provider integration)

### Backend Architecture

- **Server**: Express.js with TypeScript, running on port 5000
- **API Pattern**: RESTful endpoints prefixed with `/api`
- **Database**: Drizzle ORM configured for PostgreSQL, schema in `packages/contracts/schema.ts`
- **Build**: esbuild for server bundling, outputs to `server_dist/`

### Local Data Storage

The mobile app uses AsyncStorage for persistence with these data models:

- Recommendations (AI cards with confidence, expiry, status)
- Notes (markdown with tags/links)
- Tasks & Projects (with priorities, dependencies)
- Calendar Events (with recurrence)
- Settings (AI name, enabled modules, limit tiers)
- History Log (tracks all AI/user interactions)
- AI Limits (usage tracking with 6-hour refresh cadence)

### AI Recommendation System

- Cards have confidence levels (low/medium/high) displayed as HUD meters
- Expiry timestamps show freshness
- Users can accept/decline/dismiss cards
- Limit tiers (0-3) control how many active recommendations are allowed
- All decisions logged to history for transparency

## External Dependencies

### Mobile/Client

- **Expo**: Core framework with plugins for splash screen, haptics, blur effects, web browser
- **React Navigation**: Native stack and bottom tabs navigation
- **AsyncStorage**: Local data persistence
- **TanStack React Query**: Server state management and caching

### Server

- **Express**: HTTP server framework
- **PostgreSQL + Drizzle ORM**: Database with type-safe queries
- **Zod**: Schema validation with drizzle-zod integration

### Development

- **TypeScript**: Full type safety across client and server
- **ESLint + Prettier**: Code quality and formatting
- **Babel**: Module resolution with path aliases

### Build & Deployment

- Expo handles mobile builds (iOS/Android/Web)
- Custom build script (`scripts/build.js`) for Replit deployment
- Server builds via esbuild for production

