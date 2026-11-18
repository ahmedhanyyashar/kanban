import type { AuthService } from "@thallesp/nestjs-better-auth";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mock, mockDeep } from "vitest-mock-extended";

import type { PrismaService } from "@/lib/database/prisma.service";

import { BoardGateway } from "./board.gateway.js";

type Server = Parameters<BoardGateway["afterInit"]>[0];
type Remote = Awaited<ReturnType<Server["fetchSockets"]>>[number];
type Session = Awaited<ReturnType<AuthService["api"]["getSession"]>>;

const now = new Date();
const session: Session = {
  session: {
    id: "s1",
    createdAt: now,
    updatedAt: now,
    userId: "u1",
    expiresAt: now,
    token: "t",
  },
  user: {
    id: "u1",
    createdAt: now,
    updatedAt: now,
    email: "a@example.com",
    emailVerified: true,
    name: "A",
  },
};

/** A gateway with one connected socket per name; the session checks answer in that order. */
function connect(answers: ("alive" | "ended" | "fails")[]) {
  const auth = mockDeep<AuthService>();
  for (const answer of answers)
    if (answer === "fails")
      auth.api.getSession.mockRejectedValueOnce(
        new Error("database unreachable"),
      );
    else
      auth.api.getSession.mockResolvedValueOnce(
        answer === "alive" ? session : null,
      );

  const disconnects = answers.map(() => vi.fn());
  const server = mock<Server>();
  server.fetchSockets.mockResolvedValue(
    disconnects.map((disconnect) =>
      mock<Remote>({ handshake: { headers: {} }, disconnect }),
    ),
  );

  const gateway = new BoardGateway(mockDeep<PrismaService>(), auth);
  gateway.afterInit(server);
  return { gateway, disconnects };
}

let gateway: BoardGateway | undefined;
afterEach(() => gateway?.onModuleDestroy());

describe("a connected person whose session has ended", () => {
  it("is disconnected, and a person whose session holds is not", async () => {
    const connected = connect(["alive", "ended"]);
    gateway = connected.gateway;

    await gateway.dropEndedSessions();

    expect(connected.disconnects[0]).not.toHaveBeenCalled();
    expect(connected.disconnects[1]).toHaveBeenCalledWith(true);
  });

  it("is kept when the check itself fails, because that says nothing about the session", async () => {
    const connected = connect(["fails"]);
    gateway = connected.gateway;

    await gateway.dropEndedSessions();

    expect(connected.disconnects[0]).not.toHaveBeenCalled();
  });
});
