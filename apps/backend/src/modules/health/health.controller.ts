import { Controller, Get } from "@nestjs/common";

interface HealthStatus {
  status: "ok" | "error";
  uptime: number;
  checks: Record<string, "ok" | "error">;
}

@Controller("health")
export class HealthController {
  /** Liveness probe: is the process alive? Never checks external dependencies. */
  @Get("live")
  live(): HealthStatus {
    return { status: "ok", uptime: process.uptime(), checks: {} };
  }
}
