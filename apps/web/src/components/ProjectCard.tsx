/**
 * Displays one project card on the Projects page.
 * CONCEPT: Framer Motion gesture animations - hover/tap makes cards feel interactive.
 */
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { Project } from "@/lib/types";

export function ProjectCard({ project }: { project: Project }) {
  const taskCount = project.board?.columns.reduce((total, column) => total + column.tasks.length, 0) ?? 0;

  return (
    <motion.div className="panel" whileHover={{ y: -3 }} whileTap={{ scale: 0.99 }}>
      <h3>{project.name}</h3>
      <p className="muted">{project.description}</p>
      <p>{taskCount} tasks</p>
      <Link className="button" href={`/board/${project.id}`} aria-label={`Open ${project.name} board`}>
        Open board
      </Link>
    </motion.div>
  );
}
