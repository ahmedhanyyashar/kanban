import type { BoardListItem } from "@/features/boards/api/boards";

export type Overview = {
  total: number;
  totalTasks: number;
  owned: number;
  shared: number;
  /** Tasks per board, rounded. */
  averageTasks: number;
  /** The share of boards the viewer owns, as a whole percentage. */
  ownedPercent: number;
};

export function overview(boards: BoardListItem[]): Overview {
  const total = boards.length;
  const totalTasks = boards.reduce((sum, b) => sum + b.taskCount, 0);
  const owned = boards.filter((b) => b.isOwner).length;
  return {
    total,
    totalTasks,
    owned,
    shared: total - owned,
    averageTasks: total ? Math.round(totalTasks / total) : 0,
    ownedPercent: total ? Math.round((owned / total) * 100) : 0,
  };
}

/** The busiest boards, most tasks first. */
export function busiestBoards(boards: BoardListItem[], count: number) {
  return [...boards].sort((a, b) => b.taskCount - a.taskCount).slice(0, count);
}

/** The boards changed most recently, newest first. */
export function recentBoards(boards: BoardListItem[], count: number) {
  return [...boards]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, count);
}
