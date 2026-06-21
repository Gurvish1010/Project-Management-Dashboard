/**
 * Central Express error handler.
 * It keeps backend errors visible as JSON responses during development.
 */
import type { NextFunction, Request, Response } from "express";

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error(error);

  const message = error instanceof Error ? error.message : "Unexpected server error.";

  return res.status(500).json({
    message: "API error. Check that PostgreSQL is running and migrations/seeds completed.",
    detail: process.env.NODE_ENV === "production" ? undefined : message
  });
}
