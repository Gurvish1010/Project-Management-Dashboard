/**
 * Kanban column that accepts dropped tasks and renders task cards.
 * CONCEPT: dnd-kit - useDroppable marks a column as a task drop target.
 * CONCEPT: Layout animations - task cards use layout animation when the list changes.
 * CONCEPT: Empty states - each column explains when no tasks match.
 */
"use client";

import { useDroppable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { useState } from "react";
import { api } from "@/lib/api";
import type { BoardColumn as BoardColumnType, Task } from "@/lib/types";

export function BoardColumn({
  column,
  token,
  onTaskCreated,
  onOpenTask,
  onKeyboardMove
}: {
  column: BoardColumnType;
  token: string;
  onTaskCreated: () => void;
  onOpenTask: (task: Task) => void;
  onKeyboardMove: (task: Task, direction: "left" | "right") => void;
}) {
  const [title, setTitle] = useState("");
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  async function handleCreateTask(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;

    await api.createTask(token, {
      columnId: column.id,
      title,
      description: "New task description"
    });
    setTitle("");
    onTaskCreated();
  }

  return (
    <section
      ref={setNodeRef}
      className="column"
      style={{ outline: isOver ? "2px solid #2563eb" : "none" }}
      aria-label={`${column.title} column`}
    >
      <div className="spread">
        <h2>{column.title}</h2>
        <span className="muted">{column.tasks.length}</span>
      </div>
      <motion.div className="task-list" layout>
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} onOpen={onOpenTask} onKeyboardMove={onKeyboardMove} />
        ))}
        {column.tasks.length === 0 && <p className="empty-column">No tasks here yet.</p>}
      </motion.div>
      <form className="form-grid" onSubmit={handleCreateTask} style={{ marginTop: 12 }}>
        <input
          className="input"
          aria-label={`New task title for ${column.title}`}
          placeholder="Add task"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <button className="button secondary" aria-label={`Add task to ${column.title}`}>
          Add
        </button>
      </form>
    </section>
  );
}

import { TaskCard } from "@/components/TaskCard";
