const fs = require("node:fs");
const path = require("node:path");
const { Client, Events, Collection, GatewayIntentBits } = require("discord.js");
const { token } = require("./config.json");
const schedule = require("node-schedule");
const { sendAlarm } = require("./src/services/alarm");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

// 커맨드 정보 불러오기
const foldersPath = path.join(__dirname, "src/discord/commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ("data" in command && "execute" in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// 이벤트 정보 불러오기
const eventsPath = path.join(__dirname, "src/discord/events");
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

schedule.scheduleJob("* * * * *", () => {
    sendAlarm(client);
});

client.on(Events.ShardError, (error) => {
    console.error("A websocket connection encountered an error:", error);
});

// 데이터베이스 설정 (fishing-ship.db 파일이 없으면 새로 생성한다.)
require("./src/config/databases/create-tables").install();

client.login(token);
