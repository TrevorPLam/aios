import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../database";
import { Note } from "@/models/types";

describe("Database Notes Storage", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  afterEach(async () => {
    await AsyncStorage.clear();
  });

  const mockNote: Note = {
    id: "note_1",
    title: "Test Note",
    bodyMarkdown: "This is a test note with #tag1 and #tag2",
    createdAt: "2026-01-14T00:00:00Z",
    updatedAt: "2026-01-14T00:00:00Z",
    tags: ["tag1", "tag2"],
    links: [],
    isPinned: false,
    isArchived: false,
  };

  const createMockNote = (id: string, overrides: Partial<Note> = {}): Note => ({
    id,
    title: `Note ${id}`,
    bodyMarkdown: `Content for note ${id}`,
    createdAt: "2026-01-14T00:00:00Z",
    updatedAt: "2026-01-14T00:00:00Z",
    tags: [],
    links: [],
    isPinned: false,
    isArchived: false,
    ...overrides,
  });

  describe("notes", () => {
    it("should save and retrieve a note", async () => {
      await db.notes.save(mockNote);
      const all = await db.notes.getAll();

      expect(all).toHaveLength(1);
      expect(all[0]).toEqual(mockNote);
    });

    it("should get a specific note by id", async () => {
      await db.notes.save(mockNote);
      const note = await db.notes.get("note_1");

      expect(note).toEqual(mockNote);
    });

    it("should return null for non-existent note", async () => {
      const note = await db.notes.get("non_existent");
      expect(note).toBeNull();
    });

    it("should delete a note", async () => {
      await db.notes.save(mockNote);
      await db.notes.delete("note_1");

      const all = await db.notes.getAll();
      expect(all).toHaveLength(0);
    });

    it("should update existing note on save", async () => {
      await db.notes.save(mockNote);
      const updated = { ...mockNote, title: "Updated Note" };
      await db.notes.save(updated);

      const all = await db.notes.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].title).toBe("Updated Note");
    });

    it("should handle pinned notes", async () => {
      const pinnedNote = { ...mockNote, isPinned: true };
      await db.notes.save(pinnedNote);

      const note = await db.notes.get("note_1");
      expect(note?.isPinned).toBe(true);
    });

    it("should handle archived notes", async () => {
      const archivedNote = { ...mockNote, isArchived: true };
      await db.notes.save(archivedNote);

      const note = await db.notes.get("note_1");
      expect(note?.isArchived).toBe(true);
    });

    it("should save notes with multiple tags", async () => {
      const taggedNote = {
        ...mockNote,
        bodyMarkdown: "Note with #important #work #personal tags",
        tags: ["important", "work", "personal"],
      };
      await db.notes.save(taggedNote);

      const note = await db.notes.get("note_1");
      expect(note?.tags).toEqual(["important", "work", "personal"]);
    });

    it("should handle notes without optional fields", async () => {
      const simpleNote: Note = {
        id: "note_2",
        title: "Simple Note",
        bodyMarkdown: "Simple content",
        createdAt: "2026-01-14T00:00:00Z",
        updatedAt: "2026-01-14T00:00:00Z",
        tags: [],
        links: [],
      };

      await db.notes.save(simpleNote);
      const note = await db.notes.get("note_2");

      expect(note?.isPinned).toBeUndefined();
      expect(note?.isArchived).toBeUndefined();
    });

    it("should toggle pin status", async () => {
      await db.notes.save(mockNote);

      // Pin the note.
      const note = await db.notes.get("note_1");
      if (note) {
        await db.notes.save({ ...note, isPinned: true });
      }

      let updated = await db.notes.get("note_1");
      expect(updated?.isPinned).toBe(true);

      // Unpin the note.
      if (updated) {
        await db.notes.save({ ...updated, isPinned: false });
      }

      updated = await db.notes.get("note_1");
      expect(updated?.isPinned).toBe(false);
    });

    it("should toggle archive status", async () => {
      await db.notes.save(mockNote);

      // Archive the note.
      const note = await db.notes.get("note_1");
      if (note) {
        await db.notes.save({ ...note, isArchived: true });
      }

      let updated = await db.notes.get("note_1");
      expect(updated?.isArchived).toBe(true);

      // Unarchive the note.
      if (updated) {
        await db.notes.save({ ...updated, isArchived: false });
      }

      updated = await db.notes.get("note_1");
      expect(updated?.isArchived).toBe(false);
    });

    it("should handle multiple notes with different statuses", async () => {
      const note1 = { ...mockNote, id: "note_1", isPinned: true };
      const note2 = { ...mockNote, id: "note_2", isArchived: true };
      const note3 = {
        ...mockNote,
        id: "note_3",
        isPinned: true,
        isArchived: true,
      };
      const note4 = { ...mockNote, id: "note_4" };

      await db.notes.save(note1);
      await db.notes.save(note2);
      await db.notes.save(note3);
      await db.notes.save(note4);

      const all = await db.notes.getAll();
      expect(all).toHaveLength(4);

      const pinnedNotes = all.filter((n) => n.isPinned);
      const archivedNotes = all.filter((n) => n.isArchived);

      expect(pinnedNotes).toHaveLength(2);
      expect(archivedNotes).toHaveLength(2);
    });

    it("should preserve all note properties on update", async () => {
      await db.notes.save(mockNote);

      const updated = {
        ...mockNote,
        title: "Updated Title",
        bodyMarkdown: "Updated content with #newtag",
        tags: ["tag1", "tag2", "newtag"],
        isPinned: true,
        updatedAt: "2026-01-15T00:00:00Z",
      };

      await db.notes.save(updated);
      const note = await db.notes.get("note_1");

      expect(note?.title).toBe("Updated Title");
      expect(note?.bodyMarkdown).toContain("Updated content");
      expect(note?.tags).toContain("newtag");
      expect(note?.isPinned).toBe(true);
      expect(note?.createdAt).toBe(mockNote.createdAt); // Should preserve original
    });
  });

  describe("getActive", () => {
    it("should return only non-archived notes", async () => {
      const note1 = createMockNote("note_1", { isArchived: false });
      const note2 = createMockNote("note_2", { isArchived: true });
      const note3 = createMockNote("note_3", { isArchived: false });

      await db.notes.save(note1);
      await db.notes.save(note2);
      await db.notes.save(note3);

      const active = await db.notes.getActive();

      expect(active).toHaveLength(2);
      expect(active.map((n) => n.id)).toEqual(
        expect.arrayContaining(["note_1", "note_3"]),
      );
    });

    it("should return empty array when all notes are archived", async () => {
      const note1 = createMockNote("note_1", { isArchived: true });
      await db.notes.save(note1);

      const active = await db.notes.getActive();

      expect(active).toHaveLength(0);
    });
  });

  describe("getArchived", () => {
    it("should return only archived notes", async () => {
      const note1 = createMockNote("note_1", { isArchived: false });
      const note2 = createMockNote("note_2", { isArchived: true });
      const note3 = createMockNote("note_3", { isArchived: true });

      await db.notes.save(note1);
      await db.notes.save(note2);
      await db.notes.save(note3);

      const archived = await db.notes.getArchived();

      expect(archived).toHaveLength(2);
      expect(archived.map((n) => n.id)).toEqual(
        expect.arrayContaining(["note_2", "note_3"]),
      );
    });
  });

  describe("getPinned", () => {
    it("should return only pinned notes (excluding archived)", async () => {
      const note1 = createMockNote("note_1", {
        isPinned: true,
        isArchived: false,
      });
      const note2 = createMockNote("note_2", {
        isPinned: true,
        isArchived: true,
      });
      const note3 = createMockNote("note_3", {
        isPinned: false,
        isArchived: false,
      });

      await db.notes.save(note1);
      await db.notes.save(note2);
      await db.notes.save(note3);

      const pinned = await db.notes.getPinned();

      expect(pinned).toHaveLength(1);
      expect(pinned[0].id).toBe("note_1");
    });
  });

  describe("getByTag", () => {
    it("should return notes with specified tag", async () => {
      const note1 = createMockNote("note_1", { tags: ["work", "important"] });
      const note2 = createMockNote("note_2", { tags: ["personal"] });
      const note3 = createMockNote("note_3", { tags: ["work", "project"] });

      await db.notes.save(note1);
      await db.notes.save(note2);
      await db.notes.save(note3);

      const workNotes = await db.notes.getByTag("work");

      expect(workNotes).toHaveLength(2);
      expect(workNotes.map((n) => n.id)).toEqual(
        expect.arrayContaining(["note_1", "note_3"]),
      );
    });

    it("should exclude archived notes", async () => {
      const note1 = createMockNote("note_1", {
        tags: ["work"],
        isArchived: true,
      });
      const note2 = createMockNote("note_2", { tags: ["work"] });

      await db.notes.save(note1);
      await db.notes.save(note2);

      const workNotes = await db.notes.getByTag("work");

      expect(workNotes).toHaveLength(1);
      expect(workNotes[0].id).toBe("note_2");
    });
  });

  describe("getByAnyTag", () => {
    it("should return notes matching any of the specified tags", async () => {
      const note1 = createMockNote("note_1", { tags: ["work", "important"] });
      const note2 = createMockNote("note_2", { tags: ["personal"] });
      const note3 = createMockNote("note_3", { tags: ["project"] });

      await db.notes.save(note1);
      await db.notes.save(note2);
      await db.notes.save(note3);

      const notes = await db.notes.getByAnyTag(["work", "project"]);

      expect(notes).toHaveLength(2);
      expect(notes.map((n) => n.id)).toEqual(
        expect.arrayContaining(["note_1", "note_3"]),
      );
    });
  });

  describe("getAllTags", () => {
    it("should return all unique tags sorted alphabetically", async () => {
      const note1 = createMockNote("note_1", { tags: ["zebra", "apple"] });
      const note2 = createMockNote("note_2", { tags: ["banana", "apple"] });
      const note3 = createMockNote("note_3", { tags: ["cherry"] });

      await db.notes.save(note1);
      await db.notes.save(note2);
      await db.notes.save(note3);

      const tags = await db.notes.getAllTags();

      expect(tags).toEqual(["apple", "banana", "cherry", "zebra"]);
    });

    it("should return empty array when no notes have tags", async () => {
      const note1 = createMockNote("note_1", { tags: [] });
      await db.notes.save(note1);

      const tags = await db.notes.getAllTags();

      expect(tags).toHaveLength(0);
    });
  });

  describe("search", () => {
    it("should search in note title", async () => {
      const note1 = createMockNote("note_1", {
        title: "Important Meeting Notes",
      });
      const note2 = createMockNote("note_2", { title: "Shopping List" });

      await db.notes.save(note1);
      await db.notes.save(note2);

      const results = await db.notes.search("meeting");

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("note_1");
    });

    it("should search in note body", async () => {
      const note1 = createMockNote("note_1", {
        bodyMarkdown: "Discussion about project timeline",
      });
      const note2 = createMockNote("note_2", { bodyMarkdown: "Grocery list" });

      await db.notes.save(note1);
      await db.notes.save(note2);

      const results = await db.notes.search("timeline");

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("note_1");
    });

    it("should search in tags", async () => {
      const note1 = createMockNote("note_1", { tags: ["urgent", "work"] });
      const note2 = createMockNote("note_2", { tags: ["personal"] });

      await db.notes.save(note1);
      await db.notes.save(note2);

      const results = await db.notes.search("urgent");

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("note_1");
    });

    it("should be case insensitive", async () => {
      const note1 = createMockNote("note_1", { title: "Important Notes" });

      await db.notes.save(note1);

      const results = await db.notes.search("IMPORTANT");

      expect(results).toHaveLength(1);
    });

    it("should return active notes when query is empty", async () => {
      const note1 = createMockNote("note_1", { isArchived: false });
      const note2 = createMockNote("note_2", { isArchived: true });

      await db.notes.save(note1);
      await db.notes.save(note2);

      const results = await db.notes.search("");

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("note_1");
    });
  });

  describe("getSorted", () => {
    it("should sort by recent (default)", async () => {
      const note1 = createMockNote("note_1", {
        updatedAt: "2026-01-10T00:00:00Z",
      });
      const note2 = createMockNote("note_2", {
        updatedAt: "2026-01-15T00:00:00Z",
      });
      const note3 = createMockNote("note_3", {
        updatedAt: "2026-01-12T00:00:00Z",
      });

      await db.notes.save(note1);
      await db.notes.save(note2);
      await db.notes.save(note3);

      const sorted = await db.notes.getSorted();

      expect(sorted.map((n) => n.id)).toEqual(["note_2", "note_3", "note_1"]);
    });

    it("should sort alphabetically", async () => {
      const note1 = createMockNote("note_1", { title: "Zebra" });
      const note2 = createMockNote("note_2", { title: "Apple" });
      const note3 = createMockNote("note_3", { title: "Banana" });

      await db.notes.save(note1);
      await db.notes.save(note2);
      await db.notes.save(note3);

      const sorted = await db.notes.getSorted("alphabetical", "asc");

      expect(sorted.map((n) => n.title)).toEqual(["Apple", "Banana", "Zebra"]);
    });

    it("should sort by tag count", async () => {
      const note1 = createMockNote("note_1", { tags: ["a"] });
      const note2 = createMockNote("note_2", { tags: ["a", "b", "c"] });
      const note3 = createMockNote("note_3", { tags: ["a", "b"] });

      await db.notes.save(note1);
      await db.notes.save(note2);
      await db.notes.save(note3);

      const sorted = await db.notes.getSorted("tags");

      expect(sorted.map((n) => n.id)).toEqual(["note_2", "note_3", "note_1"]);
    });

    it("should sort by word count", async () => {
      const note1 = createMockNote("note_1", { bodyMarkdown: "one two" });
      const note2 = createMockNote("note_2", {
        bodyMarkdown: "one two three four five",
      });
      const note3 = createMockNote("note_3", { bodyMarkdown: "one two three" });

      await db.notes.save(note1);
      await db.notes.save(note2);
      await db.notes.save(note3);

      const sorted = await db.notes.getSorted("wordCount");

      expect(sorted.map((n) => n.id)).toEqual(["note_2", "note_3", "note_1"]);
    });

    it("should always place pinned notes first", async () => {
      const note1 = createMockNote("note_1", {
        title: "Zebra",
        isPinned: false,
      });
      const note2 = createMockNote("note_2", {
        title: "Apple",
        isPinned: true,
      });
      const note3 = createMockNote("note_3", {
        title: "Banana",
        isPinned: false,
      });

      await db.notes.save(note1);
      await db.notes.save(note2);
      await db.notes.save(note3);

      const sorted = await db.notes.getSorted("alphabetical", "asc");

      expect(sorted[0].id).toBe("note_2"); // Pinned note first
      expect(sorted.map((n) => n.title)).toEqual(["Apple", "Banana", "Zebra"]);
    });
  });

  describe("getStatistics", () => {
    it("should calculate comprehensive statistics", async () => {
      const note1 = createMockNote("note_1", {
        bodyMarkdown: "one two three",
        tags: ["work"],
        links: [],
        isPinned: true,
        isArchived: false,
      });
      const note2 = createMockNote("note_2", {
        bodyMarkdown: "four five",
        tags: ["personal", "important"],
        links: ["link1"],
        isPinned: false,
        isArchived: true,
      });
      const note3 = createMockNote("note_3", {
        bodyMarkdown: "six seven eight nine",
        tags: ["work"],
        links: ["link1", "link2"],
        isPinned: false,
        isArchived: false,
      });

      await db.notes.save(note1);
      await db.notes.save(note2);
      await db.notes.save(note3);

      const stats = await db.notes.getStatistics();

      expect(stats.totalNotes).toBe(3);
      expect(stats.activeNotes).toBe(2);
      expect(stats.archivedNotes).toBe(1);
      expect(stats.pinnedNotes).toBe(1);
      expect(stats.totalWords).toBe(9);
      expect(stats.averageWordsPerNote).toBe(3);
      expect(stats.uniqueTags).toBe(3); // work, personal, important
      expect(stats.totalTags).toBe(4); // 1 + 2 + 1
      expect(stats.notesWithTags).toBe(3);
      expect(stats.notesWithLinks).toBe(2);
    });

    it("should handle empty notes collection", async () => {
      const stats = await db.notes.getStatistics();

      expect(stats.totalNotes).toBe(0);
      expect(stats.averageWordsPerNote).toBe(0);
    });
  });

  describe("getWordCount", () => {
    it("should return word count for a note", async () => {
      const note = createMockNote("note_1", {
        bodyMarkdown: "This is a test with five words",
      });
      await db.notes.save(note);

      const count = await db.notes.getWordCount("note_1");

      expect(count).toBe(7);
    });

    it("should return 0 for non-existent note", async () => {
      const count = await db.notes.getWordCount("nonexistent");

      expect(count).toBe(0);
    });
  });

  describe("addTag", () => {
    it("should add a tag to a note", async () => {
      const note = createMockNote("note_1", { tags: ["existing"] });
      await db.notes.save(note);

      await db.notes.addTag("note_1", "newtag");

      const updated = await db.notes.get("note_1");
      expect(updated?.tags).toEqual(["existing", "newtag"]);
    });

    it("should not add duplicate tags", async () => {
      const note = createMockNote("note_1", { tags: ["existing"] });
      await db.notes.save(note);

      await db.notes.addTag("note_1", "existing");

      const updated = await db.notes.get("note_1");
      expect(updated?.tags).toEqual(["existing"]);
    });

    it("should update the updatedAt timestamp", async () => {
      const note = createMockNote("note_1", {
        updatedAt: "2026-01-14T00:00:00Z",
      });
      await db.notes.save(note);

      await db.notes.addTag("note_1", "newtag");

      const updated = await db.notes.get("note_1");
      expect(updated?.updatedAt).not.toBe("2026-01-14T00:00:00Z");
    });
  });

  describe("removeTag", () => {
    it("should remove a tag from a note", async () => {
      const note = createMockNote("note_1", { tags: ["tag1", "tag2", "tag3"] });
      await db.notes.save(note);

      await db.notes.removeTag("note_1", "tag2");

      const updated = await db.notes.get("note_1");
      expect(updated?.tags).toEqual(["tag1", "tag3"]);
    });

    it("should handle removing non-existent tag", async () => {
      const note = createMockNote("note_1", { tags: ["tag1"] });
      await db.notes.save(note);

      await db.notes.removeTag("note_1", "nonexistent");

      const updated = await db.notes.get("note_1");
      expect(updated?.tags).toEqual(["tag1"]);
    });
  });

  describe("bulkAddTags", () => {
    it("should add tags to multiple notes", async () => {
      const note1 = createMockNote("note_1", { tags: [] });
      const note2 = createMockNote("note_2", { tags: ["existing"] });
      const note3 = createMockNote("note_3", { tags: [] });

      await db.notes.save(note1);
      await db.notes.save(note2);
      await db.notes.save(note3);

      await db.notes.bulkAddTags(["note_1", "note_2"], ["new1", "new2"]);

      const updated1 = await db.notes.get("note_1");
      const updated2 = await db.notes.get("note_2");
      const updated3 = await db.notes.get("note_3");

      expect(updated1?.tags).toEqual(["new1", "new2"]);
      expect(updated2?.tags).toEqual(["existing", "new1", "new2"]);
      expect(updated3?.tags).toEqual([]); // Not in the list
    });
  });

  describe("bulkArchive", () => {
    it("should archive multiple notes", async () => {
      const note1 = createMockNote("note_1", { isArchived: false });
      const note2 = createMockNote("note_2", { isArchived: false });
      const note3 = createMockNote("note_3", { isArchived: false });

      await db.notes.save(note1);
      await db.notes.save(note2);
      await db.notes.save(note3);

      await db.notes.bulkArchive(["note_1", "note_2"], true);

      const updated1 = await db.notes.get("note_1");
      const updated2 = await db.notes.get("note_2");
      const updated3 = await db.notes.get("note_3");

      expect(updated1?.isArchived).toBe(true);
      expect(updated2?.isArchived).toBe(true);
      expect(updated3?.isArchived).toBe(false);
    });

    it("should unarchive multiple notes", async () => {
      const note1 = createMockNote("note_1", { isArchived: true });
      const note2 = createMockNote("note_2", { isArchived: true });

      await db.notes.save(note1);
      await db.notes.save(note2);

      await db.notes.bulkArchive(["note_1", "note_2"], false);

      const updated1 = await db.notes.get("note_1");
      const updated2 = await db.notes.get("note_2");

      expect(updated1?.isArchived).toBe(false);
      expect(updated2?.isArchived).toBe(false);
    });
  });

  describe("bulkPin", () => {
    it("should pin multiple notes", async () => {
      const note1 = createMockNote("note_1", { isPinned: false });
      const note2 = createMockNote("note_2", { isPinned: false });

      await db.notes.save(note1);
      await db.notes.save(note2);

      await db.notes.bulkPin(["note_1", "note_2"], true);

      const updated1 = await db.notes.get("note_1");
      const updated2 = await db.notes.get("note_2");

      expect(updated1?.isPinned).toBe(true);
      expect(updated2?.isPinned).toBe(true);
    });
  });

  describe("bulkDelete", () => {
    it("should delete multiple notes", async () => {
      const note1 = createMockNote("note_1");
      const note2 = createMockNote("note_2");
      const note3 = createMockNote("note_3");

      await db.notes.save(note1);
      await db.notes.save(note2);
      await db.notes.save(note3);

      await db.notes.bulkDelete(["note_1", "note_3"]);

      const all = await db.notes.getAll();

      expect(all).toHaveLength(1);
      expect(all[0].id).toBe("note_2");
    });
  });

  describe("findSimilar", () => {
    it("should find notes with similar content", async () => {
      const note1 = createMockNote("note_1", {
        bodyMarkdown: "This is about machine learning and AI",
      });
      const note2 = createMockNote("note_2", {
        bodyMarkdown: "Machine learning is a type of AI technology",
      });
      const note3 = createMockNote("note_3", {
        bodyMarkdown: "Cooking recipes for pasta",
      });

      await db.notes.save(note1);
      await db.notes.save(note2);
      await db.notes.save(note3);

      const similar = await db.notes.findSimilar("note_1", 0.3);

      expect(similar.length).toBeGreaterThan(0);
      expect(similar.map((n) => n.id)).toContain("note_2");
      expect(similar.map((n) => n.id)).not.toContain("note_3");
    });

    it("should not return the target note itself", async () => {
      const note1 = createMockNote("note_1", { bodyMarkdown: "content" });
      await db.notes.save(note1);

      const similar = await db.notes.findSimilar("note_1");

      expect(similar.map((n) => n.id)).not.toContain("note_1");
    });

    it("should return empty array for non-existent note", async () => {
      const similar = await db.notes.findSimilar("nonexistent");

      expect(similar).toHaveLength(0);
    });
  });
});
