import { Module } from "@nestjs/common";
import { AuthModule } from "@thallesp/nestjs-better-auth";

import { DatabaseModule } from "@/lib/database/database.module";
import { PrismaService } from "@/lib/database/prisma.service";

import { createAuth } from "./auth";

// The library's global guard refuses a request with no session. A public route says so: @AllowAnonymous(), or
// @OptionalAuth() when the session is wanted if there is one.
@Module({
  imports: [
    AuthModule.forRootAsync({
      imports: [DatabaseModule],
      inject: [PrismaService],
      useFactory: (prisma: PrismaService) => ({ auth: createAuth(prisma) }),
    }),
  ],
})
export class SessionModule {}
