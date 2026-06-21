/**
 * Board page with Kanban columns, draggable tasks, and task modal.
 * CONCEPT: dnd-kit - DndContext handles drag end events.
 * CONCEPT: AnimatePresence - task modal is animated when mounted/unmounted.
 * CONCEPT: Real-time updates - WebSocket events refresh this board for all users.
 */
"use client";

import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { BoardColumn } from "@/components/BoardColumn";
import { PageShell } from "@/components/PageShell";
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/StatusViews";
import { TaskModal } from "@/components/TaskModal";
import { useBoardRealtime } from "@/hooks/useBoardRealtime";
import { api } from "@/lib/api";
import { filterColumns, findNextColumnId } from "@/lib/boardUtils";
import type { Task } from "@/lib/types";
import { useAuthStore } from "@/store/useAuthStore";

export default function BoardPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  // CONCEPT: useState - storing a simple board search term for task filtering.
  const [search, setSearch] = useState("");
  const refreshBoard = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["board", projectId] });
  }, [projectId, queryClient]);
  const realtimeStatus = useBoardRealtime(projectId, Boolean(token && projectId), refreshBoard);

  useEffect(() => {
    if (hasHydrated && !token) {
      router.push("/");
    }
  }, [hasHydrated, router, token]);

  const boardQuery = useQuery({
    queryKey: ["board", projectId],
    queryFn: () => api.getBoard(token!, projectId),
    enabled: Boolean(token && projectId)
  });

  const moveTask = useMutation({
    mutationFn: ({ task, columnId }: { task: Task; columnId: string }) =>
      api.updateTask(token!, task.id, { columnId, position: 0 } as Partial<Task>),
    onSuccess: refreshBoard
  });

  function handleDragEnd(event: DragEndEvent) {
    const task = event.active.data.current?.task as Task | undefined;
    const targetColumnId = event.over?.id?.toString();

    if (!task || !targetColumnId || task.columnId === targetColumnId) {
      return;
    }

    moveTask.mutate({ task, columnId: targetColumnId });
  }

  function handleKeyboardMove(task: Task, direction: "left" | "right") {
    const targetColumnId = findNextColumnId(boardQuery.data?.board.columns ?? [], task.columnId, direction);

    if (targetColumnId) {
      moveTask.mutate({ task, columnId: targetColumnId });
    }
  }

  const filteredColumns = boardQuery.data ? filterColumns(boardQuery.data.board.columns, search) : [];
  const visibleTaskCount = filteredColumns.reduce((total, column) => total + column.tasks.length, 0);

  return (
    <PageShell>
      <div className="shell">
        <AppHeader />
        <div className="spread" style={{ marginBottom: 18 }}>
          <div>
            <Link className="button secondary" href="/projects">
              Back to projects
            </Link>
            <h1>{boardQuery.data?.project.name ?? "Board"}</h1>
            <p className="muted">{boardQuery.data?.project.description}</p>
          </div>
          <span className={`status-pill ${realtimeStatus}`} aria-label={`Real-time status is ${realtimeStatus}`}>
            {realtimeStatus === "live" ? "Live updates on" : "Connecting live updates"}
          </span>
        </div>
        <input
          className="input"
          aria-label="Search tasks"
          placeholder="Search tasks"
          style={{ marginBottom: 18 }}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {boardQuery.isLoading && <LoadingSkeleton label="Loading board" />}
        {boardQuery.error && <ErrorState message={boardQuery.error.message} onRetry={() => boardQuery.refetch()} />}
        {boardQuery.data && token && (
          <>
            {visibleTaskCount === 0 && search && (
              <EmptyState title="No matching tasks" body="Try a different search or add a new task to a column below." />
            )}
            <DndContext onDragEnd={handleDragEnd}>
              <section className="board" aria-label="Kanban board">
                {filteredColumns.map((column) => (
                  <BoardColumn
                    key={column.id}
                    column={column}
                    token={token}
                    onTaskCreated={refreshBoard}
                    onOpenTask={setSelectedTask}
                    onKeyboardMove={handleKeyboardMove}
                  />
                ))}
              </section>
            </DndContext>
          </>
        )}
      </div>
      <AnimatePresence>
        {selectedTask && token && (
          <TaskModal task={selectedTask} token={token} projectId={projectId} onClose={() => setSelectedTask(null)} />
        )}
      </AnimatePresence>
    </PageShell>
  );
}
