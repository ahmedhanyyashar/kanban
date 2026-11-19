import "./load-env";

import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { SwaggerModule } from "@nestjs/swagger";
import { Logger } from "nestjs-pino";

import { AppModule } from "./app.module";
import { env } from "./env";
import { sdk } from "./instrumentation";
import { REQUEST_ID_HEADER } from "./lib/request-id/request-id.middleware";
import { setupGracefulShutdown } from "./lib/shutdown/graceful-shutdown";
import { securityHeaders } from "./lib/web/security-headers";
import { serveWeb } from "./lib/web/serve-web";
import { createDocument } from "./openapi";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    bodyParser: false,
  });
  app.useLogger(app.get(Logger));

  // how many reverse proxies stand in front ("0": none, or "true"/"false"): callers are told apart by the address behind them
  app.set(
    "trust proxy",
    env.TRUST_PROXY === "true"
      ? true
      : env.TRUST_PROXY === "false"
        ? false
        : Number(env.TRUST_PROXY),
  );
  app.use(securityHeaders);
  app.enableCors({
    origin: env.TRUSTED_ORIGINS.split(","),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", REQUEST_ID_HEADER],
    exposedHeaders: [REQUEST_ID_HEADER],
  });

  if (env.NODE_ENV !== "production")
    SwaggerModule.setup("docs", app, createDocument(app));

  if (env.WEB_DIST) serveWeb(app, env.WEB_DIST);

  await app.listen(env.PORT);
  setupGracefulShutdown(app, sdk);
}

bootstrap().catch(async (err) => {
  console.error("Bootstrap failed", err);
  // sdk.shutdown() rejecting (no collector listening) must not skip the exit below
  try {
    await sdk?.shutdown();
  } catch (shutdownErr) {
    console.error("OpenTelemetry SDK shutdown failed", shutdownErr);
  }
  process.exit(1);
});
