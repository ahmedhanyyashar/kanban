import { Activity } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/components/sheet";
import { Skeleton } from "@repo/ui/components/skeleton";
import { formatRelativeTime } from "@repo/ui/lib/utils";

import { UserAvatar } from "@/features/users/components/user-avatar";

export type ActivityItem = {
  id: string;
  message: string;
  createdAt: string;
  user: { name: string; image: string | null };
};

type ActivitySheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Newest first; undefined while it loads. */
  activities: ActivityItem[] | undefined;
};

export function ActivitySheet({
  open,
  onOpenChange,
  activities,
}: ActivitySheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-80 sm:max-w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Activity className="size-4 text-primary" /> Activity
          </SheetTitle>
          <SheetDescription>Recent changes on this board.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {!activities ? (
            <div role="status" className="flex flex-col gap-3">
              <span className="sr-only">Loading activity</span>
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="h-12" />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No activity yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {activities.map((activity) => (
                <li
                  key={activity.id}
                  className="flex gap-3 rounded-lg px-2 py-2"
                >
                  <UserAvatar
                    name={activity.user.name}
                    src={activity.user.image}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="text-sm leading-snug text-muted-foreground">
                      {activity.message}
                    </p>
                    <time
                      dateTime={activity.createdAt}
                      className="mt-0.5 block text-[11px] text-muted-foreground"
                    >
                      {formatRelativeTime(activity.createdAt)}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
