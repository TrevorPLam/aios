import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../database";
import { Message, Conversation, ConversationParticipant } from "@contracts/models/types";

describe("Database Messages Storage", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  afterEach(async () => {
    await AsyncStorage.clear();
  });

  const mockParticipants: ConversationParticipant[] = [
    {
      userId: "user_1",
      userName: "User One",
      isOnline: true,
      lastSeenAt: "2026-01-14T00:00:00Z",
      joinedAt: "2026-01-14T00:00:00Z",
    },
    {
      userId: "user_2",
      userName: "User Two",
      isOnline: false,
      lastSeenAt: "2026-01-13T00:00:00Z",
      joinedAt: "2026-01-14T00:00:00Z",
    },
  ];

  const mockConversation: Conversation = {
    id: "conv_1",
    type: "direct",
    name: "Test Conversation",
    participants: mockParticipants,
    lastMessageId: null,
    lastMessageAt: null,
    lastMessagePreview: "",
    unreadCount: 0,
    isTyping: [],
    isPinned: false,
    isMuted: false,
    isArchived: false,
    archivedAt: null,
    createdAt: "2026-01-14T00:00:00Z",
    updatedAt: "2026-01-14T00:00:00Z",
  };

  const mockMessage: Message = {
    id: "msg_1",
    conversationId: "conv_1",
    senderId: "user_1",
    senderName: "User One",
    content: "Test message",
    type: "text",
    attachments: [],
    replyToId: null,
    isEdited: false,
    isRead: false,
    deliveredAt: "2026-01-14T00:00:00Z",
    readAt: null,
    createdAt: "2026-01-14T00:00:00Z",
    updatedAt: "2026-01-14T00:00:00Z",
  };

  describe("messages", () => {
    it("should save and retrieve a message", async () => {
      await db.messages.save(mockMessage);
      const all = await db.messages.getAll();

      expect(all).toHaveLength(1);
      expect(all[0]).toEqual(mockMessage);
    });

    it("should get a specific message by id", async () => {
      await db.messages.save(mockMessage);
      const message = await db.messages.get("msg_1");

      expect(message).toEqual(mockMessage);
    });

    it("should return null for non-existent message", async () => {
      const message = await db.messages.get("non_existent");
      expect(message).toBeNull();
    });

    it("should get messages by conversation", async () => {
      const message2: Message = {
        ...mockMessage,
        id: "msg_2",
        conversationId: "conv_2",
      };

      await db.messages.save(mockMessage);
      await db.messages.save(message2);

      const convMessages = await db.messages.getByConversation("conv_1");

      expect(convMessages).toHaveLength(1);
      expect(convMessages[0].id).toBe("msg_1");
    });

    it("should delete a message", async () => {
      await db.messages.save(mockMessage);
      await db.messages.delete("msg_1");

      const all = await db.messages.getAll();
      expect(all).toHaveLength(0);
    });

    it("should mark messages as read", async () => {
      await db.messages.save(mockMessage);
      await db.messages.markAsRead("conv_1", "user_2");

      const message = await db.messages.get("msg_1");
      expect(message?.isRead).toBe(true);
      expect(message?.readAt).toBeTruthy();
    });

    it("should get unread count for a conversation", async () => {
      const message2: Message = {
        ...mockMessage,
        id: "msg_2",
        senderId: "user_2",
        isRead: false,
      };

      await db.messages.save(mockMessage);
      await db.messages.save(message2);

      const count = await db.messages.getUnreadCount("conv_1", "user_1");
      expect(count).toBe(1);
    });

    it("should update existing message", async () => {
      await db.messages.save(mockMessage);

      const updated = { ...mockMessage, content: "Updated content" };
      await db.messages.save(updated);

      const all = await db.messages.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].content).toBe("Updated content");
    });

    it("should search messages by content, sender, and attachment metadata", async () => {
      const messageWithAttachment: Message = {
        ...mockMessage,
        id: "msg_2",
        content: "Quarterly report attached",
        attachments: [
          {
            id: "att_1",
            type: "file",
            url: "https://example.com/report.pdf",
            fileName: "Q1-report.pdf",
          },
        ],
      };

      await db.messages.save(mockMessage);
      await db.messages.save(messageWithAttachment);

      const byContent = await db.messages.search("report");
      const bySender = await db.messages.search("user one");
      const byAttachment = await db.messages.search("q1-report");

      expect(byContent.map((m) => m.id)).toContain("msg_2");
      expect(bySender.map((m) => m.id)).toContain("msg_1");
      expect(byAttachment.map((m) => m.id)).toContain("msg_2");
    });

    it("should scope message search to a conversation", async () => {
      const message2: Message = {
        ...mockMessage,
        id: "msg_2",
        conversationId: "conv_2",
        content: "Conversation two message",
      };

      await db.messages.save(mockMessage);
      await db.messages.save(message2);

      const scoped = await db.messages.search("message", {
        conversationId: "conv_2",
      });

      expect(scoped).toHaveLength(1);
      expect(scoped[0].id).toBe("msg_2");
    });

    it("should edit message content and refresh conversation preview", async () => {
      await db.conversations.save({
        ...mockConversation,
        lastMessageId: mockMessage.id,
        lastMessageAt: mockMessage.createdAt,
        lastMessagePreview: mockMessage.content,
      });
      await db.messages.save(mockMessage);

      const edited = await db.messages.editContent(
        mockMessage.id,
        "Edited message content",
      );

      const conversation = await db.conversations.get(mockConversation.id);

      expect(edited?.content).toBe("Edited message content");
      expect(edited?.isEdited).toBe(true);
      expect(conversation?.lastMessagePreview).toBe("Edited message content");
    });

    it("should update conversation preview when deleting the latest message", async () => {
      const olderMessage: Message = {
        ...mockMessage,
        id: "msg_0",
        content: "Older message",
        createdAt: "2026-01-13T00:00:00Z",
      };

      await db.conversations.save({
        ...mockConversation,
        lastMessageId: mockMessage.id,
        lastMessageAt: mockMessage.createdAt,
        lastMessagePreview: mockMessage.content,
      });
      await db.messages.save(olderMessage);
      await db.messages.save(mockMessage);

      await db.messages.delete(mockMessage.id);

      const conversation = await db.conversations.get(mockConversation.id);

      expect(conversation?.lastMessageId).toBe("msg_0");
      expect(conversation?.lastMessagePreview).toBe("Older message");
    });
  });

  describe("conversations", () => {
    it("should save and retrieve a conversation", async () => {
      await db.conversations.save(mockConversation);
      const all = await db.conversations.getAll();

      expect(all).toHaveLength(1);
      expect(all[0]).toEqual(mockConversation);
    });

    it("should get a specific conversation by id", async () => {
      await db.conversations.save(mockConversation);
      const conversation = await db.conversations.get("conv_1");

      expect(conversation).toEqual(mockConversation);
    });

    it("should return null for non-existent conversation", async () => {
      const conversation = await db.conversations.get("non_existent");
      expect(conversation).toBeNull();
    });

    it("should get all active conversations", async () => {
      const archivedConv: Conversation = {
        ...mockConversation,
        id: "conv_2",
        isArchived: true,
        archivedAt: "2026-01-14T00:00:00Z",
      };

      await db.conversations.save(mockConversation);
      await db.conversations.save(archivedConv);

      const active = await db.conversations.getAllActive();

      expect(active).toHaveLength(1);
      expect(active[0].id).toBe("conv_1");
    });

    it("should get all archived conversations", async () => {
      const archivedConv: Conversation = {
        ...mockConversation,
        id: "conv_2",
        isArchived: true,
        archivedAt: "2026-01-14T00:00:00Z",
      };

      await db.conversations.save(mockConversation);
      await db.conversations.save(archivedConv);

      const archived = await db.conversations.getAllArchived();

      expect(archived).toHaveLength(1);
      expect(archived[0].id).toBe("conv_2");
    });

    it("should delete a conversation and its messages", async () => {
      await db.conversations.save(mockConversation);
      await db.messages.save(mockMessage);

      await db.conversations.delete("conv_1");

      const conversations = await db.conversations.getAll();
      const messages = await db.messages.getAll();

      expect(conversations).toHaveLength(0);
      expect(messages).toHaveLength(0);
    });

    it("should update typing status", async () => {
      await db.conversations.save(mockConversation);

      await db.conversations.updateTyping("conv_1", "user_1", true);
      let conversation = await db.conversations.get("conv_1");
      expect(conversation?.isTyping).toContain("user_1");

      await db.conversations.updateTyping("conv_1", "user_1", false);
      conversation = await db.conversations.get("conv_1");
      expect(conversation?.isTyping).not.toContain("user_1");
    });

    it("should archive a conversation", async () => {
      await db.conversations.save(mockConversation);
      await db.conversations.archive("conv_1");

      const conversation = await db.conversations.get("conv_1");
      expect(conversation?.isArchived).toBe(true);
      expect(conversation?.archivedAt).toBeTruthy();
    });

    it("should unarchive a conversation", async () => {
      const archivedConv: Conversation = {
        ...mockConversation,
        isArchived: true,
        archivedAt: "2026-01-14T00:00:00Z",
      };

      await db.conversations.save(archivedConv);
      await db.conversations.unarchive("conv_1");

      const conversation = await db.conversations.get("conv_1");
      expect(conversation?.isArchived).toBe(false);
      expect(conversation?.archivedAt).toBeNull();
    });

    it("should update unread count", async () => {
      await db.conversations.save(mockConversation);
      await db.conversations.updateUnreadCount("conv_1", 5);

      const conversation = await db.conversations.get("conv_1");
      expect(conversation?.unreadCount).toBe(5);
    });

    it("should get archivable conversations", async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 20);

      const oldConv: Conversation = {
        ...mockConversation,
        id: "conv_old",
        lastMessageAt: oldDate.toISOString(),
      };

      const recentConv: Conversation = {
        ...mockConversation,
        id: "conv_recent",
      };

      await db.conversations.save(oldConv);
      await db.conversations.save(recentConv);

      const archivable = await db.conversations.getArchivableConversations();

      expect(archivable).toHaveLength(1);
      expect(archivable[0].id).toBe("conv_old");
    });

    it("should update existing conversation", async () => {
      await db.conversations.save(mockConversation);

      const updated = { ...mockConversation, name: "Updated Name" };
      await db.conversations.save(updated);

      const all = await db.conversations.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].name).toBe("Updated Name");
    });
  });
});
