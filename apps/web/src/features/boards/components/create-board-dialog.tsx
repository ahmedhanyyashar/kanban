import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";

import type { BoardInput } from "@/features/boards/lib/board-form";

import { CreateBoardForm } from "./create-board-form";

type CreateBoardDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Creates the board (and may navigate to it). Rejecting keeps the dialog open. */
  onCreate: (input: BoardInput) => Promise<void>;
};

export function CreateBoardDialog({
  open,
  onOpenChange,
  onCreate,
}: CreateBoardDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a board</DialogTitle>
          <DialogDescription>
            Boards start with Todo, In Progress, Review and Done.
          </DialogDescription>
        </DialogHeader>
        {/* rebuilt each time the dialog opens, so it always starts empty */}
        <CreateBoardForm
          onCreate={async (input) => {
            await onCreate(input);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
