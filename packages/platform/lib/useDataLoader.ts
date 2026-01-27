/**
 * useDataLoader Hook
 *
 * Purpose (Plain English):
 * Provides a consistent pattern for loading data with proper loading states,
 * error handling, and retry logic. Makes it easy to show loading indicators
 * while fetching data.
 *
 * What it provides:
 * - Loading state management
 * - Error state management
 * - Retry functionality
 * - Automatic cleanup on unmount
 *
 * Usage:
 * ```tsx
 * const { data, loading, error, retry } = useDataLoader(
 *   async () => await database.contacts.getAll()
 * );
 *
 * if (loading) return <ActivityIndicator />;
 * if (error) return <ErrorMessage error={error} onRetry={retry} />;
 * return <DataDisplay data={data} />;
 * ```
 *
 * @module useDataLoader
 */

import { useState, useEffect, useCallback, useRef } from "react";

export interface UseDataLoaderOptions {
  /**
   * Whether to load data immediately on mount
   * @default true
   */
  immediate?: boolean;
  
  /**
   * Dependencies array that triggers a reload when changed
   */
  deps?: React.DependencyList;
}

export interface UseDataLoaderResult<T> {
  /**
   * The loaded data (null if loading or error)
   */
  data: T | null;
  
  /**
   * Whether data is currently being loaded
   */
  loading: boolean;
  
  /**
   * Error that occurred during loading (null if no error)
   */
  error: Error | null;
  
  /**
   * Function to retry loading after an error
   */
  retry: () => Promise<void>;
  
  /**
   * Function to manually trigger a reload
   */
  reload: () => Promise<void>;
}

/**
 * Hook for loading data with loading state management
 *
 * @template T - Type of data being loaded
 * @param loader - Async function that loads the data
 * @param options - Configuration options
 * @returns Object with data, loading state, error state, and retry function
 *
 * @example
 * ```tsx
 * function ContactsList() {
 *   const { data, loading, error, retry } = useDataLoader(
 *     async () => await database.contacts.getAll()
 *   );
 *
 *   if (loading) {
 *     return <ScreenStateMessage title="Loading contacts..." isLoading />;
 *   }
 *
 *   if (error) {
 *     return (
 *       <ScreenStateMessage
 *         title="Failed to load contacts"
 *         description={error.message}
 *         actionLabel="Retry"
 *         onActionPress={retry}
 *         icon="alert-circle"
 *       />
 *     );
 *   }
 *
 *   return <FlatList data={data} ... />;
 * }
 * ```
 */
export function useDataLoader<T>(
  loader: () => Promise<T>,
  options: UseDataLoaderOptions = {}
): UseDataLoaderResult<T> {
  const { immediate = true, deps = [] } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<Error | null>(null);
  
  // Track if component is mounted to avoid state updates after unmount
  const isMountedRef = useRef<boolean>(true);
  
  /**
   * Load data and update state
   * 
   * Note: The loader function should ideally be memoized with useCallback
   * for optimal performance, as it will be re-created on every render if
   * passed as an inline arrow function.
   */
  const load = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await loader();
      
      if (isMountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [loader]);
  
  /**
   * Retry after error
   */
  const retry = useCallback(async () => {
    await load();
  }, [load]);
  
  /**
   * Manually reload data
   */
  const reload = useCallback(async () => {
    await load();
  }, [load]);
  
  /**
   * Load data on mount or when deps change
   * 
   * Note: The deps array is intentionally spread here to support dynamic dependencies.
   * This is safe because deps is provided by the caller and should be stable.
   * If loader changes frequently, consider memoizing it with useCallback.
   */
  useEffect(() => {
    if (immediate) {
      load();
    }
    
    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
    };
  }, [immediate, load, ...deps]); // Include load dependency for completeness
  
  return {
    data,
    loading,
    error,
    retry,
    reload,
  };
}

/**
 * Hook for loading data with dependencies
 *
 * Convenience wrapper around useDataLoader that automatically reloads
 * when dependencies change.
 *
 * @template T - Type of data being loaded
 * @param loader - Async function that loads the data
 * @param deps - Dependencies that trigger a reload when changed
 * @returns Object with data, loading state, error state, and retry function
 *
 * @example
 * ```tsx
 * function ContactDetails({ contactId }: { contactId: string }) {
 *   const { data, loading, error } = useDataLoaderWithDeps(
 *     async () => await database.contacts.getById(contactId),
 *     [contactId] // Reload when contactId changes
 *   );
 *
 *   if (loading) return <ActivityIndicator />;
 *   if (error) return <ErrorMessage error={error} />;
 *   return <ContactCard contact={data} />;
 * }
 * ```
 */
export function useDataLoaderWithDeps<T>(
  loader: () => Promise<T>,
  deps: React.DependencyList
): UseDataLoaderResult<T> {
  return useDataLoader(loader, { deps });
}
