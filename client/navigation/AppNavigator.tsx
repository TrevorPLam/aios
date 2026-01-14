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
  generateSeedPhotos,
  generateSeedConversations,
  generateSeedMessages,
  generateSeedBudget,
  generateSeedContacts,
  generateSampleIntegrations,
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
import SettingsMenuScreen from "@/screens/SettingsMenuScreen";
import GeneralSettingsScreen from "@/screens/GeneralSettingsScreen";
import AIPreferencesScreen from "@/screens/AIPreferencesScreen";
import PersonalizationScreen from "@/screens/PersonalizationScreen";
import IntegrationsScreen from "@/screens/IntegrationsScreen";
import IntegrationDetailScreen from "@/screens/IntegrationDetailScreen";
import SystemScreen from "@/screens/SystemScreen";
import HistoryScreen from "@/screens/HistoryScreen";
import RecommendationDetailScreen from "@/screens/RecommendationDetailScreen";
import ListsScreen from "@/screens/ListsScreen";
import ListEditorScreen from "@/screens/ListEditorScreen";
import AlertsScreen from "@/screens/AlertsScreen";
import AlertDetailScreen from "@/screens/AlertDetailScreen";
import PhotosScreen from "@/screens/PhotosScreen";
import PhotoDetailScreen from "@/screens/PhotoDetailScreen";
import PhotoEditorScreen from "@/screens/PhotoEditorScreen";
import MessagesScreen from "@/screens/MessagesScreen";
import ConversationDetailScreen from "@/screens/ConversationDetailScreen";
import ContactsScreen from "@/screens/ContactsScreen";
import ContactDetailScreen from "@/screens/ContactDetailScreen";
import TranslatorScreen from "@/screens/TranslatorScreen";
import BudgetScreen from "@/screens/BudgetScreen";
import NotebookSettingsScreen from "@/screens/NotebookSettingsScreen";
import PlannerSettingsScreen from "@/screens/PlannerSettingsScreen";
import CalendarSettingsScreen from "@/screens/CalendarSettingsScreen";
import EmailSettingsScreen from "@/screens/EmailSettingsScreen";
import ContactsSettingsScreen from "@/screens/ContactsSettingsScreen";

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
  GeneralSettings: undefined;
  AIPreferences: undefined;
  Personalization: undefined;
  Integrations: undefined;
  IntegrationDetail: { integrationId: string };
  System: undefined;
  History: undefined;
  RecommendationDetail: { recommendationId: string };
  Lists: undefined;
  ListEditor: { listId?: string };
  Alerts: undefined;
  AlertDetail: { alertId?: string };
  Photos: undefined;
  PhotoDetail: { photoId: string };
  PhotoEditor: { photoId: string };
  Messages: undefined;
  ConversationDetail: { conversationId?: string };
  Contacts: undefined;
  ContactDetail: { contactId: string };
  Translator: undefined;
  Budget: undefined;
  NotebookSettings: undefined;
  PlannerSettings: undefined;
  CalendarSettings: undefined;
  EmailSettings: undefined;
  ContactsSettings: undefined;
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

        const photos = generateSeedPhotos();
        for (const photo of photos) {
          await db.photos.save(photo);
        }

        const conversations = generateSeedConversations();
        for (const conversation of conversations) {
          await db.conversations.save(conversation);
        }

        const messages = generateSeedMessages();
        for (const message of messages) {
          await db.messages.save(message);
        }

        const contacts = generateSeedContacts();
        await db.contacts.saveAll(contacts);

        const budget = generateSeedBudget();
        await db.budgets.save(budget);

        const integrations = generateSampleIntegrations();
        for (const integration of integrations) {
          await db.integrations.save(integration);
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
        component={SettingsMenuScreen}
        options={{ headerTitle: "Settings" }}
      />
      <Stack.Screen
        name="GeneralSettings"
        component={GeneralSettingsScreen}
        options={{ headerTitle: "General" }}
      />
      <Stack.Screen
        name="AIPreferences"
        component={AIPreferencesScreen}
        options={{ headerTitle: "AI Preferences" }}
      />
      <Stack.Screen
        name="Personalization"
        component={PersonalizationScreen}
        options={{ headerTitle: "Personalization" }}
      />
      <Stack.Screen
        name="Integrations"
        component={IntegrationsScreen}
        options={{ headerTitle: "Integrations" }}
      />
      <Stack.Screen
        name="IntegrationDetail"
        component={IntegrationDetailScreen}
        options={{ headerTitle: "Integration Details" }}
      />
      <Stack.Screen
        name="System"
        component={SystemScreen}
        options={{ headerTitle: "System" }}
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
        name="Photos"
        component={PhotosScreen}
        options={{ headerTitle: "Photos" }}
      />
      <Stack.Screen
        name="PhotoDetail"
        component={PhotoDetailScreen}
        options={{ headerTitle: "Photo" }}
      />
      <Stack.Screen
        name="PhotoEditor"
        component={PhotoEditorScreen}
        options={{ headerTitle: "Edit Photo" }}
      />
      <Stack.Screen
        name="Messages"
        component={MessagesScreen}
        options={{ headerTitle: "Messages" }}
      />
      <Stack.Screen
        name="ConversationDetail"
        component={ConversationDetailScreen}
        options={{ headerTitle: "Chat" }}
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
      <Stack.Screen
        name="Budget"
        component={BudgetScreen}
        options={{ headerTitle: "Budget" }}
      />
      <Stack.Screen
        name="NotebookSettings"
        component={NotebookSettingsScreen}
        options={{ headerTitle: "Notebook Settings" }}
      />
      <Stack.Screen
        name="PlannerSettings"
        component={PlannerSettingsScreen}
        options={{ headerTitle: "Planner Settings" }}
      />
      <Stack.Screen
        name="CalendarSettings"
        component={CalendarSettingsScreen}
        options={{ headerTitle: "Calendar Settings" }}
      />
      <Stack.Screen
        name="EmailSettings"
        component={EmailSettingsScreen}
        options={{ headerTitle: "Email Settings" }}
      />
      <Stack.Screen
        name="ContactsSettings"
        component={ContactsSettingsScreen}
        options={{ headerTitle: "Contacts Settings" }}
      />
    </Stack.Navigator>
  );
}
