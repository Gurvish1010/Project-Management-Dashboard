/**
 * Draggable task card used inside Kanban columns.
 * CONCEPT: dnd-kit - useDraggable makes each task movable.
 * CONCEPT: Animation performance - transform is GPU-friendly for dragging.
 * CONCEPT: Accessibility - cards support keyboard movement with arrow keys.
 */
"use client";

import { useDraggable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import type { Task } from "@/lib/types";

export function TaskCard({
  task,
  onOpen,
  onKeyboardMove
}: {
  task: Task;
  onOpen: (task: Task) => void;
  onKeyboardMove: (task: Task, direction: "left" | "right") => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task }
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.65 : 1
      }
    : undefined;

  return (
    <motion.article
      ref={setNodeRef}
      className="task"
      style={style}
      {...listeners}
      {...attributes}
      tabIndex={0}
      role="button"
      aria-label={`${task.title}, ${task.priority} priority. Press Enter for details or arrow keys to move columns.`}
      layout
      whileHover={{ scale: 1.01 }}
      onDoubleClick={() => onOpen(task)}
      onKeyDown={(event) => {
        // CONCEPT: Keyboard navigation - Enter opens details, arrows move cards between columns.
        if (event.key === "Enter") onOpen(task);
        if (event.key === "ArrowLeft") onKeyboardMove(task, "left");
        if (event.key === "ArrowRight") onKeyboardMove(task, "right");
      }}
    >
      <div className="spread">
        <strong>{task.title}</strong>
        <span>{task.priority}</span>
      </div>
      <p className="muted">{task.description}</p>
      <button className="button secondary" type="button" onClick={() => onOpen(task)} aria-label={`Open ${task.title} details`}>
        Details
      </button>
    </motion.article>
  );
}
