import { LayoutGrid, Plus, type LucideIcon } from "lucide-react";
import { useState } from "react";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/ui/components/command";

type CommandMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Places the viewer can jump to. */
  pages: { label: string; to: string; icon: LucideIcon }[];
  boards: { id: string; title: string; color: string }[];
  onNavigate: (to: string) => void;
  onCreateBoard: () => void;
};

export function CommandMenu({
  open,
  onOpenChange,
  ...palette
}: CommandMenuProps) {
  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search"
      description="Search boards or run a command."
    >
      {/* mounted only while open, so the search always starts empty */}
      <Palette onClose={() => onOpenChange(false)} {...palette} />
    </CommandDialog>
  );
}

type PaletteProps = Omit<CommandMenuProps, "open" | "onOpenChange"> & {
  onClose: () => void;
};

function Palette({
  pages,
  boards,
  onNavigate,
  onCreateBoard,
  onClose,
}: PaletteProps) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const matches = (label: string) => !q || label.toLowerCase().includes(q);
  const run = (action: () => void) => {
    onClose();
    action();
  };

  const pageMatches = pages.filter((page) => matches(page.label));
  const boardMatches = boards.filter((board) => matches(board.title));

  return (
    // filtering is done here, on the labels only: the library's fuzzy match would also hit ids
    <Command shouldFilter={false}>
      <CommandInput
        value={query}
        onValueChange={setQuery}
        placeholder="Search boards or run a command…"
      />
      <CommandList>
        <CommandEmpty>No results</CommandEmpty>

        {matches("Create new board") && (
          <CommandGroup heading="Actions">
            <CommandItem
              value="action-create-board"
              onSelect={() => run(onCreateBoard)}
            >
              <Plus /> Create new board
            </CommandItem>
          </CommandGroup>
        )}

        {pageMatches.length > 0 && (
          <CommandGroup heading="Go to">
            {pageMatches.map(({ label, to, icon: Icon }) => (
              <CommandItem
                key={to}
                value={`page-${to}`}
                onSelect={() => run(() => onNavigate(to))}
              >
                <Icon /> {label}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {boardMatches.length > 0 && (
          <CommandGroup heading="Boards">
            {boardMatches.map((board) => (
              <CommandItem
                key={board.id}
                value={`board-${board.id}`}
                onSelect={() => run(() => onNavigate(`/board/${board.id}`))}
              >
                <LayoutGrid style={{ color: board.color }} /> {board.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
}
