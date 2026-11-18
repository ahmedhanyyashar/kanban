import { BarChart3, Clock, PieChart, Sparkles } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { formatRelativeTime } from "@repo/ui/lib/utils";

import type { BoardListItem } from "@/features/boards/api/boards";
import type { Overview } from "@/features/boards/lib/overview";

/** Tasks on the busiest boards, as bars with their numbers written out. */
export function TasksByBoard({ boards }: { boards: BoardListItem[] }) {
  const max = Math.max(1, ...boards.map((b) => b.taskCount));
  const hasTasks = boards.some((b) => b.taskCount > 0);

  return (
    <Card className="lg:col-span-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 aria-hidden className="size-4 text-primary" />
          <h2>Board analytics</h2>
        </CardTitle>
        <CardDescription>Tasks across your busiest boards</CardDescription>
      </CardHeader>
      <CardContent>
        {hasTasks ? (
          <ul className="flex flex-col gap-3">
            {boards.map((board) => (
              <li key={board.id}>
                <Link
                  to={`/board/${board.id}`}
                  className="grid grid-cols-[8rem_1fr_2rem] items-center gap-3 rounded-md text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="truncate">{board.title}</span>
                  <span aria-hidden className="h-3 rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${Math.max((board.taskCount / max) * 100, 2)}%`,
                        backgroundColor: board.color,
                      }}
                    />
                  </span>
                  <span className="text-right font-semibold tabular-nums">
                    {board.taskCount}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Add tasks to a board and they’ll be counted here.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/** How many boards are the viewer's own and how many were shared with them. */
export function OwnershipCard({ stats }: { stats: Overview }) {
  return (
    <Card className="lg:col-span-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart aria-hidden className="size-4 text-primary" />
          <h2>Ownership</h2>
        </CardTitle>
        <CardDescription>Your boards and shared ones</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div
          aria-hidden
          className="flex h-3 overflow-hidden rounded-full bg-muted"
        >
          <span
            className="bg-primary"
            style={{ width: `${stats.ownedPercent}%` }}
          />
        </div>
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2.5">
            <span aria-hidden className="size-2.5 rounded-full bg-primary" />
            <dt className="text-muted-foreground">Owned by you</dt>
            <dd className="ml-auto font-semibold tabular-nums">
              {stats.owned}
            </dd>
          </div>
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="size-2.5 rounded-full bg-muted-foreground/40"
            />
            <dt className="text-muted-foreground">Shared with you</dt>
            <dd className="ml-auto font-semibold tabular-nums">
              {stats.shared}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

export function RecentBoards({ boards }: { boards: BoardListItem[] }) {
  return (
    <Card className="lg:col-span-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock aria-hidden className="size-4 text-primary" />
          <h2>Recently updated</h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-1">
          {boards.map((board) => (
            <li key={board.id}>
              <Link
                to={`/board/${board.id}`}
                className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  aria-hidden
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: board.color }}
                />
                <span className="flex-1 truncate font-medium">
                  {board.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(board.updatedAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function CreateBoardPromo({ onCreate }: { onCreate: () => void }) {
  return (
    <Card className="lg:col-span-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles aria-hidden className="size-4 text-primary" />
          <h2>Plan with AI</h2>
        </CardTitle>
        <CardDescription>
          Describe a goal and let AI draft the backlog for a new board.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onCreate}>Create a board</Button>
      </CardContent>
    </Card>
  );
}
