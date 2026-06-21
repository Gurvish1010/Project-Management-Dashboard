/**
 * Express API entry point for the Day 30 dashboard.
 * Demonstrates monorepo backend setup with CORS, JSON parsing, and route modules.
 * CONCEPT: Real-time updates - the same HTTP server also hosts a WebSocket endpoint.
 */
import http from "node:http";
import cors from "cors";
import "dotenv/config";
import express from "express";
import { startRealtimeServer } from "./lib/realtime.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/auth.js";
import { boardsRouter } from "./routes/boards.js";
import { projectsRouter } from "./routes/projects.js";
import { tasksRouter } from "./routes/tasks.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const server = http.createServer(app);

app.use(cors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:3000" }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRouter);
app.use("/projects", projectsRouter);
app.use("/boards", boardsRouter);
app.use("/tasks", tasksRouter);
app.use(errorHandler);

startRealtimeServer(server);

server.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
