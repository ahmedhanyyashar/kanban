import { Module } from "@nestjs/common";

import { BoardModule } from "../board/board.module.js";

import { ColumnController } from "./column.controller.js";
import { ColumnService } from "./column.service.js";

@Module({
  imports: [BoardModule],
  controllers: [ColumnController],
  providers: [ColumnService],
  exports: [ColumnService],
})
export class ColumnModule {}
