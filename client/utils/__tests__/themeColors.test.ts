import { Colors } from "../../constants/theme";
import { getOverlayColor } from "../themeColors";

describe("getOverlayColor", () => {
  it("should return the expected overlay color for a valid variant", () => {
    const color = getOverlayColor(Colors.dark, "backdropStrong");

    expect(color).toBe(Colors.dark.overlayStrong);
  });

  it("should support light theme overlay tokens", () => {
    const color = getOverlayColor(Colors.light, "sheetHandle");

    expect(color).toBe(Colors.light.overlayHandle);
  });

  it("should throw when the variant is unknown", () => {
    expect(() => {
      getOverlayColor(
        Colors.dark,
        "unknown" as unknown as Parameters<typeof getOverlayColor>[1],
      );
    }).toThrow("Unknown overlay variant: unknown");
  });

  it("should throw when the theme is missing the token", () => {
    const theme = { ...Colors.dark, overlayStrong: "" };

    expect(() => {
      getOverlayColor(theme, "backdropStrong");
    }).toThrow("Missing overlay color token: overlayStrong");
  });
});
