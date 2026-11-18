import type { components } from "@repo/api-client";

import { api, unwrap } from "@/lib/api-client";

type Schemas = components["schemas"];

export type Task = Schemas["TaskResponseDto"]["data"]["task"];
export type CreateTaskBody = Schemas["CreateTaskDto"];
export type UpdateTaskBody = Schemas["UpdateTaskDto"];
export type MoveTaskBody = Schemas["MoveTaskDto"];

export const createTask = (boardId: string, body: CreateTaskBody) =>
  unwrap(
    api.POST("/boards/{boardId}/tasks", {
      params: { path: { boardId } },
      body,
    }),
  ).then((data) => data.task);

export const updateTask = (
  boardId: string,
  taskId: string,
  body: UpdateTaskBody,
) =>
  unwrap(
    api.PATCH("/boards/{boardId}/tasks/{taskId}", {
      params: { path: { boardId, taskId } },
      body,
    }),
  ).then((data) => data.task);

export const moveTask = (boardId: string, taskId: string, body: MoveTaskBody) =>
  unwrap(
    api.PATCH("/boards/{boardId}/tasks/{taskId}/move", {
      params: { path: { boardId, taskId } },
      body,
    }),
  ).then((data) => data.task);

export const deleteTask = (boardId: string, taskId: string) =>
  unwrap(
    api.DELETE("/boards/{boardId}/tasks/{taskId}", {
      params: { path: { boardId, taskId } },
    }),
  );
