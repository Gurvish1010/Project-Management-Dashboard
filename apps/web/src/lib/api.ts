/**
 * Small API client used by React Query hooks and forms.
 * Demonstrates server-state calls while keeping fetch details in one file.
 */
import type { AuthResponse, Board, Comment, Project, Task } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed." }));
    throw new Error(error.message);
  }

  return response.json() as Promise<T>;
}

export const api = {
  register: (body: { name: string; email: string; password: string }) =>
    request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  getProjects: (token: string) => request<Project[]>("/projects", {}, token),
  createProject: (token: string, body: { name: string; description: string }) =>
    request<Project>("/projects", { method: "POST", body: JSON.stringify(body) }, token),
  getBoard: (token: string, projectId: string) =>
    request<{ project: Project; board: Board }>(`/boards/project/${projectId}`, {}, token),
  createTask: (token: string, body: { columnId: string; title: string; description: string }) =>
    request<Task>("/tasks", { method: "POST", body: JSON.stringify(body) }, token),
  updateTask: (token: string, taskId: string, body: Partial<Task>) =>
    request<Task>(`/tasks/${taskId}`, { method: "PATCH", body: JSON.stringify(body) }, token),
  addComment: (token: string, taskId: string, body: { body: string }) =>
    request<Comment>(`/tasks/${taskId}/comments`, { method: "POST", body: JSON.stringify(body) }, token)
};
