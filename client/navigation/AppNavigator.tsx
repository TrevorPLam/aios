import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { db } from "@/storage/database";
import { ScreenErrorBoundary } from "@/components/ScreenErrorBoundary";
import { LazyScreenWrapper } from "@/components/LazyScreenWrapper";
import { lazyLoader } from "@/lib/lazyLoader";
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
import RecommendationHistoryScreen from "@/screens/RecommendationHistoryScreen";
import ListsScreen from "@/screens/ListsScreen";
import ListEditorScreen from "@/screens/ListEditorScreen";
import AlertsScreen from "@/screens/AlertsScreen";
import AlertDetailScreen from "@/screens/AlertDetailScreen";
import AlbumsScreen from "@/screens/AlbumsScreen";
import PhotoDetailScreen from "@/screens/PhotoDetailScreen";
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
import AttentionCenterScreen from "@/screens/AttentionCenterScreen";
import OmnisearchModalScreen from "@/screens/OmnisearchModalScreen";

const LazyPhotosScreen = lazyLoader.getLazyComponent("photos");
// Photo editor isn't a module entry, so we lazy-load it directly to avoid
// expanding the module registry surface area unnecessarily.
const LazyPhotoEditorScreen = React.lazy(
  () => import("@/screens/PhotoEditorScreen"),
);

export type AppStackParamList = {
  CommandCenter: undefined;
  ModuleGrid: undefined;
  Omnisearch: undefined;
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
  RecommendationHistory: undefined;
  Lists: undefined;
  ListEditor: { listId?: string };
  Alerts: undefined;
  AlertDetail: { alertId?: string };
  Photos: undefined;
  Albums: undefined;
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
  AttentionCenter: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppNavigator() {
  const screenOptions = useScreenOptions();
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] =
    useState<keyof AppStackParamList>("CommandCenter");

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

        // All users start at CommandCenter
        setInitialRoute("CommandCenter");
      } else {
        // Returning user
        setInitialRoute("CommandCenter");
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
      initialRouteName={initialRoute}
    >
      <Stack.Screen
        name="CommandCenter"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="CommandCenter">
            <CommandCenterScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ModuleGrid"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="ModuleGrid">
            <ModuleGridScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Modules", presentation: "modal" }}
      />
      <Stack.Screen
        name="Omnisearch"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="Omnisearch">
            <OmnisearchModalScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Search", presentation: "modal" }}
      />
      <Stack.Screen
        name="Notebook"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="Notebook">
            <NotebookScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Notebook" }}
      />
      <Stack.Screen
        name="NoteEditor"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="NoteEditor">
            <NoteEditorScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Note" }}
      />
      <Stack.Screen
        name="Planner"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="Planner">
            <PlannerScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Planner" }}
      />
      <Stack.Screen
        name="TaskDetail"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="TaskDetail">
            <TaskDetailScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Task" }}
      />
      <Stack.Screen
        name="ProjectDetail"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="ProjectDetail">
            <ProjectDetailScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Project" }}
      />
      <Stack.Screen
        name="Calendar"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="Calendar">
            <CalendarScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Calendar" }}
      />
      <Stack.Screen
        name="EventDetail"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="EventDetail">
            <EventDetailScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Event" }}
      />
      <Stack.Screen
        name="Email"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="Email">
            <EmailScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Email" }}
      />
      <Stack.Screen
        name="ThreadDetail"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="ThreadDetail">
            <ThreadDetailScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Thread" }}
      />
      <Stack.Screen
        name="Settings"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="Settings">
            <SettingsMenuScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Settings" }}
      />
      <Stack.Screen
        name="GeneralSettings"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="GeneralSettings">
            <GeneralSettingsScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "General" }}
      />
      <Stack.Screen
        name="AIPreferences"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="AIPreferences">
            <AIPreferencesScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "AI Preferences" }}
      />
      <Stack.Screen
        name="Personalization"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="Personalization">
            <PersonalizationScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Personalization" }}
      />
      <Stack.Screen
        name="Integrations"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="Integrations">
            <IntegrationsScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Integrations" }}
      />
      <Stack.Screen
        name="IntegrationDetail"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="IntegrationDetail">
            <IntegrationDetailScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Integration Details" }}
      />
      <Stack.Screen
        name="System"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="System">
            <SystemScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "System" }}
      />
      <Stack.Screen
        name="History"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="History">
            <HistoryScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "History" }}
      />
      <Stack.Screen
        name="RecommendationDetail"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="RecommendationDetail">
            <RecommendationDetailScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Recommendation", presentation: "modal" }}
      />
      <Stack.Screen
        name="RecommendationHistory"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="RecommendationHistory">
            <RecommendationHistoryScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Recommendation History" }}
      />
      <Stack.Screen
        name="Lists"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="Lists">
            <ListsScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Lists" }}
      />
      <Stack.Screen
        name="ListEditor"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="ListEditor">
            <ListEditorScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "List" }}
      />
      <Stack.Screen
        name="Alerts"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="Alerts">
            <AlertsScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Alerts" }}
      />
      <Stack.Screen
        name="AlertDetail"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="AlertDetail">
            <AlertDetailScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Alert" }}
      />
      <Stack.Screen
        name="Photos"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="Photos">
            <LazyScreenWrapper screenName="Photos">
              <LazyPhotosScreen {...props} />
            </LazyScreenWrapper>
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Photos" }}
      />
      <Stack.Screen
        name="Albums"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="Albums">
            <AlbumsScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Albums" }}
      />
      <Stack.Screen
        name="PhotoDetail"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="PhotoDetail">
            <PhotoDetailScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Photo" }}
      />
      <Stack.Screen
        name="PhotoEditor"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="PhotoEditor">
            <LazyScreenWrapper screenName="PhotoEditor">
              <LazyPhotoEditorScreen {...props} />
            </LazyScreenWrapper>
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Edit Photo" }}
      />
      <Stack.Screen
        name="Messages"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="Messages">
            <MessagesScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Messages" }}
      />
      <Stack.Screen
        name="ConversationDetail"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="ConversationDetail">
            <ConversationDetailScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Chat" }}
      />
      <Stack.Screen
        name="Contacts"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="Contacts">
            <ContactsScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Contacts" }}
      />
      <Stack.Screen
        name="ContactDetail"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="ContactDetail">
            <ContactDetailScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Contact" }}
      />
      <Stack.Screen
        name="Translator"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="Translator">
            <TranslatorScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Translator" }}
      />
      <Stack.Screen
        name="Budget"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="Budget">
            <BudgetScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Budget" }}
      />
      <Stack.Screen
        name="NotebookSettings"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="NotebookSettings">
            <NotebookSettingsScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Notebook Settings" }}
      />
      <Stack.Screen
        name="PlannerSettings"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="PlannerSettings">
            <PlannerSettingsScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Planner Settings" }}
      />
      <Stack.Screen
        name="CalendarSettings"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="CalendarSettings">
            <CalendarSettingsScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Calendar Settings" }}
      />
      <Stack.Screen
        name="EmailSettings"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="EmailSettings">
            <EmailSettingsScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Email Settings" }}
      />
      <Stack.Screen
        name="ContactsSettings"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="ContactsSettings">
            <ContactsSettingsScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Contacts Settings" }}
      />
      <Stack.Screen
        name="AttentionCenter"
        // @ts-expect-error - Navigation prop types from React Navigation are complex and props forwarding is safe here
        component={(props) => (
          <ScreenErrorBoundary screenName="AttentionCenter">
            <AttentionCenterScreen {...props} />
          </ScreenErrorBoundary>
        )}
        options={{ headerTitle: "Attention Center", headerShown: false }}
      />
    </Stack.Navigator>
  );
}
