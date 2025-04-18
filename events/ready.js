const { Events } = require("discord.js");

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`봇 준비 완료! ${client.user.tag}`);
    },
};
