import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import ContextMenuCommand from "./src/templates/context-menu-command";
import SlashCommand from "./src/templates/slash-command";
import PrefixCommand from "./src/templates/prefix-command";

import { contextMenuCommands, slashCommands, prefixCommands } from "./src/discord/commands";
import { events } from "./src/discord/events";
import { config } from "./config";

declare global {
    // prettier-ignore
    var client: Client & { // NOSONAR
        contextMenuCommands: Collection<string, ContextMenuCommand>;
        slashCommands: Collection<string, SlashCommand>;
        prefixCommands: Collection<string, PrefixCommand>;
    };
}

global.client = Object.assign(
    new Client({
        intents: [
            /*
             * 각 권한이 제어하는 이벤트 참조: https://discord.com/developers/docs/events/gateway#list-of-intents
             * Reference the events controlled by each permission: https://discord.com/developers/docs/events/gateway#list-of-intents
             *
             * Guilds:                      서버 관련 이벤트를 수신할 수 있는 권한
             * GuildMembers:                서버의 멤버 관련 이벤트를 수신할 수 있는 권한
             * GuildModeration:             서버의 관리(모더레이션) 관련 이벤트를 수신할 수 있는 권한
             * GuildExpressions:            서버의 이모지와 스티커 관련 이벤트를 수신할 수 있는 권한
             * GuildIntegrations:           서버의 통합 관련 이벤트를 수신할 수 있는 권한
             * GuildWebhooks:               서버의 웹훅 관련 이벤트를 수신할 수 있는 권한
             * GuildInvites:                서버의 초대 관련 이벤트를 수신할 수 있는 권한
             * GuildVoiceStates:            서버의 음성 상태 관련 이벤트를 수신할 수 있는 권한
             * GuildPresences:              서버의 멤버 상태(온라인, 오프라인 등) 관련 이벤트를 수신할 수 있는 권한
             * GuildMessages:               서버 내에서 발생하는 메시지 이벤트를 수신할 수 있는 권한
             * GuildMessageReactions:       서버 내에서 발생하는 메시지 반응 이벤트를 수신할 수 있는 권한
             * GuildMessageTyping:          다이렉트 메시지의 입력(타이핑) 이벤트를 수신할 수 있는 권한
             * DirectMessages:              다이렉트 메시지 관련 이벤트를 수신할 수 있는 권한
             * DirectMessageReactions:      다이렉트 메시지의 반응 이벤트를 수신할 수 있는 권한
             * DirectMessageTyping:         다이렉트 메시지의 입력(타이핑) 이벤트를 수신할 수 있는 권한
             * MessageContent:              메시지의 실제 내용을 읽을 수 있는 권한
             * GuildScheduledEvents:        서버의 일정 이벤트 관련 이벤트를 수신할 수 있는 권한
             * AutoModerationConfiguration: 자동 모더레이션 설정 관련 이벤트를 수신할 수 있는 권한
             * AutoModerationExecution:     자동 모더레이션 실행 관련 이벤트를 수신할 수 있는 권한
             * GuildMessagePolls:           서버 내에서 발생하는 메시지 투표 이벤트를 수신할 수 있는 권한
             * DirectMessagePolls:          다이렉트 메시지의 투표 이벤트를 수신할 수 있는 권한
             */

            // 서버에 봇이 초대되거나 퇴장할 때, 슬래시 명령어 배포를 위해 필요
            // When the bot is invited to or leaves a server, needed to deploy slash commands
            GatewayIntentBits.Guilds,

            // Prefix 명령어를 사용하기 위해 필요
            // Needed to use prefix commands
            // GatewayIntentBits.GuildMessages,
            // GatewayIntentBits.MessageContent,
        ],
        partials: [Partials.Channel],
    }),
    {
        contextMenuCommands: new Collection<string, ContextMenuCommand>(),
        slashCommands: new Collection<string, SlashCommand>(),
        prefixCommands: new Collection<string, PrefixCommand>(),
    },
);

// 컨텍스트 메뉴 명령어 불러오기
// Load context menu commands
contextMenuCommands.forEach((command) => {
    global.client.contextMenuCommands.set(command.data.name, command);
});

// 슬래시 명령어 불러오기
// Load slash commands
slashCommands.forEach((command) => {
    global.client.slashCommands.set(command.data.name, command);
});

// prefix 명령어 불러오기
// Load prefix commands
prefixCommands.forEach((command) => {
    global.client.prefixCommands.set(command.name, command);
});

// 이벤트 불러오기
// Load events
events.forEach((event) => {
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
});

// 봇 로그인
// Log in to the bot
client.login(config.BOT_TOKEN);
