/**
 * Server Test Helpers
 * 
 * Reusable utilities for setting up test servers.
 * Reduces duplication of server creation and teardown.
 * 
 * Related: TASK-089 (Test Helper Utilities)
 */

import express, { type Express } from "express";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { registerRoutes } from "../../routes";

/**
 * Set up JWT_SECRET for tests if not already set
 */
export function setupTestEnv() {
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = "test-jwt-secret-for-tests";
  }
}

/**
 * Create and start a test server
 * Returns the server instance and base URL
 */
export async function createTestServer(): Promise<{
  server: Server;
  baseUrl: string;
  app: Express;
}> {
  setupTestEnv();

  const app = express();
  app.use(express.json());

  const server = await registerRoutes(app);

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  return { server, baseUrl, app };
}

/**
 * Close a test server gracefully
 */
export async function closeTestServer(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

/**
 * Server setup/teardown helpers for Jest
 */
export function useTestServer() {
  let server: Server;
  let baseUrl: string;
  let app: Express;

  beforeAll(async () => {
    const result = await createTestServer();
    server = result.server;
    baseUrl = result.baseUrl;
    app = result.app;
  });

  afterAll(async () => {
    await closeTestServer(server);
  });

  return {
    getServer: () => server,
    getBaseUrl: () => baseUrl,
    getApp: () => app,
  };
}
