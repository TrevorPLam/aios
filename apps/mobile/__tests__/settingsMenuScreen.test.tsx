import React from "react";
import { Alert } from "react-native";
import { fireEvent, render } from "@testing-library/react-native";

import SettingsMenuScreen from "@features/settings/ui/SettingsMenuScreen";

const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock("@design-system/hooks/useTheme", () => ({
  useTheme: () => ({
    theme: {
      backgroundDefault: "#1A1F2E",
      border: "#333333",
      text: "#FFFFFF",
      textMuted: "#999999",
    },
  }),
}));

describe("SettingsMenuScreen", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("navigates to ModuleGrid from the settings menu", () => {
    const { getByTestId } = render(<SettingsMenuScreen />);

    fireEvent.press(getByTestId("settings-menu-modules"));

    expect(mockNavigate).toHaveBeenCalledWith("ModuleGrid");
  });

  it("navigates to History from the settings menu", () => {
    const { getByTestId } = render(<SettingsMenuScreen />);

    fireEvent.press(getByTestId("settings-menu-history"));

    expect(mockNavigate).toHaveBeenCalledWith("History");
  });

  it("shows an alert when a module settings screen is unavailable", () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation();

    const { getByTestId } = render(<SettingsMenuScreen />);

    fireEvent.press(getByTestId("module-settings-lists"));

    expect(alertSpy).toHaveBeenCalledWith(
      "Lists Settings",
      "Settings for this module are coming soon.",
    );

    alertSpy.mockRestore();
  });
});
