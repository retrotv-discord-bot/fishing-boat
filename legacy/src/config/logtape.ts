import { configure, getConsoleSink, getLogger, type Logger } from "@logtape/logtape";

await configure({
    sinks: { console: getConsoleSink() },
    loggers: [{ category: ["bot"], lowestLevel: "debug", sinks: ["console"] }],
});

export default function Logger(category: string | string[]): Logger {
    return getLogger(category);
}
