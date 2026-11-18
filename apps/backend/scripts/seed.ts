import { PrismaPg } from "@prisma/adapter-pg";

import { env } from "@/env";
import { PrismaClient } from "@/generated/prisma/client";
import { createAuth } from "@/lib/auth/auth";

const production = process.env["NODE_ENV"] === "production";
const password =
  process.env["SEED_PASSWORD"] ?? (production ? "" : "password1234");
if (!password)
  throw new Error("SEED_PASSWORD must be set to seed in production");

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
});
const auth = createAuth(db);

// One account per role: <role>@example.com, or another domain through SEED_EMAIL_DOMAIN.
const domain = process.env["SEED_EMAIL_DOMAIN"] ?? "example.com";
const roles = ["member"];

const DAY = 86_400_000;
const COLUMNS = ["Todo", "In Progress", "Review", "Done"];

const USERS = [
  { key: "alex", name: "Alex Rivera" },
  { key: "maya", name: "Maya Chen" },
  { key: "diego", name: "Diego Santos" },
  { key: "priya", name: "Priya Nair" },
  { key: "sam", name: "Sam Okafor" },
  { key: "lena", name: "Lena Fischer" },
];

const BOARDS = [
  {
    title: "Product Roadmap",
    description: "Quarterly planning, OKRS and feature prioritization",
    color: "#2f8159",
    owner: "alex",
    members: ["maya", "diego", "priya"],
    updatedDaysAgo: 0.3,
    tasks: [
      "Define Q3 OKRs",
      "Prioritize feature backlog",
      "User interview synthesis",
      "Pricing experiment plan",
      "Competitor analysis",
      "Roadmap review with leadership",
      "Define success metrics",
      "Beta feedback triage",
      "Quarterly planning deck",
      "Stakeholder alignment",
      "Feature flag rollout plan",
      "Update public roadmap",
    ],
  },
];

const COL_CYCLE = [0, 1, 1, 2, 3, 0, 2, 3, 1, 3, 0, 1];
const PRIO_CYCLE = [
  "medium",
  "high",
  "low",
  "urgent",
  "medium",
  "high",
  "low",
  "urgent",
];
const DUE_CYCLE = [
  -9,
  2,
  null,
  5,
  -2,
  14,
  1,
  null,
  20,
  -4,
  6,
  9,
  3,
  null,
  12,
  -1,
  7,
];

/** A calendar day, `offset` days from today, at UTC midnight: how due dates are stored. */
function calendarDay(offset: number): Date {
  const today = new Date();
  return new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + offset),
  );
}

/** Demo people, boards and tasks, so a fresh database has something to look at. Not for production. */
async function seedDemo() {
  const ids = new Map<string, string>();
  for (const { key, name } of USERS) {
    const email = `${key}@${domain}`;
    const existing = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) {
      ids.set(key, existing.id);
      continue;
    }
    await auth.api.signUpEmail({ body: { email, password, name } });
    const user = await db.user.update({
      where: { email },
      data: { emailVerified: true },
      select: { id: true },
    });
    ids.set(key, user.id);
    console.log(`created  ${email}`);
  }
  const idOf = (key: string) => {
    const id = ids.get(key);
    if (!id) throw new Error(`No seeded user "${key}"`);
    return id;
  };

  for (const board of BOARDS) {
    const ownerId = idOf(board.owner);
    if (
      await db.board.findFirst({
        where: { title: board.title, ownerId },
        select: { id: true },
      })
    ) {
      console.log(`exists   board ${board.title}`);
      continue;
    }
    const people = [board.owner, ...board.members].map(idOf);
    const created = await db.board.create({
      data: {
        title: board.title,
        description: board.description,
        color: board.color,
        ownerId,
        updatedAt: new Date(Date.now() - board.updatedDaysAgo * DAY),
        members: {
          create: [
            { userId: ownerId, role: "owner" },
            ...board.members.map((key) => ({
              userId: idOf(key),
              role: "member",
            })),
          ],
        },
        columns: {
          create: COLUMNS.map((title, index) => ({
            title,
            position: (index + 1) * 1000,
          })),
        },
      },
      include: { columns: { orderBy: { position: "asc" } } },
    });

    const nextPosition = new Map<string, number>();
    await db.task.createMany({
      data: board.tasks.flatMap((title, index) => {
        const column =
          created.columns[COL_CYCLE[index % COL_CYCLE.length] ?? 0];
        if (!column) return [];
        const position = (nextPosition.get(column.id) ?? 0) + 1000;
        nextPosition.set(column.id, position);
        const due = DUE_CYCLE[index % DUE_CYCLE.length];
        return [
          {
            boardId: created.id,
            columnId: column.id,
            title,
            priority: PRIO_CYCLE[index % PRIO_CYCLE.length] ?? "medium",
            position,
            createdBy: ownerId,
            assigneeId: people[index % people.length] ?? null,
            dueDate: due == null ? null : calendarDay(due),
          },
        ];
      }),
    });
    console.log(`created  board ${board.title}`);
  }
}

async function main() {
  for (const role of roles) {
    const email = `${role}@${domain}`;
    if (await db.user.findUnique({ where: { email } })) {
      console.log(`exists   ${email}`);
      continue;
    }
    await auth.api.signUpEmail({ body: { email, password, name: role } });
    // the operator made this account, not someone at the sign-up form
    await db.user.update({
      where: { email },
      data: { emailVerified: true, role },
    });
    console.log(`created  ${email}`);
  }
  if (!production) await seedDemo();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
