/**
 * Seeds a demo user, project, board, columns, tasks, and comments.
 * Demonstrates the complete database model with easy data for learning.
 */
import { Priority } from "@prisma/client";
import { hashPassword } from "../src/lib/auth.js";
import { prisma } from "../src/lib/prisma.js";

async function main() {
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.column.deleteMany();
  await prisma.board.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const demoUser = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@example.com",
      passwordHash: await hashPassword("DemoPass!2026")
    }
  });

  await prisma.project.create({
    data: {
      name: "Website Redesign",
      description: "Plan and track the first version of a project dashboard.",
      ownerId: demoUser.id,
      board: {
        create: {
          name: "Website Redesign Board",
          columns: {
            create: [
              {
                title: "Todo",
                position: 0,
                tasks: {
                  create: [
                    {
                      title: "Create wireframes",
                      description: "Sketch the main screens before coding.",
                      priority: Priority.HIGH,
                      position: 0,
                      assigneeId: demoUser.id,
                      comments: {
                        create: {
                          body: "Keep the layout simple for Day 29.",
                          authorId: demoUser.id
                        }
                      }
                    },
                    {
                      title: "Define Prisma schema",
                      description: "Model users, projects, boards, columns, tasks, and comments.",
                      priority: Priority.MEDIUM,
                      position: 1,
                      assigneeId: demoUser.id
                    }
                  ]
                }
              },
              {
                title: "In Progress",
                position: 1,
                tasks: {
                  create: [
                    {
                      title: "Build Kanban view",
                      description: "Render columns and support moving tasks between columns.",
                      priority: Priority.HIGH,
                      position: 0,
                      assigneeId: demoUser.id
                    }
                  ]
                }
              },
              {
                title: "Done",
                position: 2,
                tasks: {
                  create: [
                    {
                      title: "Create monorepo structure",
                      description: "Set up apps/api and apps/web.",
                      priority: Priority.LOW,
                      position: 0,
                      assigneeId: demoUser.id
                    }
                  ]
                }
              }
            ]
          }
        }
      }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
