import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { z } from "zod";

import { env } from "@/env";
import { boardKeys } from "@/features/boards/api/keys";
import {
  BOARD_EVENTS,
  applyBoardEvent,
} from "@/features/boards/lib/board-events";
import { authClient } from "@/lib/auth-client";

import { useBoardCache } from "./use-board-cache";

const presenceUser = z.object({ id: z.string(), name: z.string() });
const presenceSync = z.object({ users: z.array(presenceUser) });
const presenceChange = z.object({ user: presenceUser });

export type PresenceUser = z.infer<typeof presenceUser>;

/**
 * Keeps an open board in step with what other people do to it, and says who else is looking.
 * Events patch the cached board; after a reconnect, which may have missed some, it is fetched again.
 */
export function useBoardRealtime(boardId: string): PresenceUser[] {
  const queryClient = useQueryClient();
  const { patch } = useBoardCache(boardId);
  const [others, setOthers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    // the session cookie authenticates the connection, as it does a request
    const socket = io(env.VITE_API_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });

    // joins on the first connection and on every reconnection
    socket.on("connect", () => socket.emit("board:join", boardId));
    socket.io.on("reconnect", () =>
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) }),
    );
    // the server ends a connection whose session is gone: look at the session, and a person who is
    // signed out is sent to sign in rather than left on a board that no longer updates
    socket.on("disconnect", (reason) => {
      if (reason === "io server disconnect")
        authClient.$store.notify("$sessionSignal");
    });
    socket.on("activity:new", () =>
      queryClient.invalidateQueries({
        queryKey: boardKeys.activities(boardId),
      }),
    );
    for (const event of BOARD_EVENTS)
      socket.on(event, (payload: unknown) =>
        patch((detail) => applyBoardEvent(detail, event, payload)),
      );

    socket.on("presence:sync", (payload: unknown) => {
      const sync = presenceSync.safeParse(payload);
      if (sync.success) setOthers(sync.data.users);
    });
    socket.on("presence:join", (payload: unknown) => {
      const change = presenceChange.safeParse(payload);
      if (!change.success) return;
      const { user } = change.data;
      setOthers((current) =>
        current.some((u) => u.id === user.id) ? current : [...current, user],
      );
    });
    socket.on("presence:leave", (payload: unknown) => {
      const change = presenceChange.safeParse(payload);
      if (change.success)
        setOthers((current) =>
          current.filter((u) => u.id !== change.data.user.id),
        );
    });

    return () => {
      socket.emit("board:leave", boardId);
      socket.disconnect();
      setOthers([]);
    };
  }, [boardId, patch, queryClient]);

  return others;
}
