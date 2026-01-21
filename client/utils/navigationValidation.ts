type RouteValidationResult =
  | { isValid: true }
  | { isValid: false; error: string };

type RouteValidationInput = {
  routeName?: string;
  routeNames?: string[];
  moduleName?: string;
};

/**
 * Build a consistent, user-facing navigation error message.
 * Keeps copy centralized so updates stay in sync across screens.
 */
export const getNavigationErrorMessage = (moduleName?: string): string => {
  if (moduleName) {
    return `The ${moduleName} module is not available. Please ensure all modules are properly configured.`;
  }

  return "Unable to navigate to the selected module. Please try again.";
};

/**
 * Validate that a target route exists before we attempt navigation.
 * Returns an error string so callers can decide how to log/alert.
 */
export const validateRouteRegistration = ({
  routeName,
  routeNames,
  moduleName,
}: RouteValidationInput): RouteValidationResult => {
  // Guard against bad input so UI can fail fast with a clear message.
  if (!routeName) {
    return { isValid: false, error: "Missing route name for navigation." };
  }

  // If the navigator isn't ready yet, avoid a silent no-op and explain why.
  if (!routeNames || routeNames.length === 0) {
    return {
      isValid: false,
      error: "Navigation routes are not available yet.",
    };
  }

  if (!routeNames.includes(routeName)) {
    const modulePrefix = moduleName ? `${moduleName} ` : "";
    return {
      isValid: false,
      error: `Cannot navigate to ${modulePrefix}module. Route "${routeName}" is not registered.`,
    };
  }

  return { isValid: true };
};
