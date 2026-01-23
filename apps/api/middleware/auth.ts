import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./errorHandler";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Warn in production if using default secret
if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  console.error(
    "WARNING: Using default JWT_SECRET in production! Set JWT_SECRET environment variable.",
  );
}

const JWT_EXPIRES_IN = "7d";

export interface JWTPayload {
  userId: string;
  username: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    throw new AppError(401, "Invalid or expired token");
  }
};

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(401, "No token provided");
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
};
