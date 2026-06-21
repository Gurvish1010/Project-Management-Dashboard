/**
 * Task routes update cards and add comments.
 * Demonstrates task detail modal persistence and Kanban drag-and-drop updates.
 * CONCEPT: Real-time updates - each write broadcasts the changed board to connected clients.
 */
import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/asyncHandler.js";
import { prisma } from "../lib/prisma.js";
import { broadcastBoardUpdate } from "../lib/realtime.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const tasksRouter = Router();

tasksRouter.use(requireAuth);

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  dueDate: z.string().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  columnId: z.string().optional(),
  position: z.number().int().optional()
});

const commentSchema = z.object({
  body: z.string().min(1)
});

tasksRouter.post("/", asyncHandler(async (req, res) => {
  const schema = z.object({
    columnId: z.string(),
    title: z.string().min(1),
    description: z.string().min(1)
  });
  const parsed = schema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Column, title, and description are required." });
  }

  const column = await prisma.column.findUnique({
    where: { id: parsed.data.columnId },
    include: { board: { select: { projectId: true } } }
  });

  if (!column) {
    return res.status(404).json({ message: "Column not found." });
  }

  const taskCount = await prisma.task.count({ where: { columnId: parsed.data.columnId } });
  const task = await prisma.task.create({
    data: {
      columnId: parsed.data.columnId,
      title: parsed.data.title,
      description: parsed.data.description,
      position: taskCount
    },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      comments: { include: { author: { select: { id: true, name: true, email: true } } } }
    }
  });

  broadcastBoardUpdate({ type: "BOARD_UPDATED", projectId: column.board.projectId, reason: "task-created" });

  return res.status(201).json(task);
}));

tasksRouter.patch("/:taskId", asyncHandler(async (req, res) => {
  const taskId = String(req.params.taskId);
  const parsed = updateTaskSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid task update." });
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...parsed.data,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : parsed.data.dueDate
    },
    include: {
      column: { include: { board: { select: { projectId: true } } } },
      assignee: { select: { id: true, name: true, email: true } },
      comments: {
        include: { author: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  broadcastBoardUpdate({ type: "BOARD_UPDATED", projectId: task.column.board.projectId, reason: "task-updated" });

  return res.json(task);
}));

tasksRouter.post("/:taskId/comments", asyncHandler(async (req, res) => {
  const taskId = String(req.params.taskId);
  const parsed = commentSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Comment cannot be empty." });
  }

  const comment = await prisma.comment.create({
    data: {
      body: parsed.data.body,
      taskId,
      authorId: req.user!.id
    },
    include: {
      author: { select: { id: true, name: true, email: true } },
      task: { include: { column: { include: { board: { select: { projectId: true } } } } } }
    }
  });

  broadcastBoardUpdate({ type: "BOARD_UPDATED", projectId: comment.task.column.board.projectId, reason: "comment-created" });

  return res.status(201).json(comment);
}));
