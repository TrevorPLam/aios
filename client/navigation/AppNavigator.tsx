import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { db } from "@/storage/database";
import {
  generateSeedRecommendations,
  generateSeedNotes,
  generateSeedTasks,
  generateSeedProjects,
  generateSeedEvents,
  generateSeedLists,
  generateSeedAlerts,
} from "@/utils/seedData";

import CommandCenterScreen from "@/screens/CommandCenterScreen";
import ModuleGridScreen from "@/screens/ModuleGridScreen";
import NotebookScreen from "@/screens/NotebookScreen";
import NoteEditorScreen from "@/screens/NoteEditorScreen";
import PlannerScreen from "@/screens/PlannerScreen";
import TaskDetailScreen from "@/screens/TaskDetailScreen";
import ProjectDetailScreen from "@/screens/ProjectDetailScreen";
import CalendarScreen from "@/screens/CalendarScreen";
import EventDetailScreen from "@/screens/EventDetailScreen";
import EmailScreen from "@/screens/EmailScreen";
import ThreadDetailScreen from "@/screens/ThreadDetailScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import HistoryScreen from "@/screens/HistoryScreen";
import RecommendationDetailScreen from "@/screens/RecommendationDetailScreen";
import ListsScreen from "@/screens/ListsScreen";
import ListEditorScreen from "@/screens/ListEditorScreen";
import AlertsScreen from "@/screens/AlertsScreen";
import AlertDetailScreen from "@/screens/AlertDetailScreen";
import ContactsScreen from "@/screens/ContactsScreen";
import ContactDetailScreen from "@/screens/ContactDetailScreen";
import TranslatorScreen from "@/screens/TranslatorScreen";

export type AppStackParamList = {
  CommandCenter: undefined;
  ModuleGrid: undefined;
  Notebook: undefined;
  NoteEditor: { noteId?: string };
  Planner: undefined;
  TaskDetail: { taskId?: string; parentTaskId?: string };
  ProjectDetail: { projectId?: string };
  Calendar: undefined;
  EventDetail: { eventId?: string; date?: string };
  Email: undefined;
  ThreadDetail: { threadId: string };
  Settings: undefined;
  History: undefined;
  RecommendationDetail: { recommendationId: string };
  Lists: undefined;
  ListEditor: { listId?: string };
  Alerts: undefined;
  AlertDetail: { alertId?: string };
  Contacts: undefined;
  ContactDetail: { contactId: string };
  Translator: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppNavigator() {
  const screenOptions = useScreenOptions();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function initializeData() {
      const initialized = await db.isInitialized();
      if (!initialized) {
        const recommendations = generateSeedRecommendations(8);
        await db.recommendations.saveAll(recommendations);

        const notes = generateSeedNotes();
        for (const note of notes) {
          await db.notes.save(note);
        }

        const tasks = generateSeedTasks();
        for (const task of tasks) {
          await db.tasks.save(task);
        }

        const projects = generateSeedProjects();
        for (const project of projects) {
          await db.projects.save(project);
        }

        const events = generateSeedEvents();
        for (const event of events) {
          await db.events.save(event);
        }

        const lists = generateSeedLists();
        for (const list of lists) {
          await db.lists.save(list);
        }

        const alerts = generateSeedAlerts();
        for (const alert of alerts) {
          await db.alerts.save(alert);
        }

        await db.settings.get();
        await db.aiLimits.get();

        await db.history.add({
          message: "AIOS initialized with sample data",
          type: "system",
          metadata: {},
        });

        await db.setInitialized();
      }
      setIsReady(true);
    }

    initializeData();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={screenOptions}
      initialRouteName="CommandCenter"
    >
      <Stack.Screen
        name="CommandCenter"
        component={CommandCenterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ModuleGrid"
        component={ModuleGridScreen}
        options={{ headerTitle: "Modules", presentation: "modal" }}
      />
      <Stack.Screen
        name="Notebook"
        component={NotebookScreen}
        options={{ headerTitle: "Notebook" }}
      />
      <Stack.Screen
        name="NoteEditor"
        component={NoteEditorScreen}
        options={{ headerTitle: "Note" }}
      />
      <Stack.Screen
        name="Planner"
        component={PlannerScreen}
        options={{ headerTitle: "Planner" }}
      />
      <Stack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{ headerTitle: "Task" }}
      />
      <Stack.Screen
        name="ProjectDetail"
        component={ProjectDetailScreen}
        options={{ headerTitle: "Project" }}
      />
      <Stack.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ headerTitle: "Calendar" }}
      />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ headerTitle: "Event" }}
      />
      <Stack.Screen
        name="Email"
        component={EmailScreen}
        options={{ headerTitle: "Email" }}
      />
      <Stack.Screen
        name="ThreadDetail"
        component={ThreadDetailScreen}
        options={{ headerTitle: "Thread" }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerTitle: "Settings" }}
      />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{ headerTitle: "History" }}
      />
      <Stack.Screen
        name="RecommendationDetail"
        component={RecommendationDetailScreen}
        options={{ headerTitle: "Recommendation", presentation: "modal" }}
      />
      <Stack.Screen
        name="Lists"
        component={ListsScreen}
        options={{ headerTitle: "Lists" }}
      />
      <Stack.Screen
        name="ListEditor"
        component={ListEditorScreen}
        options={{ headerTitle: "List" }}
      />
      <Stack.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{ headerTitle: "Alerts" }}
      />
      <Stack.Screen
        name="AlertDetail"
        component={AlertDetailScreen}
        options={{ headerTitle: "Alert" }}
      />
      <Stack.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{ headerTitle: "Contacts" }}
      />
      <Stack.Screen
        name="ContactDetail"
        component={ContactDetailScreen}
        options={{ headerTitle: "Contact" }}
      />
      <Stack.Screen
        name="Translator"
        component={TranslatorScreen}
        options={{ headerTitle: "Translator" }}
      />
    </Stack.Navigator>
  );
}
