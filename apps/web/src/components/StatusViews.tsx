/**
 * Reusable loading, error, and empty state components.
 * CONCEPT: Production polish - consistent feedback for slow, failed, and empty screens.
 * CONCEPT: Loading skeletons - animated placeholders reduce layout jump while fetching.
 */
"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function LoadingSkeleton({ label }: { label: string }) {
  return (
    <section className="skeleton-wrap" aria-label={label} aria-busy="true">
      {[0, 1, 2].map((item) => (
        <motion.div
          className="skeleton"
          key={item}
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: item * 0.12 }}
        />
      ))}
    </section>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section className="state-box" role="alert">
      <h2>Something went wrong</h2>
      <p className="muted">{message}</p>
      <button className="button secondary" type="button" onClick={onRetry} aria-label="Try loading again">
        Try again
      </button>
    </section>
  );
}

export function EmptyState({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <section className="state-box">
      <h2>{title}</h2>
      <p className="muted">{body}</p>
      {children}
    </section>
  );
}
