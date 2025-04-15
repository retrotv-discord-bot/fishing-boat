const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
        // '/ping'으로 직접적인 명령어 이름을 지정 (*한글 가능 *대문자 안됨)
		.setName('ping') 
       // '/ping'을 디스코드 대화채널에 타이핑 했을 때 뜨는 도움말
		.setDescription('핑하면 퐁하고 우는 대답'),
	async execute(interaction) {
        // '/ping' 를 입력 받았을 때 봇이 'Pong'으로 대답
		await interaction.reply(`Pong`);
	},
};