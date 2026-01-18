# Client/Frontend Path Instructions

**Scope:** Applies to changes in `/client/**` directory  
**Authority:** Extends global `.github/copilot-instructions.md`

## Plain English Summary

- Client is React Native with Expo, targeting iOS, Android, and web
- All state management through React Context and TanStack Query
- TypeScript is mandatory - no `any` types without explicit justification
- Test coverage required for all new features (React Testing Library)
- Error boundaries must catch and display user-friendly errors
- Accessibility (a11y) is required - test with screen readers
- Dependencies must be vetted through security checks before adding

## Technical Detail

### Code Structure

```
client/
├── App.tsx                 # Root component
├── index.js                # Entry point
├── components/             # Reusable UI components
├── screens/                # Screen components (navigation targets)
├── navigation/             # React Navigation setup
├── hooks/                  # Custom React hooks
├── context/                # React Context providers
├── lib/                    # Third-party library wrappers
├── utils/                  # Pure utility functions
├── constants/              # App constants
├── models/                 # Type definitions
├── storage/                # AsyncStorage wrappers
└── analytics/              # Analytics tracking
```

### Coding Standards

**TypeScript (MANDATORY):**

```typescript
// ✅ Good: Explicit types
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

function getUserProfile(userId: string): Promise<UserProfile> {
  // Implementation
}

// ❌ Bad: Using any
function getUserProfile(userId: any): Promise<any> {
  // Don't do this
}
```

**Exceptions allowed:**
- Third-party library types not available: Document with `// @ts-expect-error: library-name lacks types`
- Gradual migration: Use `TODO(typescript): Add proper types` and file issue

**React Functional Components:**

```typescript
// ✅ Good: Functional component with TypeScript
interface ProfileScreenProps {
  userId: string;
  onBack: () => void;
}

export function ProfileScreen({ userId, onBack }: ProfileScreenProps): JSX.Element {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // Implementation
  
  return (
    <View>
      {/* UI */}
    </View>
  );
}

// ❌ Bad: Class components (unless required for error boundaries)
class ProfileScreen extends React.Component {
  // Avoid
}
```

### State Management

**Use React Context for global state:**

```typescript
// client/context/AuthContext.tsx
import { createContext, useContext } from 'react';

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

**Use TanStack Query for server state:**

```typescript
// client/hooks/useUserProfile.ts
import { useQuery } from '@tanstack/react-query';

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => fetchUserProfile(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

**NEVER use Redux** unless there's an ADR justifying it.

### Testing Requirements

**All new features require tests:**

```typescript
// client/components/__tests__/Button.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('should call onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button onPress={onPress}>Click Me</Button>
    );
    
    fireEvent.press(getByText('Click Me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    const { getByText } = render(
      <Button disabled={true}>Click Me</Button>
    );
    
    const button = getByText('Click Me');
    expect(button).toBeDisabled();
  });
});
```

**Coverage requirements:**
- New components: 80% coverage minimum
- Utility functions: 100% coverage expected
- Integration tests for screen flows

**Run tests:**
```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Error Handling

**Always use error boundaries:**

```typescript
// client/components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // TODO: Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback 
        ? this.props.fallback(this.state.error!)
        : <ErrorFallback error={this.state.error!} />;
    }

    return this.props.children;
  }
}
```

**User-facing errors must be friendly:**

```typescript
// ❌ Bad: Technical error shown to user
"Error: ECONNREFUSED 127.0.0.1:5000"

// ✅ Good: User-friendly message
"Unable to connect to the server. Please check your internet connection and try again."
```

**Log errors for debugging:**
```typescript
try {
  await someOperation();
} catch (error) {
  console.error('Operation failed:', error);
  // Show user-friendly message
  showToast('Unable to complete the operation. Please try again.');
  // Re-throw if needed
  throw error;
}
```

### Accessibility (a11y)

**REQUIRED for all UI components:**

```typescript
// ✅ Good: Accessible button
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Save profile"
  accessibilityHint="Saves your profile changes"
  onPress={handleSave}
>
  <Text>Save</Text>
</Pressable>

// ❌ Bad: No accessibility props
<Pressable onPress={handleSave}>
  <Text>Save</Text>
</Pressable>
```

**Test with screen readers:**
- iOS: VoiceOver
- Android: TalkBack
- Web: NVDA/JAWS

**Color contrast:**
- Text: Minimum 4.5:1 ratio
- Large text (18pt+): Minimum 3:1 ratio
- Use tools: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Performance Patterns

**Optimize re-renders:**

```typescript
// ✅ Good: Memoized expensive computation
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// ✅ Good: Memoized callback
const handlePress = useCallback(() => {
  doSomething(id);
}, [id]);

// ❌ Bad: Creating new function on every render
<Button onPress={() => doSomething(id)} />
```

**Use React.memo for expensive components:**

```typescript
export const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }: Props) {
  // Expensive rendering logic
  return <View>{/* ... */}</View>;
});
```

**Lazy load screens:**

```typescript
// client/navigation/AppNavigator.tsx
import { lazy, Suspense } from 'react';

const ProfileScreen = lazy(() => import('../screens/ProfileScreen'));

function AppNavigator() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Suspense>
  );
}
```

### Dependency Policy

**BEFORE adding any dependency:**

1. **Check for alternatives:**
   ```bash
   npm search <package-name>
   ```

2. **Review package health:**
   - Weekly downloads (use [npm trends](https://npmtrends.com/))
   - Last update date
   - Open issues count
   - License compatibility (MIT, Apache, BSD preferred)

3. **Run security check:**
   ```bash
   # This will be automated via gh-advisory-database tool
   npm audit
   ```

4. **Document decision:**
   - Large dependencies (>100kb): Require ADR
   - Security-sensitive (auth, crypto): Require ADR + security review

**Preferred libraries (already in use):**
- UI: React Native core components, Expo components
- Navigation: React Navigation
- State: TanStack Query, React Context
- Forms: Zod validation
- Storage: AsyncStorage
- Networking: fetch API

**Avoid:**
- Unmaintained packages (last update >1 year)
- Packages with known security issues
- Large dependencies without clear benefit
- Packages that duplicate existing functionality

### Styling

**Use React Native StyleSheet:**

```typescript
// ✅ Good: StyleSheet with TypeScript
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

// Usage
<View style={styles.container}>
  <Text style={styles.title}>Hello</Text>
</View>
```

**Conditional styles:**

```typescript
<View style={[
  styles.button,
  isPressed && styles.buttonPressed,
  disabled && styles.buttonDisabled,
]} />
```

**Theme/constants:**
```typescript
// client/constants/theme.ts
export const Colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  background: '#F2F2F7',
  text: '#000000',
  textSecondary: '#8E8E93',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
```

## Assumptions

- React Native and Expo are the client frameworks (see `client/App.tsx`)
- TypeScript is configured and enforced
- Tests use React Testing Library and Jest
- Navigation uses React Navigation (see `client/navigation/`)
- AsyncStorage for local persistence (see ADR-001)
- CI enforces linting, type checking, and tests

## Failure Modes

| Failure Mode | Symptom | Solution |
|--------------|---------|----------|
| Type errors | `any` types everywhere | Enable strict TypeScript, add proper types |
| Untested code | Features break unexpectedly | Require tests in PR checklist, track coverage |
| Poor performance | Sluggish UI, dropped frames | Use React DevTools Profiler, optimize re-renders |
| Inaccessible UI | Screen readers can't navigate | Add accessibility props, test with VoiceOver/TalkBack |
| Dependency bloat | Large bundle size | Audit dependencies, remove unused ones |
| Unhandled errors | App crashes | Add error boundaries, improve error handling |
| State management chaos | Props drilling, duplicate state | Use Context for global state, TanStack Query for server state |

## How to Verify

**Verify TypeScript strict mode:**
```bash
npm run check:types
# Should pass with 0 errors
```

**Run all client tests:**
```bash
npm test -- client/
# All tests should pass
```

**Check test coverage:**
```bash
npm run test:coverage
# Coverage should be >80% for client/
```

**Lint client code:**
```bash
npm run lint
# Should pass with 0 errors
```

**Build the app:**
```bash
# Expo development build
npm start

# Static build
npm run expo:static:build
```

**Check for type safety violations:**
```bash
# Search for 'any' types
grep -r ": any" client/ --include="*.ts" --include="*.tsx"

# Search for @ts-ignore
grep -r "@ts-ignore" client/ --include="*.ts" --include="*.tsx"
```

**Accessibility audit:**
```bash
# Install axe-core if needed
npm install --save-dev @axe-core/react

# Run accessibility tests
npm test -- --testNamePattern="accessibility"
```

**Check bundle size:**
```bash
npm run expo:static:build
# Check output for bundle size warnings
```

---

**Remember:** The client is the user's first (and often only) interaction with AIOS. Make it fast, accessible, and delightful.
