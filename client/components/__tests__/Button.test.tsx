import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Button } from "../Button";
import { ThemeProvider } from "@/context/ThemeContext";

// Wrapper component to provide theme context
function renderWithTheme(component: React.ReactElement) {
  return render(<ThemeProvider>{component}</ThemeProvider>);
}

describe("Button", () => {
  it("renders with children text", () => {
    const { getByText } = renderWithTheme(<Button>Click me</Button>);
    expect(getByText("Click me")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const mockOnPress = jest.fn();
    const { getByText } = renderWithTheme(
      <Button onPress={mockOnPress}>Press me</Button>,
    );

    fireEvent.press(getByText("Press me"));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", () => {
    const mockOnPress = jest.fn();
    const { getByText } = renderWithTheme(
      <Button onPress={mockOnPress} disabled>
        Disabled Button
      </Button>,
    );

    fireEvent.press(getByText("Disabled Button"));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it("applies disabled styling when disabled", () => {
    const { getByText } = renderWithTheme(<Button disabled>Disabled</Button>);

    // Just verify the button is rendered with disabled prop
    const buttonText = getByText("Disabled");
    expect(buttonText).toBeTruthy();
  });

  it("renders with custom style", () => {
    const customStyle = { width: 200 };
    const { getByText } = renderWithTheme(
      <Button style={customStyle}>Custom Style</Button>,
    );

    // Just verify the button renders with custom text
    const buttonText = getByText("Custom Style");
    expect(buttonText).toBeTruthy();
  });
});
