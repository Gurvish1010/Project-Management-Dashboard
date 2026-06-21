/**
 * Zustand store for authentication state.
 * CONCEPT: Zustand - keeping simple client state outside component trees.
 */
"use client";

import { create } from "zustand";
import type { User } from "@/lib/types";

type AuthState = {
  token: string | null;
  user: User | null;
  hasHydrated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  hydrate: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hasHydrated: false,
  setAuth: (token, user) => {
    localStorage.setItem("day29-token", token);
    localStorage.setItem("day29-user", JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem("day29-token");
    localStorage.removeItem("day29-user");
    set({ token: null, user: null });
  },
  hydrate: () => {
    const token = localStorage.getItem("day29-token");
    const userJson = localStorage.getItem("day29-user");
    set({
      token,
      user: userJson ? (JSON.parse(userJson) as User) : null,
      hasHydrated: true
    });
  }
}));
