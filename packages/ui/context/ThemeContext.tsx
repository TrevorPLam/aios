import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { db } from "@aios/platform/storage/database";
import type { ColorTheme } from "@aios/contracts/models/types";

interface ThemeContextType {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>("cyan");

  useEffect(() => {
    async function loadTheme() {
      const settings = await db.settings.get();
      if (settings?.colorTheme) {
        setColorThemeState(settings.colorTheme);
      }
    }
    loadTheme();
  }, []);

  const setColorTheme = async (theme: ColorTheme) => {
    await db.settings.update({ colorTheme: theme });
    setColorThemeState(theme);
  };

  return (
    <ThemeContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
}
