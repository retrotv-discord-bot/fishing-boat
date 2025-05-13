import { Events } from "discord.js";

import { deployCommands } from "../../commands/deploy-commands";
import Event from "../../../templates/event";

/**
 * 봇이 서버에 초대되었을 때 발생하는 이벤트
 * Event that occurs when the bot is invited to a server
 */
export default new Event({
    name: Events.GuildCreate,
    once: true,
    async execute(guild) {
        /*
         * 봇이 초대되었을 때, 해당 서버에 슬래시 명령어를 배포합니다.
         * When the bot is invited to a server, deploy slash commands to that server
         */
        await deployCommands({ guildId: guild.id });
    },
});
