/**
 * Login/register form for the home page.
 * CONCEPT: Framer Motion variants - switching form text and entrance animation cleanly.
 */
"use client";

import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

const formVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 }
};

export function AuthForm() {
  // CONCEPT: useState - toggling between login and register modes.
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const authMutation = useMutation({
    mutationFn: () =>
      mode === "login"
        ? api.login({ email, password })
        : api.register({ name, email, password }),
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      router.push("/projects");
    }
  });

  return (
    <motion.form
      className="panel form-grid"
      variants={formVariants}
      initial="hidden"
      animate="visible"
      onSubmit={(event) => {
        event.preventDefault();
        authMutation.mutate();
      }}
    >
      <h1>{mode === "login" ? "Login" : "Create account"}</h1>
      {mode === "register" && (
        <label>
          Name
          <input className="input" aria-label="Name" value={name} onChange={(event) => setName(event.target.value)} />
        </label>
      )}
      <label>
        Email
        <input className="input" aria-label="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label>
        Password
        <input
          className="input"
          aria-label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      {authMutation.error && <p className="error">{authMutation.error.message}</p>}
      <motion.button className="button" aria-label={mode === "login" ? "Login" : "Register"} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        {authMutation.isPending ? "Please wait..." : mode === "login" ? "Login" : "Register"}
      </motion.button>
      <button
        className="button secondary"
        type="button"
        aria-label="Switch authentication mode"
        onClick={() => setMode(mode === "login" ? "register" : "login")}
      >
        Switch to {mode === "login" ? "register" : "login"}
      </button>
    </motion.form>
  );
}
