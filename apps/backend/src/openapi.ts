import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { cleanupOpenApiDoc } from "nestjs-zod";

/** The OpenAPI document of the running API; served at /docs and exported for the typed client. */
export function createDocument(app: INestApplication) {
  // cleanupOpenApiDoc resolves the Zod schemas nestjs-zod could only mark (nullable fields, shared refs)
  return cleanupOpenApiDoc(
    SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle("kanban")
        .setVersion("1.0")
        .addCookieAuth(
          "better-auth.session_token",
          { type: "apiKey", in: "cookie" },
          "session",
        )
        .build(),
    ),
  );
}
