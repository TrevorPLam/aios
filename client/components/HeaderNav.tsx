import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@/hooks/useTheme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { Spacing, BorderRadius } from "@/constants/theme";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

export function HeaderLeftNav() {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.headerLeft}>
      <Pressable
        onPress={() => navigation.navigate("ModuleGrid")}
        style={({ pressed }) => [
          styles.iconButton,
          { opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Feather name="grid" size={24} color={theme.text} />
      </Pressable>
      <Pressable
        onPress={() => navigation.navigate("CommandCenter")}
        style={({ pressed }) => [
          styles.iconButton,
          { opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Feather name="home" size={24} color={theme.text} />
      </Pressable>
    </View>
  );
}

export interface HeaderRightNavProps {
  /**
   * Optional route to navigate to instead of main Settings
   * @example "NotebookSettings" for Notebook module settings
   */
  settingsRoute?: keyof AppStackParamList;
}

export function HeaderRightNav({ settingsRoute }: HeaderRightNavProps = {}) {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const handlePress = () => {
    if (settingsRoute) {
      // Type-safe navigation - settingsRoute is keyof AppStackParamList
      navigation.navigate(settingsRoute, undefined);
    } else {
      navigation.navigate("Settings");
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.iconButton,
        { opacity: pressed ? 0.7 : 1 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={
        settingsRoute ? "Open module settings" : "Open settings"
      }
    >
      <Feather name="settings" size={24} color={theme.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  iconButton: {
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
