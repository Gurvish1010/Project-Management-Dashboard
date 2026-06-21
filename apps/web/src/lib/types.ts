/**
 * Shared frontend TypeScript types matching the API response shape.
 * Demonstrates clean client architecture with reusable data contracts.
 */
export type Priority = "LOW" | "MEDIUM" | "HIGH";

export type User = {
  id: string;
  name: string;
  email: string;
};

export type Comment = {
  id: string;
  body: string;
  author: User;
  createdAt: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string | null;
  position: number;
  columnId: string;
  assignee: User | null;
  comments: Comment[];
};

export type BoardColumn = {
  id: string;
  title: string;
  position: number;
  tasks: Task[];
};

export type Board = {
  id: string;
  name: string;
  columns: BoardColumn[];
};

export type Project = {
  id: string;
  name: string;
  description: string;
  board: Board | null;
  createdAt: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};
