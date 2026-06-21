/**
 * Wraps async Express route handlers so database errors return JSON instead of crashing Node.
 * This makes setup problems, such as PostgreSQL not running, easier to understand in the browser.
 */
import type { NextFunction, Request, Response } from "express";

type AsyncRoute = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export function asyncHandler(route: AsyncRoute) {
  return (req: Request, res: Response, next: NextFunction) => {
    route(req, res, next).catch(next);
  };
}
