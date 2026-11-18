import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";

import { MemberInviteForm } from "./member-invite-form";
import { MemberList, type BoardMember } from "./member-list";

type MembersDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: BoardMember[];
  /** Owners and admins can invite and remove; everyone else only sees the list. */
  canManage: boolean;
  onInvite: (email: string) => Promise<{ name: string }>;
  onRemove: (userId: string) => void;
};

export function MembersDialog({
  open,
  onOpenChange,
  members,
  canManage,
  onInvite,
  onRemove,
}: MembersDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Members</DialogTitle>
          <DialogDescription>
            Invite teammates to collaborate in real time.
          </DialogDescription>
        </DialogHeader>
        {canManage && <MemberInviteForm onInvite={onInvite} />}
        <MemberList
          members={members}
          canManage={canManage}
          onRemove={onRemove}
        />
      </DialogContent>
    </Dialog>
  );
}
