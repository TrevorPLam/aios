import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";

import IntegrationsScreen from "@features/integrations/ui/IntegrationsScreen";

const mockNavigate = jest.fn();
const mockGetAllSorted = jest.fn();
const mockGetStatistics = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useFocusEffect: (callback: () => void) => {
    const React = require("react");
    React.useEffect(callback, []);
  },
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock("@design-system/hooks/useTheme", () => ({
  useTheme: () => ({
    theme: {
      accent: "#00D9FF",
      accentDim: "#00D9FF33",
      backgroundDefault: "#1A1F2E",
      backgroundSecondary: "#101522",
      border: "#333333",
      buttonText: "#0A0E1A",
      error: "#FF3B5C",
      success: "#00FF94",
      text: "#FFFFFF",
      textMuted: "#999999",
    },
  }),
}));

jest.mock("@platform/storage/database", () => ({
  db: {
    integrations: {
      getAllSorted: (...args: unknown[]) => mockGetAllSorted(...args),
      getStatistics: (...args: unknown[]) => mockGetStatistics(...args),
    },
  },
}));

describe("IntegrationsScreen", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockGetAllSorted.mockReset();
    mockGetStatistics.mockReset();
  });

  it("navigates to IntegrationDetail when an integration is selected", async () => {
    mockGetAllSorted.mockResolvedValue([
      {
        id: "google-calendar",
        name: "Google Calendar",
        serviceName: "Google",
        category: "calendar",
        description: "Sync events",
        iconName: "calendar",
        status: "connected",
        isEnabled: true,
        lastSyncAt: null,
        connectedAt: null,
        config: {
          syncFrequency: "daily",
          syncEnabled: true,
          notificationsEnabled: true,
          twoWaySync: true,
          syncedDataTypes: ["events"],
        },
        stats: {
          totalSyncs: 0,
          dataItemsSynced: 0,
          lastSyncDurationMs: 0,
          errorCount: 0,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {},
      },
    ]);
    mockGetStatistics.mockResolvedValue({
      totalIntegrations: 1,
      connectedCount: 1,
      disconnectedCount: 0,
      errorCount: 0,
      syncingCount: 0,
      enabledCount: 1,
      totalSyncs: 0,
      totalDataItemsSynced: 0,
      averageSyncDuration: 0,
      totalErrors: 0,
    });

    const { getByTestId, findByTestId } = render(<IntegrationsScreen />);

    // Wait for the integration card to appear (data has loaded)
    await findByTestId("integration-card-google-calendar");

    fireEvent.press(getByTestId("integration-card-google-calendar"));

    expect(mockNavigate).toHaveBeenCalledWith("IntegrationDetail", {
      integrationId: "google-calendar",
    });
  });

  it("shows an empty state when there are no integrations", async () => {
    mockGetAllSorted.mockResolvedValue([]);
    mockGetStatistics.mockResolvedValue({
      totalIntegrations: 0,
      connectedCount: 0,
      disconnectedCount: 0,
      errorCount: 0,
      syncingCount: 0,
      enabledCount: 0,
      totalSyncs: 0,
      totalDataItemsSynced: 0,
      averageSyncDuration: 0,
      totalErrors: 0,
    });

    const { findByText } = render(<IntegrationsScreen />);

    expect(await findByText("No integrations yet")).toBeTruthy();
  });

  it("shows a retry state when integrations fail to load", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    mockGetAllSorted.mockRejectedValue(new Error("Network unavailable"));

    const { findByTestId } = render(<IntegrationsScreen />);

    expect(await findByTestId("integrations-error")).toBeTruthy();

    await waitFor(() => {
      expect(mockGetAllSorted).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });
});
