/*
 * 봇 관리자가 직접 수동으로 슬래시/컨텍스트 메뉴 명령어를 배포하기 위해 사용하는 스크립트
 * This script is used by the bot administrator to manually deploy slash/context menu commands
 */
import { REST, Routes } from "discord.js";
import { config } from "../../../config";
import { contextMenuCommands, slashCommands } from ".";

const commandsData = [
    ...Object.values(slashCommands).map((command) => command.data),
    ...Object.values(contextMenuCommands).map((command) => command.data),
];

const rest = new REST({ version: "10" }).setToken(config.BOT_TOKEN);

/*
 * 슬래시/컨텍스트 메뉴 명령어를 디스코드 서버에 배포함
 * Deploy slash/context menu commands to Discord server
 */
(async () => {
    try {
        await rest.put(Routes.applicationGuildCommands(config.BOT_ID, config.GUILD_ID), {
            body: commandsData,
        });
    } catch (error) {
        console.error(error);
    }
})();
