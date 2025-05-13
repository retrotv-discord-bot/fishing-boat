import { REST, Routes } from "discord.js";
import { config } from "./config";
import { commands } from "./src/discord/commands";

const BOT_TOKEN = config.BOT_TOKEN;
const BOT_ID = config.BOT_ID;
const GUILD_ID = config.GUILD_ID;

const commandsData = Object.values(commands).map((command) => command.data);

const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);

(async () => {
    try {
        console.log("Started refreshing application (/) commands.");

        await rest.put(Routes.applicationGuildCommands(BOT_ID, GUILD_ID), {
            body: commandsData,
        });

        console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
        console.error(error);
    }
})();
