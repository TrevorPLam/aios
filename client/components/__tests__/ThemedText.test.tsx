import React from "react";
import { render } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { ThemeProvider } from "@/context/ThemeContext";
import { Typography } from "@/constants/theme";
import { ThemedText, type ThemedTextProps } from "../ThemedText";

function renderWithTheme(component: React.ReactElement) {
  return render(<ThemeProvider>{component}</ThemeProvider>);
}

function getFlattenedStyle(element: ReturnType<typeof render>["getByText"]) {
  return StyleSheet.flatten(element.props.style);
}

describe("ThemedText", () => {
  it("applies heading typography variants", () => {
    const { getByText } = renderWithTheme(
      <>
        <ThemedText type="h4">Heading 4</ThemedText>
        <ThemedText type="h5">Heading 5</ThemedText>
        <ThemedText type="h6">Heading 6</ThemedText>
      </>,
    );

    const heading4Style = getFlattenedStyle(getByText("Heading 4"));
    const heading5Style = getFlattenedStyle(getByText("Heading 5"));
    const heading6Style = getFlattenedStyle(getByText("Heading 6"));

    expect(heading4Style.fontSize).toBe(Typography.h4.fontSize);
    expect(heading4Style.fontWeight).toBe(Typography.h4.fontWeight);
    expect(heading5Style.fontSize).toBe(Typography.h5.fontSize);
    expect(heading5Style.fontWeight).toBe(Typography.h5.fontWeight);
    expect(heading6Style.fontSize).toBe(Typography.h6.fontSize);
    expect(heading6Style.fontWeight).toBe(Typography.h6.fontWeight);
  });

  it("renders an empty string with default body styling", () => {
    const { getByTestId } = renderWithTheme(
      <ThemedText testID="empty-text">{""}</ThemedText>,
    );

    const style = StyleSheet.flatten(getByTestId("empty-text").props.style);

    expect(style.fontSize).toBe(Typography.body.fontSize);
    expect(style.fontWeight).toBe(Typography.body.fontWeight);
  });

  it("falls back to body styling when type is invalid", () => {
    const { getByText } = renderWithTheme(
      <ThemedText type={"unknown" as ThemedTextProps["type"]}>
        Fallback Text
      </ThemedText>,
    );

    const style = getFlattenedStyle(getByText("Fallback Text"));

    expect(style.fontSize).toBe(Typography.body.fontSize);
    expect(style.fontWeight).toBe(Typography.body.fontWeight);
  });

  it("renders large text content without errors", () => {
    const longText = "A".repeat(1000);
    const { getByTestId } = renderWithTheme(
      <ThemedText testID="large-text">{longText}</ThemedText>,
    );

    expect(getByTestId("large-text")).toBeTruthy();
  });
});
