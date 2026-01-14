import { Colors, ColorThemes } from "@/constants/theme";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useState, useEffect } from "react";
import { db } from "@/storage/database";
import type { ColorTheme } from "@/models/types";

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [colorTheme, setColorTheme] = useState<ColorTheme>("cyan");
  
  useEffect(() => {
    async function loadTheme() {
      const settings = await db.settings.get();
      if (settings?.colorTheme) {
        setColorTheme(settings.colorTheme);
      }
    }
    loadTheme();
  }, []);
  
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
