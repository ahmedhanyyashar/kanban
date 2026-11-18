import type { components } from "@repo/api-client";

import { api, unwrap } from "@/lib/api-client";

type Schemas = components["schemas"];

export type BoardListItem =
  Schemas["BoardListResponseDto"]["data"]["boards"][number];
export type BoardDetail = Schemas["BoardDetailResponseDto"]["data"];
export type Board = Schemas["BoardResponseDto"]["data"]["board"];
export type Activity =
  Schemas["ActivityListResponseDto"]["data"]["activities"][number];
export type BoardMember = Schemas["MemberResponseDto"]["data"]["member"];

export type CreateBoardBody = Schemas["CreateBoardDto"];
export type UpdateBoardBody = Schemas["UpdateBoardDto"];
export type InviteBody = Schemas["AddBoardMemberDto"];

export const listBoards = () =>
  unwrap(api.GET("/boards")).then((data) => data.boards);

export const getBoard = (boardId: string) =>
  unwrap(api.GET("/boards/{boardId}", { params: { path: { boardId } } }));

export const createBoard = (body: CreateBoardBody) =>
  unwrap(api.POST("/boards", { body })).then((data) => data.board);

export const updateBoard = (boardId: string, body: UpdateBoardBody) =>
  unwrap(
    api.PATCH("/boards/{boardId}", { params: { path: { boardId } }, body }),
  ).then((data) => data.board);

export const deleteBoard = (boardId: string) =>
  unwrap(api.DELETE("/boards/{boardId}", { params: { path: { boardId } } }));

export const getActivities = (boardId: string, limit = 50) =>
  unwrap(
    api.GET("/boards/{boardId}/activities", {
      params: { path: { boardId }, query: { limit } },
    }),
  ).then((data) => data.activities);

export const inviteMember = (boardId: string, body: InviteBody) =>
  unwrap(
    api.POST("/boards/{boardId}/members", {
      params: { path: { boardId } },
      body,
    }),
  ).then((data) => data.member);

export const removeMember = (boardId: string, userId: string) =>
  unwrap(
    api.DELETE("/boards/{boardId}/members/{userId}", {
      params: { path: { boardId, userId } },
    }),
  );
