import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createBoard,
  getBoard,
  listBoards,
  type CreateBoardBody,
} from "@/features/boards/api/boards";
import { boardKeys } from "@/features/boards/api/keys";

export function useBoards() {
  return useQuery({ queryKey: boardKeys.list(), queryFn: listBoards });
}

export function useBoard(boardId: string) {
  return useQuery({
    queryKey: boardKeys.detail(boardId),
    queryFn: () => getBoard(boardId),
  });
}

/** Rejects with the reason: the create form reports it. */
export function useCreateBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateBoardBody) => createBoard(body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: boardKeys.list() }),
  });
}
