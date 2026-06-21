/**
 * Projects page for listing and creating projects.
 * CONCEPT: React Query - fetching projects as server state.
 * CONCEPT: Framer Motion layout animations - project cards animate into place.
 * CONCEPT: Empty/loading/error states - the project list handles every server-state phase.
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { CreateProjectForm } from "@/components/CreateProjectForm";
import { PageShell } from "@/components/PageShell";
import { ProjectCard } from "@/components/ProjectCard";
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/StatusViews";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

export default function ProjectsPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  // CONCEPT: useState - storing the project search text locally.
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (hasHydrated && !token) {
      router.push("/");
    }
  }, [hasHydrated, router, token]);

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.getProjects(token!),
    enabled: Boolean(token)
  });

  const visibleProjects =
    projectsQuery.data?.filter((project) =>
      `${project.name} ${project.description}`.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  return (
    <PageShell>
      <div className="shell">
        <AppHeader />
        <CreateProjectForm />
        <input
          className="input"
          aria-label="Search projects"
          placeholder="Search projects"
          style={{ marginTop: 18 }}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {projectsQuery.isLoading && <LoadingSkeleton label="Loading projects" />}
        {projectsQuery.error && <ErrorState message={projectsQuery.error.message} onRetry={() => projectsQuery.refetch()} />}
        {!projectsQuery.isLoading && !projectsQuery.error && visibleProjects.length === 0 && (
          <EmptyState
            title={search ? "No matching projects" : "No projects yet"}
            body={search ? "Clear the search to see all projects." : "Create your first project with the form above."}
          />
        )}
        <motion.section className="projects-grid" layout>
          {visibleProjects.map((project) => (
            <motion.div key={project.id} layout>
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </motion.section>
      </div>
    </PageShell>
  );
}
