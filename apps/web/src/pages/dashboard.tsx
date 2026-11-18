import { CheckSquare, Crown, FolderKanban, Plus, Share2 } from "lucide-react";

import { EmptyState } from "@repo/ui/blocks/empty-state";
import { PageHeader } from "@repo/ui/blocks/page-header";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";

import { BoardCard } from "@/features/boards/components/board-card";
import {
  CreateBoardPromo,
  OwnershipCard,
  RecentBoards,
  TasksByBoard,
} from "@/features/boards/components/board-insights";
import { useBoards } from "@/features/boards/hooks/use-boards";
import {
  busiestBoards,
  overview,
  recentBoards,
} from "@/features/boards/lib/overview";
import { StatCard } from "@/features/workspace/components/stat-card";
import { usePageTitle } from "@/hooks/use-page-title";
import { useShellActions } from "@/layouts/shell-context";
import { authClient } from "@/lib/auth-client";

export function DashboardPage() {
  usePageTitle("Dashboard");
  const { data: session } = authClient.useSession();
  const { openCreateBoard } = useShellActions();
  const { data: boards, isPending } = useBoards();
  const list = boards ?? [];
  const stats = overview(list);
  const firstName = session?.user.name.split(" ")[0];

  return (
    <div className="-m-4 flex flex-1 flex-col">
      <PageHeader
        title={firstName ? `Welcome back, ${firstName}` : "Dashboard"}
        description="Your boards and shared projects"
      />
      <div className="flex flex-col gap-5 p-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={FolderKanban}
            label="Total boards"
            value={stats.total}
            hint="Across your workspace"
          />
          <StatCard
            icon={CheckSquare}
            label="Total tasks"
            value={stats.totalTasks}
            tone="info"
            hint={`${stats.averageTasks} per board on average`}
          />
          <StatCard
            icon={Crown}
            label="Owned by you"
            value={stats.owned}
            hint={`${stats.ownedPercent}% of your boards`}
          />
          <StatCard
            icon={Share2}
            label="Shared with you"
            value={stats.shared}
            tone="warning"
            hint="From your teammates"
          />
        </div>

        {isPending ? (
          <div role="status" className="grid gap-5 lg:grid-cols-12">
            <span className="sr-only">Loading your boards</span>
            <Skeleton className="h-72 lg:col-span-8" />
            <Skeleton className="h-72 lg:col-span-4" />
          </div>
        ) : list.length > 0 ? (
          <>
            <div className="grid gap-5 lg:grid-cols-12">
              <TasksByBoard boards={busiestBoards(list, 7)} />
              <OwnershipCard stats={stats} />
            </div>
            <div className="grid gap-5 lg:grid-cols-12">
              <RecentBoards boards={recentBoards(list, 4)} />
              <CreateBoardPromo onCreate={openCreateBoard} />
            </div>
          </>
        ) : null}

        <div className="mt-3 flex items-end justify-between">
          <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            All boards
          </h2>
          <Button size="sm" onClick={openCreateBoard}>
            <Plus /> New board
          </Button>
        </div>

        {isPending ? (
          <div
            role="status"
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            <span className="sr-only">Loading your boards</span>
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-48" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No boards yet"
            description="Create your first board and start planning."
            action={{ label: "Create a board", onClick: openCreateBoard }}
          />
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((board) => (
              <li key={board.id}>
                <BoardCard board={board} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
