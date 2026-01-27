# Network Status and Offline Handling

## Plain English Summary

This guide explains how to detect when users are offline and provide appropriate feedback. Shows users why their actions might be failing and prevents confusing error messages.

**Related Tasks:** TASK-018 (Network Status and Offline Handling)

**Last Updated:** 2026-01-26

---

## The Problem

Without network status detection:
- Users don't know why their actions fail
- Silent failures when network is unavailable  
- Confusing error messages that don't mention connectivity
- Wasted attempts to perform network operations while offline

## The Solution

Monitor network status and provide clear feedback when offline. Prevent unnecessary network requests and show helpful guidance.

---

## Installation

The network status features require `@react-native-community/netinfo`:

```bash
npm install @react-native-community/netinfo
```

**Security Check**: ✅ Package verified safe (no known vulnerabilities)

---

## Quick Start

### 1. Add Network Banner to Your App

The easiest way to add offline detection is to include the `NetworkStatusBanner` at the top of your app:

```tsx
// In App.tsx or your root component
import { NetworkStatusBanner } from "@design-system/components/NetworkStatusBanner";

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <NetworkStatusBanner />
      <YourAppContent />
    </View>
  );
}
```

That's it! The banner will automatically show when offline and hide when back online.

---

## Using the useNetworkStatus Hook

For more control, use the `useNetworkStatus` hook directly:

### Basic Usage

```tsx
import { useNetworkStatus } from "@platform/lib/useNetworkStatus";

function MyComponent() {
  const { isOnline, isOffline } = useNetworkStatus();

  if (isOffline) {
    return (
      <ScreenStateMessage
        title="You're offline"
        description="Connect to the internet to continue"
        icon="wifi-off"
      />
    );
  }

  return <YourContent />;
}
```

### Prevent Network Requests When Offline

```tsx
function DataSyncComponent() {
  const { isOnline } = useNetworkStatus();

  const handleSync = async () => {
    if (!isOnline) {
      Alert.alert(
        "Offline",
        "You need an internet connection to sync your data"
      );
      return;
    }

    await syncData();
  };

  return (
    <Button 
      title="Sync Data" 
      onPress={handleSync}
      disabled={!isOnline}
    />
  );
}
```

### Check Network Type for Large Downloads

```tsx
import { useNetworkStatus, isGoodConnectionForDownload } from "@platform/lib/useNetworkStatus";

function VideoPlayerComponent() {
  const { isOnline, networkState } = useNetworkStatus();

  const shouldAutoPlayHD =
    isOnline && isGoodConnectionForDownload(networkState);

  useEffect(() => {
    if (shouldAutoPlayHD) {
      loadHDVideo();
    } else {
      loadSDVideo();
    }
  }, [shouldAutoPlayHD]);
}
```

---

## API Reference

### useNetworkStatus()

Hook for monitoring network connectivity.

**Returns:**
```typescript
{
  isOnline: boolean;        // True if connected with internet access
  isOffline: boolean;       // True if offline
  networkState: NetworkState | null;  // Full network details
  isLoading: boolean;       // True while determining status
}
```

**NetworkState Type:**
```typescript
{
  isConnected: boolean | null;        // Connected to network
  isInternetReachable: boolean | null; // Has internet access
  type: "wifi" | "cellular" | "unknown" | ...; // Connection type
  details: {
    isConnectionExpensive?: boolean;  // Metered connection
    cellularGeneration?: "2g" | "3g" | "4g" | "5g";
  } | null;
}
```

### isGoodConnectionForDownload(networkState)

Helper to determine if network is suitable for large downloads.

**Parameters:**
- `networkState`: Current network state from `useNetworkStatus()`

**Returns:** `boolean` - True if WiFi or fast cellular (4G/5G, not expensive)

---

## Common Patterns

### Pattern 1: Conditional UI Based on Connection

```tsx
function SyncButton() {
  const { isOnline } = useNetworkStatus();

  return (
    <Button
      title={isOnline ? "Sync Now" : "Offline - Can't Sync"}
      onPress={handleSync}
      disabled={!isOnline}
      style={!isOnline && styles.disabledButton}
    />
  );
}
```

### Pattern 2: Show Different Content When Offline

```tsx
function ContentFeed() {
  const { isOnline } = useNetworkStatus();

  if (!isOnline) {
    return <CachedContentView />;
  }

  return <LiveContentFeed />;
}
```

### Pattern 3: Queue Actions While Offline

```tsx
function NoteEditor() {
  const { isOnline } = useNetworkStatus();
  const [pendingSync, setPendingSync] = useState(false);

  const handleSave = async (note: Note) => {
    if (!isOnline) {
      // Save locally and mark for sync
      await saveNoteLocally(note);
      setPendingSync(true);
      Toast.show("Saved offline. Will sync when online.");
      return;
    }

    // Save to server
    await saveNoteToServer(note);
  };

  // Auto-sync when back online
  useEffect(() => {
    if (isOnline && pendingSync) {
      syncPendingNotes();
      setPendingSync(false);
    }
  }, [isOnline, pendingSync]);
}
```

### Pattern 4: Smart Download Behavior

```tsx
function MediaDownloader({ mediaUrl, size }: Props) {
  const { isOnline, networkState } = useNetworkStatus();

  const shouldAutoDownload = useMemo(() => {
    if (!isOnline) return false;
    
    // Small files: download on any connection
    if (size < 5_000_000) return true;
    
    // Large files: only on good connections
    return isGoodConnectionForDownload(networkState);
  }, [isOnline, networkState, size]);

  const handleDownload = () => {
    if (!isOnline) {
      Alert.alert("Offline", "Connect to download this file");
      return;
    }

    if (!isGoodConnectionForDownload(networkState)) {
      Alert.alert(
        "Cellular Data",
        "This file is large. Continue download on cellular?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Download", onPress: () => startDownload() },
        ]
      );
      return;
    }

    startDownload();
  };
}
```

---

## NetworkStatusBanner Component

Pre-built component that shows a banner when offline.

### Props

```typescript
interface NetworkStatusBannerProps {
  message?: string;         // Custom offline message
  description?: string;     // Custom description
  testID?: string;         // For testing
}
```

### Usage Examples

**Basic (default messages):**
```tsx
<NetworkStatusBanner />
```

**Custom messages:**
```tsx
<NetworkStatusBanner
  message="No Internet"
  description="Some features unavailable"
/>
```

**Positioning:**
```tsx
// At top of screen (recommended)
<View style={{ flex: 1 }}>
  <NetworkStatusBanner />
  <YourContent />
</View>

// Above specific content
<View>
  <NetworkStatusBanner />
  <DataRequiringConnection />
</View>
```

---

## Best Practices

### ✅ DO

1. **Show network banner at app level** for global offline awareness
2. **Disable network-dependent actions** when offline
3. **Provide clear feedback** about why actions failed
4. **Queue offline actions** for later sync when appropriate
5. **Check connection quality** before large downloads
6. **Test offline scenarios** thoroughly
7. **Cache data** for offline viewing when possible

### ❌ DON'T

1. **Don't silently fail** network requests when offline
2. **Don't show generic errors** that don't mention connectivity
3. **Don't attempt network operations** without checking status first
4. **Don't auto-download large files** on expensive connections
5. **Don't assume** WiFi means unlimited data (could be hotspot)
6. **Don't forget** to handle "unknown" network states gracefully

---

## Error Handling Integration

Combine network status with error handling:

```tsx
function DataFetcher() {
  const { isOnline } = useNetworkStatus();
  const { data, error, retry } = useDataLoader(fetchData);

  if (error) {
    // Check if error might be network-related
    const errorMessage = !isOnline
      ? "You're offline. Check your internet connection."
      : error.message;

    return (
      <ScreenStateMessage
        title="Failed to load"
        description={errorMessage}
        actionLabel={isOnline ? "Retry" : "OK"}
        onActionPress={isOnline ? retry : undefined}
        icon={isOnline ? "alert-circle" : "wifi-off"}
      />
    );
  }

  return <YourContent data={data} />;
}
```

---

## Testing

### Unit Tests

```typescript
import { renderHook } from "@testing-library/react-hooks";
import { useNetworkStatus } from "@platform/lib/useNetworkStatus";

// Mock NetInfo
jest.mock("@react-native-community/netinfo", () => ({
  default: {
    fetch: jest.fn(() => Promise.resolve({
      isConnected: true,
      isInternetReachable: true,
      type: "wifi",
      details: null,
    })),
    addEventListener: jest.fn(() => jest.fn()),
  },
}));

describe("useNetworkStatus", () => {
  it("should detect online status", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useNetworkStatus());
    await waitForNextUpdate();
    expect(result.current.isOnline).toBe(true);
  });
});
```

### Integration Tests

```typescript
import { render, waitFor } from "@testing-library/react-native";
import NetInfo from "@react-native-community/netinfo";

describe("NetworkStatusBanner", () => {
  it("should show when offline", async () => {
    // Mock offline state
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: false,
      isInternetReachable: false,
      type: "none",
    });

    const { getByText } = render(<NetworkStatusBanner />);
    
    await waitFor(() => {
      expect(getByText("You're offline")).toBeTruthy();
    });
  });

  it("should hide when online", async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: "wifi",
    });

    const { queryByText } = render(<NetworkStatusBanner />);
    
    await waitFor(() => {
      expect(queryByText("You're offline")).toBeNull();
    });
  });
});
```

### Manual Testing

1. **Airplane mode**: Enable airplane mode and verify banner appears
2. **WiFi toggle**: Turn WiFi on/off and verify banner updates
3. **Cellular toggle**: Switch to cellular and verify detection
4. **Network actions**: Try actions requiring network while offline
5. **Reconnection**: Go offline, perform action, go online, verify retry works

---

## Troubleshooting

### Banner doesn't appear

**Check:**
1. Is `@react-native-community/netinfo` installed?
2. Run `npm install @react-native-community/netinfo`
3. For iOS: `cd ios && pod install`
4. Restart Metro bundler

### "NetInfo not found" warning

The hook gracefully handles missing NetInfo by assuming online. Install the package to enable detection:

```bash
npm install @react-native-community/netinfo
```

### Network state is always "unknown"

This is normal during initialization. The `isLoading` flag will be `true` until first check completes.

---

## Platform Differences

### iOS
- Requires `NSAppTransportSecurity` configuration in Info.plist for network access
- WiFi detection works automatically
- Cellular network type detection supported

### Android
- Requires `ACCESS_NETWORK_STATE` permission in AndroidManifest.xml
- WiFi detection works automatically
- Cellular generation detection supported (2G/3G/4G/5G)

### Web
- Uses Navigator.onLine API
- Limited network type detection
- May not detect captive portals

---

## Related Documentation

- **[Loading States Pattern](./loading-states-pattern.md)** - Combine with network status for better UX
- **[Error Handling Guide](./error-handling.md)** - Network error patterns
- **[Offline Data Sync](./offline-sync.md)** - Building offline-first features

---

## Migration Guide

### Adding to Existing App

1. **Install package:**
   ```bash
   npm install @react-native-community/netinfo
   ```

2. **Add banner to App.tsx:**
   ```tsx
   import { NetworkStatusBanner } from "@design-system/components/NetworkStatusBanner";
   
   // In your root component
   <NetworkStatusBanner />
   ```

3. **Update network-dependent components:**
   ```tsx
   import { useNetworkStatus } from "@platform/lib/useNetworkStatus";
   
   const { isOnline } = useNetworkStatus();
   // Use in your component logic
   ```

4. **Test thoroughly:**
   - Test offline scenarios
   - Test reconnection
   - Test different network types

---

## Questions?

**Q: Does this work without NetInfo installed?**

A: Yes, but it will always assume online. Install NetInfo for actual detection.

**Q: How often does it check network status?**

A: NetInfo provides real-time updates via event listeners. No polling needed.

**Q: Does it detect captive portals (login-required WiFi)?**

A: On iOS/Android, yes (via `isInternetReachable`). On web, detection is limited.

**Q: Can I customize the banner appearance?**

A: Currently the banner uses theme colors. For custom styling, create your own banner using the `useNetworkStatus` hook.

**Q: Should I check network status before every API call?**

A: Not necessary if you have global error handling. Use for user-initiated actions or to provide better UX.
