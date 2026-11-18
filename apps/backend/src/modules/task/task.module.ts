import { Module } from "@nestjs/common";

import { BoardModule } from "../board/board.module.js";

import { TaskController } from "./task.controller.js";
import { TaskService } from "./task.service.js";

@Module({
  imports: [BoardModule],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
