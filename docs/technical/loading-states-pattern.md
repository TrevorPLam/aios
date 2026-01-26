# Loading States Pattern Guide

## Plain English Summary

This guide explains how to implement loading states in your components to give users feedback when data is being fetched. No more blank screens or confusion about whether something is loading!

**Related Tasks:** TASK-017 (Loading States for Screens)

**Last Updated:** 2026-01-26

---

## The Problem

When components fetch data asynchronously, users may see:
- **Blank screens** while data loads
- **Stale/old data** that hasn't refreshed yet
- **No feedback** that something is happening
- **Confusion** about whether the app is broken or just loading

## The Solution

Show clear loading indicators while data is being fetched, and handle errors gracefully with retry options.

---

## Using the useDataLoader Hook

The `useDataLoader` hook provides a consistent pattern for loading data with proper state management.

### Basic Usage

```tsx
import { useDataLoader } from "@platform/lib/useDataLoader";
import { ScreenStateMessage } from "@design-system/components/ScreenStateMessage";

function MyComponent() {
  const { data, loading, error, retry } = useDataLoader(
    async () => await database.items.getAll()
  );

  if (loading) {
    return <ScreenStateMessage title="Loading..." isLoading />;
  }

  if (error) {
    return (
      <ScreenStateMessage
        title="Failed to load"
        description={error.message}
        actionLabel="Retry"
        onActionPress={retry}
        icon="alert-circle"
      />
    );
  }

  return <ItemsList items={data} />;
}
```

### With Dependencies (Auto-reload)

```tsx
function ContactDetails({ contactId }: { contactId: string }) {
  const { data, loading, error } = useDataLoader(
    async () => await database.contacts.getById(contactId),
    { deps: [contactId] } // Reload when contactId changes
  );

  if (loading) return <ActivityIndicator />;
  if (error) return <ErrorMessage error={error} />;
  return <ContactCard contact={data} />;
}
```

### Manual Loading (Don't Load Immediately)

```tsx
function SearchComponent() {
  const { data, loading, reload } = useDataLoader(
    async () => await api.search(query),
    { immediate: false } // Don't load on mount
  );

  const handleSearch = () => {
    reload(); // Manually trigger load
  };

  // ...
}
```

---

## Using ScreenStateMessage Component

The `ScreenStateMessage` component provides a consistent way to show loading, empty, and error states.

### Props

```typescript
interface ScreenStateMessageProps {
  title: string;              // Main message
  description?: string;       // Optional details
  icon?: IconName;           // Icon to show (e.g., "alert-circle")
  actionLabel?: string;      // Button text (e.g., "Retry")
  onActionPress?: () => void; // Button callback
  isLoading?: boolean;       // Show loading spinner
  testID?: string;           // For testing
}
```

### Loading State

```tsx
<ScreenStateMessage 
  title="Loading contacts..." 
  isLoading 
/>
```

### Empty State

```tsx
<ScreenStateMessage
  title="No contacts yet"
  description="Add your first contact to get started"
  actionLabel="Add Contact"
  onActionPress={handleAddContact}
  icon="user-plus"
/>
```

### Error State

```tsx
<ScreenStateMessage
  title="Failed to load contacts"
  description={error.message}
  actionLabel="Retry"
  onActionPress={retry}
  icon="alert-circle"
/>
```

---

## Patterns for Different Scenarios

### Pattern 1: Simple Data Fetch

**Use case:** Load data once on mount

```tsx
function ContactsList() {
  const { data, loading, error, retry } = useDataLoader(
    async () => await database.contacts.getAll()
  );

  if (loading) {
    return (
      <ScreenStateMessage 
        title="Loading contacts..." 
        isLoading 
      />
    );
  }

  if (error) {
    return (
      <ScreenStateMessage
        title="Failed to load contacts"
        description={error.message}
        actionLabel="Retry"
        onActionPress={retry}
        icon="alert-circle"
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <ScreenStateMessage
        title="No contacts yet"
        description="Add your first contact to get started"
        actionLabel="Add Contact"
        onActionPress={handleAddContact}
        icon="user-plus"
      />
    );
  }

  return <FlatList data={data} renderItem={renderContact} />;
}
```

### Pattern 2: Inline Loading (Partial UI)

**Use case:** Show loading indicator within existing UI (not full screen)

```tsx
function UserProfile({ userId }: { userId: string }) {
  const { data, loading, error } = useDataLoader(
    async () => await api.getUserProfile(userId),
    { deps: [userId] }
  );

  return (
    <View style={styles.container}>
      <Header />
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <ThemedText>Loading profile...</ThemedText>
        </View>
      )}
      
      {error && (
        <ErrorBanner error={error} />
      )}
      
      {data && (
        <ProfileContent profile={data} />
      )}
      
      <Footer />
    </View>
  );
}
```

### Pattern 3: Search with Manual Trigger

**Use case:** Load data based on user action (search, filter, etc.)

```tsx
function SearchScreen() {
  const [query, setQuery] = useState("");
  
  const { data, loading, error, reload } = useDataLoader(
    async () => {
      if (!query.trim()) return [];
      return await api.search(query);
    },
    { immediate: false }
  );

  const handleSearch = () => {
    reload();
  };

  return (
    <View>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search..."
      />
      <Button title="Search" onPress={handleSearch} disabled={loading} />
      
      {loading && <ActivityIndicator />}
      {error && <ErrorMessage error={error} />}
      {data && <SearchResults results={data} />}
    </View>
  );
}
```

### Pattern 4: Saving State (Form Submission)

**Use case:** Show loading during save/create/update operations

```tsx
function CreateNoteForm() {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    setSaving(true);

    try {
      await database.notes.save({ title, body: "" });
      // Success feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete();
    } catch (error) {
      Alert.alert("Error", "Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View>
      <TextInput value={title} onChangeText={setTitle} />
      <Button 
        title={saving ? "Saving..." : "Save"} 
        onPress={handleSave} 
        disabled={saving}
      />
    </View>
  );
}
```

---

## Best Practices

### ✅ DO

1. **Always show loading indicators** for async operations
2. **Provide retry functionality** for failed loads
3. **Show descriptive error messages** that help users understand what went wrong
4. **Handle empty states** with helpful guidance
5. **Use consistent components** (ScreenStateMessage) for similar states
6. **Disable buttons** during loading to prevent double-submissions
7. **Clean up on unmount** (useDataLoader handles this automatically)

### ❌ DON'T

1. **Don't show blank screens** while loading
2. **Don't ignore errors** silently
3. **Don't forget to handle empty data** (null, undefined, empty array)
4. **Don't update state after unmount** (useDataLoader prevents this)
5. **Don't make users guess** why something failed
6. **Don't forget loading states** on slow operations (>300ms)

---

## Common Mistakes

### Mistake 1: No Loading State

**❌ Bad:**
```tsx
function BadComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    loadData().then(setData);
  }, []);

  return <ItemsList items={data} />; // Shows nothing while loading!
}
```

**✅ Good:**
```tsx
function GoodComponent() {
  const { data, loading } = useDataLoader(loadData);

  if (loading) return <ScreenStateMessage title="Loading..." isLoading />;
  return <ItemsList items={data} />;
}
```

### Mistake 2: Updating State After Unmount

**❌ Bad:**
```tsx
function BadComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    loadData().then(setData); // Could update after unmount!
  }, []);

  return <ItemsList items={data} />;
}
```

**✅ Good:**
```tsx
function GoodComponent() {
  const { data } = useDataLoader(loadData); // Handles cleanup automatically
  return <ItemsList items={data} />;
}
```

### Mistake 3: No Error Handling

**❌ Bad:**
```tsx
function BadComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    loadData().then(setData); // Errors disappear silently!
  }, []);

  return <ItemsList items={data} />;
}
```

**✅ Good:**
```tsx
function GoodComponent() {
  const { data, loading, error, retry } = useDataLoader(loadData);

  if (loading) return <ScreenStateMessage title="Loading..." isLoading />;
  if (error) return <ErrorMessage error={error} onRetry={retry} />;
  return <ItemsList items={data} />;
}
```

---

## Testing Loading States

```typescript
import { renderHook, waitFor } from "@testing-library/react-native";
import { useDataLoader } from "@platform/lib/useDataLoader";

describe("MyComponent", () => {
  it("should show loading state", () => {
    const { getByText } = render(<MyComponent />);
    expect(getByText("Loading...")).toBeTruthy();
  });

  it("should show error state with retry", async () => {
    mockDatabase.getAll.mockRejectedValue(new Error("Network error"));
    
    const { getByText } = render(<MyComponent />);
    
    await waitFor(() => {
      expect(getByText("Failed to load")).toBeTruthy();
      expect(getByText("Retry")).toBeTruthy();
    });
  });

  it("should retry after error", async () => {
    const mockLoader = jest
      .fn()
      .mockRejectedValueOnce(new Error("Error"))
      .mockResolvedValueOnce("success");

    const { result } = renderHook(() => useDataLoader(mockLoader));

    await waitFor(() => expect(result.current.error).toBeTruthy());
    
    await result.current.retry();
    
    await waitFor(() => expect(result.current.data).toBe("success"));
  });
});
```

---

## Migration Guide

### Existing Component Without Loading State

If you have a component that loads data but doesn't show loading indicators:

**Before:**
```tsx
function MyComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    loadData().then(setData);
  }, []);
  
  return data ? <ItemsList items={data} /> : null;
}
```

**After:**
```tsx
function MyComponent() {
  const { data, loading, error, retry } = useDataLoader(loadData);
  
  if (loading) return <ScreenStateMessage title="Loading..." isLoading />;
  if (error) return <ErrorMessage error={error} onRetry={retry} />;
  if (!data) return <EmptyState />;
  
  return <ItemsList items={data} />;
}
```

---

## Related Documentation

- **[useDataLoader API](../technical/lib-usage.md#usedataloader)** - Complete API reference
- **[ScreenStateMessage API](../technical/design-system.md#screenstatemessage)** - Component documentation
- **[Testing Patterns](../testing/test_requirements_and_patterns.md)** - How to test loading states

---

## Questions?

**Q: When should I use ScreenStateMessage vs ActivityIndicator?**

A: Use ScreenStateMessage for full-screen states (initial load, empty, error). Use ActivityIndicator for inline/partial loading (e.g., pull-to-refresh, paginated loading).

**Q: How do I handle pull-to-refresh?**

A: Use the `reload()` function from useDataLoader:
```tsx
const { data, loading, reload } = useDataLoader(loadData);
return (
  <FlatList
    data={data}
    refreshing={loading}
    onRefresh={reload}
  />
);
```

**Q: Should I show loading states for fast operations (<100ms)?**

A: It depends. If the operation is consistently fast, you might skip the loading indicator. But for operations that vary (network calls), always show loading states.

**Q: How do I show skeleton screens instead of spinners?**

A: Create a SkeletonLoader component and use it in place of ScreenStateMessage during loading:
```tsx
if (loading) return <SkeletonLoader />;
```
