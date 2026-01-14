import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, Switch, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useHeaderHeight } from '@react-navigation/elements';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { AppStackParamList } from '@/navigation/AppNavigator';
import { db } from '@/storage/database';
import { Settings, ModuleType, AILimitTier, TIER_LIMITS } from '@/models/types';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const MODULES: { id: ModuleType; name: string; icon: keyof typeof Feather.glyphMap }[] = [
  { id: 'notebook', name: 'Notebook', icon: 'book-open' },
  { id: 'planner', name: 'Planner', icon: 'check-square' },
  { id: 'calendar', name: 'Calendar', icon: 'calendar' },
  { id: 'email', name: 'Email', icon: 'mail' },
];

const TIERS: { tier: AILimitTier; name: string; limit: number }[] = [
  { tier: 0, name: 'Minimal', limit: TIER_LIMITS[0] },
  { tier: 1, name: 'Standard', limit: TIER_LIMITS[1] },
  { tier: 2, name: 'Enhanced', limit: TIER_LIMITS[2] },
  { tier: 3, name: 'Maximum', limit: TIER_LIMITS[3] },
];

export default function SettingsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NavigationProp>();
  
  const [settings, setSettings] = useState<Settings | null>(null);
  const [aiName, setAiName] = useState('AIOS');

  const loadSettings = useCallback(async () => {
    const data = await db.settings.get();
    if (data) {
      setSettings(data);
      setAiName(data.aiName || 'AIOS');
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateAIName = useCallback(async (name: string) => {
    setAiName(name);
    if (settings) {
      await db.settings.update({ aiName: name });
    }
  }, [settings]);

  const toggleModule = useCallback(async (moduleId: ModuleType) => {
    if (!settings) return;
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const enabledModules = settings.enabledModules.includes(moduleId)
      ? settings.enabledModules.filter((m) => m !== moduleId)
      : [...settings.enabledModules, moduleId];
    
    const updated = await db.settings.update({ enabledModules });
    setSettings(updated);
  }, [settings]);

  const setTier = useCallback(async (tier: AILimitTier) => {
    if (!settings) return;
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const updated = await db.settings.update({ aiLimitTier: tier });
    setSettings(updated);
    await db.aiLimits.reset();
  }, [settings]);

  if (!settings) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: headerHeight + Spacing.md,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="caption" secondary style={styles.sectionTitle}>
          AI SETTINGS
        </ThemedText>
        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Feather name="cpu" size={20} color={theme.accent} />
              <ThemedText type="body">AI Name</ThemedText>
            </View>
            <TextInput
              value={aiName}
              onChangeText={updateAIName}
              style={[styles.nameInput, { color: theme.text, backgroundColor: theme.backgroundSecondary }]}
              placeholder="AIOS"
              placeholderTextColor={theme.textMuted}
            />
          </View>
        </View>

        <ThemedText type="caption" secondary style={styles.sectionTitle}>
          AI LIMIT TIER
        </ThemedText>
        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          {TIERS.map((t, index) => (
            <Pressable
              key={t.tier}
              onPress={() => setTier(t.tier)}
              style={[
                styles.tierRow,
                index < TIERS.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
              ]}
            >
              <View style={styles.tierInfo}>
                <ThemedText type="body">{t.name}</ThemedText>
                <ThemedText type="small" muted>{t.limit} cards per 6 hours</ThemedText>
              </View>
              <View style={[
                styles.radioOuter,
                { borderColor: settings.aiLimitTier === t.tier ? theme.accent : theme.textMuted },
              ]}>
                {settings.aiLimitTier === t.tier && (
                  <View style={[styles.radioInner, { backgroundColor: theme.accent }]} />
                )}
              </View>
            </Pressable>
          ))}
        </View>

        <ThemedText type="caption" secondary style={styles.sectionTitle}>
          ENABLED MODULES
        </ThemedText>
        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          {MODULES.map((module, index) => (
            <View
              key={module.id}
              style={[
                styles.settingRow,
                index < MODULES.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
              ]}
            >
              <View style={styles.settingInfo}>
                <Feather name={module.icon} size={20} color={theme.textSecondary} />
                <ThemedText type="body">{module.name}</ThemedText>
              </View>
              <Switch
                value={settings.enabledModules.includes(module.id)}
                onValueChange={() => toggleModule(module.id)}
                trackColor={{ false: theme.backgroundSecondary, true: theme.accentDim }}
                thumbColor={settings.enabledModules.includes(module.id) ? theme.accent : theme.textSecondary}
              />
            </View>
          ))}
        </View>

        <ThemedText type="caption" secondary style={styles.sectionTitle}>
          DATA
        </ThemedText>
        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <Pressable
            onPress={() => navigation.navigate('History')}
            style={styles.linkRow}
          >
            <View style={styles.settingInfo}>
              <Feather name="clock" size={20} color={theme.textSecondary} />
              <ThemedText type="body">History Log</ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textMuted} />
          </Pressable>
        </View>

        <View style={styles.aboutSection}>
          <ThemedText type="h3" style={{ color: theme.accent, textAlign: 'center' }}>
            {settings.aiName}
          </ThemedText>
          <ThemedText type="caption" muted style={{ textAlign: 'center', marginTop: Spacing.xs }}>
            AI Command Center v1.0.0
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  section: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  nameInput: {
    fontSize: 16,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    minWidth: 120,
    textAlign: 'right',
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  tierInfo: {
    gap: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  aboutSection: {
    marginTop: Spacing['3xl'],
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
});
