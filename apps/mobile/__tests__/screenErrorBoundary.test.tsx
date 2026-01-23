import React from "react";
import { Text } from "react-native";
import { fireEvent, render } from "@testing-library/react-native";

import { ScreenErrorBoundary } from "@features/core/ui/components/ScreenErrorBoundary";

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockCanGoBack = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    canGoBack: mockCanGoBack,
  }),
}));

jest.mock("@design-system/hooks/useTheme", () => ({
  useTheme: () => ({
    theme: {
      backgroundRoot: "#0A0E1A",
      error: "#FF3B5C",
      textMuted: "#4A5568",
      accent: "#00D9FF",
      border: "#1A1F2E",
      backgroundDefault: "#10131F",
      text: "#FFFFFF",
    },
  }),
}));

jest.mock("@platform/analytics", () => ({
  __esModule: true,
  default: {
    trackError: jest.fn(),
  },
}));

function ThrowingChild() {
  throw new Error("Boom");
}

describe("ScreenErrorBoundary", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockGoBack.mockClear();
    mockCanGoBack.mockClear();
  });

  it("renders children when no error occurs", () => {
    mockCanGoBack.mockReturnValue(false);

    const { getByText } = render(
      <ScreenErrorBoundary screenName="Test">
        <Text>Safe content</Text>
      </ScreenErrorBoundary>,
    );

    expect(getByText("Safe content")).toBeTruthy();
  });

  it("shows fallback actions and navigates on error", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    mockCanGoBack.mockReturnValue(true);

    const { getByText } = render(
      <ScreenErrorBoundary screenName="Planner">
        <ThrowingChild />
      </ScreenErrorBoundary>,
    );

    fireEvent.press(getByText("Try Again"));
    fireEvent.press(getByText("Go Back"));
    fireEvent.press(getByText("Go Home"));

    expect(getByText("Something went wrong")).toBeTruthy();
    expect(mockGoBack).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("CommandCenter");

    consoleSpy.mockRestore();
  });

  it("falls back to a generic label when screen name is empty", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    mockCanGoBack.mockReturnValue(false);

    const { getByText, queryByText } = render(
      <ScreenErrorBoundary screenName="  ">
        <ThrowingChild />
      </ScreenErrorBoundary>,
    );

    expect(getByText("The this screen encountered an error.")).toBeTruthy();
    expect(queryByText("Go Back")).toBeNull();

    consoleSpy.mockRestore();
  });
});
