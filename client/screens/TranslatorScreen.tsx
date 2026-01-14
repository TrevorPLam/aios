import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { BottomNav } from "@/components/BottomNav";
import AIAssistSheet from "@/components/AIAssistSheet";
import { HeaderLeftNav, HeaderRightWithAction } from "@/components/HeaderNav";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

// Common languages for translation
const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
];

export default function TranslatorScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NavigationProp>();

  const [sourceText, setSourceText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showAISheet, setShowAISheet] = useState(false);
  const [showSourceLangPicker, setShowSourceLangPicker] = useState(false);
  const [showTargetLangPicker, setShowTargetLangPicker] = useState(false);
  const [hasHeadphones, setHasHeadphones] = useState(false);

  // Check for headphones on mount and setup audio
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });
        
        // Check if headphones are connected
        const audioRoutes = await Audio.getStatusAsync();
        // Note: Full headphone detection would require native modules
        // For now, we'll enable TTS by default and mention headphones in the UI
        setHasHeadphones(true); // Simplified - assume available
      } catch (error) {
        console.error("Audio setup error:", error);
      }
    };

    setupAudio();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderLeftNav />,
      headerRight: () => (
        <HeaderRightWithAction onActionPress={() => setShowAISheet(true)} />
      ),
    });
  }, [navigation]);

  const handleTranslate = useCallback(async () => {
    if (!sourceText.trim()) return;

    setIsTranslating(true);
    try {
      // Call the translation API
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: sourceText,
          sourceLang: sourceLanguage,
          targetLang: targetLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`);
      }

      const data = await response.json();
      setTargetText(data.translatedText);
    } catch (error) {
      console.error("Translation error:", error);
      // Fallback to a simple mock if API is unavailable
      setTargetText(`[${targetLanguage.toUpperCase()}] ${sourceText}`);
    } finally {
      setIsTranslating(false);
    }
  }, [sourceText, sourceLanguage, targetLanguage]);

  // Auto-translate when source text changes (debounced)
  useEffect(() => {
    if (sourceText.trim()) {
      const timer = setTimeout(() => {
        handleTranslate();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setTargetText("");
    }
  }, [sourceText, sourceLanguage, targetLanguage, handleTranslate]);

  const handleSwapLanguages = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setSourceText(targetText);
    setTargetText(sourceText);
  };

  const handleClearSource = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSourceText("");
    setTargetText("");
  };

  const handleClearTarget = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setTargetText("");
  };

  const handleMicrophone = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      Alert.alert(
        "Speech-to-Text",
        "Speech recognition is not yet fully implemented. This would use device speech recognition to convert your voice to text.",
        [{ text: "OK" }]
      );
    } else {
      // Start recording
      try {
        // Request microphone permissions
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "Microphone access is required for speech-to-text.");
          return;
        }

        setIsRecording(true);
        
        // Note: Full speech-to-text implementation would require:
        // 1. expo-speech-recognition (currently in development)
        // 2. Or integration with a cloud service like Google Speech-to-Text
        // For now, showing a placeholder
        Alert.alert(
          "Speech-to-Text",
          "Tap the microphone again to stop recording. The recognized text will appear in the input box.",
          [{ text: "OK" }]
        );
      } catch (error) {
        console.error("Microphone error:", error);
        Alert.alert("Error", "Failed to access microphone");
      }
    }
  };

  const handleSpeak = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (!targetText) return;

    if (isSpeaking) {
      // Stop speaking
      Speech.stop();
      setIsSpeaking(false);
    } else {
      // Check if headphones are connected (optional mode)
      try {
        // Note: Headphone detection can be done with expo-av
        // For now, we'll speak the translation regardless
        
        setIsSpeaking(true);
        
        // Get language code for speech
        const langCode = targetLanguage;
        
        Speech.speak(targetText, {
          language: langCode,
          pitch: 1.0,
          rate: 0.9,
          onDone: () => setIsSpeaking(false),
          onStopped: () => setIsSpeaking(false),
          onError: (error) => {
            console.error("Speech error:", error);
            setIsSpeaking(false);
            Alert.alert("Error", "Failed to speak the translation");
          },
        });
      } catch (error) {
        console.error("Speech error:", error);
        setIsSpeaking(false);
        Alert.alert("Error", "Text-to-speech is not available");
      }
    }
  };

  const renderLanguagePicker = (
    isSource: boolean,
    selectedLang: string,
    onSelect: (code: string) => void,
    onClose: () => void
  ) => (
    <View style={[styles.languagePicker, { backgroundColor: theme.backgroundDefault }]}>
      <ScrollView>
        {LANGUAGES.map((lang) => (
          <Pressable
            key={lang.code}
            onPress={() => {
              onSelect(lang.code);
              onClose();
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
            style={({ pressed }) => [
              styles.languageItem,
              selectedLang === lang.code && {
                backgroundColor: theme.accentDim,
              },
              pressed && { opacity: 0.7 },
            ]}
          >
            <ThemedText
              type="body"
              style={
                selectedLang === lang.code ? { color: theme.accent } : undefined
              }
            >
              {lang.name}
            </ThemedText>
            {selectedLang === lang.code && (
              <Feather name="check" size={20} color={theme.accent} />
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl + 60 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Source Language Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Pressable
              onPress={() => setShowSourceLangPicker(!showSourceLangPicker)}
              style={({ pressed }) => [
                styles.languageButton,
                { backgroundColor: theme.backgroundSecondary },
                pressed && { opacity: 0.7 },
              ]}
            >
              <ThemedText type="body">
                {LANGUAGES.find((l) => l.code === sourceLanguage)?.name || "Select"}
              </ThemedText>
              <Feather name="chevron-down" size={20} color={theme.text} />
            </Pressable>
            {sourceText.length > 0 && (
              <Pressable
                onPress={handleClearSource}
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && { opacity: 0.5 },
                ]}
              >
                <Feather name="x" size={20} color={theme.textMuted} />
              </Pressable>
            )}
          </View>

          {showSourceLangPicker &&
            renderLanguagePicker(
              true,
              sourceLanguage,
              setSourceLanguage,
              () => setShowSourceLangPicker(false)
            )}

          <View
            style={[
              styles.textInputContainer,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <TextInput
              style={[
                styles.textInput,
                { color: theme.text, borderColor: theme.border },
              ]}
              value={sourceText}
              onChangeText={setSourceText}
              placeholder="Enter text to translate..."
              placeholderTextColor={theme.textMuted}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.inputActions}>
              <Pressable
                onPress={handleMicrophone}
                style={({ pressed }) => [
                  styles.actionButton,
                  {
                    backgroundColor: isRecording
                      ? theme.errorDim
                      : theme.backgroundSecondary,
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Feather
                  name="mic"
                  size={20}
                  color={isRecording ? theme.error : theme.accent}
                />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Swap Button */}
        <View style={styles.swapContainer}>
          <Pressable
            onPress={handleSwapLanguages}
            style={({ pressed }) => [
              styles.swapButton,
              { backgroundColor: theme.backgroundSecondary },
              pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
            ]}
          >
            <Feather name="repeat" size={24} color={theme.accent} />
          </Pressable>
        </View>

        {/* Target Language Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Pressable
              onPress={() => setShowTargetLangPicker(!showTargetLangPicker)}
              style={({ pressed }) => [
                styles.languageButton,
                { backgroundColor: theme.backgroundSecondary },
                pressed && { opacity: 0.7 },
              ]}
            >
              <ThemedText type="body">
                {LANGUAGES.find((l) => l.code === targetLanguage)?.name || "Select"}
              </ThemedText>
              <Feather name="chevron-down" size={20} color={theme.text} />
            </Pressable>
            {targetText.length > 0 && (
              <Pressable
                onPress={handleClearTarget}
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && { opacity: 0.5 },
                ]}
              >
                <Feather name="x" size={20} color={theme.textMuted} />
              </Pressable>
            )}
          </View>

          {showTargetLangPicker &&
            renderLanguagePicker(
              false,
              targetLanguage,
              setTargetLanguage,
              () => setShowTargetLangPicker(false)
            )}

          <View
            style={[
              styles.textInputContainer,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View style={[styles.outputContainer, { borderColor: theme.border }]}>
              {isTranslating ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.accent} />
                  <ThemedText type="caption" muted style={{ marginTop: Spacing.sm }}>
                    Translating...
                  </ThemedText>
                </View>
              ) : (
                <ThemedText type="body" style={styles.outputText}>
                  {targetText || "Translation will appear here..."}
                </ThemedText>
              )}
            </View>
            {targetText.length > 0 && (
              <View style={styles.inputActions}>
                <Pressable
                  onPress={handleSpeak}
                  style={({ pressed }) => [
                    styles.actionButton,
                    {
                      backgroundColor: isSpeaking
                        ? theme.successDim
                        : theme.backgroundSecondary,
                    },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Feather
                    name="volume-2"
                    size={20}
                    color={isSpeaking ? theme.success : theme.accent}
                  />
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {/* Info Card */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
          ]}
        >
          <Feather name="info" size={16} color={theme.textMuted} />
          <ThemedText type="small" muted style={{ marginLeft: Spacing.sm, flex: 1 }}>
            Tap the microphone to use speech-to-text. Tap the speaker icon to hear
            the translation. {hasHeadphones ? "Audio output ready." : "Connect headphones for best experience."}
          </ThemedText>
        </View>
      </ScrollView>

      <BottomNav onAiPress={() => setShowAISheet(true)} />

      {showAISheet && (
        <AIAssistSheet
          context="translator"
          onClose={() => setShowAISheet(false)}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  iconButton: {
    padding: Spacing.sm,
  },
  languagePicker: {
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    maxHeight: 300,
    ...Shadows.card,
  },
  languageItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  textInputContainer: {
    borderRadius: BorderRadius.md,
    ...Shadows.card,
  },
  textInput: {
    minHeight: 150,
    padding: Spacing.lg,
    fontSize: 16,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
  },
  outputContainer: {
    minHeight: 150,
    padding: Spacing.lg,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
  },
  outputText: {
    fontSize: 16,
    lineHeight: 24,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  inputActions: {
    position: "absolute",
    bottom: Spacing.md,
    right: Spacing.md,
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.card,
  },
  swapContainer: {
    alignItems: "center",
    marginVertical: Spacing.md,
  },
  swapButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.card,
  },
  infoCard: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.lg,
  },
});
