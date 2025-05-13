import { REST, Routes } from "discord.js";
import { config } from "../../../config";
import { contextMenuCommands, slashCommands } from ".";

const commandsData = [
    ...Object.values(slashCommands).map((command) => command.data),
    ...Object.values(contextMenuCommands).map((command) => command.data),
];

const rest = new REST({ version: "10" }).setToken(config.BOT_TOKEN);

type DeployCommandsProps = {
    guildId: string;
};

/*
 * 슬래시/컨텍스트 메뉴 명령어를 디스코드 서버에 배포함
 * Deploy slash/context menu commands to Discord server
 */
export async function deployCommands({ guildId }: DeployCommandsProps) {
    try {
        await rest.put(Routes.applicationGuildCommands(config.BOT_ID, guildId), {
            body: commandsData,
        });
    } catch (error) {
        console.error(error);
    }
}
