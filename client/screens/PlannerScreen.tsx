import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Pressable, Image, Platform, SectionList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useHeaderHeight } from '@react-navigation/elements';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { AppStackParamList } from '@/navigation/AppNavigator';
import { db } from '@/storage/database';
import { Task, Project } from '@/models/types';
import { formatDate, getPriorityColor } from '@/utils/helpers';
import { BottomNav } from '@/components/BottomNav';
import AIAssistSheet from '@/components/AIAssistSheet';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

function TaskCard({ task, onPress, index }: { task: Task; onPress: () => void; index: number }) {
  const { theme } = useTheme();
  const priorityColor = getPriorityColor(task.priority, theme);
  const isCompleted = task.status === 'completed';

  return (
    <Animated.View entering={FadeInDown.delay(index * 30).springify()}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.taskCard,
          { backgroundColor: theme.backgroundDefault },
          pressed && { opacity: 0.8 },
        ]}
      >
        <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />
        <View style={styles.taskContent}>
          <ThemedText
            type="body"
            style={[styles.taskTitle, isCompleted && styles.completedTask]}
            numberOfLines={1}
          >
            {task.title}
          </ThemedText>
          <View style={styles.taskMeta}>
            {task.dueDate && (
              <View style={styles.metaItem}>
                <Feather name="calendar" size={12} color={theme.textMuted} />
                <ThemedText type="small" muted>
                  {formatDate(task.dueDate)}
                </ThemedText>
              </View>
            )}
            {task.recurrenceRule !== 'none' && (
              <View style={styles.metaItem}>
                <Feather name="repeat" size={12} color={theme.textMuted} />
                <ThemedText type="small" muted>
                  {task.recurrenceRule}
                </ThemedText>
              </View>
            )}
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: isCompleted ? theme.successDim : theme.backgroundSecondary }]}>
          <Feather
            name={isCompleted ? 'check' : 'circle'}
            size={16}
            color={isCompleted ? theme.success : theme.textMuted}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}

function ProjectSection({ project, onPress }: { project: Project; onPress: () => void }) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.projectCard,
        { backgroundColor: theme.accentDim },
        pressed && { opacity: 0.8 },
      ]}
    >
      <Feather name="folder" size={18} color={theme.accent} />
      <ThemedText type="body" style={{ color: theme.accent, fontWeight: '600', flex: 1 }}>
        {project.name}
      </ThemedText>
      <Feather name="chevron-right" size={18} color={theme.accent} />
    </Pressable>
  );
}

export default function PlannerScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NavigationProp>();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAISheet, setShowAISheet] = useState(false);
  const [viewMode, setViewMode] = useState<'tasks' | 'projects'>('tasks');

  const loadData = useCallback(async () => {
    const [tasksData, projectsData] = await Promise.all([
      db.tasks.getAll(),
      db.projects.getAll(),
    ]);
    setTasks(tasksData.sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }));
    setProjects(projectsData);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation, loadData]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            navigation.navigate(viewMode === 'tasks' ? 'TaskDetail' : 'ProjectDetail', {});
          }}
          style={({ pressed }) => [styles.headerButton, pressed && { opacity: 0.7 }]}
        >
          <Feather name="plus" size={24} color={theme.accent} />
        </Pressable>
      ),
    });
  }, [navigation, theme, viewMode]);

  const renderTask = ({ item, index }: { item: Task; index: number }) => (
    <TaskCard
      task={item}
      index={index}
      onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
    />
  );

  const renderProject = ({ item }: { item: Project }) => (
    <ProjectSection
      project={item}
      onPress={() => navigation.navigate('ProjectDetail', { projectId: item.id })}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.tabBar, { marginTop: headerHeight }]}>
        <Pressable
          onPress={() => setViewMode('tasks')}
          style={[
            styles.tab,
            viewMode === 'tasks' && { backgroundColor: theme.accentDim },
          ]}
        >
          <ThemedText
            type="body"
            style={{ color: viewMode === 'tasks' ? theme.accent : theme.textSecondary, fontWeight: '600' }}
          >
            Tasks
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => setViewMode('projects')}
          style={[
            styles.tab,
            viewMode === 'projects' && { backgroundColor: theme.accentDim },
          ]}
        >
          <ThemedText
            type="body"
            style={{ color: viewMode === 'projects' ? theme.accent : theme.textSecondary, fontWeight: '600' }}
          >
            Projects
          </ThemedText>
        </Pressable>
      </View>

      {viewMode === 'tasks' ? (
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + Spacing['5xl'] },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Image
                source={require('../../assets/images/empty-planner.png')}
                style={styles.emptyImage}
                resizeMode="contain"
              />
              <ThemedText type="h3" style={styles.emptyTitle}>No Tasks Yet</ThemedText>
              <ThemedText type="body" secondary style={styles.emptyText}>
                Tap + to create your first task
              </ThemedText>
            </View>
          }
        />
      ) : (
        <FlatList
          data={projects}
          renderItem={renderProject}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + Spacing['5xl'] },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Image
                source={require('../../assets/images/empty-planner.png')}
                style={styles.emptyImage}
                resizeMode="contain"
              />
              <ThemedText type="h3" style={styles.emptyTitle}>No Projects Yet</ThemedText>
              <ThemedText type="body" secondary style={styles.emptyText}>
                Tap + to create a project
              </ThemedText>
            </View>
          }
        />
      )}

      <Pressable
        onPress={() => setShowAISheet(true)}
        style={[styles.fab, { backgroundColor: theme.accent, bottom: insets.bottom + Spacing.xl }]}
      >
        <Feather name="cpu" size={24} color={theme.backgroundRoot} />
      </Pressable>

      <View style={[styles.bottomNavContainer, { bottom: insets.bottom + Spacing.lg }]}>
        <BottomNav onAiPress={() => setShowAISheet(true)} />
      </View>

      <AIAssistSheet
        visible={showAISheet}
        onClose={() => setShowAISheet(false)}
        module="planner"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    padding: Spacing.xs,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
    ...Shadows.card,
  },
  priorityIndicator: {
    width: 4,
    height: 32,
    borderRadius: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    marginBottom: Spacing.xs,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  taskMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing['5xl'],
    paddingHorizontal: Spacing['2xl'],
  },
  emptyImage: {
    width: 180,
    height: 180,
    opacity: 0.8,
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    marginBottom: Spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
  },
  fab: {
    display: 'none',
  },
  bottomNavContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
