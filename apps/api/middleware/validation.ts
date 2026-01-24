import type { Request, Response, NextFunction } from "express";
import { ZodError, type ZodTypeAny } from "zod";
import { fromZodError } from "zod-validation-error";
import { AppError } from "./errorHandler";

const handleValidationError = (error: unknown): AppError => {
  if (error instanceof ZodError) {
    const validationError = fromZodError(error);
    return new AppError(400, validationError.message);
  }
  return new AppError(400, "Invalid request payload");
};

export const validate = (schema: ZodTypeAny) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: unknown) {
      next(handleValidationError(error));
    }
  };
};

export const validateQuery = (schema: ZodTypeAny) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error: unknown) {
      next(handleValidationError(error));
    }
  };
};

export const validateParams = (schema: ZodTypeAny) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error: unknown) {
      next(handleValidationError(error));
    }
  };
};
