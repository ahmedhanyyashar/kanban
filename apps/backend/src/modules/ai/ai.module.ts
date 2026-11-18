import { Module } from "@nestjs/common";

import { BoardModule } from "../board/board.module.js";
import { TaskModule } from "../task/task.module.js";

import { AiController } from "./ai.controller.js";
import { AiService } from "./ai.service.js";

@Module({
  imports: [BoardModule, TaskModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
