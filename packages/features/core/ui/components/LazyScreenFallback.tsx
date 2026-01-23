/**
 * LazyScreenFallback Component
 *
 * Purpose (Plain English):
 * Provide a consistent loading state for lazily-loaded screens.
 * Uses friendly copy and handles unexpected inputs gracefully.
 */

import React from "react";
import { ScreenStateMessage } from "@design-system/components/ScreenStateMessage";
import { getLazyFallbackCopy } from "@platform/lib/lazyFallback";

interface LazyScreenFallbackProps {
  screenName: string;
}

export function LazyScreenFallback({ screenName }: LazyScreenFallbackProps) {
  const result = getLazyFallbackCopy(screenName);

  if ("error" in result) {
    // Log once per render to aid debugging without breaking the UI.
    console.warn("[LazyScreenFallback]", result.error, { screenName });
  }

  return (
    <ScreenStateMessage
      title={result.copy.title}
      description={result.copy.description}
      isLoading
    />
  );
}

