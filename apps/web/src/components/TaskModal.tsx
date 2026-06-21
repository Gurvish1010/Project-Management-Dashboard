/**
 * Task detail modal for editing task fields and adding comments.
 * CONCEPT: AnimatePresence - modal enters and exits smoothly.
 * CONCEPT: layoutId - links the modal container to the selected task idea.
 * CONCEPT: Accessibility - dialog role and labelled controls support screen readers.
 */
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { api } from "@/lib/api";
import type { Priority, Task } from "@/lib/types";

export function TaskModal({
  task,
  token,
  projectId,
  onClose
}: {
  task: Task;
  token: string;
  projectId: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate?.slice(0, 10) ?? "");
  const [comment, setComment] = useState("");

  const refreshBoard = () => queryClient.invalidateQueries({ queryKey: ["board", projectId] });

  const updateTask = useMutation({
    mutationFn: () =>
      api.updateTask(token, task.id, {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null
      } as Partial<Task>),
    onSuccess: refreshBoard
  });

  const addComment = useMutation({
    mutationFn: () => api.addComment(token, task.id, { body: comment }),
    onSuccess: () => {
      setComment("");
      refreshBoard();
    }
  });

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={onClose}
    >
      <motion.section
        className="modal form-grid"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        layoutId={`task-${task.id}`}
        initial={{ scale: 0.96, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 16 }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="spread">
          <h2 id="task-modal-title">Task details</h2>
          <button className="button secondary" onClick={onClose} aria-label="Close task details">
            Close
          </button>
        </div>
        <label>
          Title
          <input className="input" aria-label="Task title" value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label>
          Description
          <textarea className="textarea" aria-label="Task description" value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>
        <div className="row">
          <label style={{ flex: 1 }}>
            Priority
            <select className="select" aria-label="Task priority" value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </label>
          <label style={{ flex: 1 }}>
            Due date
            <input className="input" aria-label="Task due date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </label>
        </div>
        <p className="muted">Assignee: {task.assignee?.name ?? "Unassigned"}</p>
        <button className="button" onClick={() => updateTask.mutate()} aria-label="Save task">
          {updateTask.isPending ? "Saving..." : "Save task"}
        </button>
        <h3>Comments</h3>
        {task.comments.length === 0 && <p className="muted">No comments yet.</p>}
        {task.comments.map((item) => (
          <div className="panel" key={item.id}>
            <strong>{item.author.name}</strong>
            <p>{item.body}</p>
          </div>
        ))}
        <form
          className="form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            addComment.mutate();
          }}
        >
          <input
            className="input"
            aria-label="New comment"
            placeholder="Add a comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
          <button className="button secondary" aria-label="Add comment">{addComment.isPending ? "Adding..." : "Add comment"}</button>
        </form>
      </motion.section>
    </motion.div>
  );
}
