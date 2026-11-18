import { INestApplication, Logger } from "@nestjs/common";
import type { NodeSDK } from "@opentelemetry/sdk-node";

const logger = new Logger("GracefulShutdown");

/**
 * Call after app.listen() in main.ts. On SIGTERM/SIGINT: stop accepting connections, flush
 * telemetry, and run Nest's module destroy lifecycle (closes the database).
 */
export function setupGracefulShutdown(
  app: INestApplication,
  sdk: NodeSDK | undefined,
  drainTimeout: number = 25_000,
): void {
  let isShuttingDown = false;

  async function shutdown(signal: string) {
    if (isShuttingDown) return;
    isShuttingDown = true;
    logger.log(`${signal} received, starting graceful shutdown`);

    // Forces the exit: a bare warning would leave the process hanging if a step never settles.
    const timeout = setTimeout(() => {
      logger.warn(
        `Drain timeout (${drainTimeout}ms) exceeded, forcing shutdown`,
      );
      process.exit(1);
    }, drainTimeout);
    timeout.unref();

    try {
      await sdk?.shutdown();
    } catch (err) {
      logger.error(
        "OpenTelemetry SDK shutdown failed",
        err instanceof Error ? err.stack : String(err),
      );
    }

    try {
      await app.close();
    } catch (err) {
      logger.error(
        "Nest application close failed",
        err instanceof Error ? err.stack : String(err),
      );
    }

    clearTimeout(timeout);
    logger.log("Shutdown complete");
    process.exit(0);
  }

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}
