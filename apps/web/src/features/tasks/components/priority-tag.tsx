import { Badge } from "@repo/ui/components/badge";
import { cn } from "@repo/ui/lib/utils";

import { priorityMeta, type Priority } from "@/features/tasks/lib/priority";

export function PriorityTag({ priority }: { priority: Priority }) {
  const meta = priorityMeta[priority];
  return (
    <Badge
      variant="secondary"
      className={cn("font-bold tracking-wider uppercase", meta.tag)}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </Badge>
  );
}
