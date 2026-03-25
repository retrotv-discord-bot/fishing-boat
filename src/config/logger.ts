import pino from "pino";

const isProd = process.env.NODE_ENV === "prod";

export const logger = pino({
    level: process.env.LOG_LEVEL ?? (isProd ? "info" : "debug"),
    base: {
        service: "fishing-vessel-bot",
        env: process.env.NODE_ENV ?? "dev",
    },
    redact: {
        paths: ["token", "*.token", "authorization", "headers.authorization"],
        remove: true,
    },
    transport: isProd
        ? undefined
        : {
              target: "pino-pretty",
              options: {
                  colorize: true,
                  translateTime: "SYS:standard",
                  ignore: "pid,hostname",
              },
          },
});
