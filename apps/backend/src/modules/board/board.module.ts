import { Module } from "@nestjs/common";

import { DatabaseModule } from "@/lib/database/database.module.js";

import { BoardController } from "./board.controller.js";
import { BoardGateway } from "./board.gateway.js";
import { BoardAccessGuard } from "./board.guard.js";
import { BoardService } from "./board.service.js";

@Module({
  imports: [DatabaseModule],
  controllers: [BoardController],
  providers: [BoardService, BoardGateway, BoardAccessGuard],
  exports: [BoardGateway, BoardAccessGuard],
})
export class BoardModule {}
