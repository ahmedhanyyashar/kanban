import { useQueries, type UseQueryResult } from "@tanstack/react-query";
import { useCallback } from "react";

import { getBoard, type BoardDetail } from "@/features/boards/api/boards";
import { boardKeys } from "@/features/boards/api/keys";
import { useBoards } from "@/features/boards/hooks/use-boards";
import { aggregateWorkspace } from "@/features/workspace/lib/workspace";

/**
 * Everything across the boards a person can see: their tasks and the people they work with.
 * One request per board, through the same cache the board page uses, so an open board costs nothing.
 */
export function useWorkspace() {
  const boards = useBoards();
  const list = boards.data;

  const combine = useCallback(
    (results: UseQueryResult<BoardDetail>[]) => ({
      ...aggregateWorkspace(
        list ?? [],
        results.map((result) => result.data),
      ),
      isPending: results.some((result) => result.isPending),
    }),
    [list],
  );

  const workspace = useQueries({
    queries: (list ?? []).map((board) => ({
      queryKey: boardKeys.detail(board.id),
      queryFn: () => getBoard(board.id),
    })),
    combine,
  });

  return {
    boards: list ?? [],
    tasks: workspace.tasks,
    members: workspace.members,
    isPending: boards.isPending || workspace.isPending,
    isError: boards.isError,
  };
}
