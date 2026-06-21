/**
 * Component tests for the most important visible UI pieces.
 * CONCEPT: Comprehensive tests - covers 10+ component behaviors for Day 30.
 */
import { DndContext } from "@dnd-kit/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AuthForm } from "@/components/AuthForm";
import { BoardColumn } from "@/components/BoardColumn";
import { CreateProjectForm } from "@/components/CreateProjectForm";
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/StatusViews";
import { ProjectCard } from "@/components/ProjectCard";
import { TaskCard } from "@/components/TaskCard";
import { TaskModal } from "@/components/TaskModal";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { columns, project, task } from "@/test/testData";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() })
}));

function renderWithQuery(children: ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>);
}

describe("component polish", () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: "token",
      user: { id: "user-1", name: "Demo User", email: "demo@example.com" },
      hasHydrated: true
    });
  });

  test("LoadingSkeleton announces busy loading", () => {
    render(<LoadingSkeleton label="Loading board" />);
    expect(screen.getByLabelText("Loading board")).toHaveAttribute("aria-busy", "true");
  });

  test("ErrorState shows a retry button", async () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Network failed" onRetry={onRetry} />);
    await userEvent.click(screen.getByRole("button", { name: /try loading again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test("EmptyState renders helpful copy", () => {
    render(<EmptyState title="No projects yet" body="Create your first project." />);
    expect(screen.getByText("No projects yet")).toBeInTheDocument();
    expect(screen.getByText("Create your first project.")).toBeInTheDocument();
  });

  test("ProjectCard links to the board", () => {
    render(<ProjectCard project={project} />);
    expect(screen.getByRole("link", { name: /open portfolio sprint board/i })).toHaveAttribute("href", "/board/project-1");
  });

  test("TaskCard opens details with Enter", () => {
    const onOpen = vi.fn();
    render(
      <DndContext>
        <TaskCard task={task} onOpen={onOpen} onKeyboardMove={vi.fn()} />
      </DndContext>
    );
    fireEvent.keyDown(screen.getByLabelText(/press enter for details/i), { key: "Enter" });
    expect(onOpen).toHaveBeenCalledWith(task);
  });

  test("TaskCard moves with arrow keys", () => {
    const onKeyboardMove = vi.fn();
    render(
      <DndContext>
        <TaskCard task={task} onOpen={vi.fn()} onKeyboardMove={onKeyboardMove} />
      </DndContext>
    );
    fireEvent.keyDown(screen.getByLabelText(/press enter for details/i), { key: "ArrowRight" });
    expect(onKeyboardMove).toHaveBeenCalledWith(task, "right");
  });

  test("BoardColumn renders task count and empty state", () => {
    render(
      <DndContext>
        <BoardColumn column={columns[1]} token="token" onTaskCreated={vi.fn()} onOpenTask={vi.fn()} onKeyboardMove={vi.fn()} />
      </DndContext>
    );
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("No tasks here yet.")).toBeInTheDocument();
  });

  test("BoardColumn creates a task", async () => {
    const onTaskCreated = vi.fn();
    vi.spyOn(api, "createTask").mockResolvedValue(task);
    render(
      <DndContext>
        <BoardColumn column={columns[1]} token="token" onTaskCreated={onTaskCreated} onOpenTask={vi.fn()} onKeyboardMove={vi.fn()} />
      </DndContext>
    );
    await userEvent.type(screen.getByLabelText(/new task title/i), "Review tests");
    await userEvent.click(screen.getByRole("button", { name: /add task/i }));
    expect(api.createTask).toHaveBeenCalled();
  });

  test("CreateProjectForm submits project data", async () => {
    vi.spyOn(api, "createProject").mockResolvedValue(project);
    renderWithQuery(<CreateProjectForm />);
    await userEvent.type(screen.getByLabelText("Project name"), "Capstone");
    await userEvent.type(screen.getByLabelText("Project description"), "Final polish");
    await userEvent.click(screen.getByRole("button", { name: /create project/i }));
    expect(api.createProject).toHaveBeenCalledWith("token", { name: "Capstone", description: "Final polish" });
  });

  test("AuthForm can switch to register mode", async () => {
    renderWithQuery(<AuthForm />);
    await userEvent.click(screen.getByRole("button", { name: /switch authentication mode/i }));
    expect(screen.getByRole("heading", { name: /create account/i })).toBeInTheDocument();
  });

  test("TaskModal shows no comments empty state", () => {
    renderWithQuery(<TaskModal task={task} token="token" projectId="project-1" onClose={vi.fn()} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("No comments yet.")).toBeInTheDocument();
  });
});
