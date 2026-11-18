import { MiddlewareConsumer, Module } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { ZodValidationPipe } from "nestjs-zod";

import { SessionModule } from "./lib/auth/session.module";
import { DatabaseModule } from "./lib/database/database.module";
import { HttpExceptionFilter } from "./lib/filters/http-exception.filter";
import { ResponseInterceptor } from "./lib/interceptors/response.interceptor";
import { LoggerModule } from "./lib/logger/logger.module";
import { RateLimitModule } from "./lib/rate-limit/rate-limit.module";
import { RequestIdMiddleware } from "./lib/request-id/request-id.middleware";
import { BoardModule } from "./modules/board/board.module.js";
import { HealthModule } from "./modules/health/health.module";

@Module({
  imports: [
    LoggerModule,
    HealthModule,
    DatabaseModule,
    SessionModule,
    RateLimitModule,
    BoardModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes("*path");
  }
}
