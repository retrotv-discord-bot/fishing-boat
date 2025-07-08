import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
    log: [
        {
            emit: "event",
            level: "query", // 쿼리 로그를 출력
        },
        {
            emit: "event",
            level: "info", // 정보 로그를 출력
        },
        {
            emit: "event",
            level: "warn", // 경고 로그를 출력
        },
        {
            emit: "event",
            level: "error", // 오류 로그를 출력
        },
    ],
});

prisma.$on("query", (e) => {
    console.log(`Query: ${e.query}`);
    console.log(`Params: ${e.params}`);
    console.log(`Duration: ${e.duration}ms`);
});

export default prisma;
