/**
 * Lazy Fallback Copy Helper
 *
 * Purpose (Plain English):
 * Generates consistent loading copy for lazily-loaded screens while
 * guarding against bad inputs. This keeps fallback UI predictable and
 * avoids rendering empty/undefined strings.
 */

export interface LazyFallbackCopy {
  title: string;
  description: string;
}

interface LazyFallbackSuccess {
  copy: LazyFallbackCopy;
}

interface LazyFallbackError {
  copy: LazyFallbackCopy;
  error: string;
}

const DEFAULT_COPY: LazyFallbackCopy = {
  title: "Loading module",
  description: "Hang tight while we open the screen.",
};

/**
 * Build human-friendly fallback copy for lazy-loaded screens.
 *
 * @remarks
 * We return a structured result instead of throwing to keep UI rendering
 * stable during suspense. Errors are surfaced so callers can log them.
 */
export function getLazyFallbackCopy(
  screenName: unknown,
): LazyFallbackSuccess | LazyFallbackError {
  if (typeof screenName !== "string") {
    return {
      copy: DEFAULT_COPY,
      error: "Screen name must be a string.",
    };
  }

  const trimmedName = screenName.trim();

  if (!trimmedName) {
    return { copy: DEFAULT_COPY };
  }

  return {
    copy: {
      title: `Loading ${trimmedName}`,
      description: `Hang tight while we open ${trimmedName}.`,
    },
  };
}
