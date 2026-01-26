/**
 * Schema Validation Security Tests
 *
 * Verifies that string fields have max length validation to prevent DoS:
 * - User fields have limits
 * - Note, task, project, event fields have limits
 * - Message fields have limits
 */
import {
  insertUserSchema,
  loginSchema,
  insertNoteSchema,
  insertTaskSchema,
  insertProjectSchema,
  insertEventSchema,
  insertMessageSchema,
  insertSettingsSchema,
  insertConversationSchema,
} from "@contracts/schema";

describe("Schema Validation Security", () => {
  describe("User Schema Limits", () => {
    test("should reject username exceeding 50 characters", () => {
      const longUsername = "a".repeat(51);
      const result = insertUserSchema.safeParse({
        username: longUsername,
        password: "validpassword",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("50 characters");
      }
    });

    test("should reject password exceeding 100 characters", () => {
      const longPassword = "a".repeat(101);
      const result = insertUserSchema.safeParse({
        username: "validuser",
        password: longPassword,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("100 characters");
      }
    });

    test("should accept valid user data", () => {
      const result = insertUserSchema.safeParse({
        username: "validuser",
        password: "validpassword123",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Note Schema Limits", () => {
    test("should reject title exceeding 200 characters", () => {
      const longTitle = "a".repeat(201);
      const result = insertNoteSchema.safeParse({
        title: longTitle,
        bodyMarkdown: "Valid content",
        tags: [],
        links: [],
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("200 characters");
      }
    });

    test("should reject bodyMarkdown exceeding 50000 characters", () => {
      const longBody = "a".repeat(50001);
      const result = insertNoteSchema.safeParse({
        title: "Valid Title",
        bodyMarkdown: longBody,
        tags: [],
        links: [],
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("50000 characters");
      }
    });

    test("should accept valid note data", () => {
      const result = insertNoteSchema.safeParse({
        title: "Valid Note",
        bodyMarkdown: "This is valid markdown content",
        tags: ["tag1"],
        links: ["http://example.com"],
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Task Schema Limits", () => {
    test("should reject title exceeding 200 characters", () => {
      const longTitle = "a".repeat(201);
      const result = insertTaskSchema.safeParse({
        title: longTitle,
        userNotes: "",
        priority: "high",
        status: "pending",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("200 characters");
      }
    });

    test("should reject userNotes exceeding 5000 characters", () => {
      const longNotes = "a".repeat(5001);
      const result = insertTaskSchema.safeParse({
        title: "Valid Task",
        userNotes: longNotes,
        priority: "high",
        status: "pending",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("5000 characters");
      }
    });
  });

  describe("Project Schema Limits", () => {
    test("should reject name exceeding 200 characters", () => {
      const longName = "a".repeat(201);
      const result = insertProjectSchema.safeParse({
        name: longName,
        description: "Valid description",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("200 characters");
      }
    });

    test("should reject description exceeding 5000 characters", () => {
      const longDesc = "a".repeat(5001);
      const result = insertProjectSchema.safeParse({
        name: "Valid Project",
        description: longDesc,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("5000 characters");
      }
    });
  });

  describe("Event Schema Limits", () => {
    test("should reject title exceeding 200 characters", () => {
      const longTitle = "a".repeat(201);
      const result = insertEventSchema.safeParse({
        title: longTitle,
        description: "Valid description",
        location: "Valid location",
        startAt: new Date().toISOString(),
        endAt: new Date().toISOString(),
        timezone: "UTC",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("200 characters");
      }
    });

    test("should reject location exceeding 500 characters", () => {
      const longLocation = "a".repeat(501);
      const result = insertEventSchema.safeParse({
        title: "Valid Event",
        description: "Valid description",
        location: longLocation,
        startAt: new Date().toISOString(),
        endAt: new Date().toISOString(),
        timezone: "UTC",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("500 characters");
      }
    });
  });

  describe("Message Schema Limits", () => {
    test("should reject content exceeding 10000 characters", () => {
      const longContent = "a".repeat(10001);
      const result = insertMessageSchema.safeParse({
        conversationId: "123e4567-e89b-12d3-a456-426614174000",
        senderId: "123e4567-e89b-12d3-a456-426614174000",
        senderName: "Test User",
        content: longContent,
        type: "text",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("10000 characters");
      }
    });

    test("should accept valid message data", () => {
      const result = insertMessageSchema.safeParse({
        conversationId: "123e4567-e89b-12d3-a456-426614174000",
        senderId: "123e4567-e89b-12d3-a456-426614174000",
        senderName: "Test User",
        content: "This is a valid message",
        type: "text",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Settings Schema Limits", () => {
    test("should reject aiName exceeding 50 characters", () => {
      const longName = "a".repeat(51);
      const result = insertSettingsSchema.safeParse({
        aiName: longName,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("50 characters");
      }
    });

    test("should reject aiCustomPrompt exceeding 10000 characters", () => {
      const longPrompt = "a".repeat(10001);
      const result = insertSettingsSchema.safeParse({
        aiName: "AIOS",
        aiCustomPrompt: longPrompt,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const promptError = result.error.issues.find((issue) =>
          issue.path.includes("aiCustomPrompt"),
        );
        expect(promptError?.message).toContain("10000 characters");
      }
    });
  });

  describe("Conversation Schema Limits", () => {
    test("should reject name exceeding 200 characters", () => {
      const longName = "a".repeat(201);
      const result = insertConversationSchema.safeParse({
        type: "direct",
        name: longName,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("200 characters");
      }
    });

    test("should accept valid conversation data", () => {
      const result = insertConversationSchema.safeParse({
        type: "direct",
        name: "Valid Conversation",
        participants: [],
        lastMessagePreview: "",
        unreadCount: 0,
        isTyping: [],
        isPinned: false,
        isMuted: false,
        isArchived: false,
      });

      expect(result.success).toBe(true);
    });
  });
});
