import { REST, Routes } from "discord.js";
import { config } from "./config";
import { commands } from "./src/discord/commands";

const DISCORD_BOT_TOKEN = config.DISCORD_BOT_TOKEN;
const CLIENT_ID = config.CLIENT_ID;
const TO_REGISTER_GUILD = config.TO_REGISTER_GUILD;

const commandsData = Object.values(commands).map((command) => command.data);

const rest = new REST({ version: "10" }).setToken(DISCORD_BOT_TOKEN);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, TO_REGISTER_GUILD), {
      body: commandsData,
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
