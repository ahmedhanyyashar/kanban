import { useOutletContext } from "react-router";

/** What the shell lets a page ask of it; the shell owns the dialogs. */
export type ShellActions = { openCreateBoard: () => void };

export const useShellActions = () => useOutletContext<ShellActions>();
