/**
 * LazyScreenWrapper Component
 *
 * Purpose (Plain English):
 * Wraps lazy-loaded screens in a Suspense boundary so users see a
 * consistent loading message instead of a blank screen.
 */

import React, { Suspense } from "react";
import { LazyScreenFallback } from "@/components/LazyScreenFallback";

interface LazyScreenWrapperProps {
  screenName: string;
  children: React.ReactNode;
}

export function LazyScreenWrapper({
  screenName,
  children,
}: LazyScreenWrapperProps) {
  // Suspense keeps navigation responsive while code splits load.
  return (
    <Suspense fallback={<LazyScreenFallback screenName={screenName} />}>
      {children}
    </Suspense>
  );
}
