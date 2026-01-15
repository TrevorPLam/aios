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
});
