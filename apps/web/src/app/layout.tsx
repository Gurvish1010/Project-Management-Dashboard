/**
 * Root layout for the Next.js app.
 * Demonstrates shared frontend structure and provider setup.
 * CONCEPT: SEO and meta tags - public metadata prepares the app for portfolio sharing.
 */
import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProjectFlow Dashboard | Day 30 React Capstone",
  description: "A polished project management dashboard with real-time Kanban updates, accessibility, and tests.",
  openGraph: {
    title: "ProjectFlow Dashboard",
    description: "React capstone project with Next.js, Express, Prisma, PostgreSQL, and WebSocket updates.",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
