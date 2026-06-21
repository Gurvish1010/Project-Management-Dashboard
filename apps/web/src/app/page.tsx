/**
 * Home page with the authentication form.
 * CONCEPT: Page transitions and route animations - wrapped in PageShell.
 * CONCEPT: Portfolio presentation - clear product copy for reviewers and interviewers.
 */
import { AuthForm } from "@/components/AuthForm";
import { PageShell } from "@/components/PageShell";

export default function HomePage() {
  return (
    <PageShell>
      <div className="shell" style={{ maxWidth: 460, paddingTop: 60 }}>
        <p className="brand">ProjectFlow</p>
        <p className="muted">A simple Jira/Trello-inspired dashboard polished for Day 30.</p>
        <AuthForm />
      </div>
    </PageShell>
  );
}
