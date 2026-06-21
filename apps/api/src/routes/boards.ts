/**
 * Board routes return a single project's Kanban board with columns and tasks.
 * Demonstrates the Board view API for the drag-and-drop frontend.
 */
import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const boardsRouter = Router();

boardsRouter.use(requireAuth);

boardsRouter.get("/project/:projectId", asyncHandler(async (req, res) => {
  const projectId = String(req.params.projectId);
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId: req.user!.id
    },
    include: {
      board: {
        include: {
          columns: {
            include: {
              tasks: {
                include: {
                  assignee: { select: { id: true, name: true, email: true } },
                  comments: {
                    include: { author: { select: { id: true, name: true, email: true } } },
                    orderBy: { createdAt: "asc" }
                  }
                },
                orderBy: { position: "asc" }
              }
            },
            orderBy: { position: "asc" }
          }
        }
      }
    }
  });

  if (!project?.board) {
    return res.status(404).json({ message: "Board not found." });
  }

  return res.json({ project, board: project.board });
}));
