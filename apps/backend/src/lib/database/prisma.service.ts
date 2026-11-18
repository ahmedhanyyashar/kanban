import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";

import { env } from "@/env";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * The generated PrismaClient as an injectable. The schema is `prisma/schema.prisma` and the client is
 * generated into `src/generated`, not committed. The `PrismaPg` driver adapter is required since Prisma 7; the log levels are Prisma's own constructor option.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
      log:
        env.NODE_ENV === "development"
          ? (["query", "info", "warn", "error"] as const)
          : (["error"] as const),
    });
  }

  async onModuleInit() {
    await this.$connect();
    await this.$queryRaw`SELECT 1`;
    this.logger.log("Database connected");
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log("Database disconnected");
  }

  /** Rejects when the database cannot be reached; /health/ready awaits it. */
  async ping() {
    await this.$queryRaw`SELECT 1`;
  }
}
