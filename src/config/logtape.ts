import { configure, getConsoleSink, getLogger, type Logger } from "@logtape/logtape";

configure({
    sinks: { console: getConsoleSink() },
    loggers: [
        // 애플리케이션 로그
        { category: ["bot"], lowestLevel: "debug", sinks: ["console"] },

        // 이 카테고리만 info 메시지 차단
        { category: ["logtape", "meta"], lowestLevel: "warning", sinks: ["console"] },
    ],
})
    .then(() => {
        console.log("Configuration complete");
    })
    .catch((error) => {
        console.error("Configuration failed", error);
    });

export default function Logger(category: string | string[]): Logger {
    return getLogger(category);
}
