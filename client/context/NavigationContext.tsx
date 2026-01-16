/**
 * NavigationContext
 *
 * Provides contextual navigation support for the app.
 * Tracks user focus and suggests contextually relevant modules.
 *
 * Example: When viewing an email with a date, calendar becomes
 * the contextual next module regardless of usual ordering.
 */

import React, { createContext, useContext, useState, ReactNode } from "react";
import { ModuleType } from "@/models/types";

interface NavigationContextType {
  contextualModule: ModuleType | null;
  setContextualModule: (module: ModuleType | null) => void;
  clearContextualModule: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined,
);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [contextualModule, setContextualModule] = useState<ModuleType | null>(
    null,
  );

  const clearContextualModule = () => {
    setContextualModule(null);
  };

  return (
    <NavigationContext.Provider
      value={{
        contextualModule,
        setContextualModule,
        clearContextualModule,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigationContext() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error(
      "useNavigationContext must be used within a NavigationProvider",
    );
  }
  return context;
}
