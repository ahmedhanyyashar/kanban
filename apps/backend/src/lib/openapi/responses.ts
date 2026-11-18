import { applyDecorators } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { createZodDto } from "nestjs-zod";

import { apiErrorSchema } from "@repo/shared/contracts/api-error";
import { doneSchema, envelope } from "@repo/shared/contracts/board";

/** The body of every failed request. */
export class ApiErrorDto extends createZodDto(apiErrorSchema) {}

/** `{ success: true }`, for routes that only confirm. */
export class DoneResponseDto extends createZodDto(envelope(doneSchema)) {}

/** The failures any route behind a session and a board can answer with. */
export function ApiErrors() {
  return applyDecorators(
    ApiBadRequestResponse({ type: ApiErrorDto, description: "Invalid input" }),
    ApiUnauthorizedResponse({
      type: ApiErrorDto,
      description: "Not signed in",
    }),
    ApiForbiddenResponse({
      type: ApiErrorDto,
      description: "Not allowed on this board",
    }),
    ApiNotFoundResponse({ type: ApiErrorDto, description: "Not found" }),
  );
}
