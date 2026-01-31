/**
 * Identity Providers
 *
 * Strategies for generating identity information for analytics events.
 * - DefaultIdentityProvider: Stable user/device IDs + session ID
 * - PrivacyIdentityProvider: Ephemeral session ID + rotating pseudonymous ID
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

import { IdentityInfo } from "./types";

const STORAGE_KEYS = {
  DEVICE_ID: "@analytics:device_id",
  USER_ID: "@analytics:user_id",
  SESSION_ID: "@analytics:session_id",
  ANON_SEED: "@analytics:anon_seed",
  INSTALL_DATE: "@analytics:install_date",
};

/**
 * Generate a random UUID v4
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Simple hash function for generating deterministic IDs
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Get current date string (YYYY-MM-DD)
 */
function getCurrentDateString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

/**
 * Base Identity Provider Interface
 */
export interface IdentityProvider {
  getIdentity(): Promise<IdentityInfo>;
  refreshSession(): Promise<void>;
}

/**
 * Default Identity Provider (MODE A)
 *
 * Provides stable identifiers for tracking:
 * - user_id: Stable user identifier (if logged in)
 * - device_id: Stable device/install identifier
 * - session_id: Session identifier (persists for app lifetime, refreshed on restart)
 */
export class DefaultIdentityProvider implements IdentityProvider {
  private cachedIdentity: IdentityInfo | null = null;

  async getIdentity(): Promise<IdentityInfo> {
    if (this.cachedIdentity) {
      return this.cachedIdentity;
    }

    // Get or create device ID
    let deviceId = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    if (!deviceId) {
      deviceId = generateUUID();
      await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
    }

    // Get or create install date
    let installDate = await AsyncStorage.getItem(STORAGE_KEYS.INSTALL_DATE);
    if (!installDate) {
      installDate = new Date().toISOString();
      await AsyncStorage.setItem(STORAGE_KEYS.INSTALL_DATE, installDate);
    }

    // Get or create session ID
    let sessionId = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_ID);
    if (!sessionId) {
      sessionId = generateUUID();
      await AsyncStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
    }

    // Get user ID if available (would come from auth system)
    const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);

    this.cachedIdentity = {
      user_id: userId || undefined,
      device_id: deviceId,
      session_id: sessionId,
    };

    return this.cachedIdentity;
  }

  async refreshSession(): Promise<void> {
    const sessionId = generateUUID();
    await AsyncStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
    this.cachedIdentity = null; // Clear cache to force reload
  }

  /**
   * Set user ID (called after login/signup)
   */
  async setUserId(userId: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId);
    this.cachedIdentity = null; // Clear cache
  }

  /**
   * Clear user ID (called after logout)
   */
  async clearUserId(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_ID);
    this.cachedIdentity = null; // Clear cache
  }

  /**
   * Get install age in days
   */
  async getInstallAgeDays(): Promise<number> {
    const installDate = await AsyncStorage.getItem(STORAGE_KEYS.INSTALL_DATE);
    if (!installDate) {
      return 0;
    }
    const install = new Date(installDate);
    const now = new Date();
    const diffMs = now.getTime() - install.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    // Guard against negative values (clock changes or corrupted data)
    return Math.max(0, diffDays);
  }
}

/**
 * Privacy Identity Provider (MODE B)
 *
 * Provides privacy-safe identifiers:
 * - user_id: NOT included (omitted)
 * - device_id: NOT included (omitted)
 * - session_id: Ephemeral session ID (new each app launch)
 * - anon_id: Rotating pseudonymous ID (rotates daily, derived from seed + date)
 */
export class PrivacyIdentityProvider implements IdentityProvider {
  private cachedIdentity: IdentityInfo | null = null;
  private lastRotationDate: string | null = null;

  async getIdentity(): Promise<IdentityInfo> {
    const currentDate = getCurrentDateString();

    // Check if we need to refresh (new session or date changed)
    if (this.cachedIdentity && this.lastRotationDate === currentDate) {
      return this.cachedIdentity;
    }

    // Generate ephemeral session ID (new each app launch or when called)
    const sessionId = generateUUID();

    // Get or create anonymous seed (stable across sessions)
    let anonSeed = await AsyncStorage.getItem(STORAGE_KEYS.ANON_SEED);
    if (!anonSeed) {
      anonSeed = generateUUID();
      await AsyncStorage.setItem(STORAGE_KEYS.ANON_SEED, anonSeed);
    }

    // Generate rotating pseudonymous ID (seed + date, hashed)
    const anonId = simpleHash(`${anonSeed}:${currentDate}`);

    this.cachedIdentity = {
      session_id: sessionId,
      anon_id: anonId,
      // user_id and device_id are NOT included in privacy mode
    };

    this.lastRotationDate = currentDate;

    return this.cachedIdentity;
  }

  async refreshSession(): Promise<void> {
    // In privacy mode, we don't persist session ID
    // Each call to getIdentity() will create a new session
    this.cachedIdentity = null;
    this.lastRotationDate = null;
  }
}

/**
 * Create identity provider based on mode
 */
export function createIdentityProvider(privacyMode: boolean): IdentityProvider {
  return privacyMode
    ? new PrivacyIdentityProvider()
    : new DefaultIdentityProvider();
}
