# Cross-Cutting Concepts

## Plain English Summary

This document describes design principles and patterns that apply across the entire AIOS system, not just individual modules. These include the design system (colors, typography, spacing), error handling patterns, security practices, data consistency rules, performance optimizations, and user experience patterns. Every module follows these shared conventions for consistency.

---

## Domain Concepts

### Module Structure

Every module follows the same pattern:

```text
Module = Screen + Storage + Tests + Settings (optional)
```text

### Example Pattern
```typescript
// All modules implement this interface (conceptually)
interface Module {
  listScreen: React.Component;      // View all items
  detailScreen: React.Component;    // View/edit one item
  settingsScreen?: React.Component; // Module-specific settings

  storage: {
    save: (item) => Promise<void>;
    get: () => Promise<Item[]>;
    update: (id, updates) => Promise<void>;
    delete: (id) => Promise<void>;
  };

  tests: Jest.Suite; // 100% coverage
}
```text

### Files
- 14 modules × 2-3 screens = 43 screens
- `/client/storage/database.ts` - All storage methods (200+)
- `/client/storage/__tests__/` - One test file per module

### Data Model Patterns

#### Common Fields
```typescript
interface BaseEntity {
  id: string;            // UUID v4
  createdAt: number;     // Unix timestamp
  updatedAt: number;     // Unix timestamp
  userId?: string;       // Owner (future: multi-user)
}
```text

### Example
```typescript
interface Note extends BaseEntity {
  title: string;
  body: string;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
}

interface Task extends BaseEntity {
  title: string;
  description: string;
 status: 'pending' | 'in-progress' | 'completed';
 priority: 'low' | 'medium' | 'high';
  projectId?: string;
}
```text

**Location:** `/client/models/types.ts`

---

## Design System

### Colors

#### Palette
```typescript
// /client/constants/theme.ts
export const Colors = {
  // Primary
  primary: '#00D9FF',        // Electric blue (brand color)
  primaryDark: '#00A8CC',    // Darker blue
  primaryLight: '#33E0FF',   // Lighter blue

  // Background
  background: '#0A0E1A',     // Deep space (main background)
  surface: '#1A1F2E',        // Slate panel (cards, modals)
  surfaceLight: '#252B3E',   // Lighter surface

  // Semantic
  success: '#00FF94',        // Green (positive actions)
  warning: '#FFB800',        // Orange (caution)
  error: '#FF3B5C',          // Red (errors, destructive actions)
  info: '#00D9FF',           // Blue (informational)

  // Text
  text: '#FFFFFF',           // White (primary text)
  textSecondary: '#A0A8B8',  // Gray (secondary text)
  textDisabled: '#6B7280',   // Dark gray (disabled)

  // UI
  border: '#2A3142',         // Border color
  borderLight: '#3A4152',    // Lighter border
  shadow: '#000000',         // Shadow
};
```text

### Usage
```typescript
<View style={{ backgroundColor: Colors.surface }}>
  <Text style={{ color: Colors.text }}>Hello</Text>
  <Button style={{ backgroundColor: Colors.primary }} />
</View>
```text

### Typography

#### Scale
```typescript
export const Typography = {
  hero: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  h1: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  h2: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
};
```text

### System Fonts
- iOS: SF Pro
- Android: Roboto
- Fallback: System default

### Spacing

#### Scale (2)
```typescript
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```text

### Usage (2)
```typescript
<View style={{ padding: Spacing.md, marginBottom: Spacing.lg }}>
  {/* Content */}
</View>
```text

### Components

#### Shared Components
```text
/client/components/
├── Button.tsx           # Primary, secondary, text variants
├── Card.tsx             # Container with shadow
├── Input.tsx            # Text input with validation
├── Checkbox.tsx         # Checkbox with label
├── Modal.tsx            # Full-screen or bottom-sheet modal
├── Badge.tsx            # Status badges
└── ... (20+ more)
```text

### Example - Button
```typescript
<Button
  title="Save"
  onPress={handleSave}
 variant="primary"        // primary | secondary | text
 size="medium"            // small | medium | large
  disabled={false}
  loading={isLoading}
  icon="check"             // Optional Feather icon
/>
```text

---

## Error Handling

### Client-Side Errors

#### Pattern
```typescript
try {
  const result = await someOperation();
  return result;
} catch (error) {
  console.error('Operation failed:', error);

  // Log to error tracking (future)
  logError(error);

  // Show user-friendly message
  Alert.alert(
    'Error',
    'Something went wrong. Please try again.',
    [{ text: 'OK' }]
  );

  // Re-throw if critical
  throw error;
}
```text

### Error Utility
```typescript
// /client/utils/errorReporting.ts
export const logError = (error: Error, context?: any) => {
  console.error('Error:', error, context);

  // Future: Send to Sentry
  // Sentry.captureException(error, { extra: context });
};

export const showError = (message: string) => {
  Alert.alert('Error', message, [{ text: 'OK' }]);
};
```text

### Server-Side Errors

#### Middleware
```typescript
// /server/middleware/errorHandler.ts
export const errorHandler = (err, req, res, next) => {
  console.error('Server error:', err);

 const status = err.status |  | 500;
 const message = err.message |  | 'Internal server error';

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
```text

### Usage (3)
```typescript
// /server/routes.ts
app.get('/api/notes', async (req, res, next) => {
  try {
    const notes = await getNotes(req.userId);
    res.json({ notes });
  } catch (error) {
    next(error); // Passes to errorHandler
  }
});
```text

### Error Types
```typescript
class ValidationError extends Error {
  status = 400;
}

class NotFoundError extends Error {
  status = 404;
}

class UnauthorizedError extends Error {
  status = 401;
}
```text

---

## Security Concepts

### Authentication Flow

#### Pattern (2)
```typescript
// 1. User logs in
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});

const { token } = await response.json();

// 2. Store token
await AsyncStorage.setItem('jwt_token', token);

// 3. Include in all requests
const notesResponse = await fetch('/api/notes', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```text

### JWT Structure
```json
{
  "header": { "alg": "HS256", "typ": "JWT" },
  "payload": {
    "userId": "user-123",
    "iat": 1640000000,
    "exp": 1640604800
  }
}
```text

### Input Validation

#### Client-Side
```typescript
// Validate before sending
const validateNote = (note: Partial<Note>): string[] => {
  const errors: string[] = [];

 if (!note.title |  | note.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (note.title && note.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  if (note.body && note.body.length > 50000) {
    errors.push('Note is too long (max 50,000 characters)');
  }

  return errors;
};
```text

### Server-Side
```typescript
// /server/middleware/validation.ts
import { z } from 'zod';

const NoteSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().max(50000),
  tags: z.array(z.string()).optional(),
});

export const validateNote = (req, res, next) => {
  try {
    req.body = NoteSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid note data', details: error });
  }
};
```text

### Data Privacy

#### Principles
1. **Local-first:** Data stored on device by default
2. **Minimal sync:** Only sync what user explicitly enables
3. **No tracking:** Zero third-party analytics or tracking
4. **User control:** User can export/delete all data
5. **Encryption (future):** AsyncStorage encrypted, HTTPS for API

### Implementation
```typescript
// All data stored locally
await AsyncStorage.setItem('notes', JSON.stringify(notes));

// Future: Encrypt before storage
const encrypted = await encrypt(JSON.stringify(notes), userKey);
await AsyncStorage.setItem('notes', encrypted);
```text

---

## Performance Concepts

### Rendering Optimization

#### FlatList Virtualization
```typescript
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={item => item.id}
  windowSize={10}               // Items to render ahead
  initialNumToRender={20}       // Initial batch
  maxToRenderPerBatch={10}      // Per scroll
  updateCellsBatchingPeriod={50} // Batch updates
  removeClippedSubviews={true}  // Memory optimization
/>
```text

### Memoization
```typescript
// Expensive computation - memoize
const sortedNotes = useMemo(() => {
  return notes
    .filter(note => !note.isArchived)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}, [notes]);

// Stable callback - prevent child re-renders
const handlePress = useCallback((noteId: string) => {
  navigation.navigate('NoteEditor', { noteId });
}, [navigation]);
```text

### Code Splitting
```typescript
// Lazy load heavy screens
const CalendarScreen = React.lazy(() => import('./CalendarScreen'));
const TranslatorScreen = React.lazy(() => import('./TranslatorScreen'));

// Show loading while loading
<Suspense fallback={<LoadingSpinner />}>
  <CalendarScreen />
</Suspense>
```text

### Network Optimization

#### Debouncing
```typescript
// /client/hooks/useDebounce.ts
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Usage: Debounce search input
const debouncedSearch = useDebounce(searchQuery, 300);
useEffect(() => {
  if (debouncedSearch) {
    searchNotes(debouncedSearch);
  }
}, [debouncedSearch]);
```text

### Request Caching (Future)
```typescript
// Using React Query
const { data, isLoading } = useQuery({
  queryKey: ['notes'],
  queryFn: fetchNotes,
  staleTime: 5 * 60 * 1000,     // 5 minutes
  cacheTime: 10 * 60 * 1000,    // 10 minutes
});
```text

---

## User Experience Patterns

### Haptic Feedback

#### Pattern (3)
```typescript
import * as Haptics from 'expo-haptics';

// Light impact - for subtle interactions
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// Medium impact - for standard buttons
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// Heavy impact - for important actions
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

// Notification - for success/error
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
```text

### Usage (4)
```typescript
const handleDelete = async () => {
  // Heavy haptic before destructive action
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

  // Show confirmation
  Alert.alert('Delete Note', 'Are you sure?', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Delete',
      style: 'destructive',
      onPress: async () => {
        await deleteNote(noteId);
        // Success haptic
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    },
  ]);
};
```text

### Loading States

#### Pattern (4)
```typescript
const [loading, setLoading] = useState(false);

const loadData = async () => {
  setLoading(true);
  try {
    const data = await fetchData();
    setData(data);
  } catch (error) {
    showError('Failed to load data');
  } finally {
    setLoading(false);
  }
};

// Render
if (loading) {
  return <ActivityIndicator size="large" color={Colors.primary} />;
}
```text

### Skeleton Screens
```typescript
// Show skeleton while loading
{loading ? (
  <SkeletonLoader />
) : (
  <FlatList data={items} renderItem={renderItem} />
)}
```text

### Empty States

#### Pattern (5)
```typescript
{items.length === 0 ? (
  <View style={styles.emptyState}>
    <Icon name="inbox" size={64} color={Colors.textSecondary} />
    <Text style={styles.emptyTitle}>No notes yet</Text>
    <Text style={styles.emptySubtitle}>Tap + to create your first note</Text>
  </View>
) : (
  <FlatList data={items} renderItem={renderItem} />
)}
```text

### Error States

#### Pattern (6)
```typescript
{error ? (
  <View style={styles.errorState}>
    <Icon name="alert-circle" size={64} color={Colors.error} />
    <Text style={styles.errorTitle}>Something went wrong</Text>
    <Button title="Try Again" onPress={retry} />
  </View>
) : (
  <Content />
)}
```text

---

## Testing Patterns

### Unit Test Structure

#### Pattern (7)
```typescript
// /client/storage/__tests__/module.test.ts
describe('Module Storage', () => {
  // Setup
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  // Teardown
  afterEach(async () => {
    jest.clearAllMocks();
  });

  // Test CRUD
  describe('Create', () => {
    it('should create an item', async () => {
      const item = { id: '1', title: 'Test' };
      await saveItem(item);
      const saved = await getItem('1');
      expect(saved).toEqual(item);
    });
  });

  describe('Read', () => {
    it('should read all items', async () => {
      // Test implementation
    });
  });

  describe('Update', () => {
    it('should update an item', async () => {
      // Test implementation
    });
  });

  describe('Delete', () => {
    it('should delete an item', async () => {
      // Test implementation
    });
  });
});
```text

### Component Test Pattern

```typescript
import { render, fireEvent } from '@testing-library/react-native';

describe('Button', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Button title="Click Me" />);
    expect(getByText('Click Me')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Click" onPress={onPress} />);

    fireEvent.press(getByText('Click'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Click" onPress={onPress} disabled={true} />
    );

    fireEvent.press(getByText('Click'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
```text

---

## Assumptions

1. **Consistency:** All modules follow the same patterns
2. **Design System:** Theme constants used throughout (no hardcoded colors)
3. **Error Handling:** All async operations wrapped in try-catch
4. **Security:** All user inputs validated client and server-side
5. **Performance:** React optimization hooks (useMemo, useCallback) used appropriately
6. **Testing:** All modules have 100% test coverage
7. **UX:** Haptic feedback on all interactions, loading states for all async operations

---

## Failure Modes

### Pattern Violations

1. **Inconsistent Styling:**
   - **Risk:** Hardcoded colors, font sizes
   - **Detection:** Code review, visual testing
   - **Mitigation:** Enforce theme constants, linting rules

2. **Missing Error Handling:**
   - **Risk:** Unhandled errors crash app
   - **Detection:** Error boundaries, monitoring
   - **Mitigation:** Comprehensive try-catch, error boundaries

3. **Performance Regressions:**
   - **Risk:** Unnecessary re-renders, memory leaks
   - **Detection:** React DevTools Profiler, performance tests
   - **Mitigation:** Regular profiling, code review

---

## How to Verify

### Verify Design System

```bash
# Check theme constants
cat /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/client/constants/theme.ts

# Ensure no hardcoded colors (should return nothing)
grep -r "color.*#" /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/client/screens/ | grep -v "Colors\."
```text

### Verify Error Handling

```bash
# Check error utilities
cat /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/client/utils/errorReporting.ts

# Find try-catch blocks
grep -r "try {" /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/client/storage/
```text

### Verify Testing Patterns

```bash
# Run tests
npm test

# Check coverage
npm run test:coverage

# Verify all modules tested
ls /home/runner/work/Mobile-Scaffold/Mobile-Scaffold/client/storage/__tests__/
```text

---

## Related Documentation

- [Solution Strategy](04_solution_strategy.md) - High-level strategies
- [Building Blocks](05_building_blocks.md) - Where concepts are implemented
- [Quality Requirements](10_quality.md) - Quality metrics
- [Design Guidelines](../../technical/design_guidelines.md) - Full design spec
