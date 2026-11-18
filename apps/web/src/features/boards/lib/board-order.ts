export type PositionedTask = { id: string; columnId: string; position: number };

/** Gap between neighbours when tasks are appended, so there is room to insert between them. */
const GAP = 1000;

/** The tasks of each column, ordered by position. Tasks of an unknown column are left out. */
export function groupByColumn<T extends PositionedTask>(
  columnIds: string[],
  tasks: T[],
): Map<string, T[]> {
  const groups = new Map(columnIds.map((id): [string, T[]] => [id, []]));
  for (const task of tasks) groups.get(task.columnId)?.push(task);
  for (const list of groups.values())
    list.sort((a, b) => a.position - b.position);
  return groups;
}

/** A position that places a task at `index` among `siblings` (ordered, without that task). */
export function positionAt(
  siblings: { position: number }[],
  index: number,
): number {
  const prev = siblings[index - 1]?.position;
  const next = siblings[index]?.position;
  if (prev === undefined) return next === undefined ? GAP : next / 2;
  if (next === undefined) return prev + GAP;
  return (prev + next) / 2;
}

export type Move = { columnId: string; position: number };

/**
 * Where `task` lands when dropped on `overId`, a column or another task.
 * Null when nothing changes or the target is unknown.
 */
export function resolveMove<T extends PositionedTask>(
  groups: Map<string, T[]>,
  task: T,
  overId: string,
): Move | null {
  if (overId === task.id) return null;

  let columnId: string | undefined;
  let siblings: T[] = [];
  let index = 0;

  const overColumn = groups.get(overId);
  if (overColumn) {
    // dropped on the column itself: the end of it
    columnId = overId;
    siblings = overColumn.filter((t) => t.id !== task.id);
    index = siblings.length;
  } else {
    for (const [id, list] of groups) {
      const overIndex = list.findIndex((t) => t.id === overId);
      if (overIndex === -1) continue;
      columnId = id;
      siblings = list.filter((t) => t.id !== task.id);
      // before the task it was dropped on, unless it moves down within its own column
      const from = list.findIndex((t) => t.id === task.id);
      index = siblings.findIndex((t) => t.id === overId);
      if (from !== -1 && from < overIndex) index += 1;
      break;
    }
  }
  if (columnId === undefined) return null;

  const position = positionAt(siblings, index);
  if (columnId === task.columnId && position === task.position) return null;
  return { columnId, position };
}
