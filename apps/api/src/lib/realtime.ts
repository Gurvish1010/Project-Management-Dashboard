/**
 * Lightweight WebSocket hub for board updates.
 * CONCEPT: Real-time updates - broadcasts task changes so other browser tabs refresh instantly.
 * CONCEPT: Production trade-off - plain WebSocket keeps the demo easy to understand.
 */
import type { Server as HttpServer } from "node:http";
import { WebSocketServer, type WebSocket } from "ws";

type BoardMessage = {
  type: "BOARD_UPDATED";
  projectId: string;
  reason: "task-created" | "task-updated" | "comment-created";
};

const clientsByProject = new Map<string, Set<WebSocket>>();

export function startRealtimeServer(server: HttpServer) {
  const wss = new WebSocketServer({ server, path: "/realtime" });

  wss.on("connection", (socket, request) => {
    const url = new URL(request.url ?? "", "http://localhost");
    const projectId = url.searchParams.get("projectId");

    if (!projectId) {
      socket.close(1008, "projectId is required");
      return;
    }

    const clients = clientsByProject.get(projectId) ?? new Set<WebSocket>();
    clients.add(socket);
    clientsByProject.set(projectId, clients);

    socket.on("close", () => {
      clients.delete(socket);
      if (clients.size === 0) {
        clientsByProject.delete(projectId);
      }
    });
  });
}

export function broadcastBoardUpdate(message: BoardMessage) {
  const clients = clientsByProject.get(message.projectId);

  if (!clients) return;

  const payload = JSON.stringify(message);

  for (const client of clients) {
    if (client.readyState === client.OPEN) {
      client.send(payload);
    }
  }
}
