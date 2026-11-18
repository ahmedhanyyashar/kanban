import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

import { ApiErrors } from "@/lib/openapi/responses";

import { UserSearchQueryDto } from "./user.dto.js";
import { UserSearchResponseDto } from "./user.responses.js";
import { UserService } from "./user.service.js";

@ApiErrors()
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  // a search reveals who has an account, so it is limited more tightly than the rest of the API
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOkResponse({ type: UserSearchResponseDto })
  @Get("search")
  async searchUsers(@Query() query: UserSearchQueryDto) {
    const users = await this.userService.searchUsers(query.q);

    return { users };
  }
}
