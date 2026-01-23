/**
 * Screen-Level Error Boundary
 *
 * Wraps individual screens to isolate errors and prevent full app crashes.
 * When a screen throws an error, only that screen shows an error state.
 * Users can navigate to other screens which remain functional.
 */

import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ThemedText } from "./ThemedText";
import { useTheme } from "@design-system/hooks/useTheme";
import { errorReporting } from "@platform/lib/errorReporting";
import { AppStackParamList } from "@apps/mobile/navigation/AppNavigator";

interface Props {
  children: React.ReactNode;
  screenName: string;
}

interface State {
  error: Error | null;
}

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

/**
 * Screen Error Boundary Component
 * Catches errors at the screen level to prevent entire app crashes
 */
export class ScreenErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Track screen-specific error with context
    errorReporting.trackScreenError(this.props.screenName, error);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <ScreenErrorFallback
          screenName={this.props.screenName}
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }
    return this.props.children;
  }
}

function getScreenLabel(screenName: string) {
  const trimmedName = screenName.trim();
  return trimmedName.length > 0 ? trimmedName : "this";
}

function ScreenErrorActionButton({
  label,
  onPress,
  variant,
}: {
  label: string;
  onPress: () => void;
  variant: "primary" | "secondary";
}) {
  const { theme } = useTheme();
  const isPrimary = variant === "primary";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.buttonPrimary : styles.buttonSecondary,
        {
          backgroundColor: isPrimary ? theme.accent : theme.backgroundDefault,
          borderColor: isPrimary ? theme.accent : theme.border,
        },
        pressed && styles.buttonPressed,
      ]}
      accessibilityRole="button"
    >
      <ThemedText
        type="body"
        style={[styles.buttonText, { color: isPrimary ? "#FFFFFF" : theme.text }]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

/**
 * Error Fallback UI shown when a screen crashes
 */
function ScreenErrorFallback({
  screenName,
  error,
  onReset,
}: {
  screenName: string;
  error: Error;
  onReset: () => void;
}) {
  const { theme } = useTheme();
  const screenLabel = getScreenLabel(screenName);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <Feather
        name="alert-triangle"
        size={64}
        color={theme.error || "#FF3B5C"}
      />
      <ThemedText type="h1" style={styles.title}>
        Something went wrong
      </ThemedText>
      <ThemedText type="body" style={styles.message}>
        The {screenLabel} screen encountered an error.
      </ThemedText>
      <ScreenErrorActions onReset={onReset} />
      {__DEV__ && (
        <ThemedText
          type="caption"
          style={[styles.errorText, { color: theme.textMuted }]}
        >
          {error.message}
        </ThemedText>
      )}
    </View>
  );
}

function ScreenErrorActions({ onReset }: { onReset: () => void }) {
  const navigation = useNavigation<NavigationProp>();
  const canGoBack = navigation.canGoBack?.() ?? false;

  const handleGoBack = () => {
    if (canGoBack) {
      navigation.goBack();
    }
  };

  const handleGoHome = () => {
    navigation.navigate("CommandCenter");
  };

  return (
    <View style={styles.actions}>
      <ScreenErrorActionButton
        label="Try Again"
        onPress={onReset}
        variant="primary"
      />
      {canGoBack && (
        <ScreenErrorActionButton
          label="Go Back"
          onPress={handleGoBack}
          variant="secondary"
        />
      )}
      <ScreenErrorActionButton
        label="Go Home"
        onPress={handleGoHome}
        variant="secondary"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    marginTop: 24,
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    marginBottom: 32,
    textAlign: "center",
    opacity: 0.8,
  },
  actions: {
    width: "100%",
    gap: 12,
    alignItems: "center",
  },
  button: {
    width: "80%",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  buttonPrimary: {
    borderColor: "transparent",
  },
  buttonSecondary: {
    borderColor: "transparent",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontWeight: "600",
  },
  errorText: {
    marginTop: 24,
    fontSize: 12,
    textAlign: "center",
    opacity: 0.6,
  },
});
