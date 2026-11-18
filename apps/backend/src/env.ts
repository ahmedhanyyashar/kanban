import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3001),
  TRUST_PROXY: z.string().min(1).default("0"),
  TRUSTED_ORIGINS: z.string().min(1).default("http://localhost:3100"),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.url().optional(),
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  LLM_API_KEY: z.string().min(1).optional(),
  LLM_MODEL: z.string().min(1).default("gemini-flash-latest"),
});

// The only place this app reads the environment.
export const env = envSchema.parse(process.env);
