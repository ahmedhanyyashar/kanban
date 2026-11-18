type Named = { id: string; title: string };
type BoardTaskRef = Named & { columnId: string };

/**
 * What a screen reader says while a task is moved. Names, never ids: the ids are UUIDs.
 * Plain ids in and strings out, so the board can map them onto the drag library's events.
 */
export function boardAnnouncer(columns: Named[], tasks: BoardTaskRef[]) {
  const taskName = (id: string) =>
    tasks.find((t) => t.id === id)?.title ?? "Task";

  const place = (id: string): string | undefined => {
    const column = columns.find((c) => c.id === id);
    if (column) return `column ${column.title}`;
    const task = tasks.find((t) => t.id === id);
    const home = columns.find((c) => c.id === task?.columnId);
    return task && home ? `${task.title}, in column ${home.title}` : undefined;
  };

  const target = (id: string, overId: string | null | undefined) =>
    overId && overId !== id ? place(overId) : undefined;

  return {
    start: (id: string) => `Picked up ${taskName(id)}.`,
    over: (id: string, overId: string | null | undefined) => {
      const over = target(id, overId);
      return over ? `${taskName(id)} is over ${over}.` : undefined;
    },
    end: (id: string, overId: string | null | undefined) => {
      const over = target(id, overId);
      return over
        ? `${taskName(id)} was dropped over ${over}.`
        : `${taskName(id)} was dropped.`;
    },
    cancel: (id: string) => `Moving ${taskName(id)} was cancelled.`,
  };
}

export const screenReaderInstructions =
  "To pick up a task, press space. Use the arrow keys to move it, space to drop it and escape to cancel.";
