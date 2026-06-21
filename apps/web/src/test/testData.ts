/**
 * Test data builders for reusable board fixtures.
 * CONCEPT: Comprehensive tests - shared fixtures keep tests focused on behavior.
 */
import type { BoardColumn, Project, Task } from "@/lib/types";

export const task: Task = {
  id: "task-1",
  title: "Write README",
  description: "Add screenshots and setup guide",
  priority: "HIGH",
  dueDate: null,
  position: 0,
  columnId: "todo",
  assignee: null,
  comments: []
};

export const columns: BoardColumn[] = [
  { id: "todo", title: "Todo", position: 0, tasks: [task] },
  { id: "doing", title: "In Progress", position: 1, tasks: [] },
  { id: "done", title: "Done", position: 2, tasks: [] }
];

export const project: Project = {
  id: "project-1",
  name: "Portfolio Sprint",
  description: "Ship the capstone dashboard",
  board: { id: "board-1", name: "Main Board", columns },
  createdAt: "2026-06-21T00:00:00.000Z"
};
