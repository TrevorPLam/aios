/**
 * Omnisearch Modal Screen
 *
 * Purpose (Plain English):
 * Wrapper screen for the OmnisearchScreen component that integrates with React Navigation.
 * Provides universal search across all modules with modal presentation.
 *
 * Features:
 * - Universal search across 11 modules
 * - Modal presentation for quick access
 * - Navigation to search results
 * - Recent searches tracking
 *
 * Technical Implementation:
 * - Wraps OmnisearchScreen component
 * - Handles navigation to search results
 * - Integrates with React Navigation stack
 * - Supports modal dismissal
 *
 * Safe AI Extension Points:
 * - Add search filters
 * - Add voice search
 * - Add search analytics
 * - Add keyboard shortcuts (future iPad enhancement)
 *
 * Fragile Logic Warnings:
 * - Must handle navigation for all module types
 * - Search must be fast (<500ms)
 * - Modal dismissal must work reliably
 *
 * @module OmnisearchModalScreen
 * @author AIOS Development Team
 * @version 1.0.0
 */

import React from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { OmnisearchScreen } from "@/components/OmnisearchScreen";
import { ModuleType } from "@/models/types";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

/**
 * Module route mapping for navigation
 * Maps module IDs to their corresponding navigation routes
 */
const MODULE_ROUTES: Record<string, keyof AppStackParamList> = {
  notebook: "Notebook",
  planner: "Planner",
  calendar: "Calendar",
  email: "Email",
  messages: "Messages",
  lists: "Lists",
  alerts: "Alerts",
  photos: "Photos",
  contacts: "Contacts",
  budget: "Budget",
  translator: "Translator",
};

/**
 * OmnisearchModalScreen Component
 *
 * Provides modal presentation of universal search functionality.
 * Handles navigation to search results across all modules.
 */
export default function OmnisearchModalScreen() {
  const navigation = useNavigation<NavigationProp>();

  /**
   * Handle navigation to a search result.
   * Closes the search modal and navigates to the appropriate detail screen.
   *
   * @param moduleId - The module containing the result (e.g., "notebook", "planner")
   * @param routeName - The base route name for the module
   * @param itemId - The ID of the specific item to view
   *
   * @example
   * handleResultPress("notebook", "Notebook", "note-123");
   * // Navigates to NoteEditor with noteId="note-123"
   */
  const handleResultPress = (
    moduleId: string,
    routeName: string,
    itemId: string,
  ) => {
    // Close the search modal first
    navigation.goBack();

    // Navigate to the appropriate detail screen based on module type
    switch (moduleId as ModuleType) {
      case "notebook":
        navigation.navigate("NoteEditor", { noteId: itemId });
        break;
      case "planner":
        navigation.navigate("TaskDetail", { taskId: itemId });
        break;
      case "calendar":
        navigation.navigate("EventDetail", { eventId: itemId });
        break;
      case "email":
        navigation.navigate("ThreadDetail", { threadId: itemId });
        break;
      case "messages":
        navigation.navigate("ConversationDetail", { conversationId: itemId });
        break;
      case "lists":
        navigation.navigate("ListEditor", { listId: itemId });
        break;
      case "alerts":
        navigation.navigate("AlertDetail", { alertId: itemId });
        break;
      case "photos":
        navigation.navigate("PhotoDetail", { photoId: itemId });
        break;
      case "contacts":
        navigation.navigate("ContactDetail", { contactId: itemId });
        break;
      case "budget":
      case "translator":
        // Navigate to module home screen (no detail view)
        const route = MODULE_ROUTES[moduleId];
        if (route) {
          // @ts-expect-error - Navigation type inference from route map is complex but safe
          navigation.navigate(route);
        }
        break;
      default:
        console.warn(`Unknown module type: ${moduleId}`);
        // Navigate to module home as fallback
        const fallbackRoute = MODULE_ROUTES[moduleId];
        if (fallbackRoute) {
          // @ts-expect-error - Navigation type inference from route map is complex but safe
          navigation.navigate(fallbackRoute);
        }
    }
  };

  /**
   * Handle modal close.
   * Dismisses the search modal and returns to previous screen.
   */
  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <OmnisearchScreen
      onResultPress={handleResultPress}
      onClose={handleClose}
    />
  );
}
