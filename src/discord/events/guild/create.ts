import { Events } from "discord.js";

import { deployCommands } from "../../../../deploy-commands";
import Event from "../../../types/event";

export default new Event({
    name: Events.GuildCreate,
    once: true,
    async execute(guild) {
        console.log(`Joined a new guild: ${guild.name}`);
        await deployCommands({ guildId: guild.id });
    },
});
