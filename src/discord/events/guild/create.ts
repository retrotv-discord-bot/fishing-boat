import { Events, Guild } from "discord.js";

import { deployCommands } from "../../commands/deploy-commands";
import Event from "../../../templates/event";

export default new Event({
    name: Events.GuildCreate,
    once: true,
    async execute(guild: Guild) {
        await deployCommands({ guildId: guild.id });
    },
});
