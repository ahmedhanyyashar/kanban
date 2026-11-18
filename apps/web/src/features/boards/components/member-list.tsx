import { X } from "lucide-react";
import { useState } from "react";

import { ConfirmDeleteDialog } from "@repo/ui/blocks/confirm-delete-dialog";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";

import { UserAvatar } from "@/features/users/components/user-avatar";

export type MemberRole = "owner" | "admin" | "member";
export type BoardMember = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: MemberRole;
};

type MemberListProps = {
  members: BoardMember[];
  /** Whether the viewer may remove people. The owner can never be removed. */
  canManage: boolean;
  onRemove: (userId: string) => void;
};

export function MemberList({ members, canManage, onRemove }: MemberListProps) {
  const [removing, setRemoving] = useState<BoardMember | null>(null);

  return (
    <>
      <ul className="flex flex-col gap-1">
        {members.map((member) => (
          <li
            key={member.id}
            className="flex items-center gap-3 rounded-lg px-2 py-2"
          >
            <UserAvatar name={member.name} src={member.image} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{member.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {member.email}
              </p>
            </div>
            <Badge variant="secondary" className="capitalize">
              {member.role}
            </Badge>
            {canManage && member.role !== "owner" && (
              <Button
                variant="ghost"
                size="icon-xs"
                title={`Remove ${member.name}`}
                aria-label={`Remove ${member.name}`}
                onClick={() => setRemoving(member)}
              >
                <X />
              </Button>
            )}
          </li>
        ))}
      </ul>

      <ConfirmDeleteDialog
        open={removing !== null}
        onOpenChange={(open) => {
          if (!open) setRemoving(null);
        }}
        title="Remove member?"
        description={`${removing?.name ?? "They"} will lose access to this board.`}
        confirmLabel="Remove"
        onConfirm={() => {
          if (removing) onRemove(removing.id);
        }}
      />
    </>
  );
}
