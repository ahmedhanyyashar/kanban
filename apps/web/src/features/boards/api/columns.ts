import type { components } from "@repo/api-client";

import { api, unwrap } from "@/lib/api-client";

type Schemas = components["schemas"];

export type Column = Schemas["ColumnResponseDto"]["data"]["column"];
export type CreateColumnBody = Schemas["CreateColumnDto"];
export type UpdateColumnBody = Schemas["UpdateColumnDto"];

export const createColumn = (boardId: string, body: CreateColumnBody) =>
  unwrap(
    api.POST("/boards/{boardId}/columns", {
      params: { path: { boardId } },
      body,
    }),
  ).then((data) => data.column);

export const updateColumn = (
  boardId: string,
  columnId: string,
  body: UpdateColumnBody,
) =>
  unwrap(
    api.PATCH("/boards/{boardId}/columns/{columnId}", {
      params: { path: { boardId, columnId } },
      body,
    }),
  ).then((data) => data.column);

export const deleteColumn = (boardId: string, columnId: string) =>
  unwrap(
    api.DELETE("/boards/{boardId}/columns/{columnId}", {
      params: { path: { boardId, columnId } },
    }),
  );
