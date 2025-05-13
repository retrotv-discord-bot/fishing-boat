import type Event from "../../templates/event";

import clientReady from "./client/ready";
import guildCreate from "./guild/create";
import interactionCreate from "./interaction/create";
import messageCreate from "./message/create";

export const events: Event[] = [
    /*
     * 다른 이벤트들에 대한 정보가 필요할 경우,
     * 다음 링크의 Events 항목 참조: https://discord.js.org/docs/packages/discord.js/14.19.2/Client:Class
     *
     * If you need information about other events,
     * refer to the Events section of the following link: https://discord.js.org/docs/packages/discord.js/14.19.2/Client:Class
     */

    // 봇이 준비되었을 때 발생하는 이벤트
    // Event that occurs when the bot is ready
    clientReady,

    // 봇이 서버에 초대되었을 때 발생하는 이벤트, 해당 서버에 슬래시 명령어를 배포하기 위해 필요
    // Event that occurs when the bot is invited to a server, needed to deploy slash commands in that server
    guildCreate,

    // 슬래시 명령어가 실행되었을 때 발생하는 이벤트
    // Event that occurs when a slash command is executed
    interactionCreate,

    // 채팅이 입력되었을 경우 발생하는 이벤트, prefix 명령어를 사용하기 위해 필요
    // Event that occurs when a chat is entered, needed to use prefix commands
    messageCreate,
];
