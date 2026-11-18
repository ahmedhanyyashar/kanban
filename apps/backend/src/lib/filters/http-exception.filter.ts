import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { ZodValidationException } from "nestjs-zod";
import { ZodError } from "zod";

interface ApiErrorBody {
  code: string;
  message: string | string[];
  timestamp: string;
  path: string;
  issues?: { path: string; message: string }[];
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger("HttpExceptionFilter");

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = "INTERNAL_SERVER_ERROR";
    let message: string | string[] = "An unexpected error occurred";
    let issues: ApiErrorBody["issues"];

    if (exception instanceof ZodValidationException) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      code = "VALIDATION_ERROR";
      message = "Validation failed";
      const zodError = exception.getZodError();
      issues =
        zodError instanceof ZodError
          ? zodError.issues.map((i) => ({
              path: i.path.map(String).join("."),
              message: i.message,
            }))
          : undefined;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body: string | { message?: string | string[]; code?: string } =
        exception.getResponse();
      message =
        typeof body === "string" ? body : (body.message ?? exception.message);
      // an exception may name its own code (a broken business rule does); otherwise it is the status
      code =
        (typeof body === "object" ? body.code : undefined) ??
        HttpStatus[status] ??
        "HTTP_ERROR";
    }

    this.logger.error(
      `${req.method} ${req.url} ${status} - ${Array.isArray(message) ? message.join(", ") : message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    const error: ApiErrorBody = {
      code,
      message,
      timestamp: new Date().toISOString(),
      path: req.url,
      ...(issues ? { issues } : {}),
    };
    return res.status(status).json({ success: false, error });
  }
}
