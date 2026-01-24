/**
 * API End-to-End Tests
 *
 * Validates a full auth → notes workflow against the in-memory server.
 * Focuses on non-UI flows to stay safe during the ongoing refactor.
 *
 * Token optimization: Read multiple files in parallel when possible
 */

// Set JWT_SECRET before importing routes
import express from "express";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { registerRoutes } from "../routes";

process.env.JWT_SECRET = "test-jwt-secret-for-e2e-tests";

describe("API E2E", () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    const app = express();
    app.use(express.json());

    server = await registerRoutes(app);

    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => resolve());
    });

    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        resolve();
      });
    });
  });

  it("registers a user and completes a notes workflow", async () => {
    const username = `e2e_user_${Date.now()}`;
    const password = "password123";

    const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    expect(registerResponse.ok).toBe(true);

    const registerPayload = await registerResponse.json();
    const token = registerPayload.token as string;

    const authHeaders = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const notePayload = {
      title: "E2E Note",
      bodyMarkdown: "Hello from E2E test.",
      tags: ["e2e"],
      links: [],
    };

    const createNoteResponse = await fetch(`${baseUrl}/api/notes`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(notePayload),
    });

    expect(createNoteResponse.ok).toBe(true);
    const createdNote = await createNoteResponse.json();

    const getNotesResponse = await fetch(`${baseUrl}/api/notes`, {
      headers: authHeaders,
    });

    expect(getNotesResponse.ok).toBe(true);
    const notes = await getNotesResponse.json();
    expect(notes).toHaveLength(1);

    const updateNoteResponse = await fetch(
      `${baseUrl}/api/notes/${createdNote.id}`,
      {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ title: "Updated E2E Note" }),
      },
    );

    expect(updateNoteResponse.ok).toBe(true);
    const updatedNote = await updateNoteResponse.json();
    expect(updatedNote.title).toBe("Updated E2E Note");

    const deleteNoteResponse = await fetch(
      `${baseUrl}/api/notes/${createdNote.id}`,
      {
        method: "DELETE",
        headers: authHeaders,
      },
    );

    expect(deleteNoteResponse.status).toBe(204);
  });
});
