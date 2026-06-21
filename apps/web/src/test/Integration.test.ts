/**
 * Integration-style tests for board behavior and API request handling.
 * CONCEPT: Comprehensive tests - verifies 5+ flows that connect app logic together.
 */
import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { api } from "@/lib/api";
import { filterColumns, findNextColumnId, getTaskCount, moveTaskLocally } from "@/lib/boardUtils";
import { columns, task } from "@/test/testData";

describe("board integration helpers", () => {
  test("filters tasks across all columns", () => {
    const result = filterColumns(columns, "readme");
    expect(result[0].tasks).toHaveLength(1);
    expect(result[1].tasks).toHaveLength(0);
  });

  test("finds the next column to the right", () => {
    expect(findNextColumnId(columns, "todo", "right")).toBe("doing");
  });

  test("finds the next column to the left", () => {
    expect(findNextColumnId(columns, "doing", "left")).toBe("todo");
  });

  test("counts tasks on the whole board", () => {
    expect(getTaskCount(columns)).toBe(1);
  });

  test("moves a task locally for optimistic UI", () => {
    const result = moveTaskLocally(columns, task, "doing");
    expect(result[0].tasks).toHaveLength(0);
    expect(result[1].tasks[0].columnId).toBe("doing");
  });
});

describe("api integration client", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("sends auth headers for protected requests", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));
    await api.getProjects("abc-token");
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:4000/projects",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer abc-token" })
      })
    );
  });

  test("turns failed API responses into readable errors", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ message: "Nope" }), { status: 400 }));
    await expect(api.getProjects("bad-token")).rejects.toThrow("Nope");
  });
});
