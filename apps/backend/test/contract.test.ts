import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";
import { z } from "zod";

// The committed API description is what the typed client is generated from. These checks keep it
// complete: a route with no declared answer gives the client `unknown`.
const response = z.object({
  content: z.record(z.string(), z.object({ schema: z.unknown() })).optional(),
});
const documentSchema = z.object({
  paths: z.record(
    z.string(),
    z.record(
      z.string(),
      z.object({
        operationId: z.string(),
        parameters: z
          .array(z.object({ name: z.string(), in: z.string() }))
          .default([]),
        responses: z.record(z.string(), response),
      }),
    ),
  ),
});

const document = documentSchema.parse(
  JSON.parse(
    readFileSync(join(__dirname, "../../../docs/openapi.json"), "utf8"),
  ),
);
const operations = Object.entries(document.paths)
  .filter(([path]) => !path.startsWith("/health"))
  .flatMap(([path, methods]) =>
    Object.entries(methods).map(([method, operation]) => ({
      route: `${method.toUpperCase()} ${path}`,
      ...operation,
    })),
  );

describe("the API description", () => {
  it("describes the routes the web app calls", () => {
    const routes = operations.map((o) => o.route);
    expect(routes).toEqual(
      expect.arrayContaining([
        "GET /boards",
        "POST /boards",
        "GET /boards/{boardId}",
        "POST /boards/{boardId}/members",
        "DELETE /boards/{boardId}/members/{userId}",
        "POST /boards/{boardId}/columns",
        "PATCH /boards/{boardId}/tasks/{taskId}/move",
        "GET /users/search",
      ]),
    );
  });

  it.each(operations)("$route declares every path parameter", (op) => {
    const inPath = [...op.route.matchAll(/\{(\w+)\}/g)].flatMap((match) =>
      match[1] ? [match[1]] : [],
    );
    const declared = op.parameters
      .filter((parameter) => parameter.in === "path")
      .map((parameter) => parameter.name);
    expect(declared.sort()).toEqual(inPath.sort());
  });

  it.each(operations)("$route declares its answer and its failures", (op) => {
    const success = op.responses["200"] ?? op.responses["201"];
    expect(success?.content?.["application/json"]).toBeDefined();
    expect(op.responses["401"]).toBeDefined();
  });
});
