/**
 * Messaging quick wins end-to-end coverage.
 *
 * Validates server-side metadata updates, preview synchronization,
 * and search filtering without touching UI layers.
 */
import { MemStorage } from "../storage";
import type { Conversation, Message } from "@contracts/schema";

const baseConversation = (
  overrides: Partial<Omit<Conversation, "id" | "createdAt" | "updatedAt">> = {},
): Omit<Conversation, "id" | "createdAt" | "updatedAt"> => ({
  userId: "user_1",
  type: "direct",
  name: "Test Conversation",
  participants: [],
  lastMessageId: null,
  lastMessageAt: null,
  lastMessagePreview: "",
  unreadCount: 0,
  isTyping: [],
  isPinned: false,
  isMuted: false,
  isArchived: false,
  archivedAt: null,
  ...overrides,
});

const baseMessage = (
  overrides: Partial<Omit<Message, "id" | "createdAt" | "updatedAt">> = {},
): Omit<Message, "id" | "createdAt" | "updatedAt"> => ({
  conversationId: "conv_1",
  senderId: "user_1",
  senderName: "Alex",
  content: "Initial message",
  type: "text",
  attachments: [],
  replyToId: null,
  isEdited: false,
  isRead: false,
  deliveredAt: null,
  readAt: null,
  ...overrides,
});

describe("Messaging quick wins (server)", () => {
  it("marks edits and syncs conversation previews", async () => {
    const storage = new MemStorage();
    const conversation = await storage.createConversation(baseConversation());

    const message = await storage.createMessage(
      baseMessage({
        conversationId: conversation.id,
        content: "Hello world",
      }),
    );

    const convoAfterCreate = await storage.getConversation(
      conversation.id,
      conversation.userId,
    );

    expect(convoAfterCreate?.lastMessageId).toBe(message.id);
    expect(convoAfterCreate?.lastMessagePreview).toBe("Hello world");

    const updated = await storage.updateMessage(
      message.id,
      conversation.userId,
      {
        content: "Edited message",
      },
    );

    expect(updated?.isEdited).toBe(true);

    const convoAfterEdit = await storage.getConversation(
      conversation.id,
      conversation.userId,
    );

    expect(convoAfterEdit?.lastMessagePreview).toBe("Edited message");
  });

  it("rewinds conversation previews when deleting latest messages", async () => {
    const storage = new MemStorage();
    const conversation = await storage.createConversation(baseConversation());

    const first = await storage.createMessage(
      baseMessage({
        conversationId: conversation.id,
        content: "First note",
      }),
    );

    const second = await storage.createMessage(
      baseMessage({
        conversationId: conversation.id,
        content: "Latest note",
      }),
    );

    const deleted = await storage.deleteMessage(second.id, conversation.userId);
    expect(deleted).toBe(true);

    const updatedConversation = await storage.getConversation(
      conversation.id,
      conversation.userId,
    );

    expect(updatedConversation?.lastMessageId).toBe(first.id);
    expect(updatedConversation?.lastMessagePreview).toBe("First note");
  });

  it("searches messages with user scoping and optional filters", async () => {
    const storage = new MemStorage();
    const conversationOne =
      await storage.createConversation(baseConversation());
    const conversationTwo = await storage.createConversation(
      baseConversation({ userId: "user_2", name: "Other Conversation" }),
    );

    await storage.createMessage(
      baseMessage({
        conversationId: conversationOne.id,
        content: "Quarterly report draft",
        senderName: "Sam",
      }),
    );

    await storage.createMessage(
      baseMessage({
        conversationId: conversationTwo.id,
        content: "Quarterly report draft",
        senderName: "Taylor",
      }),
    );

    const scopedResults = await storage.searchMessages(
      "report",
      conversationOne.userId,
    );

    expect(scopedResults).toHaveLength(1);
    expect(scopedResults[0].senderName).toBe("Sam");

    const filteredResults = await storage.searchMessages(
      "report",
      conversationOne.userId,
      { conversationId: conversationOne.id },
    );

    expect(filteredResults).toHaveLength(1);

    const blockedResults = await storage.searchMessages(
      "report",
      conversationOne.userId,
      { conversationId: conversationTwo.id },
    );

    expect(blockedResults).toHaveLength(0);
  });
});
