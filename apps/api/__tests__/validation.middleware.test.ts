import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../middleware/errorHandler";
import { validate } from "../middleware/validation";

type NextCollector = NextFunction & { calls: unknown[] };

const createNext = (): NextCollector => {
  const collector = ((error?: unknown) => {
    collector.calls.push(error);
  }) as NextCollector;
  collector.calls = [];
  return collector;
};

const createRequest = (body: unknown): Request => ({ body }) as Request;

const response = {} as Response;

describe("validate middleware", () => {
  it("calls next without error for valid payloads", () => {
    const schema = z.object({ name: z.string().min(1) });
    const next = createNext();
    const handler = validate(schema);

    handler(createRequest({ name: "AIOS" }), response, next);

    expect(next.calls).toEqual([undefined]);
  });

  it("passes an AppError for invalid payloads", () => {
    const schema = z.object({ name: z.string().min(3) });
    const next = createNext();
    const handler = validate(schema);

    handler(createRequest({ name: "AI" }), response, next);

    expect(next.calls).toHaveLength(1);
    const [error] = next.calls;
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).statusCode).toBe(400);
  });
});
