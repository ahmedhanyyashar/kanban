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
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
