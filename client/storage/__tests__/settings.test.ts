import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../database";
import { DEFAULT_SETTINGS } from "@/models/types";

describe("Settings - New Fields", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  afterEach(async () => {
    await AsyncStorage.clear();
  });

  describe("colorTheme", () => {
    it("should have default colorTheme set to cyan", async () => {
      const settings = await db.settings.get();
      expect(settings.colorTheme).toBe("cyan");
    });

    it("should update colorTheme", async () => {
      await db.settings.update({ colorTheme: "purple" });
      const settings = await db.settings.get();
      expect(settings.colorTheme).toBe("purple");
    });

    it("should support all color theme options", async () => {
      const themes = [
        "cyan",
        "purple",
        "green",
        "orange",
        "pink",
        "blue",
      ] as const;
      for (const theme of themes) {
        await db.settings.update({ colorTheme: theme });
        const settings = await db.settings.get();
        expect(settings.colorTheme).toBe(theme);
      }
    });
  });

  describe("aiPersonality", () => {
    it("should have default aiPersonality set to default", async () => {
      const settings = await db.settings.get();
      expect(settings.aiPersonality).toBe("default");
    });

    it("should update aiPersonality", async () => {
      await db.settings.update({ aiPersonality: "enthusiastic" });
      const settings = await db.settings.get();
      expect(settings.aiPersonality).toBe("enthusiastic");
    });

    it("should support all personality options", async () => {
      const personalities = [
        "default",
        "enthusiastic",
        "coach",
        "witty",
        "militant",
      ] as const;
      for (const personality of personalities) {
        await db.settings.update({ aiPersonality: personality });
        const settings = await db.settings.get();
        expect(settings.aiPersonality).toBe(personality);
      }
    });
  });

  describe("aiCustomPrompt", () => {
    it("should have default aiCustomPrompt", async () => {
      const settings = await db.settings.get();
      expect(settings.aiCustomPrompt).toBeDefined();
      expect(settings.aiCustomPrompt.length).toBeGreaterThan(0);
    });

    it("should update aiCustomPrompt", async () => {
      const customPrompt =
        "You are a helpful AI assistant with a unique personality.";
      await db.settings.update({ aiCustomPrompt: customPrompt });
      const settings = await db.settings.get();
      expect(settings.aiCustomPrompt).toBe(customPrompt);
    });
  });
});
