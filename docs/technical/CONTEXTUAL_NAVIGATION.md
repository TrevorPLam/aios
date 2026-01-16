# Contextual Navigation Guide

## Overview
The app now supports contextual navigation, which allows modules to suggest related modules based on user focus. For example, when viewing an email with a date/time, the Calendar module can be suggested as the next navigation target.

## How to Use

### Setting a Contextual Module

In any screen where you detect relevant context (e.g., an email with a date), use the `useNavigationContext` hook:

```typescript
import { useNavigationContext } from "@/context/NavigationContext";

function EmailDetailScreen() {
  const { setContextualModule } = useNavigationContext();
  
  useEffect(() => {
    // If email contains a date/event reference
    if (emailHasDateReference) {
      setContextualModule("calendar");
    }
    
    // Clean up when leaving the screen
    return () => {
      setContextualModule(null);
    };
  }, [emailHasDateReference]);
  
  // ... rest of component
}
```

### How It Works

1. When a contextual module is set, the right arrow (›) in the bottom navigation will navigate to that module instead of the next module in the usage-based order.

2. After navigating to the contextual module, the context is automatically cleared, and navigation returns to normal ordering.

3. The contextual navigation only affects the **right** arrow (next module). The left arrow continues with regular ordering.

## Example Use Cases

- **Email → Calendar**: When viewing an email with a meeting invitation or date reference
- **Messages → Contacts**: When chatting with someone, suggest their contact profile
- **Calendar → Email**: When viewing an event, suggest related email threads
- **Notes → Photos**: When a note references images
- **Any Module → Lists**: When detecting a checklist or task list context

## Implementation Notes

- Contextual suggestions should be cleared when leaving the screen
- Use clear, obvious triggers for setting contextual modules (e.g., detecting dates, @mentions, hashtags)
- Don't overuse contextual navigation - it should feel natural and helpful, not intrusive
