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
import { ThemedText } from "./ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { errorReporting } from "@/utils/errorReporting";

interface Props {
  children: React.ReactNode;
  screenName: string;
}

interface State {
  error: Error | null;
}

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
        The {screenName} screen encountered an error.
      </ThemedText>
      <Pressable
        onPress={onReset}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: theme.accent },
          pressed && styles.buttonPressed,
        ]}
      >
        <ThemedText type="body" style={styles.buttonText}>
          Try Again
        </ThemedText>
      </Pressable>
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
  button: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  errorText: {
    marginTop: 24,
    fontSize: 12,
    textAlign: "center",
    opacity: 0.6,
  },
});
