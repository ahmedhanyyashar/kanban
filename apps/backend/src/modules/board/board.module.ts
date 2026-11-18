import { Module } from "@nestjs/common";

import { DatabaseModule } from "@/lib/database/database.module.js";

import { BoardGateway } from "./board.gateway.js";

@Module({
  imports: [DatabaseModule],
  providers: [BoardGateway],
  exports: [BoardGateway],
})
export class BoardModule {}
