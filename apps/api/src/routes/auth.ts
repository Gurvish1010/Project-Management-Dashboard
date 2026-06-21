/**
 * Authentication routes for registering and logging in users.
 * Demonstrates JWT auth, password hashing, and simple request validation.
 */
import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/asyncHandler.js";
import { comparePassword, hashPassword, signToken } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

authRouter.post("/register", asyncHandler(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Please provide name, email, and a 6+ character password." });
  }

  const existingUser = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  if (existingUser) {
    return res.status(409).json({ message: "That email is already registered." });
  }

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password)
    },
    select: { id: true, email: true, name: true }
  });

  return res.status(201).json({ user, token: signToken(user) });
}));

authRouter.post("/login", asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Please provide a valid email and password." });
  }

  const foundUser = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  if (!foundUser || !(await comparePassword(parsed.data.password, foundUser.passwordHash))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const user = { id: foundUser.id, email: foundUser.email, name: foundUser.name };

  return res.json({ user, token: signToken(user) });
}));
