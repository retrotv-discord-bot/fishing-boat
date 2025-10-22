import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";

import Logger from "../config/logtape";

const log = Logger(["bot", "Prisma"]);

// PM2에서 PRISMA_LOG="query,info,warn,error" 형태로 설정 가능
const raw = (process.env.PRISMA_LOG ?? process.env.DEBUG ?? "").toString();
const requested = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const allowed = new Set(["query", "info", "warn", "error"]);
const logConfig =
    requested.length > 0
        ? requested.filter((l) => allowed.has(l)).map((level) => ({ emit: "event", level }))
        : [{ emit: "event", level: "error" }]; // 기본 레벨

const prisma = new PrismaClient({ log: logConfig as any });

if (requested.includes("query")) {
    prisma.$on("query", (e: any) => {
        const ev = e as Prisma.QueryEvent;
        log.debug(`Query: ${ev.query}`);
        log.debug(`Params: ${ev.params}`);
        log.debug(`Duration: ${ev.duration}ms`);
    });
}
if (requested.includes("info")) {
    prisma.$on("info", (e: Prisma.LogEvent) => {
        log.info(`Prisma Info: ${e.message}`);
    });
}
if (requested.includes("warn")) {
    prisma.$on("warn", (e: Prisma.LogEvent) => {
        log.warn(`Prisma Warn: ${e.message}`);
    });
}
if (requested.includes("error") || requested.length === 0) {
    prisma.$on("error", (e: Prisma.LogEvent) => {
        log.error(`Prisma Error: ${e.message}`);
    });
}

export default prisma;
