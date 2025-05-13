import { SlashCommandBuilder, ChatInputCommandInteraction, AutocompleteInteraction } from "discord.js";
import SlashCommand from "../../../templates/slash-command";

export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName("ping")
        .setNameLocalizations({
            ko: "핑",
        })
        .addSubcommand((subcommand) =>
            subcommand
                .setName("ping")
                .setNameLocalizations({
                    ko: "핑",
                })
                .addBooleanOption((option) =>
                    option
                        .setName("ping")
                        .setNameLocalizations({
                            ko: "핑",
                        })
                        .setDescription("If this value is True, it sends three pings to check if the bot is alive")
                        .setDescriptionLocalizations({
                            ko: "이 값이 True면 봇이 살아있는지 확인하기 위해 세 번 핑을 보냅니다",
                        })
                        .setRequired(false),
                )
                .setDescription("Ping the bot to check twice if it's alive")
                .setDescriptionLocalizations({
                    ko: "봇이 살아있는지 확인하기 위해 두 번 핑을 보냅니다",
                }),
        )
        .setDescription("Ping the bot to check if it's alive")
        .setDescriptionLocalizations({
            ko: "봇이 살아있는지 확인하기 위해 핑을 보냅니다",
        }),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        if (!interaction.isCommand() || interaction.commandName !== "ping") {
            return;
        }

        // /핑
        if (interaction.commandName === "ping") {
            // /핑 핑
            if (interaction.options.getSubcommand(false) === "ping") {
                // /핑 핑 핑:True
                if (interaction.options.getBoolean("ping", false)) {
                    await interaction.reply("pong! pong! pong!");
                    return;
                }
                await interaction.reply("pong! pong!");
                return;
            }
            await interaction.reply("pong!");
        }
    },

    async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const focusedOption = interaction.options.getFocused(true);
        const choices = ["True", "False"];

        if (focusedOption.name === "ping") {
            await interaction.respond(choices.map((choice) => ({ name: choice, value: choice })));
        }
    },
});
