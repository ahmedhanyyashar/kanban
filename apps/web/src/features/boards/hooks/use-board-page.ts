import { useQuery } from "@tanstack/react-query";
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { useMemo, useState } from "react";

import { getActivities } from "@/features/boards/api/boards";
import { boardKeys } from "@/features/boards/api/keys";
import {
  filterTasks,
  type TaskFilters,
} from "@/features/boards/lib/filter-tasks";
import { useTaskMutations } from "@/features/tasks/hooks/use-task-mutations";
import { PRIORITIES } from "@/features/tasks/lib/priority";
import type { TaskInput } from "@/features/tasks/lib/task-form";

import { useBoardRealtime } from "./use-board-realtime";
import { useBoard } from "./use-boards";
import { useColumnMutations } from "./use-column-mutations";
import { useMemberMutations } from "./use-member-mutations";

/** Which dialog is open, and for what. At most one is. */
export type BoardDialog =
  | { kind: "task"; taskId: string | null; columnId: string }
  | { kind: "members" }
  | { kind: "activity" }
  | { kind: "addColumn" };

/** Everything the board page shows and does: the board, its live updates, filters, dialogs and actions. */
export function useBoardPage(boardId: string) {
  const board = useBoard(boardId);
  const others = useBoardRealtime(boardId);
  const taskMutations = useTaskMutations(boardId);
  const columnMutations = useColumnMutations(boardId);
  const memberMutations = useMemberMutations(boardId);

  const [dialog, setDialog] = useState<BoardDialog | null>(null);
  const closeDialog = () => setDialog(null);

  // filters live in the address, so a filtered board can be shared and survives a reload
  const [params, setParams] = useQueryStates({
    q: parseAsString.withDefault(""),
    priority: parseAsStringLiteral(PRIORITIES),
    assignee: parseAsString,
  });
  const filters: TaskFilters = {
    q: params.q,
    priority: params.priority,
    assigneeId: params.assignee,
  };
  const changeFilters = (changes: Partial<TaskFilters>) =>
    void setParams({
      ...(changes.q !== undefined && { q: changes.q || null }),
      ...(changes.priority !== undefined && { priority: changes.priority }),
      ...(changes.assigneeId !== undefined && { assignee: changes.assigneeId }),
    });

  const tasks = board.data?.tasks;
  const visibleTasks = useMemo(
    () => filterTasks(tasks ?? [], filters),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the filters are these three values
    [tasks, params.q, params.priority, params.assignee],
  );

  const activities = useQuery({
    queryKey: boardKeys.activities(boardId),
    queryFn: () => getActivities(boardId),
    enabled: dialog?.kind === "activity",
  });

  const editing =
    dialog?.kind === "task" && dialog.taskId
      ? (tasks?.find((t) => t.id === dialog.taskId) ?? null)
      : null;

  /** Creates the task, or saves the changes to the one being edited. Rejects for the form to report. */
  const saveTask = async (input: TaskInput) => {
    if (editing)
      await taskMutations.update.mutateAsync({
        taskId: editing.id,
        body: {
          title: input.title,
          description: input.description,
          priority: input.priority,
          dueDate: input.dueDate,
          assigneeId: input.assigneeId,
        },
      });
    else await taskMutations.create.mutateAsync(input);
  };

  return {
    board,
    others,
    dialog,
    setDialog,
    closeDialog,
    filters,
    changeFilters,
    visibleTasks,
    editing,
    activities: activities.data,
    moveTask: (taskId: string, columnId: string, position: number) =>
      taskMutations.move.mutate({ taskId, columnId, position }),
    deleteTask: (taskId: string) => taskMutations.remove.mutate(taskId),
    saveTask,
    addColumn: async (title: string) => {
      await columnMutations.create.mutateAsync({ title });
    },
    renameColumn: (columnId: string, title: string) =>
      columnMutations.rename.mutate({ columnId, title }),
    deleteColumn: (columnId: string) => columnMutations.remove.mutate(columnId),
    invite: async (email: string) => {
      const member = await memberMutations.invite.mutateAsync(email);
      return { name: member.name };
    },
    removeMember: (userId: string) => memberMutations.remove.mutate(userId),
  };
}
