import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { fromZodError } from "zod-validation-error";
import { AppError } from "./errorHandler";

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      const validationError = fromZodError(error);
      next(new AppError(400, validationError.message));
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error: any) {
      const validationError = fromZodError(error);
      next(new AppError(400, validationError.message));
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error: any) {
      const validationError = fromZodError(error);
      next(new AppError(400, validationError.message));
    }
  };
};
