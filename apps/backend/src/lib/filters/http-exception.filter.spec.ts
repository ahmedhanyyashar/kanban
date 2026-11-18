import { Logger, NotFoundException } from "@nestjs/common";
import { ExecutionContextHost } from "@nestjs/core/helpers/execution-context-host";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HttpExceptionFilter } from "./http-exception.filter";

function host() {
  const json = vi.fn<(body: unknown) => void>();
  const status = vi.fn<(code: number) => { json: typeof json }>(() => ({
    json,
  }));
  const request = { method: "GET", url: "/boards/1" };
  return {
    args: new ExecutionContextHost([request, { status }]),
    status,
    json,
  };
}

describe("HttpExceptionFilter", () => {
  afterEach(() => vi.restoreAllMocks());

  it("logs a caller's mistake as a warning, without a stack", () => {
    const warn = vi.spyOn(Logger.prototype, "warn").mockReturnValue();
    const error = vi.spyOn(Logger.prototype, "error").mockReturnValue();
    const { args, status } = host();

    new HttpExceptionFilter().catch(
      new NotFoundException("Board not found"),
      args,
    );

    expect(status).toHaveBeenCalledWith(404);
    expect(warn).toHaveBeenCalledOnce();
    expect(error).not.toHaveBeenCalled();
  });

  it("logs a server failure as an error with its stack, and answers with a general message", () => {
    const error = vi.spyOn(Logger.prototype, "error").mockReturnValue();
    const { args, status, json } = host();

    new HttpExceptionFilter().catch(new Error("database exploded"), args);

    expect(status).toHaveBeenCalledWith(500);
    expect(error).toHaveBeenCalledOnce();
    expect(error.mock.calls[0]?.[1]).toContain("database exploded");
    expect(json.mock.calls[0]?.[0]).toMatchObject({
      success: false,
      error: { message: "An unexpected error occurred" },
    });
  });
});
