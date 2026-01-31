import { Text, type TextProps } from "react-native";

import { Typography } from "../constants/theme";
import { useTheme } from "../hooks/useTheme";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | "hero"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "body"
    | "caption"
    | "small"
    | "link";
  secondary?: boolean;
  muted?: boolean;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "body",
  secondary = false,
  muted = false,
  ...rest
}: ThemedTextProps) {
  const { theme, isDark } = useTheme();

  const getColor = () => {
    if (isDark && darkColor) {
      return darkColor;
    }

    if (!isDark && lightColor) {
      return lightColor;
    }

    if (type === "link") {
      return theme.link;
    }

    if (muted) {
      return theme.textMuted;
    }

    if (secondary) {
      return theme.textSecondary;
    }

    return theme.text;
  };

  const getTypeStyle = () => {
    switch (type) {
      case "hero":
        return Typography.hero;
      case "h1":
        return Typography.h1;
      case "h2":
        return Typography.h2;
      case "h3":
        return Typography.h3;
      case "h4":
        return Typography.h4;
      case "h5":
        return Typography.h5;
      case "h6":
        return Typography.h6;
      case "body":
        return Typography.body;
      case "caption":
        return Typography.caption;
      case "small":
        return Typography.small;
      case "link":
        return Typography.link;
      default:
        return Typography.body;
    }
  };

  return (
    <Text style={[{ color: getColor() }, getTypeStyle(), style]} {...rest} />
  );
}
