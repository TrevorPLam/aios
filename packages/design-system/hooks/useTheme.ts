import { Colors, ColorThemes } from "@design-system/constants/theme";
import { useColorScheme } from "@design-system/hooks/useColorScheme";
import { useThemeContext } from "@design-system/context/ThemeContext";

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { colorTheme } = useThemeContext();

  const baseTheme = Colors[colorScheme ?? "light"];
  const themeColors = ColorThemes[colorTheme];

  const theme = {
    ...baseTheme,
    accent: themeColors.accent,
    accentDim: themeColors.accentDim,
    accentGlow: themeColors.accentGlow,
    tabIconSelected: themeColors.accent,
    link: themeColors.accent,
  };

  return {
    theme,
    isDark,
  };
}
