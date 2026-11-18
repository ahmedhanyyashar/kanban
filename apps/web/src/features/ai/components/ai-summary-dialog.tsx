import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";

import type { BoardSummary } from "@/features/ai/lib/summary";

import { SummarySection } from "./summary-section";

type AiSummaryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Undefined while it is being written. */
  summary: BoardSummary | undefined;
};

export function AiSummaryDialog({
  open,
  onOpenChange,
  summary,
}: AiSummaryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5 text-primary" /> AI sprint summary
          </DialogTitle>
          <DialogDescription>
            Where the board stands and what to do next.
          </DialogDescription>
        </DialogHeader>

        {summary ? (
          <div className="flex flex-col gap-5">
            {summary.headline && (
              <p className="rounded-xl border border-primary/15 bg-brand-50 p-4 text-sm leading-relaxed">
                {summary.headline}
              </p>
            )}
            <SummarySection
              icon={CheckCircle2}
              title="Completed"
              items={summary.completed}
              tone="done"
            />
            <SummarySection
              icon={Clock}
              title="In progress"
              items={summary.inProgress}
              tone="progress"
            />
            <SummarySection
              icon={AlertTriangle}
              title="Risks and blockers"
              items={summary.risks}
              tone="risk"
            />
            <SummarySection
              icon={ArrowRight}
              title="Recommendations"
              items={summary.recommendations}
              tone="next"
            />
          </div>
        ) : (
          <p
            role="status"
            className="flex items-center justify-center gap-2 py-12 text-muted-foreground"
          >
            <Loader2 className="size-5 animate-spin text-primary" /> Analyzing
            board…
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
