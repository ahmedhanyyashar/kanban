import type { TaskSuggestion } from "@/features/ai/lib/generate-form";
import { PriorityTag } from "@/features/tasks/components/priority-tag";

export function SuggestionList({ tasks }: { tasks: TaskSuggestion[] }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase tabular-nums">
        {tasks.length} suggested tasks
      </h3>
      <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto">
        {tasks.map((task, index) => (
          <li key={index} className="rounded-xl border bg-card p-3.5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium">{task.title}</p>
              <PriorityTag priority={task.priority} />
            </div>
            {task.description && (
              <p className="mt-1 text-xs text-muted-foreground">
                {task.description}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
