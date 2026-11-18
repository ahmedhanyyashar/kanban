import { ArrowUpRight, CheckSquare, LayoutGrid, Users } from "lucide-react";
import { Link } from "react-router";

import { Badge } from "@repo/ui/components/badge";
import { formatRelativeTime } from "@repo/ui/lib/utils";

import type { BoardListItem } from "@/features/boards/api/boards";

/** A board as a card that opens it. The board's own colour is data, so it is set inline. */
export function BoardCard({ board }: { board: BoardListItem }) {
  return (
    <Link
      to={`/board/${board.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-card p-5 shadow-card transition-shadow outline-none hover:shadow-soft focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: board.color }}
      />
      <div className="mb-3.5 flex items-start justify-between">
        <div
          aria-hidden
          className="flex size-11 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: `color-mix(in oklab, ${board.color} 14%, transparent)`,
            color: board.color,
          }}
        >
          <LayoutGrid className="size-5" />
        </div>
        <span className="flex items-center gap-1.5 text-muted-foreground group-hover:text-primary">
          {!board.isOwner && <Badge variant="secondary">Shared</Badge>}
          <ArrowUpRight aria-hidden className="size-4" />
        </span>
      </div>
      <h3 className="font-display text-base font-semibold tracking-tight">
        {board.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 min-h-10 text-sm leading-relaxed text-muted-foreground">
        {board.description ?? "No description"}
      </p>
      <div className="mt-auto flex items-center gap-4 border-t pt-3.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5 tabular-nums">
          <CheckSquare aria-hidden className="size-3.5" />
          {board.taskCount} {board.taskCount === 1 ? "task" : "tasks"}
        </span>
        <span className="flex items-center gap-1.5 tabular-nums">
          <Users aria-hidden className="size-3.5" />
          {board.memberCount}
          <span className="sr-only">members</span>
        </span>
        <span className="ml-auto">
          <span className="sr-only">Updated </span>
          {formatRelativeTime(board.updatedAt)}
        </span>
      </div>
    </Link>
  );
}
