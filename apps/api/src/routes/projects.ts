/**
 * Project routes for listing and creating projects.
 * Demonstrates the Projects page API requirement and automatic board setup.
 */
import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/asyncHandler.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const projectsRouter = Router();

const projectSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(1)
});

projectsRouter.use(requireAuth);

projectsRouter.get("/", asyncHandler(async (req, res) => {
  const projects = await prisma.project.findMany({
    where: { ownerId: req.user!.id },
    include: {
      board: {
        include: {
          columns: {
            include: { tasks: true },
            orderBy: { position: "asc" }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return res.json(projects);
}));

projectsRouter.post("/", asyncHandler(async (req, res) => {
  const parsed = projectSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Project name and description are required." });
  }

  const project = await prisma.project.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      ownerId: req.user!.id,
      board: {
        create: {
          name: `${parsed.data.name} Board`,
          columns: {
            create: [
              { title: "Todo", position: 0 },
              { title: "In Progress", position: 1 },
              { title: "Done", position: 2 }
            ]
          }
        }
      }
    },
    include: {
      board: {
        include: {
          columns: {
            include: { tasks: true },
            orderBy: { position: "asc" }
          }
        }
      }
    }
  });

  return res.status(201).json(project);
}));
