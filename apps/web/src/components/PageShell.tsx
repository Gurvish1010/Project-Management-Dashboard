/**
 * Reusable page animation wrapper.
 * CONCEPT: Framer Motion motion components - animating page entry with GPU-friendly opacity/transform.
 * CONCEPT: Page transitions and route animations - every page can fade and slide in consistently.
 */
"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <motion.main
      className="page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      {children}
    </motion.main>
  );
}
