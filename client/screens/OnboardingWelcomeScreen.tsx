/**
 * Onboarding Welcome Screen
 *
 * Purpose (Plain English):
 * First screen new users see. Explains the AIOS concept and prepares them
 * for module selection. Sets expectations that they'll start with 3 modules
 * and unlock more as they use the app.
 *
 * Features:
 * - Welcome message with AIOS value proposition
 * - Benefits overview
 * - Skip onboarding option
 * - Continue to module selection
 * - Animated transitions
 *
 * @module OnboardingWelcomeScreen
 */

import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { onboardingManager } from "@/lib/onboardingManager";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

/**
 * Benefit Card Component
 */
function BenefitCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: string;
  title: string;
  description: string;
  delay: number;
}) {
  const { theme } = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(500)}
      style={[
        styles.benefitCard,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
        },
      ]}
    >
      <View
        style={[styles.benefitIcon, { backgroundColor: `${theme.primary}15` }]}
      >
        <Feather name={icon as any} size={24} color={theme.primary} />
      </View>
      <View style={styles.benefitContent}>
        <ThemedText style={styles.benefitTitle}>{title}</ThemedText>
        <ThemedText style={styles.benefitDescription}>{description}</ThemedText>
      </View>
    </Animated.View>
  );
}

/**
 * Onboarding Welcome Screen Component
 */
export default function OnboardingWelcomeScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const handleContinue = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    navigation.navigate("OnboardingModuleSelection");
  };

  const handleSkip = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await onboardingManager.skipOnboarding();
    navigation.navigate("CommandCenter");
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        {/* Logo/Icon */}
        <Animated.View
          entering={FadeIn.duration(800)}
          style={styles.logoContainer}
        >
          <View
            style={[styles.logo, { backgroundColor: `${theme.primary}20` }]}
          >
            <Feather name="zap" size={64} color={theme.primary} />
          </View>
        </Animated.View>

        {/* Welcome Text */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.welcomeSection}
        >
          <ThemedText style={styles.title}>Welcome to AIOS</ThemedText>
          <ThemedText style={styles.subtitle}>
            Your Artificial Intelligence Operating System
          </ThemedText>
          <ThemedText style={styles.description}>
            AIOS brings together everything you need in one intelligent app.
            We'll help you get started without overwhelming you.
          </ThemedText>
        </Animated.View>

        {/* Benefits */}
        <View style={styles.benefitsSection}>
          <BenefitCard
            icon="layers"
            title="Start Simple"
            description="Begin with just 3 modules. No overwhelm, just what you need."
            delay={400}
          />
          <BenefitCard
            icon="trending-up"
            title="Grow Naturally"
            description="Unlock more features as you use the app. Discover at your own pace."
            delay={500}
          />
          <BenefitCard
            icon="zap"
            title="Smart Notifications"
            description="AI prioritizes what matters. Stay focused on what's important."
            delay={600}
          />
          <BenefitCard
            icon="shield"
            title="Full Control"
            description="You're always in charge. Skip, customize, or unlock everything."
            delay={700}
          />
        </View>

        {/* Bottom Info */}
        <Animated.View
          entering={FadeInDown.delay(800).duration(500)}
          style={styles.infoBox}
        >
          <Feather name="info" size={20} color={theme.info} />
          <ThemedText style={styles.infoText}>
            This onboarding takes less than 30 seconds. You can skip it anytime.
          </ThemedText>
        </Animated.View>
      </ScrollView>

      {/* Bottom Buttons */}
      <Animated.View
        entering={FadeInDown.delay(900).duration(500)}
        style={[
          styles.bottomButtons,
          {
            paddingBottom: insets.bottom + Spacing.lg,
            backgroundColor: theme.background,
            borderTopColor: theme.border,
          },
        ]}
      >
        <Pressable onPress={handleSkip} style={styles.skipButton}>
          <ThemedText style={styles.skipButtonText}>
            Skip & Unlock All
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={handleContinue}
          style={[styles.continueButton, { backgroundColor: theme.primary }]}
        >
          <ThemedText style={styles.continueButtonText}>Get Started</ThemedText>
          <Feather name="arrow-right" size={20} color="#FFFFFF" />
        </Pressable>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius["2xl"],
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeSection: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  description: {
    fontSize: 16,
    opacity: 0.8,
    textAlign: "center",
    lineHeight: 24,
  },
  benefitsSection: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  benefitCard: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  benefitDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  bottomButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
  },
  skipButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.md,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: "600",
    opacity: 0.7,
  },
  continueButton: {
    flex: 2,
    flexDirection: "row",
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
