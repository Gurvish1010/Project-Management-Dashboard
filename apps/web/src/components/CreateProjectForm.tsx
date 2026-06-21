/**
 * Small form for creating projects.
 * CONCEPT: React Query mutations - create a project, then refresh the project list.
 */
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

export function CreateProjectForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  const createProject = useMutation({
    mutationFn: () => api.createProject(token!, { name, description }),
    onSuccess: () => {
      setName("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
  });

  return (
    <form
      className="panel form-grid"
      onSubmit={(event) => {
        event.preventDefault();
        createProject.mutate();
      }}
    >
      <h2>Create project</h2>
      <input
        className="input"
        aria-label="Project name"
        placeholder="Project name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <textarea
        className="textarea"
        aria-label="Project description"
        placeholder="Short project description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      {createProject.error && <p className="error">{createProject.error.message}</p>}
      <motion.button className="button" aria-label="Create project" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
        {createProject.isPending ? "Creating..." : "Create Project"}
      </motion.button>
    </form>
  );
}
