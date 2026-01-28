import React from "react";
import { render, waitFor } from "@testing-library/react-native";

import EventDetailScreen from "../EventDetailScreen";

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    setOptions: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({ params: { eventId: "event-1" } }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock("expo-haptics", () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: "Success" },
}));

jest.mock("@aios/ui/hooks/useTheme", () => ({
  useTheme: () => ({
    theme: {
      text: "#FFFFFF",
      textSecondary: "#CCCCCC",
      textMuted: "#999999",
      backgroundRoot: "#000000",
      backgroundDefault: "#1A1A1A",
      backgroundElevated: "#2A2A2A",
      accent: "#00D9FF",
      accentDim: "#00D9FF33",
      error: "#FF3B30",
      link: "#00D9FF",
      buttonText: "#000000",
    },
  }),
}));

jest.mock("@aios/platform/storage/database", () => ({
  db: {
    events: {
      get: jest.fn(async () => ({
        id: "event-1",
        title: "Demo",
        description: "Join us",
        location: "",
        meetingLink: "https://meet.google.com/abc-defg-hij",
        startAt: new Date().toISOString(),
        endAt: new Date().toISOString(),
        allDay: false,
        timezone: "UTC",
        recurrenceRule: "none",
        exceptions: [],
        overrides: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: "LOCAL",
      })),
      save: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock("@aios/platform/lib/helpers", () => ({
  generateId: () => "generated-id",
}));

describe("EventDetailScreen", () => {
  test("test_eventDetailScreen_renders_joinMeeting", async () => {
    // Happy path: meeting links should surface a Join Meeting action.
    const { getByText } = render(<EventDetailScreen />);

    await waitFor(() => {
      expect(getByText("Join Meeting")).toBeTruthy();
    });
  });
});
