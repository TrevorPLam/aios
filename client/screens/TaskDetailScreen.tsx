import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Pressable, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/Button';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { AppStackParamList } from '@/navigation/AppNavigator';
import { db } from '@/storage/database';
import { Task, TaskPriority, TaskStatus, RecurrenceRule, Project } from '@/models/types';
import { generateId } from '@/utils/helpers';
import AIAssistSheet from '@/components/AIAssistSheet';

type RouteProps = RouteProp<AppStackParamList, 'TaskDetail'>;

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];
const STATUSES: TaskStatus[] = ['pending', 'in_progress', 'completed', 'cancelled'];
const RECURRENCE: RecurrenceRule[] = ['none', 'daily', 'weekly', 'monthly'];

export default function TaskDetailScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  
  const [title, setTitle] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [recurrence, setRecurrence] = useState<RecurrenceRule>('none');
  const [aiNotes, setAiNotes] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showAISheet, setShowAISheet] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [taskId, setTaskId] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      const projectsData = await db.projects.getAll();
      setProjects(projectsData);
      
      if (route.params?.taskId) {
        const task = await db.tasks.get(route.params.taskId);
        if (task) {
          setTitle(task.title);
          setUserNotes(task.userNotes);
          setPriority(task.priority);
          setStatus(task.status);
          setRecurrence(task.recurrenceRule);
          setAiNotes(task.aiNotes);
          setSelectedProjectId(task.projectId);
          setTaskId(task.id);
          setIsNew(false);
        }
      } else {
        setTaskId(generateId());
        setIsNew(true);
      }
    }
    loadData();
  }, [route.params?.taskId]);

  const saveTask = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    
    const task: Task = {
      id: taskId,
      title: title.trim(),
      userNotes,
      aiNotes,
      priority,
      dueDate: null,
      status,
      recurrenceRule: recurrence,
      projectId: selectedProjectId,
      dependencyIds: [],
      createdAt: isNew ? new Date().toISOString() : (await db.tasks.get(taskId))?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await db.tasks.save(task);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    navigation.goBack();
  }, [taskId, title, userNotes, aiNotes, priority, status, recurrence, selectedProjectId, isNew, navigation]);

  const handleDelete = useCallback(async () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await db.tasks.delete(taskId);
            navigation.goBack();
          },
        },
      ]
    );
  }, [taskId, navigation]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerActions}>
          {!isNew && (
            <Pressable
              onPress={handleDelete}
              style={({ pressed }) => [styles.headerButton, pressed && { opacity: 0.7 }]}
            >
              <Feather name="trash-2" size={20} color={theme.error} />
            </Pressable>
          )}
        </View>
      ),
    });
  }, [navigation, theme, isNew, handleDelete]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: headerHeight + Spacing.md,
            paddingBottom: insets.bottom + Spacing['5xl'],
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Task Title"
          placeholderTextColor={theme.textMuted}
          style={[styles.titleInput, { color: theme.text }]}
        />
        
        <ThemedText type="caption" secondary style={styles.label}>Priority</ThemedText>
        <View style={styles.optionRow}>
          {PRIORITIES.map((p) => (
            <Pressable
              key={p}
              onPress={() => setPriority(p)}
              style={[
                styles.optionButton,
                { backgroundColor: priority === p ? theme.accentDim : theme.backgroundDefault },
              ]}
            >
              <ThemedText
                type="small"
                style={{ color: priority === p ? theme.accent : theme.textSecondary, textTransform: 'capitalize' }}
              >
                {p}
              </ThemedText>
            </Pressable>
          ))}
        </View>
        
        <ThemedText type="caption" secondary style={styles.label}>Status</ThemedText>
        <View style={styles.optionRow}>
          {STATUSES.map((s) => (
            <Pressable
              key={s}
              onPress={() => setStatus(s)}
              style={[
                styles.optionButton,
                { backgroundColor: status === s ? theme.accentDim : theme.backgroundDefault },
              ]}
            >
              <ThemedText
                type="small"
                style={{ color: status === s ? theme.accent : theme.textSecondary, textTransform: 'capitalize' }}
              >
                {s.replace('_', ' ')}
              </ThemedText>
            </Pressable>
          ))}
        </View>
        
        <ThemedText type="caption" secondary style={styles.label}>Recurrence</ThemedText>
        <View style={styles.optionRow}>
          {RECURRENCE.map((r) => (
            <Pressable
              key={r}
              onPress={() => setRecurrence(r)}
              style={[
                styles.optionButton,
                { backgroundColor: recurrence === r ? theme.accentDim : theme.backgroundDefault },
              ]}
            >
              <ThemedText
                type="small"
                style={{ color: recurrence === r ? theme.accent : theme.textSecondary, textTransform: 'capitalize' }}
              >
                {r}
              </ThemedText>
            </Pressable>
          ))}
        </View>
        
        {projects.length > 0 && (
          <>
            <ThemedText type="caption" secondary style={styles.label}>Project</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectScroll}>
              <View style={styles.optionRow}>
                <Pressable
                  onPress={() => setSelectedProjectId(null)}
                  style={[
                    styles.optionButton,
                    { backgroundColor: selectedProjectId === null ? theme.accentDim : theme.backgroundDefault },
                  ]}
                >
                  <ThemedText
                    type="small"
                    style={{ color: selectedProjectId === null ? theme.accent : theme.textSecondary }}
                  >
                    None
                  </ThemedText>
                </Pressable>
                {projects.map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => setSelectedProjectId(p.id)}
                    style={[
                      styles.optionButton,
                      { backgroundColor: selectedProjectId === p.id ? theme.accentDim : theme.backgroundDefault },
                    ]}
                  >
                    <ThemedText
                      type="small"
                      style={{ color: selectedProjectId === p.id ? theme.accent : theme.textSecondary }}
                    >
                      {p.name}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </>
        )}
        
        <ThemedText type="caption" secondary style={styles.label}>Your Notes</ThemedText>
        <TextInput
          value={userNotes}
          onChangeText={setUserNotes}
          placeholder="Add your notes..."
          placeholderTextColor={theme.textMuted}
          style={[styles.notesInput, { color: theme.text, backgroundColor: theme.backgroundDefault }]}
          multiline
          textAlignVertical="top"
        />
        
        {aiNotes.length > 0 && (
          <>
            <View style={styles.aiNotesHeader}>
              <Feather name="cpu" size={16} color={theme.accent} />
              <ThemedText type="caption" style={{ color: theme.accent }}>AI Generated Notes</ThemedText>
            </View>
            <View style={[styles.aiNotesContainer, { backgroundColor: theme.backgroundSecondary }]}>
              {aiNotes.map((note, index) => (
                <View key={index} style={styles.aiNoteItem}>
                  <View style={[styles.aiNoteBullet, { backgroundColor: theme.accent }]} />
                  <ThemedText type="body" secondary>{note}</ThemedText>
                </View>
              ))}
            </View>
          </>
        )}
        
        <Pressable
          onPress={() => setShowAISheet(true)}
          style={[styles.aiButton, { backgroundColor: theme.accentDim }]}
        >
          <Feather name="cpu" size={20} color={theme.accent} />
          <ThemedText type="body" style={{ color: theme.accent }}>Get AI Suggestions</ThemedText>
        </Pressable>
        
        <Button onPress={saveTask} style={styles.saveButton}>
          {isNew ? 'Create Task' : 'Save Changes'}
        </Button>
      </ScrollView>

      <AIAssistSheet
        visible={showAISheet}
        onClose={() => setShowAISheet(false)}
        module="planner"
        onAction={(actionId) => {
          switch (actionId) {
            case 'priority':
              setPriority('high');
              setAiNotes([...aiNotes, 'Recommended high priority based on upcoming deadline']);
              break;
            case 'breakdown':
              setAiNotes([...aiNotes, 'Consider breaking this into: Research, Implementation, Testing']);
              break;
          }
        }}
      />
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
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  headerButton: {
    padding: Spacing.xs,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: Spacing.xl,
  },
  label: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  projectScroll: {
    marginBottom: Spacing.sm,
  },
  notesInput: {
    fontSize: 16,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    minHeight: 100,
  },
  aiNotesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  aiNotesContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  aiNoteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  aiNoteBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xl,
  },
  saveButton: {
    marginTop: Spacing.lg,
  },
});
