import { Search } from "lucide-react";

import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";

import type { TaskFilters } from "@/features/boards/lib/filter-tasks";
import { PRIORITIES, priorityMeta } from "@/features/tasks/lib/priority";

type BoardFiltersProps = {
  filters: TaskFilters;
  members: { id: string; name: string }[];
  onChange: (changes: Partial<TaskFilters>) => void;
};

const ANY = "";

const priorities = [
  { value: ANY, label: "All priorities" },
  ...PRIORITIES.map((value) => ({ value, label: priorityMeta[value].label })),
];

export function BoardFilters({
  filters,
  members,
  onChange,
}: BoardFiltersProps) {
  const assignees = [
    { value: ANY, label: "Anyone" },
    ...members.map((m) => ({ value: m.id, label: m.name })),
  ];

  return (
    <search className="flex flex-wrap items-center gap-2 px-6 pb-4">
      <div className="relative">
        <Label htmlFor="task-search" className="sr-only">
          Search tasks
        </Label>
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id="task-search"
          type="search"
          placeholder="Search tasks…"
          value={filters.q}
          onChange={(event) => onChange({ q: event.target.value })}
          className="pl-8"
        />
      </div>

      <Label htmlFor="filter-priority" className="sr-only">
        Priority
      </Label>
      <Select
        items={priorities}
        value={filters.priority ?? ANY}
        onValueChange={(value) => {
          const priority = PRIORITIES.find((p) => p === value) ?? null;
          onChange({ priority });
        }}
      >
        <SelectTrigger id="filter-priority" className="w-40">
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

      <Label htmlFor="filter-assignee" className="sr-only">
        Assignee
      </Label>
      <Select
        items={assignees}
        value={filters.assigneeId ?? ANY}
        onValueChange={(value) => onChange({ assigneeId: value || null })}
      >
        <SelectTrigger id="filter-assignee" className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {assignees.map((a) => (
            <SelectItem key={a.value} value={a.value}>
              {a.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </search>
  );
}
