const fs = require('node:fs'); 
const path = require('node:path');
const { Client, Events, Collection, GatewayIntentBits } = require('discord.js');
const config = require('./config.json');

//디스코드에 접속 시켜줄 클라이언트 생성
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

//커맨드 등록
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

//commands폴더의 js파일을 이름과 함께 등록한다.
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

// 클라이언트가 준비됐으면 로그를 통해 태그를 찍는다.
client.once(Events.ClientReady, readyClient => {
	console.log(`준비 완료! ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return; //기존 채팅 커맨드는 제외

    // /ping 입력될 경우 pong으로 대답하기
	if (interaction.commandName === 'ping') {
		await interaction.reply({ content: 'Pong' });
	}
});

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// 디스코드 토큰을 통해 로그인
client.login(config.token);
