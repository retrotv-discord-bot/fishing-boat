import "reflect-metadata";

import { AppDataSource } from "./src/config/datasource";

import { Client, GatewayIntentBits, Collection, Partials } from "discord.js";
import schedule from "node-schedule";

import { config } from "./config";

import { commands } from "./src/discord/commands";
import type MessageCommand from "./src/types/MessageCommand";
import { events } from "./src/discord/events";
import type SlashCommand from "./src/types/slash-command";

import AlarmService from "./src/services/alarm";

import Logger from "./src/config/logtape";
const log = Logger(["bot", "index"]);

// 데이터베이스 설정
AppDataSource.initialize();

const client = Object.assign(
    new Client({
        intents: [
            GatewayIntentBits.Guilds,
            // 현재 사용예정 없음
            // , GatewayIntentBits.GuildMessages
            // , GatewayIntentBits.DirectMessages
        ],
        partials: [Partials.Channel],
    }),
    {
        commands: new Collection<string, SlashCommand>(),
        msgCommands: new Collection<string, MessageCommand>(),
    },
);

// 커맨드 불러오기
commands.forEach((command) => {
    log.debug(`로드된 커맨드: ${command.data.name}`);
    client.commands.set(command.data.name, command);
});

// 이벤트 불러오기
events.forEach((event) => {
    log.debug(`로드된 이벤트: ${event.name}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
});

const alarmService = new AlarmService();

schedule.scheduleJob("* * * * *", () => {
    alarmService.sendAlarm(client);
});

client.login(config.BOT_TOKEN);
