import { OnModuleDestroy } from "@nestjs/common";
import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  Ack,
} from "@nestjs/websockets";
import { AuthService } from "@thallesp/nestjs-better-auth";
import { fromNodeHeaders } from "better-auth/node";
import type { DefaultEventsMap } from "socket.io";
import { Server, Socket } from "socket.io";
import { z } from "zod";

import { env } from "@/env";
import { PrismaService } from "@/lib/database/prisma.service.js";
import { withNumbers } from "@/lib/serialization/with-numbers";

type SocketAck = (response: { ok: boolean; error?: string }) => void;

interface SocketData {
  userId?: string;
  userName?: string;
}

type BoardServer = Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SocketData
>;
type AuthenticatedSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SocketData
>;

interface PresenceUser {
  id: string;
  name: string;
}

const boardIdSchema = z.uuid();

const cursorSchema = z.object({
  boardId: z.uuid(),
  x: z.number(),
  y: z.number(),
});

const BOARD_ROOM_PREFIX = "board:";
const CURSOR_UPDATE_INTERVAL = 33; // Approximately 30 updates per second.
/** How often a connected person's session is checked again; the longest an ended session keeps its live updates. */
export const SESSION_RECHECK_MS = 30_000;

@WebSocketGateway({
  cors: {
    origin: env.TRUSTED_ORIGINS.split(","),
    credentials: true,
  },
})
export class BoardGateway implements OnGatewayInit, OnModuleDestroy {
  @WebSocketServer()
  private server!: BoardServer;

  private readonly cursorTimestamps = new WeakMap<
    AuthenticatedSocket,
    Map<string, number>
  >();

  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
  ) {}

  private sessionCheck: NodeJS.Timeout | undefined;

  afterInit(server: BoardServer): void {
    this.server = server;
    // The session is read when a socket connects, and a socket can stay open for days: a session
    // that ends meanwhile (sign-out elsewhere, expiry, a revoke) must not keep receiving boards.
    this.sessionCheck = setInterval(() => {
      void this.dropEndedSessions();
    }, SESSION_RECHECK_MS);
    this.sessionCheck.unref();
  }

  onModuleDestroy(): void {
    clearInterval(this.sessionCheck);
  }

  /** Disconnects every socket whose session no longer exists. A check that fails is not a verdict: that socket stays. */
  async dropEndedSessions(): Promise<void> {
    for (const socket of await this.server.fetchSockets()) {
      try {
        const session = await this.auth.api.getSession({
          headers: fromNodeHeaders(socket.handshake.headers),
          query: { disableCookieCache: true },
        });
        if (!session) socket.disconnect(true);
      } catch {
        // the database may be briefly unreachable: the next check decides
      }
    }
  }

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const session = await this.auth.api.getSession({
        headers: fromNodeHeaders(client.handshake.headers),
      });

      if (!session) {
        client.disconnect(true);
        return;
      }

      client.data.userId = session.user.id;
      client.data.userName = session.user.name;

      // Preserve the existing positional cursor event contract:
      // presence:cursor(boardId, x, y).
      client.on(
        "presence:cursor",
        (boardId: unknown, x: unknown, y: unknown) => {
          this.handleCursor(client, boardId, x, y);
        },
      );

      // Handle presence before Socket.IO automatically clears the rooms.
      client.on("disconnecting", () => {
        void this.handleDisconnecting(client);
      });
    } catch {
      client.disconnect(true);
    }
  }

  private boardRoom(boardId: string): string {
    return `${BOARD_ROOM_PREFIX}${boardId}`;
  }

  private getPresenceUser(
    socket: Pick<AuthenticatedSocket, "data">,
  ): PresenceUser | null {
    const { userId, userName } = socket.data;

    if (!userId) return null;

    return {
      id: userId,
      name: userName ?? userId,
    };
  }

  private async userCanAccessBoard(
    userId: string,
    boardId: string,
  ): Promise<boolean> {
    const board = await this.prisma.board.findFirst({
      where: {
        id: boardId,
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      select: { id: true },
    });

    return Boolean(board);
  }

  private async getRoomSockets(boardId: string) {
    return this.server.in(this.boardRoom(boardId)).fetchSockets();
  }

  private async isUserPresent(
    boardId: string,
    userId: string,
  ): Promise<boolean> {
    const sockets = await this.getRoomSockets(boardId);

    return sockets.some((socket) => socket.data.userId === userId);
  }

  private async getPresentUsers(
    boardId: string,
    excludeUserId: string,
  ): Promise<PresenceUser[]> {
    const sockets = await this.getRoomSockets(boardId);
    const seen = new Set([excludeUserId]);
    const users: PresenceUser[] = [];

    for (const socket of sockets) {
      const user = this.getPresenceUser(socket);

      if (!user || seen.has(user.id)) continue;

      seen.add(user.id);
      users.push(user);
    }

    return users;
  }

  emitToBoard(boardId: string, event: string, payload: unknown): void {
    this.server.to(this.boardRoom(boardId)).emit(event, withNumbers(payload));
  }

  @SubscribeMessage("board:join")
  async joinBoard(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: unknown,
    @Ack() ack: SocketAck,
  ): Promise<void> {
    const parsed = boardIdSchema.safeParse(payload);

    if (!parsed.success) {
      ack?.({ ok: false, error: "Invalid board ID" });
      return;
    }

    const { boardId } = { boardId: parsed.data };
    const user = this.getPresenceUser(client);

    if (!user) {
      ack?.({ ok: false, error: "Authentication required" });
      return;
    }

    try {
      const hasAccess = await this.userCanAccessBoard(user.id, boardId);

      if (!hasAccess) {
        ack?.({ ok: false, error: "No access to this board" });
        return;
      }

      const room = this.boardRoom(boardId);

      // Joining an already joined room must not duplicate presence events.
      const alreadyJoined = client.rooms.has(room);

      // Another tab belonging to this user may already be present.
      const userAlreadyPresent = await this.isUserPresent(boardId, user.id);

      await client.join(room);

      if (!alreadyJoined && !userAlreadyPresent) {
        client.to(room).emit("presence:join", {
          boardId,
          user,
        });
      }

      const users = await this.getPresentUsers(boardId, user.id);

      client.emit("presence:sync", {
        boardId,
        users,
      });

      ack?.({ ok: true });
    } catch {
      ack?.({ ok: false, error: "Failed to join board" });
    }
  }

  @SubscribeMessage("board:leave")
  async leaveBoard(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: unknown,
    @Ack() ack: SocketAck,
  ): Promise<void> {
    const parsed = boardIdSchema.safeParse(payload);

    if (!parsed.success) {
      ack?.({ ok: false, error: "Invalid board ID" });
      return;
    }

    const boardId = parsed.data;
    const room = this.boardRoom(boardId);
    const user = this.getPresenceUser(client);

    if (!user || !client.rooms.has(room)) {
      ack?.({ ok: true });
      return;
    }

    try {
      await client.leave(room);

      // Only announce departure when the user's last tab leaves.
      const userStillPresent = await this.isUserPresent(boardId, user.id);

      if (!userStillPresent) {
        this.server.to(room).emit("presence:leave", {
          boardId,
          user,
        });
      }

      ack?.({ ok: true });
    } catch {
      ack?.({ ok: false, error: "Failed to leave board" });
    }
  }

  private handleCursor(
    client: AuthenticatedSocket,
    boardId: unknown,
    x: unknown,
    y: unknown,
  ): void {
    const parsed = cursorSchema.safeParse({ boardId, x, y });

    if (!parsed.success) return;

    const user = this.getPresenceUser(client);
    if (!user) return;

    const { boardId: id, x: cursorX, y: cursorY } = parsed.data;
    const room = this.boardRoom(id);

    // A client can only broadcast cursors to boards it has joined.
    if (!client.rooms.has(room)) return;

    const now = Date.now();
    let timestamps = this.cursorTimestamps.get(client);

    if (!timestamps) {
      timestamps = new Map();
      this.cursorTimestamps.set(client, timestamps);
    }

    const lastUpdate = timestamps.get(id) ?? 0;

    if (now - lastUpdate < CURSOR_UPDATE_INTERVAL) return;

    timestamps.set(id, now);

    client.to(room).emit("presence:cursor", {
      boardId: id,
      user,
      x: cursorX,
      y: cursorY,
    });
  }

  private async handleDisconnecting(
    client: AuthenticatedSocket,
  ): Promise<void> {
    const user = this.getPresenceUser(client);

    if (!user) return;

    for (const room of client.rooms) {
      if (room === client.id || !room.startsWith(BOARD_ROOM_PREFIX)) {
        continue;
      }

      const boardId = room.slice(BOARD_ROOM_PREFIX.length);

      // Other tabs belonging to the same user keep them present.
      const sockets = await this.getRoomSockets(boardId);
      const anotherSocketIsPresent = sockets.some(
        (socket) => socket.id !== client.id && socket.data.userId === user.id,
      );

      if (!anotherSocketIsPresent) {
        client.to(room).emit("presence:leave", {
          boardId,
          user,
        });
      }
    }
  }

  async removeUserFromBoard(boardId: string, userId: string): Promise<void> {
    const room = this.boardRoom(boardId);
    const sockets = await this.getRoomSockets(boardId);

    const userSockets = sockets.filter(
      (socket) => socket.data.userId === userId,
    );

    const [first] = userSockets;
    if (!first) return;

    // Evict every tab belonging to the removed member.
    for (const socket of userSockets) socket.leave(room);

    this.server.to(room).emit("presence:leave", {
      boardId,
      user: {
        id: userId,
        name: first.data.userName ?? userId,
      },
    });
  }
}
