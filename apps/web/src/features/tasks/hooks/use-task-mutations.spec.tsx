import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { BoardDetail } from "@/features/boards/api/boards";
import { boardKeys } from "@/features/boards/api/keys";
import * as tasksApi from "@/features/tasks/api/tasks";

import { useTaskMutations } from "./use-task-mutations";

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock("@/features/tasks/api/tasks");

const at = "2026-03-04T00:00:00.000Z";
const task: BoardDetail["tasks"][number] = {
  id: "t1",
  title: "Write docs",
  description: null,
  position: 1000,
  priority: "medium",
  dueDate: null,
  assigneeId: null,
  assignee: null,
  boardId: "b1",
  columnId: "todo",
  createdBy: "u1",
  createdAt: at,
  updatedAt: at,
};
const detail: BoardDetail = {
  board: {
    id: "b1",
    title: "Roadmap",
    description: null,
    color: "#2f8159",
    ownerId: "u1",
    createdAt: at,
    updatedAt: at,
  },
  columns: [],
  tasks: [task],
  members: [],
  role: "owner",
};

function setup() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  client.setQueryData(boardKeys.detail("b1"), detail);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => useTaskMutations("b1"), { wrapper });
  const stored = () =>
    client
      .getQueryData<BoardDetail>(boardKeys.detail("b1"))
      ?.tasks.find((t) => t.id === "t1");
  return { result, stored };
}

beforeEach(() => vi.clearAllMocks());

describe("useTaskMutations", () => {
  it("moves a task on screen at once, then keeps what the server answers", async () => {
    let answer: (task: (typeof detail.tasks)[number]) => void = () => undefined;
    vi.mocked(tasksApi.moveTask).mockReturnValue(
      new Promise((resolve) => {
        answer = resolve;
      }),
    );
    const { result, stored } = setup();

    act(() =>
      result.current.move.mutate({
        taskId: "t1",
        columnId: "done",
        position: 500,
      }),
    );
    await waitFor(() =>
      expect(stored()).toMatchObject({ columnId: "done", position: 500 }),
    );

    answer({ ...task, columnId: "done", position: 500, updatedAt: "later" });
    await waitFor(() => expect(stored()?.updatedAt).toBe("later"));
  });

  it("puts a refused move back and says so", async () => {
    vi.mocked(tasksApi.moveTask).mockRejectedValue(
      new Error("Column not found"),
    );
    const { result, stored } = setup();

    act(() =>
      result.current.move.mutate({
        taskId: "t1",
        columnId: "gone",
        position: 500,
      }),
    );

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Column not found"),
    );
    expect(stored()).toMatchObject({ columnId: "todo", position: 1000 });
  });

  it("brings a deleted task back when the delete fails", async () => {
    vi.mocked(tasksApi.deleteTask).mockRejectedValue(new Error("Forbidden"));
    const { result, stored } = setup();

    act(() => result.current.remove.mutate("t1"));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Forbidden"));
    expect(stored()?.id).toBe("t1");
  });
});
