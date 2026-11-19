import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";

import { ADMIN_ROLES, DEFAULT_ROLE, ac, roles } from "@repo/shared/permissions";

import { env } from "@/env";
import type { PrismaClient } from "@/generated/prisma/client";

const webUrls = env.TRUSTED_ORIGINS.split(",");

/** The one auth instance: the module builds it with the API's Prisma client, and so does the seed script. */
export function createAuth(db: PrismaClient) {
  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    database: prismaAdapter(db, { provider: "postgresql" }),
    emailAndPassword: {
      enabled: true,
    },
    // Better Auth limits only in production unless told to; guessing a password is slowed in every environment (SR-06)
    rateLimit: {
      enabled: true,
      window: 60,
      max: 100,
      customRules: {
        "/sign-in/email": { window: 60, max: 5 },
        "/sign-up/email": { window: 60, max: 5 },
      },
    },
    // Sign in with Google, when both are set
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
          socialProviders: {
            google: {
              clientId: env.GOOGLE_CLIENT_ID,
              clientSecret: env.GOOGLE_CLIENT_SECRET,
            },
          },
        }
      : {}),
    trustedOrigins: [...webUrls],
    plugins: [
      admin({
        ac,
        roles,
        defaultRole: DEFAULT_ROLE,
        adminRoles: [...ADMIN_ROLES],
      }),
    ],
  });
}
