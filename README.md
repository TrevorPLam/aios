# AIOS - AI Command Center Mobile App

A mobile-first iOS/Android application built with React Native and Expo, featuring a futuristic "HUD/control panel" aesthetic. AIOS serves as an AI-powered productivity hub with five core modules designed to help users manage their tasks, notes, calendar, and email through intelligent recommendations.

## 🚀 Features

### Core Modules

1. **Command Center** - Swipeable AI recommendation cards with confidence meters
2. **Notebook** - Markdown editor with tag and link parsing
3. **Planner** - Task and project management with priorities and dependencies
4. **Calendar** - Event scheduling with recurrence support
5. **Email** - Email thread viewer (UI mockup)

### Key Highlights

- 🎨 **Dark-first design** with electric blue (#00D9FF) accent
- 🌊 **Smooth animations** using React Native Reanimated
- 📱 **Haptic feedback** for enhanced mobile experience
- 💾 **Local-first storage** using AsyncStorage
- 🤖 **AI-powered recommendations** (scaffold for integration)
- 🔄 **Real-time updates** ready (WebSocket configured)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android development)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TrevorPowellLam/Mobile-Scaffold.git
   cd Mobile-Scaffold
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional for Replit)
   ```bash
   # For Replit deployment
   export REPLIT_DEV_DOMAIN=your-domain.repl.co
   export EXPO_PUBLIC_DOMAIN=your-domain.repl.co:5000
   ```

## 🚀 Running the Application

### Development Mode

**Start the mobile app:**
```bash
npm run expo:dev
```

**Start the backend server:**
```bash
npm run server:dev
```

**Run both concurrently:** Open two terminal windows and run each command in a separate window.

### Building for Production

**Build the mobile app:**
```bash
npm run expo:static:build
```

**Build the server:**
```bash
npm run server:build
```

**Run production server:**
```bash
npm run server:prod
```

## 📱 Testing the App

### Running on Devices

1. **On iOS Simulator:**
   - Press `i` in the Expo CLI
   - Or scan QR code with Camera app

2. **On Android Emulator:**
   - Press `a` in the Expo CLI
   - Or scan QR code with Expo Go app

3. **On Physical Device:**
   - Install Expo Go from App Store / Play Store
   - Scan the QR code displayed in terminal

### Running Automated Tests

The project includes a comprehensive test suite powered by Jest and React Native Testing Library.

**Run all tests:**
```bash
npm test
```

**Run tests in watch mode (for development):**
```bash
npm run test:watch
```

**Generate coverage report:**
```bash
npm run test:coverage
```

**Test coverage includes:**
- Component tests (Button, etc.)
- Storage layer tests (database operations)
- Current coverage: ~48% for storage, growing as more tests are added

## 🏗️ Project Structure

```
Mobile-Scaffold/
├── client/                 # React Native mobile app
│   ├── components/         # Reusable UI components
│   ├── constants/          # Theme, colors, spacing
│   ├── hooks/              # Custom React hooks
│   ├── models/             # TypeScript types and interfaces
│   ├── navigation/         # React Navigation setup
│   ├── screens/            # Screen components
│   ├── storage/            # AsyncStorage database layer
│   ├── utils/              # Helper functions and seed data
│   └── App.tsx             # App entry point
├── server/                 # Express backend
│   ├── index.ts            # Server setup and middleware
│   ├── routes.ts           # API routes (scaffold)
│   └── storage.ts          # Database utilities
├── shared/                 # Shared types between client/server
│   └── schema.ts           # Database schema (Drizzle ORM)
├── assets/                 # Images and static files
├── scripts/                # Build and deployment scripts
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## 🎨 Design System

### Color Palette

- **Electric Blue:** `#00D9FF` - Primary accent, interactive elements
- **Deep Space:** `#0A0E1A` - Background
- **Slate Panel:** `#1A1F2E` - Card/surface backgrounds
- **Success:** `#00FF94` - Positive actions
- **Warning:** `#FFB800` - Medium confidence
- **Error:** `#FF3B5C` - Declined actions

### Typography

Using system fonts with the following scale:
- Hero: 32px Bold
- H1: 24px Semibold  
- H2: 20px Semibold
- H3: 18px Semibold
- Body: 16px Regular
- Caption: 14px Regular
- Small: 12px Medium

## 🔧 Available Scripts

### Development
- `npm run expo:dev` - Start Expo development server
- `npm run server:dev` - Start backend in development mode

### Building
- `npm run expo:static:build` - Build static Expo app
- `npm run server:build` - Bundle server with esbuild
- `npm run server:prod` - Run production server

### Database
- `npm run db:push` - Push schema changes to database

### Testing
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run check:types` - TypeScript type checking
- `npm run check:format` - Check code formatting
- `npm run format` - Format code with Prettier

## 🗄️ Data Models

The app uses AsyncStorage for local persistence with the following models:

- **Recommendations** - AI suggestion cards
- **Notes** - Markdown documents with tags/links
- **Tasks** - Todo items with priorities and dependencies
- **Projects** - Task groupings
- **Calendar Events** - Scheduled events with recurrence
- **Settings** - User preferences and configuration
- **History Log** - Activity tracking
- **AI Limits** - Usage tracking with refresh cadence

## 🔌 API Integration

The server now includes a complete REST API with authentication and CRUD endpoints for all modules:

### Authentication
- JWT-based authentication with bcrypt password hashing
- User registration and login
- Protected routes with Bearer token authentication

### Available Endpoints
- **Authentication:** `/api/auth/*` (register, login, logout, me)
- **Recommendations:** `/api/recommendations/*` (GET, POST, PUT, DELETE)
- **Notes:** `/api/notes/*` (GET, POST, PUT, DELETE)
- **Tasks:** `/api/tasks/*` (GET, POST, PUT, DELETE)
- **Projects:** `/api/projects/*` (GET, POST, PUT, DELETE)
- **Events:** `/api/events/*` (GET, POST, PUT, DELETE)
- **Settings:** `/api/settings/*` (GET, PUT)

### Features
- Request validation using Zod schemas
- Error handling middleware
- User-specific data isolation
- In-memory storage (ready for PostgreSQL migration)

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API documentation.

## 🤖 AI Integration (Scaffold)

The app is designed to support AI-powered recommendations with:
- Confidence levels (low/medium/high)
- Expiry timestamps
- Evidence-based suggestions
- User acceptance/decline tracking
- Usage limits with tier system

To integrate AI:
1. Add your AI service (OpenAI, Anthropic, etc.) in `server/`
2. Implement recommendation generation logic
3. Connect via existing API endpoints (`/api/recommendations`)
4. Update `client/utils/seedData.ts` with real data

## 🎯 Current Status

**The app now includes a complete backend API with authentication!** Recent improvements:

- ✅ Backend API endpoints with JWT authentication
- ✅ CRUD operations for all data models
- ✅ Request validation and error handling
- ✅ Test coverage (Jest + React Native Testing Library configured)
- ✅ In-memory storage (ready for database migration)
- ❌ Database integration (PostgreSQL configured but not connected yet)
- ❌ AI recommendation generation (endpoints ready, logic needed)
- ❌ Multi-device sync
- ❌ AI Assist actions (grammar check, summarization, etc.)

See [MISSING_FEATURES.md](./MISSING_FEATURES.md) for a complete analysis.

## 📚 Tech Stack

### Frontend
- **React Native** - Mobile framework
- **Expo SDK 54** - Development platform
- **React Navigation** - Navigation library
- **React Native Reanimated** - Animation library
- **TanStack React Query** - Server state management
- **AsyncStorage** - Local persistence
- **TypeScript** - Type safety

### Backend  
- **Express** - HTTP server
- **PostgreSQL** - Database (configured)
- **Drizzle ORM** - Type-safe database queries
- **Zod** - Schema validation

### Development
- **TypeScript** - Full type safety
- **ESLint + Prettier** - Code quality
- **esbuild** - Fast bundling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is available as open source under the terms of your chosen license.

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Check [MISSING_FEATURES.md](./MISSING_FEATURES.md) for known limitations
- Review [design_guidelines.md](./design_guidelines.md) for design specifications

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- UI inspired by futuristic HUD designs
- Icons from [Feather Icons](https://feathericons.com/)

---

**Note:** This is a mobile app scaffold focused on UI/UX. Backend services and AI integration require additional implementation. See documentation for details.
