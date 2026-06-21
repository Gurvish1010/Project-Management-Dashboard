/**
 * Header with app title, user information, and logout action.
 * CONCEPT: Framer Motion gesture animations - hover/tap feedback on buttons.
 */
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export function AppHeader() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <header className="header">
      <Link className="brand" href="/projects">
        ProjectFlow
      </Link>
      <div className="row">
        <span className="muted">{user?.name}</span>
        <motion.button
          className="button secondary"
          onClick={handleLogout}
          aria-label="Logout"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Logout
        </motion.button>
      </div>
    </header>
  );
}
