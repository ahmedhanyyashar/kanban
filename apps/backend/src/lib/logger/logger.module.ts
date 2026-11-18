import { Global, Module } from "@nestjs/common";
import { LoggerModule as PinoLoggerModule } from "nestjs-pino";

import { env } from "@/env";

const development = env.NODE_ENV !== "production";
const pretty = {
  target: "pino-pretty",
  options: { colorize: true, ignore: "pid,hostname,req,res,responseTime" },
};

const transport = development ? pretty : undefined;

@Global()
@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        level: development ? "debug" : "info",
        ...(transport ? { transport } : {}),
        autoLogging: {
          ignore: (req) => /\/(health|metrics)/.test(req.url ?? ""),
        },
        redact: [
          "req.body.password",
          "req.headers.authorization",
          "req.headers.cookie",
        ],
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
