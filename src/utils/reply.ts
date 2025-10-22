import { EmbedBuilder, MessageFlags, RepliableInteraction } from "discord.js";

// overload signatures
export function privateReply(
    interaction: RepliableInteraction,
    message: string,
): ReturnType<RepliableInteraction["reply"]>;
export function privateReply(
    interaction: RepliableInteraction,
    embeds: EmbedBuilder[],
): ReturnType<RepliableInteraction["reply"]>;

// single implementation
export function privateReply(interaction: RepliableInteraction, payload: string | EmbedBuilder[]) {
    if (typeof payload === "string") {
        return interaction.reply({
            content: payload,
            flags: MessageFlags.Ephemeral,
        });
    }

    return interaction.reply({
        embeds: payload,
        flags: MessageFlags.Ephemeral,
    });
}
