import { configure, getConsoleSink, getLogger, type Logger } from "@logtape/logtape";

configure({
    sinks: { console: getConsoleSink() },
    loggers: [{ category: ["bot"], lowestLevel: "debug", sinks: ["console"] }],
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
