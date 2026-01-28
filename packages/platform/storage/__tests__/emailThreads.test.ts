/**
 * Email Threads Database Tests
 *
 * Comprehensive test suite for email thread storage operations.
 * Tests all CRUD operations, filtering, search, bulk operations, and statistics.
 *
 * @module __tests__/emailThreads.test
 */

import { db } from "../database";
import { EmailThread, EmailMessage } from "@aios/contracts/models/types";
import { generateId } from "@aios/platform/lib/helpers";

// Helper function to create mock email thread
function createMockThread(overrides?: Partial<EmailThread>): EmailThread {
  const now = new Date().toISOString();
  const threadId = generateId();
  return {
    id: threadId,
    subject: "Test Email Subject",
    participants: ["sender@example.com", "You"],
    isRead: false,
    isStarred: false,
    lastMessageAt: now,
    messages: [
      {
        id: generateId(),
        threadId: threadId, // Use actual thread ID for data integrity
        from: "sender@example.com",
        to: ["you@example.com"],
        subject: "Test Email Subject",
        body: "Test email body content",
        sentAt: now,
        isRead: false,
      },
    ],
    ...overrides,
  };
}

describe("Email Threads Database", () => {
  // Clear database before each test
  beforeEach(async () => {
    await db.clearAll();
  });

  describe("Basic CRUD Operations", () => {
    it("should save and retrieve an email thread", async () => {
      const thread = createMockThread();
      await db.emailThreads.save(thread);

      const retrieved = await db.emailThreads.getById(thread.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(thread.id);
      expect(retrieved?.subject).toBe(thread.subject);
    });

    it("should get all email threads", async () => {
      const thread1 = createMockThread();
      const thread2 = createMockThread();

      await db.emailThreads.save(thread1);
      await db.emailThreads.save(thread2);

      const all = await db.emailThreads.getAll();
      expect(all).toHaveLength(2);
    });

    it("should update an existing thread", async () => {
      const thread = createMockThread();
      await db.emailThreads.save(thread);

      thread.subject = "Updated Subject";
      await db.emailThreads.save(thread);

      const retrieved = await db.emailThreads.getById(thread.id);
      expect(retrieved?.subject).toBe("Updated Subject");
    });

    it("should delete a thread", async () => {
      const thread = createMockThread();
      await db.emailThreads.save(thread);

      await db.emailThreads.delete(thread.id);

      const retrieved = await db.emailThreads.getById(thread.id);
      expect(retrieved).toBeUndefined();
    });
  });

  describe("Filtering Operations", () => {
    it("should get active (non-archived, non-draft) threads", async () => {
      const active1 = createMockThread();
      const active2 = createMockThread();
      const archived = createMockThread({ isArchived: true });
      const draft = createMockThread({ isDraft: true });

      await db.emailThreads.save(active1);
      await db.emailThreads.save(active2);
      await db.emailThreads.save(archived);
      await db.emailThreads.save(draft);

      const activeThreads = await db.emailThreads.getActive();
      expect(activeThreads).toHaveLength(2);
      expect(activeThreads.every((t) => !t.isArchived && !t.isDraft)).toBe(
        true,
      );
    });

    it("should get archived threads", async () => {
      const active = createMockThread();
      const archived1 = createMockThread({ isArchived: true });
      const archived2 = createMockThread({ isArchived: true });

      await db.emailThreads.save(active);
      await db.emailThreads.save(archived1);
      await db.emailThreads.save(archived2);

      const archivedThreads = await db.emailThreads.getArchived();
      expect(archivedThreads).toHaveLength(2);
      expect(archivedThreads.every((t) => t.isArchived)).toBe(true);
    });

    it("should get draft threads", async () => {
      const active = createMockThread();
      const draft = createMockThread({ isDraft: true });

      await db.emailThreads.save(active);
      await db.emailThreads.save(draft);

      const draftThreads = await db.emailThreads.getDrafts();
      expect(draftThreads).toHaveLength(1);
      expect(draftThreads[0].isDraft).toBe(true);
    });

    it("should get starred threads", async () => {
      const normal = createMockThread();
      const starred1 = createMockThread({ isStarred: true });
      const starred2 = createMockThread({ isStarred: true });

      await db.emailThreads.save(normal);
      await db.emailThreads.save(starred1);
      await db.emailThreads.save(starred2);

      const starredThreads = await db.emailThreads.getStarred();
      expect(starredThreads).toHaveLength(2);
      expect(starredThreads.every((t) => t.isStarred)).toBe(true);
    });

    it("should get unread threads", async () => {
      const read = createMockThread({ isRead: true });
      const unread1 = createMockThread({ isRead: false });
      const unread2 = createMockThread({ isRead: false });

      await db.emailThreads.save(read);
      await db.emailThreads.save(unread1);
      await db.emailThreads.save(unread2);

      const unreadThreads = await db.emailThreads.getUnread();
      expect(unreadThreads).toHaveLength(2);
      expect(unreadThreads.every((t) => !t.isRead)).toBe(true);
    });

    it("should get important threads", async () => {
      const normal = createMockThread();
      const important1 = createMockThread({ isImportant: true });
      const important2 = createMockThread({ isImportant: true });

      await db.emailThreads.save(normal);
      await db.emailThreads.save(important1);
      await db.emailThreads.save(important2);

      const importantThreads = await db.emailThreads.getImportant();
      expect(importantThreads).toHaveLength(2);
      expect(importantThreads.every((t) => t.isImportant)).toBe(true);
    });
  });

  describe("Label Operations", () => {
    it("should get threads by label", async () => {
      const work1 = createMockThread({ labels: ["work"] });
      const work2 = createMockThread({ labels: ["work", "urgent"] });
      const personal = createMockThread({ labels: ["personal"] });

      await db.emailThreads.save(work1);
      await db.emailThreads.save(work2);
      await db.emailThreads.save(personal);

      const workThreads = await db.emailThreads.getByLabel("work");
      expect(workThreads).toHaveLength(2);
    });

    it("should get all unique labels", async () => {
      const thread1 = createMockThread({ labels: ["work", "urgent"] });
      const thread2 = createMockThread({ labels: ["personal"] });
      const thread3 = createMockThread({ labels: ["work"] });

      await db.emailThreads.save(thread1);
      await db.emailThreads.save(thread2);
      await db.emailThreads.save(thread3);

      const labels = await db.emailThreads.getAllLabels();
      expect(labels).toHaveLength(3);
      expect(labels).toContain("work");
      expect(labels).toContain("urgent");
      expect(labels).toContain("personal");
    });

    it("should add a label to a thread", async () => {
      const thread = createMockThread();
      await db.emailThreads.save(thread);

      await db.emailThreads.addLabel(thread.id, "important");

      const retrieved = await db.emailThreads.getById(thread.id);
      expect(retrieved?.labels).toContain("important");
    });

    it("should not add duplicate labels", async () => {
      const thread = createMockThread({ labels: ["work"] });
      await db.emailThreads.save(thread);

      await db.emailThreads.addLabel(thread.id, "work");

      const retrieved = await db.emailThreads.getById(thread.id);
      expect(retrieved?.labels).toHaveLength(1);
    });

    it("should remove a label from a thread", async () => {
      const thread = createMockThread({ labels: ["work", "urgent"] });
      await db.emailThreads.save(thread);

      await db.emailThreads.removeLabel(thread.id, "work");

      const retrieved = await db.emailThreads.getById(thread.id);
      expect(retrieved?.labels).not.toContain("work");
      expect(retrieved?.labels).toContain("urgent");
    });
  });

  describe("Search Operations", () => {
    it("should search threads by subject", async () => {
      const thread1 = createMockThread({ subject: "Project Update" });
      const thread2 = createMockThread({ subject: "Meeting Notes" });
      const thread3 = createMockThread({ subject: "Project Timeline" });

      await db.emailThreads.save(thread1);
      await db.emailThreads.save(thread2);
      await db.emailThreads.save(thread3);

      const results = await db.emailThreads.search("Project");
      expect(results).toHaveLength(2);
    });

    it("should search threads by participant", async () => {
      const thread1 = createMockThread({
        participants: ["john@example.com", "You"],
      });
      const thread2 = createMockThread({
        participants: ["jane@example.com", "You"],
      });

      await db.emailThreads.save(thread1);
      await db.emailThreads.save(thread2);

      const results = await db.emailThreads.search("john");
      expect(results).toHaveLength(1);
      expect(results[0].participants).toContain("john@example.com");
    });

    it("should search threads by message body", async () => {
      const thread1 = createMockThread({
        messages: [
          {
            id: "1",
            threadId: "1",
            from: "test@example.com",
            to: ["you@example.com"],
            subject: "Test",
            body: "This is about quarterly earnings",
            sentAt: new Date().toISOString(),
            isRead: false,
          },
        ],
      });
      const thread2 = createMockThread({
        messages: [
          {
            id: "2",
            threadId: "2",
            from: "test@example.com",
            to: ["you@example.com"],
            subject: "Test",
            body: "This is about annual review",
            sentAt: new Date().toISOString(),
            isRead: false,
          },
        ],
      });

      await db.emailThreads.save(thread1);
      await db.emailThreads.save(thread2);

      const results = await db.emailThreads.search("quarterly");
      expect(results).toHaveLength(1);
      expect(results[0].messages[0].body).toContain("quarterly");
    });

    it("should search threads by labels", async () => {
      const thread1 = createMockThread({ labels: ["urgent", "work"] });
      const thread2 = createMockThread({ labels: ["personal"] });

      await db.emailThreads.save(thread1);
      await db.emailThreads.save(thread2);

      const results = await db.emailThreads.search("urgent");
      expect(results).toHaveLength(1);
    });

    it("should return all active threads for empty query", async () => {
      const thread1 = createMockThread();
      const thread2 = createMockThread();
      const archived = createMockThread({ isArchived: true });

      await db.emailThreads.save(thread1);
      await db.emailThreads.save(thread2);
      await db.emailThreads.save(archived);

      const results = await db.emailThreads.search("");
      expect(results).toHaveLength(2);
    });
  });

  describe("Single Thread Operations", () => {
    it("should toggle star status", async () => {
      const thread = createMockThread({ isStarred: false });
      await db.emailThreads.save(thread);

      await db.emailThreads.toggleStar(thread.id);
      let retrieved = await db.emailThreads.getById(thread.id);
      expect(retrieved?.isStarred).toBe(true);

      await db.emailThreads.toggleStar(thread.id);
      retrieved = await db.emailThreads.getById(thread.id);
      expect(retrieved?.isStarred).toBe(false);
    });

    it("should mark thread as read", async () => {
      const thread = createMockThread({ isRead: false });
      await db.emailThreads.save(thread);

      await db.emailThreads.markAsRead(thread.id);

      const retrieved = await db.emailThreads.getById(thread.id);
      expect(retrieved?.isRead).toBe(true);
      expect(retrieved?.messages.every((m) => m.isRead)).toBe(true);
    });

    it("should mark thread as unread", async () => {
      const thread = createMockThread({ isRead: true });
      await db.emailThreads.save(thread);

      await db.emailThreads.markAsUnread(thread.id);

      const retrieved = await db.emailThreads.getById(thread.id);
      expect(retrieved?.isRead).toBe(false);
    });

    it("should toggle important status", async () => {
      const thread = createMockThread({ isImportant: false });
      await db.emailThreads.save(thread);

      await db.emailThreads.toggleImportant(thread.id);
      let retrieved = await db.emailThreads.getById(thread.id);
      expect(retrieved?.isImportant).toBe(true);

      await db.emailThreads.toggleImportant(thread.id);
      retrieved = await db.emailThreads.getById(thread.id);
      expect(retrieved?.isImportant).toBe(false);
    });

    it("should archive a thread", async () => {
      const thread = createMockThread({ isArchived: false });
      await db.emailThreads.save(thread);

      await db.emailThreads.archive(thread.id);

      const retrieved = await db.emailThreads.getById(thread.id);
      expect(retrieved?.isArchived).toBe(true);
    });

    it("should unarchive a thread", async () => {
      const thread = createMockThread({ isArchived: true });
      await db.emailThreads.save(thread);

      await db.emailThreads.unarchive(thread.id);

      const retrieved = await db.emailThreads.getById(thread.id);
      expect(retrieved?.isArchived).toBe(false);
    });
  });

  describe("Bulk Operations", () => {
    it("should bulk mark threads as read", async () => {
      const thread1 = createMockThread({ isRead: false });
      const thread2 = createMockThread({ isRead: false });
      const thread3 = createMockThread({ isRead: false });

      await db.emailThreads.save(thread1);
      await db.emailThreads.save(thread2);
      await db.emailThreads.save(thread3);

      await db.emailThreads.bulkMarkAsRead([thread1.id, thread2.id]);

      const retrieved1 = await db.emailThreads.getById(thread1.id);
      const retrieved2 = await db.emailThreads.getById(thread2.id);
      const retrieved3 = await db.emailThreads.getById(thread3.id);

      expect(retrieved1?.isRead).toBe(true);
      expect(retrieved2?.isRead).toBe(true);
      expect(retrieved3?.isRead).toBe(false);
    });

    it("should bulk mark threads as unread", async () => {
      const thread1 = createMockThread({ isRead: true });
      const thread2 = createMockThread({ isRead: true });

      await db.emailThreads.save(thread1);
      await db.emailThreads.save(thread2);

      await db.emailThreads.bulkMarkAsUnread([thread1.id, thread2.id]);

      const retrieved1 = await db.emailThreads.getById(thread1.id);
      const retrieved2 = await db.emailThreads.getById(thread2.id);

      expect(retrieved1?.isRead).toBe(false);
      expect(retrieved2?.isRead).toBe(false);
    });

    it("should bulk star threads", async () => {
      const thread1 = createMockThread({ isStarred: false });
      const thread2 = createMockThread({ isStarred: false });

      await db.emailThreads.save(thread1);
      await db.emailThreads.save(thread2);

      await db.emailThreads.bulkStar([thread1.id, thread2.id]);

      const retrieved1 = await db.emailThreads.getById(thread1.id);
      const retrieved2 = await db.emailThreads.getById(thread2.id);

      expect(retrieved1?.isStarred).toBe(true);
      expect(retrieved2?.isStarred).toBe(true);
    });

    it("should bulk unstar threads", async () => {
      const thread1 = createMockThread({ isStarred: true });
      const thread2 = createMockThread({ isStarred: true });

      await db.emailThreads.save(thread1);
      await db.emailThreads.save(thread2);

      await db.emailThreads.bulkUnstar([thread1.id, thread2.id]);

      const retrieved1 = await db.emailThreads.getById(thread1.id);
      const retrieved2 = await db.emailThreads.getById(thread2.id);

      expect(retrieved1?.isStarred).toBe(false);
      expect(retrieved2?.isStarred).toBe(false);
    });

    it("should bulk archive threads", async () => {
      const thread1 = createMockThread({ isArchived: false });
      const thread2 = createMockThread({ isArchived: false });

      await db.emailThreads.save(thread1);
      await db.emailThreads.save(thread2);

      await db.emailThreads.bulkArchive([thread1.id, thread2.id]);

      const retrieved1 = await db.emailThreads.getById(thread1.id);
      const retrieved2 = await db.emailThreads.getById(thread2.id);

      expect(retrieved1?.isArchived).toBe(true);
      expect(retrieved2?.isArchived).toBe(true);
    });

    it("should bulk delete threads", async () => {
      const thread1 = createMockThread();
      const thread2 = createMockThread();
      const thread3 = createMockThread();

      await db.emailThreads.save(thread1);
      await db.emailThreads.save(thread2);
      await db.emailThreads.save(thread3);

      await db.emailThreads.bulkDelete([thread1.id, thread2.id]);

      const retrieved1 = await db.emailThreads.getById(thread1.id);
      const retrieved2 = await db.emailThreads.getById(thread2.id);
      const retrieved3 = await db.emailThreads.getById(thread3.id);

      expect(retrieved1).toBeUndefined();
      expect(retrieved2).toBeUndefined();
      expect(retrieved3).toBeDefined();
    });
  });

  describe("Statistics", () => {
    it("should calculate correct statistics", async () => {
      const active1 = createMockThread({ isRead: false });
      const active2 = createMockThread({ isRead: true, isStarred: true });
      const archived = createMockThread({ isRead: true, isArchived: true }); // Mark as read
      const important = createMockThread({ isRead: true, isImportant: true }); // Mark as read
      const draft = createMockThread({ isDraft: true });

      await db.emailThreads.save(active1);
      await db.emailThreads.save(active2);
      await db.emailThreads.save(archived);
      await db.emailThreads.save(important);
      await db.emailThreads.save(draft);

      const stats = await db.emailThreads.getStatistics();

      expect(stats.total).toBe(4); // Excludes drafts
      expect(stats.unread).toBe(1); // Only active1 is unread
      expect(stats.starred).toBe(1);
      expect(stats.archived).toBe(1);
      expect(stats.important).toBe(1);
      expect(stats.drafts).toBe(1);
    });

    it("should calculate total size", async () => {
      const thread1 = createMockThread({ totalSize: 1024 });
      const thread2 = createMockThread({ totalSize: 2048 });

      await db.emailThreads.save(thread1);
      await db.emailThreads.save(thread2);

      const stats = await db.emailThreads.getStatistics();

      expect(stats.totalSize).toBe(3072);
    });
  });

  describe("Sorting", () => {
    it("should sort threads by date (descending)", async () => {
      const old = createMockThread({
        lastMessageAt: "2024-01-01T00:00:00Z",
      });
      const middle = createMockThread({
        lastMessageAt: "2024-06-01T00:00:00Z",
      });
      const recent = createMockThread({
        lastMessageAt: "2024-12-01T00:00:00Z",
      });

      await db.emailThreads.save(old);
      await db.emailThreads.save(middle);
      await db.emailThreads.save(recent);

      const all = await db.emailThreads.getAll();
      const sorted = db.emailThreads.sort(all, "date", "desc");

      expect(sorted[0].lastMessageAt).toBe("2024-12-01T00:00:00Z");
      expect(sorted[2].lastMessageAt).toBe("2024-01-01T00:00:00Z");
    });

    it("should sort threads by sender (ascending)", async () => {
      const threadC = createMockThread({
        participants: ["charlie@example.com", "You"],
      });
      const threadA = createMockThread({
        participants: ["alice@example.com", "You"],
      });
      const threadB = createMockThread({
        participants: ["bob@example.com", "You"],
      });

      await db.emailThreads.save(threadC);
      await db.emailThreads.save(threadA);
      await db.emailThreads.save(threadB);

      const all = await db.emailThreads.getAll();
      const sorted = db.emailThreads.sort(all, "sender", "asc");

      expect(sorted[0].participants[0]).toBe("alice@example.com");
      expect(sorted[1].participants[0]).toBe("bob@example.com");
      expect(sorted[2].participants[0]).toBe("charlie@example.com");
    });

    it("should sort threads by subject (ascending)", async () => {
      const threadC = createMockThread({ subject: "Charlie Subject" });
      const threadA = createMockThread({ subject: "Alice Subject" });
      const threadB = createMockThread({ subject: "Bob Subject" });

      await db.emailThreads.save(threadC);
      await db.emailThreads.save(threadA);
      await db.emailThreads.save(threadB);

      const all = await db.emailThreads.getAll();
      const sorted = db.emailThreads.sort(all, "subject", "asc");

      expect(sorted[0].subject).toBe("Alice Subject");
      expect(sorted[1].subject).toBe("Bob Subject");
      expect(sorted[2].subject).toBe("Charlie Subject");
    });
  });
});
