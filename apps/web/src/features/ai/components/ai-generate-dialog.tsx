import { Sparkles } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";

import type {
  GenerateInput,
  TaskSuggestion,
} from "@/features/ai/lib/generate-form";

import { AiGenerateForm } from "./ai-generate-form";

type AiGenerateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: { id: string; title: string }[];
  /** The column the dialog was opened from. */
  defaultColumnId: string;
  onGenerate: (input: GenerateInput) => Promise<TaskSuggestion[]>;
  onAdd: (tasks: TaskSuggestion[], columnId: string) => Promise<void>;
};

export function AiGenerateDialog({
  open,
  onOpenChange,
  columns,
  defaultColumnId,
  onGenerate,
  onAdd,
}: AiGenerateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" /> AI task generator
          </DialogTitle>
          <DialogDescription>
            Describe a goal and let AI draft a backlog.
          </DialogDescription>
        </DialogHeader>
        {/* rebuilt each time the dialog opens, so the goal and suggestions start empty */}
        <AiGenerateForm
          columns={columns}
          defaultColumnId={defaultColumnId}
          onGenerate={onGenerate}
          onAdd={async (tasks, columnId) => {
            await onAdd(tasks, columnId);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
