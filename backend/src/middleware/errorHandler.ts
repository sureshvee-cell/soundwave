import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../config/logger";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message:    string,
    public code?:      string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors:  err.errors.map(e => ({ field: e.path.join("."), message: e.message })),
    });
  }

  // Known application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code:    err.code,
    });
  }

  // Prisma unique constraint violation
  if ((err as { code?: string }).code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "Resource already exists",
    });
  }

  // Unknown errors
  logger.error("Unhandled error:", err);
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
}
