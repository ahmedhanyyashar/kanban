import { Plus } from "lucide-react";
import { NavLink } from "react-router";

import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@repo/ui/components/sidebar";

type SidebarBoardsProps = {
  /** Undefined while they load. */
  boards: { id: string; title: string; color: string }[] | undefined;
  activeBoardId: string | undefined;
  onCreateBoard: () => void;
};

export function SidebarBoards({
  boards,
  activeBoardId,
  onCreateBoard,
}: SidebarBoardsProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Boards</SidebarGroupLabel>
      <SidebarGroupAction
        title="New board"
        aria-label="New board"
        onClick={onCreateBoard}
      >
        <Plus />
      </SidebarGroupAction>
      <SidebarGroupContent>
        <SidebarMenu>
          {!boards
            ? Array.from({ length: 3 }, (_, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuSkeleton />
                </SidebarMenuItem>
              ))
            : boards.map((board) => (
                <SidebarMenuItem key={board.id}>
                  <SidebarMenuButton
                    render={<NavLink to={`/board/${board.id}`} />}
                    isActive={board.id === activeBoardId}
                    tooltip={board.title}
                  >
                    <span
                      aria-hidden
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: board.color }}
                    />
                    <span>{board.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
          {boards?.length === 0 && (
            <li className="px-2 py-1.5 text-sm text-muted-foreground">
              No boards yet.
            </li>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
