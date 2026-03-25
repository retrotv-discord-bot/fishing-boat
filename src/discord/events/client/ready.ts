import { Events, Client } from "discord.js";
import Event from "../../../templates/event";
import { logger } from "../../../config/logger";

export default new Event({
    name: Events.ClientReady,
    once: true,
    execute(client: Client) {
        if (client.user) {
            logger.info(`Discord bot ${client.user.tag} is ready! 🤖`);
        } else {
            logger.error("Client user is not defined.");
        }
    },
});
