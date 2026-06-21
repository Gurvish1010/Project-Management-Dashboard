/**
 * Small board helpers kept outside components for easy testing.
 * CONCEPT: Clean code - pure functions make integration behavior easier to verify.
 */
import type { BoardColumn, Task } from "@/lib/types";

export function filterColumns(columns: BoardColumn[], search: string) {
  const loweredSearch = search.toLowerCase();

  return columns.map((column) => ({
    ...column,
    tasks: column.tasks.filter((task) =>
      `${task.title} ${task.description} ${task.priority}`.toLowerCase().includes(loweredSearch)
    )
  }));
}

export function findNextColumnId(columns: BoardColumn[], currentColumnId: string, direction: "left" | "right") {
  const currentIndex = columns.findIndex((column) => column.id === currentColumnId);
  const nextIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;

  return columns[nextIndex]?.id ?? null;
}

export function getTaskCount(columns: BoardColumn[]) {
  return columns.reduce((total, column) => total + column.tasks.length, 0);
}

export function moveTaskLocally(columns: BoardColumn[], task: Task, targetColumnId: string) {
  return columns.map((column) => {
    if (column.id === task.columnId) {
      return { ...column, tasks: column.tasks.filter((item) => item.id !== task.id) };
    }

    if (column.id === targetColumnId) {
      return { ...column, tasks: [{ ...task, columnId: targetColumnId }, ...column.tasks] };
    }

    return column;
  });
}
