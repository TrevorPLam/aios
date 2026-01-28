import { randomUUID } from "crypto";
import type { Note } from "@aios/contracts/schema";

const notes = new Map<string, Note>();

export const notesData = {
  async getNotes(userId: string): Promise<Note[]> {
    return Array.from(notes.values()).filter((note) => note.userId === userId);
  },

  async getNote(id: string, userId: string): Promise<Note | undefined> {
    const note = notes.get(id);
    return note?.userId === userId ? note : undefined;
  },

  async createNote(
    note: Omit<Note, "id" | "createdAt" | "updatedAt">,
  ): Promise<Note> {
    const id = randomUUID();
    const now = new Date();
    const newNote: Note = {
      ...note,
      id,
      createdAt: now,
      updatedAt: now,
    };
    notes.set(id, newNote);
    return newNote;
  },

  async updateNote(
    id: string,
    userId: string,
    updates: Partial<Note>,
  ): Promise<Note | undefined> {
    const note = notes.get(id);
    if (!note || note.userId !== userId) return undefined;

    const updated = { ...note, ...updates, updatedAt: new Date() };
    notes.set(id, updated);
    return updated;
  },

  async deleteNote(id: string, userId: string): Promise<boolean> {
    const note = notes.get(id);
    if (!note || note.userId !== userId) return false;
    return notes.delete(id);
  },
};
