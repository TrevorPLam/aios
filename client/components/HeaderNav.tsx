import React from "react";
import { View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@/hooks/useTheme";
import { AppStackParamList } from "@/navigation/AppNavigator";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

export function HeaderLeftNav() {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  return (
    <Pressable
      onPress={() => navigation.navigate("ModuleGrid")}
      style={({ pressed }) => [{ padding: 8, opacity: pressed ? 0.7 : 1 }]}
    >
      <Feather name="grid" size={24} color={theme.text} />
    </Pressable>
  );
}

export function HeaderRightNav() {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  return (
    <Pressable
      onPress={() => navigation.navigate("Settings")}
      style={({ pressed }) => [{ padding: 8, opacity: pressed ? 0.7 : 1 }]}
    >
      <Feather name="settings" size={24} color={theme.text} />
    </Pressable>
  );
}

interface HeaderRightWithActionProps {
  actionIcon: keyof typeof Feather.glyphMap;
  onActionPress: () => void;
}

export function HeaderRightWithAction({
  actionIcon,
  onActionPress,
}: HeaderRightWithActionProps) {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Pressable
        onPress={onActionPress}
        style={({ pressed }) => [{ padding: 8, opacity: pressed ? 0.7 : 1 }]}
      >
        <Feather name={actionIcon} size={24} color={theme.accent} />
      </Pressable>
      <Pressable
        onPress={() => navigation.navigate("Settings")}
        style={({ pressed }) => [{ padding: 8, opacity: pressed ? 0.7 : 1 }]}
      >
        <Feather name="settings" size={24} color={theme.text} />
      </Pressable>
    </View>
  );
}
