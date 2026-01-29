/**
 * useNetworkStatus Hook
 *
 * Purpose (Plain English):
 * Detects whether the device is online or offline and provides network
 * status information. Helps show appropriate error messages and prevent
 * unnecessary network requests when offline.
 *
 * What it provides:
 * - Current online/offline status
 * - Network type (wifi, cellular, etc.)
 * - Connection quality indicators
 *
 * Usage:
 * ```tsx
 * const { isOnline, networkType } = useNetworkStatus();
 *
 * if (!isOnline) {
 *   return <OfflineBanner />;
 * }
 * ```
 *
 * **Note**: Requires @react-native-community/netinfo to be installed:
 * ```bash
 * npm install @react-native-community/netinfo
 * ```
 *
 * @module useNetworkStatus
 */

import { useState, useEffect } from "react";

// Type definitions for NetInfo (from @react-native-community/netinfo)
export type NetworkStateType =
  | "unknown"
  | "none"
  | "wifi"
  | "cellular"
  | "bluetooth"
  | "ethernet"
  | "wimax"
  | "vpn"
  | "other";

export interface NetworkState {
  /**
   * Whether the device is connected to an active network
   */
  isConnected: boolean | null;

  /**
   * Whether the device has internet connectivity
   * (may be false even if connected to a network)
   */
  isInternetReachable: boolean | null;

  /**
   * Type of network connection
   */
  type: NetworkStateType;

  /**
   * Details about the connection (varies by platform and network type)
   */
  details: {
    isConnectionExpensive?: boolean;
    cellularGeneration?: "2g" | "3g" | "4g" | "5g";
  } | null;
}

export interface UseNetworkStatusResult {
  /**
   * Whether the device is online (connected with internet access)
   */
  isOnline: boolean;

  /**
   * Whether the device is offline
   */
  isOffline: boolean;

  /**
   * Full network state information
   */
  networkState: NetworkState | null;

  /**
   * Whether network status is still being determined
   */
  isLoading: boolean;
}

/**
 * Hook for monitoring network status
 *
 * @returns Network status information
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isOnline, isOffline } = useNetworkStatus();
 *
 *   if (isOffline) {
 *     return (
 *       <ScreenStateMessage
 *         title="You're offline"
 *         description="Connect to the internet to continue"
 *         icon="wifi-off"
 *       />
 *     );
 *   }
 *
 *   return <YourContent />;
 * }
 * ```
 *
 * @example With network type detection
 * ```tsx
 * function DataSyncComponent() {
 *   const { isOnline, networkState } = useNetworkStatus();
 *
 *   const shouldAutoSync =
 *     isOnline &&
 *     networkState?.type === "wifi" &&
 *     !networkState?.details?.isConnectionExpensive;
 *
 *   useEffect(() => {
 *     if (shouldAutoSync) {
 *       syncLargeFiles();
 *     }
 *   }, [shouldAutoSync]);
 * }
 * ```
 */
export function useNetworkStatus(): UseNetworkStatusResult {
  const [networkState, setNetworkState] = useState<NetworkState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    // Dynamically import NetInfo to avoid errors if not installed
    const setupNetInfo = async () => {
      try {
        // Try to import NetInfo
        const NetInfo = await import("@react-native-community/netinfo");

        // Get initial state
        const initialState = await NetInfo.default.fetch();
        setNetworkState(initialState);
        setIsLoading(false);

        // Subscribe to network changes
        unsubscribe = NetInfo.default.addEventListener((state) => {
          setNetworkState(state);
        });
      } catch (error) {
        // NetInfo not installed - provide fallback
        console.warn(
          "[useNetworkStatus] @react-native-community/netinfo not found. " +
            "Network status will assume online. " +
            "Install the package to enable network detection.",
        );

        // Fallback: assume online
        setNetworkState({
          isConnected: true,
          isInternetReachable: true,
          type: "unknown",
          details: null,
        });
        setIsLoading(false);
      }
    };

    setupNetInfo();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Determine if online: connected AND internet reachable
  // Note: We treat null isInternetReachable as "assume online" because:
  // - This occurs during initial fetch before determination is complete
  // - It's better to optimistically assume online than block user actions
  // - The value will be updated once NetInfo determines actual reachability
  const isOnline =
    networkState !== null &&
    networkState.isConnected === true &&
    (networkState.isInternetReachable === true ||
      networkState.isInternetReachable === null); // Optimistically assume reachable if unknown

  const isOffline = networkState !== null && !isOnline;

  return {
    isOnline,
    isOffline,
    networkState,
    isLoading,
  };
}

/**
 * Helper function to check if network is suitable for large data transfers
 *
 * @param networkState - Current network state
 * @returns Whether network is good for large transfers (WiFi, not expensive)
 *
 * @example
 * ```tsx
 * const { networkState } = useNetworkStatus();
 *
 * if (shouldDownloadLargeFile && isGoodConnectionForDownload(networkState)) {
 *   startDownload();
 * }
 * ```
 */
export function isGoodConnectionForDownload(
  networkState: NetworkState | null,
): boolean {
  if (!networkState || !networkState.isConnected) {
    return false;
  }

  // WiFi is usually good
  if (networkState.type === "wifi" || networkState.type === "ethernet") {
    return true;
  }

  // Cellular: check if expensive and generation
  if (networkState.type === "cellular") {
    // Avoid expensive connections
    if (networkState.details?.isConnectionExpensive) {
      return false;
    }

    // 4G/5G are acceptable, 2G/3G are slow
    const generation = networkState.details?.cellularGeneration;
    return generation === "4g" || generation === "5g";
  }

  // Unknown or other types: be conservative
  return false;
}
