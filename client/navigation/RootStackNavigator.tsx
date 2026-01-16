import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AppNavigator from "@/navigation/AppNavigator";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useAnalyticsNavigation } from "@/hooks/useAnalyticsNavigation";

export type RootStackParamList = {
  App: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  useAnalyticsNavigation(); // Track navigation events

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="App"
        component={AppNavigator}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
