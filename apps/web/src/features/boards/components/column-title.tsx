import { useState, type SyntheticEvent } from "react";

import { Input } from "@repo/ui/components/input";

type ColumnTitleProps = {
  title: string;
  editing: boolean;
  onEditingChange: (editing: boolean) => void;
  onRename: (title: string) => void;
};

// Stable so it runs once, when the input mounts, not on every keystroke.
const focusAndSelect = (input: HTMLInputElement | null) => {
  input?.focus();
  input?.select();
};

export function ColumnTitle({
  title,
  editing,
  onEditingChange,
  onRename,
}: ColumnTitleProps) {
  if (!editing)
    return (
      <h2
        className="cursor-text text-[15px] font-bold"
        onDoubleClick={() => onEditingChange(true)}
      >
        {title}
      </h2>
    );
  return (
    <TitleEditor
      initial={title}
      onDone={(next) => {
        if (next && next !== title) onRename(next);
        onEditingChange(false);
      }}
    />
  );
}

// The draft lives here, so every edit starts from the current title without syncing effects.
function TitleEditor({
  initial,
  onDone,
}: {
  initial: string;
  onDone: (title: string) => void;
}) {
  const [draft, setDraft] = useState(initial);
  const commit = (e?: SyntheticEvent) => {
    e?.preventDefault();
    onDone(draft.trim());
  };

  return (
    <form onSubmit={commit} className="w-full">
      <Input
        ref={focusAndSelect}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Escape" && onDone(initial)}
        aria-label="Column title"
      />
    </form>
  );
}
