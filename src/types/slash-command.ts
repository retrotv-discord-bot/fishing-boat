import type {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

export default class SlashCommand {
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
    execute?: (interaction: ChatInputCommandInteraction) => Promise<void> | void;
    autocomplete?: (interaction: AutocompleteInteraction) => Promise<void> | void;

    constructor(options: {
        data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
        execute?: (interaction: ChatInputCommandInteraction) => Promise<void> | void;
        autocomplete?: (interaction: AutocompleteInteraction) => Promise<void> | void;
    }) {
        this.data = options.data;
        this.execute = options.execute;
        this.autocomplete = options.autocomplete;
    }
}
