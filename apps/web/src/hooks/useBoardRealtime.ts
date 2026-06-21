/**
 * React hook that listens for board update messages from the API WebSocket.
 * CONCEPT: Real-time updates - another user's task move triggers a local board refresh.
 * CONCEPT: useEffect cleanup - closes the socket when the user leaves the board.
 */
"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const WS_URL = API_URL.replace(/^http/, "ws");

export function useBoardRealtime(projectId: string, enabled: boolean, onBoardUpdated: () => void) {
  const [status, setStatus] = useState<"offline" | "connecting" | "live">("offline");

  useEffect(() => {
    if (!enabled) {
      setStatus("offline");
      return;
    }

    // CONCEPT: WebSocket - keeps one small live connection open for board events.
    const socket = new WebSocket(`${WS_URL}/realtime?projectId=${projectId}`);
    setStatus("connecting");

    socket.addEventListener("open", () => setStatus("live"));
    socket.addEventListener("close", () => setStatus("offline"));
    socket.addEventListener("error", () => setStatus("offline"));
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data) as { type?: string; projectId?: string };

      if (message.type === "BOARD_UPDATED" && message.projectId === projectId) {
        onBoardUpdated();
      }
    });

    return () => socket.close();
  }, [enabled, onBoardUpdated, projectId]);

  return status;
}
