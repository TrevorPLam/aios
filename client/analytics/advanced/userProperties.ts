/**
 * User Properties & Identify
 *
 * Tracks user-level properties (traits) separate from events.
 * Enables user-centric analytics (who did what).
 *
 * World-class standard: Segment identify(), Amplitude setUserProperties()
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_PROPERTIES_KEY = "@analytics:user_properties";

export interface UserProperties {
  // Core identifiers
  userId?: string;
  anonymousId?: string;
  email?: string;

  // Demographics
  name?: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  gender?: string;

  // Account info
  createdAt?: string;
  plan?: string;
  role?: string;

  // Preferences
  language?: string;
  timezone?: string;
  theme?: string;

  // Custom properties (extensible)
  [key: string]: string | number | boolean | undefined;
}

export class UserPropertiesManager {
  private properties: UserProperties = {};
  private isLoaded = false;

  /**
   * Initialize and load user properties
   */
  async initialize(): Promise<void> {
    if (this.isLoaded) return;

    try {
      const stored = await AsyncStorage.getItem(USER_PROPERTIES_KEY);
      if (stored) {
        this.properties = JSON.parse(stored);
      }
      this.isLoaded = true;
    } catch (error) {
      console.error("[UserProperties] Failed to load:", error);
      this.properties = {};
      this.isLoaded = true;
    }
  }

  /**
   * Identify user with properties
   *
   * Similar to Segment's identify() or Amplitude's setUserId()
   */
  async identify(
    userId: string,
    properties?: Partial<UserProperties>,
  ): Promise<void> {
    await this.initialize();

    this.properties = {
      ...this.properties,
      userId,
      ...properties,
    };

    await this.persist();

    if (__DEV__) {
      console.log("[UserProperties] User identified:", userId, properties);
    }
  }

  /**
   * Set user properties (merge with existing)
   */
  async setProperties(properties: Partial<UserProperties>): Promise<void> {
    await this.initialize();

    this.properties = {
      ...this.properties,
      ...properties,
    };

    await this.persist();
  }

  /**
   * Set a single property
   */
  async setProperty(
    key: string,
    value: string | number | boolean,
  ): Promise<void> {
    await this.setProperties({ [key]: value });
  }

  /**
   * Increment a numeric property
   */
  async incrementProperty(key: string, value: number = 1): Promise<void> {
    await this.initialize();

    const current = this.properties[key];
    const newValue = typeof current === "number" ? current + value : value;

    await this.setProperty(key, newValue);
  }

  /**
   * Get user properties
   */
  async getProperties(): Promise<UserProperties> {
    await this.initialize();
    return { ...this.properties };
  }

  /**
   * Get specific property
   */
  async getProperty(
    key: string,
  ): Promise<string | number | boolean | undefined> {
    await this.initialize();
    return this.properties[key];
  }

  /**
   * Get user ID
   */
  async getUserId(): Promise<string | undefined> {
    await this.initialize();
    return this.properties.userId;
  }

  /**
   * Clear all user properties (on logout)
   */
  async clear(): Promise<void> {
    this.properties = {};
    await AsyncStorage.removeItem(USER_PROPERTIES_KEY);
    this.isLoaded = false;
  }

  /**
   * Reset specific properties while keeping user ID
   */
  async reset(keepKeys: string[] = ["userId", "anonymousId"]): Promise<void> {
    await this.initialize();

    const preserved: UserProperties = {};
    for (const key of keepKeys) {
      if (this.properties[key] !== undefined) {
        preserved[key] = this.properties[key];
      }
    }

    this.properties = preserved;
    await this.persist();
  }

  /**
   * Persist properties to storage
   */
  private async persist(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        USER_PROPERTIES_KEY,
        JSON.stringify(this.properties),
      );
    } catch (error) {
      console.error("[UserProperties] Failed to persist:", error);
    }
  }
}

/**
 * Usage Example:
 *
 * const userProps = new UserPropertiesManager();
 *
 * // On login
 * await userProps.identify("user_123", {
 *   email: "user@example.com",
 *   name: "John Doe",
 *   plan: "premium"
 * });
 *
 * // Update properties
 * await userProps.setProperty("theme", "dark");
 * await userProps.incrementProperty("sessionsCount");
 *
 * // On logout
 * await userProps.clear();
 *
 * // Include in events
 * const props = await userProps.getProperties();
 * analytics.log("button_clicked", { ...eventProps, user: props });
 */
