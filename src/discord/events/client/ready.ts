import { Events } from "discord.js";
import Event from "../../../templates/event";

export default new Event({
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Discord bot ${client.user.tag} is ready! 🤖`);
    },
});
