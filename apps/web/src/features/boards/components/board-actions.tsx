import { Activity, FileText, Users } from "lucide-react";

import { Button } from "@repo/ui/components/button";

import { UserAvatar } from "@/features/users/components/user-avatar";

type BoardActionsProps = {
  /** Other people looking at the board right now. */
  others: { id: string; name: string }[];
  onSummary: () => void;
  onMembers: () => void;
  onActivity: () => void;
};

/** What can be done with the board as a whole, and who else is here. */
export function BoardActions({
  others,
  onSummary,
  onMembers,
  onActivity,
}: BoardActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {others.length > 0 && (
        <ul
          aria-label="People viewing this board"
          className="mr-1 flex items-center -space-x-2"
        >
          {others.slice(0, 4).map((person) => (
            <li key={person.id}>
              <UserAvatar name={person.name} size="sm" />
            </li>
          ))}
        </ul>
      )}
      <Button variant="outline" onClick={onSummary}>
        <FileText /> Summary
      </Button>
      <Button variant="outline" onClick={onMembers}>
        <Users /> Members
      </Button>
      <Button variant="outline" onClick={onActivity}>
        <Activity /> Activity
      </Button>
    </div>
  );
}
