import { AlertTriangle } from "lucide-react";
import { Navigate, useParams } from "react-router";

import { canManageMembers } from "@repo/shared/board-role";
import { EmptyState } from "@repo/ui/blocks/empty-state";
import { PageHeader } from "@repo/ui/blocks/page-header";
import { Skeleton } from "@repo/ui/components/skeleton";

import { AiGenerateDialog } from "@/features/ai/components/ai-generate-dialog";
import { AiSummaryDialog } from "@/features/ai/components/ai-summary-dialog";
import { ActivitySheet } from "@/features/boards/components/activity-sheet";
import { AddColumnDialog } from "@/features/boards/components/add-column-dialog";
import { BoardActions } from "@/features/boards/components/board-actions";
import { BoardFilters } from "@/features/boards/components/board-filters";
import { KanbanBoard } from "@/features/boards/components/kanban-board";
import { MembersDialog } from "@/features/boards/components/members-dialog";
import { useBoardPage } from "@/features/boards/hooks/use-board-page";
import { TaskDialog } from "@/features/tasks/components/task-dialog";
import { usePageTitle } from "@/hooks/use-page-title";
import { errorMessage } from "@/lib/error-message";
import { APP_HOME } from "@/lib/routes";

export function BoardPage() {
  const { boardId } = useParams();
  if (!boardId) return <Navigate to={APP_HOME} replace />;
  return <BoardContent boardId={boardId} />;
}

function BoardContent({ boardId }: { boardId: string }) {
  const page = useBoardPage(boardId);
  usePageTitle(page.board.data?.board.title ?? "Board");
  const { data, isPending, isError, error, refetch } = page.board;

  if (isPending)
    return (
      <div role="status" className="flex gap-5 overflow-hidden">
        <span className="sr-only">Loading board</span>
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-96 w-[330px] shrink-0" />
        ))}
      </div>
    );

  if (isError)
    return (
      <EmptyState
        icon={AlertTriangle}
        title="This board could not be opened"
        description={errorMessage(error, "Check the address, or try again.")}
        action={{ label: "Try again", onClick: () => void refetch() }}
      />
    );

  const { board, columns, members, role } = data;
  const { dialog, closeDialog } = page;
  const onOpenChange = (open: boolean) => {
    if (!open) closeDialog();
  };
  const firstColumn = columns[0]?.id ?? "";

  return (
    <div className="-m-4 flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={board.title}
        {...(board.description && { description: board.description })}
        action={
          <BoardActions
            others={page.others}
            onSummary={() => page.setDialog({ kind: "summary" })}
            onMembers={() => page.setDialog({ kind: "members" })}
            onActivity={() => page.setDialog({ kind: "activity" })}
          />
        }
      />
      <div className="pt-4">
        <BoardFilters
          filters={page.filters}
          members={members}
          onChange={page.changeFilters}
        />
      </div>

      <div className="min-h-0 flex-1">
        <KanbanBoard
          columns={columns}
          tasks={page.visibleTasks}
          onTaskClick={(task) =>
            page.setDialog({
              kind: "task",
              taskId: task.id,
              columnId: task.columnId,
            })
          }
          onMoveTask={page.moveTask}
          onAddTask={(columnId) =>
            page.setDialog({ kind: "task", taskId: null, columnId })
          }
          onAiGenerate={(columnId) => page.setDialog({ kind: "ai", columnId })}
          onAddColumn={() => page.setDialog({ kind: "addColumn" })}
          onRenameColumn={page.renameColumn}
          onDeleteColumn={page.deleteColumn}
        />
      </div>

      <TaskDialog
        open={dialog?.kind === "task"}
        onOpenChange={onOpenChange}
        task={page.editing}
        defaultColumnId={
          dialog?.kind === "task" ? dialog.columnId : firstColumn
        }
        columns={columns}
        members={members}
        onSubmit={page.saveTask}
        onDelete={page.deleteTask}
        onBreakdown={(taskId) => void page.breakDown(taskId)}
        breakingDown={page.breakingDown}
      />
      <AiGenerateDialog
        open={dialog?.kind === "ai"}
        onOpenChange={onOpenChange}
        columns={columns}
        defaultColumnId={dialog?.kind === "ai" ? dialog.columnId : firstColumn}
        onGenerate={page.generateTasks}
        onAdd={(tasks, columnId) => page.addTasks(columnId, tasks)}
      />
      <AiSummaryDialog
        open={dialog?.kind === "summary"}
        onOpenChange={onOpenChange}
        summary={page.summary}
      />
      <MembersDialog
        open={dialog?.kind === "members"}
        onOpenChange={onOpenChange}
        members={members}
        canManage={canManageMembers(role)}
        onInvite={page.invite}
        onRemove={page.removeMember}
      />
      <ActivitySheet
        open={dialog?.kind === "activity"}
        onOpenChange={onOpenChange}
        activities={page.activities}
      />
      <AddColumnDialog
        open={dialog?.kind === "addColumn"}
        onOpenChange={onOpenChange}
        onCreate={page.addColumn}
      />
    </div>
  );
}
