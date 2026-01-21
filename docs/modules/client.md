# Client Module (Mobile App)

**Location:** `client/`  
**Language:** TypeScript, JavaScript  
**Framework:** React Native (Expo)  
**Status:** Active

## Plain English Summary

The client module is the mobile application that users interact with on their iOS or Android devices. Built with React Native and Expo, it provides the user interface and handles all client-side logic, offline capabilities, and communication with the server API.

## Purpose

### What This Module Does
- Renders the mobile UI for iOS and Android platforms
- Manages user interactions and navigation
- Handles authentication and user sessions
- Communicates with the backend API (`server/`)
- Manages local state and offline data
- Provides push notifications and background tasks
- Integrates device features (camera, location, etc.)

### What This Module Does NOT Do
- Does NOT store sensitive data persistently without encryption
- Does NOT perform complex business logic (that belongs in `server/`)
- Does NOT directly access databases (all data comes through API)
- Does NOT trust user input (validation happens on both sides)

### Key Use Cases
1. User authentication and registration
2. Displaying real-time data from the server
3. Offline-first data access with sync when online
4. Native device feature integration
5. Push notification handling

## Technical Detail

### Architecture Overview

```
client/
├── src/
│   ├── components/         # Reusable UI components
│   ├── screens/           # Full-screen views/pages
│   ├── navigation/        # React Navigation configuration
│   ├── services/          # API clients, storage, etc.
│   ├── hooks/             # Custom React hooks
│   ├── store/             # State management (Context/Redux)
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript type definitions
│   ├── constants/         # App constants and configuration
│   └── assets/            # Images, fonts, etc.
├── app.json              # Expo configuration
├── App.tsx               # Root component
├── package.json
└── tsconfig.json
```

### Key Components

#### Component 1: API Service
**Location:** `client/src/services/api.ts`  
**Purpose:** Centralized HTTP client for backend communication  
**Interface:**
```typescript
export class ApiService {
  get<T>(endpoint: string): Promise<T>;
  post<T>(endpoint: string, data: unknown): Promise<T>;
  put<T>(endpoint: string, data: unknown): Promise<T>;
  delete<T>(endpoint: string): Promise<T>;
}
```

#### Component 2: Authentication Context
**Location:** `client/src/store/AuthContext.tsx`  
**Purpose:** Manages user authentication state across the app  
**Interface:**
```typescript
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: UserData) => Promise<void>;
}
```

#### Component 3: Navigation
**Location:** `client/src/navigation/RootNavigator.tsx`  
**Purpose:** Defines app navigation structure and routing  
**Interface:**
```typescript
// Stack-based navigation with type-safe routes
export type RootStackParamList = {
  Home: undefined;
  Profile: { userId: string };
  Settings: undefined;
  // ... more routes
};
```

### Data Flow

```
[User Action] → [Component] → [Hook/Service] → [API Client] → [Server]
                     ↓                                              ↓
                [Local State]                                 [Response]
                     ↓                                              ↓
                [Re-render] ←──────────────────────────────────────┘
```

1. User interacts with a component
2. Component calls a hook or service
3. Service makes API request to server
4. Response updates local state
5. Component re-renders with new data

### State Management

The client uses React Context API for global state:

- **AuthContext** - User authentication state
- **ThemeContext** - App theme and appearance
- **DataContext** - Shared application data

Local component state uses `useState` and `useReducer` hooks.

### Error Handling

```typescript
// Centralized error handling in API service
try {
  const data = await apiService.get('/endpoint');
  return data;
} catch (error) {
  if (error instanceof NetworkError) {
    showToast('Network connection lost');
  } else if (error instanceof AuthError) {
    // Redirect to login
    navigation.navigate('Login');
  } else {
    // Log to error tracking service
    ErrorTracker.log(error);
  }
  throw error;
}
```

## APIs and Interfaces

### Public API

The client module doesn't expose a traditional API, but it does export reusable components and utilities:

#### Exported Components
```typescript
// Reusable UI components
export { Button } from './components/Button';
export { Card } from './components/Card';
export { Input } from './components/Input';
```

#### Exported Hooks
```typescript
// Custom hooks for common patterns
export { useAuth } from './hooks/useAuth';
export { useApi } from './hooks/useApi';
export { useDebounce } from './hooks/useDebounce';
```

### Internal APIs

Communication with server happens through REST API:

```typescript
// Example API calls
GET    /api/users/me           // Get current user
POST   /api/auth/login         // Login
POST   /api/auth/register      // Register
GET    /api/data               // Fetch data
POST   /api/data               // Create data
```

See [API Documentation](../apis/README.md) for full REST API specification.

### Events

The app responds to system and custom events:

| Event Name | Payload | When Fired |
|------------|---------|------------|
| `app:backgrounded` | `{ timestamp }` | App goes to background |
| `auth:logout` | `{ reason }` | User logs out |
| `sync:completed` | `{ recordCount }` | Offline sync completes |
| `notification:received` | `{ notification }` | Push notification arrives |

## Dependencies

### External Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `expo` | `~50.0.0` | Expo framework and tooling |
| `react-native` | `0.73.0` | React Native framework |
| `@react-navigation/native` | `^6.1.0` | Navigation library |
| `axios` | `^1.6.0` | HTTP client |
| `react-query` | `^3.39.0` | Data fetching and caching |
| `@react-native-async-storage/async-storage` | `^1.21.0` | Local storage |
| `expo-secure-store` | `~12.8.0` | Secure credential storage |

See `client/package.json` for complete dependency list.

### Internal Dependencies

- `../shared/types` - Shared TypeScript types and interfaces
- `../shared/validators` - Shared validation logic
- `../shared/utils` - Shared utility functions

### Dependency Rationale

- **Expo:** Simplifies native module access and updates
- **React Navigation:** Industry standard for React Native navigation
- **Axios:** Reliable HTTP client with interceptor support
- **React Query:** Excellent caching and background sync

## Build and Deploy

### Build Process

```bash
# Install dependencies
cd client
npm install

# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run tests
npm test

# Type check
npm run type-check

# Lint code
npm run lint
```

### Configuration

**Environment Variables:**
```bash
# Create .env file in client/ directory
API_URL=https://api.example.com      # Backend API URL
API_TIMEOUT=30000                     # Request timeout (ms)
ENABLE_ANALYTICS=true                 # Analytics flag
SENTRY_DSN=https://...               # Error tracking
```

**Configuration Files:**
- `app.json` - Expo app configuration (name, version, icons, etc.)
- `eas.json` - Expo Application Services build configuration
- `.env.example` - Example environment variables

### Deployment

```bash
# Build for iOS (requires Apple Developer account)
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to App Store
eas submit --platform ios

# Submit to Google Play
eas submit --platform android
```

## Common Tasks

### Task 1: Add a New Screen

**Goal:** Create a new screen/page in the app

**Steps:**
```bash
# 1. Create screen component
touch client/src/screens/NewScreen.tsx

# 2. Add to navigation types
# Edit client/src/navigation/types.ts

# 3. Add route to navigator
# Edit client/src/navigation/RootNavigator.tsx

# 4. Test navigation
npm run ios  # or npm run android
```

### Task 2: Add a New API Endpoint Call

**Goal:** Connect to a new backend endpoint

**Steps:**
```typescript
// 1. Define types in shared/types (if new types needed)
// shared/types/api.ts
export interface NewDataType {
  id: string;
  // ... fields
}

// 2. Add method to API service
// client/src/services/api.ts
export const fetchNewData = async (): Promise<NewDataType> => {
  const response = await apiService.get('/api/new-data');
  return response;
};

// 3. Create hook for the endpoint
// client/src/hooks/useNewData.ts
export const useNewData = () => {
  return useQuery('newData', fetchNewData);
};

// 4. Use in component
// client/src/screens/SomeScreen.tsx
const { data, isLoading, error } = useNewData();
```

### Task 3: Debug Network Issues

**Goal:** Diagnose API communication problems

**Steps:**
```bash
# 1. Check API URL configuration
cat client/.env

# 2. Enable network logging
# Edit client/src/services/api.ts and add console logs

# 3. Use React Native Debugger or Flipper
npm install -g react-native-debugger

# 4. Check server is running
curl http://localhost:3000/health
```

## Testing

### Test Structure

```
client/tests/
├── unit/                    # Component and utility tests
│   ├── components/
│   ├── hooks/
│   └── utils/
├── integration/            # Multi-component tests
└── e2e/                    # End-to-end tests (Detox)
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/components/Button.test.tsx

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Test Coverage Goals

- **Unit Tests:** 80%+ coverage for utilities and hooks
- **Integration Tests:** Critical user flows (auth, data fetch)
- **E2E Tests:** Main user journeys (onboarding, core features)

## Performance Considerations

### Performance Characteristics
- **App Launch Time:** Target < 3 seconds to interactive
- **Screen Transition:** Target 60 FPS (16.67ms per frame)
- **API Response Rendering:** Target < 100ms from response to render

### Optimization Strategies
1. Use `React.memo` for expensive components
2. Lazy load screens with `React.lazy` and `Suspense`
3. Implement virtual lists for long data lists (FlatList)
4. Optimize images (use WebP, proper dimensions)
5. Cache API responses with React Query

### Known Performance Issues
- **Large Lists:** Lists with > 1000 items may scroll slowly
  - Mitigation: Use `FlatList` with `windowSize` optimization
- **Image Loading:** Large images can cause memory pressure
  - Mitigation: Resize images on server, use progressive loading

## Assumptions

- **Assumption 1:** Users have internet connectivity most of the time
  - *If false:* Implement robust offline mode with background sync
- **Assumption 2:** Expo SDK provides all needed native features
  - *If false:* Eject from Expo and add custom native modules
- **Assumption 3:** iOS and Android can share 95%+ of code
  - *If false:* Use Platform-specific components and logic

## Failure Modes

### Failure Mode 1: Network Connectivity Loss
- **Symptom:** API calls fail with network errors, UI shows loading states indefinitely
- **Impact:** Users cannot access server data, operations fail
- **Detection:** Network error exceptions, timeout errors
- **Mitigation:** 
  - Implement offline detection using NetInfo
  - Cache data locally with React Query
  - Show clear offline indicator in UI
  - Queue operations for retry when online
- **Monitoring:** Track network error rate in analytics

### Failure Mode 2: Authentication Token Expiration
- **Symptom:** API calls return 401 Unauthorized errors
- **Impact:** User is unexpectedly logged out, loses context
- **Detection:** 401 status codes from API
- **Mitigation:**
  - Implement token refresh flow
  - Store refresh token in secure storage
  - Retry failed requests after token refresh
  - Show modal explaining logout if refresh fails
- **Monitoring:** Track authentication errors

### Failure Mode 3: App Crashes
- **Symptom:** App terminates unexpectedly, returns to home screen
- **Impact:** Poor user experience, data loss, negative reviews
- **Detection:** Error boundary catches, crash reporting service
- **Mitigation:**
  - Implement error boundaries around major components
  - Log all errors to Sentry or similar service
  - Save critical state before app exits
  - Show error recovery UI
- **Monitoring:** Crash rate, error types in Sentry

### Failure Mode 4: Version Incompatibility
- **Symptom:** App cannot communicate with server due to API changes
- **Impact:** App becomes unusable until updated
- **Detection:** API version mismatch errors
- **Mitigation:**
  - Include API version in requests
  - Server responds with version compatibility info
  - Force update flow for breaking changes
  - Maintain backwards compatibility where possible
- **Monitoring:** Track app versions in use

### Failure Mode 5: Slow API Responses
- **Symptom:** UI shows loading states for extended periods
- **Impact:** Poor user experience, perception of broken app
- **Detection:** High API response times in monitoring
- **Mitigation:**
  - Implement request timeouts (30s default)
  - Show skeleton screens instead of spinners
  - Cache aggressively with React Query
  - Implement optimistic updates for mutations
- **Monitoring:** P95/P99 response times

## How to Verify

### Manual Verification
```bash
# 1. Clean install
cd client
rm -rf node_modules
npm install

# 2. Run type checker
npm run type-check

# 3. Run linter
npm run lint

# 4. Run tests
npm test

# 5. Build app
npm run build

# 6. Test on real device
npm run ios  # or npm run android
```

### Automated Checks
- [ ] All tests pass: `npm test`
- [ ] Type checking passes: `npm run type-check`
- [ ] Linting passes: `npm run lint`
- [ ] App builds successfully: `expo build:ios` / `expo build:android`

### Success Criteria
1. App launches without errors on iOS and Android
2. All navigation flows work correctly
3. API communication works on both platforms
4. Offline mode functions as expected
5. Performance metrics meet targets (< 3s launch, 60 FPS)

### Health Check

```bash
# Start app and check console for errors
npm start

# In another terminal, run smoke tests
npm run test:smoke
```

## Troubleshooting

### Problem 1: "Unable to resolve module" Error
**Symptoms:** App fails to start, Metro bundler shows module resolution errors  
**Cause:** Missing dependency or incorrect import path  
**Solution:**
```bash
# Clear Metro cache
npm start -- --reset-cache

# Reinstall dependencies
rm -rf node_modules
npm install

# Check import paths are correct
```

### Problem 2: Build Fails on iOS
**Symptoms:** `eas build` or `pod install` fails with errors  
**Cause:** CocoaPods dependencies out of sync  
**Solution:**
```bash
# Clean iOS build
cd client/ios
rm -rf Pods Podfile.lock
pod install
cd ../..

# Or use Expo to rebuild
eas build --platform ios --clear-cache
```

### Problem 3: Slow Development Server
**Symptoms:** Metro bundler takes minutes to refresh changes  
**Cause:** Large node_modules, many files being watched  
**Solution:**
```bash
# Add to .watchmanconfig to ignore files
{
  "ignore_dirs": ["node_modules", ".git"]
}

# Restart watchman
watchman watch-del-all
```

## Migration and Upgrade Guides

### Upgrading Expo SDK

When upgrading Expo SDK versions:

1. Check [Expo changelog](https://expo.dev/changelog) for breaking changes
2. Run: `expo upgrade`
3. Update any deprecated APIs
4. Test thoroughly on both platforms
5. Update `app.json` sdkVersion

## Security Considerations

- **Token Storage:** Authentication tokens stored in `expo-secure-store` (encrypted)
- **API Communication:** All API calls use HTTPS
- **Input Validation:** User input validated on client AND server
- **Sensitive Data:** PII is not logged or sent to analytics
- **Code Obfuscation:** Production builds use ProGuard (Android) and symbol stripping (iOS)

See [Security Documentation](../security/threat_model.md) for full threat model.

## Related Documentation

- [Architecture - Container Level](../architecture/c4/level-2-container.md#client-mobile-app) - Client in system context
- [API Documentation](../apis/README.md) - REST API contracts
- [Shared Module](./shared.md) - Shared code used by client
- [Tutorial: Building Your First Feature](../diataxis/tutorials/building-your-first-feature.md)
- [ADR-002: Use React Native](../decisions/002-react-native.md) - Why React Native

## Maintenance and Support

### Module Owner
- **Team:** Mobile Engineering
- **Primary Contact:** Mobile Tech Lead
- **Slack Channel:** #mobile-dev

### SLA Commitments
- **Critical Bugs:** Response within 4 hours
- **Feature Requests:** Reviewed within 1 week
- **Dependency Updates:** Monthly security updates

### Deprecation Policy

No current plans for deprecation. React Native and Expo are core to the architecture.

## Notes

- The client module is the user-facing part of AIOS - prioritize UX and performance
- Always test on real devices, not just simulators
- iOS and Android can have subtle differences - test both platforms
- Keep bundle size small - consider code splitting for large features
- Expo makes updates easy, but test thoroughly before pushing OTA updates

## References

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [React Query](https://tanstack.com/query/latest/docs/react/overview)
