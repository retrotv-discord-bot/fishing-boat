import { REST, Routes } from "discord.js";
import { config } from "./config";
import { commands } from "./src/discord/commands";

const commandsData = Object.values(commands).map((command) => command.data);

const rest = new REST({ version: "10" }).setToken(config.BOT_TOKEN);

type DeployCommandsProps = {
    guildId: string;
};

export async function deployCommands({ guildId }: DeployCommandsProps) {
    try {
        console.log("Started refreshing application (/) commands.");

        await rest.put(Routes.applicationGuildCommands(config.BOT_ID, guildId), {
            body: commandsData,
        });

        console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
        console.error(error);
    }
}
