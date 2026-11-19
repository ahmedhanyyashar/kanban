import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardCode,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@repo/ui/components/button";

import {
  boardAnnouncer,
  screenReaderInstructions,
} from "@/features/boards/lib/board-announcer";
import {
  groupByColumn,
  resolveMove,
  type PositionedTask,
} from "@/features/boards/lib/board-order";

import { Column } from "./column";
import { SortableTaskCard, TaskCard, type TaskCardData } from "./task-card";

export type BoardTask = TaskCardData & PositionedTask;
export type BoardColumn = { id: string; title: string };

type KanbanBoardProps = {
  columns: BoardColumn[];
  tasks: BoardTask[];
  onTaskClick: (task: BoardTask) => void;
  onMoveTask: (taskId: string, columnId: string, position: number) => void;
  onAddTask: (columnId: string) => void;
  onAiGenerate: (columnId: string) => void;
  onAddColumn: () => void;
  onRenameColumn: (columnId: string, title: string) => void;
  onDeleteColumn: (columnId: string) => void;
};

export function KanbanBoard({
  columns,
  tasks,
  onTaskClick,
  onMoveTask,
  onAddTask,
  onAiGenerate,
  onAddColumn,
  onRenameColumn,
  onDeleteColumn,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<BoardTask | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    // Space only: Enter is left free to open the focused task
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: {
        start: [KeyboardCode.Space],
        cancel: [KeyboardCode.Esc],
        end: [KeyboardCode.Space],
      },
    }),
  );
  const announce = useMemo(
    () => boardAnnouncer(columns, tasks),
    [columns, tasks],
  );
  const groups = useMemo(
    () =>
      groupByColumn(
        columns.map((column) => column.id),
        tasks,
      ),
    [columns, tasks],
  );

  const findTask = (id: string | number) => tasks.find((t) => t.id === id);

  const handleDragStart = ({ active }: DragStartEvent) =>
    setActiveTask(findTask(active.id) ?? null);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveTask(null);
    const task = findTask(active.id);
    if (!task || !over) return;
    const move = resolveMove(groups, task, String(over.id));
    if (move) onMoveTask(task.id, move.columnId, move.position);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      accessibility={{
        screenReaderInstructions: { draggable: screenReaderInstructions },
        announcements: {
          onDragStart: ({ active }) => announce.start(String(active.id)),
          onDragOver: ({ active, over }) =>
            announce.over(String(active.id), over && String(over.id)),
          onDragEnd: ({ active, over }) =>
            announce.end(String(active.id), over && String(over.id)),
          onDragCancel: ({ active }) => announce.cancel(String(active.id)),
        },
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveTask(null)}
    >
      <div className="relative flex h-full gap-5 overflow-x-auto px-6 pb-6">
        {columns.map((column, index) => {
          const columnTasks = groups.get(column.id) ?? [];
          return (
            <Column
              key={column.id}
              column={column}
              index={index}
              taskIds={columnTasks.map((t) => t.id)}
              onAddTask={onAddTask}
              onAiGenerate={onAiGenerate}
              onRename={onRenameColumn}
              onDelete={onDeleteColumn}
            >
              {columnTasks.map((task) => (
                <SortableTaskCard
                  key={task.id}
                  task={task}
                  onOpen={onTaskClick}
                />
              ))}
            </Column>
          );
        })}

        <Button variant="outline" onClick={onAddColumn}>
          <Plus /> Add column
        </Button>
      </div>

      {/* the overlay takes the size of the card being dragged */}
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} overlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
