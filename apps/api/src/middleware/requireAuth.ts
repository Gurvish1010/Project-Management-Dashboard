/**
 * Express middleware that protects API routes by validating a JWT.
 * Demonstrates protected API routes from the Day 29 backend requirements.
 */
import type { NextFunction, Request, Response } from "express";
import { verifyToken, type JwtUser } from "../lib/auth.js";

declare global {
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing authorization token." });
  }

  try {
    const token = header.replace("Bearer ", "");
    req.user = verifyToken(token);
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}
