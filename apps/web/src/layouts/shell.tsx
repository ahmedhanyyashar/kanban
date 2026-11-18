import { useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  CheckSquare,
  Home,
  Plus,
  Search,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Navigate,
  NavLink,
  Outlet,
  useLocation,
  useMatch,
  useNavigate,
} from "react-router";

import { ModeToggle } from "@repo/ui/blocks/mode-toggle";
import { SkipLink } from "@repo/ui/blocks/skip-link";
import { Button } from "@repo/ui/components/button";
import { Separator } from "@repo/ui/components/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@repo/ui/components/sidebar";

import { CommandMenu } from "@/components/command-menu";
import { CreateBoardDialog } from "@/features/boards/components/create-board-dialog";
import { useBoards, useCreateBoard } from "@/features/boards/hooks/use-boards";
import { useCommandShortcut } from "@/hooks/use-command-shortcut";
import { useSignOut } from "@/hooks/use-sign-out";
import { authClient } from "@/lib/auth-client";
import { APP_HOME } from "@/lib/routes";

import type { ShellActions } from "./shell-context";
import { SidebarBoards } from "./sidebar-boards";
import { UserMenu } from "./user-menu";

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

const nav: NavItem[] = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "My tasks", url: "/my-tasks", icon: CheckSquare },
  { title: "Calendar", url: "/calendar", icon: CalendarDays },
  { title: "Team", url: "/team", icon: Users },
  { title: "Settings", url: "/settings", icon: Settings },
];

/** Everything signed-in lives under this layout: no session, no shell, back to sign-in. */
export function ShellLayout() {
  const { data: session, isPending } = authClient.useSession();
  const location = useLocation();
  const queryClient = useQueryClient();
  const signedOut = !isPending && !session;

  // Whatever ended the session, the next person on this tab must not see the last one's data.
  useEffect(() => {
    if (signedOut) queryClient.clear();
  }, [signedOut, queryClient]);

  if (isPending)
    return <p className="p-8 text-sm text-muted-foreground">Loading...</p>;
  if (!session)
    return (
      <Navigate
        to={
          "/sign-in?redirect=" +
          encodeURIComponent(location.pathname + location.search)
        }
        replace
      />
    );

  return <Shell user={session.user} items={nav} />;
}

type ShellProps = {
  user: { name: string; email: string; image?: string | null | undefined };
  items: NavItem[];
};

function Shell({ user, items }: ShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const signOut = useSignOut();
  const boards = useBoards();
  const createBoard = useCreateBoard();
  const [createOpen, setCreateOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const activeBoardId = useMatch("/board/:boardId")?.params.boardId;

  const actions = useMemo<ShellActions>(
    () => ({ openCreateBoard: () => setCreateOpen(true) }),
    [],
  );

  useCommandShortcut(useCallback(() => setCommandOpen((open) => !open), []));

  return (
    <SidebarProvider>
      <SkipLink />
      <Sidebar collapsible="offcanvas">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton render={<NavLink to={APP_HOME} />}>
                <Home />
                <span className="text-base font-semibold">Flowboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((i) => (
                  <SidebarMenuItem key={i.url}>
                    <SidebarMenuButton
                      render={<NavLink to={i.url} end />}
                      tooltip={i.title}
                      isActive={location.pathname.startsWith(i.url)}
                    >
                      <i.icon />
                      <span>{i.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarBoards
            boards={boards.data}
            activeBoardId={activeBoardId}
            onCreateBoard={() => setCreateOpen(true)}
          />
        </SidebarContent>
        <SidebarFooter>
          <UserMenu user={user} onSignOut={signOut} />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset id="main" tabIndex={-1} className="outline-none">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" onClick={() => setCommandOpen(true)}>
              <Search />
              <span className="sr-only sm:not-sr-only">Search…</span>
              <kbd className="ml-2 hidden text-xs text-muted-foreground sm:inline">
                Ctrl K
              </kbd>
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus />
              <span className="sr-only sm:not-sr-only">New board</span>
            </Button>
            <ModeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Outlet context={actions} />
        </div>
      </SidebarInset>

      <CommandMenu
        open={commandOpen}
        onOpenChange={setCommandOpen}
        pages={items.map((i) => ({
          label: i.title,
          to: i.url,
          icon: i.icon,
        }))}
        boards={boards.data ?? []}
        onNavigate={(to) => void navigate(to)}
        onCreateBoard={() => setCreateOpen(true)}
      />
      <CreateBoardDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={async (input) => {
          const board = await createBoard.mutateAsync(input);
          void navigate(`/board/${board.id}`);
        }}
      />
    </SidebarProvider>
  );
}
