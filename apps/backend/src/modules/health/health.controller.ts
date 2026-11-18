import { Controller, Get, HttpStatus, Res } from "@nestjs/common";
import type { Response } from "express";

import { PrismaService } from "@/lib/database/prisma.service";

interface HealthStatus {
  status: "ok" | "error";
  uptime: number;
  checks: Record<string, "ok" | "error">;
}

@Controller("health")
export class HealthController {
  constructor(private readonly prismaService: PrismaService) {}

  /** Liveness probe: is the process alive? Never checks external dependencies. */
  @Get("live")
  live(): HealthStatus {
    return { status: "ok", uptime: process.uptime(), checks: {} };
  }

  /** Readiness probe: can the app serve traffic? Checks what the product depends on; answers 503 when it cannot. */
  @Get("ready")
  async ready(
    @Res({ passthrough: true }) res: Response,
  ): Promise<HealthStatus> {
    const checks: Record<string, "ok" | "error"> = {};
    let overall: "ok" | "error" = "ok";
    try {
      await this.prismaService.ping();
      checks["prismaService"] = "ok";
    } catch {
      checks["prismaService"] = "error";
      overall = "error";
    }
    if (overall === "error") res.status(HttpStatus.SERVICE_UNAVAILABLE);
    return { status: overall, uptime: process.uptime(), checks };
  }
}
