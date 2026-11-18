import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { NestInstrumentation } from "@opentelemetry/instrumentation-nestjs-core";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { PrismaInstrumentation } from "@prisma/instrumentation";

import { env } from "./env";

function setupTelemetry(): NodeSDK | undefined {
  if (!env.OTEL_EXPORTER_OTLP_ENDPOINT) return undefined;
  const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({
      url: env.OTEL_EXPORTER_OTLP_ENDPOINT,
    }),
    instrumentations: [
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
      new NestInstrumentation(),
      new PrismaInstrumentation(),
    ],
  });
  sdk.start();
  return sdk;
}

export const sdk = setupTelemetry();
