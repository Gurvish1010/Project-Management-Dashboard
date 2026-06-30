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
        <p className="brand">Project Management Dashboard</p>
        <p className="muted">A Jira/Trello-inspired dashboard </p>
        <AuthForm />
      </div>
    </PageShell>
  );
}
