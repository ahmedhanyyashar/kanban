import { MoreHorizontal, Pencil, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";

import { ConfirmDeleteDialog } from "@repo/ui/blocks/confirm-delete-dialog";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";

type ColumnMenuProps = {
  title: string;
  /** A column with tasks cannot be deleted: the API refuses until it is empty. */
  taskCount: number;
  onAiGenerate: () => void;
  onRename: () => void;
  onDelete: () => void;
};

export function ColumnMenu({
  title,
  taskCount,
  onAiGenerate,
  onRename,
  onDelete,
}: ColumnMenuProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-xs"
              title="Column actions"
              aria-label="Column actions"
            />
          }
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onAiGenerate}>
            <Sparkles /> Generate with AI
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onRename}>
            <Pencil /> Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={taskCount > 0}
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 /> Delete column
            {taskCount > 0 && (
              <span className="ml-auto text-xs">Empty it first</span>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* outside the menu, so it outlives the menu closing */}
      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete column?"
        description={`“${title}” will be permanently removed. This can’t be undone.`}
        confirmLabel="Delete column"
        onConfirm={onDelete}
      />
    </>
  );
}
