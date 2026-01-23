import { Platform } from "react-native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { isLiquidGlassAvailable } from "expo-glass-effect";

import { useTheme } from "@design-system/hooks/useTheme";

interface UseScreenOptionsParams {
  transparent?: boolean;
}

// Default to non-transparent (black background) for consistency with the new design
export function useScreenOptions({
  transparent = false,
}: UseScreenOptionsParams = {}): NativeStackNavigationOptions {
  const { theme } = useTheme();

  return {
    headerTitleAlign: "center",
    headerTransparent: transparent,
    headerBlurEffect: "dark",
    headerTintColor: theme.text,
    headerStyle: {
      backgroundColor: theme.backgroundBlack,
    },
    headerTitleStyle: {
      color: theme.text,
    },
    gestureEnabled: true,
    gestureDirection: "horizontal",
    fullScreenGestureEnabled: isLiquidGlassAvailable() ? false : true,
    contentStyle: {
      backgroundColor: theme.backgroundRoot,
    },
  };
}
