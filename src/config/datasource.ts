import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";

import { PrismaClient } from "../../generated/prisma/client";
import { logger } from "./logger";

const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL ?? "",
});
const prismaClient = new PrismaClient({
    adapter,
    log: [
        { emit: "stdout", level: "info" },
        { emit: "stdout", level: "warn" },
        { emit: "stdout", level: "error" },
    ],
});

export const prisma = prismaClient.$extends({
    query: {
        async $allOperations({ operation, model, args, query }) {
            const start = performance.now();
            const result: unknown = await query(args);
            const duration = performance.now() - start;

            logger.debug({ model, operation, duration: `${duration.toFixed(2)}ms` }, "prisma query");

            return result;
        },
    },
});

export type PrismaExtendedClient = typeof prisma;
