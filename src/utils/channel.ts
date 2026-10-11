import type { ChatInputCommandInteraction } from "discord.js";

export function getChannelName(interaction: ChatInputCommandInteraction): string {
    const channel = interaction.channel && "name" in interaction.channel ? interaction.channel : null;
    return channel && channel.name ? channel.name : "불명"
}
