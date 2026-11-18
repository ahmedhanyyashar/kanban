import {
  AlertTriangle,
  CalendarClock,
  CheckSquare,
  ListTodo,
} from "lucide-react";
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";

import { EmptyState } from "@repo/ui/blocks/empty-state";
import { PageHeader } from "@repo/ui/blocks/page-header";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Skeleton } from "@repo/ui/components/skeleton";

import { filterTasks } from "@/features/boards/lib/filter-tasks";
import { PRIORITIES, priorityMeta } from "@/features/tasks/lib/priority";
import { MyTaskRow } from "@/features/workspace/components/my-task-row";
import { StatCard } from "@/features/workspace/components/stat-card";
import { useWorkspace } from "@/features/workspace/hooks/use-workspace";
import {
  assignedTo,
  groupByBoard,
  taskStats,
} from "@/features/workspace/lib/my-tasks";
import { usePageTitle } from "@/hooks/use-page-title";
import { authClient } from "@/lib/auth-client";

const ANY = "";

export function MyTasksPage() {
  usePageTitle("My tasks");
  const { data: session } = authClient.useSession();
  const { tasks, isPending } = useWorkspace();
  const [params, setParams] = useQueryStates({
    q: parseAsString.withDefault(""),
    priority: parseAsStringLiteral(PRIORITIES),
    board: parseAsString,
  });

  const mine = assignedTo(tasks, session?.user.id);
  const stats = taskStats(mine);
  const boardsInPlay = groupByBoard(mine).map(({ id, title }) => ({
    value: id,
    label: title,
  }));
  const shown = filterTasks(mine, {
    q: params.q,
    priority: params.priority,
    assigneeId: null,
  }).filter((task) => !params.board || task.boardId === params.board);
  const groups = groupByBoard(shown);
  const filtering = Boolean(params.q || params.priority || params.board);

  const priorities = [
    { value: ANY, label: "All priorities" },
    ...PRIORITIES.map((value) => ({ value, label: priorityMeta[value].label })),
  ];
  const boards = [{ value: ANY, label: "All boards" }, ...boardsInPlay];

  return (
    <div className="-m-4 flex flex-1 flex-col">
      <PageHeader title="My tasks" description="Everything assigned to you" />
      <div className="flex flex-col gap-6 p-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={ListTodo}
            label="Assigned to you"
            value={stats.total}
          />
          <StatCard
            icon={AlertTriangle}
            label="Overdue"
            value={stats.overdue}
            tone="danger"
          />
          <StatCard
            icon={CalendarClock}
            label="Due this week"
            value={stats.dueThisWeek}
            tone="warning"
          />
          <StatCard
            icon={CheckSquare}
            label="Completed"
            value={stats.done}
            tone="info"
          />
        </div>

        <search className="flex flex-wrap items-center gap-2">
          <Label htmlFor="my-tasks-search" className="sr-only">
            Search your tasks
          </Label>
          <Input
            id="my-tasks-search"
            type="search"
            placeholder="Search your tasks"
            value={params.q}
            onChange={(event) =>
              void setParams({ q: event.target.value || null })
            }
            className="w-56"
          />
          <Label htmlFor="my-tasks-priority" className="sr-only">
            Priority
          </Label>
          <Select
            items={priorities}
            value={params.priority ?? ANY}
            onValueChange={(value) =>
              void setParams({
                priority: PRIORITIES.find((p) => p === value) ?? null,
              })
            }
          >
            <SelectTrigger id="my-tasks-priority" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Label htmlFor="my-tasks-board" className="sr-only">
            Board
          </Label>
          <Select
            items={boards}
            value={params.board ?? ANY}
            onValueChange={(value) => void setParams({ board: value || null })}
          >
            <SelectTrigger id="my-tasks-board" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {boards.map((b) => (
                <SelectItem key={b.value} value={b.value}>
                  {b.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filtering && (
            <Button
              variant="ghost"
              onClick={() =>
                void setParams({ q: null, priority: null, board: null })
              }
            >
              Clear
            </Button>
          )}
          <p
            role="status"
            className="ml-auto text-sm text-muted-foreground tabular-nums"
          >
            {shown.length} {shown.length === 1 ? "task" : "tasks"}
          </p>
        </search>

        {isPending ? (
          <div role="status" className="flex flex-col gap-3">
            <span className="sr-only">Loading your tasks</span>
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-16" />
            ))}
          </div>
        ) : mine.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No tasks assigned to you"
            description="Tasks you’re assigned across all your boards will show up here."
          />
        ) : shown.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No matching tasks"
            description="Try clearing your filters."
          />
        ) : (
          <div className="flex flex-col gap-8">
            {groups.map((group) => (
              <section key={group.id} aria-label={group.title}>
                <div className="mb-3 flex items-center gap-2">
                  <span
                    aria-hidden
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                  <h2 className="font-display text-sm font-semibold tracking-tight">
                    {group.title}
                  </h2>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {group.items.length}
                  </span>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {group.items.map((task) => (
                    <li key={task.id}>
                      <MyTaskRow task={task} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
